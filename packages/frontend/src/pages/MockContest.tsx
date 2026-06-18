import { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Clock, CheckCircle2, XCircle, Trophy, Plus, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { BUILTIN_PROBLEMS } from './DSAPatterns';
import './MockContest.css';

type ContestSet = {
  id: string;
  title: string;
  duration: number;
  company: string;
  problems: { id: string; title: string; difficulty: 'Easy' | 'Medium' | 'Hard' }[];
};
type ContestState = 'lobby' | 'create' | 'running' | 'finished';

const STATIC_CONTEST_SETS: ContestSet[] = [
  {
    id: 'tcs-nqt', title: 'TCS NQT Simulation', duration: 60, company: 'TCS',
    problems: [
      { id: 'lc-206', title: 'Reverse Linked List',                      difficulty: 'Easy' },
      { id: 'lc-268', title: 'Missing Number',                           difficulty: 'Easy' },
      { id: 'lc-102', title: 'Binary Tree Level Order Traversal',        difficulty: 'Medium' },
    ],
  },
  {
    id: 'amazon-oa', title: 'Amazon SDE OA', duration: 90, company: 'Amazon',
    problems: [
      { id: 'lc-3',  title: 'Longest Substring Without Repeating Chars', difficulty: 'Medium' },
      { id: 'lc-42', title: 'Trapping Rain Water',                       difficulty: 'Hard' },
    ],
  },
  {
    id: 'google-screen', title: 'Google Phone Screen', duration: 45, company: 'Google',
    problems: [
      { id: 'lc-1',   title: 'Two Sum',                                  difficulty: 'Easy' },
      { id: 'lc-33',  title: 'Search in Rotated Sorted Array',           difficulty: 'Medium' },
      { id: 'lc-200', title: 'Number of Islands',                        difficulty: 'Medium' },
    ],
  },
];

const diffColor = (d: string) => d === 'Easy' ? 'var(--easy)' : d === 'Medium' ? 'var(--medium)' : 'var(--hard)';

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// ── Custom Contest Builder ────────────────────────────────────────────────────
function CustomBuilder({ onStart, onCancel }: {
  onStart: (set: ContestSet) => void;
  onCancel: () => void;
}) {
  const { customProblems } = useAppStore();
  const allProblems = [...BUILTIN_PROBLEMS, ...customProblems];

  const [title, setTitle]       = useState('My Custom Contest');
  const [duration, setDuration] = useState(45);
  const [selected, setSelected] = useState<typeof allProblems>([]);
  const [search, setSearch]     = useState('');
  const [diffFilter, setDiffFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');

  const filtered = allProblems.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchDiff   = diffFilter === 'All' || p.difficulty === diffFilter;
    return matchSearch && matchDiff;
  });

  const toggle = (p: typeof allProblems[0]) => {
    setSelected(prev =>
      prev.some(x => x.id === p.id) ? prev.filter(x => x.id !== p.id) : [...prev, p]
    );
  };

  const handleStart = () => {
    if (selected.length === 0 || !title.trim()) return;
    onStart({
      id: 'custom-' + Date.now(),
      title: title.trim(),
      duration,
      company: 'Custom',
      problems: selected.map(p => ({ id: p.id, title: p.title, difficulty: p.difficulty })),
    });
  };

  return (
    <div className="mc-builder">
      <div className="mcb-header">
        <h2>Create Custom Contest</h2>
        <button onClick={onCancel} className="mcb-close"><X size={16} /></button>
      </div>

      <div className="mcb-meta">
        <div className="mcb-field">
          <label>Contest Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. My Google Prep" />
        </div>
        <div className="mcb-field">
          <label>Duration (minutes)</label>
          <div className="mcb-dur-row">
            {[20, 30, 45, 60, 90, 120].map(d => (
              <button key={d} className={`mcb-dur-btn ${duration === d ? 'active' : ''}`} onClick={() => setDuration(d)}>{d}m</button>
            ))}
          </div>
        </div>
      </div>

      <div className="mcb-layout">
        {/* Problem picker */}
        <div className="mcb-picker">
          <div className="mcb-filters">
            <input className="mcb-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search problems…" />
            <div className="mcb-diff-row">
              {(['All','Easy','Medium','Hard'] as const).map(d => (
                <button key={d} className={`mcb-diff-btn ${diffFilter === d ? 'active' : ''}`} onClick={() => setDiffFilter(d)}>{d}</button>
              ))}
            </div>
          </div>
          <div className="mcb-list">
            {filtered.slice(0, 60).map(p => {
              const isSelected = selected.some(x => x.id === p.id);
              return (
                <div key={p.id} className={`mcb-item ${isSelected ? 'selected' : ''}`} onClick={() => toggle(p)}>
                  <span className={`mcb-check ${isSelected ? 'on' : ''}`}>{isSelected ? '✓' : ''}</span>
                  <span className="mcb-title">{p.title}</span>
                  <span className="mcb-diff" style={{ color: diffColor(p.difficulty) }}>{p.difficulty}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected */}
        <div className="mcb-selected">
          <div className="mcbs-header">
            Selected <span className="mcbs-count">{selected.length}</span>
          </div>
          {selected.length === 0 ? (
            <p className="mcbs-empty">Click problems on the left to add them</p>
          ) : (
            <div className="mcbs-list">
              {selected.map((p, i) => (
                <div key={p.id} className="mcbs-row">
                  <span className="mcbs-num">{i + 1}</span>
                  <span className="mcbs-title">{p.title}</span>
                  <button onClick={() => toggle(p)}><X size={12} /></button>
                </div>
              ))}
            </div>
          )}
          <button
            className="start-btn"
            style={{ marginTop: 'auto', width: '100%' }}
            disabled={selected.length === 0 || !title.trim()}
            onClick={handleStart}
          >
            <Play size={14} /> Start Contest
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MockContest() {
  const { mockContests, addMockContest, finishMockContest, solvedProblems, customProblems } = useAppStore();
  const [contestState, setContestState] = useState<ContestState>('lobby');
  const [activeSet, setActiveSet] = useState<ContestSet>(STATIC_CONTEST_SETS[0]);
  const [activeContest, setActiveContest] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [solved, setSolved] = useState<Record<string, boolean>>({});
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const weeklyContest = useMemo<ContestSet>(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const solvedThisWeek = Object.entries(solvedProblems)
      .filter(([, data]) => new Date(data.solvedAt).getTime() > weekAgo)
      .map(([id]) => id);
    const allProblems = [...BUILTIN_PROBLEMS, ...customProblems];
    const weekProblems = solvedThisWeek.map(id => allProblems.find(p => p.id === id)).filter(Boolean) as typeof BUILTIN_PROBLEMS;
    const week = getWeekNumber(new Date());
    const pool = weekProblems.length >= 3 ? weekProblems : [...BUILTIN_PROBLEMS];
    const seed = week % pool.length;
    const picked = [
      pool[seed % pool.length],
      pool[(seed + Math.floor(pool.length / 3)) % pool.length],
      pool[(seed + Math.floor(pool.length * 2 / 3)) % pool.length],
    ].filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i);
    return { id: `weekly-w${week}`, title: `Week ${week} Challenge`, duration: 60, company: 'Weekly',
      problems: picked.map(p => ({ id: p.id, title: p.title, difficulty: p.difficulty })) };
  }, [solvedProblems, customProblems]);

  const CONTEST_SETS = [weeklyContest, ...STATIC_CONTEST_SETS];

  useEffect(() => {
    if (contestState === 'running' && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); finishContest(); return 0; }
        return t - 1;
      }), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [contestState]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const startContest = (set: ContestSet) => {
    const id = crypto.randomUUID();
    setActiveSet(set);
    setActiveContest(id);
    setTimeLeft(set.duration * 60);
    setSolved({});
    setContestState('running');
    addMockContest({ id, title: set.title, problemIds: set.problems.map(p => p.id), durationMin: set.duration, startedAt: new Date().toISOString() });
  };

  const markSolved = (pid: string) => setSolved(s => ({ ...s, [pid]: !s[pid] }));

  const finishContest = () => {
    clearInterval(timerRef.current);
    if (activeContest) {
      const score = Object.values(solved).filter(Boolean).length;
      finishMockContest(activeContest, activeSet.problems.map(p => ({
        problemId: p.id, status: solved[p.id] ? 'Accepted' : 'Unattempted',
        timeTaken: activeSet.duration * 60 - timeLeft,
      })), score * 100);
    }
    setContestState('finished');
  };

  const pctTime = timeLeft / (activeSet.duration * 60) * 100;
  const solvedCount = Object.values(solved).filter(Boolean).length;
  const past = [...mockContests].slice(0, 5);

  // ── LOBBY ──
  if (contestState === 'lobby') return (
    <div className="mock-contest-page">
      <div className="mc-header">
        <div><h1>Mock Contest</h1><p className="sub">Simulate real OA conditions — timed, no hints</p></div>
        <button className="mc-custom-btn" onClick={() => setContestState('create')}>
          <Plus size={14} /> Custom Contest
        </button>
      </div>

      <div className="mc-sets">
        {CONTEST_SETS.map(set => (
          <div key={set.id} className="mc-set-card">
            <div className="msc-top">
              <div>
                <span className="msc-company">
                  {set.company}
                  {set.company === 'Weekly' && <span className="msc-new-badge">NEW</span>}
                </span>
                <h3>{set.title}</h3>
              </div>
              <div className="msc-meta"><Clock size={13} /> {set.duration} min</div>
            </div>
            <div className="msc-problems">
              {set.problems.map(p => (
                <div key={p.id} className="msp-row">
                  <span className="msp-title">{p.title}</span>
                  <span style={{ color: diffColor(p.difficulty), fontSize: 12, fontWeight: 600 }}>{p.difficulty}</span>
                </div>
              ))}
            </div>
            <button className="start-btn" onClick={() => startContest(set)}><Play size={14} /> Start Contest</button>
          </div>
        ))}
      </div>

      {past.length > 0 && (
        <section className="mc-history">
          <h2>Past Contests</h2>
          {past.map(c => (
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

  // ── CUSTOM BUILDER ──
  if (contestState === 'create') return (
    <div className="mock-contest-page">
      <CustomBuilder onStart={startContest} onCancel={() => setContestState('lobby')} />
    </div>
  );

  // ── RUNNING ──
  if (contestState === 'running') return (
    <div className="mock-contest-page">
      <div className="mc-running-header">
        <h2>{activeSet.title}</h2>
        <div className={`mc-timer ${timeLeft < 300 ? 'danger' : timeLeft < 600 ? 'warn' : ''}`}>
          <Clock size={16} />{fmt(timeLeft)}
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
              <button className={`mark-btn ${solved[p.id] ? 'solved' : ''}`} onClick={() => markSolved(p.id)}>
                {solved[p.id] ? '✓ Solved' : 'Mark Solved'}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mc-score-bar">
        <span>Solved: {solvedCount}/{activeSet.problems.length}</span>
        <div className="score-dots">
          {activeSet.problems.map(p => <div key={p.id} className={`score-dot ${solved[p.id] ? 'filled' : ''}`} />)}
        </div>
      </div>
    </div>
  );

  // ── FINISHED ──
  const lastContest = mockContests.find(c => c.id === activeContest);
  const score = lastContest?.score ?? 0;
  return (
    <div className="mock-contest-page">
      <div className="mc-result">
        <Trophy size={48} style={{ color: score > 0 ? 'var(--primary)' : 'var(--text-faint)' }} />
        <h2>Contest Complete!</h2>
        <div className="mc-final-score">{score / 100} / {activeSet.problems.length} problems solved</div>
        <div className="mc-result-list">
          {activeSet.problems.map(p => (
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
