import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Play, Send, ChevronDown, Star, Lightbulb, Maximize2,
  CheckCircle2, XCircle, Clock,
  ChevronLeft, ChevronRight as ChevronR
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import DSAVisualizer from '../components/DSAVisualizer';
import './ProblemDetail.css';

// ── Starter templates ────────────────────────────────────────────────────────
const STARTER: Record<string, Record<string, string>> = {
  'longest-substring': {
    python: `class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        # Your solution here\n        pass`,
    javascript: `var lengthOfLongestSubstring = function(s) {\n    // Your solution here\n};\n`,
    cpp: `class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Your solution here\n    }\n};\n`,
    java: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Your solution here\n    }\n}\n`,
  },
};

const DEFAULT_STARTER = (lang: string) =>
  ({ python: `# Write your solution here\ndef solution():\n    pass`, javascript: `// Write your solution here\nfunction solution() {\n\n}`, cpp: `// Write your solution here\n#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    return 0;\n}`, java: `// Write your solution here\nclass Solution {\n    public static void main(String[] args) {\n    }\n}` }[lang] ?? '');

// ── Real JDoodle execution engine ────────────────────────────────────────────
interface TestResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  runtimeMs: number;
  memoryKB: number;
  error?: string;
  steps?: string[];
}

const LANG_MAP: Record<string, { language: string; versionIndex: string }> = {
  python:     { language: 'python3',   versionIndex: '3' },
  javascript: { language: 'nodejs',    versionIndex: '4' },
  java:       { language: 'java',      versionIndex: '4' },
  cpp:        { language: 'cpp17',     versionIndex: '1' },
};

async function runCodeReal(
  code: string,
  lang: string,
  testCases: { input: string; expected: string }[]
): Promise<TestResult[]> {
  const { language, versionIndex } = LANG_MAP[lang] ?? LANG_MAP['javascript'];
  const results: TestResult[] = [];

  for (const tc of testCases) {
    const start = Date.now();
    try {
      const resp = await fetch('/api/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: code, language, versionIndex, stdin: tc.input }),
      });
      const data = await resp.json();
      const runtimeMs = Date.now() - start;
      const actual = (data.output ?? '').trim();
      const expected = tc.expected.trim();
      const passed = actual === expected;
      results.push({
        passed,
        input: tc.input,
        expected,
        actual: data.error ? `Error: ${data.error}` : actual,
        runtimeMs,
        memoryKB: parseInt(data.memory ?? '0', 10),
        error: data.error,
        steps: [`Output: ${actual}`, `Expected: ${expected}`, passed ? '✓ Match' : '✗ Mismatch'],
      });
    } catch (e: any) {
      results.push({
        passed: false,
        input: tc.input,
        expected: tc.expected,
        actual: '',
        runtimeMs: Date.now() - start,
        memoryKB: 0,
        error: e.message,
        steps: [`Error: ${e.message}`],
      });
    }
  }
  return results;
}

// ── Hints ────────────────────────────────────────────────────────────────────
const HINTS = [
  '💡 Which data structure lets you check for duplicate characters in O(1)?',
  '🪟 Think about maintaining a "window" of unique characters with two pointers.',
  '🗺️ Use a HashMap to store the last index of each character. When you see a duplicate at index j, move left pointer to max(left, lastSeen[char] + 1).',
];

