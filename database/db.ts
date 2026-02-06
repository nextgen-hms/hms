import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:123@localhost:5432/hms',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Connection Log for Verification (Server-Side)
if (process.env.DATABASE_URL) {
  console.log('✅ Connected to Cloud Database (Supabase)');
} else {
  console.log('🏠 Connected to Local Database (localhost)');
}



export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
}
export default pool;