# Comprehensive HMS Database Schema Map

This document serves as the absolute source of truth for the Hospital Management System (HMS) database structure. Every table, column, and relationship is mapped here.

---

## 1. Core Patient & Visit Data

### `patient`
- `patient_id` (integer, PK, Serial)
- `patient_name` (varchar(50), NOT NULL)
- `age` (integer)
- `gender` (varchar(20))
- `contact_number` (varchar(20))
- `cnic` (varchar(20), UNIQUE)
- `address` (text)
- `created_at` (timestamp, DEFAULT NOW())

### `patient_vitals`
- `vital_id` (integer, PK, Serial)
- `visit_id` (integer, FK -> `visit.visit_id`, UNIQUE, ON DELETE CASCADE)
- `blood_pressure` (varchar(20))
- `heart_rate` (integer)
- `temperature` (numeric(4,1))
- `weight` (numeric(5,2))
- `height` (numeric(5,2))
- `recorded_at` (timestamp, DEFAULT NOW())
- `blood_group` (varchar(5))

### `visit`
- `visit_id` (integer, PK, Serial)
- `patient_id` (integer, FK -> `patient.patient_id`)
- `doctor_id` (integer, FK -> `doctor.doctor_id`)
- `visit_timestamp` (timestamp, DEFAULT NOW())
- `visit_type` (varchar(50), CHECK: OPD, Emergency)
- `clinic_number` (integer)
- `status` (varchar(50), CHECK: waiting, seen_by_doctor, ..., discharged)
- `reason` (text)
- `is_deleted` (boolean, DEFAULT false)

### `visit_status_history`
- `visit_status_id` (integer, PK, Serial)
- `visit_id` (integer, FK -> `visit.visit_id`, ON DELETE CASCADE)
- `status` (varchar(100))
- `updated_by_doctor` (integer, FK -> `doctor.doctor_id`)
- `updated_by_staff` (integer, FK -> `staff.staff_id`)
- `updated_at` (timestamp, DEFAULT NOW())

---

## 2. Pharmacy & Inventory

### `medicine`
- `medicine_id` (integer, PK, Serial)
- `generic_name` (varchar(255), NOT NULL)
- `brand_name` (varchar(255), NOT NULL)
- `category` (varchar(100))
- `dosage_value` (numeric(10,2))
- `dosage_unit` (varchar(20))
- `form` (varchar(50))
- `stock_quantity` (integer, DEFAULT 0)
- `price` (numeric(10,2), NOT NULL)
- `barcode` (varchar(100), UNIQUE)
- `sku` (varchar(100), UNIQUE)
- `manufacturer` (varchar(255))
- `min_stock_level` (integer)
- `max_stock_level` (integer)
- `is_active` (boolean, DEFAULT true)
- `requires_prescription` (boolean, DEFAULT false)
- `sub_unit` (varchar(20))
- `sub_units_per_unit` (integer)
- `sub_unit_price` (numeric(10,2))
- `allow_sub_unit_sale` (boolean, DEFAULT false)
- `stock_sub_quantity` (integer, DEFAULT 0)
- `search_vector` (tsvector, GIN Index)

### `medicine_transaction`
- `txn_id` (integer, PK, Serial)
- `medicine_id` (integer, FK -> `medicine.medicine_id`)
- `txn_type` (varchar(20), CHECK: purchase, sale, purchase_return, sale_return, adjustment)
- `quantity` (integer)
- `sub_quantity` (integer, DEFAULT 0)
- `amount_per_unit` (numeric(10,2))
- `ref_purchase_id` (integer, FK -> `medicine_purchase.purchase_id`)
- `ref_sale_id` (integer, FK -> `pharmacy_sale.sale_id`)
- `ref_purchase_return` (integer, FK -> `purchase_return.return_id`)
- `ref_sale_return` (integer, FK -> `sale_return.return_id`)
- `created_at` (timestamp, DEFAULT NOW())
- `batch_id` (integer, FK -> `medicine_batch.batch_id`)

### `pharmacy_sale`
- `sale_id` (integer, PK, Serial)
- `visit_id` (integer, FK -> `visit.visit_id`)
- `bill_id` (integer, FK -> `bill.bill_id`)
- `sale_timestamp` (timestamp, DEFAULT NOW())
- `handled_by` (integer, FK -> `staff.staff_id`)
- `total_amount` (numeric(10,2))
- `status` (varchar(20), DEFAULT 'Completed')
- `payment_type` (varchar(20))
- `paid_amount` (numeric(10,2))
- `due_amount` (numeric(10,2))
- `discount_amount` (numeric(10,2))
- `customer_id` (integer, FK -> `pharmacy_customer.customer_id`)

### `pharmacy_sale_detail`
- `pharmacy_sale_detail_id` (integer, PK, Serial)
- `sale_id` (integer, FK -> `pharmacy_sale.sale_id`)
- `medicine_id` (integer, FK -> `medicine.medicine_id`)
- `quantity` (integer)
- `unit_sale_price` (numeric(10,2))
- `line_total` (numeric(10,2))
- `sub_quantity` (integer, DEFAULT 0)
- `batch_id` (integer, FK -> `medicine_batch.batch_id`)

---

## 3. Laboratory System

