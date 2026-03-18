# HMS Schema Map

This is the compact project-specific database map derived from the live Supabase schema.

## Patient and visit

### `patient`

- `patient_id` PK
- `patient_name`
- `age`
- `gender`
- `contact_number`
- `cnic`
- `address`
- `created_at`

### `visit`

- `visit_id` PK
- `patient_id` FK -> `patient`
- `doctor_id` FK -> `doctor`
- `visit_timestamp`
- `visit_type` check: `OPD`, `Emergency`
- `clinic_number`
- `status` check: visit workflow values
- `reason`
- `is_deleted`

### `patient_vitals`

- `visit_id` is unique
- includes `blood_pressure`, `heart_rate`, `temperature`, `weight`, `height`, `blood_group`, `recorded_at`

### `visit_status_history`

- `visit_id` FK -> `visit`
- `status`
- `updated_by_doctor` FK -> `doctor`
- `updated_by_staff` FK -> `staff`
- `updated_at`

## OB/GYN

### `menstrual_history`

- patient-linked menstrual and gynecologic history

### `obstetric_history`

- `patient_id` is unique
- includes `is_first_pregnancy`, `married_years`, `gravida`, `para`, `abortions`, `edd`, `last_menstrual_cycle`, `notes`

### `para_details`

- child rows under `obstetric_history`
- includes `birth_year`, `birth_month`, `alive`, `delivery_type`, `birth_weight_grams`, `gestational_age_weeks`

### `current_pregnancy`

- patient + visit-linked active pregnancy record

## Pharmacy

### `medicine`

- master medicine record
- supports search vector and sub-unit sale configuration

### `medicine_batch`

- batch-level price, expiry, and stock state

### `medicine_transaction`

- unified ledger for purchase/sale/return/adjustment movements

### Sales and returns

- `pharmacy_sale`
- `pharmacy_sale_detail`
- `sale_return`
- `sale_return_detail`

### Purchases and returns

- `medicine_purchase`
- `medicine_purchase_detail`
- `purchase_return`
- `purchase_return_detail`

### POS support

- `pharmacy_customer`
- `pos_audit_log`
- `pos_receipt_config`
- `pos_session`
- `pos_held_transaction`
- `pos_held_transaction_detail`

## Laboratory

- `lab_test`
- `lab_test_parameters`
- `lab_order`
- `lab_test_results`
- `lab_result`
- `lab_result_approvals`

## Billing and users

- `bill`
- `bill_item`
- `doctor`
- `staff`
- `party`

## Views

- `v_medicine_pos`
- `v_low_stock_medicines`
- `v_daily_sales_summary`
