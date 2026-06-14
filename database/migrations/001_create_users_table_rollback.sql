-- Rollback Migration: 001_create_users_table
-- Description: Rolls back the users table creation

-- Drop trigger
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop indexes
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_oauth;
DROP INDEX IF EXISTS idx_users_college;

-- Drop table
DROP TABLE IF EXISTS users;
