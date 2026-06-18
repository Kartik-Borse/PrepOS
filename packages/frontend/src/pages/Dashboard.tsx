import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Code2, ChevronRight, RotateCcw, Target, TrendingUp, Settings } from 'lucide-react';
import CheatsheetSlideshow from '../components/CheatsheetSlideshow';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import './Dashboard.css';

const patterns = [
  { id: 'sliding-window', name: 'Sliding Window', solved: 18, total: 30, color: '#06b6d4' },
  { id: 'two-pointers', name: 'Two Pointers', solved: 22, total: 28, color: '#8b5cf6' },
  { id: 'dynamic-programming', name: 'Dynamic Programming', solved: 9, total: 45, color: '#f59e0b' },
  { id: 'graph-traversal', name: 'Graph Traversal', solved: 14, total: 35, color: '#10b981' },
  { id: 'binary-search', name: 'Modified Binary Search', solved: 19, total: 26, color: '#f97316' },
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
  const { solvedProblems, attempts, dashboardConfig, hideWidget, unhideWidget, reorderWidgets } = useAppStore();
  const [showSettings, setShowSettings] = useState(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const firstName = user?.fullName?.split(' ')[0] ?? 'there';

  const solvedCount = Object.keys(solvedProblems).length;
  const solvedThisWeek = Object.values(solvedProblems).filter(p => new Date(p.solvedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
  const solvedToday = Object.values(solvedProblems).filter(p => new Date(p.solvedAt) > new Date(new Date().setHours(0,0,0,0))).length;
  const totalXp = solvedCount * 25;
  const readiness = Math.min(100, Math.floor((solvedCount / 150) * 100));
  
  const getTitle = (id: string) => attempts.find(a => a.problemId === id)?.problemTitle || id;
  const getPattern = (id: string) => attempts.find(a => a.problemId === id)?.patternId || 'Revision';

  const revisionDueList = Object.entries(solvedProblems)
    .filter(([_, data]) => data.nextRevisionAt && new Date(data.nextRevisionAt) <= new Date())
    .map(([id, _]) => ({ id, title: getTitle(id), difficulty: 'Medium', pattern: getPattern(id) }));

  const statCards = [
    { label: 'Problems Solved', value: `${solvedCount}`, sub: `${solvedThisWeek} this week`, icon: Code2, color: 'var(--primary)' },
    { label: 'Current Streak', value: `${user?.currentStreak ?? 1} days`, sub: 'Keep it up!', icon: Flame, color: '#f97316' },
    { label: 'Readiness Score', value: `${readiness}%`, sub: 'Solve more problems', icon: Target, color: 'var(--success)' },
    { label: 'Total XP', value: `${totalXp}`, sub: `Level ${Math.floor(totalXp/100) + 1}`, icon: TrendingUp, color: '#a78bfa' },
  ];

  const toggleWidget = (id: string) => {
    if (dashboardConfig.hiddenWidgets.includes(id)) unhideWidget(id);
    else hideWidget(id);
  };

  const moveWidget = (index: number, dir: number) => {
    const newOrder = [...dashboardConfig.widgetOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index + dir];
    newOrder[index + dir] = temp;
    reorderWidgets(newOrder);
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Good {greeting}, {firstName} 👋</h1>
          <p className="sub">You have <strong>{revisionDueList.length} revisions due</strong> and <strong>{Math.max(0, dashboardConfig.dailyGoal.targetProblems - solvedToday)} problems</strong> left in today's goal.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-outline" onClick={() => setShowSettings(true)}><Settings size={16} /> Customize</button>
          <Link to="/dsa" className="btn-primary">Continue Practice</Link>
        </div>
      </div>

      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Customize Dashboard</h2>
            <p className="sub mb-4">Reorder or hide widgets</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {dashboardConfig.widgetOrder.map((w, i) => (
                <div key={w} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--surface2)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input type="checkbox" checked={!dashboardConfig.hiddenWidgets.includes(w)} onChange={() => toggleWidget(w)} />
                    <span style={{ textTransform: 'capitalize' }}>{w}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button disabled={i === 0} onClick={() => moveWidget(i, -1)} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }}>↑</button>
                    <button disabled={i === dashboardConfig.widgetOrder.length - 1} onClick={() => moveWidget(i, 1)} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }}>↓</button>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-primary full-width mt-4" onClick={() => setShowSettings(false)}>Done</button>
          </div>
        </div>
      )}

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
        {dashboardConfig.widgetOrder.filter(w => !dashboardConfig.hiddenWidgets.includes(w)).map(w => {
          if (w === 'patterns') return (
            <section key={w} className="card">
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
          );
          if (w === 'revision') return (
            <section key={w} className="card">
              <div className="card-header">
                <div>
                  <h2>Due for Revision</h2>
                  <p className="sub">Spaced repetition queue</p>
                </div>
                <span className="badge-pill">{revisionDueList.length} due</span>
              </div>
              <div className="revision-list">
                {revisionDueList.map((item) => (
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
          );
          if (w === 'goal') return (
            <section key={w} className="card goal-card">
              <div className="card-header">
                <div>
                  <h2>Today's Goal</h2>
                  <p className="sub">Daily target: {dashboardConfig.dailyGoal.targetProblems} problems</p>
                </div>
              </div>
              <div className="goal-ring-wrap">
                <svg className="goal-ring" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border)" strokeWidth="7" />
                  <circle
                    cx="40" cy="40" r="34" fill="none"
                    stroke="var(--primary)" strokeWidth="7"
                    strokeDasharray={`${2 * Math.PI * 34 * Math.min(1, solvedToday / dashboardConfig.dailyGoal.targetProblems)} ${2 * Math.PI * 34}`}
                    strokeLinecap="round"
                    transform="rotate(-90 40 40)"
                  />
                </svg>
                <div className="goal-inner">
                  <span className="goal-num">{solvedToday}/{dashboardConfig.dailyGoal.targetProblems}</span>
                  <span className="goal-sub">done</span>
                </div>
              </div>
              <div className="goal-items">
                {dashboardConfig.dailyGoal.tasks.map((g) => (
                  <div key={g} className="goal-item">
                    <span className="goal-check">○</span>
                    {g}
                  </div>
                ))}
              </div>
            </section>
          );
          if (w === 'heatmap') return (
            <section key={w} className="card heatmap-card">
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
          );
          if (w === 'companies') return (
            <section key={w} className="card companies-card">
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
          );
          if (w === 'cheatsheet') return <CheatsheetSlideshow key={w} />;
          return null;
        })}
      </div>
    </div>
  );
}
