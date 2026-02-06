# Patient, Visit & Audit Trail Logic

The HMS tracks the entire patient lifecycle from registration through visits to billing.

## Patient Management
- `patient`: Basic demographics and CNIC (unique).
- `patient_vitals`: Historic vitals linked to specific visits.

## Visit Workflow
A visit transitions through several states, strictly enforced by `visit_status_check`:
- `waiting` -> `seen_by_doctor` -> `completed`
- Optional paths: `medicines_dispensed`, `lab_tests_done`, `payment_done`, `admitted`, `discharged`.

### Status Auditing
- `visit_status_history`: Every change in visit status is logged here.
- `pos_audit_log`: Specifically tracks POS actions like `SALE_COMPLETED` and `CASH_DRAWER_OPENED`.

## Specialized History (OB/GYN)
For female patients, the system tracks:
1. `menstrual_history`: Menarche age, cycles, surgeries.
2. `obstetric_history`: Gravida, Para, Abortions (GPA), EDD, and last menstrual cycle.
3. `para_details`: Detailed outcomes for each previous pregnancy (Birth year, mode, GA).
4. `current_pregnancy`: Specific tracker for the active visit's pregnancy findings (FHR, presentation).

## Dynamic numbering
- `get_clinic_number()`: Automatically resets daily to provide sequential OPD tokens (1, 2, 3...).
