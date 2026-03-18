# HMS Database Reference

This document summarizes the live Supabase `public` schema verified from project `vqhlyxhnjjipypzqfpiu`.

## Object Counts

- Tables: `38`
- Functions: `11` signatures across `9` unique names
- Procedures: `1`
- Triggers: `6`
- Views: `3`

## Main Table Groups

### Patient and Visit

- `patient`
- `visit`
- `patient_vitals`
- `visit_status_history`

Important constraints:

- `visit.visit_type` is limited to `OPD` or `Emergency`
- `visit.status` supports `waiting`, `seen_by_doctor`, `medicines_dispensed`, `lab_tests_done`, `payment_done`, `completed`, `admitted`, `discharged`
- `patient_vitals.visit_id` is unique

### Staff and Clinical Users

- `doctor`
- `staff`

### OB/GYN Clinical History

- `menstrual_history`
- `obstetric_history`
- `para_details`
- `current_pregnancy`

Notable live shape:

- `obstetric_history.patient_id` is unique
- `current_pregnancy.visit_id` is unique
- `para_details` includes `birth_month`, `alive`, `notes`, and `gestational_age_weeks`

### Prescriptions

- `prescription`
- `prescription_medicines`

### Laboratory

- `lab_test`
- `lab_test_parameters`
- `lab_order`
- `lab_test_results`
- `lab_result`
- `lab_result_approvals`

Important live behavior:

- `lab_order.status`: `Pending`, `Performed`, `Completed`
- `lab_order.urgency`: `STAT`, `Urgent`, `Routine`, `Timed`
- `lab_test_parameters` supports structured numeric/text/reference-based entry

### Pharmacy and Inventory

- `medicine`
- `medicine_batch`
- `medicine_transaction`
- `medicine_purchase`
- `medicine_purchase_detail`
- `purchase_return`
- `purchase_return_detail`
- `pharmacy_sale`
- `pharmacy_sale_detail`
- `sale_return`
- `sale_return_detail`
- `pharmacy_customer`
- `party`

Important live behavior:

- `medicine` supports sub-unit sales with `sub_unit`, `sub_units_per_unit`, `sub_unit_price`, `allow_sub_unit_sale`
- `medicine_transaction.txn_type`: `purchase`, `sale`, `purchase_return`, `sale_return`, `adjustment`
- `pharmacy_sale.visit_id` is nullable, allowing OTC sales without a patient visit

### POS and Billing

- `bill`
- `bill_item`
- `pos_audit_log`
- `pos_receipt_config`
- `pos_session`
- `pos_held_transaction`
- `pos_held_transaction_detail`

Observed live semantics:

- `pos_audit_log` contains real `SALE_COMPLETED`, `RECEIPT_PRINTED`, and `CASH_DRAWER_OPENED` events
- `pharmacy_sale` contains completed cash sales with payment reference, paid/due/change amounts

## Functions and Procedure

### Functions

- `check_stock_available(required_medicine_id integer, required_quantity integer, required_sub_quantity integer)`
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

### Procedure

- `update_and_log_visit_status(IN p_visit_id integer, IN p_status varchar, IN p_updated_by_doctor integer, IN p_updated_by_staff integer)`

## Triggers

- `medicine_search_vector_trigger` on `medicine` before insert/update
- `tg_purchase_detail_to_txn` on `medicine_purchase_detail` after insert/update/delete
- `tg_sale_detail_to_txn` on `pharmacy_sale_detail` after insert/update/delete
- `tg_purchase_return_detail_to_txn` on `purchase_return_detail` after insert/update/delete
- `tg_sale_return_detail_to_txn` on `sale_return_detail` after insert/update/delete
- `tg_stockquantity_generic` on `medicine_transaction` after insert/update/delete

## Views

### `v_medicine_pos`

POS-facing medicine view joining `medicine` and `medicine_batch` for active, non-expired stock. Includes:

- aggregate total stock across batches
- batch-specific stock and pricing
- sub-unit sale support

### `v_low_stock_medicines`

Uses active medicines plus aggregated non-expired batch stock and `get_stock_display(...)` to surface reorder candidates.

### `v_daily_sales_summary`

Aggregates completed pharmacy sales by date with totals for:

- total transactions
- total sales
- discounts
- cash sales
- card sales
- prescription sales
- OTC sales

## Important Business Logic

### Inventory trigger chain

1. Detail rows are written in purchase/sale/return detail tables.
2. Trigger bridge functions mirror those rows into `medicine_transaction`.
3. `fn_tg_stockquantity_generic()` normalizes whole-unit and sub-unit math.
4. Stock is updated in both `medicine` and `medicine_batch`.

### Visit status auditing

The intended authoritative path is `update_and_log_visit_status(...)`, which updates the current visit state and appends to `visit_status_history`.

### Search vectors

`medicine_search_vector_update()` maintains the medicine full-text search vector used by POS search.

## Migration Baseline

Supabase currently reports one migration:

- `20260303185544_fix_sale_return_detail_trigger`
