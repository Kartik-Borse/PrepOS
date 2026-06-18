/**
 * LeetCode Proxy Route
 * Fetches problem data from LeetCode's public GraphQL API by slug
 * POST /api/leetcode/fetch  { url: "https://leetcode.com/problems/two-sum/" }
 */

import express, { Request, Response } from 'express';
import { query } from '../db/connection.js';

const router = express.Router();

const LC_GRAPHQL = 'https://leetcode.com/graphql';

const PROBLEM_QUERY = `
query getProblem($titleSlug: String!) {
  question(titleSlug: $titleSlug) {
    questionId
    title
    titleSlug
    difficulty
    content
    exampleTestcases
    topicTags { name }
    stats
    hints
    sampleTestCase
    metaData
    companyTagStats
    codeSnippets {
      lang
      langSlug
      code
    }
  }
}`;

function slugFromUrl(url: string): string | null {
  // handles: https://leetcode.com/problems/two-sum/
  //          https://leetcode.com/problems/two-sum/description/
  const match = url.match(/leetcode\.com\/problems\/([^/]+)/);
  return match ? match[1] : null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<pre>([\s\S]*?)<\/pre>/gi, '\n$1\n')
    .replace(/<strong[^>]*>/gi, '**').replace(/<\/strong>/gi, '**')
    .replace(/<em>/gi, '_').replace(/<\/em>/gi, '_')
    .replace(/<code>(.*?)<\/code>/gi, '`$1`')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// POST /api/leetcode/fetch
router.post('/fetch', async (req: Request, res: Response) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: { code: 'MISSING_URL', message: 'url is required' } });
  }

  const slug = slugFromUrl(url);
  if (!slug) {
    return res.status(400).json({ error: { code: 'INVALID_URL', message: 'Could not extract problem slug from URL' } });
  }

  try {
    const lcRes = await fetch(LC_GRAPHQL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0',
      },
      body: JSON.stringify({ query: PROBLEM_QUERY, variables: { titleSlug: slug } }),
    });

    if (!lcRes.ok) {
      return res.status(502).json({ error: { code: 'LC_FETCH_FAILED', message: `LeetCode returned ${lcRes.status}` } });
    }

    let data: any;
    try {
      data = await lcRes.json();
    } catch (err) {
      return res.status(502).json({ error: { code: 'LC_PARSE_FAILED', message: 'LeetCode returned an invalid JSON response' } });
    }
    const q = data?.data?.question;

    if (!q) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Problem not found on LeetCode' } });
    }

    // Parse stats JSON
    let stats: any = {};
    try { stats = JSON.parse(q.stats); } catch { /* ignore */ }

    // Parse company tags
    let companies: string[] = [];
    try {
      const ct = JSON.parse(q.companyTagStats || '{}');
      companies = Object.values(ct).flat().map((c: any) => c.name).slice(0, 8);
    } catch { /* ignore */ }

    // Parse function signature metadata
    let metaData: any = {};
    try {
      if (q.metaData) {
        metaData = JSON.parse(q.metaData);
      }
    } catch { /* ignore */ }
    
    // Attach codeSnippets to metaData
    if (q.codeSnippets) {
      metaData.codeSnippets = q.codeSnippets;
    }

    const problem = {
      title: q.title,
      slug: q.titleSlug,
      difficulty: q.difficulty,
      description: stripHtml(q.content || ''),
      descriptionHtml: q.content || '',
      acceptance: stats.acRate ? parseFloat(stats.acRate) : null,
      companyTags: companies,
      topicTags: (q.topicTags || []).map((t: any) => t.name),
      hints: q.hints || [],
      exampleTestcases: q.exampleTestcases || '',
      metaData: metaData,
      leetcodeId: parseInt(q.questionId, 10),
      leetcodeUrl: `https://leetcode.com/problems/${slug}/`,
    };

    // Optionally save to our DB (upsert by slug into problems table)
    // Try to match a pattern from topic tags
    const patternRow = await query<any>(
      `SELECT id FROM dsa_patterns WHERE name ILIKE ANY($1::text[]) LIMIT 1`,
      [problem.topicTags.map((t: string) => `%${t}%`)]
    );
    const patternId = patternRow.rows[0]?.id ?? null;

    await query(
      `INSERT INTO problems (title, slug, description, difficulty, pattern_id, acceptance_rate, company_tags, meta_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (slug) DO UPDATE SET
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         difficulty = EXCLUDED.difficulty,
         acceptance_rate = EXCLUDED.acceptance_rate,
         company_tags = EXCLUDED.company_tags,
         meta_data = EXCLUDED.meta_data`,
      [
        problem.title,
        problem.slug,
        problem.description,
        problem.difficulty,
        patternId,
        problem.acceptance,
        problem.companyTags,
        problem.metaData,
      ]
    );

    res.json({ problem });
  } catch (err: any) {
    console.error('LeetCode fetch error:', err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message || 'Failed to fetch from LeetCode' } });
  }
});

// GET /api/leetcode/slug/:slug — check if we already have it
router.get('/slug/:slug', async (req: Request, res: Response) => {
  try {
    const result = await query<any>(
      `SELECT p.*, dp.name as pattern_name FROM problems p
       LEFT JOIN dsa_patterns dp ON p.pattern_id = dp.id
       WHERE p.slug = $1`,
      [req.params.slug]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Not in local DB' } });
    }
    res.json({ problem: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'DB error' } });
  }
});

export default router;
