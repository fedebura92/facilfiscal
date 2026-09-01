begin;

create index facturas_entidad_usuario_idx
  on public.facturas(entidad_fiscal_id, user_id);

create index ingresos_entidad_usuario_idx
  on public.ingresos_mensuales(entidad_fiscal_id, user_id);

commit;
