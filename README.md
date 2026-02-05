# 🏥 Hospital Management System (HMS)

A comprehensive **Hospital Management System** built with **Next.js** and **PostgreSQL**, designed as an **offline-first** solution for small to medium-sized healthcare facilities. The system handles patient registration, clinical workflows, pharmacy operations, and laboratory management with a focus on simplicity and reliability.

---

## 🎯 Project Vision

This HMS is designed to digitize and streamline hospital operations while maintaining **offline capabilities** for areas with unreliable internet connectivity. The system uses a **local central database** with daily synchronization to cloud backup, ensuring data integrity and accessibility.

---

## ✨ Key Features

### 🩺 **Patient Registration & Management**
- Complete patient demographic information tracking
- OPD (Outpatient Department) and IPD (Inpatient Department) visit management
- Patient history and medical records
- Visit status tracking with audit trails

### 👨‍⚕️ **Doctor's Clinical Module**
- Daily clinic queue with sequential numbering
- Visit-based prescription management
- Laboratory test ordering
- Patient vital signs recording
- Obstetric and gynecology tracking (pregnancy, menstrual history, para details)
- Visit history and clinical notes

### 💊 **Pharmacy Management**
- Comprehensive medicine inventory control
- **Real-time stock management** with automated updates
- Purchase order processing with supplier management
- Medicine dispensing with automatic stock deduction
- Sales and purchase return handling
- Batch and expiry date tracking
- Complete transaction audit trail
- Daily sales reporting

### 🔬 **Laboratory Management**
- Lab test catalog and pricing
- Test ordering (from prescriptions or walk-in)
- Sample collection with tracking
- Results entry and validation
- Report generation and approval workflow
- Integration-ready for lab analyzers

### 📊 **Financial Management**
- Patient billing with itemized invoices
- Payment tracking
- Ledger entries for all transactions
- Revenue reporting

---

## 🏗️ System Architecture

### **Offline-First Design**
- **Local PostgreSQL database** as the central data store
- Fully functional without internet connectivity
- **Daily cloud synchronization** for backup and multi-location access
- Electron desktop application for Windows/Mac/Linux

### **Database Features**
- **Automated Triggers** for stock management and transaction logging
- **Database Views** for reporting (daily sales, stock levels, patient ledger)
- **Stored Procedures** for complex business logic
- **Audit Trails** for all critical operations
- **Data Integrity** through constraints and relationships

---

## 📦 Core Modules

### 1️⃣ **Patient Registration**
Manages patient demographics, contact information, and medical history. Supports both OPD and emergency visits with unique daily clinic numbers.

### 2️⃣ **Doctor's Clinical Menu**
Streamlines clinical workflow with:
- Patient queue management
- Vital signs recording
- Prescription creation with medicines and lab tests
- Specialized obstetric and gynecology forms
- Visit status updates with change tracking

### 3️⃣ **Pharmacy**
Complete pharmacy operations including:
- Medicine catalog management
- Automated inventory control
- Purchase and sales transactions
- Return processing (both to supplier and from customers)
- Real-time stock quantity updates via database triggers
- Comprehensive transaction history

### 4️⃣ **Laboratory**
Laboratory information system with:
- Test catalog and pricing
- Order management
- Sample tracking
- Results entry
- Report generation
- Quality control workflows

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js, React, TypeScript |
| **Styling** | TailwindCSS |
| **Desktop App** | Electron (with auto-updates) |
| **Database** | PostgreSQL |
| **API Layer** | Next.js API Routes |
| **Deployment** | Local (Electron) + Cloud (Vercel for staging) |

---

## 📊 Database Design Highlights

### **29 Tables** covering:
- Patient management (patients, visits, vitals)
- Medical records (prescriptions, lab orders, obstetric history)
- Pharmacy (medicines, purchases, sales, returns, transactions)
- Laboratory (tests, orders, results)
- Financial (bills, ledger entries)
- Administration (doctors, staff, suppliers)

### **6 Functions** including:
- Daily clinic number generation
- Stock quantity management
- Transaction logging

### **15 Triggers** for:
- Automatic stock updates on all inventory movements
- Transaction audit trail creation
- Data consistency enforcement

### **5 Unique Constraints** ensuring:
- One prescription per visit
- One pregnancy record per visit
- One vital signs record per visit
- One obstetric history per patient

---

## 🎨 Design Philosophy

1. **Simplicity First** - Intuitive interfaces designed for medical staff with varying tech proficiency
2. **Data Integrity** - Automated triggers and constraints prevent data inconsistencies
3. **Offline Reliability** - Full functionality without internet dependency
4. **Audit Compliance** - Complete transaction history and change tracking
5. **Performance** - Optimized queries and indexes for fast operations
6. **Scalability** - Modular architecture supporting future enhancements

---

## 🚀 Project Status

**Current Version:** In Development  
**Target Users:** Small to medium-sized hospitals, clinics, and healthcare centers  
**Deployment Model:** Offline-first with optional cloud sync

---

## 📋 Roadmap

### **Phase 1** (Current)
- ✅ Patient registration and management
- ✅ Doctor's clinical module
- ✅ Pharmacy inventory and sales
- ✅ Laboratory management
- ✅ Basic billing

### **Phase 2** (Planned)
- 🔄 Enhanced reporting and analytics
- 🔄 Insurance integration
- 🔄 Advanced billing features
- 🔄 User roles and permissions

### **Phase 3** (Future)
- 📅 Patient portal for online reports
- 📅 Mobile application (React Native)
- 📅 HL7 integration for lab analyzers
- 📅 Telemedicine capabilities
- 📅 Multi-location support

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines on:
- Setting up the development environment
- Database configuration
- Code standards
- Pull request process

---

## 📄 Documentation

- [Database Schema Documentation](./DATABASE.md) - Complete database structure
- [Contributing Guide](./CONTRIBUTING.md) - Setup and contribution guidelines
- [ARCHITECTURE](./ARCHITECTURE.md) - Architecture and Folder Structure

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

---

## 👥 Team

Built with ❤️ for the healthcare community.
Our core team 
Bablu
Faiq
---

## 📞 Support

For questions, issues, or suggestions:
- Open an [Issue](https://github.com/bubblu2264326/hms/issues)
- Start a [Discussion](https://github.com/bubblu2264326/hms/discussions)

---

**Together, let's build better healthcare management solutions!** 🏥✨
