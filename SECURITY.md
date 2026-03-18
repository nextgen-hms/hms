# Security Policy

## Supported Branch

Only the current default branch should be considered supported for security fixes.

## Reporting

Do not report security issues in public issues or discussions. Report them privately to the project owner/team through an agreed private channel.

Include:

- affected path(s)
- reproduction steps
- expected impact
- any proof of concept

## Verified Security Posture

Current implementation facts:

- Route handlers use parameterized SQL with `pg`
- Auth uses JWT cookies and role checks in middleware
- Database connections use TLS when `DATABASE_URL` is set
- Access control is path-based by role for doctor, lab, receptionist, and pharmacy workspaces

## Known Gaps

- Password verification is currently plaintext comparison in login queries
- `getCurrentStaffId()` is still a placeholder returning `1`
- No RLS is enabled on the application tables in the live `public` schema
- The app relies on middleware and route logic rather than database-enforced user isolation

These should be treated as active risks in any production deployment.

## Deployment Expectations

- rotate database credentials and JWT secret
- run behind HTTPS
- restrict database access to trusted hosts only
- add centralized audit review for POS and clinical operations
- harden session expiration and logout behavior
- implement hashed passwords before production use
