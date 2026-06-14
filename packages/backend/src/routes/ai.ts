/**
 * AI Routes (Gemini-powered)
 * POST /api/ai/interview/chat   — AI interview coach
 * POST /api/ai/study-plan       — generate personalised study plan
 * POST /api/ai/hint             — get a hint for a problem
 * POST /api/ai/review           — code review / feedback
 * POST /api/ai/explain          — explain a DSA concept
 */

import express, { Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { geminiChat, geminiGenerate } from '../services/geminiService.js';

const router = express.Router();

// ── Interview Chat ──────────────────────────────────────────────────────────
// POST /api/ai/interview/chat
// body: { mode: 'coding'|'behavioral'|'system', history: [{role, text}], message }
router.post('/interview/chat', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { mode = 'coding', history = [], message } = req.body;
  if (!message) return res.status(400).json({ error: { message: 'message is required' } });

  const systemPrompts: Record<string, string> = {
    coding: `You are an expert technical interviewer at a top tech company (Google/Amazon level).
Conduct a realistic coding interview. Ask DSA problems (arrays, trees, graphs, DP, etc).
- Start with an easy warm-up, then increase difficulty.
- Ask the candidate to explain their approach before coding.
- Probe time/space complexity after each answer.
- Give hints only when the candidate is stuck for a while.
- Be encouraging but rigorous. Give concise, focused responses.
- When candidate gives a solution, evaluate it and ask follow-up questions.`,

    behavioral: `You are a senior engineering manager conducting a behavioral interview.
Use the STAR method (Situation, Task, Action, Result) framework.
- Ask one question at a time from: teamwork, conflict resolution, leadership, failure, achievement.
- After each answer, probe deeper with follow-up questions.
- Give constructive feedback on the answer structure.
- Be warm but professional. Keep responses under 150 words.`,

    system: `You are a principal engineer conducting a system design interview.
- Present a realistic system design problem (URL shortener, Instagram, WhatsApp, etc).
- Guide the candidate through: requirements, capacity estimation, high-level design, deep dive.
- Ask about trade-offs, bottlenecks, and scaling.
- Be specific about which components to focus on.
- Give hints when the candidate is stuck. Keep responses focused and concise.`,
  };

  try {
    const reply = await geminiChat(
      systemPrompts[mode] ?? systemPrompts.coding,
      history,
      message
    );
    res.json({ reply });
  } catch (err: any) {
    console.error('Gemini interview error:', err);
    res.status(500).json({ error: { message: err.message || 'AI service error' } });
  }
});

// ── Study Plan Generator ────────────────────────────────────────────────────
// POST /api/ai/study-plan
// body: { targetDate, hoursPerDay, skillLevel, targetCompanies, weakPatterns }
router.post('/study-plan', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { targetDate, hoursPerDay = 2, skillLevel = 'intermediate', targetCompanies = [], weakPatterns = [] } = req.body;

  const daysLeft = targetDate
    ? Math.max(1, Math.ceil((new Date(targetDate).getTime() - Date.now()) / 86400000))
    : 30;

  const prompt = `You are an expert placement preparation coach. Generate a structured ${daysLeft}-day study plan for a student preparing for software engineering interviews.

Student Profile:
- Skill Level: ${skillLevel}
- Available Hours/Day: ${hoursPerDay}
- Target Companies: ${targetCompanies.length ? targetCompanies.join(', ') : 'General SDE roles (Amazon, Google, Microsoft)'}
- Weak Areas: ${weakPatterns.length ? weakPatterns.join(', ') : 'To be assessed'}
- Days until interview: ${daysLeft}

Return a JSON object with this exact structure:
{
  "overview": "2-sentence summary of the plan",
  "phases": [
    {
      "name": "Phase name",
      "days": "Day 1-10",
      "focus": "Main focus area",
      "dailyTasks": ["task1", "task2", "task3"]
    }
  ],
  "weeklySchedule": {
    "monday": ["task1", "task2"],
    "tuesday": ["task1", "task2"],
    "wednesday": ["task1", "task2"],
    "thursday": ["task1", "task2"],
    "friday": ["task1", "task2"],
    "saturday": ["task1", "task2"],
    "sunday": ["task1", "task2"]
  },
  "topPatterns": ["pattern1", "pattern2", "pattern3", "pattern4", "pattern5"],
  "milestones": [
    { "day": 7, "goal": "Complete arrays & strings" },
    { "day": 14, "goal": "Master trees & graphs" },
    { "day": ${daysLeft}, "goal": "Mock interview ready" }
  ],
  "tips": ["tip1", "tip2", "tip3"]
}

Return ONLY valid JSON, no markdown code blocks.`;

  try {
    const raw = await geminiGenerate(prompt);
    // Strip markdown fences if present
    const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const plan = JSON.parse(jsonStr);
    res.json({ plan, daysLeft });
  } catch (err: any) {
    console.error('Study plan error:', err);
    res.status(500).json({ error: { message: err.message || 'Failed to generate study plan' } });
  }
});

