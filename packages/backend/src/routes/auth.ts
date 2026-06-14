/**
 * Authentication Routes
 * Handles user registration and login endpoints
 */

import express, { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/authService.js';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user with email and password
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, college, graduationYear, timezone } = req.body;

    // Validate required fields
    if (!email || !password || !fullName) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields',
          details: {
            required: ['email', 'password', 'fullName'],
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
    }

    // Attempt registration
    const result = await registerUser(email, password, fullName, {
      college,
      graduationYear,
      timezone,
    });

    if (!result.success) {
      // Determine appropriate status code
      let statusCode = 400;
      if (result.error === 'EMAIL_EXISTS') {
        statusCode = 409; // Conflict
      } else if (result.error === 'WEAK_PASSWORD' || result.error === 'INVALID_EMAIL') {
        statusCode = 422; // Unprocessable Entity
      }

      return res.status(statusCode).json({
        error: {
          code: result.error,
          message: result.details?.[0] || 'Registration failed',
          details: result.details,
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
    }

    // Return success response (exclude password hash)
    const { passwordHash, ...userWithoutPassword } = result.user!;
    const token = (await import('../utils/jwt.js')).generateJwtToken(result.user!);
    
    return res.status(201).json({
      success: true,
      user: userWithoutPassword,
      token,
      message: 'User registered successfully',
    });
  } catch (error) {
    console.error('Registration endpoint error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred during registration',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields',
          details: {
            required: ['email', 'password'],
          },
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
    }

    // Attempt login
    const result = await loginUser(email, password);

    if (!result.success) {
      return res.status(401).json({
        error: {
          code: result.error,
          message: 'Invalid email or password',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
    }

    // Return success response (exclude password hash)
    const { passwordHash, ...userWithoutPassword } = result.user!;
    
    return res.status(200).json({
      success: true,
      user: userWithoutPassword,
      token: result.token,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login endpoint error:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred during login',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
});

/**
 * GET /api/auth/me
 * Verify the current JWT and return token identity claims.
 */
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  return res.status(200).json({
    success: true,
    user: {
      id: req.auth!.sub,
      email: req.auth!.email,
    },
  });
});

export default router;
