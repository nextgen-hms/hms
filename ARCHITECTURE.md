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

- **🔌 Offline-First**: Full functionality without internet
- **📊 Data Integrity**: Database-level constraints and triggers
- **⚡ Performance**: Optimized queries and database indexes
- **🎨 Simplicity**: Clean, intuitive UI for healthcare staff
- **🔐 Security**: Role-based access and audit trails
- **📈 Scalability**: Modular architecture for future growth

---

## 🏛️ Architecture Principles

### 1. **Feature-Based Organization**

Each major module (Doctor, Pharmacy, Lab, Reception) is self-contained with:
- UI Components
- Business Logic
- API Routes
- Type Definitions

### 2. **Database-First Approach**

Heavy business logic in PostgreSQL:
- **Triggers** for automatic stock updates
- **Views** for complex reporting
- **Functions** for reusable logic
- **Constraints** for data integrity

### 3. **Type Safety**

End-to-end type safety with TypeScript:
- Database types from schema
- API request/response types
- React component prop types
- Form validation with Zod

### 4. **Server-Side Rendering**

Leveraging Next.js 15 features:
- React Server Components (RSC)
- Server Actions for mutations
- Streaming for better UX
- Automatic code splitting

---

## 🔧 Technology Stack

### **Frontend Stack**

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.5.0 | React framework with App Router |
| React | 19.1.0 | UI library |
| TypeScript | 5.x | Type safety |
| TailwindCSS | 4.x | Utility-first styling |
| Radix UI | Latest | Accessible component primitives |
| Lucide React | 0.541.0 | Icon library |
| React Hook Form | 7.62.0 | Form management |
| Zod | 4.1.7 | Schema validation |
| React Hot Toast | 2.6.0 | Notifications |

### **Backend Stack**

| Technology | Purpose |
|------------|---------|
| Next.js API Routes | RESTful endpoints |
| PostgreSQL | Primary database |
| pg | PostgreSQL client |
| Server Actions | Form mutations |

### **Development Tools**

| Tool | Purpose |
|------|---------|
| ESLint | Code linting |
| TypeDoc | API documentation |
| pnpm | Package management |

---

## 📁 Project Structure

```
hms/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Authentication routes
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── api/                 # API routes
│   │   │   ├── patients/
│   │   │   ├── prescriptions/
│   │   │   ├── pharmacy/
│   │   │   └── laboratory/
│   │   ├── dashboard/           # Main dashboard
│   │   ├── doctor/              # Doctor module routes
│   │   ├── pharmacy/            # Pharmacy module routes
│   │   ├── lab/                 # Laboratory module routes
│   │   ├── receptionist/        # Reception module routes
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css          # Global styles
│   │
│   └── features/                # Feature modules
│       ├── doctor/              # Doctor feature
│       │   ├── components/      # UI components
│       │   ├── hooks/           # Custom hooks
│       │   ├── types/           # Type definitions
│       │   └── utils/           # Helper functions
│       ├── pharmacy/            # Pharmacy feature
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── types/
│       │   └── utils/
│       ├── laboratory/          # Lab feature
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── types/
│       │   └── utils/
│       ├── reception/           # Reception feature
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── types/
│       │   └── utils/
│       └── shared/              # Shared components
│           ├── components/      # Reusable UI
│           ├── lib/             # Utility functions
│           ├── hooks/           # Global hooks
│           └── types/           # Global types
│
├── database/                    # Database layer
│   ├── db.ts                   # Database connection
│   ├── migrations/             # SQL migrations
│   └── schema.prisma           # Database schema (future)
│
├── contexts/                   # React contexts
│   └── AuthContext.tsx         # Authentication state
│
├── public/                     # Static assets
│   └── images/
│
├── docs/                       # Documentation
│   └── api_documentation.md
│
├── .vscode/                    # VS Code settings
├── DATABASE.md                 # Database documentation
├── ARCHITECTURE.md             # This file
├── contributing.md             # Contribution guide
├── README.md                   # Project overview
├── components.json             # shadcn/ui config
├── next.config.ts              # Next.js config
├── tailwind.config.ts          # Tailwind config
├── tsconfig.json               # TypeScript config
└── package.json                # Dependencies
```

---

## 🔄 Data Flow Architecture

### **1. User Interaction Flow**

```
User Action (UI)
      ↓
Form Submission / Button Click
      ↓
Server Action / API Route
      ↓
Database Query (PostgreSQL)
      ↓
Database Triggers (Auto-update stocks, logs)
      ↓
Response to Client
      ↓
UI Update (Optimistic or Re-validation)
      ↓
Toast Notification
```

### **2. Pharmacy Transaction Flow**

