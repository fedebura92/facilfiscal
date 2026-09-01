export const PROVINCIAS_IIBB = [
  ['Buenos Aires','ARBA',3.5,'https://www.arba.gov.ar'],['CABA','AGIP',3,'https://www.agip.gob.ar'],
  ['Catamarca','ARCA Catamarca',3.5,'https://rentas.catamarca.gob.ar'],['Chaco','ATP Chaco',3.5,'https://atp.chaco.gob.ar'],
  ['Chubut','ARECH',3.5,'https://www.dgrchubut.gov.ar'],['Córdoba','Rentas Córdoba',4,'https://www.rentascordoba.gob.ar'],
  ['Corrientes','Rentas Corrientes',3,'https://www.dgrcorrientes.gov.ar'],['Entre Ríos','ATER',3.5,'https://www.ater.gob.ar'],
  ['Formosa','Rentas Formosa',3,'https://www.formosa.gob.ar/rentas'],['Jujuy','Rentas Jujuy',3.5,'https://www.rentasjujuy.gob.ar'],
  ['La Pampa','DGR La Pampa',3.5,'https://dgr.lapampa.gob.ar'],['La Rioja','DGIP La Rioja',3.5,'https://dgiplarioja.gob.ar'],
  ['Mendoza','ATM Mendoza',3.5,'https://www.atm.mendoza.gov.ar'],['Misiones','ATM Misiones',3.5,'https://www.atmisiones.gob.ar'],
  ['Neuquén','Rentas Neuquén',3.5,'https://www.dprneuquen.gob.ar'],['Río Negro','ART Río Negro',3.5,'https://agencia.rionegro.gov.ar'],
  ['Salta','Rentas Salta',3.5,'https://www.dgrsalta.gov.ar'],['San Juan','Rentas San Juan',3.5,'https://rentas.dgrsj.gob.ar'],
  ['San Luis','Rentas San Luis',3.5,'https://dpip.sanluis.gov.ar'],['Santa Cruz','ASIP',3.5,'https://www.asip.gob.ar'],
  ['Santa Fe','API Santa Fe',3.5,'https://www.santafe.gov.ar/api'],['Santiago del Estero','DGR Santiago',3.5,'https://www.dgrsantiago.gov.ar'],
  ['Tierra del Fuego','AREF',3,'https://www.aref.gob.ar'],['Tucumán','Rentas Tucumán',4,'https://www.rentastucuman.gob.ar'],
] as const

export type ActividadSimple = 'servicios'|'comercio'|'industria'|'profesional'|'agro'
export const ACTIVIDADES_SIMPLES: Record<ActividadSimple,{label:string;factor:number;nota:string}> = {
  servicios:{label:'Presto servicios',factor:1,nota:'Servicios generales'},
  comercio:{label:'Vendo productos',factor:1,nota:'Comercio minorista o mayorista'},
  industria:{label:'Fabrico productos',factor:.55,nota:'La industria suele tener tasas reducidas o exenciones'},
  profesional:{label:'Soy profesional independiente',factor:1,nota:'Puede haber exenciones según profesión y jurisdicción'},
  agro:{label:'Actividad agropecuaria',factor:.5,nota:'Suele tener tratamientos especiales'},
}

export function estimarAlicuotaProvincia(provincia:string,actividad:ActividadSimple){
  const p=PROVINCIAS_IIBB.find(x=>x[0]===provincia)??PROVINCIAS_IIBB[0]
  return Math.round(p[2]*ACTIVIDADES_SIMPLES[actividad].factor*100)/100
}
