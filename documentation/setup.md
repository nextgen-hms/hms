# Setup

## Requirements

- Node.js `20+`
- `pnpm`
- PostgreSQL `17+`
- `psql`

## Install

```bash
pnpm install
```

## Database

Create a local database:

```sql
CREATE DATABASE hms;
```

Load schema and optional data:

```bash
psql -d hms -f db_structure.sql
psql -d hms -f seed_data.sql
```

## Environment

Create `.env.local`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/hms
secret_key=replace-me
```

## Run

```bash
pnpm dev
```

## Useful checks

```bash
pnpm lint
pnpm docs
```