// ── Problem data ─────────────────────────────────────────────────────────────
const SAMPLE_PROBLEM = {
  id: 'longest-substring',
  title: 'Longest Substring Without Repeating Characters',
  number: 3,
  difficulty: 'Medium' as const,
  pattern: 'Sliding Window',
  acceptance: 34,
  companies: ['Amazon', 'Microsoft', 'Adobe', 'Google', 'Facebook'],
  description: `Given a string **s**, find the length of the **longest substring** without repeating characters.`,
  examples: [
    { input: 's = "abcabcbb"', output: '3', explanation: '"abc" has length 3.' },
    { input: 's = "bbbbb"', output: '1', explanation: '"b" has length 1.' },
    { input: 's = "pwwkew"', output: '3', explanation: '"wke" has length 3.' },
  ],
  constraints: ['0 ≤ s.length ≤ 5 × 10⁴', 's consists of English letters, digits, symbols and spaces.'],
  testCases: [
    { input: '"abcabcbb"', expected: '3' },
    { input: '"bbbbb"', expected: '1' },
    { input: '"pwwkew"', expected: '3' },
    { input: '""', expected: '0' },
    { input: '" "', expected: '1' },
  ],
  leetcodeLink: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
};

type Lang = 'python' | 'javascript' | 'cpp' | 'java';
type LeftPanel = 'description' | 'approach' | 'hints' | 'notes' | 'history' | 'visual' | 'analysis';
type RightPanel = 'testcases' | 'result' | 'steps';

// ── Approaches: Brute Force → Optimal ────────────────────────────────────────
const APPROACHES = [
  {
    label: 'Brute Force',
    badge: 'O(n²) · O(n)',
    badgeColor: '#ef4444',
    explain: 'Check every possible substring by using two nested loops. For each starting index i, extend j to the right and stop when a repeat character is found.',
    steps: [
      'Outer loop: i from 0 to n-1',
      'Inner loop: j from i, track chars in a set',
      'If s[j] already in set → stop, record length',
      'Update max length seen so far',
    ],
    code: `def brute_force(s):
    max_len = 0
    for i in range(len(s)):
        seen = set()
        for j in range(i, len(s)):
            if s[j] in seen:
                break
            seen.add(s[j])
            max_len = max(max_len, j - i + 1)
    return max_len
# Time: O(n²)  Space: O(n)`,
    interviewTip: 'Always start here in an interview. Say: "A brute force approach would be to check every substring — O(n²). Can we do better?"',
  },
  {
    label: 'Sliding Window',
    badge: 'O(n) · O(n)',
    badgeColor: '#f59e0b',
    explain: 'Use two pointers (left, right) forming a window. Expand right, shrink left when a duplicate is found. Use a HashMap to O(1) check.',
    steps: [
      'left = 0, max_len = 0, seen = {}',
      'For each right pointer:',
      '  If s[right] in seen and seen[s[right]] >= left → left = seen[s[right]] + 1',
      '  seen[s[right]] = right',
      '  max_len = max(max_len, right - left + 1)',
    ],
    code: `def sliding_window(s):
    seen = {}
    left = max_len = 0
    for right, ch in enumerate(s):
        if ch in seen and seen[ch] >= left:
            left = seen[ch] + 1
        seen[ch] = right
        max_len = max(max_len, right - left + 1)
    return max_len
# Time: O(n)  Space: O(min(n, charset))`,
    interviewTip: 'This is the optimal solution. Key insight: instead of shrinking one step at a time, jump left directly to lastSeen[char]+1.',
  },
];


