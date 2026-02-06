---
name: hms_database
description: Expert in HMS PostgreSQL database - schema, logic, triggers, and clinical workflows.
---

# HMS Database Expert

You are an expert in the Hospital Management System (HMS) database. You have deep knowledge of the PostgreSQL schema, complex trigger-based business logic, and clinical data structures.

## Trigger & Logic Rules

### 1. Stock Update Chain (CRITICAL)
Pharmacy stock management follows a two-step trigger system. NEVER assume direct updates to the `medicine` table are standard practice.
- **Level 1**: Insert/Update/Delete on Detail tables:
    - `medicine_purchase_detail` -> `tg_purchase_detail_to_txn`
    - `pharmacy_sale_detail` -> `tg_sale_detail_to_txn`
    - `purchase_return_detail` -> `tg_purchase_return_detail_to_txn`
    - `sale_return_detail` -> `tg_sale_return_detail_to_txn`
- **Level 2**: These triggers insert into `medicine_transaction`.
- **Level 3**: The `tg_stockquantity_generic` trigger on `medicine_transaction` executes `fn_tg_stockquantity_generic()` which finalizes the `stock_quantity` and `stock_sub_quantity` in BOTH `medicine` (aggregate) and `medicine_batch` (expiry-specific) tables.

**Always refer to [.agent/skills/hms_database/references/pharmacy_stock_logic.md](file:///home/oops/projects/hms/.agent/skills/hms_database/references/pharmacy_stock_logic.md) for sub-unit math and sign logic.**

### 2. POS Medicine View
The `v_medicine_pos` view provides the data for the Pharmacy POS search. It joins `medicine` with `medicine_batch` to provide batch-level granularity, filtered for non-expired items.
- **Key Columns**: `batch_id`, `batch_number`, `expiry_date`, `batch_sale_price`.

### 3. Search Vector Maintenance
The `medicine` table uses a GIN index on `search_vector`.
- Before any insert or update on `medicine`, the `medicine_search_vector_trigger` executes `medicine_search_vector_update()`.
- This combines `generic_name`, `brand_name`, and `category` into a searchable `tsvector`.

### 3. Lab Parameter Integrity
The `lab_test_parameters` table defines the structure of results.
- `lab_test_results` links back via `parameter_id`.
- Be aware of `is_critical` flags and `reference_range_min/max` for automated flagging.
- **Reference**: [.agent/skills/hms_database/references/lab_parameter_schema.md](file:///home/oops/projects/hms/.agent/skills/hms_database/references/lab_parameter_schema.md)

## Knowledge & Source of Truth

**ACTUAL DB STATE REPRESENTED IN**: [.agent/skills/hms_database/references/complete_schema_map.md](file:///home/oops/projects/hms/.agent/skills/hms_database/references/complete_schema_map.md)

### 1. Mandatory Schema Lookup
Before answering any question about database structure, column names, or relationships, YOU MUST:
1. Load and read `complete_schema_map.md`.
2. Do NOT assume presence of columns like `id` vs `table_id` without checking the map.
3. If specific constraints or default values are needed, cross-reference with [db_structure.sql](file:///home/oops/projects/hms/db_structure.sql).

### 2. Standard Logic Triggers
The schema uses automated triggers for state management:
- **Stock Updates**: Multi-step flow (Detail -> Transaction -> Medicine). Refer to `pharmacy_stock_logic.md`.
- **Search Vectors**: `medicine_search_vector_update` handles text search indexes.

### 3. Progressive Disclosure Deep-Dives
- [pharmacy_stock_logic.md](file:///home/oops/projects/hms/.agent/skills/hms_database/references/pharmacy_stock_logic.md): Inventory math.
- [lab_parameter_schema.md](file:///home/oops/projects/hms/.agent/skills/hms_database/references/lab_parameter_schema.md): Lab parameter/result links.
- [patient_visit_audit.md](file:///home/oops/projects/hms/.agent/skills/hms_database/references/patient_visit_audit.md): Patient registration and clinical history states.
