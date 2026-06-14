/**
 * Authentication Service
 * Handles user registration, login, and password management
 * Validates: Requirements 1.1, 1.3, 1.6
 */

import bcrypt from 'bcrypt';
import { createUser, findUserByEmail, isEmailRegistered } from '../repositories/UserRepository.js';
import { validateEmail, validatePassword, sanitizeString } from '../utils/validation.js';
import { User } from '../models/User.js';
import { generateJwtToken } from '../utils/jwt.js';

const BCRYPT_SALT_ROUNDS = 12; // As per Requirements 1.6

/**
 * Register a new user with email and password
 * Validates: Requirements 1.1, 1.3, 1.6
 */
export async function registerUser(
  email: string,
  password: string,
  fullName: string,
  options?: {
    college?: string;
    graduationYear?: number;
    timezone?: string;
  }
): Promise<{ success: boolean; user?: User; error?: string; details?: string[] }> {
  // Validate email format
  if (!validateEmail(email)) {
    return {
      success: false,
      error: 'INVALID_EMAIL',
      details: ['Email format is invalid'],
    };
  }

  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return {
      success: false,
      error: 'WEAK_PASSWORD',
      details: passwordValidation.errors,
    };
  }

  // Check if email is already registered
  const emailExists = await isEmailRegistered(email.toLowerCase());
  if (emailExists) {
    return {
      success: false,
      error: 'EMAIL_EXISTS',
      details: ['An account with this email already exists'],
    };
  }

  // Sanitize full name
  const sanitizedFullName = sanitizeString(fullName);
  if (!sanitizedFullName || sanitizedFullName.length < 1) {
    return {
      success: false,
      error: 'INVALID_NAME',
      details: ['Full name is required'],
    };
  }

  try {
    // Hash password with bcrypt (12 salt rounds as per Requirements 1.6)
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // Create user in database
    const user = await createUser({
      email: email.toLowerCase(),
      passwordHash,
      fullName: sanitizedFullName,
      college: options?.college,
      graduationYear: options?.graduationYear,
      timezone: options?.timezone || 'UTC',
    });

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: 'REGISTRATION_FAILED',
      details: ['Failed to create user account'],
    };
  }
}

/**
 * Verify password against stored hash
 */
export async function verifyPassword(
  plainPassword: string,
  passwordHash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, passwordHash);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Login user with email and password
 * Returns user if credentials are valid, null otherwise
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
  // Validate email format
  if (!validateEmail(email)) {
    return {
      success: false,
      error: 'INVALID_CREDENTIALS',
    };
  }

  try {
    // Find user by email
    const user = await findUserByEmail(email.toLowerCase());
    
    if (!user || !user.passwordHash) {
      return {
        success: false,
        error: 'INVALID_CREDENTIALS',
      };
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    
    if (!isPasswordValid) {
      return {
        success: false,
        error: 'INVALID_CREDENTIALS',
      };
    }

    return {
      success: true,
      user,
      token: generateJwtToken(user),
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'LOGIN_FAILED',
    };
  }
}
