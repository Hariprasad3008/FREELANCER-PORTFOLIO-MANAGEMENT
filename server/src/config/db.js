import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// Support both standard PostgreSQL and Supabase transaction/session poolers
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" || process.env.DATABASE_URL?.includes("supabase.co")
    ? { rejectUnauthorized: false }
    : false,
});

pool.on("connect", () => {
  console.log(" Connected to PostgreSQL Database successfully.");
});

pool.on("error", (err) => {
  console.error("❌ Unexpected PostgreSQL client error:", err);
});

export default pool;
