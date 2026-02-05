---
name: hms-dev
description: Specialized skill for Hospital Management System (HMS) development with deep knowledge of the database schema and clinical workflows.
---

# HMS Development Skill

This skill equips me with the knowledge of your Hospital Management System's architecture, database schema, and business logic, following an **offline-first** philosophy.

## Project Context
- **Vision**: Offline-first healthcare solution for small/medium facilities.
- **Framework**: Next.js 15 (App Router, Server Components).
- **Desktop**: Electron (for cross-platform desktop integration).
- **Styling**: Tailwind CSS 4.
- **Database**: PostgreSQL 18.1 (Local database name: `hims`).
- **Primary Schema**: `public` (defined in `db_structure.sql`).

## Architectural Principles
- **Feature-Based Modularity**: Logic is organized in `src/features/[module]` (Doctor, Pharmacy, Lab, Reception).
- **Database-First Logic**: Extensive use of **Triggers**, **Views**, and **Stored Functions** to enforce data integrity and automate stock movements.
- **Type Safety**: End-to-end TypeScript with Zod for schema validation.

## Core Domain Knowledge

### 1. Patient & Clinical Workflow
- **Patient**: Managed in `patient` table (CNIC, age, gender).
- **Vitals**: Linked to `visit`. One record per visit.
- **Visits**: Central clinical entity. Status history logged in `visit_status_history`.
- **Specialized History**: Tables for `obstetric_history`, `menstrual_history`, and `current_pregnancy`.

### 2. Pharmacy & Inventory
- **Real-time Stock**: `medicine` table handles units/sub-units. **Automated by triggers** on every transaction.
- **Batches**: `medicine_batch` for expiry and pricing.
- **Transactions**: `medicine_transaction` is the central audit trail for ALL movements.

### 3. Lab & Diagnostics
- **Lab Orders**: Tracks status from 'Pending' to 'Completed'.
- **Tests**: Defined in `lab_test` and `lab_test_parameters`.
- **Approvals**: Verification process in `lab_result_approvals`.

### 4. Financial & Billing
- **Billing**: Itemized invoices via `bill` and `bill_item`.
- **Pharmacy POS**: Supports "Held Transactions" and full audit logs.

## Development Guidelines
- **UI/UX**: Premium aesthetic, HSL colors, smooth transitions, intuitive for medical staff.
- **Git Strategy**: Use `feature/` or `fix/` branches.
- **Database Integrity**: Never bypass triggers. Use existing functions like `get_clinic_number` or `check_stock_available`.
- **Modularity**: Place new components in the appropriate feature folder within `src/features`.

## Resources
- [README](file:///home/oops/projects/hms/README.md)
- [Architecture Guide](file:///home/oops/projects/hms/ARCHITECTURE.md)
- [Database Schema Documentation](file:///home/oops/projects/hms/DATABASE.md)
- [Context Tracker](file:///home/oops/projects/hms/documentation/context.md)
