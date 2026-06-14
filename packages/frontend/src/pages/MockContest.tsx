import { useState, useEffect, useRef } from 'react';
import { Play, Clock, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import './MockContest.css';

const CONTEST_SETS = [
  {
    id: 'tcs-nqt', title: 'TCS NQT Simulation', duration: 60, company: 'TCS',
    problems: [
      { id: 'c1', title: 'Reverse a Linked List', difficulty: 'Easy' as const },
      { id: 'c2', title: 'Find duplicates in array', difficulty: 'Easy' as const },
      { id: 'c3', title: 'Level order traversal', difficulty: 'Medium' as const },
    ],
  },
  {
    id: 'amazon-oa', title: 'Amazon SDE OA', duration: 90, company: 'Amazon',
    problems: [
      { id: 'lc-3', title: 'Longest Substring Without Repeating Chars', difficulty: 'Medium' as const },
      { id: 'lc-42', title: 'Trapping Rain Water', difficulty: 'Hard' as const },
    ],
  },
  {
    id: 'custom', title: 'Custom 3-Problem Set', duration: 45, company: 'Custom',
    problems: [
      { id: 'lc-1', title: 'Two Sum', difficulty: 'Easy' as const },
      { id: 'lc-15', title: 'Three Sum', difficulty: 'Medium' as const },
      { id: 'lc-200', title: 'Number of Islands', difficulty: 'Medium' as const },
    ],
  },
];

type ContestState = 'lobby' | 'running' | 'finished';

const diffColor = (d: string) => d === 'Easy' ? 'var(--easy)' : d === 'Medium' ? 'var(--medium)' : 'var(--hard)';

export default function MockContest() {
  const { mockContests, addMockContest, finishMockContest } = useAppStore();
  const [contestState, setContestState] = useState<ContestState>('lobby');
  const [activeSet, setActiveSet] = useState(CONTEST_SETS[0]);
  const [activeContest, setActiveContest] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [solved, setSolved] = useState<Record<string, boolean>>({});
  const timerRef = useRef<ReturnType<typeof setInterval>>();

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
                <span className="msc-company">{set.company}</span>
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
