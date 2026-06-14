/**
 * Authentication Service Unit Tests
 * Tests: Requirements 1.1, 1.3, 1.6
 */

import { jest } from '@jest/globals';
import { verifyPassword } from '../authService.js';
import { validateEmail, validatePassword } from '../../utils/validation.js';
import bcrypt from 'bcrypt';

describe('Authentication Service', () => {
  describe('Password validation (Requirements 1.3)', () => {
    it('should accept strong passwords with all requirements', () => {
      const validPasswords = [
        'ValidPass123!',
        'Str0ng!Password',
        'MyP@ssw0rd',
        'Test1234!',
        'Abcdef1!',
      ];

      validPasswords.forEach((password) => {
        const result = validatePassword(password);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject weak password (too short)', () => {
      const result = validatePassword('Short1!');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject password missing uppercase letter', () => {
      const result = validatePassword('password123!');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password missing number', () => {
      const result = validatePassword('Password!');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject password missing special character', () => {
      const result = validatePassword('Password123');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });
  });

  describe('Email validation (Requirements 1.3)', () => {
    it('should accept valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user_name@example-domain.com',
      ];

      validEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid',
        'invalid@',
        '@example.com',
        'test @example.com',
        'test@@example.com',
      ];

      invalidEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(false);
      });
    });
  });

  describe('Password hashing with bcrypt (Requirements 1.6)', () => {
    it('should hash password using 12 salt rounds', async () => {
      const password = 'TestPassword123!';
      const hash = await bcrypt.hash(password, 12);

      // Bcrypt hash should start with $2b$12$ (algorithm + salt rounds)
      expect(hash).toMatch(/^\$2b\$12\$/);
    });

    it('should generate different hashes for same password (salt)', async () => {
      const password = 'TestPassword123!';
      const hash1 = await bcrypt.hash(password, 12);
      const hash2 = await bcrypt.hash(password, 12);

      // Same password should generate different hashes due to salt
      expect(hash1).not.toBe(hash2);
    });

    it('should verify correct password against hash', async () => {
      const password = 'TestPassword123!';
      const hash = await bcrypt.hash(password, 12);

      const result = await verifyPassword(password, hash);

      expect(result).toBe(true);
    });

    it('should reject incorrect password against hash', async () => {
      const password = 'TestPassword123!';
      const hash = await bcrypt.hash(password, 12);

      const result = await verifyPassword('WrongPassword123!', hash);

      expect(result).toBe(false);
    });

    it('should return false on bcrypt error', async () => {
      jest.spyOn(bcrypt, 'compare').mockRejectedValue(new Error('Bcrypt error'));

      const result = await verifyPassword('password', 'invalid-hash');

      expect(result).toBe(false);
    });
  });

  describe('Email normalization', () => {
    it('should convert email to lowercase for consistency', () => {
      const email = 'TEST@EXAMPLE.COM';
      const normalized = email.toLowerCase();

      expect(normalized).toBe('test@example.com');
    });
  });

  describe('Password strength requirements validation', () => {
    it('should enforce minimum 8 characters', () => {
      expect(validatePassword('Abc1!').valid).toBe(false);
      expect(validatePassword('Abc12345!').valid).toBe(true);
    });

    it('should enforce at least one uppercase', () => {
      expect(validatePassword('password123!').valid).toBe(false);
      expect(validatePassword('Password123!').valid).toBe(true);
    });

    it('should enforce at least one number', () => {
      expect(validatePassword('Password!').valid).toBe(false);
      expect(validatePassword('Password1!').valid).toBe(true);
    });

    it('should enforce at least one special character', () => {
      expect(validatePassword('Password123').valid).toBe(false);
      expect(validatePassword('Password123!').valid).toBe(true);
    });

    it('should accept various special characters', () => {
      const specialChars = '!@#$%^&*(),.?":{}|<>';
      
      for (const char of specialChars) {
        const password = `Password123${char}`;
        const result = validatePassword(password);
        expect(result.valid).toBe(true);
      }
    });
  });
});
