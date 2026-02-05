# 🏗️ HMS Architecture Documentation

This document provides a technical overview of the Hospital Management System (HMS) architecture, focusing on its **offline-first** design and feature-based modularity.

## 🎯 Design Philosophy

HMS is built with a **Database-First** and **Offline-First** mindset:
- **Offline-First**: Uses local PostgreSQL and Electron to ensure hospitals can operate without internet.
- **Modularity**: Code is organized into features (Doctor, Pharmacy, etc.) to ensure scalability.
- **Integrity**: Business logic is heavily enforced at the database level using triggers and constraints.

## 🔧 Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | [Next.js](https://nextjs.org/) | 15.1.x (App Router) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | 4.0.0-alpha |
| **Desktop** | [Electron](https://www.electronjs.org/) | Integration for local running |
| **Database** | [PostgreSQL](https://www.postgresql.org/) | 18.1 |
| **Types** | [TypeScript](https://www.typescriptlang.org/) | 5.x |
| **Validation**| [Zod](https://zod.dev/) | 3.x |

## 📁 Project Structure

```text
hms/
├── src/
│   ├── app/            # Next.js App Router (Pages, Layouts, API)
│   ├── features/       # Core business logic (Doctor, Pharmacy, Lab, etc.)
│   │   ├── [feature]/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   └── utils/
│   ├── components/     # UI primitives (buttons, inputs)
│   ├── contexts/       # React Contexts (Auth, Theme)
│   ├── hooks/          # Global React hooks
│   ├── lib/            # Utility libraries (DB client, etc.)
│   └── styles/         # Global CSS and Tailwind config
├── public/             # Static assets
└── database/           # DB schema, seeds, and migrations
```

## 🔄 Core Data Flow

1. **User Interaction**: React components in `src/features` handle UI.
2. **Business Logic**: Mutations are performed via **Server Actions** or **API Routes**.
3. **Data Persistence**: Directly into local PostgreSQL via `pg` client.
4. **Trigger Events**: Database triggers automatically update stock levels, log transactions, and maintain audit trails.
5. **UI Update**: Components revalidate data using Next.js caching or local state updates.

---

> [!IMPORTANT]
> Always maintain the **Database-First** approach. Stock calculations and critical audits should NEVER be handled purely in frontend JS; they must rely on PostgreSQL triggers.
