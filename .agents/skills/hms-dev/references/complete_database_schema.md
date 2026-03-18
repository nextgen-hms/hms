# HMS Complete Database Schema Reference

Verified from live Supabase project `vqhlyxhnjjipypzqfpiu`.

## Counts

- Tables: `38`
- Functions: `11` signatures across `9` unique names
- Procedure: `1`
- Triggers: `6`
- Views: `3`

## Core table groups

### Patient lifecycle

- `patient`
- `visit`
- `patient_vitals`
- `visit_status_history`
- `bill`
- `bill_item`

### Clinical detail

- `menstrual_history`
- `obstetric_history`
- `para_details`
- `current_pregnancy`
- `prescription`
- `prescription_medicines`

### Laboratory

- `lab_test`
- `lab_test_parameters`
- `lab_order`
- `lab_test_results`
- `lab_result`
- `lab_result_approvals`

### Pharmacy and POS

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
- `pos_audit_log`
- `pos_receipt_config`
- `pos_session`
- `pos_held_transaction`
- `pos_held_transaction_detail`

### Users

- `doctor`
- `staff`

## Important live routines

- `check_stock_available(...)`
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
- `update_and_log_visit_status(...)`

## Important views

- `v_medicine_pos`
- `v_low_stock_medicines`
- `v_daily_sales_summary`

## Notes

- `pharmacy_sale.visit_id` can be null for OTC retail
- sub-unit sales are first-class in the live schema
- many clinical tables are currently low-volume or empty in live data; structure is verified, usage density is not
