# HMS Feature Map

## Login and Session

- User-code based login lookup
- JWT cookie issuance
- Middleware role gating

Known gap:

- password handling is not yet hardened

## Reception

- patient registration
- live patient search and load
- queue entry and management
- vitals entry
- OB/GYN clinical details

Key code:

- `src/features/reception/patientRegistration`
- `src/features/reception/queueManagement`
- `src/features/reception/patientVitals`
- `src/features/reception/clinicalDetails`

## Doctor

- patient queue
- patient details
- prescription order form
- lab order form
- previous prescriptions/lab orders
- past visit review

## Laboratory

- lab order retrieval
- result entry
- report-oriented views

## Pharmacy

- OTC/POS retail checkout
- medicine search with batch-aware results
- purchase entry
- purchase return UI
- medicine return flow
- POS audit logging and receipt/print related routes

Observed live DB semantics:

- retail sales can exist without `visit_id`
- sub-unit sales are actively represented in `pharmacy_sale_detail` and `medicine_transaction`

## Shared

- queue helpers
- patient helpers
- reusable types/utilities
