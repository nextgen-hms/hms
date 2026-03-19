# Doctor Module Replacement And Stabilization

## Goal
Replace the current doctor module with a visit-explicit workflow that removes implicit latest-visit lookups, separates doctor notes from reception complaint data, stabilizes status transitions, and preserves prescription/lab data correctly during and after submission.

## Phases
| Phase | Status | Scope |
|---|---|---|
| A | complete | Add new doctor-domain persistence and shared service helpers behind current routes |
| B | complete | Switch doctor reads to visit-explicit context and deterministic history retrieval |
| C | complete | Switch doctor writes for notes, status, prescriptions, and labs to explicit visit contracts |
| D | pending | Remove legacy fallback paths and compatibility-only behavior |
| E | pending | Rename misleading routes/files and delete dead code/tests |

## Execution Notes
- Keep the doctor workspace usable while compatibility routes remain in place.
- Prefer shared server-side helpers over route-local SQL.
- Verify database, backend route contracts, and frontend assumptions together for each phase.

## Errors Encountered
| Error | Attempt | Resolution |
|---|---|---|
| Shared doctor helper expected `db.query`, but some routes passed the bare `query` function | 1 | Added a `runQuery(...)` adapter so helpers accept both pooled clients and the route-level query function |
| Updated tests failed after explicit visit enforcement changed payloads and queue mocking behavior | 1 | Aligned route tests and workspace mocks with visit-explicit payloads and `useOptionalDoctorWorkspace` |
