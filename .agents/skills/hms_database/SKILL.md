---
name: hms_database
description: Expert in the live HMS PostgreSQL schema, trigger logic, POS semantics, and clinical table relationships.
---

# HMS Database Expert

Use this skill for any HMS database question. It is tied to the live Supabase schema, not to assumptions from old docs.

## Mandatory Lookup Rule

Before answering schema questions:

1. Check the live database when available
2. Otherwise check [complete_schema_map.md](./references/complete_schema_map.md)
3. Use local SQL only as a secondary source

## Critical Logic

### Inventory trigger chain

- `medicine_purchase_detail` -> `tg_purchase_detail_to_txn`
- `pharmacy_sale_detail` -> `tg_sale_detail_to_txn`
- `purchase_return_detail` -> `tg_purchase_return_detail_to_txn`
- `sale_return_detail` -> `tg_sale_return_detail_to_txn`
- all roads lead to `medicine_transaction`
- `tg_stockquantity_generic` then updates both `medicine` and `medicine_batch`

Reference:

- [pharmacy_stock_logic.md](./references/pharmacy_stock_logic.md)

### Search vectors

- `medicine_search_vector_trigger` runs before insert/update on `medicine`
- `medicine_search_vector_update()` maintains `search_vector`

### Visit status auditing

- authoritative procedure: `update_and_log_visit_status(...)`
- `visit_status_history` stores the audit trail

### Lab structure

- `lab_test_parameters` defines the shape of result entry
- `lab_test_results` stores parameter-level values
- `lab_order`, `lab_result`, and `lab_result_approvals` support workflow state

Reference:

- [lab_parameter_schema.md](./references/lab_parameter_schema.md)
- [patient_visit_audit.md](./references/patient_visit_audit.md)

## Known Live Facts

- public schema contains `38` tables, `11` function signatures across `9` names, `1` procedure, `6` triggers, `3` views
- three overloaded `get_clinic_number(...)` functions exist
- POS tables contain real sample activity
- many clinical tables are structurally present but sparsely populated
