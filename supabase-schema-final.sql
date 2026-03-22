-- ============================================================
-- FÁCIL FISCAL — Schema completo Supabase (versión final)
-- ============================================================

create extension if not exists "uuid-ossp";

-- ── TABLA: users ─────────────────────────────────────────────
create table if not exists public.users (
  id               uuid primary key default uuid_generate_v4(),
  email            text not null unique,
  cuit             text,
  tipo             text not null default 'mono'
                   check (tipo in ('mono','ri','aut')),
  nombre           text,
  terminacion_cuit char(1),
  activo           boolean default true,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create index if not exists users_email_idx on public.users(email);
create index if not exists users_tipo_idx  on public.users(tipo);

create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists users_updated_at on public.users;
create trigger users_updated_at
  before update on public.users
  for each row execute function update_updated_at();

-- ── TABLA: vencimientos ──────────────────────────────────────
create table if not exists public.vencimientos (
  id         uuid primary key default uuid_generate_v4(),
  nombre     text not null,
  emoji      text default '📋',
  detalle    text,
  dia_mes    int not null check (dia_mes between 1 and 31),
  tipo       text not null check (tipo in ('mono','ri','aut','todos')),
  mes        int,
  activo     boolean default true,
  created_at timestamptz default now()
);

create index if not exists venc_tipo_idx on public.vencimientos(tipo);
create index if not exists venc_dia_idx  on public.vencimientos(dia_mes);

insert into public.vencimientos (nombre, emoji, detalle, dia_mes, tipo) values
  ('Monotributo (term. 0-4)', '📋', 'Terminación CUIT 0, 1, 2, 3 o 4',       3,  'mono'),
  ('Monotributo (term. 5-9)', '📋', 'Terminación CUIT 5, 6, 7, 8 o 9',       10, 'mono'),
  ('Obra Social / Previsional','🏥','Componente previsional del monotributo', 12, 'mono'),
  ('IVA',                     '🧾','Presentación y pago mensual',             19, 'ri'  ),
  ('Ganancias anticipo',      '💼','Anticipo mensual personas jurídicas',     25, 'ri'  ),
  ('SUSS Empleadores',        '👥','Contribuciones patronales',               12, 'ri'  ),
  ('Bienes Personales',       '🏠','Anticipo mensual',                        22, 'ri'  ),
  ('Autónomos',               '⚡','Aporte mensual categorías I-V',            8, 'aut' ),
  ('IVA (autónomos)',         '🧾','Si estás inscripto en IVA',               19, 'aut' ),
  ('Ganancias anticipo',      '💼','Anticipo mensual personas humanas',       25, 'aut' );

-- ── TABLA: alerts ────────────────────────────────────────────
create table if not exists public.alerts (
  id                 uuid primary key default uuid_generate_v4(),
  icon               text default '⚠️',
  tipo               text default 'warn' check (tipo in ('warn','info','danger')),
  title              text not null,
  description        text,
  tipo_contribuyente text not null default 'todos'
                     check (tipo_contribuyente in ('mono','ri','aut','todos')),
  activa             boolean default true,
  fecha_expiracion   date,
  created_at         timestamptz default now()
);

create index if not exists alerts_tipo_idx   on public.alerts(tipo_contribuyente);
create index if not exists alerts_activa_idx on public.alerts(activa);

insert into public.alerts (icon, tipo, title, description, tipo_contribuyente) values
  ('🔄','warn',   'Recategorización abierta',   'Período enero-febrero. Revisá si tus ingresos cambiaron.',            'mono'),
  ('💰','warn',   'Nuevos valores de cuota',    'Los montos del monotributo se actualizaron. Verificá en ARCA.',       'mono'),
  ('📢','info',   'ARCA reemplaza a AFIP',      'Todos los trámites siguen en afip.gob.ar y arca.gob.ar.',            'todos'),
  ('📅','warn',   'IVA bimestral',              'Si sos contribuyente bimestral, verificá el cronograma específico.', 'ri'),
  ('💼','danger', 'Retenciones y percepciones', 'Verificá si debés presentar F.2002 o F.572 este mes.',               'ri'),
  ('⚡','warn',   'Ajuste de categorías',       'Las categorías de autónomos se actualizan por inflación.',           'aut');

-- ── TABLA: email_logs ────────────────────────────────────────
-- fecha_envio se puebla via trigger (evita el error 42P17 de IMMUTABLE)
create table if not exists public.email_logs (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid references public.users(id) on delete cascade,
  email          text not null,
  tipo_email     text not null,
  vencimiento_id uuid references public.vencimientos(id),
  enviado_at     timestamptz default now(),
  fecha_envio    date,
  error          text
);

create index if not exists email_logs_user_idx  on public.email_logs(user_id);
create index if not exists email_logs_email_idx on public.email_logs(email);

create unique index if not exists email_logs_no_dup
  on public.email_logs(email, tipo_email, vencimiento_id, fecha_envio)
  where error is null;

-- Trigger que puebla fecha_envio automáticamente
create or replace function public.set_email_logs_fecha_envio()
returns trigger language plpgsql as $$
begin
  new.fecha_envio := new.enviado_at::date;
  return new;
end;
$$;

drop trigger if exists trg_set_email_logs_fecha_envio on public.email_logs;
create trigger trg_set_email_logs_fecha_envio
  before insert or update on public.email_logs
  for each row execute function public.set_email_logs_fecha_envio();

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
alter table public.users        enable row level security;
alter table public.vencimientos enable row level security;
alter table public.alerts       enable row level security;
alter table public.email_logs   enable row level security;

drop policy if exists "vencimientos_public_read" on public.vencimientos;
drop policy if exists "alerts_public_read"       on public.alerts;
drop policy if exists "users_open"               on public.users;
drop policy if exists "email_logs_service_only"  on public.email_logs;

create policy "vencimientos_public_read"
  on public.vencimientos for select using (activo = true);
create policy "alerts_public_read"
  on public.alerts for select using (activa = true);
create policy "users_open"
  on public.users for all using (true) with check (true);
create policy "email_logs_service_only"
  on public.email_logs for all using (false);

-- ── FUNCIÓN helper para cron ─────────────────────────────────
create or replace function get_vencimientos_proximos(p_tipo text, p_dias int default 7)
returns table (id uuid, nombre text, emoji text, detalle text, dia_mes int, tipo text, fecha date)
as $$
begin
  return query
    select v.id, v.nombre, v.emoji, v.detalle, v.dia_mes, v.tipo,
      make_date(
        extract(year  from current_date)::int,
        extract(month from current_date)::int,
        v.dia_mes
      )::date as fecha
    from public.vencimientos v
    where v.activo = true
      and (v.tipo = p_tipo or v.tipo = 'todos')
      and make_date(
            extract(year  from current_date)::int,
            extract(month from current_date)::int,
            v.dia_mes
          ) between current_date and current_date + p_dias
    order by fecha;
end;
$$ language plpgsql;
