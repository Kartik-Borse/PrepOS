/**
 * Validation Utilities Unit Tests
 * Tests: Requirements 1.3
 */

import { validateEmail, validatePassword, sanitizeString } from '../validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should accept valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user_name@example-domain.com',
        'test123@test123.com',
        'a@b.co',
      ];

      validEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid',
        'invalid@',
        '@example.com',
        'test@',
        'test @example.com',
        'test@example',
        '',
        'test@@example.com',
        'test..name@example.com',
      ];

      invalidEmails.forEach((email) => {
        expect(validateEmail(email)).toBe(false);
      });
    });

    it('should reject non-string input', () => {
      expect(validateEmail(null as any)).toBe(false);
      expect(validateEmail(undefined as any)).toBe(false);
      expect(validateEmail(123 as any)).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should accept valid strong passwords', () => {
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

    it('should reject password shorter than 8 characters', () => {
      const result = validatePassword('Short1!');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject password without uppercase letter', () => {
      const result = validatePassword('lowercase123!');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without number', () => {
      const result = validatePassword('NoNumbers!');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject password without special character', () => {
      const result = validatePassword('NoSpecial123');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should reject password with multiple violations', () => {
      const result = validatePassword('weak');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain('Password must be at least 8 characters long');
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
      expect(result.errors).toContain('Password must contain at least one number');
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should accept various special characters', () => {
      const specialChars = '!@#$%^&*(),.?":{}|<>';
      
      for (const char of specialChars) {
        const password = `Password123${char}`;
        const result = validatePassword(password);
        expect(result.valid).toBe(true);
      }
    });

    it('should reject empty or null password', () => {
      expect(validatePassword('').valid).toBe(false);
      expect(validatePassword(null as any).valid).toBe(false);
      expect(validatePassword(undefined as any).valid).toBe(false);
    });

    it('property: should accept generated passwords that satisfy every strength rule', () => {
      const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const lowercase = 'abcdefghijklmnopqrstuvwxyz';
      const digits = '0123456789';
      const specials = '!@#$%^&*(),.?":{}|<>';

      for (let index = 0; index < 100; index += 1) {
        const password = [
          uppercase[index % uppercase.length],
          lowercase[index % lowercase.length],
          lowercase[(index + 7) % lowercase.length],
          lowercase[(index + 13) % lowercase.length],
          lowercase[(index + 19) % lowercase.length],
          digits[index % digits.length],
          digits[(index + 3) % digits.length],
          specials[index % specials.length],
        ].join('');

        expect(validatePassword(password).valid).toBe(true);
      }
    });

    it('property: should reject generated passwords missing any required strength rule', () => {
      const invalidPasswords = [
        ...Array.from({ length: 25 }, (_, index) => `Aa1!${index}`),
        ...Array.from({ length: 25 }, (_, index) => `password${index}!`),
        ...Array.from({ length: 25 }, (_, index) => `Password!${String.fromCharCode(97 + index)}`),
        ...Array.from({ length: 25 }, (_, index) => `Password${index}x`),
      ];

      invalidPasswords.forEach((password) => {
        expect(validatePassword(password).valid).toBe(false);
      });
    });
  });

  describe('email validation properties', () => {
    it('property: should accept generated addresses with one local part and a dotted domain', () => {
      const locals = ['student', 'user.name', 'user+tag', 'first_last', 'candidate123'];
      const domains = ['example.com', 'mail.example.org', 'placement-prep.dev'];

      for (const local of locals) {
        for (const domain of domains) {
          expect(validateEmail(`${local}@${domain}`)).toBe(true);
        }
      }
    });

    it('property: should reject generated malformed addresses', () => {
      const malformedAddresses = [
        ...Array.from({ length: 20 }, (_, index) => `missing-domain-${index}@`),
        ...Array.from({ length: 20 }, (_, index) => `missing-at-${index}.example.com`),
        ...Array.from({ length: 20 }, (_, index) => `double@@at-${index}.example.com`),
        ...Array.from({ length: 20 }, (_, index) => `space ${index}@example.com`),
        ...Array.from({ length: 20 }, (_, index) => `dots..${index}@example.com`),
      ];

      malformedAddresses.forEach((email) => {
        expect(validateEmail(email)).toBe(false);
      });
    });
  });

  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      expect(sanitizeString('  test  ')).toBe('test');
      expect(sanitizeString('\ttest\n')).toBe('test');
    });

    it('should remove HTML tags', () => {
      expect(sanitizeString('test<script>alert("xss")</script>')).toBe('testalert("xss")');
      expect(sanitizeString('<div>content</div>')).toBe('content');
      expect(sanitizeString('text>with<angle>brackets')).toBe('text>withbrackets');
    });

    it('should limit string length to 1000 characters', () => {
      const longString = 'a'.repeat(2000);
      const result = sanitizeString(longString);
      expect(result.length).toBe(1000);
    });

    it('should handle empty string', () => {
      expect(sanitizeString('')).toBe('');
    });

    it('should handle normal strings', () => {
      expect(sanitizeString('Normal Text')).toBe('Normal Text');
      expect(sanitizeString('Test User Name')).toBe('Test User Name');
    });
  });
});
