# 🏗️ HMS Architecture Documentation

> **Hospital Management System - Technical Architecture Guide**

This document provides a comprehensive overview of the HMS architecture, design decisions, data flow, and technical implementation details for contributors and developers.

---

## 📑 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Principles](#architecture-principles)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Data Flow Architecture](#data-flow-architecture)
6. [Database Architecture](#database-architecture)
7. [Frontend Architecture](#frontend-architecture)
8. [API Layer](#api-layer)
9. [Feature Modules](#feature-modules)
10. [Security Architecture](#security-architecture)
11. [Deployment Architecture](#deployment-architecture)
12. [Performance Considerations](#performance-considerations)

---

## 🎯 System Overview

### Design Philosophy

HMS follows a **feature-based modular architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│              (Next.js App Router + React)                │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                      API Layer                           │
│            (Next.js API Routes + Server Actions)         │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                   Database Layer                         │
│    (PostgreSQL + Triggers + Views + Stored Functions)   │
└─────────────────────────────────────────────────────────┘
```

### Core Design Goals

- **📊 Data Integrity**: Database-level constraints, triggers, and transactions ensuring medical data reliability.
- **⚡ Performance**: Optimized queries, efficient indexing, and leveraging Server-Side Rendering (SSR).
- **🎨 Simplicity**: A clean, intuitive interface optimized for healthcare professional workflows.
- **🔐 Security**: Granular Role-Based Access Control (RBAC) and exhaustive audit trails.
- **📈 Scalability**: A modular design that supports adding new medical specialties and modules with ease.

---

## 🏛️ Architecture Principles

### 1. **Feature-Based Organization**

All domain-specific code is logically grouped under `src/features`. Each module (e.g., Doctor, Pharmacy, laboratory) encapsulates its own:
- **UI Components**: Specialized React components for that domain.
- **Hooks**: Custom React hooks for data management and UI logic.
- **Business Logic**: Core functional algorithms and validation rules.
- **Types**: Module-specific TypeScript interfaces.

### 2. **Database-First Approach**

We treat the database as a "smart" layer rather than just storage:
- **Triggers**: Handle automated tasks like stock synchronization and sequential numbering.
- **Functions**: Encapsulate complex logic like stock availability checks.
- **Views**: Provide pre-filtered and computed data for dashboards (e.g., low stock).
- **Referential Integrity**: Strict use of foreign keys to prevent orphan records.

### 3. **Full-Stack Type Safety**

End-to-end reliability is enforced via:
- **TypeScript**: Shared types used by both API routes and frontend components.
- **Zod**: Robust runtime validation for all incoming API data and form inputs.

### 4. **Modern Framework Utilization**

Built on Next.js 15.5.0, utilizing:
- **App Router**: For modern routing and layout patterns.
- **React Server Components (RSC)**: To minimize client-side bundle sizes.
- **Server Actions**: For secure, direct communication between the UI and backend logic.

---

## 🔧 Technology Stack

### **Frontend Stack**

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.5.0 | Core framework and Routing |
| React | 19.1.0 | UI Layer |
| TypeScript | 5.x | Static typing and reliability |
| TailwindCSS | 4.x | Design system and styling |
| Radix UI | Latest | Accessible UI primitives |
| Lucide React | 0.541.0 | Iconography |
| React Hook Form | 7.62.0 | Form state and validation management |
| Zod | 4.1.7 | Data schema validation |
| React Hot Toast | 2.6.0 | User feedback and notifications |

### **Backend Stack**

| Technology | Purpose |
|------------|---------|
| Next.js API Routes | Serverless REST endpoints |
| PostgreSQL | Primary relational database |
| pg (node-postgres) | High-performance DB adapter |
| Server Actions | Secure mutation handler |

### **Development Workflow Tools**

| Tool | Purpose |
|------|---------|
| ESLint | Code quality and linting |
| TypeDoc | Automated API documentation generation |
| pnpm/pnpm | Modern package management |

---

## 📁 Project Structure

```
hms/
├── src/
│   ├── app/                      # Next.js App Router (Entry points & Layouts)
│   │   ├── (auth)/              # Login and Register flows
│   │   ├── api/                 # API Routes (clinical, inventory, patient, transactions, etc.)
│   │   ├── dashboard/           # Main stats and overview pages
│   │   ├── doctor/              # Doctor workspace and patient consultation views
│   │   ├── lab/                 # Laboratory management and result entry
│   │   ├── pharmacy/            # POS and pharmacy-specific views
│   │   ├── receptionist/        # Patient registration and intake management
│   │   ├── layout.tsx           # Main application layout wrapper
│   │   └── globals.css          # Global Tailwind styles
│   │
│   ├── features/                # Domain-Specific Logic (The "Heart" of HMS)
│   │   ├── Login/               # Authentication UI and logic
│   │   ├── doctor/              # Consultation tools, Vitals, Prescription logic
│   │   ├── laboratory/          # Test catalog, Order processing, Results
│   │   ├── pharmacy/            # Medicine batches, Sales POS, Inventory sync
│   │   ├── reception/           # Patient records, Visit queuing, Billing
│   │   └── shared/              # Reusable modules (Alerts, Tables, Modals)
│   │
│   ├── components/              # Shared architectural UI components
│   ├── contexts/                # Global state (AuthContext, ThemeContext)
│   ├── hooks/                   # Generic system-wide hooks (useFetch, useDebounce)
│   ├── lib/                     # Low-level utilities (Postgres Client, Date formatting)
│   ├── styles/                  # Shared theme and animation definitions
│   └── types/                   # Central TypeScript definition store
│
├── database/                    # Connection setup and SQL migrations
├── documentation/               # Detailed architectural and user guides
├── public/                      # Static assets (brand logos, SVG icons)
├── DATABASE.md                 # Table-level schema documentation
└── package.json                # Project manifest and scripts
```

---

## 🔄 Data Flow Architecture

### **1. General Interaction Flow**

```
User Action → React View (Client) 
  → Server Action / API Route (Server) 
  → Zod Validation (Clean Data)
  → DB Client (SQL Execution)
  → PostgreSQL Triggers (Auto-Logic)
  → Response → UI State Update
```

### **2. Inventory Synchronization Flow (Pharmacy)**

Example: Record a New Sale
1. Pharmacist selects medicine and specific **Batch**.
2. Form posts to `/api/dispense`.
3. `pharmacy_sale_detail` is updated with raw data.
4. **Trigger**: `fn_tg_sale_detail_to_txn` automatically creates a record in `medicine_transaction`.
5. **Trigger**: `fn_tg_stockquantity_generic` calculates new inventory for both the specific `medicine_batch` and the overall `medicine` record.
6. The UI reflects the new stock levels instantly via revalidation.

### **3. Clinical Consultation Flow**

1. Receptionist initiates a `visit` entry.
2. Doctor workspace updates via dynamic queue (`/api/queue`).
3. Doctor records `patient_vitals` and writes a `prescription`.
4. Stored Procedure `update_and_log_visit_status` atomicity updates visit status and creates an audit log entry.
5. Patient appears in Pharmacy/Lab lists for fulfillment.

---

## 🗄️ Database Architecture

The system uses a highly relational PostgreSQL schema optimized for clinical accuracy.

### **Core Schema Entities (38 Tables)**

**Patient & Visits Layer:**
- `patient`: Master demographic data.
- `visit`: Encounter tracking and workflow status.
- `patient_vitals`: Indexed vital sign readings per visit.
- `visit_status_history`: Exhaustive audit of patient movement.

**Clinical & Laboratory Layer:**
- `prescription`, `prescription_medicines`: Electronic prescribing core.
- `lab_test`, `lab_test_parameters`: Diagnostic configuration.
- `lab_order`, `lab_test_results`, `lab_result`, `lab_result_approvals`: Full lab workflow including verification.

**Pharmacy & Inventory Layer:**
- `medicine`: Global medicine catalog.
- `medicine_batch`: Expiry-based unit tracking with specific costs.
- `medicine_transaction`: Unified ledger for all stock movement (sale, purchase, return).
- `medicine_purchase`, `medicine_purchase_detail`: Supply chain management.
- `pharmacy_sale`, `pharmacy_sale_detail`: Point of Sale (POS) operations.
- `pharmacy_customer`, `party`: Entity management.

**Specialized Modules:**
- **POS Operations**: `pos_session`, `pos_held_transaction`, `pos_audit_log`, `pos_receipt_config`.
- **Returns**: `purchase_return`, `sale_return` (with detail tables).
- **Billing**: `bill`, `bill_item`.
- **OB/GYN**: `obstetric_history`, `current_pregnancy`, `menstrual_history`, `para_details`.

---

## 🔌 API Layer

Organized into domain-specific clusters under `src/app/api`:

| Domain | Key Endpoints | Purpose |
|--------|---------------|---------|
| **Clinical** | `clinicalDetails`, `prescription`, `patientVitals` | Handled doctor-patient encounter data |
| **Inventory** | `medicine`, `inventory`, `transactions`, `dispense` | Pharmacy POS and warehouse logic |
| **Patient** | `patient`, `visit`, `queue` | Demographic and queuing management |
| **Administrative** | `receptionist`, `doctor`, `party`, `login` | Staff accounts and supplier management |
| **Integrations** | `print`, `email`, `hardware` | External services and device communication |

---

## 🧩 Feature Modules

- **Doctor Module**: Clinical consultations, vital signs history, and intelligent e-prescribing.
- **Pharmacy Module**: Dual-level stock tracking (Aggregate + Batch), POS billing, and supplier return management.
- **Laboratory Module**: Multi-parameter test results, automated reference range checks, and multi-stage verification.
- **Reception Module**: Efficient patient intake, visit life-cycle management, and visit-based billing.

---

## 🔐 Security Architecture

- **Auth Layer**: JWT-secured sessions with HTTP-only tokens for persistent, safe logins.
- **SQL Safety**: 100% usage of parameterized queries through `node-postgres` to prevent injection attacks.
- **Audit Engine**: Triggers on critical tables (`visit_status_history`, `medicine_transaction`) ensure no data movement is undocumented.
- **Validation**: Schema-level sanitization using Zod on every API request.

---

## 🚀 Deployment Architecture

Optimized for high-performance hospital environments:
- **Server-Side Render**: Optimized data fetching to handle the clinical overhead.
- **Node.js Runtime**: Scalable Next.js deployment.
- **PostgreSQL Persistence**: Centralized, robust database instance for high transactional integrity.

---

## ⚡ Performance Considerations

- **Indexing Strategy**: High-performance indexes on `patient_name`, `visit_date`, and medicine `barcode`.
- **Real-Time Calculation**: Offloading heavy stock arithmetic to DB triggers.
- **Resource Streaming**: Implementation of Next.js streaming for complex laboratory report generation.

---

**Built with pride for the HMS team** 🏥

*Last Updated: February 2026*
