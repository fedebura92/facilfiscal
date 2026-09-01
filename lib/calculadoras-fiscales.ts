export const VERIFICACION_FISCAL = '1 de septiembre de 2026'

export const ESCALA_GANANCIAS_2026 = [
  { desde: 0, hasta: 2336953.69, fijo: 0, tasa: 0.05 },
  { desde: 2336953.69, hasta: 4673907.36, fijo: 116847.68, tasa: 0.09 },
  { desde: 4673907.36, hasta: 7010861.05, fijo: 327173.52, tasa: 0.12 },
  { desde: 7010861.05, hasta: 10516291.59, fijo: 607607.96, tasa: 0.15 },
  { desde: 10516291.59, hasta: 21032583.18, fijo: 1133422.54, tasa: 0.19 },
  { desde: 21032583.18, hasta: 31548874.77, fijo: 3131517.94, tasa: 0.23 },
  { desde: 31548874.77, hasta: 47323312.16, fijo: 5550265.01, tasa: 0.27 },
  { desde: 47323312.16, hasta: 70984968.25, fijo: 9809363.10, tasa: 0.31 },
  { desde: 70984968.25, hasta: Infinity, fijo: 17144476.49, tasa: 0.35 },
] as const

export function calcularGanancias2026(base: number) {
  const imponible = Math.max(0, base)
  const tramo = ESCALA_GANANCIAS_2026.find(({ desde, hasta }) => imponible >= desde && imponible < hasta)!
  return { base: imponible, impuesto: tramo.fijo + (imponible - tramo.desde) * tramo.tasa, tasaMarginal: tramo.tasa }
}

export type MovimientoIVA = { neto: number; tasa: number }
export function calcularIVA(params: { ventas: MovimientoIVA[]; compras: MovimientoIVA[]; retenciones?: number; saldoAnterior?: number }) {
  const debito = params.ventas.reduce((s, m) => s + Math.max(0, m.neto) * m.tasa, 0)
  const credito = params.compras.reduce((s, m) => s + Math.max(0, m.neto) * m.tasa, 0)
  const deducciones = Math.max(0, params.retenciones ?? 0) + Math.max(0, params.saldoAnterior ?? 0)
  const saldo = debito - credito - deducciones
  return { debito, credito, deducciones, pagar: Math.max(0, saldo), saldoFavor: Math.max(0, -saldo) }
}

export function calcularIIBB(params: { base: number; alicuota: number; minimo?: number; retenciones?: number; saldoAnterior?: number }) {
  const determinado = Math.max(Math.max(0, params.base) * Math.max(0, params.alicuota) / 100, Math.max(0, params.minimo ?? 0))
  const saldo = determinado - Math.max(0, params.retenciones ?? 0) - Math.max(0, params.saldoAnterior ?? 0)
  return { determinado, pagar: Math.max(0, saldo), saldoFavor: Math.max(0, -saldo) }
}

export function calcularImportacion(params: {
  fobUSD: number; fleteUSD: number; seguroUSD: number; tipoCambio: number
  derecho: number; estadistica: number; iva: number; percepcionIVA?: number
  percepcionGanancias?: number; internos?: number; franquiciaSimplificada?: boolean
}) {
  const cif = Math.max(0, params.fobUSD + params.fleteUSD + params.seguroUSD) * Math.max(0, params.tipoCambio)
  const derecho = params.franquiciaSimplificada ? 0 : cif * Math.max(0, params.derecho) / 100
  const estadistica = params.franquiciaSimplificada ? 0 : cif * Math.max(0, params.estadistica) / 100
  const baseIVA = cif + derecho + estadistica
  const iva = baseIVA * Math.max(0, params.iva) / 100
  const percepcionIVA = baseIVA * Math.max(0, params.percepcionIVA ?? 0) / 100
  const percepcionGanancias = baseIVA * Math.max(0, params.percepcionGanancias ?? 0) / 100
  const internos = baseIVA * Math.max(0, params.internos ?? 0) / 100
  const tributos = derecho + estadistica + iva + percepcionIVA + percepcionGanancias + internos
  return { cif, baseIVA, derecho, estadistica, iva, percepcionIVA, percepcionGanancias, internos, tributos, total: cif + tributos }
}
