/**
 * Problem Repository
 * Handles all database operations for DSA problems and user progress
 */

import { query } from '../db/connection.js';

export interface Problem {
  id: number;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  patternId: number;
  patternName?: string;
  acceptanceRate?: number;
  companyTags: string[];
  description?: string;
}

export interface UserProblemProgress {
  userId: string;
  problemId: number;
  status: 'attempted' | 'solved' | 'bookmarked';
  selfRating?: number;
  nextReviewAt?: Date;
  solvedAt?: Date;
}

export async function getAllProblems(limit = 100, offset = 0): Promise<Problem[]> {
  const result = await query<any>(
    `SELECT p.*, dp.name as pattern_name
     FROM problems p
     LEFT JOIN dsa_patterns dp ON p.pattern_id = dp.id
     ORDER BY dp.display_order, p.id
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows.map(rowToProblem);
}

export async function getProblemsByPattern(patternId: number): Promise<Problem[]> {
  const result = await query<any>(
    `SELECT p.*, dp.name as pattern_name
     FROM problems p
     LEFT JOIN dsa_patterns dp ON p.pattern_id = dp.id
     WHERE p.pattern_id = $1
     ORDER BY p.difficulty, p.id`,
    [patternId]
  );
  return result.rows.map(rowToProblem);
}

export async function getProblemBySlug(slug: string): Promise<Problem | null> {
  const result = await query<any>(
    `SELECT p.*, dp.name as pattern_name
     FROM problems p
     LEFT JOIN dsa_patterns dp ON p.pattern_id = dp.id
     WHERE p.slug = $1`,
    [slug]
  );
  return result.rows.length > 0 ? rowToProblem(result.rows[0]) : null;
}

export async function getUserProgress(userId: string): Promise<UserProblemProgress[]> {
  const result = await query<any>(
    `SELECT * FROM user_problem_progress WHERE user_id = $1`,
    [userId]
  );
  return result.rows.map((r: any) => ({
    userId: r.user_id,
    problemId: r.problem_id,
    status: r.status,
    selfRating: r.confidence_level,
    nextReviewAt: r.next_revision_date,
    solvedAt: r.first_solved_at,
    isBookmarked: r.is_bookmarked,
  }));
}

export async function upsertUserProgress(
  userId: string,
  problemId: number,
  status: string,
  selfRating?: number
): Promise<void> {
  await query(
    `INSERT INTO user_problem_progress (user_id, problem_id, status, confidence_level, first_solved_at, last_attempted_at, attempts)
     VALUES ($1, $2, $3, $4, NOW(), NOW(), 1)
     ON CONFLICT (user_id, problem_id)
     DO UPDATE SET
       status = $3,
       confidence_level = COALESCE($4, user_problem_progress.confidence_level),
       last_attempted_at = NOW(),
       attempts = user_problem_progress.attempts + 1`,
    [userId, problemId, status, selfRating ?? null]
  );
}

export async function getPatterns(): Promise<any[]> {
  const result = await query<any>(
    `SELECT dp.*, COUNT(p.id) as problem_count
     FROM dsa_patterns dp
     LEFT JOIN problems p ON p.pattern_id = dp.id
     GROUP BY dp.id
     ORDER BY dp.display_order`,
    []
  );
  return result.rows;
}

function rowToProblem(row: any): Problem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    difficulty: row.difficulty,
    patternId: row.pattern_id,
    patternName: row.pattern_name,
    acceptanceRate: row.acceptance_rate ? parseFloat(row.acceptance_rate) : undefined,
    companyTags: row.company_tags ?? [],
    description: row.description,
  };
}
