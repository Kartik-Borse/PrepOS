/**
 * User Entity Model
 * Represents a student user on the Placement Preparation Platform
 */

export interface User {
  // Identity
  id: string; // UUID
  email: string;
  passwordHash?: string; // Optional for OAuth users
  fullName: string;
  college?: string;
  graduationYear?: number;
  avatarUrl?: string;
  
  // OAuth Integration
  oauthProvider?: 'google';
  oauthId?: string;
  
  // Gamification
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date | null;
  totalXp: number;
  currentLevel: number;
  streakFreezes: number;
  
  // Preferences
  dailyGoal: number;
  timezone: string;
  notificationTime: string; // HH:MM:SS format
  theme?: 'light' | 'dark';
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User creation input (for registration)
 */
export interface CreateUserInput {
  email: string;
  passwordHash?: string;
  fullName: string;
  college?: string;
  graduationYear?: number;
  oauthProvider?: 'google';
  oauthId?: string;
  timezone?: string;
}

/**
 * User update input (for profile updates)
 */
export interface UpdateUserInput {
  fullName?: string;
  college?: string;
  graduationYear?: number;
  avatarUrl?: string;
  dailyGoal?: number;
  timezone?: string;
  notificationTime?: string;
  theme?: 'light' | 'dark';
}

/**
 * Database row type (matches actual PostgreSQL schema)
 */
export interface UserRow {
  id: string;
  email: string;
  password_hash: string | null;
  full_name: string;
  college: string | null;
  graduation_year: number | null;
  avatar_url: string | null;
  oauth_provider: string | null;
  oauth_id: string | null;
  current_streak: number;
  longest_streak: number;
  last_activity_date: Date | null;
  total_xp: number;
  current_level: number;
  streak_freezes: number;
  daily_goal: number;
  timezone: string;
  notification_time: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Convert database row to User entity
 */
export function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash || undefined,
    fullName: row.full_name,
    college: row.college || undefined,
    graduationYear: row.graduation_year || undefined,
    avatarUrl: row.avatar_url || undefined,
    oauthProvider: row.oauth_provider as 'google' | undefined,
    oauthId: row.oauth_id || undefined,
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    lastActivityDate: row.last_activity_date,
    totalXp: row.total_xp,
    currentLevel: row.current_level,
    streakFreezes: row.streak_freezes,
    dailyGoal: row.daily_goal,
    timezone: row.timezone,
    notificationTime: row.notification_time,
    theme: undefined, // Theme will be stored in configuration table later
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Convert User entity to database insert values
 */
export function userToInsertValues(user: CreateUserInput): Partial<UserRow> {
  return {
    email: user.email,
    password_hash: user.passwordHash || null,
    full_name: user.fullName,
    college: user.college || null,
    graduation_year: user.graduationYear || null,
    oauth_provider: user.oauthProvider || null,
    oauth_id: user.oauthId || null,
    timezone: user.timezone || 'UTC',
  };
}