export default function ProblemDetail() {
  const { id = 'longest-substring' } = useParams();
  const problem = useAppStore(s => {
    const builtin = s.customProblems.find(p => p.id === id);
    if (builtin) return builtin;
    // fallback to built-in problems list (exported elsewhere)
    return s.customProblems.find(p => p.id === id) || null;
  }) || {
    // default placeholder if not found
    id: SAMPLE_PROBLEM.id,
    title: SAMPLE_PROBLEM.title,
    description: SAMPLE_PROBLEM.description,
    testCases: SAMPLE_PROBLEM.testCases,
    patternId: SAMPLE_PROBLEM.pattern,
  };
  const [lang, setLang] = useState<Lang>('java');
  const [code, setCode] = useState(STARTER[problem.id]?.[lang] ?? DEFAULT_STARTER(lang));
  const [leftPanel, setLeftPanel] = useState<LeftPanel>('description');
  const [rightPanel, setRightPanel] = useState<RightPanel>('testcases');
  const [hintLevel, setHintLevel] = useState(0);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [timerOn, setTimerOn] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [selectedTest, setSelectedTest] = useState(0);
  const [selectedStep, setSelectedStep] = useState(0);
  const [revisionDate, setRevisionDate] = useState('');
  const [noteText, setNoteText] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const { setProblemNote, problemNotes, addAttempt, updateAttempt, attempts, markSolved, solvedProblems } = useAppStore();
  const { user, updateUser } = useAuthStore();

  const existingNote = problemNotes.find((n) => n.problemId === id);
  const myAttempts = attempts.filter((a) => a.problemId === id);
  const solved = solvedProblems[id];

  useEffect(() => {
    if (existingNote) setNoteText(existingNote.content);
  }, [id]);

  useEffect(() => {
    if (timerOn) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerOn]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleLangChange = (l: Lang) => {
    setLang(l);
    setCode(STARTER[id]?.[l] ?? DEFAULT_STARTER(l));
  };

  const handleRun = useCallback(async () => {
    setRunning(true);
    setRightPanel('result');
    try {
      const res = await runCodeReal(code, lang, problem.testCases);
      setResults(res);
    } finally {
      setRunning(false);
    }
  }, [code, lang, problem.testCases]);

  const handleSubmit = useCallback(async () => {
    setRunning(true);
    setRightPanel('result');
    try {
      const res = await runCodeReal(code, lang, problem.testCases);
      setResults(res);
      const allPass = res.every((r) => r.passed);
      addAttempt({
        id: crypto.randomUUID(),
        problemId: id,
        problemTitle: problem.title,
        patternId: problem.patternId,
        code,
        language: lang,
        status: allPass ? 'Accepted' : 'Wrong Answer',
        timeMs: res[0]?.runtimeMs ?? 0,
        timeTaken: elapsed,
        hintsUsed: hintLevel,
        date: new Date().toISOString(),
      });
      if (allPass) {
        if (!solvedProblems[id]) {
          updateUser({ currentStreak: (user?.currentStreak || 0) + 1 });
        }
        markSolved(id, 'solved', revisionDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString());
      }
    } finally {
      setRunning(false);
    }
  }, [code, lang, elapsed, id, hintLevel, addAttempt, markSolved, revisionDate, solvedProblems, user, updateUser, problem.testCases]);

  const saveNote = () => {
    setProblemNote(id, noteText);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 1500);
  };

  const allPassed = results?.every((r) => r.passed);
  const passedCount = results?.filter((r) => r.passed).length ?? 0;

  return (
    <div className="pd-page">
      {/* ── Topbar ── */}
      <div className="pd-topbar">
        <div className="pd-breadcrumb">
          <Link to="/dsa" className="pd-back">← Problems</Link>
          <span>/</span>
          <span className="pd-crumb">{SAMPLE_PROBLEM.number}. {SAMPLE_PROBLEM.title}</span>
        </div>
        <div className="pd-topbar-center">
          <button
            className={`timer-btn ${timerOn ? 'running' : ''}`}
            onClick={() => setTimerOn(!timerOn)}
            aria-label="Toggle timer"
          >
            <Clock size={13} />
            <span>{formatTime(elapsed)}</span>
            {timerOn ? ' ■' : ' ▶'}
          </button>
        </div>
        <div className="pd-topbar-right">
          <a href={SAMPLE_PROBLEM.leetcodeLink} target="_blank" rel="noreferrer" className="lc-link" title="View on LeetCode">
            <span>LC</span>
          </a>
          <button className={`pd-icon-btn ${bookmarked ? 'active' : ''}`} onClick={() => setBookmarked(!bookmarked)} aria-label="Bookmark">
            <Star size={15} fill={bookmarked ? 'var(--primary)' : 'none'} />
          </button>
          <button className="pd-icon-btn" aria-label="Full screen"><Maximize2 size={15} /></button>
        </div>
      </div>

      <div className="pd-layout">
        {/* ── LEFT PANE ── */}
        <div className="pd-left">
          <div className="pd-tabs">
            {([
              ['description', 'Problem'],
              ['approach', '🔀 Approaches'],
              ['hints', 'Hints'],
              ['visual', 'Visualize'],
              ['notes', 'My Notes'],
              ['history', 'History'],
              ['analysis', 'TC/SC'],
            ] as [LeftPanel, string][]).map(([key, label]) => (
              <button key={key} className={`pd-tab ${leftPanel === key ? 'active' : ''}`} onClick={() => setLeftPanel(key)}>
                {label}
                {key === 'notes' && existingNote?.content && <span className="tab-dot" />}
                {key === 'history' && myAttempts.length > 0 && <span className="tab-badge">{myAttempts.length}</span>}
              </button>
            ))}
          </div>

          <div className="pd-left-body">
            {/* Description */}
            {leftPanel === 'description' && (
              <div className="pd-description">
                <div className="pd-problem-header">
                  <h1>{SAMPLE_PROBLEM.number}. {SAMPLE_PROBLEM.title}</h1>
                  <div className="pd-meta">
                    <span className={`diff-badge ${SAMPLE_PROBLEM.difficulty.toLowerCase()}`}>{SAMPLE_PROBLEM.difficulty}</span>
                    <span className="acceptance">Acceptance: {SAMPLE_PROBLEM.acceptance}%</span>
                    <span className="pattern-tag">{SAMPLE_PROBLEM.pattern}</span>
                    {solved && <span className="solved-badge">✓ Solved</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                     <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Next Revision:</span>
                     <input type="date" value={revisionDate || (solvedProblems[id]?.nextRevisionAt ? new Date(solvedProblems[id].nextRevisionAt).toISOString().split('T')[0] : '')} onChange={(e) => setRevisionDate(e.target.value)} style={{ padding: '6px', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px', fontSize: 12 }} />
                     <button onClick={() => markSolved(id, solvedProblems[id]?.status || 'unsolved', revisionDate)} style={{ padding: '6px 10px', background: 'var(--primary)', border: 'none', color: '#000', borderRadius: '4px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Set Date</button>
                  </div>
                </div>
                <div className="pd-companies">
                  {SAMPLE_PROBLEM.companies.map((c) => <span key={c} className="company-chip">{c}</span>)}
                </div>
                <div className="pd-body-text">
                  <p dangerouslySetInnerHTML={{ __html: SAMPLE_PROBLEM.description.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  {SAMPLE_PROBLEM.examples.map((ex, i) => (
                    <div key={i} className="pd-example">
                      <div className="example-label">Example {i + 1}:</div>
                      <pre>{`Input: ${ex.input}\nOutput: ${ex.output}${ex.explanation ? '\nExplanation: ' + ex.explanation : ''}`}</pre>
                    </div>
                  ))}
                  <div className="pd-constraints">
                    <strong>Constraints:</strong>
                    <ul>{SAMPLE_PROBLEM.constraints.map((c) => <li key={c}><code>{c}</code></li>)}</ul>
                  </div>
                </div>
              </div>
            )}

            {/* Approach: Brute Force → Optimal */}
            {leftPanel === 'approach' && (
              <div className="pd-approach">
                <p className="approach-intro">Learn to explain solutions progressively — from brute force to optimal. This is how top interviewers want you to think.</p>
                {APPROACHES.map((a, i) => (
                  <div key={i} className="approach-card">
                    <div className="ac-header">
                      <div className="ac-num">{i + 1}</div>
                      <h3>{a.label}</h3>
                      <span className="ac-badge" style={{ background: a.badgeColor + '1a', color: a.badgeColor, borderColor: a.badgeColor + '44' }}>{a.badge}</span>
                    </div>
                    <p className="ac-explain">{a.explain}</p>
                    <div className="ac-steps">
                      {a.steps.map((s, si) => (
                        <div key={si} className="ac-step">
                          <span className="acs-num">{si + 1}</span>
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                    <pre className="ac-code">{a.code}</pre>
                    <div className="ac-tip">
                      <span className="ac-tip-label">💬 Interview tip</span>
                      <p>{a.interviewTip}</p>
                    </div>
                    {i < APPROACHES.length - 1 && (
                      <div className="ac-arrow">↓ Optimize to →</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Hints — no full solution */}
            {leftPanel === 'hints' && (
              <div className="pd-hints">
                <div className="hints-info">
                  <Lightbulb size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  AI hints guide your thinking — no full solution until you try first.
                </div>
                {HINTS.slice(0, hintLevel).map((h, i) => (
                  <div key={i} className="hint-card">
                    <div className="hint-num">Hint {i + 1} / {HINTS.length}</div>
                    <p>{h}</p>
                  </div>
                ))}
                {hintLevel < HINTS.length ? (
                  <button className="unlock-hint-btn" onClick={() => setHintLevel((l) => l + 1)}>
                    <Lightbulb size={14} /> Unlock Hint {hintLevel + 1}
                  </button>
                ) : (
                  <div className="hints-done">All hints revealed. Give it one more try before looking at solutions!</div>
                )}
                {hintLevel > 0 && (
                  <div className="ai-ask">
                    <div className="ai-ask-label">Ask AI (without giving full solution)</div>
                    <div className="ai-ask-row">
                      <input placeholder="e.g. Why doesn't my approach work for duplicates?" className="ai-ask-input" />
                      <button className="ai-ask-btn">Ask</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Visualizer */}
            {leftPanel === 'visual' && (
              <DSAVisualizer patternType="sliding-window" input={SAMPLE_PROBLEM.testCases[0].input} />
            )}

            {/* Notes */}
            {leftPanel === 'notes' && (
              <div className="pd-notes">
                <div className="notes-header">
                  <h2>My Notes</h2>
                  {existingNote && <span className="notes-updated">Updated {new Date(existingNote.updatedAt).toLocaleDateString()}</span>}
                </div>
                <textarea
                  className="notes-textarea"
                  placeholder="Write your approach, edge cases, key insights…"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  aria-label="Problem notes"
                />
                <div className="notes-footer">
                  <span className="notes-tip">Supports markdown — use **bold**, `code`, - lists</span>
                  <button className="save-note-btn" onClick={saveNote}>
                    {noteSaved ? '✓ Saved' : 'Save Note'}
                  </button>
                </div>
              </div>
            )}

            {/* Attempt history */}
            {leftPanel === 'history' && (
              <div className="pd-history">
                <h2>Attempt History</h2>
                {myAttempts.length === 0 ? (
                  <p className="empty-state">No attempts yet — run your first solution!</p>
                ) : (
                  <div className="history-list">
                    {myAttempts.map((a) => (
                      <div key={a.id} className="history-item">
                        <div className="hi-top">
                          <span className={`hi-status ${a.status === 'Accepted' ? 'pass' : 'fail'}`}>
                            {a.status === 'Accepted' ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                            {a.status}
                          </span>
                          <span className="hi-lang">{a.language}</span>
                          <span className="hi-time">{formatTime(a.timeTaken)}</span>
                          <span className="hi-date">{new Date(a.date).toLocaleDateString()}</span>
                        </div>
                        <div className="hi-fields" style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                          <input type="text" placeholder="Title..." value={a.title || ''} onChange={(e) => updateAttempt(a.id, { title: e.target.value })} style={{ flex: 1, padding: '4px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px' }} />
                          <input type="text" placeholder="TC (e.g. O(n))" value={a.timeComplexity || ''} onChange={(e) => updateAttempt(a.id, { timeComplexity: e.target.value })} style={{ width: '100px', padding: '4px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px' }} />
                          <input type="text" placeholder="SC (e.g. O(1))" value={a.spaceComplexity || ''} onChange={(e) => updateAttempt(a.id, { spaceComplexity: e.target.value })} style={{ width: '100px', padding: '4px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px' }} />
                        </div>
                        <textarea placeholder="Add a note for this attempt..." value={a.note || ''} onChange={(e) => updateAttempt(a.id, { note: e.target.value })} style={{ width: '100%', padding: '4px', marginTop: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '4px', minHeight: '40px', resize: 'vertical' }} />
                        <pre className="hi-code" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: '300px', overflowY: 'auto', marginTop: '8px' }}>{a.code}</pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TC/SC Analysis */}
            {leftPanel === 'analysis' && (
              <div className="pd-history tcsc-analysis-panel" style={{ background: '#000', borderRadius: '8px', padding: '16px', border: '1px solid var(--border)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <h2>Complexity Analysis</h2>
                {!results ? (
                  <p className="empty-state">Run your code first to analyze complexity.</p>
                ) : (
                  <>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                        <span className="tag tc" style={{ background: 'var(--primary-dim)', color: 'var(--primary)', padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>TC: O(n)</span>
                        <span className="tag sc" style={{ background: 'var(--success-dim)', color: 'var(--success)', padding: '4px 8px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>SC: O(min(n, m))</span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 12 }}>
                        <strong>Time Complexity Explanation:</strong><br />The algorithm iterates through the string of length <code style={{color: 'var(--primary)'}}>n</code> exactly once using the <code>right</code> pointer. In the worst case, the hash map lookups take O(1) time. Thus, the total time taken is strictly proportional to <code style={{color: 'var(--primary)'}}>n</code>.
                      </p>
                      <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 16 }}>
                        <strong>Space Complexity Explanation:</strong><br />The hash map stores at most the number of unique characters in the string. If the string consists of characters from a fixed alphabet (e.g. ASCII of size <code style={{color: 'var(--primary)'}}>m = 128</code>), the space is O(m) which simplifies to O(1). In general terms where <code style={{color: 'var(--primary)'}}>m</code> is the charset size, it takes O(min(n, m)) auxiliary space.
                      </p>
                    </div>
                    <div className="ai-ask" style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                      <div className="ai-ask-label">Ask AI about complexity</div>
                      <div className="ai-ask-row">
                        <input placeholder="Why isn't it O(n^2)?" className="ai-ask-input" style={{ background: 'rgba(255,255,255,0.05)' }} />
                        <button className="ai-ask-btn">Ask</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT PANE ── */}
        <div className="pd-right">
          {/* Editor toolbar */}
          <div className="editor-toolbar">
            <div className="lang-select-wrap">
              <select className="lang-select" value={lang} onChange={(e) => handleLangChange(e.target.value as Lang)} aria-label="Select language">
                <option value="python">Python 3</option>
                <option value="javascript">JavaScript</option>
                <option value="cpp">C++ 17</option>
                <option value="java">Java 17</option>
              </select>
              <ChevronDown size={12} className="lang-chevron" />
            </div>
            <div className="editor-actions">
              <button className="run-btn" onClick={handleRun} disabled={running}>
                <Play size={13} />{running ? 'Running…' : 'Run'}
              </button>
              <button className="submit-btn" onClick={handleSubmit} disabled={running}>
                <Send size={13} />Submit
              </button>
            </div>
          </div>

          {/* Code editor */}
          <div className="code-editor-wrap">
            <div className="line-numbers" aria-hidden="true">
              {code.split('\n').map((_, i) => <span key={i}>{i + 1}</span>)}
            </div>
            <textarea
              className="code-textarea"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              aria-label="Code editor"
            />
          </div>

          {/* Test panel */}
          <div className="test-panel">
            <div className="test-tabs">
              {(['testcases', 'result', 'steps'] as RightPanel[]).map((t) => (
                <button key={t} className={`test-tab ${rightPanel === t ? 'active' : ''}`} onClick={() => setRightPanel(t)}>
                  {t === 'testcases' ? 'Test Cases' : t === 'result' ? 'Result' : 'Step-by-Step'}
                </button>
              ))}
            </div>

            {/* Test cases list */}
            {rightPanel === 'testcases' && (
              <div className="test-cases-panel">
                <div className="tc-selector">
                  {SAMPLE_PROBLEM.testCases.slice(0, 4).map((_, i) => (
                    <button key={i} className={`tc-chip ${selectedTest === i ? 'active' : ''} ${results?.[i] ? (results[i].passed ? 'pass' : 'fail') : ''}`}
                      onClick={() => setSelectedTest(i)}>
                      Case {i + 1}
                      {results?.[i] && (results[i].passed ? ' ✓' : ' ✗')}
                    </button>
                  ))}
                </div>
                <div className="tc-detail">
                  <div className="tc-field">
                    <label>Input</label>
                    <code>{SAMPLE_PROBLEM.testCases[selectedTest].input}</code>
                  </div>
                  <div className="tc-field">
                    <label>Expected Output</label>
                    <code className="tc-expected">{SAMPLE_PROBLEM.testCases[selectedTest].expected}</code>
                  </div>
                  {results?.[selectedTest] && (
                    <div className="tc-field">
                      <label>Your Output</label>
                      <code className={results[selectedTest].passed ? 'tc-expected' : 'tc-wrong'}>
                        {results[selectedTest].actual}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Result */}
            {rightPanel === 'result' && (
              <div className="result-panel">
                {running && (
                  <div className="result-loading">
                    <span className="spinner" />Running {SAMPLE_PROBLEM.testCases.length} test cases…
                  </div>
                )}
                {!running && results && (
                  <>
                    <div className={`result-banner ${allPassed ? 'accepted' : 'wrong'}`}>
                      {allPassed ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                      <div>
                        <div className="result-title">{allPassed ? 'Accepted' : 'Wrong Answer'}</div>
                        <div className="result-sub">{passedCount}/{results.length} test cases · {results[0]?.runtimeMs}ms · {(results[0]?.memoryKB / 1000).toFixed(1)} MB</div>
                      </div>
                    </div>
                    <div className="result-cases">
                      {results.map((r, i) => (
                        <div key={i} className={`result-case ${r.passed ? 'pass' : 'fail'}`} onClick={() => { setSelectedTest(i); setRightPanel('testcases'); }}>
                          <span>{r.passed ? '✓' : '✗'} Case {i + 1}</span>
                          <span>{r.runtimeMs}ms</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {!running && !results && <div className="result-empty">Run your code to see results</div>}
              </div>
            )}

            {/* Step-by-step */}
            {rightPanel === 'steps' && (
              <div className="steps-panel">
                {!results ? (
                  <div className="result-empty">Run your code first to see execution steps</div>
                ) : (
                  <>
                    <div className="steps-header">
                      <span>Execution trace for Case {selectedTest + 1}</span>
                      <div className="steps-nav">
                        <button onClick={() => setSelectedStep((s) => Math.max(0, s - 1))} disabled={selectedStep === 0}><ChevronLeft size={14} /></button>
                        <span>{selectedStep + 1} / {results[selectedTest]?.steps?.length ?? 1}</span>
                        <button onClick={() => setSelectedStep((s) => Math.min((results[selectedTest]?.steps?.length ?? 1) - 1, s + 1))} disabled={selectedStep >= (results[selectedTest]?.steps?.length ?? 1) - 1}><ChevronR size={14} /></button>
                      </div>
                    </div>
                    <div className="step-detail">
                      {results[selectedTest]?.steps?.map((step, i) => (
                        <div key={i} className={`step-line ${i === selectedStep ? 'active' : i < selectedStep ? 'done' : ''}`}>
                          <span className="step-num">{i + 1}</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
