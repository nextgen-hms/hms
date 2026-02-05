# 🧩 HMS Feature Modules

Breakdown of the primary modules available in the Hospital Management System.

## 🏥 1. Reception & Registration
**Folder**: `src/features/reception`
- **Patient Registration**: Capture CNIC, demographics, and contact info.
- **Visit Management**: Create OPD/IPD visits and assign patients to doctors.
- **Billing**: Generate invoices for consultation and procedures.

## 🩺 2. Doctor Consultation
**Folder**: `src/features/doctor`
- **Patient Queue**: Real-time list of waiting patients.
- **Clinical Notes**: Rich text area for symptoms and diagnosis.
- **Prescription System**: Digital ordering of medicines and lab tests.
- **Medical History**: Single-view access to all previous visits and labs.

## 💊 3. Pharmacy & Inventory
**Folder**: `src/features/pharmacy`
- **POS (Point of Sale)**: Quick dispensing of medicines with barcode support (planned).
- **Stock Management**: Batch tracking, expiry alerts, and reorder levels.
- **Purchasing**: Manage supplier invoices and stock incoming flows.
- **Transaction Logs**: Automatic ledger of every movement.

## 🔬 4. Laboratory & Diagnostics
**Folder**: `src/features/laboratory`
- **Order Queue**: List of pending lab tests from doctors.
- **Result Entry**: Input findings for blood, urine, and imaging tests.
- **Reporting**: Generate professional PDF reports for patients.

## 🔐 5. Login & Security
**Folder**: `src/features/Login`
- **Role-Based Access**: Specialized views for Doctors, Pharmacists, and Receptionists.
- **Audit Trails**: Every sensitive action is logged with user ID and timestamp.

---

> [!NOTE]
> All modules share a common UI language located in `src/features/shared`.
