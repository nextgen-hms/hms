---
name: hms-dev
description: Master development skill for the Hospital Management System (HMS). Provides deep context on the 38-table PostgreSQL schema, clinical workflows (OB/GYN, Lab, Pharmacy), and architectural principles. Use whenever adding features, fixing bugs, or refactoring code to ensure full-stack consistency across Database, Backend, and Frontend.
---

# HMS Development Master Skill

This skill equips me with the comprehensive knowledge of the Hospital Management System (HMS) architecture, database schema, and medical business logic.

## 🔴 CRITICAL INSTRUCTION: Triple Consistency Check
**Always, when adding or changing a feature, you MUST verify the Database Schema, Backend Endpoint, and Frontend implementation to detect and resolve discrepancies.** 
Ensure the system is perfectly consistent in all 3 parts:
1.  **Database**: Columns, Triggers, and Constraints.
2.  **Backend**: API Route logic, SQL queries, and Zod validation.
3.  **Frontend**: Types, Form Handling, and UI state.

---

## Project Context
- **Vision**: Offline-first healthcare solution (Next.js 15, Electron, PostgreSQL 18).
- **Primary Schema**: `public` (38 tables, 10 functions, 6 triggers).
- **Database Name**: `hims`.

## Architectural Principles
- **Database-First Logic**: Triggers handle all inventory math and status auditing. **NEVER bypass triggers.**
- **Feature-Based Modularity**: Code resides in `src/features/[module]`.
- **Type Safety**: Unified TypeScript definitions and strict Zod validation.

---

## Core Domain Knowledge

### 1. Database & Schema (Source of Truth)
The system relies on a complex relational structure. Before any database-related work, you must load the schema map.
- **Reference**: [.agent/skills/hms-dev/references/complete_database_schema.md](file:///home/oops/projects/hms/.agent/skills/hms-dev/references/complete_database_schema.md)
- **Key Files**: `db_structure.sql`, `DATABASE.md`.

### 2. Clinical & Patient Workflow
- **Patient & Visit**: Linked via `patient_id`. Visit status is tracked atomically via `update_and_log_visit_status`.
- **OB/GYN**: Specialized tables for `current_pregnancy`, `obstetric_history`, and `para_details`.
- **Lab**: Multi-parameter tests with verification stages and automated flagging.

### 3. Pharmacy & Inventory
- **Dual-Level Sync**: Stocks are updated in BOTH `medicine` (aggregate) and `medicine_batch` (expiry-specific) via `fn_tg_stockquantity_generic`.
- **Audit Ledger**: Every movement is recorded in `medicine_transaction`.

---

## Development Guidelines
- **UI/UX**: Premium Next.js 15 aesthetic. Use HSL tokens, Lucide icons, and Radix primitives.
- **Security**: 100% parameterized SQL queries. HTTP-only JWT cookies.
- **Verification**: Use existing `check_stock_available()` and `get_clinic_number()` functions.

## Resources
- [Architecture Guide](file:///home/oops/projects/hms/ARCHITECTURE.md)
- [Database Overview](file:///home/oops/projects/hms/documentation/database.md)
- [Progress Tracker](file:///home/oops/projects/hms/documentation/progress.md)
