# Fácil Fiscal — Guía de Setup Completo

## Stack
- **Frontend + API Routes**: Next.js 14 → Vercel (gratis)
- **Base de datos**: Supabase (gratis hasta 500MB)
- **Emails**: Resend (3.000 emails/mes gratis)
- **Dominio**: Nic.ar → facilfiscal.com.ar (~$10/año)

---

## PASO 1 — Supabase

### 1.1 Crear proyecto
1. Ir a [supabase.com](https://supabase.com) → "New project"
2. Nombre: `facilfiscal`
3. Password: guardarlo en un lugar seguro
4. Región: `South America (São Paulo)`

### 1.2 Crear las tablas
1. Ir a **SQL Editor** → "New query"
2. Pegar TODO el contenido de `supabase-schema.sql`
3. Click en **Run** (▶)
4. Verificar que aparecen las 4 tablas en **Table Editor**

### 1.3 Copiar las keys
Ir a **Settings → API**:
```
NEXT_PUBLIC_SUPABASE_URL       → Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  → anon public
SUPABASE_SERVICE_ROLE_KEY      → service_role (¡nunca expongas esta!)
```

---

## PASO 2 — Resend (emails)

1. Ir a [resend.com](https://resend.com) → crear cuenta gratuita
2. **Domains** → "Add domain" → `facilfiscal.com.ar`
3. Agregar los registros DNS que te muestra (en tu registrar de dominio)
4. **API Keys** → "Create API Key" → copiar

```
RESEND_API_KEY=re_XXXXXXXXX
```

> Si todavía no tenés el dominio, podés usar `onboarding@resend.dev`
> para pruebas (solo manda a tu propio email).

---

## PASO 3 — Variables de entorno

Crear el archivo `.env.local` en la raíz del proyecto:

```env
# Anthropic (conseguila en console.anthropic.com)
ANTHROPIC_API_KEY=sk-ant-XXXXXXXX

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://XXXXXXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJXXXXXX
SUPABASE_SERVICE_ROLE_KEY=eyJXXXXXX

# Resend
RESEND_API_KEY=re_XXXXXXXX

# Cron (inventate una string larga y random)
CRON_SECRET=mi-clave-secreta-muy-larga-2026
```

---

## PASO 4 — Correr en local

```bash
# Instalar dependencias
npm install

# Correr en desarrollo
npm run dev

# Abrir en el browser
open http://localhost:3000
```

---

## PASO 5 — Deploy en Vercel

### 5.1 Subir el código a GitHub
```bash
git init
git add .
git commit -m "inicial"
git remote add origin https://github.com/TU_USUARIO/facilfiscal.git
git push -u origin main
```

### 5.2 Conectar con Vercel
1. Ir a [vercel.com](https://vercel.com) → "Add new project"
2. Importar el repo de GitHub
3. En **Environment Variables**, agregar todas las del `.env.local`
4. Click en **Deploy**

### 5.3 Agregar el dominio
1. Vercel → tu proyecto → **Settings → Domains**
2. Agregar `facilfiscal.com.ar`
3. Vercel te da los registros DNS a configurar en tu registrar

---

## PASO 6 — Verificar que todo funciona

### Tablas en Supabase
- `Table Editor` → verificar las 4 tablas con datos
- `vencimientos`: 10 filas cargadas
- `alerts`: 6 filas cargadas

### API Routes (en local o en producción)
```bash
# Vencimientos
curl "http://localhost:3000/api/vencimientos?tipo=mono"

# Alertas
curl "http://localhost:3000/api/alerts?tipo=mono"

# Suscribir email
curl -X POST "http://localhost:3000/api/suscribir" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","tipo_contribuyente":"mono"}'

# Consulta IA
curl -X POST "http://localhost:3000/api/fiscal" \
  -H "Content-Type: application/json" \
  -d '{"query":"cuando vence el monotributo este mes"}'
```

### Cron jobs (en producción)
```bash
# Simular el cron de alertas
curl -H "Authorization: Bearer mi-clave-secreta-muy-larga-2026" \
  "https://facilfiscal.com.ar/api/cron/alertas"

# Simular el resumen semanal
curl -H "Authorization: Bearer mi-clave-secreta-muy-larga-2026" \
  "https://facilfiscal.com.ar/api/cron/resumen-semanal"
```

---

## Arquitectura de emails

```
Vercel Cron (todos los días 8am)
    ↓
/api/cron/alertas
    ↓
Supabase: traer usuarios activos
    ↓
Para cada usuario:
  → get_vencimientos_proximos(tipo, 0 días)  ← vence HOY
  → get_vencimientos_proximos(tipo, 3 días)  ← vence en 3 días
    ↓
¿Ya se envió hoy? → email_logs → si existe, skip
    ↓
Resend: enviar email HTML
    ↓
email_logs: registrar envío

Vercel Cron (lunes 8am)
    ↓
/api/cron/resumen-semanal
    ↓
Mismo flujo → email con tabla de la semana
```

---

## Costos estimados (escala inicial)

| Servicio  | Plan      | Costo    | Límite                |
|-----------|-----------|----------|-----------------------|
| Vercel    | Hobby     | Gratis   | 100GB bandwidth/mes   |
| Supabase  | Free      | Gratis   | 500MB DB, 50K rows    |
| Resend    | Free      | Gratis   | 3.000 emails/mes      |
| Dominio   | .com.ar   | ~$10/año | —                     |
| **Total** |           | **~$10/año** | Hasta ~3.000 usuarios |

---

## Próximos pasos (cuando escales)

1. **Supabase Auth** → login con email/password o Google
2. **Personalización por CUIT** → fecha exacta de monotributo por terminación
3. **Dashboard de admin** → para editar alertas y vencimientos sin SQL
4. **WhatsApp** → Twilio o Meta API para alertas por WhatsApp
5. **Push notifications** → Progressive Web App (PWA)
