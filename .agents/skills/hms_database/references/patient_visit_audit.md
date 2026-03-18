# Patient and Visit Audit Logic

## Core lifecycle tables

- `patient`
- `visit`
- `patient_vitals`
- `visit_status_history`
- `bill`
- `bill_item`

## Visit workflow

Live schema supports these visit states:

- `waiting`
- `seen_by_doctor`
- `medicines_dispensed`
- `lab_tests_done`
- `payment_done`
- `completed`
- `admitted`
- `discharged`

## Auditing

### Clinical visit state

The intended path is:

1. call `update_and_log_visit_status(...)`
2. update the current `visit.status`
3. insert an audit row into `visit_status_history`

### POS actions

`pos_audit_log` stores retail operational events such as:

- `SALE_COMPLETED`
- `RECEIPT_PRINTED`
- `CASH_DRAWER_OPENED`

## Numbering

There are three live `get_clinic_number(...)` function signatures. Do not assume only the zero-argument variant exists.

## Data-density caution

Live POS audit data is present. Many clinical tables are currently sparse. Describe structure confidently, but describe observed operational usage only where live rows exist.
