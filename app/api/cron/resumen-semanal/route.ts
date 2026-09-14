import { NextRequest,NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generarTokenUnsub } from '@/lib/unsubscribe'
import { CATEGORIA_POR_TIPO,diferenciaDias,escaparHtml,fechaArgentina,resolverFechaVencimiento,sumarDias,type VencimientoNotificable } from '@/lib/notificaciones'

export const dynamic='force-dynamic'
const BASE_URL='https://www.facilfiscal.com.ar'

type UsuarioAlerta={id:string;email:string;tipo:string;nombre?:string|null;terminacion_cuit?:string|null}

export async function GET(req:NextRequest){
  if(req.headers.get('authorization')!==`Bearer ${process.env.CRON_SECRET}`)return NextResponse.json({error:'Unauthorized'},{status:401})
  const dryRun=req.nextUrl.searchParams.get('dryRun')==='1',db=supabaseAdmin(),hoy=fechaArgentina(),fin=sumarDias(fechaArgentina(),7)
  const periodos=Array.from(new Set([hoy.slice(0,7),fin.slice(0,7)])),filtro=periodos.map(p=>`and(anio.eq.${p.slice(0,4)},mes.eq.${Number(p.slice(5,7))})`).join(',')
  const[uq,vq]=await Promise.all([
    db.from('users').select('id,email,tipo,nombre,terminacion_cuit').eq('activo',true),
    db.from('vencimientos_fiscales').select('id,anio,mes,titulo,descripcion,categoria,dia,fechas_por_terminacion,fuente').eq('estado','validado').eq('verificado',true).or(filtro)
  ])
  if(uq.error||vq.error)return NextResponse.json({ok:false,error:uq.error?.message||vq.error?.message},{status:500})
  const users=(uq.data||[]) as UsuarioAlerta[]
  if(!users.length)return NextResponse.json({ok:true,dryRun,sent:0})

  const emails=Array.from(new Set(users.map(u=>u.email.toLowerCase())))
  const pq=await db.from('profiles').select('email,nombre,terminacion_cuit').in('email',emails)
  if(pq.error)return NextResponse.json({ok:false,error:pq.error.message},{status:500})
  const perfiles=new Map((pq.data||[]).map(p=>[p.email.toLowerCase(),p]))

  const grupos=new Map<string,UsuarioAlerta[]>()
  for(const user of users){
    const key=user.email.toLowerCase()
    grupos.set(key,[...(grupos.get(key)||[]),user])
  }

  let sent=0,failed=0,skippedMissingCuit=0
  for(const [email,filas] of Array.from(grupos.entries())){
    const perfil=perfiles.get(email)
    const terminacion=filas.find(u=>u.terminacion_cuit)?.terminacion_cuit||perfil?.terminacion_cuit
    const categorias=new Set(filas.map(u=>CATEGORIA_POR_TIPO[u.tipo]).filter(Boolean))
    const unicos=new Map<string,{v:VencimientoNotificable;fecha:string}>()

    for(const raw of (vq.data||[])){
      const v=raw as VencimientoNotificable
      if(!v.categoria.some(c=>categorias.has(c)))continue
      const fecha=resolverFechaVencimiento(v,terminacion)
      if(!fecha){skippedMissingCuit++;continue}
      const d=diferenciaDias(hoy,fecha)
      if(d<0||d>7)continue
      unicos.set(`${v.id}:${fecha}`,{v,fecha})
    }

    const fechas=Array.from(unicos.values())
    if(!fechas.length)continue
    const ya=await db.from('email_logs').select('id').eq('email',email).eq('tipo_email','resumen_semanal').eq('fecha_envio',hoy).is('error',null).maybeSingle()
    if(ya.error){failed++;continue}
    if(ya.data)continue
    if(dryRun){sent++;continue}

    const principal=filas[0]
    try{
      const providerId=await enviarResumen(email,filas.find(u=>u.nombre)?.nombre||perfil?.nombre||'Contribuyente',fechas,hoy)
      const ins=await db.from('email_logs').insert({user_id:principal.id,email,tipo_email:'resumen_semanal',provider_id:providerId})
      if(ins.error)throw ins.error
      sent++
    }catch(error){
      failed++
      await db.from('email_logs').insert({user_id:principal.id,email,tipo_email:'resumen_semanal',error:error instanceof Error?error.message:String(error)})
    }
  }
  return NextResponse.json({ok:failed===0,dryRun,date:hoy,sent,failed,skippedMissingCuit},{status:failed?500:200})
}

async function enviarResumen(to:string,nombre:string,items:Array<{v:VencimientoNotificable;fecha:string}>,hoy:string):Promise<string|null>{
  if(!process.env.RESEND_API_KEY)throw new Error('RESEND_API_KEY no configurada')
  const rows=items.sort((a,b)=>a.fecha.localeCompare(b.fecha)).map(({v,fecha})=>{const d=diferenciaDias(hoy,fecha),label=d===0?'HOY':d===1?'Mañana':`En ${d} días`;return `<tr><td style="padding:10px"><b>${escaparHtml(v.titulo)}</b></td><td style="padding:10px">${fecha.split('-').reverse().join('/')}</td><td style="padding:10px">${label}</td></tr>`}).join('')
  const html=`<!doctype html><html lang="es"><body style="font-family:Arial,sans-serif;background:#f4f7f9;padding:32px 16px"><main style="max-width:600px;margin:auto;background:white;border-radius:16px;overflow:hidden"><header style="background:#0d5c78;padding:24px;color:white"><b style="font-size:22px">Fácil Fiscal</b><br><small>Resumen semanal de vencimientos</small></header><section style="padding:28px"><p>Hola ${escaparHtml(nombre)}, estos son tus vencimientos de los próximos 7 días:</p><table style="width:100%;border-collapse:collapse">${rows}</table><p><a href="${BASE_URL}/mipanel">Ver panel completo →</a></p></section><footer style="background:#f4f7f9;padding:16px;text-align:center;font-size:11px"><a href="${BASE_URL}/unsubscribe?email=${encodeURIComponent(to)}&token=${generarTokenUnsub(to)}">Cancelar suscripción</a></footer></main></body></html>`
  const res=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`resumen/${to}/${hoy}`},body:JSON.stringify({from:'Fácil Fiscal <alertas@facilfiscal.com.ar>',to:[to],subject:'📅 Tus vencimientos de esta semana',html})})
  const body=await res.json().catch(()=>({}));if(!res.ok)throw new Error(body.message||res.statusText);return body.id||null
}
