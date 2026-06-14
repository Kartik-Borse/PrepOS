/**
 * Database Migration Runner
 * Applies SQL migration files from database/migrations directory
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

// Migration tracking table
const MIGRATIONS_TABLE = 'schema_migrations';

/**
 * Initialize migrations tracking table
 */
async function initializeMigrationsTable(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ Migrations tracking table ready');
  } finally {
    client.release();
  }
}

/**
 * Get list of applied migrations
 */
async function getAppliedMigrations(): Promise<string[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT migration_name FROM ${MIGRATIONS_TABLE} ORDER BY id`
    );
    return result.rows.map(row => row.migration_name);
  } finally {
    client.release();
  }
}

/**
 * Mark migration as applied
 */
async function recordMigration(migrationName: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO ${MIGRATIONS_TABLE} (migration_name) VALUES ($1)`,
      [migrationName]
    );
  } finally {
    client.release();
  }
}

/**
 * Remove migration from tracking table
 */
async function removeMigration(migrationName: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(
      `DELETE FROM ${MIGRATIONS_TABLE} WHERE migration_name = $1`,
      [migrationName]
    );
  } finally {
    client.release();
  }
}

/**
 * Get all migration files from database/migrations directory
 */
function getMigrationFiles(): string[] {
  const migrationsDir = path.join(__dirname, '../../../../database/migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.error('❌ Migrations directory not found:', migrationsDir);
    return [];
  }

  const files = fs.readdirSync(migrationsDir);
  
  // Filter for .sql files excluding rollback files
  return files
    .filter(file => file.endsWith('.sql') && !file.includes('rollback'))
    .sort();
}

/**
 * Apply a single migration file
 */
async function applyMigration(migrationFile: string): Promise<void> {
  const migrationsDir = path.join(__dirname, '../../../../database/migrations');
  const migrationPath = path.join(migrationsDir, migrationFile);
  
  console.log(`Applying migration: ${migrationFile}`);
  
  const sql = fs.readFileSync(migrationPath, 'utf-8');
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await recordMigration(migrationFile);
    await client.query('COMMIT');
    console.log(`✓ Applied: ${migrationFile}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`❌ Failed to apply ${migrationFile}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Rollback a single migration
 */
async function rollbackMigration(migrationFile: string): Promise<void> {
  const migrationsDir = path.join(__dirname, '../../../../database/migrations');
  const rollbackFile = migrationFile.replace('.sql', '_rollback.sql');
  const rollbackPath = path.join(migrationsDir, rollbackFile);
  
  if (!fs.existsSync(rollbackPath)) {
    console.error(`❌ Rollback file not found: ${rollbackFile}`);
    throw new Error(`Rollback file not found for ${migrationFile}`);
  }
  
  console.log(`Rolling back migration: ${migrationFile}`);
  
  const sql = fs.readFileSync(rollbackPath, 'utf-8');
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await removeMigration(migrationFile);
    await client.query('COMMIT');
    console.log(`✓ Rolled back: ${migrationFile}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`❌ Failed to rollback ${migrationFile}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Run all pending migrations
 */
async function migrateUp(): Promise<void> {
  console.log('🚀 Starting database migrations...\n');
  
  await initializeMigrationsTable();
  
  const appliedMigrations = await getAppliedMigrations();
  const migrationFiles = getMigrationFiles();
  
  const pendingMigrations = migrationFiles.filter(
    file => !appliedMigrations.includes(file)
  );
  
  if (pendingMigrations.length === 0) {
    console.log('✓ No pending migrations\n');
    return;
  }
  
  console.log(`Found ${pendingMigrations.length} pending migration(s)\n`);
  
  for (const migrationFile of pendingMigrations) {
    await applyMigration(migrationFile);
  }
  
  console.log('\n✓ All migrations completed successfully');
}

/**
 * Rollback the last migration
 */
async function migrateDown(): Promise<void> {
  console.log('🔄 Rolling back last migration...\n');
  
  await initializeMigrationsTable();
  
  const appliedMigrations = await getAppliedMigrations();
  
  if (appliedMigrations.length === 0) {
    console.log('✓ No migrations to rollback\n');
    return;
  }
  
  const lastMigration = appliedMigrations[appliedMigrations.length - 1];
  await rollbackMigration(lastMigration);
  
  console.log('\n✓ Rollback completed successfully');
}

/**
 * Show migration status
 */
async function showStatus(): Promise<void> {
  console.log('📊 Migration Status\n');
  
  await initializeMigrationsTable();
  
  const appliedMigrations = await getAppliedMigrations();
  const migrationFiles = getMigrationFiles();
  
  console.log('Applied Migrations:');
  if (appliedMigrations.length === 0) {
    console.log('  (none)');
  } else {
    appliedMigrations.forEach(migration => {
      console.log(`  ✓ ${migration}`);
    });
  }
  
  console.log('\nPending Migrations:');
  const pendingMigrations = migrationFiles.filter(
    file => !appliedMigrations.includes(file)
  );
  
  if (pendingMigrations.length === 0) {
    console.log('  (none)');
  } else {
    pendingMigrations.forEach(migration => {
      console.log(`  ○ ${migration}`);
    });
  }
  
  console.log('');
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
        console.log('  up      - Apply all pending migrations');
        console.log('  down    - Rollback the last migration');
        console.log('  status  - Show migration status');
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
