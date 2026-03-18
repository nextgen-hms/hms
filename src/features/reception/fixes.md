# Reception Module Fix Record

This file records the reception-module fixes implemented during the hardening pass.

Rule followed throughout:

- Supabase live schema, constraints, procedures, and observed data patterns were treated as the only source of truth.
- Local SQL dumps and DB model files were not used to define behavior.

## 1. Visit update was patient-wide instead of visit-specific

Problem:

- `PATCH /api/visit` updated `visit` rows using `patient_id`.
- A patient with multiple visits could have more than one visit mutated unintentionally.

Fix:

- Changed the API contract so `PATCH /api/visit` requires `visit_id`.
- Updated the SQL to target `where visit_id = $1 and is_deleted = false`.
- Updated reception queue-management code to send `visit_id` instead of `patient_id`.

Files:

- [route.ts](/home/oops/projects/hms/src/app/api/visit/route.ts)
- [usePatientForm.ts](/home/oops/projects/hms/src/features/reception/queueManagement/hooks/usePatientForm.ts)

## 2. Visit delete was patient-wide instead of visit-specific

Problem:

- Visit deletion used patient-scoped deletion logic.
- A receptionist action could soft-delete all visits for one patient.

Fix:

- Added visit-specific delete behavior to `DELETE /api/visit` with a request body containing `visit_id`.
- Tightened legacy `[patientId]` route behavior so it also deletes by `visit_id`, not `patient_id`.
- Updated shared queue deletion to pass `visit_id` and remove only the matching queue row locally.

Files:

- [route.ts](/home/oops/projects/hms/src/app/api/visit/route.ts)
- [route.ts](/home/oops/projects/hms/src/app/api/visit/[patientId]/route.ts)
- [api.ts](/home/oops/projects/hms/src/features/shared/queue/api.ts)
- [useQueue.ts](/home/oops/projects/hms/src/features/shared/queue/hooks/useQueue.ts)
- [Queue.tsx](/home/oops/projects/hms/src/features/shared/queue/components/Queue.tsx)

## 3. Visit status updates bypassed the audit procedure

Problem:

- Reception status updates wrote directly to `visit.status`.
- `visit_status_history` remained empty in live DB.

Fix:

- Updated `PATCH /api/visit/status` to call `update_and_log_visit_status(...)`.
- Kept `visit_id` + `status` as the external contract.
- Used `getCurrentStaffId()` for `updated_by_staff` fallback when no explicit staff id is passed.
- Removed the dead `rows.length < 0` condition and replaced it with real not-found handling.

Files:

- [route.ts](/home/oops/projects/hms/src/app/api/visit/status/route.ts)

## 4. Obstetric history creation was broken by placeholder mismatch

Problem:

- The create route used 10 SQL placeholders for 9 columns.
- Obstetric-history creation could not succeed.

Fix:

- Corrected the `INSERT` placeholder count.
- Standardized response handling so successful create/update returns a single record, and not-found/update failures return clearer API responses.

Files:

- [route.ts](/home/oops/projects/hms/src/app/api/clinicalDetails/gynaecologist/obstetric/route.ts)

## 5. Para creation could corrupt all obstetric rows

Problem:

- Para create logic updated `obstetric_history.para` without a `WHERE` clause.
- One submission could rewrite every obstetric-history row.

Fix:

- Scoped the para-count update to `where obstetric_history_id = $2`.
- Preserved per-row upsert behavior in the patch path.

Files:

- [route.ts](/home/oops/projects/hms/src/app/api/clinicalDetails/gynaecologist/para/route.ts)

## 6. Vitals were inferred from “today’s visit” instead of explicit visit selection

Problem:

- Vitals create/read/update used `patient_id` and derived visit identity from same-day queries.
- This was unsafe because live Supabase data already contains duplicate same-day visits.

Fix:

- Changed vitals APIs to use explicit `visit_id`.
- `GET /api/patientVitals/[id]` now interprets `[id]` as `visit_id`.
- `POST` and `PATCH` require `visit_id`.
- Updated vitals hook and form to use `selectedVisitId` from shared reception context.
- Added inline create/update state messaging so users can see whether a record already exists for the selected visit.

Files:

