begin;

create table public.entidades_fiscales (
  id uuid primary key default gen_random_uuid(),
  creada_por uuid not null references auth.users(id) on delete cascade,
  tipo text not null check (tipo in ('persona_fisica', 'persona_juridica', 'tercero')),
  nombre text not null,
  cuit text,
  terminacion_cuit text check (terminacion_cuit in ('0','1','2','3','4','5','6','7','8','9')),
  regimen_fiscal text check (regimen_fiscal in ('mono', 'ri', 'exento', 'no_inscripto', 'no_se')),
  provincia text,
  localidad text,
  estado text not null default 'activa' check (estado in ('activa', 'inactiva')),
  proyecto_origen_id uuid unique references public.negocio_proyectos(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint entidades_fiscales_cuit_formato
    check (cuit is null or cuit ~ '^[0-9]{11}$'),
  constraint entidades_fiscales_cuit_terminacion
    check (cuit is null or terminacion_cuit is null or right(cuit, 1) = terminacion_cuit)
);

create unique index entidades_fiscales_cuit_unique
  on public.entidades_fiscales(cuit)
  where cuit is not null;
create unique index entidades_fiscales_persona_usuario_unique
  on public.entidades_fiscales(creada_por)
  where tipo = 'persona_fisica';
create index entidades_fiscales_creada_por_idx
  on public.entidades_fiscales(creada_por);

create table public.entidad_usuarios (
  entidad_fiscal_id uuid not null references public.entidades_fiscales(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  relacion text not null check (relacion in ('titular', 'socio', 'administrador', 'empleado', 'otro')),
  permiso text not null default 'administrar' check (permiso in ('ver', 'cargar', 'administrar')),
  created_at timestamptz not null default now(),
  primary key (entidad_fiscal_id, user_id)
);

create index entidad_usuarios_user_idx on public.entidad_usuarios(user_id);

alter table public.negocio_proyectos
  add column entidad_fiscal_id uuid references public.entidades_fiscales(id) on delete restrict,
  add column relacion text check (relacion in ('titular', 'socio', 'administrador', 'empleado', 'otro'));

alter table public.facturas
  add column entidad_fiscal_id uuid references public.entidades_fiscales(id) on delete restrict;

alter table public.ingresos_mensuales
  add column entidad_fiscal_id uuid references public.entidades_fiscales(id) on delete restrict;

create index negocio_proyectos_entidad_idx on public.negocio_proyectos(entidad_fiscal_id);
create index facturas_entidad_idx on public.facturas(entidad_fiscal_id);
create index ingresos_entidad_idx on public.ingresos_mensuales(entidad_fiscal_id);

-- Una entidad personal representa el CUIT de la persona y puede agrupar
-- varias actividades individuales. Nunca se crea una entidad por actividad.
insert into public.entidades_fiscales (
  creada_por, tipo, nombre, cuit, terminacion_cuit, regimen_fiscal, provincia, localidad
)
select
  p.id,
  'persona_fisica',
  coalesce(nullif(p.nombre, ''), 'Situación personal'),
  case when regexp_replace(coalesce(p.cuit, ''), '[^0-9]', '', 'g') ~ '^[0-9]{11}$'
    then regexp_replace(p.cuit, '[^0-9]', '', 'g') else null end,
  coalesce(
    case when regexp_replace(coalesce(p.cuit, ''), '[^0-9]', '', 'g') ~ '^[0-9]{11}$'
      then right(regexp_replace(p.cuit, '[^0-9]', '', 'g'), 1) end,
    p.terminacion_cuit
  ),
  case when p.situacion_fiscal in ('mono','ri','exento','no_inscripto','no_se')
    then p.situacion_fiscal else null end,
  p.provincia,
  p.localidad
from public.profiles p
on conflict do nothing;

insert into public.entidad_usuarios (entidad_fiscal_id, user_id, relacion, permiso)
select ef.id, ef.creada_por, 'titular', 'administrar'
from public.entidades_fiscales ef
where ef.tipo = 'persona_fisica'
on conflict do nothing;

-- Sociedades y negocios de terceros necesitan una entidad separada. El CUIT
-- solo se copia cuando está completo; una terminación sola no se inventa.
insert into public.entidades_fiscales (
  creada_por, tipo, nombre, cuit, terminacion_cuit, regimen_fiscal,
  provincia, localidad, proyecto_origen_id
)
select
  np.user_id,
  case
    when np.datos->>'alternativa_elegida' = 'sociedad' then 'persona_juridica'
    else 'tercero'
  end,
  coalesce(nullif(np.nombre, ''), nullif(np.datos->>'nombre_fantasia', ''), 'Negocio'),
  case when regexp_replace(coalesce(np.datos->>'cuit', ''), '[^0-9]', '', 'g') ~ '^[0-9]{11}$'
    then regexp_replace(np.datos->>'cuit', '[^0-9]', '', 'g') else null end,
  coalesce(
    case when regexp_replace(coalesce(np.datos->>'cuit', ''), '[^0-9]', '', 'g') ~ '^[0-9]{11}$'
      then right(regexp_replace(np.datos->>'cuit', '[^0-9]', '', 'g'), 1) end,
    np.datos->>'terminacion_cuit'
  ),
  case when np.datos->>'situacion_fiscal' in ('mono','ri','exento','no_inscripto','no_se')
    then np.datos->>'situacion_fiscal' else null end,
  np.datos->>'provincia',
  np.datos->>'localidad',
  np.id
from public.negocio_proyectos np
where np.datos->>'alternativa_elegida' = 'sociedad'
   or coalesce(np.datos->>'relacion', '') in ('administrador', 'empleado', 'otro')
on conflict do nothing;

-- Actividades propias individuales comparten la entidad personal. Las demás
-- apuntan a la entidad separada recién creada.
update public.negocio_proyectos np
set entidad_fiscal_id = coalesce(
      (select ef.id from public.entidades_fiscales ef where ef.proyecto_origen_id = np.id),
      (select ef.id from public.entidades_fiscales ef
       where ef.creada_por = np.user_id and ef.tipo = 'persona_fisica')
    ),
    relacion = coalesce(
      nullif(np.datos->>'relacion', ''),
      case when np.datos->>'alternativa_elegida' = 'sociedad' then 'socio' else 'titular' end
    );

insert into public.entidad_usuarios (entidad_fiscal_id, user_id, relacion, permiso)
select
  np.entidad_fiscal_id,
  np.user_id,
  np.relacion,
  case when np.relacion = 'empleado' then 'ver' else 'administrar' end
from public.negocio_proyectos np
where np.entidad_fiscal_id is not null
on conflict (entidad_fiscal_id, user_id) do update
set relacion = excluded.relacion, permiso = excluded.permiso;

update public.facturas f
set entidad_fiscal_id = coalesce(
  (select np.entidad_fiscal_id from public.negocio_proyectos np where np.id = f.negocio_id),
  (select ef.id from public.entidades_fiscales ef
   where ef.creada_por = f.user_id and ef.tipo = 'persona_fisica')
);

update public.ingresos_mensuales i
set entidad_fiscal_id = coalesce(
  (select np.entidad_fiscal_id from public.negocio_proyectos np where np.id = i.negocio_id),
  (select ef.id from public.entidades_fiscales ef
   where ef.creada_por = i.user_id and ef.tipo = 'persona_fisica')
);

-- Garantiza que una factura o ingreso nunca vincule el user_id de una persona
-- con una entidad fiscal a la que esa persona no pertenece.
alter table public.facturas
  add constraint facturas_entidad_usuario_fkey
  foreign key (entidad_fiscal_id, user_id)
  references public.entidad_usuarios(entidad_fiscal_id, user_id);

alter table public.ingresos_mensuales
  add constraint ingresos_entidad_usuario_fkey
  foreign key (entidad_fiscal_id, user_id)
  references public.entidad_usuarios(entidad_fiscal_id, user_id);

create or replace function public.asignar_entidad_fiscal_registro()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  v_entidad_id uuid;
begin
  if new.negocio_id is not null then
    select np.entidad_fiscal_id into v_entidad_id
    from public.negocio_proyectos np
    where np.id = new.negocio_id and np.user_id = new.user_id;
  else
    select ef.id into v_entidad_id
    from public.entidades_fiscales ef
    where ef.creada_por = new.user_id and ef.tipo = 'persona_fisica';
  end if;

  if v_entidad_id is null then
    raise exception 'No existe una entidad fiscal válida para el usuario y negocio indicados';
  end if;

  new.entidad_fiscal_id := v_entidad_id;
  return new;
end;
$$;

revoke all on function public.asignar_entidad_fiscal_registro() from public, anon, authenticated;

create trigger trg_facturas_asignar_entidad
before insert or update of user_id, negocio_id on public.facturas
for each row execute function public.asignar_entidad_fiscal_registro();

create trigger trg_ingresos_asignar_entidad
before insert or update of user_id, negocio_id on public.ingresos_mensuales
for each row execute function public.asignar_entidad_fiscal_registro();

alter table public.entidades_fiscales enable row level security;
alter table public.entidad_usuarios enable row level security;

create policy entidades_fiscales_miembro_select
on public.entidades_fiscales for select to authenticated
using (
  exists (
    select 1 from public.entidad_usuarios eu
    where eu.entidad_fiscal_id = id and eu.user_id = (select auth.uid())
  )
);

create policy entidad_usuarios_self_select
on public.entidad_usuarios for select to authenticated
using (user_id = (select auth.uid()));

grant select on public.entidades_fiscales to authenticated;
grant select on public.entidad_usuarios to authenticated;

drop trigger if exists trg_entidades_fiscales_updated_at on public.entidades_fiscales;
create trigger trg_entidades_fiscales_updated_at
before update on public.entidades_fiscales
for each row execute function public.set_updated_at();

commit;
