begin;

alter table public.users drop constraint if exists users_email_key;
alter table public.users add column if not exists dias_anticipacion integer not null default 3 check (dias_anticipacion in (1,3,7));
alter table public.vencimientos_fiscales add column if not exists fechas_por_terminacion jsonb;
alter table public.email_logs
  add column if not exists vencimiento_fiscal_id uuid references public.vencimientos_fiscales(id) on delete set null,
  add column if not exists dias_antes integer,
  add column if not exists provider_id text;

create index if not exists email_logs_vencimiento_fiscal_idx on public.email_logs(vencimiento_fiscal_id);
create unique index if not exists email_logs_alerta_fiscal_no_dup
  on public.email_logs(email,tipo_email,vencimiento_fiscal_id,dias_antes)
  where error is null and vencimiento_fiscal_id is not null;
create unique index if not exists email_logs_resumen_semanal_no_dup
  on public.email_logs(email,tipo_email,fecha_envio)
  where error is null and tipo_email='resumen_semanal';

update public.users u set terminacion_cuit=p.terminacion_cuit
from public.profiles p
where lower(u.email)=lower(p.email) and u.terminacion_cuit is null and p.terminacion_cuit is not null;

update public.vencimientos_fiscales set fechas_por_terminacion='{"0":7,"1":7,"2":7,"3":7,"4":8,"5":8,"6":8,"7":9,"8":9,"9":9}'::jsonb
where anio=2026 and mes=9 and titulo='Autónomos — aportes previsionales agosto 2026';
update public.vencimientos_fiscales set fechas_por_terminacion='{"0":18,"1":18,"2":21,"3":21,"4":22,"5":22,"6":23,"7":23,"8":24,"9":24}'::jsonb
where anio=2026 and mes=9 and titulo='IVA y Libro de IVA Digital — agosto 2026';
update public.vencimientos_fiscales set fechas_por_terminacion='{"0":9,"1":9,"2":9,"3":9,"4":10,"5":10,"6":10,"7":11,"8":11,"9":11}'::jsonb
where anio=2026 and mes=9 and titulo='Empleadores — declaración jurada y pago F.931';

commit;
