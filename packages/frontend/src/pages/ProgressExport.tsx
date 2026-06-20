import { useAppStore } from '../store/useAppStore';
import './ProgressExport.css';

// All builtin problems for name lookup
const BUILTIN_PROBLEM_NAMES: Record<string, string> = {
  'lc-3': 'Longest Substring Without Repeating Characters',
  'lc-76': 'Minimum Window Substring',
  'lc-567': 'Permutation in String',
  'lc-1': 'Two Sum',
  'lc-15': 'Three Sum',
  'lc-42': 'Trapping Rain Water',
  'lc-200': 'Number of Islands',
  'lc-322': 'Coin Change',
  'lc-704': 'Binary Search',
  'lc-33': 'Search in Rotated Sorted Array',
};

const PATTERN_NAMES: Record<string, string> = {
  'sliding-window': 'Sliding Window', 'two-pointers': 'Two Pointers',
  'binary-search': 'Modified Binary Search', 'hashmap': 'HashMap',
  'dp': 'Dynamic Programming', 'graph': 'Graph Traversal',
  'tree-bfs': 'Tree BFS', 'tree-dfs': 'Tree DFS', 'backtracking': 'Backtracking',
};

function fmt(s: number) { return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }

export default function ProgressExport() {
  const { attempts, solvedProblems, mistakes, customProblems } = useAppStore();

  const getProblemTitle = (id: string) =>
    BUILTIN_PROBLEM_NAMES[id] ?? customProblems.find((p) => p.id === id)?.title ?? id;

  const getPatternName = (id: string) => PATTERN_NAMES[id] ?? id;

  const solvedList = Object.entries(solvedProblems).map(([id, v]) => ({
    id, title: getProblemTitle(id), ...v,
    attempts: attempts.filter((a) => a.problemId === id),
  }));

  const totalTime = attempts.reduce((sum, a) => sum + a.timeTaken, 0);
  const accepted = attempts.filter((a) => a.status === 'Accepted').length;
  const accuracy = attempts.length > 0 ? Math.round((accepted / attempts.length) * 100) : 0;

  const exportCSV = () => {
    const rows = [
      ['Problem', 'Status', 'Attempts', 'Best Time', 'Date Solved'],
      ...solvedList.map((p) => {
        const bestAttempt = p.attempts.filter((a) => a.status === 'Accepted').sort((a, b) => a.timeTaken - b.timeTaken)[0];
        return [
          p.title, p.status,
          p.attempts.length,
          bestAttempt ? fmt(bestAttempt.timeTaken) : 'N/A',
          new Date(p.solvedAt).toLocaleDateString(),
        ];
      }),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'prepos-progress.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      summary: { totalSolved: solvedList.length, totalAttempts: attempts.length, accuracy, totalTimeMins: Math.round(totalTime / 60) },
      solvedProblems: solvedList.map((p) => ({
        title: p.title, status: p.status, solvedAt: p.solvedAt,
        attempts: p.attempts.map((a) => ({ status: a.status, language: a.language, timeTaken: fmt(a.timeTaken), date: a.date })),
      })),
      mistakes: mistakes.map((m) => ({ problem: m.problemTitle, type: m.mistakeType, note: m.note, resolved: m.resolved })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'prepos-progress.json'; a.click();
    URL.revokeObjectURL(url);
  };

  // Group by pattern
  const byPattern = attempts.reduce<Record<string, { total: number; accepted: number }>>((acc, a) => {
    const key = a.patternId || 'unknown';
    if (!acc[key]) acc[key] = { total: 0, accepted: 0 };
    acc[key].total++;
    if (a.status === 'Accepted') acc[key].accepted++;
    return acc;
  }, {});

  return (
    <div className="progress-export-page">
      <div className="pe-header">
        <div><h1>Progress Export</h1><p className="sub">All your solved problems, attempt times, and stats</p></div>
        <div className="pe-export-btns">
          <button className="btn-export csv" onClick={exportCSV}>⬇ Export CSV</button>
          <button className="btn-export json" onClick={exportJSON}>⬇ Export JSON</button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="pe-stats">
        {[
          { label: 'Problems Solved', value: solvedList.length },
          { label: 'Total Attempts', value: attempts.length },
          { label: 'Accuracy', value: `${accuracy}%` },
          { label: 'Total Time', value: `${Math.round(totalTime / 60)}m` },
          { label: 'Mistakes Logged', value: mistakes.length },
          { label: 'Resolved', value: mistakes.filter((m) => m.resolved).length },
        ].map((s) => (
          <div key={s.label} className="pe-stat">
            <div className="pe-stat-value">{s.value}</div>
            <div className="pe-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="pe-grid">
        {/* Pattern accuracy */}
        <section className="pe-card">
          <h2>Pattern Accuracy</h2>
          <div className="pattern-acc-list">
            {Object.entries(byPattern).map(([pid, d]) => {
              const pct = Math.round((d.accepted / d.total) * 100);
              return (
                <div key={pid} className="pa-row">
                  <span className="pa-name">{getPatternName(pid)}</span>
                  <div className="pa-bar-wrap">
                    <div className="pa-bar" style={{ width: `${pct}%`, background: pct > 70 ? 'var(--success)' : pct > 40 ? 'var(--primary)' : 'var(--error)' }} />
                  </div>
                  <span className="pa-pct">{d.accepted}/{d.total}</span>
                </div>
              );
            })}
            {Object.keys(byPattern).length === 0 && <p className="empty">No attempts yet.</p>}
          </div>
        </section>

        {/* Solved problems table */}
        <section className="pe-card pe-card-wide">
          <h2>Solved Problems ({solvedList.length})</h2>
          <div className="solved-table">
            <div className="st-head">
              <span>Problem</span><span>Status</span><span>Attempts</span><span>Best Time</span><span>Date</span>
            </div>
            {solvedList.length === 0 && <p className="empty">No solved problems yet.</p>}
            {solvedList.map((p) => {
              const best = p.attempts.filter((a) => a.status === 'Accepted').sort((a, b) => a.timeTaken - b.timeTaken)[0];
              return (
                <div key={p.id} className="st-row">
                  <span className="st-title">{p.title}</span>
                  <span className={`st-status ${p.status}`}>{p.status === 'solved' ? '✓ Solved' : '⟳ Revision'}</span>
                  <span>{p.attempts.length}</span>
                  <span className="mono">{best ? fmt(best.timeTaken) : '—'}</span>
                  <span className="text-dim">{new Date(p.solvedAt).toLocaleDateString()}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* All attempts */}
        <section className="pe-card pe-card-wide">
          <h2>All Attempts ({attempts.length})</h2>
          <div className="attempts-table">
            <div className="at-head">
              <span>Problem</span><span>Status</span><span>Language</span><span>Time Spent</span><span>Runtime</span><span>Date</span>
            </div>
            {attempts.length === 0 && <p className="empty">No attempts yet.</p>}
            {attempts.slice(0, 50).map((a) => (
              <div key={a.id} className="at-row">
                <span className="at-title">{a.problemTitle || getProblemTitle(a.problemId)}</span>
                <span className={`at-status ${a.status === 'Accepted' ? 'pass' : 'fail'}`}>{a.status}</span>
                <span className="lang-chip">{a.language}</span>
                <span className="mono">{fmt(a.timeTaken)}</span>
                <span className="mono">{a.timeMs}ms</span>
                <span className="text-dim">{new Date(a.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
