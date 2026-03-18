# HMS Architecture

## Overview

HMS is a role-based Next.js application backed by a live Supabase PostgreSQL database. The codebase combines:

- App Router dashboards in `src/app`
- Feature modules in `src/features`
- Shared contexts in `contexts/`
- Direct PostgreSQL access through `database/db.ts`
- Database-side business logic for inventory math, search vectors, and visit-status auditing

## Runtime Shape

### Frontend

- Next.js App Router with route groups and parallel routes
- React client components for most operational workspaces
- Tailwind CSS 4 styling with custom UI primitives in `src/components/ui`
- Toast notifications via `react-hot-toast`

### Backend

- Route handlers under `src/app/api`
- Direct SQL via `pg` pool from `database/db.ts`
- No ORM in active use; `database/schema.prisma` is not the current schema source

### Database

- Live source of truth is Supabase project `vqhlyxhnjjipypzqfpiu`
- Local SQL dumps `dump.sql` and `db_structure.sql` are useful secondary references
- Inventory and POS integrity depend on triggers and views

## Authentication and Access Control

- Login route: `src/app/api/login/route.ts`
- JWTs are signed with `secret_key` and stored in an HTTP-only `token` cookie
- Middleware in `src/middleware.ts` restricts access to:
  - `/doctor` -> `Doctor`
  - `/lab` -> `Lab_Technician`
  - `/receptionist` -> `Receptionist`
  - `/pharmacy` -> `Pharmacist`

Known limitation:

- Login currently compares plaintext password values from `doctor` and `staff`.
- `secure: true` is always set on the auth cookie, which can complicate non-HTTPS local environments.

## Role Workspaces

### Reception

- Layout: `src/app/receptionist/layout.tsx`
- Main concerns: queue entry, patient registration, vitals, OB/GYN forms
- Uses `PatientIdContext` and sidebar/tab switching to coordinate cross-panel work

### Doctor

- Layout: `src/app/doctor/layout.tsx`
- Main concerns: queue review, patient details, prescription ordering, lab ordering, past visits

### Lab

- Layout: `src/app/lab/layout.tsx`
- Main concerns: lab orders, sample/result handling, reporting screens

### Pharmacy

- Layout: `src/app/pharmacy/layout.tsx`
- Main concerns: POS sales, purchases, returns, audit-linked actions
- The richest current workflow is pharmacy retail/POS

## Source Structure

```text
src/
  app/
    (auth)/
    api/
    doctor/
    lab/
    pharmacy/
    receptionist/
  components/ui/
  features/
    Login/
    doctor/
    laboratory/
    pharmacy/
    reception/
    shared/
contexts/
database/
documentation/
```

## Important Data Flows

### Visit Flow

1. Reception creates or selects a patient.
2. A `visit` is created for a patient/doctor pair.
3. Doctor records consultation outputs such as prescription or lab orders.
4. Visit status should be updated with `update_and_log_visit_status(...)`.

Implementation caveat:

- Not every route currently uses the stored procedure. For example, some handlers still update `visit.status` directly. Changes in this area must verify database, API, and frontend together.

### Pharmacy Stock Flow

1. Detail tables (`medicine_purchase_detail`, `pharmacy_sale_detail`, `purchase_return_detail`, `sale_return_detail`) are written.
2. Table triggers insert/update/delete corresponding rows in `medicine_transaction`.
3. `tg_stockquantity_generic` on `medicine_transaction` updates both `medicine` and `medicine_batch`.

### Medicine Search Flow

1. `medicine_search_vector_trigger` runs before insert/update on `medicine`.
2. `medicine_search_vector_update()` maintains the `search_vector`.
3. POS search uses `v_medicine_pos`.

## Known Architectural Realities

- The database-first design is real for inventory and some audit behavior.
- The route layer is not yet fully normalized around stored procedures and shared domain services.
- `getCurrentStaffId()` in `src/lib/utils.ts` still returns a hardcoded placeholder.
- Documentation and future work should treat the current system as a live hybrid, not a fully polished clean architecture implementation.
