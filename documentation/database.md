# HMS Database

Live database: Supabase project `vqhlyxhnjjipypzqfpiu`, PostgreSQL `17.6.1`.

## Summary

- `38` tables
- `11` function signatures across `9` unique function names
- `1` procedure
- `6` triggers
- `3` views

## Core Domains

### Reception and patient lifecycle

- `patient`
- `visit`
- `patient_vitals`
- `visit_status_history`
- `bill`
- `bill_item`

### OB/GYN clinical details

- `menstrual_history`
- `obstetric_history`
- `para_details`
- `current_pregnancy`

### Doctor ordering

- `prescription`
- `prescription_medicines`
- `lab_order`

### Laboratory

- `lab_test`
- `lab_test_parameters`
- `lab_test_results`
- `lab_result`
- `lab_result_approvals`

### Pharmacy and POS

- `medicine`
- `medicine_batch`
- `medicine_transaction`
- `pharmacy_sale`
- `pharmacy_sale_detail`
- `medicine_purchase`
- `medicine_purchase_detail`
- `sale_return`
- `sale_return_detail`
- `purchase_return`
- `purchase_return_detail`
- `pharmacy_customer`
- `party`
- `pos_audit_log`
- `pos_receipt_config`
- `pos_session`
- `pos_held_transaction`
- `pos_held_transaction_detail`

## Important Constraints

- `patient.gender` is constrained to `Male`, `Female`, `Other`
- `patient_vitals.blood_group` is constrained to ABO/Rh values
- `visit.visit_type` is `OPD` or `Emergency`
- `visit.status` and `visit_status_history.status` use explicit status check constraints
- `lab_order.status` is `Pending`, `Performed`, `Completed`
- `lab_order.urgency` is `STAT`, `Urgent`, `Routine`, `Timed`
- `medicine_transaction.txn_type` is `purchase`, `sale`, `purchase_return`, `sale_return`, `adjustment`

## Routines

See [DATABASE.md](../DATABASE.md) for the full live routine list. The most important are:

- `update_and_log_visit_status(...)`
- `check_stock_available(...)`
- `fn_tg_stockquantity_generic()`
- `get_stock_display(...)`
- `medicine_search_vector_update()`

## Views

- `v_medicine_pos`: POS search and stock/pricing view
- `v_low_stock_medicines`: active low-stock medicines with readable stock display
- `v_daily_sales_summary`: daily completed sales metrics

## Data Reality

The live database currently has sparse clinical/demo data, but pharmacy/POS tables and audit logs contain real sample rows. Documentation should treat POS semantics as observed behavior and many clinical modules as structurally verified but lightly populated.