- [route.ts](/home/oops/projects/hms/src/app/api/patientVitals/route.ts)
- [route.ts](/home/oops/projects/hms/src/app/api/patientVitals/[id]/route.ts)
- [api.ts](/home/oops/projects/hms/src/features/reception/patientVitals/api.ts)
- [usePatientVitals.ts](/home/oops/projects/hms/src/features/reception/patientVitals/hooks/usePatientVitals.ts)
- [PatientVitalsForm.tsx](/home/oops/projects/hms/src/features/reception/patientVitals/components/PatientVitalsForm.tsx)

## 7. Current-pregnancy workflow used `max(visit_id)` instead of selected encounter

Problem:

- Current pregnancy logic did not use the selected queue encounter.
- It depended on lookup behavior that did not match the live visit-anchored schema.

Fix:

- Removed the frontend dependency on the `getVisitId` helper route.
- Changed current-pregnancy fetch/update behavior to use explicit `selectedVisitId`.
- Updated the backend read path to fetch `current_pregnancy` by `visit_id`.
- Updated create/update API validation to require `visit_id`.
- Added inline create/update state messaging to the form.

Files:

- [route.ts](/home/oops/projects/hms/src/app/api/clinicalDetails/gynaecologist/currentPregnancy/route.ts)
- [route.ts](/home/oops/projects/hms/src/app/api/clinicalDetails/gynaecologist/currentPregnancy/[patientId]/route.ts)
- [api.ts](/home/oops/projects/hms/src/features/reception/clinicalDetails/Gynaecologist/currentPregnancy/api.ts)
- [useCurrentPregnancy.ts](/home/oops/projects/hms/src/features/reception/clinicalDetails/Gynaecologist/currentPregnancy/hooks/useCurrentPregnancy.ts)
- [CurrentPregnancyForm.tsx](/home/oops/projects/hms/src/features/reception/clinicalDetails/Gynaecologist/currentPregnancy/components/CurrentPregnancyForm.tsx)

## 8. Reception state only tracked patient id, not selected visit

Problem:

- The reception workflow was patient-centric in UI state even though live DB behavior is visit-centric.
- Downstream visit-bound workflows had no reliable encounter anchor.

Fix:

- Expanded shared context to carry:
  - `patientId`
  - `selectedVisitId`
  - `setPatientVisit(...)`
  - `clearSelection()`
- Queue row selection now sets both patient and visit together.
- Queue creation now stores the new `visit_id` in shared state.

Files:

- [PatientIdContext.tsx](/home/oops/projects/hms/contexts/PatientIdContext.tsx)
- [Queue.tsx](/home/oops/projects/hms/src/features/shared/queue/components/Queue.tsx)
- [usePatientForm.ts](/home/oops/projects/hms/src/features/reception/queueManagement/hooks/usePatientForm.ts)

## 9. Queue API and shared queue types did not expose visit identity strongly enough

Problem:

- The queue UI could not safely drive downstream visit-bound workflows unless `visit_id` was always present.

Fix:

- Updated `/api/queue` to include `visit_id` and `status`.
- Updated shared queue types so `visit_id` is required in practice.
- Changed queue card keys to use `visit_id`, avoiding duplicate React keys when the same patient appears multiple times.

Files:

- [route.ts](/home/oops/projects/hms/src/app/api/queue/route.ts)
- [types.ts](/home/oops/projects/hms/src/features/shared/queue/types.ts)
- [Queue.tsx](/home/oops/projects/hms/src/features/shared/queue/components/Queue.tsx)

## 10. Registration CNIC validation was stricter than live DB

Problem:

- Live `patient.cnic` is nullable in Supabase.
- Reception registration required CNIC via frontend validation.

Fix:

- Made CNIC optional in the registration schema while keeping format validation when a value is provided.

Files:

- [types.ts](/home/oops/projects/hms/src/features/reception/patientRegistration/types.ts)

## 11. Vitals UI was missing `AB-`

Problem:

- Live Supabase blood-group constraint includes `AB-`.
- The vitals form did not offer it.

Fix:

- Added `AB-` to the blood-group select.

Files:

- [PatientVitalsForm.tsx](/home/oops/projects/hms/src/features/reception/patientVitals/components/PatientVitalsForm.tsx)

## 12. Queue search results used nested buttons

Problem:

- A result row was a button containing another button.
- This is invalid interactive nesting and causes accessibility/keyboard problems.

Fix:

