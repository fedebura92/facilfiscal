import test from 'node:test'
import assert from 'node:assert/strict'
import {diferenciaDias,fechaArgentina,preferenciaDesdeTareas,resolverFechaVencimiento,sumarDias} from './notificaciones.ts'
const iva={id:'iva',anio:2026,mes:9,titulo:'IVA',descripcion:'',categoria:['responsable'],dia:null,fechas_por_terminacion:{'0':18,'1':18,'8':24,'9':24}}
test('resuelve fecha fija y por CUIT',()=>{assert.equal(resolverFechaVencimiento({...iva,dia:21},null),'2026-09-21');assert.equal(resolverFechaVencimiento(iva,'8'),'2026-09-24');assert.equal(resolverFechaVencimiento(iva,null),null)})
test('calcula dias exactos entre meses',()=>{assert.equal(sumarDias('2026-09-29',3),'2026-10-02');assert.equal(diferenciaDias('2026-09-18','2026-09-21'),3)})
test('usa fecha civil argentina',()=>assert.equal(fechaArgentina(new Date('2026-09-02T01:30:00Z')),'2026-09-01'))
test('toma preferencia activa mas reciente',()=>assert.equal(preferenciaDesdeTareas([{task_id:'recordatorio_anticipacion_3',done:true,updated_at:'2026-09-01'},{task_id:'recordatorio_anticipacion_7',done:true,updated_at:'2026-09-02'}]),7))
