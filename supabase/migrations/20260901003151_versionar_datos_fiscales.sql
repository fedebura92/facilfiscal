-- Fuente versionada y auditable para cualquier dato fiscal consumido por la
-- aplicación. Solo las versiones validadas son legibles desde el cliente.
create table public.datos_fiscales_versiones (
  id uuid primary key default gen_random_uuid(),
  dominio text not null,
  clave text not null,
  version integer not null,
  contenido jsonb not null,
  vigente_desde date not null,
  vigente_hasta date,
  estado text not null default 'borrador'
    check (estado in ('borrador','validado','vencido','rechazado')),
  fuente_nombre text not null,
  fuente_url text not null,
  verificado_at timestamptz,
  publicado_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint datos_fiscales_vigencia_valida
    check (vigente_hasta is null or vigente_hasta >= vigente_desde),
  constraint datos_fiscales_version_unique unique (dominio, clave, version)
);

create unique index datos_fiscales_un_validado_vigente_idx
  on public.datos_fiscales_versiones(dominio, clave)
  where estado = 'validado' and vigente_hasta is null;
create index datos_fiscales_busqueda_idx
  on public.datos_fiscales_versiones(dominio, clave, estado, vigente_desde desc);

alter table public.datos_fiscales_versiones enable row level security;
create policy datos_fiscales_lectura_publica
  on public.datos_fiscales_versiones for select
  to anon, authenticated
  using (estado = 'validado' and vigente_desde <= current_date
    and (vigente_hasta is null or vigente_hasta >= current_date));

grant select on public.datos_fiscales_versiones to anon, authenticated;
revoke insert, update, delete on public.datos_fiscales_versiones from anon, authenticated;

create trigger datos_fiscales_set_updated_at
before update on public.datos_fiscales_versiones
for each row execute function public.set_updated_at();

-- Valores oficiales publicados por ARCA para aplicación desde 01/08/2026.
insert into public.datos_fiscales_versiones (
  dominio, clave, version, contenido, vigente_desde, estado,
  fuente_nombre, fuente_url, verificado_at, publicado_at
) values (
  'monotributo', 'categorias', 20260801,
  $json$[
    {"letra":"A","limite_anual":12009410.45,"imp_servicios":5585.77,"imp_productos":5585.77,"prev_sipa":18246.86,"obra_social":25694.55,"total_servicios":49527.18,"total_productos":49527.18},
    {"letra":"B","limite_anual":17595182.74,"imp_servicios":10612.98,"imp_productos":10612.98,"prev_sipa":20071.55,"obra_social":25694.55,"total_servicios":56379.08,"total_productos":56379.08},
    {"letra":"C","limite_anual":24670494.31,"imp_servicios":18246.86,"imp_productos":16757.32,"prev_sipa":22078.71,"obra_social":25694.55,"total_servicios":66020.12,"total_productos":64530.58},
    {"letra":"D","limite_anual":30628651.43,"imp_servicios":29790.79,"imp_productos":27742.67,"prev_sipa":24286.58,"obra_social":30535.56,"total_servicios":84612.93,"total_productos":82564.81},
    {"letra":"E","limite_anual":36028231.33,"imp_servicios":55857.73,"imp_productos":44313.79,"prev_sipa":26715.24,"obra_social":37238.48,"total_servicios":119811.45,"total_productos":108267.51},
    {"letra":"F","limite_anual":45151659.41,"imp_servicios":78573.20,"imp_productos":57719.64,"prev_sipa":29386.76,"obra_social":42824.25,"total_servicios":150784.21,"total_productos":129930.65},
    {"letra":"G","limite_anual":53995798.87,"imp_servicios":142995.76,"imp_productos":71497.87,"prev_sipa":41141.46,"obra_social":46175.72,"total_servicios":230312.94,"total_productos":158815.05},
    {"letra":"H","limite_anual":81924660.37,"imp_servicios":409623.31,"imp_productos":204811.64,"prev_sipa":57598.04,"obra_social":55485.33,"total_servicios":522706.68,"total_productos":317895.01},
    {"letra":"I","limite_anual":91699761.90,"imp_servicios":814591.79,"imp_productos":325836.71,"prev_sipa":80637.26,"obra_social":68518.81,"total_servicios":963747.86,"total_productos":474992.78},
    {"letra":"J","limite_anual":105012519.20,"imp_servicios":977510.14,"imp_productos":391004.07,"prev_sipa":112892.16,"obra_social":76897.46,"total_servicios":1167299.76,"total_productos":580793.69},
    {"letra":"K","limite_anual":126610838.75,"imp_servicios":1368514.20,"imp_productos":456171.40,"prev_sipa":158049.02,"obra_social":87882.82,"total_servicios":1614446.04,"total_productos":702103.24}
  ]$json$::jsonb,
  date '2026-08-01', 'validado', 'ARCA',
  'https://www.arca.gob.ar/monotributo/categorias.asp', now(), now()
);

-- La tabla anterior conserva compatibilidad, pero se corrige su vigencia y
-- precisión para que ningún consumidor legado reciba valores inconsistentes.
update public.montos_monotributo m set
  limite_anual = (c->>'limite_anual')::numeric,
  imp_servicios = (c->>'imp_servicios')::numeric,
  imp_productos = (c->>'imp_productos')::numeric,
  prev_sipa = (c->>'prev_sipa')::numeric,
  os = (c->>'obra_social')::numeric,
  total_servicios = (c->>'total_servicios')::numeric,
  total_productos = (c->>'total_productos')::numeric,
  vigencia = '01/08/2026',
  fuente = 'https://www.arca.gob.ar/monotributo/categorias.asp',
  updated_at = now()
from jsonb_array_elements((select contenido from public.datos_fiscales_versiones
  where dominio='monotributo' and clave='categorias' and version=20260801)) c
where m.letra = c->>'letra';

alter table public.vencimientos_fiscales
  add column estado text not null default 'borrador'
    check (estado in ('borrador','validado','vencido','rechazado')),
  add column version integer not null default 1,
  add column fuente_nombre text,
  add column verificado_at timestamptz;

update public.vencimientos_fiscales set
  estado = case when verificado then 'validado' else 'borrador' end,
  fuente_nombre = case when fuente is not null then 'ARCA' else null end,
  verificado_at = case when verificado then created_at else null end;

create index vencimientos_estado_periodo_idx
  on public.vencimientos_fiscales(anio, mes, estado, dia);
