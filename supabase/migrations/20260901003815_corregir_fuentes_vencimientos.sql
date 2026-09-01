-- Una fuente secundaria puede orientar, pero no debe aparecer como ARCA ni
-- alimentar automáticamente fechas presentadas como oficiales.
update public.vencimientos_fiscales set
  fuente_nombre = case
    when fuente ~* '^https://(www\.)?(arca|afip)\.gob\.ar/' then 'ARCA'
    when fuente is not null then 'Fuente secundaria'
    else null
  end,
  estado = case
    when fuente ~* '^https://(www\.)?(arca|afip)\.gob\.ar/' and verificado then 'validado'
    else 'borrador'
  end,
  verificado = case
    when fuente ~* '^https://(www\.)?(arca|afip)\.gob\.ar/' then verificado
    else false
  end,
  verificado_at = case
    when fuente ~* '^https://(www\.)?(arca|afip)\.gob\.ar/' and verificado then coalesce(verificado_at, created_at)
    else null
  end;
