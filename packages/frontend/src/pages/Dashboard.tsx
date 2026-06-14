import { Link } from 'react-router-dom';
import { Flame, Code2, ChevronRight, RotateCcw, Target, TrendingUp } from 'lucide-react';
import CheatsheetSlideshow from '../components/CheatsheetSlideshow';
import { useAuthStore } from '../store/useAuthStore';
import './Dashboard.css';

const patterns = [
  { id: 'sliding-window', name: 'Sliding Window', solved: 18, total: 30, color: '#06b6d4' },
  { id: 'two-pointers', name: 'Two Pointers', solved: 22, total: 28, color: '#8b5cf6' },
  { id: 'dynamic-programming', name: 'Dynamic Programming', solved: 9, total: 45, color: '#f59e0b' },
  { id: 'graph-traversal', name: 'Graph Traversal', solved: 14, total: 35, color: '#10b981' },
  { id: 'binary-search', name: 'Modified Binary Search', solved: 19, total: 26, color: '#f97316' },
];

const revisionDue = [
  { id: 1, title: 'Longest Repeating Char Replacement', difficulty: 'Medium', pattern: 'Sliding Window' },
  { id: 2, title: 'Merge Intervals', difficulty: 'Medium', pattern: 'Merge Intervals' },
  { id: 3, title: 'Number of Islands', difficulty: 'Medium', pattern: 'Graph Traversal' },
];

const heatmapData = Array.from({ length: 52 * 7 }, () => ({
  count: Math.random() > 0.65 ? Math.floor(Math.random() * 6) : 0,
}));

function HeatCell({ count }: { count: number }) {
  const alpha = count === 0 ? 0 : count === 1 ? 0.25 : count <= 3 ? 0.55 : 0.9;
  return (
    <div
      className="heat-cell"
      style={{ background: count > 0 ? `rgba(248,159,27,${alpha})` : 'var(--surface2)' }}
      title={`${count} solved`}
    />
  );
}

const diffColor = (d: string) =>
  d === 'Easy' ? 'var(--easy)' : d === 'Medium' ? 'var(--medium)' : 'var(--hard)';

