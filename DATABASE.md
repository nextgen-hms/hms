# Database Documentation

## Overview

This document provides complete technical documentation for the Hospital Management System (HMS) PostgreSQL database. The database contains **29 tables**, **6 functions**, **1 stored procedure**, and **15 triggers** implementing a comprehensive medical and pharmacy management system.

---

## Table of Contents

- [Database Overview](#database-overview)
- [Table Structures](#table-structures)
  - [Patient Management](#patient-management)
  - [Medical Staff](#medical-staff)
  - [Obstetric & Gynecology](#obstetric--gynecology)
  - [Prescriptions](#prescriptions)
  - [Pharmacy & Inventory](#pharmacy--inventory)
  - [Returns Management](#returns-management)
  - [Laboratory](#laboratory)
  - [Billing](#billing)
- [Functions](#functions)
- [Stored Procedures](#stored-procedures)
- [Triggers](#triggers)
- [Data Flow](#data-flow)
- [Business Rules](#business-rules)

---

## Database Overview

**Database Type:** PostgreSQL  
**Total Tables:** 29  
**Total Functions:** 6  
**Total Procedures:** 1  
**Total Triggers:** 15  
**Total Indexes:** 33

### Key Features
- Real-time inventory management via triggers
- Complete audit trails for all transactions
- Automated stock quantity updates
- Soft deletes for data integrity
- Daily clinic number generation

---

## Table Structures

### Patient Management

#### `patient`
Core patient demographic information.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| patient_id | integer | ✓ | nextval('patient_patient_id_seq') | ✓ | Auto-increment primary key |
| patient_name | varchar | ✓ | - | - | Patient's full name |
| age | integer | - | - | - | Patient's age |
| gender | varchar | - | - | - | Patient's gender |
| contact_number | varchar | - | - | - | Phone number |
| cnic | varchar | - | - | - | National ID card number |
| address | text | - | - | - | Residential address |
| created_at | timestamp | - | CURRENT_TIMESTAMP | - | Record creation time |

---

#### `visit`
Records all patient visits and appointments.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| visit_id | integer | ✓ | nextval('visit_visit_id_seq') | ✓ | Auto-increment primary key |
| patient_id | integer | ✓ | - | - | Foreign key to patient |
| doctor_id | integer | ✓ | - | - | Foreign key to doctor |
| visit_timestamp | timestamp | - | CURRENT_TIMESTAMP | - | Visit date/time |
| visit_type | varchar | - | - | - | Type of visit |
| clinic_number | integer | - | - | - | Daily sequential number |
| status | varchar | - | - | - | Current status |
| reason | text | - | - | - | Reason for visit |
| is_deleted | boolean | - | false | - | Soft delete flag |

**Indexes:**
- `visit_pkey` - Primary key on visit_id
- `idx_visit_timestamp` - Performance index on visit_timestamp

---

#### `patient_vitals`
Stores vital signs recorded during visits.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| vital_id | integer | ✓ | nextval('patient_vitals_vital_id_seq') | ✓ | Auto-increment primary key |
| visit_id | integer | ✓ | - | - | Foreign key to visit (UNIQUE) |
| blood_pressure | varchar | - | - | - | Blood pressure reading |
| heart_rate | integer | - | - | - | Heart rate (BPM) |
| temperature | integer | - | - | - | Body temperature |
| weight | integer | - | - | - | Weight in kg |
| height | integer | - | - | - | Height in cm |
| blood_group | varchar | - | - | - | Blood group type |
| recorded_at | timestamp | - | CURRENT_TIMESTAMP | - | Recording timestamp |

**Constraints:**
- `unique_patient_vitals` - One vital record per visit

---

#### `visit_status_history`
Audit trail for visit status changes.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| visit_status_id | integer | ✓ | nextval('visit_status_history_visit_status_id_seq') | ✓ | Auto-increment primary key |
| visit_id | integer | ✓ | - | - | Foreign key to visit |
| status | varchar | - | - | - | New status value |
| updated_by_doctor | integer | - | - | - | Doctor who made the change |
| updated_by_staff | integer | - | - | - | Staff who made the change |
| updated_at | timestamp | - | CURRENT_TIMESTAMP | - | Status change timestamp |

---

### Medical Staff

#### `doctor`
Doctor profiles and credentials.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| doctor_id | integer | ✓ | nextval('doctor_doctor_id_seq') | ✓ | Auto-increment primary key |
| user_code | varchar | ✓ | - | - | Login username |
| password | varchar | ✓ | - | - | Encrypted password |
| doctor_name | varchar | ✓ | - | - | Doctor's full name |
| specialization | varchar | ✓ | - | - | Medical specialization |
| education | varchar | - | - | - | Educational qualifications |
| consultaion_fee | numeric | ✓ | - | - | Standard consultation fee |
| emergency_fee | numeric | ✓ | - | - | Emergency visit fee |
| contact_number | varchar | - | - | - | Phone number |
| email | varchar | - | - | - | Email address |
| created_at | timestamp | - | CURRENT_TIMESTAMP | - | Record creation time |

---

#### `staff`
Staff member profiles.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| staff_id | integer | ✓ | nextval('staff_staff_id_seq') | ✓ | Auto-increment primary key |
| user_code | varchar | ✓ | - | - | Login username |
| password | varchar | ✓ | - | - | Encrypted password |
| name | varchar | ✓ | - | - | Staff member's name |
| role | varchar | - | - | - | Job role/position |
| education | varchar | - | - | - | Educational qualifications |
| contact_number | varchar | - | - | - | Phone number |
| email | varchar | - | - | - | Email address |
| created_at | timestamp | - | CURRENT_TIMESTAMP | - | Record creation time |

---

### Obstetric & Gynecology

#### `current_pregnancy`
Current pregnancy examination records.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| pregnanacy_id | integer | ✓ | nextval('current_pregnancy_pregnanacy_id_seq') | ✓ | Auto-increment primary key |
| patient_id | integer | ✓ | - | - | Foreign key to patient |
| visit_id | integer | ✓ | - | - | Foreign key to visit (UNIQUE) |
| multiple_pregnancy | boolean | - | - | - | Twin/multiple pregnancy flag |
| complications | text | - | - | - | Pregnancy complications |
| ultrasound_findings | text | - | - | - | Ultrasound examination notes |
| fetal_heart_rate_bpm | integer | - | - | - | Fetal heart rate |
| placenta_position | varchar | - | - | - | Placenta location |
| presentation | varchar | - | - | - | Fetal presentation |
| gestational_age_weeks | integer | - | - | - | Weeks of gestation |
| notes | text | - | - | - | Additional notes |

**Constraints:**
- `uniqeue_visit_id_cp` - One pregnancy record per visit

---

#### `menstrual_history`
Patient's menstrual history.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| menstrual_history_id | integer | ✓ | nextval('menstrual_history_menstrual_history_id_seq') | ✓ | Auto-increment primary key |
| patient_id | integer | ✓ | - | - | Foreign key to patient |
| menarch_age | integer | - | - | - | Age at first menstruation |
| cycle_length_days | integer | - | - | - | Typical cycle length |
| bleeding_days | integer | - | - | - | Duration of bleeding |
| menstrual_regular | boolean | - | - | - | Regular cycle indicator |
| contraception_history | text | - | - | - | Contraception usage history |
| gynecologic_surgeries | text | - | - | - | Previous gynecologic surgeries |
| medical_conditions | text | - | - | - | Related medical conditions |
| menopause_status | boolean | - | - | - | Menopause indicator |
| notes | text | - | - | - | Additional notes |

---

#### `obstetric_history`
Patient's pregnancy history summary.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| obstetric_history_id | integer | ✓ | nextval('obstetric_history_obstetric_history_id_seq') | ✓ | Auto-increment primary key |
| patient_id | integer | ✓ | - | - | Foreign key to patient (UNIQUE) |
| is_first_pregnancy | boolean | - | - | - | First pregnancy indicator |
| married_years | integer | - | - | - | Years married |
| gravida | integer | - | - | - | Total pregnancies |
| para | integer | - | - | - | Number of births |
| abortions | integer | - | - | - | Number of abortions |
| edd | date | - | - | - | Expected delivery date |
| last_menstrual_cycle | date | - | - | - | Last menstrual period date |
| notes | text | - | - | - | Additional notes |

**Constraints:**
- `unique_patient_id_obs_history` - One obstetric history per patient

---

#### `para_details`
Detailed information about each pregnancy/birth.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| para_id | integer | ✓ | nextval('para_details_para_id_seq') | ✓ | Auto-increment primary key |
| obstetric_history_id | integer | ✓ | - | - | Foreign key to obstetric_history |
| para_number | integer | - | - | - | Pregnancy number |
| birth_year | integer | - | - | - | Year of birth |
| birth_month | integer | - | - | - | Month of birth |
| gender | varchar | - | - | - | Baby's gender |
| delivery_type | varchar | - | - | - | Delivery method |
| alive | boolean | - | - | - | Baby survival status |
| birth_weight_grams | integer | - | - | - | Birth weight |
| complications | text | - | - | - | Birth complications |
| notes | text | - | - | - | Additional notes |
| gestational_age_weeks | integer | - | - | - | Gestational age at delivery |

**Constraints:**
- `unique_obstetric_para` - Unique para number per obstetric history

---

### Prescriptions

#### `prescription`
Prescription header information.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| prescription_id | integer | ✓ | nextval('prescription_prescription_id_seq') | ✓ | Auto-increment primary key |
| visit_id | integer | ✓ | - | - | Foreign key to visit (UNIQUE) |
| doctor_id | integer | ✓ | - | - | Prescribing doctor |
| created_at | timestamp | - | CURRENT_TIMESTAMP | - | Prescription creation time |

**Constraints:**
- `unique_visit_prescription` - One prescription per visit

---

#### `prescription_medicines`
Individual medicines in a prescription.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| prescription_medicine_id | integer | ✓ | nextval('prescription_medicines_prescription_medicine_id_seq') | ✓ | Auto-increment primary key |
| prescription_id | integer | ✓ | - | - | Foreign key to prescription |
| medicine_id | integer | ✓ | - | - | Foreign key to medicine |
| dosage | varchar | - | - | - | Dosage instructions |
| frequency | varchar | - | - | - | Frequency |
| duration | varchar | - | - | - | Treatment duration |
| instructions | text | - | - | - | Special instructions |
| prescribed_quantity | integer | - | - | - | Quantity prescribed |
| dispensed_quantity | integer | - | - | - | Quantity dispensed |
| dispensed_by | integer | - | - | - | Staff who dispensed |
| dispensed_at | timestamp | - | CURRENT_TIMESTAMP | - | Dispensing timestamp |
| created_at | timestamp | - | CURRENT_TIMESTAMP | - | Record creation time |
| updated_at | timestamp | - | CURRENT_TIMESTAMP | - | Last update time |

---

### Pharmacy & Inventory

#### `medicine`
Medicine catalog and stock levels.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| medicine_id | integer | ✓ | nextval('medicine_medicine_id_seq') | ✓ | Auto-increment primary key |
| generic_name | varchar | ✓ | - | - | Generic medicine name |
| brand_name | varchar | ✓ | - | - | Brand/trade name |
| category | varchar | ✓ | - | - | Medicine category |
| dosage_value | numeric | - | - | - | Strength value |
| dosage_unit | varchar | - | - | - | Strength unit |
| form | varchar | - | - | - | Form (tablet, syrup, etc.) |
| stock_quantity | integer | - | 0 | - | **Auto-updated by triggers** |
| price | numeric | - | - | - | Selling price |
| created_at | timestamp | - | CURRENT_TIMESTAMP | - | Record creation time |

---

#### `medicine_transaction`
Complete audit trail of all stock movements.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| txn_id | integer | ✓ | nextval('medicine_transaction_txn_id_seq') | ✓ | Auto-increment primary key |
| medicine_id | integer | ✓ | - | - | Foreign key to medicine |
| txn_type | varchar | - | - | - | Transaction type |
| qty | integer | ✓ | - | - | Quantity |
| amount_per_unit | numeric | ✓ | - | - | Price per unit |
| ref_purchase_id | integer | - | - | - | Reference to purchase |
| ref_sale_id | integer | - | - | - | Reference to sale |
| ref_purchase_return | integer | - | - | - | Reference to purchase return |
| ref_sale_return | integer | - | - | - | Reference to sale return |
| created_at | timestamp | - | CURRENT_TIMESTAMP | - | Transaction timestamp |

**Note:** Automatically populated by triggers

**Transaction Types:**
- `purchase` - Stock increases
- `sale` - Stock decreases
- `purchase_return` - Stock decreases (returning to supplier)
- `sale_return` - Stock increases (customer return)

---

#### `medicine_purchase`
Purchase order headers.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| purchase_id | integer | ✓ | nextval('medicine_purchase_purchase_id_seq') | ✓ | Auto-increment primary key |
| party_id | integer | ✓ | - | - | Foreign key to party (supplier) |
| invoice_no | varchar | ✓ | - | - | Supplier invoice number |
| invoice_timestamp | timestamp | - | CURRENT_TIMESTAMP | - | Invoice date |
| total_amount | numeric | - | - | - | Total purchase amount |
| payment_status | varchar | - | - | - | Payment status |
| created_at | timestamp | - | CURRENT_TIMESTAMP | - | Record creation time |

---

#### `medicine_purchase_detail`
Individual items in a purchase order.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| id | integer | ✓ | nextval('medicine_purchase_detail_id_seq') | ✓ | Auto-increment primary key |
| purchase_id | integer | ✓ | - | - | Foreign key to medicine_purchase |
| medicine_id | integer | ✓ | - | - | Foreign key to medicine |
| qty | integer | ✓ | - | - | Quantity purchased |
| unit_cost | numeric | - | - | - | Cost per unit |
| batch_no | varchar | - | - | - | Batch/lot number |
| expiry_date | date | - | - | - | Medicine expiry date |

**Triggers:** Creates transaction record on INSERT/UPDATE/DELETE

---

#### `pharmacy_sale`
Medicine sales transaction headers.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| sale_id | integer | ✓ | nextval('pharmacy_sale_sale_id_seq') | ✓ | Auto-increment primary key |
| visit_id | integer | ✓ | - | - | Foreign key to visit |
| bill_id | integer | ✓ | - | - | Foreign key to bill |
| sale_timestamp | timestamp | - | CURRENT_TIMESTAMP | - | Sale date/time |
| handled_by | integer | ✓ | - | - | Staff who processed sale |
| total_amount | numeric | - | - | - | Total sale amount |
| status | varchar | - | - | - | Sale status |

---

#### `pharmacy_sale_detail`
Individual medicines in a sale.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| id | integer | ✓ | nextval('pharmacy_sale_detail_id_seq') | ✓ | Auto-increment primary key |
| sale_id | integer | ✓ | - | - | Foreign key to pharmacy_sale |
| medicine_id | integer | ✓ | - | - | Foreign key to medicine |
| qty | integer | ✓ | - | - | Quantity sold |
| unit_price | numeric | - | - | - | Price per unit |
| total_price | numeric | - | - | - | Line total |

**Triggers:** Creates transaction record on INSERT/UPDATE/DELETE

---

#### `party`
Suppliers/vendors information.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| party_id | integer | ✓ | nextval('party_party_id_seq') | ✓ | Auto-increment primary key |
| name | varchar | ✓ | - | - | Supplier name |
| contact_number | varchar | - | - | - | Phone number |
| address | text | - | - | - | Business address |
| created_at | timestamp | - | CURRENT_TIMESTAMP | - | Record creation time |

---

### Returns Management

#### `purchase_return`
Purchase return headers.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| return_id | integer | ✓ | nextval('purchase_return_return_id_seq') | ✓ | Auto-increment primary key |
| purchase_id | integer | ✓ | - | - | Foreign key to medicine_purchase |
| reason | text | - | - | - | Return reason |
| return_timestamp | timestamp | - | CURRENT_TIMESTAMP | - | Return date/time |
| created_by | integer | ✓ | - | - | Staff who processed return |

---

#### `purchase_return_detail`
Individual items in a purchase return.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| id | integer | ✓ | nextval('purchase_return_detail_id_seq') | ✓ | Auto-increment primary key |
| return_id | integer | ✓ | - | - | Foreign key to purchase_return |
| medicine_id | integer | ✓ | - | - | Foreign key to medicine |
| qty | integer | ✓ | - | - | Quantity returned |
| unit_cost | numeric | ✓ | - | - | Cost per unit |

**Triggers:** Creates transaction record on INSERT/UPDATE/DELETE

---

#### `sale_return`
Customer return transaction headers.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| return_id | integer | ✓ | nextval('sale_return_return_id_seq') | ✓ | Auto-increment primary key |
| sale_id | integer | ✓ | - | - | Foreign key to pharmacy_sale |
| reason | text | - | - | - | Return reason |
| return_timestamp | timestamp | - | CURRENT_TIMESTAMP | - | Return date/time |
| created_by | integer | ✓ | - | - | Staff who processed return |

---

#### `sale_return_detail`
Individual items in a customer return.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| id | integer | ✓ | nextval('sale_return_detail_id_seq') | ✓ | Auto-increment primary key |
| return_id | integer | ✓ | - | - | Foreign key to sale_return |
| medicine_id | integer | ✓ | - | - | Foreign key to medicine |
| qty | integer | ✓ | - | - | Quantity returned |
| unit_price | numeric | - | - | - | Price per unit |

**Triggers:** Creates transaction record on INSERT/UPDATE/DELETE

---

### Laboratory

#### `lab_test`
Available laboratory tests catalog.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| test_id | integer | ✓ | - | ✓ | Primary key (manually assigned) |
| test_name | varchar | ✓ | - | - | Test name |
| category | varchar | - | - | - | Test category |
| price | numeric | - | - | - | Test price |
| description | text | - | - | - | Test description |

---

#### `lab_order`
Laboratory test orders.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| order_id | integer | ✓ | nextval('lab_order_order_id_seq') | ✓ | Auto-increment primary key |
| visit_id | integer | ✓ | - | - | Foreign key to visit |
| test_id | integer | ✓ | - | - | Foreign key to lab_test |
| ordered_by | integer | ✓ | - | - | Doctor who ordered |
| performed_by | integer | - | - | - | Lab technician |
| status | varchar | - | - | - | Order status |
| created_at | timestamp | - | CURRENT_TIMESTAMP | - | Order creation time |

---

#### `lab_result`
Laboratory test results.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| result_id | integer | ✓ | nextval('lab_result_result_id_seq') | ✓ | Auto-increment primary key |
| order_id | integer | ✓ | - | - | Foreign key to lab_order |
| lab_result | text | - | - | - | Test result/findings |
| reported_by | integer | ✓ | - | - | Staff who reported |
| reported_at | timestamp | - | CURRENT_TIMESTAMP | - | Result reporting time |

---

### Billing

#### `bill`
Patient billing headers.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| bill_id | integer | ✓ | nextval('bill_bill_id_seq') | ✓ | Auto-increment primary key |
| patient_id | integer | ✓ | - | - | Foreign key to patient |
| visit_id | integer | ✓ | - | - | Foreign key to visit |
| total_amount | numeric | - | - | - | Total bill amount |
| payment_status | varchar | - | - | - | Payment status |
| created_at | timestamp | - | CURRENT_TIMESTAMP | - | Bill creation time |

---

#### `bill_item`
Individual line items in a bill.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| item_id | integer | ✓ | nextval('bill_item_item_id_seq') | ✓ | Auto-increment primary key |
| bill_id | integer | ✓ | - | - | Foreign key to bill |
| description | varchar | - | - | - | Item description |
| amount | numeric | ✓ | - | - | Item amount |
| quantity | integer | - | - | - | Item quantity |
| created_at | timestamp | - | CURRENT_TIMESTAMP | - | Record creation time |

---

## Functions

### 1. `get_clinic_number()`

Generates sequential clinic numbers for visits (resets daily).

**Returns:** `integer`

```sql
CREATE OR REPLACE FUNCTION get_clinic_number()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE 
    v_max_clinic_number INT;
    v_next_number INT;
BEGIN 
   SELECT MAX(clinic_number)
   INTO v_max_clinic_number
   FROM visit
   WHERE visit_timestamp >= CURRENT_DATE
     AND visit_timestamp < CURRENT_DATE + INTERVAL '1 day';

   IF v_max_clinic_number IS NULL THEN
       v_next_number := 1;
   ELSE
       v_next_number := v_max_clinic_number + 1;
   END IF;

   RETURN v_next_number;
END;
$$;
```

**Usage:**
```sql
-- Get next clinic number
SELECT get_clinic_number();

-- Use in INSERT
INSERT INTO visit (patient_id, doctor_id, clinic_number)
VALUES (1, 2, get_clinic_number());
```

---

### 2. `fn_tg_purchase_detail_to_txn()`

Syncs purchase details to medicine_transaction table.

**Returns:** `trigger`

```sql
CREATE OR REPLACE FUNCTION fn_tg_purchase_detail_to_txn()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO medicine_transaction(
        medicine_id, txn_type, qty, amount_per_unit, ref_purchase_id
    ) VALUES (
        NEW.medicine_id, 'purchase', NEW.qty, NEW.unit_cost, NEW.purchase_id
    );

  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE medicine_transaction
    SET qty = NEW.qty, amount_per_unit = NEW.unit_cost
    WHERE ref_purchase_id = NEW.purchase_id
      AND medicine_id = NEW.medicine_id
      AND txn_type = 'purchase';

  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM medicine_transaction
    WHERE ref_purchase_id = OLD.purchase_id
      AND medicine_id = OLD.medicine_id
      AND txn_type = 'purchase';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;
```

---

### 3. `fn_tg_sale_detail_to_txn()`

Syncs sale details to medicine_transaction table.

**Returns:** `trigger`

```sql
CREATE OR REPLACE FUNCTION fn_tg_sale_detail_to_txn()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO medicine_transaction(
        medicine_id, txn_type, qty, amount_per_unit, ref_sale_id
    ) VALUES (
        NEW.medicine_id, 'sale', NEW.qty, NEW.unit_price, NEW.sale_id
    );
  
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE medicine_transaction
    SET qty = NEW.qty, amount_per_unit = NEW.unit_price
    WHERE ref_sale_id = NEW.sale_id
      AND medicine_id = NEW.medicine_id;

  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM medicine_transaction
    WHERE ref_sale_id = OLD.sale_id
      AND medicine_id = OLD.medicine_id;
  END IF;

  RETURN NULL;
END;
$$;
```

---

### 4. `fn_tg_purchase_return_detail_to_txn()`

Syncs purchase return details to medicine_transaction.

**Returns:** `trigger`

```sql
CREATE OR REPLACE FUNCTION fn_tg_purchase_return_detail_to_txn()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO medicine_transaction(
        medicine_id, txn_type, qty, amount_per_unit, ref_purchase_return_id
    ) VALUES (
        NEW.medicine_id, 'purchase_return', NEW.qty, NEW.unit_cost, NEW.purchase_return_id
    );

  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE medicine_transaction
    SET medicine_id = NEW.medicine_id, qty = NEW.qty, amount_per_unit = NEW.unit_cost
    WHERE ref_purchase_return_id = OLD.purchase_return_id
      AND medicine_id = OLD.medicine_id
      AND txn_type = 'purchase_return';

  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM medicine_transaction
    WHERE ref_purchase_return_id = OLD.purchase_return_id
      AND medicine_id = OLD.medicine_id
      AND txn_type = 'purchase_return';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;
```

---

### 5. `fn_tg_sale_return_detail_to_txn()`

Syncs sale return details to medicine_transaction.

**Returns:** `trigger`

```sql
CREATE OR REPLACE FUNCTION fn_tg_sale_return_detail_to_txn()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
