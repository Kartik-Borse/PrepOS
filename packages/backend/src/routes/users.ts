/**
 * User Routes
 * GET /api/users/me — current user profile
 * PUT /api/users/me — update profile
 * GET /api/users/leaderboard — top users
 */

import express, { Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { findUserById, updateUser, getUsersByCollege } from '../repositories/UserRepository.js';
import { query } from '../db/connection.js';

const router = express.Router();

// GET /api/users/me
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await findUserById(req.auth!.sub);
    if (!user) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
    }
    // Strip passwordHash before sending
    const { passwordHash: _ph, ...safeUser } = user as any;
    res.json({ user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch user' } });
  }
});

// PUT /api/users/me
router.put('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await updateUser(req.auth!.sub, req.body);
    if (!updated) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
    }
    const { passwordHash: _ph, ...safeUser } = updated as any;
    res.json({ user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to update user' } });
  }
});

// GET /api/users/leaderboard?college=&limit=
router.get('/leaderboard', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const college = req.query.college as string | undefined;
    const limit = parseInt((req.query.limit as string) || '50');

    let users;
    if (college) {
      users = await getUsersByCollege(college, limit);
    } else {
      const result = await query<any>(
        `SELECT id, full_name, college, total_xp, current_level, current_streak, avatar_url
         FROM users ORDER BY total_xp DESC LIMIT $1`,
        [limit]
      );
      users = result.rows;
    }

    // Strip sensitive fields
    const safeUsers = users.map(({ passwordHash: _ph, password_hash: _ph2, ...u }: any) => u);
    res.json({ users: safeUsers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch leaderboard' } });
  }
});

export default router;
