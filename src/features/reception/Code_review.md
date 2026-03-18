# Reception Module Code Review

## Scope

Reviewed current reception-module code after the hardening fixes recorded in `src/features/reception/fixes.md`.

Scope covered:

- `src/app/receptionist/*`
- `src/features/reception/*`
- reception-relevant shared queue code under `src/features/shared/queue/*`
- reception APIs under `src/app/api/patient*`, `src/app/api/visit*`, `src/app/api/queue`, and `src/app/api/clinicalDetails/gynaecologist/*`

Validation performed:

- targeted static review of the reception UI, hooks, and API handlers
- `pnpm exec eslint src/app/receptionist src/app/api/patient src/app/api/patientVitals src/app/api/visit src/app/api/queue src/app/api/clinicalDetails/gynaecologist src/features/reception src/features/shared/queue contexts/PatientIdContext.tsx --ext .ts,.tsx`
- `pnpm test src/features/reception/__tests__/api-hardening.test.ts src/features/reception/__tests__/ui-hardening.test.tsx src/features/reception/__tests__/queue-management-loop.test.tsx`

## Findings

### 1. High: completed or discharged visits can still be treated as active reception encounters

Files:

- `src/app/api/visit/[patientId]/route.ts`
- `src/app/api/queue/route.ts`
- `src/features/reception/queueManagement/hooks/usePatientForm.ts`

Problem:

- `POST /api/visit` correctly treats only non-`completed` and non-`discharged` visits as active.
- The reception lookup route `GET /api/visit/[patientId]` does not apply that same status filter.
- The queue list route `GET /api/queue` also returns every non-deleted visit for today, including completed and discharged rows.

Impact:

- A patient with a same-day completed visit can still be loaded as if an editable active visit exists.
- Reception can reopen and overwrite a finished encounter instead of creating a new one.
- Completed visits can remain visible in the active queue UI and be selected again downstream.

### 2. High: para-details form and API disagree on `birth_month`, causing runtime write failures

Files:

- `src/features/reception/clinicalDetails/Gynaecologist/paraDetails/components/ParaDetailsForm.tsx`
- `src/app/api/clinicalDetails/gynaecologist/para/route.ts`
- `db_structure.sql`

Problem:

- The UI presents `Birth Month` as free text and even suggests values like `June`.
- The backend converts `birth_month` with `parseInt(...)`.
- The live schema stores `para_details.birth_month` as `integer`.

Impact:

- Entering a month name yields `NaN`, which turns into a database error on create or update.
- This breaks para-details submission for normal receptionist input.

### 3. Medium: menstrual-history update can report success even when nothing was updated

Files:

- `src/app/api/clinicalDetails/gynaecologist/menstrualHistory/route.ts`
- `src/features/reception/clinicalDetails/Gynaecologist/menstrualHistory/hooks/useMenstrualHistory.ts`

Problem:

- `PATCH /api/clinicalDetails/gynaecologist/menstrualHistory` always returns `200`, even when `UPDATE ... RETURNING *` affects zero rows.
- The frontend trusts that success response and always shows a success toast.

Impact:

- Users can be told that a menstrual-history update succeeded when no record exists and nothing was written.
- This creates false confidence in clinical documentation state.

### 4. Medium: patient registration still performs duplicate patient loads on one selection

Files:

- `src/features/reception/patientRegistration/hooks/usePatientRegistration.ts`
- `src/features/reception/patientRegistration/components/PatientRegistration.tsx`

Problem:

- The hook listens to `patientId` changes and calls `loadPatient(patientId)`.
- The component also listens to the same `patientId` and calls `loadPatient(patientId)` again before populating the form.

Impact:

- One patient selection triggers two `/api/patient/:id` requests.
- The module still has avoidable duplicated network traffic in a path that should be single-load.
- This increases race and maintenance risk around form state hydration.

### 5. Medium: current-pregnancy fetch is also duplicated on each visit change

Files:

- `src/features/reception/clinicalDetails/Gynaecologist/currentPregnancy/hooks/useCurrentPregnancy.ts`
- `src/features/reception/clinicalDetails/Gynaecologist/currentPregnancy/components/CurrentPregnancyForm.tsx`

Problem:

- The hook fetches current-pregnancy data in its own `useEffect`.
- The form component runs another `useEffect` that calls the same fetch again for the same `patientId` and `selectedVisitId`.

Impact:

- Selecting one visit causes duplicate reads for the same record.
- This is another remaining unnecessary-request path in reception after the queue-management loop fix.

### 6. Medium: direct patient-ID entry still breaks visit-anchored workflows

Files:

- `contexts/PatientIdContext.tsx`
- `src/features/reception/patientVitals/components/PatientVitalsForm.tsx`
- `src/app/receptionist/@clinicalDetails/page.tsx`

Problem:

- `setPatientId(...)` intentionally clears `selectedVisitId`.
- The vitals form and clinical-details page still present direct patient-ID entry fields that call `setPatientId(...)` on Enter.
- Vitals and current-pregnancy flows require an explicit selected visit, not just a patient.

Impact:

- The UI presents an entry path that looks supported but silently drops the visit context those screens need.
- Users can type a patient ID, then immediately lose the visit-bound workflow state required for vitals and pregnancy records.

### 7. Low: stale `getVisitId` helper route still encodes the pre-fix `max(visit_id)` behavior

File:

- `src/app/api/clinicalDetails/gynaecologist/currentPregnancy/getVisitId/[patientId]/route.ts`

Problem:

- The route still resolves visits with `max(visit_id)`.
- The current frontend no longer uses it, but it remains in the codebase unchanged.

Impact:

- The original visit-resolution bug is still available for future reuse.
- This increases regression risk because the repo still contains an incorrect “helper” endpoint next to the fixed flow.

## Verification Summary

- Reception-specific lint run completed with warnings only, no errors.
- Reception hardening test suite passed: `3` files, `8` tests.
- No live browser session was run for this review pass.

