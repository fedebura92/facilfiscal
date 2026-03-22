import { createClient } from '@supabase/supabase-js'

// Cliente para el browser (usa anon key)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Cliente para el servidor (usa service role — solo en API Routes)
export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/* ── SQL para crear las tablas en Supabase ──────────────────

-- Tabla de suscriptores de alertas por email
create table suscriptores (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  tipo_contribuyente text not null default 'mono',
  cuit text,
  created_at timestamptz default now()
);
create unique index on suscriptores(email, tipo_contribuyente);

-- Tabla de alertas (admin edita desde Supabase Dashboard)
create table alertas (
  id uuid primary key default gen_random_uuid(),
  icon text,
  tipo text default 'warn',   -- warn | info | danger
  title text not null,
  desc text,
  tipo_contribuyente text not null,
  activa boolean default true,
  created_at timestamptz default now()
);

-- Tabla de vencimientos (admin puede editar fechas sin tocar código)
create table vencimientos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  emoji text,
  dia int not null,
  detalle text,
  tipo text not null,  -- mono | ri | aut
  activo boolean default true
);

─────────────────────────────────────────────────────────── */
