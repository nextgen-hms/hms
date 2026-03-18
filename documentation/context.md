# Project Context

HMS is a clinic-focused operational system with stronger implementation maturity in pharmacy/POS and active foundational support for reception, doctor, lab, and OB/GYN workflows.

## Current Truths

- Live database runs on Supabase PostgreSQL `17.6.1`
- Frontend runs on Next.js `16.1.6`
- Auth is cookie/JWT based
- The database is intended to own inventory math and visit-status audit logic

## Current System Character

- Not offline-first
- Not Electron-based
- Not ORM-driven
- Not yet fully standardized in UI or backend abstractions

## What matters most when changing features

- schema names and constraints
- trigger-driven inventory behavior
- role-specific route access
- cross-panel patient context behavior
