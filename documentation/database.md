# 🗄️ HMS Database Documentation

Detailed technical breakdown of the PostgreSQL schema powering the Hospital Management System.

## 📊 Schema Statistics

- **Tables**: 29
- **Primary Schema**: `public`
- **Database Engine**: PostgreSQL 18.1
- **Local Database Name**: `hims`

## 🔑 Core Entities

### 1. Clinical Data
- **`patient`**: Demographics (CNIC, age, gender).
- **`visit`**: Central entity for every interaction. Tracks `clinic_number` (daily reset).
- **`patient_vitals`**: Linked 1:1 with `visit`.
- **`visit_status_history`**: Audit trail for visit statuses (Pending, In-Progress, Completed).

### 2. Specialized Care (OB/GYN)
- **`obstetric_history`**: Summary of past pregnancies per patient.
- **`menstrual_history`**: Period cycles and gynecologic history.
- **`current_pregnancy`**: Details for ongoing visits.
- **`para_details`**: In-depth history of each birth.

### 3. Pharmacy & Inventory
- **`medicine`**: Catalog with real-time `stock_quantity`.
- **`medicine_transaction`**: The ultimate audit log for every pill movement.
- **`medicine_purchase` & `pharmacy_sale`**: Transaction headers.
- **`purchase_return` & `sale_return`**: Handling returns with stock adjustments.

## ⚡ Automated Logic (Triggers)

| Trigger Name | Source Table | Action |
|--------------|--------------|--------|
| `after_medicine_purchase_insert` | `medicine_purchase_detail` | Increases stock + logs transaction |
| `after_pharmacy_sale_insert` | `pharmacy_sale_detail` | Decreases stock + logs transaction |
| `after_purchase_return_insert` | `purchase_return_detail` | Decreases stock + logs transaction |
| `after_sale_return_insert` | `sale_return_detail` | Increases stock + logs transaction |

## 🛠️ Key Stored Functions

- **`get_clinic_number()`**: Returns the next sequential number for the current day.
- **`check_stock_available(medicine_id, qty)`**: Validates if inventory is sufficient before allowing a sale.
- **`generate_bill(visit_id)`**: Aggregates consultation fees, medicine costs, and lab fees.

---

> [!WARNING]
> Do not manualy update `medicine.stock_quantity`. Always use transaction tables to trigger automated updates to ensure audit logs stay consistent.