Example: Medicine Sale

```
1. Receptionist creates bill
      ↓
2. API: POST /api/pharmacy/sales
      ↓
3. Database: INSERT into medicine_sales
      ↓
4. Trigger: after_medicine_sale_insert
      ↓
5. Function: update_stock_quantity(-quantity)
      ↓
6. Update: medicines.quantity_in_stock
      ↓
7. Log: medicine_transactions (sale record)
      ↓
8. Response: { success: true, transaction_id }
      ↓
9. UI: Show success + Update stock display
```

### **3. Doctor Prescription Flow**

```
1. Doctor selects patient from queue
      ↓
2. Record vitals (optional)
      ↓
3. Create prescription with:
   - Selected medicines
   - Lab test orders
   - Clinical notes
      ↓
4. API: POST /api/prescriptions
      ↓
5. Database:
   - INSERT prescription
   - INSERT prescription_medicines
   - INSERT lab_orders
      ↓
6. Update visit status to 'completed'
      ↓
7. Patient moves to pharmacy/lab
```

---

## 🗄️ Database Architecture

### **Entity Relationship Overview**

```
┌──────────────┐        ┌──────────────┐        ┌──────────────┐
│   Patients   │◄───────│    Visits    │────────►│ Prescriptions│
└──────────────┘        └──────────────┘        └──────────────┘
                              │                          │
                              │                          │
                              ▼                          ▼
                        ┌──────────────┐        ┌──────────────┐
                        │    Vitals    │        │ Prescription │
                        └──────────────┘        │  Medicines   │
                                                └──────────────┘
                                                        │
                                                        ▼
                                                ┌──────────────┐
                                                │  Medicines   │◄──┐
                                                └──────────────┘   │
                                                        │          │
                        ┌───────────────────────────────┘          │
                        │                                          │
                        ▼                                          │
                ┌──────────────┐                          ┌──────────────┐
                │ Medicine     │                          │  Medicine    │
                │ Purchases    │                          │  Sales       │
                └──────────────┘                          └──────────────┘
                        │                                          │
                        └───────────►┌──────────────┐◄────────────┘
                                     │ Medicine     │
                                     │ Transactions │
                                     └──────────────┘
```

### **Key Database Components**

#### **Tables (29 Total)**

**Patient Management:**
- `patients` - Patient demographics
- `visits` - OPD/IPD visit records
- `vitals` - Patient vital signs

**Clinical:**
- `prescriptions` - Doctor prescriptions
- `prescription_medicines` - Medicines in prescription
- `obstetric_history` - Pregnancy history
- `obstetric_pregnancy` - Current pregnancy details
- `menstrual_history` - Menstrual cycle data

**Pharmacy:**
- `medicines` - Medicine catalog
- `medicine_purchases` - Stock purchases
- `medicine_sales` - Medicine sales
- `medicine_purchase_returns` - Returns to supplier
- `medicine_sale_returns` - Customer returns
- `medicine_transactions` - Complete audit trail
- `suppliers` - Supplier information

**Laboratory:**
- `lab_tests` - Test catalog
- `lab_orders` - Test orders
- `lab_results` - Test results

**Financial:**
- `bills` - Patient bills
- `ledger_entries` - Financial ledger

**Administration:**
- `doctors` - Doctor information
- `users` - System users

#### **Database Functions**

1. **generate_daily_clinic_number()**
   - Creates sequential clinic numbers for each day
   - Format: YYYYMMDD-001, YYYYMMDD-002, etc.

2. **update_stock_quantity()**
   - Updates medicine stock on transactions
   - Called by triggers automatically

3. **create_transaction_log()**
   - Records all inventory movements
   - Maintains complete audit trail

#### **Database Triggers**

**Stock Management Triggers:**
```sql
-- Automatic stock updates
after_medicine_purchase_insert → Increase stock
after_medicine_sale_insert → Decrease stock
after_purchase_return_insert → Decrease stock
after_sale_return_insert → Increase stock
```

**Audit Trail Triggers:**
```sql
-- Transaction logging
after_purchase_transaction → Log to medicine_transactions
after_sale_transaction → Log to medicine_transactions
```

**Data Integrity Triggers:**
```sql
-- Ensure data consistency
before_visit_update → Track status changes
before_prescription_update → Prevent unauthorized edits
```

#### **Database Views**

1. **daily_sales_summary**
   - Daily pharmacy revenue
   - Total items sold
   - Payment summaries

2. **current_stock_levels**
   - Real-time inventory
   - Reorder alerts
   - Expiry warnings

3. **patient_ledger**
   - Outstanding balances
   - Payment history
   - Credit status

---

## 🎨 Frontend Architecture

