# 🚀 HMS Technical Roadmap

Draft plan for the next phases of development, focusing on stability, features, and optimization.

## 🛠️ Immediate Focus (Phase 1: Stability)

### 1. Robust Error Handling
- Implement global error boundaries for the App Router.
- Enhance Zod validation messages for better user feedback.
- Add a dedicated `ErrorLogger` table in the database to track runtime failures.

### 2. Inventory Accuracy
- Conduct a full audit of existing triggers to ensure no edge cases in stock movements (e.g., partial returns).
- Add "Low Stock" visual indicators and automated notifications for pharmacists.

## 📈 Feature Expansion (Phase 2: Functionality)

### 1. Barcode Integration
- Integrate ZXing or similar library for medicine barcode scanning in the Pharmacy POS.
- Generate and print sample labels for the Laboratory.

### 2. Financial Reporting
- Create a "Daily Closing" report for receptionists.
- Implement an Expense Tracker to monitor clinic overheads.

### 3. Patient Portal (Future)
- Lightweight, read-only portal for patients to view their lab results and prescriptions via a QR code.

## ⚡ Technical Debt & Optimization

- **Prisma Integration**: Consider migrating from raw `pg` queries to Prisma for better DX and type-safe migrations.
- **Unit Testing**: Implement Vitest and Playwright for critical clinical flows (Prescription saving, Inventory deductions).
- **Electron Optimization**: Ensure the production build of Electron is lean and includes automatic updates.

---

> [!NOTE]
> This roadmap is a living document and should be updated based on feedback from the medical staff using the system.
