import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  console.log('[Migration] Starting database migration for normalized schema...');
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Optional: Drop legacy tables if migrating from previous flat schema
    await client.query(`
      DROP TABLE IF EXISTS messages, conversation_participants, conversations,
      saved_freelancers, saved_projects, reviews, contracts, proposals,
      project_skills, projects, portfolio_projects, freelancer_skills, skills,
      client_profiles, freelancer_profiles, users,
      -- legacy table names cleanup
      saved_profiles, portfolio_items, profiles
      CASCADE;
    `);

    await client.query(schemaSql);
    await client.query('COMMIT');
    console.log('[Migration] Database schema created successfully with all 16 normalized tables!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Migration] Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
