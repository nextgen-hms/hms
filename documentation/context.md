# HMS Project Context

## Project Overview
A comprehensive Hospital Management System (HMS) designed as an **offline-first** solution for small to medium healthcare facilities. Built with **Next.js 15**, **Tailwind CSS 4**, and **PostgreSQL 18.1**, delivered via **Electron**.

## Architecture & Logic
- **Modularity**: Feature-based organization in `src/features`.
- **Database-First**: Business logic (stock management, audit trails) implemented directly in PostgreSQL via triggers and functions.
- **Offline-First**: Local storage and processing with daily cloud synchronization.

## Modular Progress & Roadmap

### 1. Reception (Patient Entry)
- **Database**: `patient`, `patient_vitals`, `visit`, `visit_status_history`.
- **Frontend**: `reception/patientRegistration`, `reception/patientVitals`, `reception/queueManagement`.
- **APIs**: `api/patient`, `api/visit`, `api/queue`.
- **Done**: Registration, vitals record, OPD/Emergency queueing, daily clinic token generation.
- **Next**: Real-time queue dashboard, patient search optimization.

### 2. Doctor (Clinical Consult)
- **Database**: `prescription`, `prescription_medicines`, OB/GYN history (`menstrual`, `obstetric`, `para`).
- **Frontend**: `doctor/patientDetails`, `doctor/pharmacyOrder`, `doctor/labOrder`, `doctor/pastVisits`.
- **APIs**: `api/prescription`, `api/clinicalDetails/gynaecologist`.
- **Done**: Comprehensive patient history viewer, integrated pharmacy/lab ordering.
- **Next**: Interactive prescription editor refinements, physician dashboard for pending results.

### 3. Laboratory (Diagnostics)
- **Database**: `lab_test`, `lab_test_parameters`, `lab_test_results`, `lab_order`.
- **Frontend**: `laboratory/labOrder` (tracking), `laboratory/labResult` (entry).
- **APIs**: `api/lab`, `api/lab/testParameters`.
- **Done**: Dynamic parameter system for 10+ test types, technician result entry flow.
- **Next**: Result verification workflow, automated critical value alerts.

### 4. Pharmacy (Inventory & POS)
- **Database**: `medicine`, `medicine_transaction`, `pharmacy_sale`, `medicine_purchase`, `medicine_batch`.
- **Frontend**: `pharmacy/retail` (POS), `pharmacy/purchase`, `pharmacy/returnMedicine`.
- **APIs**: `api/medicine`, `api/inventory`, `api/transactions`.
- **Done**: 3-level trigger-based stock management, full POS workflow with discounts, purchase tracking.
- **Next**: Batch expiry management UI, partial/full sale return processing.

### 5. System & Auth
- **Database**: `staff`, `doctor`.
- **Frontend**: `Login/`.
- **APIs**: `api/login`, `api/logout`, `api/print`.
- **Done**: Role-based authentication (Receptionist, Pharmacist, Lab, etc.), basic receipt printing.
- **Next**: Centralized RBAC middleware, hardware status monitoring (printers, etc.).

## Context Notes
- Database Name: `hims`.
- High priority: Maintaining data integrity through triggers.
- Design focus: Intuitive for medical staff, premium aesthetics.
