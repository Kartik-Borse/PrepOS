/**
 * User Repository
 * Handles all database operations for User entity
 */

import { query, transaction } from '../db/connection.js';
import { User, UserRow, CreateUserInput, UpdateUserInput, rowToUser, userToInsertValues } from '../models/User.js';
import { PoolClient } from 'pg';

/**
 * Create a new user
 */
export async function createUser(input: CreateUserInput): Promise<User> {
  const insertValues = userToInsertValues(input);
  
  const insertQuery = `
    INSERT INTO users (
      email, password_hash, full_name, college, graduation_year,
      oauth_provider, oauth_id, timezone
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  
  const values = [
    insertValues.email,
    insertValues.password_hash,
    insertValues.full_name,
    insertValues.college,
    insertValues.graduation_year,
    insertValues.oauth_provider,
    insertValues.oauth_id,
    insertValues.timezone,
  ];
  
  const result = await query<UserRow>(insertQuery, values);
  return rowToUser(result.rows[0]);
}

/**
 * Find user by ID
 */
export async function findUserById(id: string): Promise<User | null> {
  const result = await query<UserRow>(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  
  return result.rows.length > 0 ? rowToUser(result.rows[0]) : null;
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await query<UserRow>(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  
  return result.rows.length > 0 ? rowToUser(result.rows[0]) : null;
}

/**
 * Find user by OAuth provider and ID
 */
export async function findUserByOAuth(provider: string, oauthId: string): Promise<User | null> {
  const result = await query<UserRow>(
    'SELECT * FROM users WHERE oauth_provider = $1 AND oauth_id = $2',
    [provider, oauthId]
  );
  
  return result.rows.length > 0 ? rowToUser(result.rows[0]) : null;
}

/**
 * Update user profile
 */
export async function updateUser(id: string, updates: UpdateUserInput): Promise<User | null> {
  const updateFields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;
  
  // Build dynamic UPDATE query based on provided fields
  if (updates.fullName !== undefined) {
    updateFields.push(`full_name = $${paramCount++}`);
    values.push(updates.fullName);
  }
  if (updates.college !== undefined) {
    updateFields.push(`college = $${paramCount++}`);
    values.push(updates.college);
  }
  if (updates.graduationYear !== undefined) {
    updateFields.push(`graduation_year = $${paramCount++}`);
    values.push(updates.graduationYear);
  }
  if (updates.avatarUrl !== undefined) {
    updateFields.push(`avatar_url = $${paramCount++}`);
    values.push(updates.avatarUrl);
  }
  if (updates.dailyGoal !== undefined) {
    updateFields.push(`daily_goal = $${paramCount++}`);
    values.push(updates.dailyGoal);
  }
  if (updates.timezone !== undefined) {
    updateFields.push(`timezone = $${paramCount++}`);
    values.push(updates.timezone);
  }
  if (updates.notificationTime !== undefined) {
    updateFields.push(`notification_time = $${paramCount++}`);
    values.push(updates.notificationTime);
  }
  
  if (updateFields.length === 0) {
    // No fields to update
    return findUserById(id);
  }
  
  values.push(id);
  
  const updateQuery = `
    UPDATE users
    SET ${updateFields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *
  `;
  
  const result = await query<UserRow>(updateQuery, values);
  return result.rows.length > 0 ? rowToUser(result.rows[0]) : null;
}

/**
 * Update user streak information
 */
export async function updateUserStreak(
  id: string,
  currentStreak: number,
  longestStreak: number,
  lastActivityDate: Date
): Promise<void> {
  await query(
    `UPDATE users 
     SET current_streak = $1, 
         longest_streak = $2, 
         last_activity_date = $3
     WHERE id = $4`,
    [currentStreak, longestStreak, lastActivityDate, id]
  );
}

/**
 * Update user XP and level
 */
export async function updateUserXP(
  id: string,
  totalXp: number,
  currentLevel: number
): Promise<void> {
  await query(
    `UPDATE users 
     SET total_xp = $1, 
         current_level = $2
     WHERE id = $3`,
    [totalXp, currentLevel, id]
  );
}

/**
 * Decrement streak freezes
 */
export async function decrementStreakFreezes(id: string): Promise<boolean> {
  const result = await query(
    `UPDATE users 
     SET streak_freezes = streak_freezes - 1
     WHERE id = $1 AND streak_freezes > 0
     RETURNING streak_freezes`,
    [id]
  );
  
  return (result.rowCount ?? 0) > 0;
}

/**
 * Get users by college for leaderboard
 */
export async function getUsersByCollege(
  college: string,
  limit: number = 100,
  offset: number = 0
): Promise<User[]> {
  const result = await query<UserRow>(
    `SELECT * FROM users 
     WHERE college = $1 
     ORDER BY total_xp DESC 
     LIMIT $2 OFFSET $3`,
    [college, limit, offset]
  );
  
  return result.rows.map(rowToUser);
}

/**
 * Get user rank within college
 */
export async function getUserRankInCollege(userId: string, college: string): Promise<number | null> {
  const result = await query<{ rank: string }>(
    `SELECT COUNT(*) + 1 as rank
     FROM users
     WHERE college = $1 AND total_xp > (
       SELECT total_xp FROM users WHERE id = $2
     )`,
    [college, userId]
  );
  
  return result.rows.length > 0 ? parseInt(result.rows[0].rank, 10) : null;
}

/**
 * Delete user (for testing purposes)
 */
export async function deleteUser(id: string): Promise<boolean> {
  const result = await query(
    'DELETE FROM users WHERE id = $1',
    [id]
  );
  
  return (result.rowCount ?? 0) > 0;
}

/**
 * Check if email is already registered
 */
export async function isEmailRegistered(email: string): Promise<boolean> {
  const result = await query(
    'SELECT 1 FROM users WHERE email = $1',
    [email]
  );
  
  return result.rows.length > 0;
}
