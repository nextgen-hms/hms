# Optimization Notes

## High-value technical cleanup

- centralize route-layer SQL patterns and remove duplicated schema assumptions
- replace plaintext password checks with hashed credential verification
- replace placeholder `getCurrentStaffId()` with session-derived user context
- route all visit status changes through `update_and_log_visit_status(...)`
- reconcile route handlers that still use outdated column names or pre-refactor insert shapes

## Frontend

- normalize doctor and lab layouts toward the stronger receptionist/pharmacy patterns
- extract repeated workspace shell patterns
- reduce feature-local type duplication where the same DB shape is used across modules

## Database

- maintain trigger-driven stock model
- document overloaded `get_clinic_number(...)` usage before refactoring callers
- validate if all local SQL artifacts still match live Supabase after future migrations
