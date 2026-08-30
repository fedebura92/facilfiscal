# Supabase database workflow

This directory is the source of truth for FacilFiscal database changes.

## Files

- `../supabase-schema-final.sql`: validated structural baseline for a new empty project.
- `migrations/`: ordered changes applied after the baseline.
- `../lib/database.types.ts`: TypeScript types generated from the live schema.

The baseline creates structure only. It intentionally excludes private user data and time-sensitive fiscal values. Fiscal amounts, alerts and deadlines must be loaded through dated, reviewed migrations that include their source and validity period.

## Rules for future changes

1. Create every schema change as a new migration.
2. Never edit an already-applied migration.
3. Apply the migration to Supabase.
4. Run Supabase security and performance advisors.
5. Regenerate `lib/database.types.ts`.
6. Verify the Vercel preview before merging.

## Current production baseline

The canonical baseline was generated from the live FacilFiscal project and transactionally validated on 2026-08-30. The first tracked production migration is:

`20260830222008_harden_rls_and_internal_functions.sql`

The historical `public.users` table remains intentionally isolated by RLS because it is still used for email subscriptions and `email_logs`. It must not be removed until those references are migrated.
