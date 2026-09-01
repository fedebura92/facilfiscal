-- Mantiene la entidad fiscal personal alineada con Mi Perfil. El perfil es
-- la pantalla de edición; entidades_fiscales es la identidad normalizada que
-- consumen obligaciones, vencimientos, facturas e ingresos.
create or replace function public.sincronizar_entidad_fiscal_personal()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, pg_temp
as $$
declare
  entidad_id uuid;
  cuit_normalizado text;
begin
  cuit_normalizado := regexp_replace(coalesce(new.cuit, ''), '[^0-9]', '', 'g');
  if cuit_normalizado !~ '^[0-9]{11}$' then
    cuit_normalizado := null;
  end if;

  insert into public.entidades_fiscales (
    creada_por, tipo, nombre, cuit, terminacion_cuit, regimen_fiscal,
    provincia, localidad, updated_at
  ) values (
    new.id,
    'persona_fisica',
    coalesce(nullif(new.nombre, ''), 'Situación personal'),
    cuit_normalizado,
    coalesce(right(cuit_normalizado, 1), new.terminacion_cuit),
    case when new.situacion_fiscal in ('mono','ri','exento','no_inscripto','no_se')
      then new.situacion_fiscal else null end,
    new.provincia,
    new.localidad,
    now()
  )
  on conflict (creada_por) where tipo = 'persona_fisica'
  do update set
    nombre = excluded.nombre,
    cuit = excluded.cuit,
    terminacion_cuit = excluded.terminacion_cuit,
    regimen_fiscal = excluded.regimen_fiscal,
    provincia = excluded.provincia,
    localidad = excluded.localidad,
    estado = 'activa',
    updated_at = now()
  returning id into entidad_id;

  insert into public.entidad_usuarios (
    entidad_fiscal_id, user_id, relacion, permiso, updated_at
  ) values (
    entidad_id, new.id, 'titular', 'administrar', now()
  ) on conflict (entidad_fiscal_id, user_id)
  do update set relacion = 'titular', permiso = 'administrar', updated_at = now();

  return new;
end;
$$;

revoke all on function public.sincronizar_entidad_fiscal_personal() from public;
revoke all on function public.sincronizar_entidad_fiscal_personal() from anon;
revoke all on function public.sincronizar_entidad_fiscal_personal() from authenticated;

drop trigger if exists profiles_sincronizar_entidad_fiscal on public.profiles;
create trigger profiles_sincronizar_entidad_fiscal
after insert or update of nombre, cuit, terminacion_cuit, situacion_fiscal, provincia, localidad
on public.profiles
for each row execute function public.sincronizar_entidad_fiscal_personal();
