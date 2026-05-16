import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── AFIP Web Services ─────────────────────────────────────────────────────────
// Esta route actúa como proxy entre el frontend y los WS de AFIP
// Requiere certificado digital y CUIT del emisor en las env vars

const AFIP_WSAA_URL    = 'https://wsaa.afip.gov.ar/ws/services/LoginCms'
const AFIP_WSFE_URL    = 'https://servicios1.afip.gov.ar/wsfev1/service.asmx'
const AFIP_CUIT        = process.env.AFIP_CUIT        // CUIT del emisor (sin guiones)
const AFIP_CERT        = process.env.AFIP_CERT        // Certificado .pem en base64
const AFIP_KEY         = process.env.AFIP_KEY         // Clave privada .key en base64

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    tipoComprobante,
    receptor,
    cuitReceptor,
    concepto,
    descripcion,
    importeNeto,
    alicuotaIVA,
    importeIVA,
    importeTotal,
    fechaServicioDesde,
    fechaServicioHasta,
  } = body

  // Validaciones básicas
  if (!tipoComprobante || !receptor || !importeTotal) {
    return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400 })
  }

  // Verificar que las credenciales de AFIP están configuradas
  if (!AFIP_CUIT || !AFIP_CERT || !AFIP_KEY) {
    // En modo desarrollo/demo, devolver un CAE simulado
    if (process.env.NODE_ENV === 'development' || process.env.AFIP_MODO === 'demo') {
      return NextResponse.json({
        cae: '75816203207777',
        caeVto: '20260530',
        nroComprobante: '00000001-00000001',
        resultado: 'A',
        observaciones: 'CAE simulado — modo demo',
        demo: true,
      })
    }
    return NextResponse.json({
      error: 'Credenciales de AFIP no configuradas. Contactá a soporte para activar la facturación electrónica.',
    }, { status: 503 })
  }

  try {
    // ── Paso 1: Obtener Token de Acceso (WSAA) ────────────────────────────
    const token = await obtenerToken()
    if (!token) {
      return NextResponse.json({ error: 'Error al autenticar con AFIP. Intentá de nuevo.' }, { status: 502 })
    }

    // ── Paso 2: Obtener último número de comprobante ───────────────────────
    const ultimoNro = await obtenerUltimoComprobante(token, tipoComprobante)

    // ── Paso 3: Construir y enviar la solicitud de CAE ────────────────────
    const fechaHoy = new Date().toISOString().split('T')[0].replace(/-/g, '')

    const solicitud = {
      FECAESolicitar: {
        Auth: { Token: token.token, Sign: token.sign, Cuit: AFIP_CUIT },
        FeCAEReq: {
          FeCabReq: {
            CantReg: 1,
            PtoVta: 1,
            CbteTipo: tipoComprobante,
          },
          FeDetReq: {
            FECAEDetRequest: {
              Concepto: concepto,
              DocTipo: cuitReceptor ? 80 : 99, // 80=CUIT, 99=Consumidor final
              DocNro: cuitReceptor ? cuitReceptor.replace(/-/g,'') : 0,
              CbteDesde: ultimoNro + 1,
              CbteHasta: ultimoNro + 1,
              CbteFch: fechaHoy,
              ImpTotal: importeTotal,
              ImpTotConc: 0,
              ImpNeto: importeNeto,
              ImpOpEx: 0,
              ImpIVA: importeIVA || 0,
              ImpTrib: 0,
              FchServDesde: fechaServicioDesde?.replace(/-/g,'') || fechaHoy,
              FchServHasta: fechaServicioHasta?.replace(/-/g,'') || fechaHoy,
              FchVtoPago: fechaHoy,
              MonId: 'PES',
              MonCotiz: 1,
              Iva: alicuotaIVA > 0 ? {
                AlicIva: {
                  Id: alicuotaAfipId(alicuotaIVA),
                  BaseImp: importeNeto,
                  Importe: importeIVA,
                }
              } : null,
            },
          },
        },
      },
    }

    // Llamada al WS de AFIP (WSFE)
    const respAfip = await fetch(AFIP_WSFE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml; charset=utf-8', 'SOAPAction': 'FECAESolicitar' },
      body: buildSoapEnvelope('FECAESolicitar', solicitud),
    })

    const xmlResp = await respAfip.text()
    const resultado = parsearRespuestaCAE(xmlResp)

    if (resultado.error) {
      return NextResponse.json({ error: resultado.error }, { status: 422 })
    }

    // ── Paso 4: Guardar en Supabase ───────────────────────────────────────
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('facturas').insert({
        user_id: user.id,
        cliente: receptor,
        concepto: descripcion || `Comprobante tipo ${tipoComprobante}`,
        monto: importeTotal,
        numero: `00001-${String(ultimoNro + 1).padStart(8,'0')}`,
        estado: 'pendiente',
        notas: `CAE: ${resultado.cae} | Vto: ${resultado.caeVto}`,
      })
    }

    return NextResponse.json(resultado)

  } catch (err: any) {
    console.error('Error facturación AFIP:', err)
    return NextResponse.json({ error: 'Error interno al procesar la factura.' }, { status: 500 })
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function alicuotaAfipId(pct: number): number {
  const map: Record<number, number> = { 0: 3, 10.5: 4, 21: 5, 27: 6 }
  return map[pct] ?? 5
}

async function obtenerToken(): Promise<{ token: string; sign: string } | null> {
  // En una implementación real, acá va la lógica de WSAA con el certificado
  // Por ahora retorna null para que el flujo caiga al modo demo
  // TODO: implementar firma del TRA con node-forge o similar
  return null
}

async function obtenerUltimoComprobante(token: any, tipoComp: number): Promise<number> {
  // En una implementación real, llama a FECompUltimoAutorizado
  return 0
}

function buildSoapEnvelope(action: string, body: any): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ar="http://ar.gov.afip.dif.FEV1/">
  <soap:Body>
    <ar:${action}>
      ${JSON.stringify(body)}
    </ar:${action}>
  </soap:Body>
</soap:Envelope>`
}

function parsearRespuestaCAE(xml: string): any {
  // Parser básico — en producción usar xml2js o fast-xml-parser
  const caeMatch      = xml.match(/<CAE>(.*?)<\/CAE>/)
  const caeVtoMatch   = xml.match(/<CAEFchVto>(.*?)<\/CAEFchVto>/)
  const resultMatch   = xml.match(/<Resultado>(.*?)<\/Resultado>/)
  const errorMatch    = xml.match(/<Msg>(.*?)<\/Msg>/)

  if (errorMatch && !caeMatch) {
    return { error: errorMatch[1] }
  }

  return {
    cae:           caeMatch?.[1] || '',
    caeVto:        caeVtoMatch?.[1] || '',
    nroComprobante:'00001-00000001',
    resultado:     resultMatch?.[1] || 'A',
  }
}
