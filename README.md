# 🏥 Hospital Management System (HMS)

> **A State-of-the-Art, Data-First Healthcare Management Platform**

HMS is a comprehensive, enterprise-grade **Hospital Management System** built with **Next.js 15** and **PostgreSQL**. Designed for modern healthcare facilities, it streamlines patient registration, clinical consultations, pharmacy inventory, and laboratory workflows with a focus on data integrity, type safety, and visual excellence.

---

## 🚀 Project Vision

Our mission is to provide a robust, high-performance digital backbone for healthcare providers. HMS replaces fragmented systems with a unified, **database-driven architecture** that ensures clinical accuracy and operational efficiency. By leveraging modern web standards and deep PostgreSQL logic, we deliver a system that is as reliable as it is simple to use.

---

## ✨ Key Features

### 🩺 **Patient Lifecycle Management**
- **Dynamic Registration**: Capture complete demographic and medical history.
- **OPD/IPD Workflows**: Seamless management of Outpatient and Inpatient encounters.
- **Visit Queuing**: Real-time patient queuing with daily sequential numbering.
- **Audit Compliance**: Exhaustive timestamped history for every visit status change.

### 👨‍⚕️ **Clinical Excellence**
- **E-Prescribing**: Precise medicine and laboratory test ordering integrated with inventory.
- **Specialized OB/GYN**: Dedicated tracking for obstetric history, menstrual cycles, and pregnancy details.
- **Vitals Tracking**: Longitudinal monitoring of patient growth and physiological signs.
- **Clinical Notes**: Rich documentation for consultations and medical assessments.

### 💊 **Advanced Pharmacy & Inventory**
- **Batch-Level Tracking**: Specific unit management with expiry monitoring and cost-basis tracking.
- **Real-Time Sync**: Automated inventory updates via dual-update database triggers.
- **POS Operations**: Streamlined retail interface with integrated inventory deduction.
- **Supply Chain**: Manage purchase orders, supplier relations, and multi-tier return flows.

### 🔬 **Laboratory Information System (LIS)**
- **Parameter Management**: Granular control over test components and reference ranges.
- **Workflow Automation**: From order collection to multi-stage result verification.
- **Report Generation**: Professional, validated PDF reports for patients and doctors.

---

## 📚 Documentation Index

For detailed technical and operational information, please refer to the following guides:

### **Core Reference**
- [📘 Documentation Index](./documentation/README.md) - High-level overview of all technical manuals.
- [🏗️ Architecture Guide](./ARCHITECTURE.md) - Deep dive into system design and project structure.
- [🗄️ Database Reference](./DATABASE.md) - Complete schema, triggers, and stored functions map.
- [📝 Contributing Guide](./contributing.md) - Guidelines for setting up, coding styles, and PRs.

### **Technical Deep Dives**
- [🎨 Frontend Architecture](./documentation/frontend.md) - Component patterns, hooks, and state management.
- [🧩 Feature Modules](./documentation/features.md) - Breakdown of Doctor, Pharmacy, Lab, and Reception logic.
- [⚙️ Setup & Development](./documentation/setup.md) - Step-by-step local environment configuration.

### **Project Management**
- [🌐 Project Context](./documentation/context.md) - Functional overview and feature dependencies.
- [🚀 Technical Roadmap](./documentation/next_steps.md) - Future phases and optimization goals.
- [📈 Progress Logs](./documentation/progress.md) - Daily development milestones and change logs.

---

## 🛠️ Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Framework** | Next.js | 15.5.0 | Core App Router & SSR |
| **UI Library** | React | 19.1.0 | Modern Component Architecture |
| **Language** | TypeScript | 5.x | End-to-end Type Safety |
| **Styling** | TailwindCSS | 4.x | Utility-first Design System |
| **Database** | PostgreSQL | 16+ | Primary Relational Engine |
| **Validation** | Zod | 4.x | Schema-driven Data Integrity |
| **Forms** | React Hook Form| 7.x | Performant Form Management |

---

## 📊 Database at a Glance

The HMS core is powered by a robust PostgreSQL schema designed for high transactional integrity:

- **38 Tables**: Categorized into Clinical, Inventory, Financial, and Administration modules.
- **10 Functions**: Handling clinic numbering, stock availability, and complex arithmetic.
- **6 Advanced Triggers**: Ensuring real-time synchronization between sales, purchases, and batch quantities.
- **1 Stored Procedure**: Managing atomic visit status transitions and logs.
- **2 Reporting Views**: `v_daily_sales_summary` and `v_low_stock_medicines`.

---

## 🏁 Project Status & Roadmap

### **Current Phase: Core Stability & Retail Excellence**
- ✅ **Production-Ready POS**: Sub-unit (fragment) sale logic and real-time stock indicators.
- ✅ **Infrastructure Fixes**: Stabilized authentication redirection for production environments.
- ✅ **Database Precision**: Batch-level inventory tracking with audit ledger synchronization.

### **Next Objectives (Feb 7)**
1. **Medicine Return**: Customer sale return workflows.
2. **Medicine Purchase**: Supplier procurement and stock intake.
3. **Purchase Return**: Supplier return and credit management.

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

---

## 👥 The Team

Built with ❤️ for the global healthcare community.

**Core Contributors:**
- **Bablu**
- **Faiq**

---

**Together, let's build better healthcare management solutions!** 🏥✨
