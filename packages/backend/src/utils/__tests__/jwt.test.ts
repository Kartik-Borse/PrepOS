/**
 * JWT utility tests.
 * Tests: Requirements 1.4, 1.5
 */

import { generateJwtToken, verifyJwtToken } from '../jwt.js';

describe('JWT utilities', () => {
  const originalJwtSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  afterEach(() => {
    if (originalJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = originalJwtSecret;
    }
    jest.useRealTimers();
  });

  it('should generate a token with the user identity in the payload', () => {
    const token = generateJwtToken({ id: 'user-123', email: 'test@example.com' });
    const payload = verifyJwtToken(token);

    expect(payload.sub).toBe('user-123');
    expect(payload.email).toBe('test@example.com');
  });

  it('should expire login tokens after 7 days by default', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-11T00:00:00.000Z'));

    const token = generateJwtToken({ id: 'user-123', email: 'test@example.com' });
    const payload = verifyJwtToken(token);

    expect(payload.exp - payload.iat).toBe(7 * 24 * 60 * 60);
  });

  it('should reject expired tokens', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-11T00:00:00.000Z'));
    const token = generateJwtToken({ id: 'user-123', email: 'test@example.com' }, 60);

    jest.setSystemTime(new Date('2026-06-11T00:01:01.000Z'));

    expect(() => verifyJwtToken(token)).toThrow('Token expired');
  });

  it('should reject tampered tokens', () => {
    const token = generateJwtToken({ id: 'user-123', email: 'test@example.com' });
    const [header, payload, signature] = token.split('.');
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const tamperedPayload = Buffer.from(
      JSON.stringify({ ...decodedPayload, email: 'admin@example.com' })
    ).toString('base64url');
    const tamperedToken = `${header}.${tamperedPayload}.${signature}`;

    expect(() => verifyJwtToken(tamperedToken)).toThrow();
  });
});
