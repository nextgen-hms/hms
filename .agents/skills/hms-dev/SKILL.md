---
name: hms-dev
description: Master development skill for the Hospital Management System (HMS). Use for any HMS code, schema, documentation, or refactor task so changes stay aligned across live database, backend routes, and frontend workflows.
---

# HMS Development Master Skill

Use this skill whenever working on HMS. The system has real domain logic in PostgreSQL and notable drift between some route handlers and the intended database-first design.

## Critical Rule: Triple Consistency Check

For any feature or bugfix, verify all three:

1. Database schema, routines, triggers, and constraints
2. Backend route handler SQL and payload shape
3. Frontend types, forms, and UI assumptions

Do not trust a single layer in isolation.

## Verified Project Context

- Frontend: Next.js `16.1.6`, React `19.1.0`
- Database: Supabase PostgreSQL `17.6.1`
- Live schema: `38` tables, `11` function signatures across `9` names, `1` procedure, `6` triggers, `3` views
- Main DB project: `vqhlyxhnjjipypzqfpiu`

## Architectural Facts

- Code is feature-organized under `src/features/*`
- Role workspaces are under `src/app/{doctor,lab,pharmacy,receptionist}`
- Auth uses JWT cookies plus role-based middleware in `src/middleware.ts`
- Inventory integrity depends on DB triggers; do not bypass the `medicine_transaction` chain casually
- Visit status auditing is intended to flow through `update_and_log_visit_status(...)`, but some routes still update tables directly

## Source of Truth Order

When available:

1. Live Supabase schema/data
2. Current application code
3. Local SQL files (`db_structure.sql`, `dump.sql`)
4. Existing docs

## Required References

- [complete_database_schema.md](./references/complete_database_schema.md)
- [ARCHITECTURE.md](../../../ARCHITECTURE.md)
- [DATABASE.md](../../../DATABASE.md)
- [documentation/database.md](../../../documentation/database.md)

## Domain Focus Areas

### Reception and clinical intake

- `patient`, `visit`, `patient_vitals`, `visit_status_history`
- OB/GYN modules: `menstrual_history`, `obstetric_history`, `para_details`, `current_pregnancy`

### Laboratory

- `lab_test`, `lab_test_parameters`, `lab_order`, `lab_test_results`, `lab_result`, `lab_result_approvals`

### Pharmacy and POS

- `medicine`, `medicine_batch`, `medicine_transaction`
- purchase/sale/return detail tables feed stock updates via triggers
- `v_medicine_pos`, `v_low_stock_medicines`, `v_daily_sales_summary`

## Working Rules

- Never assume a column name; check live schema or schema reference
- If code and DB disagree, document the drift before changing behavior
- If a table is structurally present but has sparse live data, state that explicitly instead of inventing semantics
