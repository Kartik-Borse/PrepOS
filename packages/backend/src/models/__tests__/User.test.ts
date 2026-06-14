/**
 * Unit tests for User model transformations
 */

import { rowToUser, userToInsertValues, UserRow, CreateUserInput } from '../User.js';

describe('User Model Transformations', () => {
  describe('rowToUser', () => {
    it('should convert database row to User entity', () => {
      const row: UserRow = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        password_hash: 'hashed_password',
        full_name: 'Test User',
        college: 'Test College',
        graduation_year: 2024,
        avatar_url: 'https://example.com/avatar.jpg',
        oauth_provider: null,
        oauth_id: null,
        current_streak: 5,
        longest_streak: 10,
        last_activity_date: new Date('2024-01-15'),
        total_xp: 150,
        current_level: 3,
        streak_freezes: 2,
        daily_goal: 3,
        timezone: 'America/New_York',
        notification_time: '19:00:00',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-15'),
      };

      const user = rowToUser(row);

      expect(user.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(user.email).toBe('test@example.com');
      expect(user.passwordHash).toBe('hashed_password');
      expect(user.fullName).toBe('Test User');
      expect(user.college).toBe('Test College');
      expect(user.graduationYear).toBe(2024);
      expect(user.currentStreak).toBe(5);
      expect(user.longestStreak).toBe(10);
      expect(user.totalXp).toBe(150);
      expect(user.currentLevel).toBe(3);
      expect(user.streakFreezes).toBe(2);
      expect(user.dailyGoal).toBe(3);
      expect(user.timezone).toBe('America/New_York');
    });

    it('should handle null values correctly', () => {
      const row: UserRow = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        password_hash: null,
        full_name: 'OAuth User',
        college: null,
        graduation_year: null,
        avatar_url: null,
        oauth_provider: 'google',
        oauth_id: 'google123',
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: null,
        total_xp: 0,
        current_level: 1,
        streak_freezes: 0,
        daily_goal: 1,
        timezone: 'UTC',
        notification_time: '19:00:00',
        created_at: new Date(),
        updated_at: new Date(),
      };

      const user = rowToUser(row);

      expect(user.passwordHash).toBeUndefined();
      expect(user.college).toBeUndefined();
      expect(user.graduationYear).toBeUndefined();
      expect(user.avatarUrl).toBeUndefined();
      expect(user.oauthProvider).toBe('google');
      expect(user.oauthId).toBe('google123');
      expect(user.lastActivityDate).toBeNull();
    });
  });

  describe('userToInsertValues', () => {
    it('should convert CreateUserInput to database insert values', () => {
      const input: CreateUserInput = {
        email: 'newuser@example.com',
        passwordHash: 'hashed_password',
        fullName: 'New User',
        college: 'Test College',
        graduationYear: 2025,
        timezone: 'Asia/Kolkata',
      };

      const insertValues = userToInsertValues(input);

      expect(insertValues.email).toBe('newuser@example.com');
      expect(insertValues.password_hash).toBe('hashed_password');
      expect(insertValues.full_name).toBe('New User');
      expect(insertValues.college).toBe('Test College');
      expect(insertValues.graduation_year).toBe(2025);
      expect(insertValues.timezone).toBe('Asia/Kolkata');
    });

    it('should handle optional fields correctly', () => {
      const input: CreateUserInput = {
        email: 'minimal@example.com',
        fullName: 'Minimal User',
      };

      const insertValues = userToInsertValues(input);

      expect(insertValues.email).toBe('minimal@example.com');
      expect(insertValues.full_name).toBe('Minimal User');
      expect(insertValues.college).toBeNull();
      expect(insertValues.graduation_year).toBeNull();
      expect(insertValues.timezone).toBe('UTC');
    });

    it('should convert OAuth user input correctly', () => {
      const input: CreateUserInput = {
        email: 'oauth@example.com',
        fullName: 'OAuth User',
        oauthProvider: 'google',
        oauthId: 'google123456',
      };

      const insertValues = userToInsertValues(input);

      expect(insertValues.email).toBe('oauth@example.com');
      expect(insertValues.password_hash).toBeNull();
      expect(insertValues.oauth_provider).toBe('google');
      expect(insertValues.oauth_id).toBe('google123456');
    });
  });
});
