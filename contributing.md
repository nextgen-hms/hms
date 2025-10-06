# Contributing Guide

Thank you for your interest in contributing to the **Hospital Management System (HMS)** project! 🎉  
We welcome contributions from the community to make this project better.

---

## 🛠 How to Contribute

### 1. Fork the Repository
Click the **Fork** button on the top-right of this repository's GitHub page.  
This will create your own copy of the project under your GitHub account.

---

### 2. Clone Your Fork
```bash
git clone https://github.com/YOUR_USERNAME/hms.git
cd hms
```

---

### 3. Setup the Database (PostgreSQL)

This project uses **PostgreSQL** as its primary database.  
Follow the detailed steps below to set it up locally.

---

#### a) Install PostgreSQL

1. Download PostgreSQL from the official website:  
   👉 [PostgreSQL Downloads](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)

2. Run the installer. During installation:
   - **Tick**:
     - PostgreSQL Server
     - pgAdmin 4 (optional, if you want a browser-based GUI)
     - Command Line Tools (important, includes `psql`)
   - **Untick**:
     - StackBuilder (not required)

3. Choose:
   - Default port: `5432` (you can change if needed, but remember it)
   - Username: `postgres`
   - Password: (set your own secure password)

4. Finish installation.

---

#### b) Add PostgreSQL to PATH (Windows only)

To use `psql` globally from the terminal:

1. Find the PostgreSQL installation folder. Usually:
   ```
   C:\Program Files\PostgreSQL\16\bin
   ```
   (Replace `16` with your version)

2. Copy this path.

3. Go to:
   - Windows Search → "Edit the system environment variables"
   - Click **Environment Variables**
   - Under **System Variables**, select **Path** → **Edit** → **New**
   - Paste the `bin` path

4. Restart your terminal and check:
   ```bash
   psql --version
   ```
   You should see the installed version.

---

#### c) Login to PostgreSQL

Open your terminal and run:
```bash
psql -U postgres -p 5432
```
- Replace `5432` if you changed the port.
- Enter your password when prompted.

---

#### d) Create the Database
## For Datbase details refer to - [Database Schema Documentation](DATABASE.md) - Complete database structure
Inside the `psql` shell:
```sql
CREATE DATABASE hims;
\q
```
This creates a fresh database for the project.

---

#### e) Import Schema

Navigate to your project root directory (where `database/schema.sql` is located):
```bash
cd path/to/your/project
psql -U postgres -p 5432 -d hims -f database/schema.sql
```

This will create:
- Tables (patients, doctors, visits, prescriptions, pharmacy, lab, ledger, etc.)
- Functions & triggers (stock reduction, ledger updates, reporting views)

---

#### f) Import Seed Data (Optional)

If you want to load sample data (patients, doctors, medicines, etc.):
```bash
psql -U postgres -p 5432 -d hims -f database/seed.sql
```

---

#### g) Verify Setup with psql

Connect to the database:
```bash
psql -U postgres -p 5432 -d hims
```

Inside the `psql` shell:
```sql
\dt
```
You should see a list of tables created.

---

#### h) (Optional but Recommended) Install TablePlus

Using only `psql` can be tedious. A GUI like **TablePlus** makes it much easier.

- Download: 👉 [TablePlus](https://tableplus.com/)
- Install it.
- Open TablePlus → **New Connection → PostgreSQL**.
- Enter:
  - Host: `localhost`
  - Port: `5432` (or your port)
  - User: `postgres`
  - Password: (the one you set)
  - Database: `hims`

Click **Connect**.

You should now see the tables inside the `hims` database. If you imported `seed.sql`, you'll also see initial sample data.

✅ **At this point, your PostgreSQL database is fully set up and ready for development.**

---



### 4. Install Project Dependencies

This project uses **pnpm** as the package manager. If you don't have pnpm installed:

```bash
npm install -g pnpm
```

Then install dependencies:
```bash
pnpm install
```

---

### 5. Create a Branch

Follow the naming convention `feature/your-feature` or `fix/your-fix`.
```bash
git checkout -b feature/awesome-feature
```

---

### 6. Make Your Changes

- Add new features in the relevant module (`app/`, `database/`, etc.)
- Follow code style and naming conventions
- Write meaningful commit messages

---

### 7. Test Your Changes

Before committing, make sure:
- The app runs correctly:
  ```bash
  pnpm dev
  ```

- Database changes (if any) are reflected in updated `schema.sql` or `seed.sql`.

---

### 8. Commit Your Changes

```bash
git add .
git commit -m "Add: implemented awesome feature"
```

---

### 9. Push and Create Pull Request

Push your branch to your fork:
```bash
git push origin feature/awesome-feature
```

Go to the original repository and open a **Pull Request**. Provide a clear description of:
- What you changed
- Why the change was needed
- Any extra setup required

---

## 💡 Contribution Guidelines

- **Coding Style:** Follow Next.js and PostgreSQL best practices.
- **Commits:** Use short, descriptive commit messages.
- **Branches:** One feature/fix per branch.
- **Database:** If schema changes are made, update both `schema.sql` and `seed.sql`.
- **Documentation:** Update `README.md` or related docs if your changes affect setup or usage.

---

## 🐛 Reporting Issues

If you find a bug, please open an issue with:
- A clear description of the problem
- Steps to reproduce
- Expected behavior

---

## ⚠️ Common Issues & Fixes

### Issue 1: `psql: command not found`
**Solution:** PostgreSQL `bin` folder is not in PATH. Follow **step 3b** above.

---

### Issue 2: `FATAL: password authentication failed for user "postgres"`
**Solutions:**
1. Make sure you're using the correct password you set during installation
2. Check `pg_hba.conf` file (usually in `C:\Program Files\PostgreSQL\16\data\`)
3. Ensure the line for `localhost` has `md5` or `trust`:
   ```
   host    all    all    127.0.0.1/32    md5
   ```
4. Restart PostgreSQL service after changes

---

### Issue 3: `Port 5432 already in use`
**Solutions:**
1. Another PostgreSQL instance or service is running
2. Check running services (Windows: Services app, look for "postgresql")
3. Either stop the conflicting service or use a different port during installation

---

### Issue 4: `database "hims" does not exist`
**Solution:** You forgot to create the database. Run:
```sql
psql -U postgres
CREATE DATABASE hims;
\q
```

---

### Issue 5: `.env.local` not being read
**Solutions:**
1. Make sure the file is named exactly `.env.local` (not `.env.local.txt`)
2. Restart the development server after creating/modifying `.env.local`
3. Check that `DATABASE_URL` format is correct

---

### Issue 6: Schema import errors
**Common causes:**
1. Database already has tables (drop and recreate database)
2. SQL syntax errors in `schema.sql`
3. Missing dependencies (functions must be created before triggers)

**Solution:** Drop and recreate database:
```sql
psql -U postgres
DROP DATABASE hims;
CREATE DATABASE hims;
\q
psql -U postgres -d hims -f database/schema.sql
```

---

## 🙌 Need Help?

If you have questions, feel free to open a discussion or contact the maintainers via issues.

---

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [pnpm Documentation](https://pnpm.io/)
- [Database Schema Reference](./docs/database_documentation.md)

---

Thank you for contributing to **HMS**! ❤️ Together we can build a better healthcare management solution.
