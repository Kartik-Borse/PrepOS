/**
 * Database Migration Runner
 * Applies the unified database/schema.sql to set up the database.
 */

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection configuration
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://placement_user:placement_pass@localhost:5432/placement_prep';

const pool = new Pool({
  connectionString: DATABASE_URL,
});

const SCHEMA_FILE_PATH = path.join(__dirname, '../../../../database/schema.sql');

/**
 * Apply the unified database schema (up migration)
 */
async function migrateUp(): Promise<void> {
  console.log('🚀 Initializing database schema...\n');
  
  if (!fs.existsSync(SCHEMA_FILE_PATH)) {
    console.error('❌ Schema file not found:', SCHEMA_FILE_PATH);
    throw new Error(`Schema file not found at ${SCHEMA_FILE_PATH}`);
  }

  const sql = fs.readFileSync(SCHEMA_FILE_PATH, 'utf-8');
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('✓ Database schema and seed data applied successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to apply database schema:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Drop all database tables, views, triggers, functions (down migration/rollback)
 */
async function migrateDown(): Promise<void> {
  console.log('🔄 Cleaning up database schema (dropping all tables)...\n');
  
  const dropTablesSql = `
    DROP TABLE IF EXISTS leaderboard_snapshots CASCADE;
    DROP TABLE IF EXISTS study_plans CASCADE;
    DROP TABLE IF EXISTS ai_interview_sessions CASCADE;
    DROP TABLE IF EXISTS cs_mcqs CASCADE;
    DROP TABLE IF EXISTS cs_topics CASCADE;
    DROP TABLE IF EXISTS user_mock_attempts CASCADE;
    DROP TABLE IF EXISTS mock_tests CASCADE;
    DROP TABLE IF EXISTS aptitude_questions CASCADE;
    DROP TABLE IF EXISTS aptitude_categories CASCADE;
    DROP TABLE IF EXISTS user_badges CASCADE;
    DROP TABLE IF EXISTS badges CASCADE;
    DROP TABLE IF EXISTS streak_history CASCADE;
    DROP TABLE IF EXISTS user_problem_progress CASCADE;
    DROP TABLE IF EXISTS submissions CASCADE;
    DROP TABLE IF EXISTS test_cases CASCADE;
    DROP TABLE IF EXISTS problems CASCADE;
    DROP TABLE IF EXISTS dsa_patterns CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
  `;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(dropTablesSql);
    await client.query('COMMIT');
    console.log('✓ All tables and database objects dropped successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Failed to drop database schema:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Show database initialization status
 */
async function showStatus(): Promise<void> {
  console.log('📊 Database Status\n');
  
  const client = await pool.connect();
  try {
    // Query pg_tables to check which of our key tables exist
    const result = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('users', 'problems', 'dsa_patterns', 'submissions')
    `);
    
    const existingTables = result.rows.map(row => row.tablename);
    const requiredTables = ['users', 'problems', 'dsa_patterns', 'submissions'];
    
    console.log('Key Tables Check:');
    requiredTables.forEach(table => {
      const exists = existingTables.includes(table);
      console.log(`  ${exists ? '✓' : '○'} ${table}`);
    });
    
    console.log('');
    if (existingTables.length === requiredTables.length) {
      console.log('Status: Database is FULLY INITIALIZED.');
    } else if (existingTables.length > 0) {
      console.log('Status: Database is PARTIALLY INITIALIZED.');
    } else {
      console.log('Status: Database is NOT INITIALIZED.');
    }
    console.log('');
  } catch (error) {
    console.error('❌ Failed to check database status:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Main CLI handler
 */
async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'up':
        await migrateUp();
        break;
      case 'down':
        await migrateDown();
        break;
      case 'status':
        await showStatus();
        break;
      default:
        console.log('Usage: npm run migrate <command>');
        console.log('');
        console.log('Commands:');
        console.log('  up      - Apply database schema and seed data');
        console.log('  down    - Drop all database tables (destructive)');
        console.log('  status  - Show database initialization status');
        process.exit(1);
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { migrateUp, migrateDown, showStatus };
