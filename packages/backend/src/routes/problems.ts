/**
 * Problems Routes
 * GET /api/problems, GET /api/problems/:slug
 * GET /api/patterns
 * GET/POST /api/progress
 */

import express, { Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import {
  getAllProblems,
  getProblemsByPattern,
  getProblemBySlug,
  getPatterns,
  getUserProgress,
  upsertUserProgress,
} from '../repositories/ProblemRepository.js';

const router = express.Router();

// GET /api/patterns — list all DSA patterns with problem counts
router.get('/patterns', async (_req, res: Response) => {
  try {
    const patterns = await getPatterns();
    res.json({ patterns });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch patterns' } });
  }
});

// GET /api/problems?patternId=&limit=&offset=
router.get('/', async (req, res: Response) => {
  try {
    const patternId = req.query.patternId ? parseInt(req.query.patternId as string) : undefined;
    const limit = parseInt((req.query.limit as string) || '100');
    const offset = parseInt((req.query.offset as string) || '0');

    const problems = patternId
      ? await getProblemsByPattern(patternId)
      : await getAllProblems(limit, offset);

    res.json({ problems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch problems' } });
  }
});

// GET /api/problems/:slug
router.get('/:slug', async (req, res: Response) => {
  try {
    const problem = await getProblemBySlug(req.params.slug);
    if (!problem) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Problem not found' } });
    }
    res.json({ problem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch problem' } });
  }
});

// GET /api/progress — get current user's problem progress (auth required)
router.get('/user/progress', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.auth!.sub;
    const progress = await getUserProgress(userId);
    res.json({ progress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch progress' } });
  }
});

// POST /api/progress — mark problem as solved/attempted/bookmarked
router.post('/user/progress', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.auth!.sub;
    const { problemId, status, selfRating } = req.body;

    if (!problemId || !status) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'problemId and status required' } });
    }

    await upsertUserProgress(userId, problemId, status, selfRating);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to update progress' } });
  }
});

export default router;