### **Component Hierarchy**

```
App Layout (Root)
├── Auth Layout (Login/Register)
│   ├── Login Form
│   └── Register Form
│
├── Dashboard Layout (Protected)
│   ├── Sidebar Navigation
│   ├── Header (User Profile)
│   └── Main Content
│       ├── Dashboard Cards
│       └── Quick Actions
│
├── Doctor Module
│   ├── Patient Queue
│   ├── Prescription Form
│   │   ├── Vitals Input
│   │   ├── Medicine Selector
│   │   ├── Lab Test Selector
│   │   └── Clinical Notes
│   └── Visit History
│
├── Pharmacy Module
│   ├── Medicine Catalog
│   ├── Sales Interface
│   ├── Purchase Manager
│   ├── Stock Overview
│   └── Returns Handler
│
├── Laboratory Module
│   ├── Test Catalog
│   ├── Order Management
│   ├── Results Entry
│   └── Report Generator
│
└── Reception Module
    ├── Patient Registration
    ├── Appointment Manager
    └── Billing Interface
```

### **State Management Strategy**

**1. Server State (Database)**
- Managed by Next.js data fetching
- Revalidation on mutations
- Optimistic updates where appropriate

**2. Client State (React)**
- Form state: React Hook Form
- UI state: React useState
- Auth state: React Context

**3. URL State**
- Search params for filters
- Dynamic routes for resources

### **Component Design Patterns**

**Composition Pattern:**
```tsx
// Shared components for reusability
<Card>
  <CardHeader>
    <CardTitle>Patient Details</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

**Render Props Pattern:**
```tsx
// Flexible data display
<DataTable
  data={patients}
  columns={columns}
  renderRow={(patient) => <PatientRow patient={patient} />}
/>
```

**Custom Hooks Pattern:**
```tsx
// Reusable logic
const { patients, loading, error } = usePatients()
const { createPrescription } = usePrescription()
```

---

## 🔌 API Layer

### **API Architecture**

**RESTful Design:**
```
GET    /api/patients           - List patients
GET    /api/patients/:id       - Get patient details
POST   /api/patients           - Create patient
PUT    /api/patients/:id       - Update patient
DELETE /api/patients/:id       - Delete patient
```

**Nested Resources:**
```
GET    /api/patients/:id/visits        - Patient visits
GET    /api/visits/:id/prescription    - Visit prescription
POST   /api/prescriptions              - Create prescription
GET    /api/pharmacy/medicines         - List medicines
POST   /api/pharmacy/sales             - Record sale
```

### **API Response Format**

**Success Response:**
```typescript
{
  success: true,
  data: {
    // Response data
  },
  message: "Operation successful"
}
```

**Error Response:**
```typescript
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "Invalid input data",
    details: {
      // Field-specific errors
    }
  }
}
```

### **Server Actions**

Used for form mutations:
```typescript
// app/actions/patients.ts
'use server'

export async function createPatient(formData: FormData) {
  // Validation
  const validated = patientSchema.parse(formData)
  
  // Database operation
  const patient = await db.insert(...)
  
  // Revalidate
  revalidatePath('/patients')
  
  return { success: true, data: patient }
}
```

---

## 🧩 Feature Modules

### **Doctor Module**

**Responsibilities:**
- Patient queue management
- Clinical consultation workflow
- Prescription creation
- Vital signs recording
- Medical history review

**Key Components:**
- `PatientQueue` - Daily clinic list
- `VitalsForm` - Vital signs input
- `PrescriptionForm` - Medicine & test ordering
- `HistoryViewer` - Previous visits

### **Pharmacy Module**

**Responsibilities:**
- Medicine inventory management
- Sales transactions
- Purchase order processing
- Stock level monitoring
- Return handling

**Key Components:**
- `MedicineCatalog` - Medicine list & search
- `SalesInterface` - Bill creation
- `PurchaseForm` - Stock purchasing
- `StockDashboard` - Inventory overview

### **Laboratory Module**

**Responsibilities:**
- Test catalog management
- Order processing
- Sample tracking
- Results entry
- Report generation

**Key Components:**
- `TestCatalog` - Available tests
- `OrderQueue` - Pending tests
- `ResultsForm` - Results entry
- `ReportGenerator` - PDF reports

### **Reception Module**

**Responsibilities:**
- Patient registration
- Visit creation
- Appointment scheduling
- Billing operations

**Key Components:**
- `PatientForm` - Registration
- `VisitForm` - Visit creation
- `BillingInterface` - Invoice generation

---

## 🔐 Security Architecture

### **Authentication & Authorization**

**Planned Implementation:**
```
┌─────────────────────────────────────┐
│         User Authentication         │
│  (JWT Tokens + HTTP-Only Cookies)   │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│      Role-Based Access Control      │
│  (Admin, Doctor, Pharmacist, etc.)  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│       Feature-Level Permissions     │
│   (Read, Write, Update, Delete)     │
└─────────────────────────────────────┘
```

### **Data Security**

1. **Database Security:**
   - Parameterized queries (no SQL injection)
   - Row-level security (RLS) planned
   - Encrypted backups

2. **API Security:**
   - CORS configuration
   - Rate limiting (planned)
   - Input validation (Zod)

3. **Frontend Security:**
   - XSS prevention (React default)
   - CSRF tokens (planned)
   - Secure cookie handling

### **Audit Trail**

All critical operations logged:
```typescript
{
  user_id: number,
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  resource_type: 'PRESCRIPTION' | 'MEDICINE' | 'PATIENT',
  resource_id: number,
  changes: Record<string, any>,
  timestamp: Date,
  ip_address: string
}
```

---

## 🚀 Deployment Architecture

### **Offline-First Desktop Application**

```
┌──────────────────────────────────────────────┐
│          Electron Application                │
│  ┌────────────────────────────────────────┐  │
│  │       Next.js Frontend + API           │  │
│  └────────────────────────────────────────┘  │
│                    ↕                         │
│  ┌────────────────────────────────────────┐  │
│  │      Local PostgreSQL Database         │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
              ↕ (Daily Sync)