// ── Problem Hint ────────────────────────────────────────────────────────────
// POST /api/ai/hint
// body: { problemTitle, description, hintLevel: 1|2|3, userCode? }
router.post('/hint', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { problemTitle, description, hintLevel = 1, userCode } = req.body;
  if (!problemTitle) return res.status(400).json({ error: { message: 'problemTitle is required' } });

  const levelInstructions = [
    'Give a very gentle nudge — point to the general technique/pattern without revealing the approach. 1-2 sentences.',
    'Give a medium hint — describe the general approach and data structure to use, but not the algorithm steps. 2-3 sentences.',
    'Give a detailed hint — explain the algorithm approach step by step, but do NOT write the code. 3-5 sentences.',
  ];

  const prompt = `You are helping a student solve a coding problem. Problem: "${problemTitle}"
${description ? `Description: ${description.slice(0, 500)}` : ''}
${userCode ? `Student's current code:\n${userCode.slice(0, 500)}` : ''}

${levelInstructions[(hintLevel - 1) % 3]}
Be encouraging. Do not give the full solution.`;

  try {
    const hint = await geminiGenerate(prompt);
    res.json({ hint });
  } catch (err: any) {
    res.status(500).json({ error: { message: err.message || 'Failed to generate hint' } });
  }
});

// ── Code Review ─────────────────────────────────────────────────────────────
// POST /api/ai/review
// body: { problemTitle, code, language, passed }
router.post('/review', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { problemTitle, code, language = 'python', passed = false } = req.body;
  if (!code) return res.status(400).json({ error: { message: 'code is required' } });

  const prompt = `Review this ${language} solution for "${problemTitle || 'a coding problem'}".
The solution ${passed ? 'passed all test cases' : 'has some failing test cases'}.

Code:
\`\`\`${language}
${code.slice(0, 2000)}
\`\`\`

Provide a concise code review covering:
1. **Correctness** – any bugs or edge cases missed
2. **Time & Space Complexity** – Big-O analysis
3. **Code Quality** – readability, naming, structure
4. **Optimization** – how to improve if not optimal

Keep the total response under 300 words. Use markdown formatting.`;

  try {
    const review = await geminiGenerate(prompt);
    res.json({ review });
  } catch (err: any) {
    res.status(500).json({ error: { message: err.message || 'Failed to generate review' } });
  }
});

// ── Concept Explainer ────────────────────────────────────────────────────────
// POST /api/ai/explain
// body: { concept, context? }
router.post('/explain', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { concept, context } = req.body;
  if (!concept) return res.status(400).json({ error: { message: 'concept is required' } });

  const prompt = `Explain "${concept}" for a student preparing for software engineering interviews${context ? ` in the context of: ${context}` : ''}.

Structure your explanation as:
1. **What it is** (1-2 sentences, plain language)
2. **How it works** (key steps or properties)
3. **When to use it** (problem patterns that hint at this concept)
4. **Example** (small concrete example with values)
5. **Interview tip** (1 sentence on what interviewers look for)

Keep it concise and practical. Use markdown formatting.`;

  try {
    const explanation = await geminiGenerate(prompt);
    res.json({ explanation });
  } catch (err: any) {
    res.status(500).json({ error: { message: err.message || 'Failed to generate explanation' } });
  }
});

// ── Cheatsheet Generator ─────────────────────────────────────────────────────
// POST /api/ai/cheatsheet
// body: { topic, type: 'code'|'concepts'|'formulas'|'revision', language? }
router.post('/cheatsheet', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { topic, type = 'concepts', language = 'python' } = req.body;
  if (!topic) return res.status(400).json({ error: { message: 'topic is required' } });

  const typeInstructions: Record<string, string> = {
    code: `Generate a coding cheatsheet for "${topic}" in ${language}.
Return JSON: { "title": string, "tag": string, "color": string (hex), "sections": [ { "heading": string, "lines": string[] } ] }
Include: template code, key patterns, common tricks. Max 4 sections, 6 lines each.`,

    concepts: `Generate a concepts cheatsheet for "${topic}" for software engineering interviews.
Return JSON: { "title": string, "tag": string, "color": string (hex), "sections": [ { "heading": string, "lines": string[] } ] }
Include: key definitions, properties, when-to-use signals, interview tips. Max 4 sections, 6 lines each.`,

    formulas: `Generate a formulas/shortcuts cheatsheet for "${topic}" (aptitude/math focus).
Return JSON: { "title": string, "tag": string, "color": string (hex), "sections": [ { "heading": string, "lines": string[] } ] }
Include: formulas, shortcuts, tricks, examples. Max 4 sections, 6 lines each.`,

    revision: `Generate a quick revision card for "${topic}" — the most important 80/20 things to remember.
Return JSON: { "title": string, "tag": string, "color": string (hex), "sections": [ { "heading": string, "lines": string[] } ] }
Include: must-know facts, common mistakes to avoid, interview gotchas. Max 4 sections, 6 lines each.`,
  };

  const prompt = `${typeInstructions[type] || typeInstructions.concepts}
Return ONLY valid JSON, no markdown code blocks, no extra text.`;

  try {
    const raw = await geminiGenerate(prompt);
    const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const cheatsheet = JSON.parse(jsonStr);
    res.json({ cheatsheet });
  } catch (err: any) {
    console.error('Cheatsheet gen error:', err);
    res.status(500).json({ error: { message: err.message || 'Failed to generate cheatsheet' } });
  }
});

export default router;
