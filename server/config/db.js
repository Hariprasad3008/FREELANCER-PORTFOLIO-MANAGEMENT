import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

console.log("DATABASE_URL loaded:", !!process.env.DATABASE_URL);

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export default pool;