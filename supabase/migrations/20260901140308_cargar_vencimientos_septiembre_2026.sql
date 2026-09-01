begin;

-- Las fechas detectadas anteriormente desde una fuente secundaria se
-- conservan para auditoría, pero no deben competir con el calendario oficial.
update public.vencimientos_fiscales
set estado = 'rechazado', pendiente = true, verificado = false,
    titulo = titulo || ' [fuente secundaria descartada]'
where anio = 2026 and mes = 9 and estado = 'borrador';

-- Permite volver a ejecutar esta migración de datos sin duplicar el mes.
delete from public.vencimientos_fiscales
where anio = 2026 and mes = 9
  and fuente = 'https://www.arca.gob.ar/vencimientos/';

insert into public.vencimientos_fiscales (
  mes, anio, titulo, descripcion, categoria, tipo, dia, rango,
  pendiente, verificado, estado, version, fuente_nombre, fuente, verificado_at
) values
(
  9, 2026, 'Autónomos — aportes previsionales agosto 2026',
  'Pago mensual según terminación de CUIT: 0-1-2-3 el 7/09; 4-5-6 el 8/09; 7-8-9 el 9/09.',
  array['autonomo'], 'pago', null, '7, 8 y 9',
  false, true, 'validado', 20260901, 'ARCA',
  'https://www.arca.gob.ar/vencimientos/', now()
),
(
  9, 2026, 'Empleadores — declaración jurada y pago F.931',
  'Período agosto 2026 según terminación de CUIT: 0-1-2-3 el 9/09; 4-5-6 el 10/09; 7-8-9 el 11/09.',
  array['empleador'], 'declaracion', null, '9, 10 y 11',
  false, true, 'validado', 20260901, 'ARCA',
  'https://www.arca.gob.ar/vencimientos/', now()
),
(
  9, 2026, 'Casas particulares — pago obligatorio F.102/RT',
  'Pago obligatorio para empleadores de casas particulares correspondiente al período agosto 2026.',
  array['empleador'], 'pago', 10, null,
  false, true, 'validado', 20260901, 'ARCA',
  'https://www.arca.gob.ar/vencimientos/', now()
),
(
  9, 2026, 'Casas particulares — pago voluntario F.575/RT',
  'Pago voluntario de aportes para trabajadores de casas particulares correspondiente al período agosto 2026.',
  array['empleador'], 'pago', 15, null,
  false, true, 'validado', 20260901, 'ARCA',
  'https://www.arca.gob.ar/vencimientos/', now()
),
(
  9, 2026, 'IVA y Libro de IVA Digital — agosto 2026',
  'Presentación y pago según terminación de CUIT: 0-1 el 18/09; 2-3 el 21/09; 4-5 el 22/09; 6-7 el 23/09; 8-9 el 24/09.',
  array['responsable'], 'declaracion', null, '18, 21, 22, 23 y 24',
  false, true, 'validado', 20260901, 'ARCA',
  'https://www.arca.gob.ar/vencimientos/', now()
),
(
  9, 2026, 'Monotributo — cuota septiembre 2026',
  'Pago mensual para todas las terminaciones de CUIT. El día 20 es domingo, por lo que vence el siguiente día hábil.',
  array['monotributo'], 'pago', 21, null,
  false, true, 'validado', 20260901, 'ARCA',
  'https://www.arca.gob.ar/vencimientos/', now()
),
(
  9, 2026, 'Ganancias 2025 — presentación de declaración jurada',
  'Plazo especial para personas humanas y sucesiones indivisas. La presentación vence el 22/09/2026; no modifica el vencimiento del saldo de pago.',
  array['autonomo','responsable'], 'presentacion', 22, null,
  false, true, 'validado', 20260901, 'ARCA',
  'https://www.arca.gob.ar/gananciasYBienes/ganancias/personas-humanas-sucesiones-indivisas/declaracion-jurada/determinativa/vencimientos.asp', now()
);

commit;
