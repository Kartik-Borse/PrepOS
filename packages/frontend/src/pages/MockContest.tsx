import { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Clock, CheckCircle2, XCircle, Trophy, RefreshCw } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { BUILTIN_PROBLEMS } from './DSAPatterns';
import './MockContest.css';

const STATIC_CONTEST_SETS = [
  {
    id: 'tcs-nqt', title: 'TCS NQT Simulation', duration: 60, company: 'TCS',
    problems: [
      { id: 'lc-206', title: 'Reverse Linked List',                      difficulty: 'Easy' as const },
      { id: 'lc-268', title: 'Missing Number',                           difficulty: 'Easy' as const },
      { id: 'lc-102', title: 'Binary Tree Level Order Traversal',        difficulty: 'Medium' as const },
    ],
  },
  {
    id: 'amazon-oa', title: 'Amazon SDE OA', duration: 90, company: 'Amazon',
    problems: [
      { id: 'lc-3',  title: 'Longest Substring Without Repeating Chars', difficulty: 'Medium' as const },
      { id: 'lc-42', title: 'Trapping Rain Water',                       difficulty: 'Hard' as const },
    ],
  },
  {
    id: 'google-screen', title: 'Google Phone Screen', duration: 45, company: 'Google',
    problems: [
      { id: 'lc-1',   title: 'Two Sum',                                  difficulty: 'Easy' as const },
      { id: 'lc-33',  title: 'Search in Rotated Sorted Array',           difficulty: 'Medium' as const },
      { id: 'lc-200', title: 'Number of Islands',                        difficulty: 'Medium' as const },
    ],
  },
];

type ContestState = 'lobby' | 'running' | 'finished';
type ContestSet = typeof STATIC_CONTEST_SETS[0];

const diffColor = (d: string) => d === 'Easy' ? 'var(--easy)' : d === 'Medium' ? 'var(--medium)' : 'var(--hard)';

