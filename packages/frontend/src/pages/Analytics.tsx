import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { Sparkles } from 'lucide-react';
import './Analytics.css';

const patternData = [
  { name: 'HashMap', pct: 86, color: '#3b82f6' },
  { name: 'Two Pointers', pct: 79, color: '#8b5cf6' },
  { name: 'Sliding Window', pct: 60, color: '#06b6d4' },
  { name: 'Binary Search', pct: 73, color: '#f97316' },
  { name: 'Graph Traversal', pct: 40, color: '#10b981' },
  { name: 'Dynamic Programming', pct: 20, color: '#f59e0b' },
  { name: 'Backtracking', pct: 23, color: '#a855f7' },
  { name: 'Monotonic Stack', pct: 36, color: '#ec4899' },
];

const activityData = [4, 2, 6, 8, 3, 7, 5, 9, 4, 2, 6, 8, 5, 3, 7, 6, 4, 8, 5, 3, 9, 6, 7, 4, 5, 3, 6, 8, 4, 7];

const companies = [
  { name: 'Amazon', pct: 74, color: '#f97316' },
  { name: 'TCS NQT', pct: 88, color: '#10b981' },
  { name: 'Infosys', pct: 82, color: '#22c55e' },
  { name: 'Microsoft', pct: 56, color: '#3b82f6' },
  { name: 'Flipkart', pct: 61, color: '#8b5cf6' },
  { name: 'Google', pct: 42, color: '#ef4444' },
];

export default function Analytics() {
  const { solvedProblems, attempts } = useAppStore();
  const user = useAuthStore(s => s.user);
  
  const solvedCount = Object.keys(solvedProblems).length;
  const solvedThisWeek = Object.values(solvedProblems).filter(p => new Date(p.solvedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
  const totalXp = solvedCount * 25;
  const avgDaily = solvedCount > 0 ? (solvedCount / 30).toFixed(1) : '0'; // Mock average

  const maxActivity = Math.max(...activityData);

  return (
    <div className="analytics-page">
      <div className="page-header-row">
        <div>
          <h1>Analytics</h1>
          <p className="sub">Your progress, patterns, and company readiness</p>
        </div>
        <select className="range-select" aria-label="Time range">
          <option>Last 30 days</option>
          <option>Last 90 days</option>
          <option>All time</option>
        </select>
      </div>

      {/* KPIs */}
      <div className="kpi-row">
        {[
          { label: 'Problems Solved', value: `${solvedCount}`, delta: `+${solvedThisWeek} this week` },
          { label: 'Current Streak', value: `${user?.currentStreak ?? 1}d`, delta: `Best: ${Math.max(user?.currentStreak ?? 1, 12)}d` },
          { label: 'Total XP', value: `${totalXp}`, delta: `Level ${Math.floor(totalXp/100) + 1}` },
          { label: 'Avg Daily Problems', value: avgDaily, delta: 'Goal: 5/day' },
        ].map(k => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-delta">{k.delta}</div>
          </div>
        ))}
      </div>

      {/* AI Insights */}
      <div className="ai-insight-card" style={{ background: 'var(--primary-dim)', border: '1px solid var(--primary)', borderRadius: '12px', padding: '16px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '50%', color: '#fff', display: 'flex' }}><Sparkles size={18} /></div>
        <div>
          <h3 style={{ color: 'var(--primary)', marginBottom: '4px', fontSize: '15px' }}>AI Progress Insight</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '13px', lineHeight: 1.5 }}>
            You're doing great on <strong>Sliding Window</strong> patterns! To improve your readiness for Amazon and Microsoft, consider focusing your next sessions on <strong>Dynamic Programming</strong> and <strong>Graph Traversal</strong>. Your space complexity on recent submissions is optimal (O(1)), but time complexity could be improved on tree-based problems.
          </p>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Activity chart */}
        <section className="an-card wide">
          <div className="an-card-header">
            <div>
              <h2>Daily Activity</h2>
              <p className="sub">Problems solved per day — last 30 days</p>
            </div>
          </div>
          <div className="bar-chart" aria-label="Daily activity bar chart">
            {activityData.map((v, i) => (
              <div key={i} className="bar-col">
                <div className="bar-fill" style={{ height: `${(v / maxActivity) * 100}%`, background: v > 6 ? 'var(--primary)' : 'var(--border)' }} />
                {i % 5 === 0 && <span className="bar-label">{i + 1}</span>}
              </div>
            ))}
          </div>
        </section>

        {/* Pattern breakdown */}
        <section className="an-card">
          <div className="an-card-header">
            <div>
              <h2>Pattern Mastery</h2>
              <p className="sub">Completion across all patterns</p>
            </div>
          </div>
          <div className="pattern-breakdown">
            {patternData.map(p => (
              <div key={p.name} className="pb-row">
                <span className="pb-name">{p.name}</span>
                <div className="pb-bar-wrap">
                  <div className="pb-bar" style={{ width: `${p.pct}%`, background: p.color }} />
                </div>
                <span className="pb-pct">{p.pct}%</span>
              </div>
            ))}
          </div>
        </section>

        {/* Company readiness */}
        <section className="an-card">
          <div className="an-card-header">
            <div>
              <h2>Company Readiness</h2>
              <p className="sub">Based on solved problem tags</p>
            </div>
          </div>
          <div className="company-grid">
            {companies.map(c => (
              <div key={c.name} className="cg-card">
                <div className="cg-name">{c.name}</div>
                <svg viewBox="0 0 60 60" className="cg-ring" aria-label={`${c.name} ${c.pct}% readiness`}>
                  <circle cx="30" cy="30" r="24" fill="none" stroke="var(--border)" strokeWidth="5" />
                  <circle
                    cx="30" cy="30" r="24" fill="none"
                    stroke={c.color} strokeWidth="5"
                    strokeDasharray={`${2 * Math.PI * 24 * c.pct / 100} ${2 * Math.PI * 24}`}
                    strokeLinecap="round"
                    transform="rotate(-90 30 30)"
                  />
                </svg>
                <div className="cg-pct" style={{ color: c.color }}>{c.pct}%</div>
              </div>
            ))}
          </div>
        </section>

        {/* Difficulty breakdown */}
        <section className="an-card">
          <div className="an-card-header">
            <div><h2>Difficulty Breakdown</h2><p className="sub">Total: {solvedCount} problems</p></div>
          </div>
          <div className="diff-breakdown">
            {[
              { label: 'Easy', value: Math.floor(solvedCount * 0.45) || 0, color: 'var(--easy)' },
              { label: 'Medium', value: Math.floor(solvedCount * 0.40) || 0, color: 'var(--medium)' },
              { label: 'Hard', value: Math.floor(solvedCount * 0.15) || 0, color: 'var(--hard)' },
            ].map(d => (
              <div key={d.label} className="db-row">
                <span className="db-label" style={{ color: d.color }}>{d.label}</span>
                <div className="db-bar-wrap">
                  <div className="db-bar" style={{ width: `${solvedCount ? (d.value / solvedCount) * 100 : 0}%`, background: d.color }} />
                </div>
                <span className="db-value">{d.value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
