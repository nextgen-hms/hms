# HMS

Hospital Management System for reception, doctor consultation, laboratory workflow, and pharmacy/POS operations.

## Current Baseline

- Frontend: Next.js `16.1.6`, React `19.1.0`, TypeScript `5`
- Styling/UI: Tailwind CSS `4`, Radix UI primitives, Lucide icons, `react-hot-toast`
- Backend: Next.js route handlers with direct `pg` access
- Database: Supabase PostgreSQL `17.6.1`
- Auth: JWT cookie auth with role checks in `src/middleware.ts`

## Verified Database Scope

The live `public` schema currently contains:

- `38` tables
- `11` function signatures across `9` unique function names
- `1` procedure
- `6` triggers
- `3` views: `v_daily_sales_summary`, `v_low_stock_medicines`, `v_medicine_pos`

Core routines:

- `check_stock_available(required_medicine_id, required_quantity, required_sub_quantity)`
- `fn_tg_purchase_detail_to_txn()`
- `fn_tg_purchase_return_detail_to_txn()`
- `fn_tg_sale_detail_to_txn()`
- `fn_tg_sale_return_detail_to_txn()`
- `fn_tg_stockquantity_generic()`
- `get_clinic_number()`
- `get_clinic_number(p_patient_id integer)`
- `get_clinic_number(p_visit_type text)`
- `get_stock_display(p_medicine_id integer)`
- `medicine_search_vector_update()`
- `update_and_log_visit_status(...)` as a stored procedure

## Product Areas

- Reception: patient registration, visit creation, queue handling, vitals, OB/GYN clinical forms
- Doctor: queue view, patient details, prescriptions, lab ordering, past visits
- Lab: lab orders and result entry workflows
- Pharmacy: OTC/POS sales, purchase intake, returns, receipt/audit actions

## Architecture Notes

- The project is feature-organized under `src/features/*`.
- App routes and dashboards live under `src/app/*` and use parallel route layouts for role-specific workspaces.
- The database is the intended source of truth for inventory movement and visit-status auditing.
- Some route handlers still perform direct table updates instead of consistently delegating to stored procedures/triggers. Contributors should verify database, backend, and frontend together before changing behavior.

## Key Paths

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [DATABASE.md](./DATABASE.md)
- [documentation/README.md](./documentation/README.md)
- [.agents/skills/hms-dev/SKILL.md](./.agents/skills/hms-dev/SKILL.md)

## Local Setup

1. Install dependencies:

```bash
pnpm install
```

2. Create `.env.local`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/hms
secret_key=replace-me
```

3. Load schema and optional seed data:

```bash
psql -d hms -f db_structure.sql
psql -d hms -f seed_data.sql
```

4. Start the app:

```bash
pnpm dev
```

## Documentation Status

The hand-written docs in this repo have been aligned to the current codebase and live Supabase schema. Generated HTML under `docs/` is treated as derived output and is not the canonical source.