┌──────────────────────────────────────────────┐
│          Cloud Backup Service                │
│  (PostgreSQL + Object Storage for backups)   │
└──────────────────────────────────────────────┘
```

### **Development Environment**

```bash
# Local development
pnpm dev          # Next.js dev server on localhost:3000
                  # PostgreSQL on localhost:5432
```

### **Production Build**

```bash
# Build for production
pnpm build        # Next.js optimized build

# Electron packaging
electron-builder  # Windows/Mac/Linux installers
```

---

## ⚡ Performance Considerations

### **Database Optimization**

1. **Indexes:**
   ```sql
   -- Critical indexes
   CREATE INDEX idx_patients_search ON patients(name, phone);
   CREATE INDEX idx_visits_date ON visits(visit_date);
   CREATE INDEX idx_medicines_active ON medicines(is_active);
   ```

2. **Query Optimization:**
   - Use database views for complex reports
   - Limit result sets with pagination
   - Eager loading for related data

3. **Connection Pooling:**
   ```typescript
   const pool = new Pool({
     max: 20,
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000,
   })
   ```

### **Frontend Optimization**

1. **Code Splitting:**
   - Automatic with Next.js App Router
   - Dynamic imports for heavy components

2. **Image Optimization:**
   - Next.js Image component
   - Lazy loading

3. **Caching Strategy:**
   - Static pages: ISR (Incremental Static Regeneration)
   - Dynamic data: SWR with revalidation
   - Client-side: React Query (planned)

### **Bundle Size**

Current optimizations:
- Tree-shaking with TailwindCSS
- Minification in production
- Compression (gzip/brotli)

Target bundle sizes:
- First Load JS: < 200 KB
- Route JS: < 50 KB
- Total CSS: < 50 KB

---

## 🔮 Future Architecture Enhancements

### **Phase 2: Multi-Location Support**

```
┌─────────────────────────────────────────────────────────┐
│                    Central Cloud Server                  │
│              (PostgreSQL + Redis + API)                  │
└─────────────────────────────────────────────────────────┘
         ↕              ↕              ↕
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│  Location A   │ │  Location B   │ │  Location C   │
│  (Electron)   │ │  (Electron)   │ │  (Electron)   │
└───────────────┘ └───────────────┘ └───────────────┘
```

### **Phase 3: Mobile Application**

- React Native app
- Offline-first with SQLite
- Sync with central server

### **Phase 4: Advanced Features**

- Real-time notifications (WebSocket)
- Advanced analytics (Grafana)
- Machine learning (Python microservices)
- HL7 integration for lab equipment

---

## 📚 Additional Resources

- [Database Schema](./DATABASE.md) - Detailed database documentation
- [Contributing Guide](./contributing.md) - Development setup
- [API Documentation](./docs/api_documentation.md) - API reference

---

## 🤝 Contributing to Architecture

When proposing architectural changes:

1. **Create an Issue** - Discuss the change first
2. **Document Impact** - How it affects existing code
3. **Performance Analysis** - Benchmark if needed
4. **Security Review** - Consider security implications
5. **Update Documentation** - Keep this file current

---

**Built with care for the healthcare community** 🏥

*Last Updated: October 2025*
