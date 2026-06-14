# Database Migrations

This directory contains SQL migration files for the Placement Preparation Platform database.

## Migration System

The platform uses a simple SQL-based migration system with the following features:

- **Sequential migrations**: Migrations are numbered (001, 002, 003...) and applied in order
- **Tracking**: Applied migrations are recorded in the `schema_migrations` table
- **Rollback support**: Each migration has a corresponding `_rollback.sql` file
- **Transaction safety**: Each migration runs in a transaction (rolls back on error)

## Directory Structure

```
database/migrations/
├── README.md
├── 001_create_users_table.sql
├── 001_create_users_table_rollback.sql
├── 002_next_migration.sql
└── 002_next_migration_rollback.sql
```

## Migration Commands

Run migrations from the `packages/backend` directory:

```bash
# Show migration status
npm run migrate:status

# Apply all pending migrations
npm run migrate:up

# Rollback the last migration
npm run migrate:down
```

## Creating New Migrations

1. **Create migration file**: `database/migrations/XXX_description.sql`
   - Use sequential numbering (001, 002, 003...)
   - Use descriptive names (e.g., `002_create_problems_table.sql`)
   
2. **Create rollback file**: `database/migrations/XXX_description_rollback.sql`
   - Must undo everything the migration does
   - Drop tables, indexes, functions, triggers in reverse order

3. **Migration file structure**:
   ```sql
   -- Migration: XXX_description
   -- Description: What this migration does
   -- Requirements: Reference to requirements (e.g., 1.1, 1.6)
   
   -- Your SQL here
   CREATE TABLE ...
   CREATE INDEX ...
   ```

4. **Rollback file structure**:
   ```sql
   -- Rollback Migration: XXX_description
   -- Description: Rolls back XXX_description
   
   -- Reverse operations in reverse order
   DROP INDEX ...
   DROP TABLE ...
   ```

## Best Practices

### DO:
- ✅ Use transactions (migrations runner handles this automatically)
- ✅ Add `IF EXISTS` / `IF NOT EXISTS` clauses for idempotency
- ✅ Include comments explaining the purpose
- ✅ Reference requirements in comments
- ✅ Create indexes for foreign keys and frequently queried columns
- ✅ Add constraints to ensure data integrity
- ✅ Test both up and down migrations

### DON'T:
- ❌ Modify existing migration files after they've been applied
- ❌ Skip sequence numbers
- ❌ Delete migration files
- ❌ Put multiple unrelated changes in one migration
- ❌ Forget to create the rollback file

## Existing Migrations

### 001_create_users_table.sql
Creates the `users` table with all required fields for user authentication and gamification.

**Fields**:
- Identity: id, email, password_hash, full_name, college, graduation_year, avatar_url
- OAuth: oauth_provider, oauth_id
- Gamification: current_streak, longest_streak, last_activity_date, total_xp, current_level, streak_freezes
- Preferences: daily_goal, timezone, notification_time
- Metadata: created_at, updated_at

**Indexes**:
- `idx_users_email`: Fast email lookups for authentication
- `idx_users_oauth`: Fast OAuth provider lookups
- `idx_users_college`: Fast college-based leaderboard queries

**Constraints**:
- Email must be unique
- Streaks, XP, and levels must be non-negative
- Longest streak >= current streak
- OAuth provider must be 'google' or NULL
- Daily goal must be positive

**Triggers**:
- Automatically updates `updated_at` timestamp on row updates

## Database Connection

The migration system uses the `DATABASE_URL` environment variable:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/database_name
```

Configure this in `packages/backend/.env`.

## Troubleshooting

### Migration fails with "already exists" error
- Check if the migration was partially applied
- Review the `schema_migrations` table
- May need to manually clean up and re-run

### Rollback fails
- Check the rollback SQL syntax
- Ensure rollback file drops/removes in reverse order
- May need to manually fix the database state

### Connection timeout
- Check that PostgreSQL is running
- Verify DATABASE_URL is correct
- Check network/firewall settings
