# Deployment Guide

## Runtime assumptions

- Next.js app server
- Supabase-hosted PostgreSQL
- `DATABASE_URL` available to the server runtime
- `secret_key` set for JWT signing

## Required environment variables

```env
DATABASE_URL=postgresql://...
secret_key=replace-me
```

## Database deployment notes

- Prefer using live migrations or vetted SQL files rather than manually editing production schema from memory
- `db_structure.sql` and `dump.sql` can help bootstrap environments, but the live Supabase project is the current authority
- Current live Supabase migration history includes `20260303185544_fix_sale_return_detail_trigger`

## Production cautions

- do not deploy with plaintext passwords
- do not rely on placeholder staff identity logic
- verify HTTPS so secure cookies function as expected
- review database/network access before exposing the app publicly
