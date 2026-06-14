import { useState } from 'react';
import { CalendarDays, CheckCircle2, Circle, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import './StudyPlan.css';

const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced'];
const COMPANIES = ['Amazon', 'Google', 'Microsoft', 'Infosys', 'TCS', 'Wipro', 'Flipkart', 'Adobe'];
const PATTERNS = ['Sliding Window', 'Dynamic Programming', 'Graph Traversal', 'Trees', 'Binary Search', 'Two Pointers', 'Backtracking'];

export default function StudyPlan() {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [showConfig, setShowConfig] = useState(true);

  // Config state
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [skillLevel, setSkillLevel] = useState('intermediate');
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(['Amazon']);
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>(['Dynamic Programming']);

  const toggleSet = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, arr: T[], val: T) =>
    setter(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

  const generate = async () => {
    setLoading(true);
    setError('');
    setCompletedTasks(new Set());
    try {
      const { plan: p } = await api.generateStudyPlan({
        targetDate,
        hoursPerDay,
        skillLevel,
        targetCompanies: selectedCompanies,
        weakPatterns: selectedPatterns,
      });
      setPlan(p);
      setShowConfig(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (key: string) =>
    setCompletedTasks(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

  const daysLeft = Math.max(0, Math.ceil((new Date(targetDate).getTime() - Date.now()) / 86400000));

  return (
    <div className="study-plan-page">
      <div className="sp-header">
        <div>
          <h1>Study Plan</h1>
          <p className="sub">AI-generated plan · {daysLeft} days to target date</p>
        </div>
        {plan && (
          <button className="btn-primary-sm" onClick={() => setShowConfig(true)}>
            <Sparkles size={13} /> Regenerate
          </button>
        )}
      </div>

      {/* Config panel */}
      {showConfig && (
        <div className="sp-config-card">
          <h3><Sparkles size={15} /> Configure Your Plan</h3>

          <div className="sp-config-grid">
            <div className="sp-field">
              <label>Target Date</label>
              <input type="date" value={targetDate} min={new Date().toISOString().split('T')[0]}
                onChange={e => setTargetDate(e.target.value)} />
            </div>
            <div className="sp-field">
              <label>Hours / Day: <strong>{hoursPerDay}h</strong></label>
              <input type="range" min={1} max={8} value={hoursPerDay}
                onChange={e => setHoursPerDay(+e.target.value)} />
            </div>
          </div>

          <div className="sp-field">
            <label>Skill Level</label>
            <div className="sp-toggle-group">
              {SKILL_LEVELS.map(s => (
                <button key={s} className={`sp-toggle ${skillLevel === s ? 'active' : ''}`}
                  onClick={() => setSkillLevel(s)} style={{ textTransform: 'capitalize' }}>{s}</button>
              ))}
            </div>
          </div>

          <div className="sp-field">
            <label>Target Companies</label>
            <div className="sp-chips">
              {COMPANIES.map(c => (
                <button key={c} className={`sp-chip-btn ${selectedCompanies.includes(c) ? 'active' : ''}`}
                  onClick={() => toggleSet(setSelectedCompanies, selectedCompanies, c)}>{c}</button>
              ))}
            </div>
          </div>

          <div className="sp-field">
            <label>Weak Areas (focus on these)</label>
            <div className="sp-chips">
              {PATTERNS.map(p => (
                <button key={p} className={`sp-chip-btn ${selectedPatterns.includes(p) ? 'active' : ''}`}
                  onClick={() => toggleSet(setSelectedPatterns, selectedPatterns, p)}>{p}</button>
              ))}
            </div>
          </div>

          {error && (
            <div className="sp-error"><AlertCircle size={14} />
              {error.includes('GEMINI_API_KEY') ? 'Add GEMINI_API_KEY to packages/backend/.env to enable AI.' : error}
            </div>
          )}

          <button className="sp-generate-btn" onClick={generate} disabled={loading}>
            {loading ? <><Loader2 size={15} className="spin" /> Generating with Gemini…</> : <><Sparkles size={15} /> Generate My Plan</>}
          </button>
        </div>
      )}

      {/* Generated plan */}
      {plan && !showConfig && (
        <>
          <div className="sp-overview-card">
            <p>{plan.overview}</p>
            <div className="sp-meta-row">
              <span className="sp-chip"><CalendarDays size={13} /> {daysLeft} days</span>
              <span className="sp-chip">⏱ {hoursPerDay}h/day</span>
              <span className="sp-chip" style={{ textTransform: 'capitalize' }}>📈 {skillLevel}</span>
              {selectedCompanies.slice(0, 2).map(c => <span key={c} className="sp-chip">🏢 {c}</span>)}
            </div>
          </div>

          {/* Phases */}
          {plan.phases?.length > 0 && (
            <div className="sp-section">
              <h2>Phases</h2>
              <div className="sp-phases">
                {plan.phases.map((phase: any, pi: number) => (
                  <div key={pi} className="sp-phase-card">
                    <div className="sp-phase-header">
                      <span className="sp-phase-num">{pi + 1}</span>
                      <div>
                        <div className="sp-phase-name">{phase.name}</div>
                        <div className="sp-phase-days">{phase.days} · {phase.focus}</div>
                      </div>
                    </div>
                    <ul className="sp-phase-tasks">
                      {phase.dailyTasks?.map((t: string, ti: number) => (
                        <li key={ti}>{t}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weekly schedule */}
          {plan.weeklySchedule && (
            <div className="sp-section">
              <h2>Weekly Schedule</h2>
              <div className="sp-week-grid">
                {Object.entries(plan.weeklySchedule).map(([day, tasks]: [string, any]) => (
                  <div key={day} className="sp-week-day">
                    <div className="sp-week-day-label">{day.charAt(0).toUpperCase() + day.slice(1)}</div>
                    {(tasks as string[]).map((t: string, ti: number) => {
                      const key = `week-${day}-${ti}`;
                      const done = completedTasks.has(key);
                      return (
                        <button key={ti} className={`sp-task ${done ? 'done' : ''}`} onClick={() => toggle(key)}>
                          {done ? <CheckCircle2 size={13} style={{ color: 'var(--success)', flexShrink: 0 }} /> : <Circle size={13} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />}
                          <span>{t}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Milestones + Tips */}
          <div className="sp-bottom-grid">
            {plan.milestones?.length > 0 && (
              <div className="sp-section">
                <h2>Milestones</h2>
                <div className="sp-timeline">
                  {plan.milestones.map((m: any, i: number) => (
                    <div key={i} className="sp-milestone">
                      <div className="sp-ms-day">Day {m.day}</div>
                      <div className="sp-ms-goal">{m.goal}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {plan.tips?.length > 0 && (
              <div className="sp-section">
                <h2>Pro Tips</h2>
                <ul className="sp-tips">
                  {plan.tips.map((tip: string, i: number) => <li key={i}>{tip}</li>)}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
