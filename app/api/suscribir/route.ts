import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { generarTokenUnsub } from '@/lib/unsubscribe'

const TIPOS = new Set(['mono','ri','aut'])
const LABEL:Record<string,string>={mono:'Monotributista',ri:'Responsable Inscripto',aut:'Autónomo'}

export async function POST(req:NextRequest){
  const body=await req.json().catch(()=>null)
  const email=String(body?.email||'').trim().toLowerCase()
  const tipos=Array.isArray(body?.tipos)?Array.from(new Set(body.tipos.filter((t:unknown)=>typeof t==='string'&&TIPOS.has(t)))):[]
  const terminacionCuit=body?.terminacionCuit==null?'':String(body.terminacionCuit)
  const diasAnticipacion=Number(body?.diasAnticipacion??3)
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return NextResponse.json({error:'Email inválido'},{status:400})
  if(!tipos.length)return NextResponse.json({error:'Seleccioná al menos una categoría'},{status:400})
  if(tipos.includes('mono')&&tipos.includes('ri'))return NextResponse.json({error:'Monotributo y Responsable Inscripto son regímenes excluyentes.'},{status:400})
  if((tipos.includes('ri')||tipos.includes('aut'))&&!/^[0-9]$/.test(terminacionCuit))return NextResponse.json({error:'Indicá el último número de tu CUIT para calcular la fecha exacta.'},{status:400})
  if(![1,3,7].includes(diasAnticipacion))return NextResponse.json({error:'Anticipación inválida'},{status:400})

  const db=supabaseAdmin()
  const desactivar=await db.from('users').update({activo:false}).eq('email',email)
  if(desactivar.error)return NextResponse.json({error:'No pudimos actualizar tu suscripción.'},{status:500})
  for(const tipo of tipos){
    const guardado=await db.from('users').upsert({email,tipo,activo:true,terminacion_cuit:terminacionCuit||null,dias_anticipacion:diasAnticipacion},{onConflict:'email,tipo'})
    if(guardado.error)return NextResponse.json({error:'No pudimos guardar todas las categorías.'},{status:500})
  }
  let bienvenidaEnviada=true
  try{await bienvenida(email,tipos,diasAnticipacion)}catch(error){bienvenidaEnviada=false;console.error('Bienvenida:',error)}
  return NextResponse.json({ok:true,bienvenidaEnviada})
}

async function bienvenida(email:string,tipos:string[],dias:number){
  if(!process.env.RESEND_API_KEY)throw new Error('RESEND_API_KEY no configurada')
  const labels=tipos.map(t=>LABEL[t]||t).join(' y ')
  const html=`<!doctype html><html lang="es"><body style="font-family:Arial,sans-serif;background:#f4f7f9;padding:32px 16px"><main style="max-width:520px;margin:auto;background:white;border-radius:16px;overflow:hidden"><header style="background:#0d5c78;padding:24px;color:white"><b style="font-size:22px">Fácil Fiscal</b></header><section style="padding:28px"><h2>✅ Suscripción activada</h2><p>Vas a recibir alertas como <b>${labels}</b>.</p><ul><li>${dias===1?'Un día':`${dias} días`} antes de cada vencimiento</li><li>El mismo día del vencimiento</li><li>Resumen semanal los lunes</li></ul></section><footer style="background:#f4f7f9;padding:16px;text-align:center;font-size:11px"><a href="https://facilfiscal.com.ar/unsubscribe?email=${encodeURIComponent(email)}&token=${generarTokenUnsub(email)}">Cancelar suscripción</a></footer></main></body></html>`
  const res=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`bienvenida/${email}/${tipos.sort().join('-')}/${dias}`},body:JSON.stringify({from:'Fácil Fiscal <alertas@facilfiscal.com.ar>',to:[email],subject:'✅ Suscripción activada — Fácil Fiscal',html})})
  if(!res.ok)throw new Error(await res.text())
}
