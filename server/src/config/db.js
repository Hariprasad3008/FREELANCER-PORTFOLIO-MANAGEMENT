import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const { Pool } = pg;

let connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/freelancer_db';

const isCloudDB = 
  connectionString.includes('supabase.co') || 
  connectionString.includes('supabase.com') || 
  connectionString.includes('render.com') || 
  connectionString.includes('neon.tech') ||
  process.env.NODE_ENV === 'production';

// Strip sslmode from URL if present to let Node pg's ssl config govern
if (isCloudDB && connectionString.includes('sslmode=')) {
  connectionString = connectionString.replace(/[?&]sslmode=[^&]+/, '');
}

const pool = new Pool({
  connectionString,
  ssl: isCloudDB ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
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
