# ⚙️ HMS Setup & Development

Step-by-step guide to get the development environment running locally.

## 📋 Prerequisites

- **Node.js**: v20 or higher
- **pnpm**: v9 or higher
- **PostgreSQL**: v16+ (v18 recommended)
- **Operating System**: Linux/macOS/Windows

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd hms
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Database Setup**:
   - Create a database named `hims` in PostgreSQL.
   - Run the schema and seed files:
     ```bash
     psql -d hims -f db_structure.sql
     psql -d hims -f seed.sql
     ```

4. **Environment Variables**:
   Create a `.env` file in the root:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/hims"
   NEXTAUTH_SECRET="your-secret"
   ```

5. **Run Development Server**:
   ```bash
   pnpm dev
   ```
   The app will be available at `http://localhost:3000`.

## 🛠️ Development Tools

- **Database Modeler**: `pg_modeler_hms.dbm` can be opened with pgModeler for visual schema editing.
- **Linting**: Run `pnpm lint` to check for code style issues.
- **Type Checking**: Run `pnpm type-check` to verify TypeScript integrity.

---

> [!IMPORTANT]
> Ensure PostgreSQL is running locally before starting the dev server, as the app establishes a database connection on boot.
