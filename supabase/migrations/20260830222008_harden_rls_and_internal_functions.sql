-- Applied to Supabase project FacilFiscal on 2026-08-30.
-- Purpose: harden internal functions, remove duplicate RLS policies,
-- optimize ownership checks, and cover an existing foreign key.
--
-- This migration is data-preserving and idempotent where practical.

begin;

-- Harden internal functions against search_path hijacking.
alter function public.handle_new_user() set search_path = '';
alter function public.update_updated_at() set search_path = '';
alter function public.set_updated_at() set search_path = '';
alter function public.set_email_logs_fecha_envio() set search_path = '';
alter function public.get_vencimientos_proximos(text, integer) set search_path = '';

-- Trigger/event-trigger functions are internal and must not be callable via RPC.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
revoke execute on function public.update_updated_at() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.set_email_logs_fecha_envio() from public, anon, authenticated;

-- Remove duplicated profile policies left by incremental setup.
drop policy if exists "Usuario crea su propio perfil" on public.profiles;
drop policy if exists "Usuario edita su propio perfil" on public.profiles;
drop policy if exists "Usuario ve su propio perfil" on public.profiles;

-- Rebuild ownership policies with init-plan-safe auth lookups.
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists checklist_owner on public.user_checklist;
create policy checklist_owner on public.user_checklist
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists ingresos_owner on public.ingresos_mensuales;
create policy ingresos_owner on public.ingresos_mensuales
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists facturas_owner on public.facturas;
create policy facturas_owner on public.facturas
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists diagnostico_select_own on public.profile_diagnostico;
create policy diagnostico_select_own on public.profile_diagnostico
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists negocio_proyectos_own on public.negocio_proyectos;
create policy negocio_proyectos_own on public.negocio_proyectos
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists negocio_analisis_own on public.negocio_analisis;
create policy negocio_analisis_own on public.negocio_analisis
  for all to authenticated
  using ((select auth.uid()) = (
    select np.user_id from public.negocio_proyectos np
    where np.id = negocio_analisis.proyecto_id
  ))
  with check ((select auth.uid()) = (
    select np.user_id from public.negocio_proyectos np
    where np.id = negocio_analisis.proyecto_id
  ));

drop policy if exists negocio_diagnostico_select_own on public.negocio_diagnostico;
create policy negocio_diagnostico_select_own on public.negocio_diagnostico
  for select to authenticated
  using ((select auth.uid()) = (
    select np.user_id from public.negocio_proyectos np
    where np.id = negocio_diagnostico.proyecto_id
  ));

-- service_role bypasses RLS; this policy only duplicated the public SELECT path.
drop policy if exists "Escritura solo service role" on public.vencimientos_fiscales;

-- Cover the existing foreign key used by email log maintenance.
create index if not exists email_logs_vencimiento_idx
  on public.email_logs(vencimiento_id);

commit;
