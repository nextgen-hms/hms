# 🚀 Deployment Guide: Next.js + Vercel + Supabase

This guide walks you through deploying the HMS project to production.

## 1. Supabase Setup (Database)

Supabase provides a powerful PostgreSQL database with a friendly management interface.

1.  **Create Project**: Go to [supabase.com](https://supabase.com) and create a new project.
2.  **Database Password**: Save your database password carefully; you'll need it for the connection string.
3.  **Get Connection String**:
    - Go to **Project Settings** -> **Database**.
    - Find the **Connection string** section.
    - Select **Node.js** and copy the URI. 
    - Replace `[YOUR-PASSWORD]` with your actual password.
    - *Note: For serverless (Vercel), using the **Transaction Mode** (Port 6543) is often better.*

## 2. Database Migration

Now, let's load your schema and data into Supabase.

1.  Open the **SQL Editor** in your Supabase dashboard.
2.  **Run Schema**: Open [**db_structure.sql**](file:///home/oops/projects/hms/db_structure.sql), copy everything, and paste it into a new query.
    > [!CAUTION]
    > **CRITICAL CLEANUP**: Before running, delete the first ~20 lines of the file. 
    > Specifically, remove anything starting with `\restrict` or `SET ...` or `SELECT pg_catalog.set_config...`. 
    > Start your script from the first `CREATE FUNCTION` or `CREATE TABLE` command.
3.  Click **Run**.
    > [!IMPORTANT]
    > **COPY COMMAND ERROR**: If you get an error about `\` or `COPY ... FROM stdin`, it's because Supabase's web editor doesn't support the `COPY` command.
    > Scroll through your script and **DELETE** all blocks that look like this:
    > ```sql
    > COPY public.table_name (...) FROM stdin;
    > .
    > \.
    > ```
    > These blocks are usually empty data imports. Deleting them will let the script finish creating your tables!
4.  **Run Seed Data**: Copy the contents of [**seed_data.sql**](file:///home/oops/projects/hms/seed_data.sql) and run it in a fresh query tab to populate the initial records.

## 3. GitHub & Vercel (Frontend)

1.  **Push to GitHub**:
    - Create a new repository on GitHub.
    - Run:
      ```bash
      git init
      git add .
      git commit -m "Initial commit for deployment"
      git remote add origin https://github.com/your-username/hms-repo.git
      git branch -M main
      git push -u origin main
      ```
2.  **Import to Vercel**:
    - Log in to [vercel.com](https://vercel.com).
    - Click **Add New** -> **Project**.
    - Import your GitHub repository.

## 4. Environment Variables

In the Vercel project configuration, add the following environment variables:

| Name | Value | Purpose |
|------|-------|---------|
| `DATABASE_URL` | `postgresql://postgres.[ID]:[PWD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true` | DB Connection |
| `NEXT_PUBLIC_API_URL` | `/api` | Base API Path |
| `secret_key` | `your-random-secure-string` | JWT Encryption |

## 🏗️ Technical Explanation: Why this stack?

- **Supabase**: Instead of running a local Postgres server, Supabase hosts it in the cloud. It manages backups, security, and scaling automatically.
- **Vercel**: Optimized for Next.js. It provides global edge hosting, automatic SSL, and instant deployments every time you push code to GitHub.
- **Connection Pooling**: We use `pgbouncer=true` in the connection string because serverless functions (Vercel) create many short-lived connections that can overwhelm a standard database. Pgbouncer manages these effectively.

---
**Need help?** Ask me any specific question about these steps! ❤️