### `lab_test`
- `test_id` (integer, PK, Serial)
- `test_name` (varchar(100), NOT NULL)
- `category` (varchar(50))
- `price` (numeric(10,2))
- `description` (text)

### `lab_test_parameters`
- `parameter_id` (integer, PK, Serial)
- `test_id` (integer, FK -> `lab_test.test_id`)
- `parameter_name` (varchar(100))
- `parameter_code` (varchar(50), UNIQUE with `test_id`)
- `unit` (varchar(20))
- `input_type` (varchar(20), CHECK: number, text, select)
- `reference_range_min` (numeric(10,2))
- `reference_range_max` (numeric(10,2))
- `is_critical` (boolean)
- `is_required` (boolean)

### `lab_order`
- `order_id` (integer, PK, Serial)
- `visit_id` (integer, FK -> `visit.visit_id`)
- `test_id` (integer, FK -> `lab_test.test_id`)
- `ordered_by` (integer, FK -> `doctor.doctor_id`)
- `performed_by` (integer, FK -> `staff.staff_id`)
- `status` (varchar(20), CHECK: Pending, Performed, Completed)
- `created_at` (timestamp, DEFAULT NOW())

---

## 4. Specialized Clinical Data (OB/GYN)

### `obstetric_history`
- `obstetric_history_id` (integer, PK, Serial)
- `patient_id` (integer, FK -> `patient.patient_id`, UNIQUE)
- `married_years` (integer)
- `gravida` (integer)
- `para` (integer)
- `abortions` (integer)
- `edd` (date)

### `current_pregnancy`
- `pregnanacy_id` (integer, PK, Serial)
- `patient_id` (integer, FK -> `patient.patient_id`)
- `visit_id` (integer, FK -> `visit.visit_id`, UNIQUE)
- `fetal_heart_rate_bpm` (integer)
- `gestational_age_weeks` (integer)

---

## 5. Billing & Staff

### `bill`
- `bill_id` (integer, PK, Serial)
- `patient_id` (integer, FK -> `patient.patient_id`)
- `visit_id` (integer, FK -> `visit.visit_id`)
- `total_amount` (numeric(10,2))
- `payment_status` (varchar(20), CHECK: Paid, Unpaid, Partial)

### `staff`
- `staff_id` (integer, PK, Serial)
- `user_code` (varchar(50), NOT NULL)
- `name` (varchar(50), NOT NULL)
- `role` (varchar(50), CHECK: Receptionist, Pharmacist, Lab_Technician, Admin, Cashier, Nurse)
- `contact_number` (varchar(20))

---

## 6. Functions & Procedures

### Functions
- `check_stock_available(p_medicine_id, p_qty, p_sub_qty)`: Validates if enough stock exists before a transaction.
- `fn_tg_purchase_detail_to_txn()`: Trigger function to sync purchases to `medicine_transaction`.
- `fn_tg_sale_detail_to_txn()`: Trigger function to sync sales to `medicine_transaction`.
- `fn_tg_purchase_return_detail_to_txn()`: Trigger function to sync purchase returns to `medicine_transaction`.
- `fn_tg_sale_return_detail_to_txn()`: Trigger function to sync sale returns to `medicine_transaction`.
- `fn_tg_stockquantity_generic()`: core inventory math; updates `medicine` table from `medicine_transaction`.
- `get_clinic_number()`: Generates daily sequential OPD tokens.
- `get_stock_display(p_medicine_id)`: Formats stock into a human-readable string (e.g., "10 Tabs + 5 ml").
- `medicine_search_vector_update()`: Updates the `search_vector` column for full-text search.

### Stored Procedures
- `update_and_log_visit_status(p_visit_id, p_new_status, p_updated_by_doctor, p_updated_by_staff)`: Atomic status update with history logging.

---

## 7. Triggers

### Medicine Search
- `medicine_search_vector_trigger`: `BEFORE INSERT OR UPDATE` on `medicine`. Executes `medicine_search_vector_update()`.

### Inventory Sync (Level 1)
- `tg_purchase_detail_to_txn`: `AFTER INSERT OR DELETE OR UPDATE` on `medicine_purchase_detail`.
- `tg_purchase_return_detail_to_txn`: `AFTER INSERT OR DELETE OR UPDATE` on `purchase_return_detail`.
- `tg_sale_detail_to_txn`: `AFTER INSERT OR DELETE OR UPDATE` on `pharmacy_sale_detail`.
- `tg_sale_return_detail_to_txn`: `AFTER INSERT OR DELETE OR UPDATE` on `sale_return_detail`.

### Global Inventory Update (Level 2)
- `tg_stockquantity_generic`: `AFTER INSERT OR DELETE OR UPDATE` on `medicine_transaction`. Executes `fn_tg_stockquantity_generic()`.

---

## Key Relations Summary (Foreign Keys)
- **Visit Centric**: `bill`, `lab_order`, `patient_vitals`, `pharmacy_sale`, `prescription` all link to `visit`.
- **Patient Centric**: `visit`, `obstetric_history`, `menstrual_history` link to `patient`.
- **Medicine Centric**: `medicine_transaction`, `pharmacy_sale_detail`, `medicine_purchase_detail` link to `medicine`.
