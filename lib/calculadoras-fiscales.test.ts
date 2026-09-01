import test from 'node:test'
import assert from 'node:assert/strict'
import { calcularGanancias2026, calcularIIBB, calcularIVA, calcularImportacion, estimarGananciasSimple } from './calculadoras-fiscales.ts'

test('Ganancias aplica la escala anual 2026', () => {
  assert.equal(calcularGanancias2026(0).impuesto, 0)
  assert.equal(calcularGanancias2026(2336953.69).impuesto, 116847.68)
  assert.equal(calcularGanancias2026(80000000).tasaMarginal, 0.35)
})
test('Ganancias simple transforma sueldo bruto y deducciones cotidianas', () => {
  const sinCargas=estimarGananciasSimple({tipo:'empleado',ingresoMensual:5000000,meses:13})
  const conCargas=estimarGananciasSimple({tipo:'empleado',ingresoMensual:5000000,meses:13,hijos:2,alquilerMensual:500000})
  assert.ok(sinCargas.impuesto>0)
  assert.ok(conCargas.impuesto<sinCargas.impuesto)
  assert.equal(sinCargas.aportes,11050000)
})
test('IVA separa débito, crédito, pagos y saldo a favor', () => {
  assert.deepEqual(calcularIVA({ ventas:[{neto:1000,tasa:.21}], compras:[{neto:500,tasa:.21}], retenciones:25 }), { debito:210, credito:105, deducciones:25, pagar:80, saldoFavor:0 })
})
test('IIBB respeta mínimo y deducciones', () => {
  assert.deepEqual(calcularIIBB({base:100000,alicuota:3,minimo:4000,retenciones:1000}), {determinado:4000,pagar:3000,saldoFavor:0})
})
test('franquicia simplificada elimina derecho y estadística, no IVA', () => {
  const r = calcularImportacion({fobUSD:300,fleteUSD:20,seguroUSD:0,tipoCambio:1000,derecho:20,estadistica:3,iva:21,franquiciaSimplificada:true})
  assert.equal(r.derecho,0); assert.equal(r.estadistica,0); assert.equal(r.iva,67200)
})
