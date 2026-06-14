/**
 * Minimal JWT helpers using HS256.
 * Validates: Requirements 1.4, 1.5
 */

import crypto from 'crypto';

const DEFAULT_EXPIRES_IN_SECONDS = 7 * 24 * 60 * 60;

export interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

function base64UrlEncode(value: string | Buffer): string {
  return Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(value: string): Buffer {
  const padded = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), '=');
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

function getJwtSecret(): string {
  return process.env.JWT_SECRET || 'development-only-jwt-secret-change-me';
}

function signTokenSegment(unsignedToken: string): string {
  return base64UrlEncode(
    crypto.createHmac('sha256', getJwtSecret()).update(unsignedToken).digest()
  );
}

export function generateJwtToken(
  user: { id: string; email: string },
  expiresInSeconds = DEFAULT_EXPIRES_IN_SECONDS
): string {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const unsignedToken = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(
    JSON.stringify(payload)
  )}`;
  return `${unsignedToken}.${signTokenSegment(unsignedToken)}`;
}

export function verifyJwtToken(token: string): JwtPayload {
  const [encodedHeader, encodedPayload, signature] = token.split('.');
  if (!encodedHeader || !encodedPayload || !signature) {
    throw new Error('Invalid token format');
  }

  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = signTokenSegment(unsignedToken);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    throw new Error('Invalid token signature');
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload).toString('utf8')) as JwtPayload;
  if (!payload.sub || !payload.email || !payload.exp) {
    throw new Error('Invalid token payload');
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) {
    throw new Error('Token expired');
  }

  return payload;
}
