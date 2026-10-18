import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/freelancer_db';

const isCloudDB = 
  connectionString.includes('supabase.co') || 
  connectionString.includes('supabase.com') || 
  connectionString.includes('render.com') || 
  connectionString.includes('neon.tech') ||
  process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString,
  ssl: isCloudDB ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
});

export const query = (text, params) => pool.query(text, params);

export const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW() as current_time, current_database() as db_name');
    console.log(`[DB] Connected successfully to "${res.rows[0].db_name}" at ${res.rows[0].current_time}`);
    return true;
  } catch (error) {
    console.error('[DB] Database connection error:', error.message);
    return false;
  }
};

export default pool;