// Get ISO week number for deterministic weekly seeding
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export default function MockContest() {
  const { mockContests, addMockContest, finishMockContest, solvedProblems, customProblems } = useAppStore();
  const [contestState, setContestState] = useState<ContestState>('lobby');
  const [activeSet, setActiveSet] = useState<ContestSet>(STATIC_CONTEST_SETS[0]);
  const [activeContest, setActiveContest] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [solved, setSolved] = useState<Record<string, boolean>>({});
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  // Generate a weekly contest from problems solved this week
  const weeklyContest = useMemo<ContestSet>(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const solvedThisWeek = Object.entries(solvedProblems)
      .filter(([, data]) => new Date(data.solvedAt).getTime() > weekAgo)
      .map(([id]) => id);

    // Find problem objects for the solved IDs (built-in + custom)
    const allProblems = [...BUILTIN_PROBLEMS, ...customProblems];
    const weekProblems = solvedThisWeek
      .map(id => allProblems.find(p => p.id === id))
      .filter(Boolean) as typeof BUILTIN_PROBLEMS;

    // Pick 3 problems for the weekly contest, seeded by week number so it changes weekly
    const week = getWeekNumber(new Date());
    const pool = weekProblems.length >= 3 ? weekProblems : [...BUILTIN_PROBLEMS];
    const seed = week % pool.length;
    const picked = [
      pool[seed % pool.length],
      pool[(seed + Math.floor(pool.length / 3)) % pool.length],
      pool[(seed + Math.floor(pool.length * 2 / 3)) % pool.length],
    ];
    // Deduplicate
    const unique = picked.filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i);

    return {
      id: `weekly-w${week}`,
      title: `Week ${week} Challenge`,
      duration: 60,
      company: 'Weekly',
      problems: unique.map(p => ({
        id: p.id,
        title: p.title,
        difficulty: p.difficulty,
      })),
    };
  }, [solvedProblems, customProblems]);

  const CONTEST_SETS = [weeklyContest, ...STATIC_CONTEST_SETS];

  useEffect(() => {
    if (contestState === 'running' && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); finishContest(); return 0; }
        return t - 1;
      }), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [contestState]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const startContest = (set: typeof CONTEST_SETS[0]) => {
    const id = crypto.randomUUID();
    setActiveSet(set);
    setActiveContest(id);
    setTimeLeft(set.duration * 60);
    setSolved({});
    setContestState('running');
    addMockContest({ id, title: set.title, problemIds: set.problems.map((p) => p.id), durationMin: set.duration, startedAt: new Date().toISOString() });
  };

  const markSolved = (pid: string) => setSolved((s) => ({ ...s, [pid]: !s[pid] }));

  const finishContest = () => {
    clearInterval(timerRef.current);
    if (activeContest) {
      const score = Object.values(solved).filter(Boolean).length;
      finishMockContest(activeContest, activeSet.problems.map((p) => ({
        problemId: p.id, status: solved[p.id] ? 'Accepted' : 'Unattempted',
        timeTaken: (activeSet.duration * 60 - timeLeft),
      })), score * 100);
    }
    setContestState('finished');
  };

  const pctTime = activeSet ? (timeLeft / (activeSet.duration * 60)) * 100 : 100;
  const solvedCount = Object.values(solved).filter(Boolean).length;
  const past = [...mockContests].slice(0, 5);

  if (contestState === 'lobby') return (
    <div className="mock-contest-page">
      <div className="mc-header">
        <div><h1>Mock Contest</h1><p className="sub">Simulate real OA conditions — timed, no hints</p></div>
      </div>

      <div className="mc-sets">
        {CONTEST_SETS.map((set) => (
          <div key={set.id} className="mc-set-card">
            <div className="msc-top">
              <div>
                <span className="msc-company">
                  {set.company}
                  {set.company === 'Weekly' && <span style={{ marginLeft: 6, background: 'var(--primary)', color: '#000', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20 }}>NEW</span>}
                </span>
                <h3>{set.title}</h3>
              </div>
              <div className="msc-meta">
                <Clock size={13} /> {set.duration} min
              </div>
            </div>
            <div className="msc-problems">
              {set.problems.map((p) => (
                <div key={p.id} className="msp-row">
                  <span className="msp-title">{p.title}</span>
                  <span style={{ color: diffColor(p.difficulty), fontSize: 12, fontWeight: 600 }}>{p.difficulty}</span>
                </div>
              ))}
            </div>
            <button className="start-btn" onClick={() => startContest(set)}>
              <Play size={14} /> Start Contest
            </button>
          </div>
        ))}
      </div>

      {past.length > 0 && (
        <section className="mc-history">
          <h2>Past Contests</h2>
          {past.map((c) => (
            <div key={c.id} className="mc-hist-row">
              <span className="mhr-title">{c.title}</span>
              <span className="mhr-score">{c.score != null ? `${c.score / 100}/${c.problemIds.length} solved` : 'In progress'}</span>
              <span className="mhr-date">{new Date(c.startedAt).toLocaleDateString()}</span>
            </div>
          ))}
        </section>
      )}
    </div>
  );

  if (contestState === 'running') return (
    <div className="mock-contest-page">
      <div className="mc-running-header">
        <h2>{activeSet.title}</h2>
        <div className={`mc-timer ${timeLeft < 300 ? 'danger' : timeLeft < 600 ? 'warn' : ''}`}>
          <Clock size={16} />
          {fmt(timeLeft)}
        </div>
        <button className="finish-btn" onClick={finishContest}>Finish Early</button>
      </div>

      <div className="mc-timer-bar">
        <div className="mc-timer-fill" style={{ width: `${pctTime}%`, background: pctTime < 20 ? 'var(--error)' : pctTime < 40 ? 'var(--warning)' : 'var(--success)' }} />
      </div>

      <div className="mc-contest-problems">
        {activeSet.problems.map((p, i) => (
          <div key={p.id} className={`mcp-card ${solved[p.id] ? 'solved' : ''}`}>
            <div className="mcp-header">
              <span className="mcp-num">Q{i + 1}</span>
              <span className="mcp-title">{p.title}</span>
              <span style={{ color: diffColor(p.difficulty), fontSize: 12, fontWeight: 600 }}>{p.difficulty}</span>
              {solved[p.id] && <CheckCircle2 size={18} style={{ color: 'var(--success)', marginLeft: 'auto' }} />}
            </div>
            <div className="mcp-actions">
              <a href={`/problem/${p.id}`} target="_blank" rel="noreferrer" className="solve-link">Open Problem ↗</a>
              <button
                className={`mark-btn ${solved[p.id] ? 'solved' : ''}`}
                onClick={() => markSolved(p.id)}
              >
                {solved[p.id] ? '✓ Solved' : 'Mark Solved'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mc-score-bar">
        <span>Solved: {solvedCount}/{activeSet.problems.length}</span>
        <div className="score-dots">
          {activeSet.problems.map((p) => (
            <div key={p.id} className={`score-dot ${solved[p.id] ? 'filled' : ''}`} />
          ))}
        </div>
      </div>
    </div>
  );

  const lastContest = mockContests.find((c) => c.id === activeContest);
  const score = lastContest?.score ?? 0;

  return (
    <div className="mock-contest-page">
      <div className="mc-result">
        <Trophy size={48} style={{ color: score > 0 ? 'var(--primary)' : 'var(--text-faint)' }} />
        <h2>Contest Complete!</h2>
        <div className="mc-final-score">{score / 100} / {activeSet.problems.length} problems solved</div>
        <div className="mc-result-list">
          {activeSet.problems.map((p) => (
            <div key={p.id} className={`mcr-row ${solved[p.id] ? 'pass' : 'fail'}`}>
              {solved[p.id] ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
              <span>{p.title}</span>
              <span style={{ color: diffColor(p.difficulty), fontSize: 12 }}>{p.difficulty}</span>
            </div>
          ))}
        </div>
        <button className="start-btn" onClick={() => setContestState('lobby')}>← Back to Contests</button>
      </div>
    </div>
  );
}