export default function Dashboard() {
  const user = useAuthStore(s => s.user);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const firstName = user?.fullName?.split(' ')[0] ?? 'there';

  const statCards = [
    { label: 'Problems Solved', value: '0', sub: '0 this week', icon: Code2, color: 'var(--primary)' },
    { label: 'Current Streak', value: `${user?.currentStreak ?? 0} days`, sub: 'Keep it up!', icon: Flame, color: '#f97316' },
    { label: 'Readiness Score', value: '0%', sub: 'Solve more problems', icon: Target, color: 'var(--success)' },
    { label: 'Total XP', value: `${user?.totalXp ?? 0}`, sub: `Level ${user?.currentLevel ?? 1}`, icon: TrendingUp, color: '#a78bfa' },
  ];

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Good {greeting}, {firstName} 👋</h1>
          <p className="sub">You have <strong>{revisionDue.length} revisions due</strong> and <strong>5 problems</strong> left in today's goal.</p>
        </div>
        <Link to="/dsa" className="btn-primary">Continue Practice</Link>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        {statCards.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: `${color}1a`, color }}>
              <Icon size={18} />
            </div>
            <div>
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
              <div className="stat-sub">{sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        {/* Pattern progress */}
        <section className="card">
          <div className="card-header">
            <div>
              <h2>DSA Patterns</h2>
              <p className="sub">Progress across 20 patterns</p>
            </div>
            <Link to="/dsa" className="card-link">View all <ChevronRight size={14} /></Link>
          </div>
          <div className="pattern-list">
            {patterns.map((p) => (
              <Link key={p.id} to={`/dsa/${p.id}`} className="pattern-row">
                <div className="pattern-dot" style={{ background: p.color }} />
                <div className="pattern-info">
                  <span>{p.name}</span>
                  <span className="text-dim">{p.solved}/{p.total}</span>
                </div>
                <div className="pattern-bar-wrap">
                  <div className="pattern-bar" style={{ width: `${(p.solved / p.total) * 100}%`, background: p.color }} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Revision queue */}
        <section className="card">
          <div className="card-header">
            <div>
              <h2>Due for Revision</h2>
              <p className="sub">SM-2 spaced repetition queue</p>
            </div>
            <span className="badge-pill">{revisionDue.length} due</span>
          </div>
          <div className="revision-list">
            {revisionDue.map((item) => (
              <Link key={item.id} to={`/problem/${item.id}`} className="revision-item">
                <div className="rev-left">
                  <RotateCcw size={14} className="rev-icon" />
                  <div>
                    <div className="rev-title">{item.title}</div>
                    <div className="rev-meta">{item.pattern}</div>
                  </div>
                </div>
                <span className="diff-badge" style={{ color: diffColor(item.difficulty) }}>
                  {item.difficulty}
                </span>
              </Link>
            ))}
          </div>
          <Link to="/dsa" className="btn-outline full-width mt-12">Start Revising</Link>
        </section>

        {/* Today's goal */}
        <section className="card goal-card">
          <div className="card-header">
            <div>
              <h2>Today's Goal</h2>
              <p className="sub">Daily target: {user ? 5 : '—'} problems</p>
            </div>
          </div>
          <div className="goal-ring-wrap">
            <svg className="goal-ring" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border)" strokeWidth="7" />
              <circle
                cx="40" cy="40" r="34" fill="none"
                stroke="var(--primary)" strokeWidth="7"
                strokeDasharray={`${2 * Math.PI * 34 * 0.6} ${2 * Math.PI * 34}`}
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
              />
            </svg>
            <div className="goal-inner">
              <span className="goal-num">0/5</span>
              <span className="goal-sub">done</span>
            </div>
          </div>
          <div className="goal-items">
            {['Solve 2 Easy problems', 'Complete 1 Medium', 'Solve 1 Hard', 'Review 1 revision', 'Take aptitude quiz'].map((g) => (
              <div key={g} className="goal-item">
                <span className="goal-check">○</span>
                {g}
              </div>
            ))}
          </div>
        </section>

        {/* Contribution heatmap */}
        <section className="card heatmap-card">
          <div className="card-header">
            <div>
              <h2>Activity</h2>
              <p className="sub">Problems solved in the last year</p>
            </div>
          </div>
          <div className="heatmap-grid">
            {heatmapData.map((cell, i) => (
              <HeatCell key={i} count={cell.count} />
            ))}
          </div>
          <div className="heatmap-legend">
            <span>Less</span>
            {[0, 0.2, 0.45, 0.7, 0.95].map((a) => (
              <div key={a} className="heat-cell" style={{ background: a === 0 ? 'var(--surface2)' : `rgba(248,159,27,${a})` }} />
            ))}
            <span>More</span>
          </div>
        </section>

        {/* Company readiness */}
        <section className="card companies-card">
          <div className="card-header">
            <div>
              <h2>Company Readiness</h2>
              <p className="sub">Based on solved problem tags</p>
            </div>
          </div>
          <div className="company-list">
            {[
              { name: 'Amazon', pct: 74, tag: 'SDE Intern' },
              { name: 'TCS NQT', pct: 88, tag: 'Digital' },
              { name: 'Infosys', pct: 82, tag: 'Specialist' },
              { name: 'Microsoft', pct: 56, tag: 'SDE' },
              { name: 'Flipkart', pct: 61, tag: 'SDE-1' },
            ].map(({ name, pct, tag }) => (
              <div key={name} className="company-row">
                <div className="company-info">
                  <span className="company-name">{name}</span>
                  <span className="company-tag">{tag}</span>
                </div>
                <div className="company-bar-wrap">
                  <div className="company-bar" style={{ width: `${pct}%`, background: pct > 75 ? 'var(--success)' : pct > 55 ? 'var(--primary)' : 'var(--error)' }} />
                </div>
                <span className="company-pct">{pct}%</span>
              </div>
            ))}
          </div>
        </section>

        {/* Cheatsheet Slideshow */}
        <CheatsheetSlideshow />
      </div>
    </div>
  );
}
