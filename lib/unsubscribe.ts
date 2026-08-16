import crypto from 'crypto'

// Token firmado (HMAC) para los links de "cancelar suscripción" en los mails.
// Reutiliza CRON_SECRET como clave — ya es un secreto privado que solo vive
// server-side, no hace falta agregar una variable de entorno nueva para esto.
function secret(): string {
  const s = process.env.CRON_SECRET
  if (!s) throw new Error('Falta CRON_SECRET: no se puede firmar/validar el link de baja.')
  return s
}

export function generarTokenUnsub(email: string): string {
  return crypto.createHmac('sha256', secret())
    .update(email.trim().toLowerCase())
    .digest('hex')
}

export function validarTokenUnsub(email: string, token: string | null | undefined): boolean {
  if (!token) return false
  const esperado = generarTokenUnsub(email)
  // Comparación en tiempo constante para no filtrar el token por timing.
  const a = Buffer.from(token)
  const b = Buffer.from(esperado)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}
