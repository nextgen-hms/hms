# HMS Architecture

## Application Layers

- UI and role workspaces: `src/app/*`
- Feature logic and hooks: `src/features/*`
- Shared contexts: `contexts/*`
- API routes: `src/app/api/*`
- Database access: `database/db.ts`
- Source-of-truth database: Supabase PostgreSQL

## Current Stack

- Next.js `16.1.6`
- React `19.1.0`
- Tailwind CSS `4`
- `pg` for SQL access
- `jose` for JWT signing and verification

## Auth Model

- Login issues a JWT in the `token` cookie
- Middleware enforces path access by role
- Role names used in code: `Doctor`, `Receptionist`, `Pharmacist`, `Lab_Technician`

## Workspace Layouts

- `src/app/receptionist/layout.tsx`: queue + patient workflow shell
- `src/app/doctor/layout.tsx`: doctor queue and consultation shell
- `src/app/lab/layout.tsx`: lab workflow shell
- `src/app/pharmacy/layout.tsx`: pharmacy retail, purchase, and return shell

## Shared State

- `PatientIdContext` coordinates active patient/visit work across panels
- `SidebarContext` supports receptionist workspace navigation

## Architectural Constraints

- Inventory logic depends on DB triggers; do not bypass them casually
- Some API routes are not yet normalized and may reference outdated column assumptions; schema verification is required before editing
- There is no active service layer or repository abstraction between route handlers and SQL
