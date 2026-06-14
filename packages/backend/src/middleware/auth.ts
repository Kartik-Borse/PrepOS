/**
 * JWT authentication middleware for protected API routes.
 */

import { NextFunction, Request, Response } from 'express';
import { verifyJwtToken, JwtPayload } from '../utils/jwt.js';

export interface AuthenticatedRequest extends Request {
  auth?: JwtPayload;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: 'Bearer token is required',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }

  try {
    req.auth = verifyJwtToken(authorization.slice('Bearer '.length));
    return next();
  } catch {
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Authentication token is invalid or expired',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
}
