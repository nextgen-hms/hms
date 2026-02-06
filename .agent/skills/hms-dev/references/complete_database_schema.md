# Database Documentation

## Overview

This document provides complete technical documentation for the Hospital Management System (HMS) PostgreSQL database. The database contains **38 tables**, **10 functions**, **1 stored procedure**, and **6 triggers** implementing a comprehensive medical and pharmacy management system.

---

## Table of Contents

- [Database Overview](#database-overview)
- [Table Structures](#table-structures)
  - [Patient Management](#patient-management)
  - [Medical Staff](#medical-staff)
  - [Obstetric & Gynecology](#obstetric--gynecology)
  - [Prescriptions](#prescriptions)
  - [Pharmacy & Inventory](#pharmacy--inventory)
  - [POS Operations](#pos-operations)
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
**Total Tables:** 38  
**Total Functions:** 10  
**Total Procedures:** 1  
**Total Triggers:** 6  
**Total Indexes:** 45+

### Key Features
- **Dual-Level Inventory**: Synchronized aggregate and batch-level stock tracking via PostgreSQL triggers.
- **Audit Trails**: Complete historical logs for every medicine movement and status transition.
- **Automated Logic**: Real-time stock calculation and daily clinic number generation using PL/pgSQL.
- **Data Integrity**: Soft deletes, unique constraints, and check constraints to ensure medical data validity.
- **Specialized Workflows**: Dedicated modules for OB/GYN, Pharmacy POS, and Lab Management.

---

## Table Structures

### Patient Management

#### `patient`
Core patient demographic information.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| patient_id | integer | ✓ | nextval('...') | ✓ | Auto-increment primary key |
| patient_name | varchar(100) | ✓ | - | - | Patient's full name |
| age | integer | - | - | - | Patient's age |
| gender | varchar(26) | - | - | - | Male, Female, or Other |
| contact_number | varchar(20) | - | - | - | Primary phone number |
| cnic | varchar(20) | - | - | - | National Identity Number |
| address | text | - | - | - | Residential address |
| created_at | timestamp | - | CURRENT_TIMESTAMP | - | Record creation time |

---

#### `visit`
Records all patient visits, interactions, and their statuses.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| visit_id | integer | ✓ | nextval('...') | ✓ | Auto-increment primary key |
| patient_id | integer | ✓ | - | - | Foreign key to `patient` |
| doctor_id | integer | ✓ | - | - | Foreign key to `doctor` |
| visit_timestamp | timestamp | - | CURRENT_TIMESTAMP | - | Date and time of visit |
| visit_type | varchar(50) | - | - | - | OPD or Emergency |
| clinic_number | integer | - | - | - | Daily sequential number (resets daily) |
| status | varchar(50) | - | - | - | Current workflow status |
| reason | text | - | - | - | Clinical reason for visit |
| is_deleted | boolean | - | false | - | Soft delete flag |

**Status Workflow:** `waiting`, `seen_by_doctor`, `medicines_dispensed`, `lab_tests_done`, `payment_done`, `completed`, `admitted`, `discharged`.

---

#### `patient_vitals`
Stores physiological measurements taken during a visit.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| vital_id | integer | ✓ | nextval('...') | ✓ | Auto-increment primary key |
| visit_id | integer | ✓ | - | - | Related Visit ID (Unique constraint) |
| blood_pressure | varchar(50) | - | - | - | e.g., "120/80" |
| heart_rate | integer | - | - | - | BPM |
| temperature | integer | - | - | - | Body temperature |
| weight | integer | - | - | - | Weight in kg |
| height | integer | - | - | - | Height in cm |
| blood_group | varchar(20) | - | - | - | ABO and Rh type |
| recorded_at | timestamp | - | CURRENT_TIMESTAMP | - | Timestamp of measurement |

---

#### `visit_status_history`
Complete audit trail for changes in a patient's visit status.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| visit_status_id | integer | ✓ | nextval('...') | ✓ | Auto-increment primary key |
| visit_id | integer | ✓ | - | - | Related Visit ID |
| status | varchar(100) | - | - | - | New status value |
| updated_by_doctor | integer | - | - | - | Doctor ID responsible for update |
| updated_by_staff | integer | - | - | - | Staff ID responsible for update |
| updated_at | timestamp | - | CURRENT_TIMESTAMP | - | Time of status change |

---

### Medical Staff

#### `doctor`
System users with clinical privileges.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| doctor_id | integer | ✓ | nextval('...') | ✓ | Auto-increment primary key |
| user_code | varchar(50) | ✓ | - | - | Login identifier |
| password | varchar(255) | ✓ | - | - | Hashed password |
| doctor_name | varchar(50) | ✓ | - | - | Clinical name |
| specialization | varchar(100) | ✓ | - | - | Medical field |
| consultation_fee| numeric(10,2)| ✓ | - | - | Base fee for OPD visits |
| emergency_fee | numeric(10,2)| ✓ | - | - | Fee for emergency services |
| contact_number | varchar(20) | - | - | - | Phone number |
| email | varchar(100) | - | - | - | Email address |

---

#### `staff`
Administrative and technical support personnel.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| staff_id | integer | ✓ | nextval('...') | ✓ | Auto-increment primary key |
| user_code | varchar(50) | ✓ | - | - | Login identifier |
| password | varchar(255) | ✓ | - | - | Hashed password |
| name | varchar(50) | ✓ | - | - | Staff full name |
| role | varchar(50) | - | - | - | Job role (Admin, Pharmacist, etc.) |
| contact_number | varchar(20) | - | - | - | Phone number |
| email | varchar(100) | - | - | - | Email address |

**Roles:** `Receptionist`, `Lab_Technician`, `Admin`, `Cashier`, `Pharmacist`, `Nurse`.

### Obstetric & Gynecology

#### `current_pregnancy`
Ongoing pregnancy records for patients in specialized care.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| pregnancy_id | integer | ✓ | nextval('...') | ✓ | Auto-increment primary key |
| patient_id | integer | ✓ | - | - | Reference to `patient` |
| visit_id | integer | ✓ | - | - | Reference to current `visit` (Unique) |
| multiple_pregnancy | boolean | - | - | - | Indicator for twins/multiples |
| complications | text | - | - | - | Clinical complications noted |
| ultrasound_findings | text | - | - | - | Detailed USG results |
| fetal_heart_rate_bpm | integer | - | - | - | FHR measurement |
| placenta_position | varchar(50) | - | - | - | Placental location |
| presentation | varchar(50) | - | - | - | Fetal presentation |
| gestational_age_weeks| integer | - | - | - | GA at time of visit |
| notes | text | - | - | - | General clinical notes |

---

#### `menstrual_history`
Historical gynecologic and menstrual data.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| menstrual_history_id | integer | ✓ | nextval('...') | ✓ | Auto-increment primary key |
| patient_id | integer | ✓ | - | - | Reference to `patient` |
| menarch_age | integer | - | - | - | Age at first period |
| cycle_length_days | integer | - | - | - | Average cycle length |
| bleeding_days | integer | - | - | - | Average flow duration |
| menstrual_regular | boolean | - | - | - | Regularity flag |
| contraception_history | text | - | - | - | Previous methods used |
| gynecologic_surgeries | text | - | - | - | History of surgeries |
| menopause_status | boolean | - | - | - | Menopause indicator |

---

#### `obstetric_history`
Patient's overall pregnancy summary (G/P/A).

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| obstetric_history_id | integer | ✓ | nextval('...') | ✓ | Auto-increment primary key |
| patient_id | integer | ✓ | - | - | Reference to `patient` (Unique) |
| gravida | integer | - | - | - | Total number of pregnancies |
| para | integer | - | - | - | Number of viable births |
| abortions | integer | - | - | - | Number of non-viable losses |
| edd | date | - | - | - | Estimated Due Date |
| last_menstrual_cycle | date | - | - | - | Date of last period |
| is_first_pregnancy | boolean | - | - | - | Primigravida flag |

---

#### `para_details`
Granular details for each individual birth record.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| para_id | integer | ✓ | nextval('...') | ✓ | Auto-increment primary key |
| obstetric_history_id | integer | ✓ | - | - | Link to summary record |
| para_number | integer | - | - | - | Sequential birth number |
| birth_year | integer | - | - | - | Year of birth |
| gender | varchar(20) | - | - | - | Male or Female |
| delivery_type | varchar(50) | - | - | - | Vaginal, C-Section, etc. |
| birth_weight_grams | integer | - | - | - | Weight at birth |
| complications | text | - | - | - | Labor/Delivery complications |

---

### Prescriptions

#### `prescription`
Order header for clinical prescriptions.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| prescription_id | integer | ✓ | nextval('...') | ✓ | Auto-increment primary key |
| visit_id | integer | ✓ | - | - | ID of the visit (Unique) |
| doctor_id | integer | ✓ | - | - | Prescribing Doctor ID |
| created_at | timestamp | - | CURRENT_TIMESTAMP | - | Header creation time |

---

#### `prescription_medicines`
Individual line items in a prescription.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| prescription_medicine_id | integer | ✓ | nextval('...') | ✓ | Auto-increment primary key |
| prescription_id | integer | ✓ | - | - | Link to header |
| medicine_id | integer | ✓ | - | - | ID of prescribed medicine |
| dosage | varchar(255) | - | - | - | Strength e.g., "500mg" |
| frequency | varchar(50) | - | - | - | e.g., "TDS" or "8 hourly" |
| duration | varchar(50) | - | - | - | Treatment length |
| instructions | text | - | - | - | Patient instructions |
| prescribed_quantity | integer | - | - | - | Total units ordered |
| dispensed_quantity | integer | - | - | - | Total units sold |
| prescribed_sub_quantity| integer | - | 0 | - | Loose tablets ordered |
| dispensed_sub_quantity | integer | - | 0 | - | Loose tablets sold |


### Pharmacy & Inventory

#### `medicine`
Aggregate catalog containing the master record for each product.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| medicine_id | integer | ✓ | nextval('...') | ✓ | Auto-increment primary key |
| generic_name | varchar(100) | ✓ | - | - | Scientific/Generic name |
| brand_name | varchar(100) | ✓ | - | - | Trade/Commercial name |
| category | varchar(100) | ✓ | - | - | e.g., Antibiotic, Analgesic |
| stock_quantity | integer | - | 0 | - | **Auto-Calculated Aggregate Units** |
| stock_sub_quantity| integer | - | 0 | - | **Auto-Calculated Aggregate Sub-units** |
| sub_units_per_unit| integer | - | - | - | Conversion factor (e.g., 10 tabs/strip) |
| price | numeric(10,2)| - | - | - | Standard selling price per unit |
| is_active | boolean | - | true | - | Visibility flag |
| min_stock_level | integer | - | 10 | - | Threshold for low stock alerts |

---

#### `medicine_batch`
Specific batches of medicine. This table tracks expiry and costs at a granular level.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| batch_id | integer | ✓ | nextval('...') | ✓ | Auto-increment primary key |
| medicine_id | integer | ✓ | - | - | Link to master record |
| batch_number | text | - | - | - | Manufacturer's batch identifier |
| expiry_date | date | - | - | - | Product expiration date |
| stock_quantity | integer | - | 0 | - | **Units remaining in this batch** |
| stock_sub_quantity| integer | - | 0 | - | **Sub-units remaining in this batch** |
| purchase_price | numeric(10,2)| - | - | - | Cost price per unit |
| sale_price | numeric(10,2)| - | - | - | Batch-specific selling price |

---

#### `medicine_transaction`
The unified ledger for all medicine stock adjustments.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| txn_id | integer | ✓ | nextval('...') | ✓ | Auto-increment primary key |
| medicine_id | integer | ✓ | - | - | Link to master record |
| batch_id | integer | - | - | - | **Link to specific batch used** |
| txn_type | varchar(100) | - | - | - | purchase, sale, return, etc. |
| quantity | integer | ✓ | - | - | Units moved (absolute value) |
| sub_quantity | integer | - | 0 | - | Sub-units moved (absolute value) |
| amount_per_unit | numeric(10,2)| ✓ | - | - | Price at time of transaction |
| ref_purchase_id | integer | - | - | - | Link to Purchase Header |
| ref_sale_id | integer | - | - | - | Link to Sale Header |
| created_at | timestamp | - | CURRENT_TIMESTAMP | - | Point-in-time of transaction |

---

#### `medicine_purchase`
Purchase order header received from suppliers.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| purchase_id | integer | ✓ | nextval('...') | ✓ | Auto-increment primary key |
| party_id | integer | ✓ | - | - | Link to `party` (Supplier) |
| invoice_no | varchar(100) | ✓ | - | - | Supplier's unique invoice ID |
| total_amount | numeric(10,2)| - | - | - | Total value of purchase |
| payment_status | varchar(100) | - | - | - | Paid, Unpaid, or Partial |
| created_by | integer | - | - | - | Staff ID who recorded entry |

---

#### `medicine_purchase_detail`
Line items within a purchase order.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| id | integer | ✓ | nextval('...') | ✓ | Auto-increment primary key |
| purchase_id | integer | ✓ | - | - | Link to header |
| medicine_id | integer | ✓ | - | - | ID of medicine received |
| batch_id | integer | - | - | - | **Target batch for this line** |
| quantity | integer | ✓ | - | - | Number of units purchased |
| sub_quantity | integer | - | 0 | - | Number of loose sub-units purchased |
| unit_cost | numeric(10,2)| - | - | - | Cost per unit from supplier |


#### `pharmacy_sale`
Sales transaction header for customer purchases.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| sale_id | integer | ✓ | nextval('...') | ✓ | Auto-increment primary key |
| visit_id | integer | - | - | - | Optional link to clinical visit |
| bill_id | integer | - | - | - | Link to Billing record |
| total_amount | numeric(10,2)| - | - | - | Net total after discounts |
| handled_by | integer | ✓ | - | - | Staff ID who processed sale |
| sale_timestamp | timestamp | - | CURRENT_TIMESTAMP | - | Point-in-time of sale |
| status | varchar | - | - | - | Completed, Pending, etc. |

---

#### `pharmacy_sale_detail`
Individual medicine line items in a sale.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| id | integer | ✓ | nextval('...') | ✓ | Auto-increment primary key |
| sale_id | integer | ✓ | - | - | Link to header |
| medicine_id | integer | ✓ | - | - | ID of medicine sold |
| batch_id | integer | - | - | - | **Source batch for this sale** |
| quantity | integer | ✓ | - | - | Number of units sold |
| sub_quantity | integer | - | 0 | - | Number of sub-units sold |
| unit_sale_price | numeric(10,2)| - | - | - | Price per unit applied |

---

#### `party`
External entities providing goods or services (Suppliers).

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| party_id | integer | ✓ | nextval('...') | ✓ | Auto-increment primary key |
| name | varchar(100) | ✓ | - | - | Business name |
| contact_number | varchar(200)| - | - | - | Phone/Mobile numbers |
| address | text | - | - | - | Physical location |

---

### POS Operations

#### `pos_session`
Tracking for register shifts and cash balances.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| session_id | integer | ✓ | nextval('...') | ✓ | Auto-increment primary key |
| staff_id | integer | ✓ | - | - | User responsible for session |
| opening_time | timestamp | ✓ | CURRENT_TIMESTAMP | - | Session start |
| opening_balance| numeric(10,2)| ✓ | 0 | - | Cash in drawer at start |
| closing_time | timestamp | - | - | - | Session end |
| closing_balance| numeric(10,2)| - | - | - | Cash in drawer at end |
| status | varchar(20) | - | 'open' | - | open or closed |

---

#### `pos_held_transaction`
"Save for later" or "Parked" sales records.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| hold_id | integer | ✓ | nextval('...') | ✓ | Auto-increment primary key |
| customer_name | varchar(100)| - | - | - | Name provided by customer |
| total_amount | numeric(10,2)| - | - | - | Estimated total |
| status | varchar(20) | - | 'held' | - | held, retrieved, or cancelled |
| hold_timestamp | timestamp | - | CURRENT_TIMESTAMP | - | Time transaction was parked |

---

#### `pos_receipt_config`
Display settings for printed and digital receipts.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| config_id | integer | ✓ | nextval('...') | ✓ | Auto-increment primary key |
| clinic_name | varchar(200)| ✓ | - | - | Name shown on header |
| receipt_header | text | - | - | - | Custom header message |
| receipt_footer | text | - | - | - | Custom footer message |
| printer_name | varchar(100)| - | - | - | OS printer identifier |


### Returns Management

#### `purchase_return`
Header for returning medicine to a supplier.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| return_id | integer | ✓ | nextval('...') | ✓ | Auto-increment primary key |
| purchase_id | integer | ✓ | - | - | Reference to original purchase |
| reason | text | - | - | - | Reason for return |
| created_by | integer | ✓ | - | - | Staff ID who processed return |
| return_timestamp| timestamp | - | CURRENT_TIMESTAMP | - | Date/time of return |

---

#### `sale_return`
Header for customer returns.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| return_id | integer | ✓ | nextval('...') | ✓ | Auto-increment primary key |
| sale_id | integer | ✓ | - | - | Reference to original sale |
| reason | text | - | - | - | Reason for return |
| created_by | integer | ✓ | - | - | Staff ID who processed return |
| return_timestamp| timestamp | - | CURRENT_TIMESTAMP | - | Date/time of return |

---

### Laboratory

#### `lab_test`
Catalog of available diagnostic tests.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| test_id | integer | ✓ | - | ✓ | Manual identifier |
| test_name | varchar(100)| ✓ | - | - | Full name of test |
| category | varchar(50) | - | - | - | Hematology, Chemistry, etc. |
| price | numeric(10,2)| - | - | - | Cost to patient |

---

#### `lab_order`
Orders for tests linked to patient visits.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| order_id | integer | ✓ | nextval('...') | ✓ | Auto-increment primary key |
| visit_id | integer | ✓ | - | - | Link to Clinical Visit |
| test_id | integer | ✓ | - | - | Link to Test Catalog |
| urgency | varchar(50) | ✓ | 'Routine' | - | STAT, Urgent, Routine |
| status | varchar(100)| - | - | - | Pending, Performed, Completed |
| ordered_by | integer | ✓ | - | - | Doctor ID who ordered |

---

#### `lab_test_parameters`
Detailed components tracked within a specific test.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| parameter_id | integer | ✓ | nextval('...') | ✓ | Auto-increment primary key |
| test_id | integer | ✓ | - | - | Link to parent test |
| parameter_name | varchar(100)| ✓ | - | - | Name of measurement (e.g., Hb) |
| unit | varchar(50) | - | - | - | Measurement unit (e.g., g/dL) |
| reference_range_min| numeric | - | - | - | Normal lower limit |
| reference_range_max| numeric | - | - | - | Normal upper limit |

---

### Billing

#### `bill`
Invoice summary for a patient visit.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| bill_id | integer | ✓ | nextval('...') | ✓ | Auto-increment primary key |
| visit_id | integer | ✓ | - | - | Link to Clinical Visit |
| total_amount | numeric(10,2)| - | - | - | Total bill value |
| payment_status | varchar(100)| - | - | - | Paid, Unpaid, Partial |

---

#### `bill_item`
Specific charges (Consultation, Medicine, Lab) on a bill.

| Column | Type | Not Null | Default | Primary Key | Description |
|--------|------|----------|---------|-------------|-------------|
| item_id | integer | ✓ | nextval('...') | ✓ | Auto-increment primary key |
| bill_id | integer | ✓ | - | - | Link to Billing Header |
| description | varchar(255)| - | - | - | Charge details |
| amount | numeric(10,2)| ✓ | - | - | Line item cost |


---

## Functions

### 1. `get_clinic_number()`
Generates sequential clinic numbers for visits, resetting for each new day.

```sql
CREATE OR REPLACE FUNCTION public.get_clinic_number()
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
declare 
v_max_clinic_number int;
v_next_number int;
begin 
   select max(clinic_number)
   into v_max_clinic_number
   from visit
   where visit_timestamp >= current_date
   and visit_timestamp < current_date + interval '1 day';

   if v_max_clinic_number is null then
   		v_next_number := 1;
   else
   		v_next_number := v_max_clinic_number + 1;
   end if;

   return v_next_number;
end;
$function$;
```

---

### 2. `check_stock_available(medicine_id, qty, sub_qty)`
Validates if sufficient stock exists across all non-expired batches before allowing a transaction.

```sql
CREATE OR REPLACE FUNCTION public.check_stock_available(required_medicine_id integer, required_quantity integer, required_sub_quantity integer)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
declare
   available_quantity integer := 0;
   available_sub_quantity integer :=0;
   f_sub_units_per_unit integer :=0;
   total_available_sub_unit integer :=0;
   total_requested_sub_unit integer :=0;
   r record;
begin
   select COALESCE(sub_units_per_unit,1) into f_sub_units_per_unit from medicine where medicine_id=required_medicine_id;
   total_requested_sub_unit:=(required_quantity * f_sub_units_per_unit)+required_sub_quantity;
   
   for r in 
        select quantity,sub_quantity from medicine_batch where medicine_id=required_medicine_id and expiry_date > NOW()
   loop 
       available_quantity:=available_quantity+coalesce(r.quantity,0);
   available_sub_quantity:=available_sub_quantity+coalesce(r.sub_quantity,0);
   end loop;
   
   total_available_sub_unit:=(available_quantity * f_sub_units_per_unit)+(available_sub_quantity);
   return total_available_sub_unit >= total_requested_sub_unit;
end;
$function$;
```

---

### 3. `fn_tg_stockquantity_generic()`
The core synchronization engine. It updates both the aggregate `medicine` and the specific `medicine_batch` records whenever a transaction is logged.

```sql
CREATE OR REPLACE FUNCTION public.fn_tg_stockquantity_generic()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_sign INTEGER;
    v_sub_units_per_unit INTEGER;
    v_total_sub_units_change INTEGER;
    v_medicine_id INTEGER;
BEGIN
    v_medicine_id := COALESCE(NEW.medicine_id, OLD.medicine_id);
    SELECT sub_units_per_unit INTO v_sub_units_per_unit FROM medicine WHERE medicine_id = v_medicine_id;
    IF v_sub_units_per_unit IS NULL OR v_sub_units_per_unit = 0 THEN v_sub_units_per_unit := 1; END IF;

    -- Determine transaction direction (Sign)
    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        IF NEW.txn_type IN ('purchase', 'sale_return') THEN v_sign := 1;
        ELSIF NEW.txn_type IN ('sale', 'purchase_return') THEN v_sign := -1;
        ELSIF NEW.txn_type = 'adjustment' THEN v_sign := 1;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.txn_type IN ('purchase', 'sale_return') THEN v_sign := 1;
        ELSE v_sign := -1;
        END IF;
    END IF;

    -- Update logic using total sub-units calculation
    IF TG_OP = 'INSERT' THEN
        v_total_sub_units_change := (NEW.quantity * v_sub_units_per_unit) + COALESCE(NEW.sub_quantity, 0);
        UPDATE medicine SET stock_quantity = ( (stock_quantity * v_sub_units_per_unit) + stock_sub_quantity + (v_sign * v_total_sub_units_change) ) / v_sub_units_per_unit, stock_sub_quantity = ( (stock_quantity * v_sub_units_per_unit) + stock_sub_quantity + (v_sign * v_total_sub_units_change) ) % v_sub_units_per_unit WHERE medicine_id = v_medicine_id;
        IF NEW.batch_id IS NOT NULL THEN
            UPDATE medicine_batch SET stock_quantity = ( (stock_quantity * v_sub_units_per_unit) + stock_sub_quantity + (v_sign * v_total_sub_units_change) ) / v_sub_units_per_unit, stock_sub_quantity = ( (stock_quantity * v_sub_units_per_unit) + stock_sub_quantity + (v_sign * v_total_sub_units_change) ) % v_sub_units_per_unit WHERE batch_id = NEW.batch_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        v_total_sub_units_change := (OLD.quantity * v_sub_units_per_unit) + COALESCE(OLD.sub_quantity, 0);
        UPDATE medicine SET stock_quantity = ( (stock_quantity * v_sub_units_per_unit) + stock_sub_quantity - (v_sign * v_total_sub_units_change) ) / v_sub_units_per_unit, stock_sub_quantity = ( (stock_quantity * v_sub_units_per_unit) + stock_sub_quantity - (v_sign * v_total_sub_units_change) ) % v_sub_units_per_unit WHERE medicine_id = v_medicine_id;
        IF OLD.batch_id IS NOT NULL THEN
            UPDATE medicine_batch SET stock_quantity = ( (stock_quantity * v_sub_units_per_unit) + stock_sub_quantity - (v_sign * v_total_sub_units_change) ) / v_sub_units_per_unit, stock_sub_quantity = ( (stock_quantity * v_sub_units_per_unit) + stock_sub_quantity - (v_sign * v_total_sub_units_change) ) % v_sub_units_per_unit WHERE batch_id = OLD.batch_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle deltas to prevent race conditions and ensure idempotency
        ...
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$function$;
```

---

## Stored Procedures

### 1. `update_and_log_visit_status(visit_id, status, doctor_id, staff_id)`
Atomic operation to update a visit's current status and create an entry in the audit history.

```sql
CREATE OR REPLACE PROCEDURE public.update_and_log_visit_status(IN p_visit_id integer, IN p_status character varying, IN p_updated_by_doctor integer, IN p_updated_by_staff integer)
 LANGUAGE plpgsql
AS $procedure$
begin
update visit set status = p_status where visit_id = p_visit_id;
insert into visit_status_history(visit_id,status,updated_by_staff,updated_by_doctor)
values(p_visit_id, p_status, p_updated_by_doctor, p_updated_by_staff);
end;
$procedure$;
```


---

## Triggers

| Trigger Name | Table | Event | Functon |
|--------------|-------|-------|---------|
| `tg_purchase_detail_to_txn` | `medicine_purchase_detail`| AFTER INSERT/UPDATE/DELETE | `fn_tg_purchase_detail_to_txn` |
| `tg_sale_detail_to_txn` | `pharmacy_sale_detail` | AFTER INSERT/UPDATE/DELETE | `fn_tg_sale_detail_to_txn` |
| `tg_purchase_return_detail_to_txn`| `purchase_return_detail`| AFTER INSERT/UPDATE/DELETE | `fn_tg_purchase_return_detail_to_txn`|
| `tg_sale_return_detail_to_txn` | `sale_return_detail` | AFTER INSERT/UPDATE/DELETE | `fn_tg_sale_return_detail_to_txn` |
| `tg_stockquantity_generic` | `medicine_transaction` | AFTER INSERT/UPDATE/DELETE | `fn_tg_stockquantity_generic` |
| `search_vector_trigger` | `medicine` | BEFORE INSERT/UPDATE | `medicine_search_vector_update` |

---

## Data Flow

1. **Transaction Initiated**: A user saves a Purchase, Sale, or Return via the UI.
2. **Detail Persistence**: Records are inserted into the specific detail table (e.g., `pharmacy_sale_detail`).
3. **Transaction Logging**: A trigger (`tg_sale_detail_to_txn`) automatically clones the relevant data into the unified `medicine_transaction` ledger.
4. **Stock Synchronization**: The master stock trigger (`tg_stockquantity_generic`) fires on the ledger entry.
   - It calculates the change in total sub-units.
   - It updates the aggregate `medicine` table.
   - It updates the specific `medicine_batch` record to maintain granular parity.
5. **Inventory Consistency**: The system ensures that the sum of stock across all batches equals the aggregate stock for a medicine ID.

---

## Business Rules

### 1. Stock Integrity
- **Negative Stock**: The database allows negative stock for aggregate records (reflecting real-world overselling) but triggers alerts in the UI. Batch records, however, should be managed to avoid negative physical quantities.
- **Expiry Protection**: The `check_stock_available` function automatically excludes expired batches from "Available Stock" counts, even if they physically remain in the database.

### 2. Clinical Context
- **Clinic Number Reset**: Clinic numbers are guaranteed unique for a calendar day but reset at midnight.
- **Visit Workflow**: A visit's status is strictly audited. Status changes must go through the `update_and_log_visit_status` procedure to ensure history is captured.

### 3. Financial Accuracy
- **Decimal Precision**: All monetary values use `numeric(10,2)` to prevent floating-point errors common in financial calculations.
- **Sub-unit Pricing**: The system supports selling individual sub-units (e.g., individual tablets) at a calculated `sub_unit_price`, which is automatically integrated into the total transaction amount.

---

> [!IMPORTANT]
> **Database-First Integrity**: Always rely on database triggers for inventory calculations. Manual overrides of `stock_quantity` columns are strongly discouraged as they bypass the transaction ledger and break audit trails.

