/**
 * Authentication Routes Integration Tests
 * Tests: Requirements 1.1, 1.3, 1.6
 */

import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../index.js';
import * as authService from '../../services/authService.js';

describe('Authentication Routes', () => {
  let registerUserSpy: jest.SpiedFunction<typeof authService.registerUser>;
  let loginUserSpy: jest.SpiedFunction<typeof authService.loginUser>;

  beforeEach(() => {
    // Create spies
    registerUserSpy = jest.spyOn(authService, 'registerUser');
    loginUserSpy = jest.spyOn(authService, 'loginUser');
  });

  afterEach(() => {
    // Restore all mocks
    jest.restoreAllMocks();
  });

  describe('POST /api/auth/register', () => {
    const validRegistrationData = {
      email: 'test@example.com',
      password: 'ValidPass123!',
      fullName: 'Test User',
    };

    it('should successfully register a user with valid data', async () => {
      registerUserSpy.mockResolvedValue({
        success: true,
        user: {
          id: '123',
          email: 'test@example.com',
          fullName: 'Test User',
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: null,
          totalXp: 0,
          currentLevel: 1,
          streakFreezes: 2,
          dailyGoal: 3,
          timezone: 'UTC',
          notificationTime: '09:00:00',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegistrationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.passwordHash).toBeUndefined(); // Should not return password hash
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          // Missing password and fullName
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(registerUserSpy).not.toHaveBeenCalled();
    });

    it('should return 422 for invalid email format', async () => {
      registerUserSpy.mockResolvedValue({
        success: false,
        error: 'INVALID_EMAIL',
        details: ['Email format is invalid'],
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validRegistrationData,
          email: 'invalid-email',
        })
        .expect(422);

      expect(response.body.error.code).toBe('INVALID_EMAIL');
    });

    it('should return 422 for weak password', async () => {
      registerUserSpy.mockResolvedValue({
        success: false,
        error: 'WEAK_PASSWORD',
        details: ['Password must be at least 8 characters long'],
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validRegistrationData,
          password: 'weak',
        })
        .expect(422);

      expect(response.body.error.code).toBe('WEAK_PASSWORD');
      expect(response.body.error.details).toBeDefined();
    });

    it('should return 409 for already registered email', async () => {
      registerUserSpy.mockResolvedValue({
        success: false,
        error: 'EMAIL_EXISTS',
        details: ['An account with this email already exists'],
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegistrationData)
        .expect(409);

      expect(response.body.error.code).toBe('EMAIL_EXISTS');
    });

    it('should accept optional fields (college, graduationYear, timezone)', async () => {
      registerUserSpy.mockResolvedValue({
        success: true,
        user: {
          id: '123',
          email: 'test@example.com',
          fullName: 'Test User',
          college: 'MIT',
          graduationYear: 2024,
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: null,
          totalXp: 0,
          currentLevel: 1,
          streakFreezes: 2,
          dailyGoal: 3,
          timezone: 'America/New_York',
          notificationTime: '09:00:00',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validRegistrationData,
          college: 'MIT',
          graduationYear: 2024,
          timezone: 'America/New_York',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(registerUserSpy).toHaveBeenCalledWith(
        validRegistrationData.email,
        validRegistrationData.password,
        validRegistrationData.fullName,
        {
          college: 'MIT',
          graduationYear: 2024,
          timezone: 'America/New_York',
        }
      );
    });

    it('should return 500 on unexpected error', async () => {
      registerUserSpy.mockRejectedValue(new Error('Unexpected error'));

      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegistrationData)
        .expect(500);

      expect(response.body.error.code).toBe('INTERNAL_SERVER_ERROR');
    });
  });

  describe('POST /api/auth/login', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: 'ValidPass123!',
    };

    it('should successfully login with valid credentials', async () => {
      loginUserSpy.mockResolvedValue({
        success: true,
        token: 'test.jwt.token',
        user: {
          id: '123',
          email: 'test@example.com',
          fullName: 'Test User',
          currentStreak: 5,
          longestStreak: 10,
          lastActivityDate: new Date(),
          totalXp: 150,
          currentLevel: 2,
          streakFreezes: 2,
          dailyGoal: 3,
          timezone: 'UTC',
          notificationTime: '09:00:00',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.passwordHash).toBeUndefined(); // Should not return password hash
      expect(response.body.token).toBe('test.jwt.token');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          // Missing password
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(loginUserSpy).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid credentials', async () => {
      loginUserSpy.mockResolvedValue({
        success: false,
        error: 'INVALID_CREDENTIALS',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData)
        .expect(401);

      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
      expect(response.body.error.message).toBe('Invalid email or password');
    });

    it('should return 401 for non-existent user', async () => {
      loginUserSpy.mockResolvedValue({
        success: false,
        error: 'INVALID_CREDENTIALS',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!',
        })
        .expect(401);

      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should return 401 for wrong password', async () => {
      loginUserSpy.mockResolvedValue({
        success: false,
        error: 'INVALID_CREDENTIALS',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          ...validLoginData,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should return 500 on unexpected error', async () => {
      loginUserSpy.mockRejectedValue(new Error('Unexpected error'));

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData)
        .expect(500);

      expect(response.body.error.code).toBe('INTERNAL_SERVER_ERROR');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should reject requests without a bearer token', async () => {
      const response = await request(app).get('/api/auth/me').expect(401);

      expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
    });
  });
});