- Removed the nested button.
- Kept the visual quick-entry cue as a non-interactive element inside the main button row.

Files:

- [QueueManagement.tsx](/home/oops/projects/hms/src/features/reception/queueManagement/components/QueueManagement.tsx)

## 13. Clinical-details page exposed unsupported specialties

Problem:

- Reception users were shown non-functional specialty choices.

Fix:

- Removed the unsupported specialty selector behavior.
- Locked the page to the implemented gynecology workflow only.

Files:

- [page.tsx](/home/oops/projects/hms/src/app/receptionist/@clinicalDetails/page.tsx)

## 14. Forms exposed create/update ambiguity without persistent state

Problem:

- Several reception forms showed create and update actions without clearly indicating record state.
- Workflow relied too much on toasts.

Fix:

- Added persistent inline mode/status messaging for:
  - vitals
  - current pregnancy
  - menstrual history
  - obstetric history
  - para details
- Changed forms to show one primary action based on current record state instead of always showing separate save/update buttons.

Files:

- [usePatientVitals.ts](/home/oops/projects/hms/src/features/reception/patientVitals/hooks/usePatientVitals.ts)
- [PatientVitalsForm.tsx](/home/oops/projects/hms/src/features/reception/patientVitals/components/PatientVitalsForm.tsx)
- [useCurrentPregnancy.ts](/home/oops/projects/hms/src/features/reception/clinicalDetails/Gynaecologist/currentPregnancy/hooks/useCurrentPregnancy.ts)
- [CurrentPregnancyForm.tsx](/home/oops/projects/hms/src/features/reception/clinicalDetails/Gynaecologist/currentPregnancy/components/CurrentPregnancyForm.tsx)
- [useMenstrualHistory.ts](/home/oops/projects/hms/src/features/reception/clinicalDetails/Gynaecologist/menstrualHistory/hooks/useMenstrualHistory.ts)
- [MenstrualHistoryForm.tsx](/home/oops/projects/hms/src/features/reception/clinicalDetails/Gynaecologist/menstrualHistory/components/MenstrualHistoryForm.tsx)
- [useObstetricHistory.ts](/home/oops/projects/hms/src/features/reception/clinicalDetails/Gynaecologist/obstetricHistory/hooks/useObstetricHistory.ts)
- [ObstetricHistoryForm.tsx](/home/oops/projects/hms/src/features/reception/clinicalDetails/Gynaecologist/obstetricHistory/components/ObstetricHistoryForm.tsx)
- [useParaDetails.ts](/home/oops/projects/hms/src/features/reception/clinicalDetails/Gynaecologist/paraDetails/hooks/useParaDetails.ts)
- [ParaDetailsForm.tsx](/home/oops/projects/hms/src/features/reception/clinicalDetails/Gynaecologist/paraDetails/components/ParaDetailsForm.tsx)

## 15. Registration search selection caused redundant loads

Problem:

- Search-result selection triggered duplicate patient loading.

Fix:

- Simplified selection flow so context changes drive loading once.
- Removed the redundant second load on manual selection.

Files:

- [usePatientRegistration.ts](/home/oops/projects/hms/src/features/reception/patientRegistration/hooks/usePatientRegistration.ts)
- [PatientRegistration.tsx](/home/oops/projects/hms/src/features/reception/patientRegistration/components/PatientRegistration.tsx)

## 16. Automated regression coverage added

Fix:

- Added a lightweight Vitest-based test harness.
- Added route-level regression tests for:
  - visit update scoping
  - status audit procedure use
  - para count scoping
  - vitals explicit visit binding
  - current pregnancy read by visit
- Added UI/schema regression tests for:
  - optional CNIC validation
  - no nested buttons in queue search results

Files:

- [package.json](/home/oops/projects/hms/package.json)
- [vitest.config.ts](/home/oops/projects/hms/vitest.config.ts)
- [api-hardening.test.ts](/home/oops/projects/hms/src/features/reception/__tests__/api-hardening.test.ts)
- [ui-hardening.test.tsx](/home/oops/projects/hms/src/features/reception/__tests__/ui-hardening.test.tsx)

## Verification Completed

The following verification was run after implementation:

- `pnpm test`
- `pnpm exec tsc --noEmit`
- `pnpm exec eslint ...` on the touched reception/API/test files

Result:

- tests passed
- typecheck passed
- lint passed for the touched files
