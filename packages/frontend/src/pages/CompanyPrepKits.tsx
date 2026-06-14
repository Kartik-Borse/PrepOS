import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import './CompanyPrepKits.css';

const KITS = [
  {
    id: 'tcs-nqt', company: 'TCS NQT', logo: '🔵', color: '#3b82f6',
    rounds: ['Online Assessment (90 min)', 'Technical Interview', 'HR Round'],
    focus: 'Aptitude heavy, basic DSA, verbal',
    problems: [
      { id: 'lc-1', title: 'Two Sum', diff: 'Easy' },
      { id: 'lc-704', title: 'Binary Search', diff: 'Easy' },
      { id: 'c1', title: 'Reverse a Linked List', diff: 'Easy' },
      { id: 'lc-3', title: 'Longest Substring Without Repeating Chars', diff: 'Medium' },
    ],
    aptTopics: ['Time & Work', 'Speed Distance', 'Percentages', 'Blood Relations', 'Syllogisms'],
    csTopics: ['OS Scheduling', 'DBMS Normalization', 'OOP Concepts'],
  },
  {
    id: 'amazon', company: 'Amazon SDE', logo: '🟠', color: '#f97316',
    rounds: ['OA (2 DSA, 60 min)', 'Technical Screen x2', 'Bar Raiser', 'HR'],
    focus: 'Hard DSA, System Design, LP principles',
    problems: [
      { id: 'lc-3', title: 'Longest Substring Without Repeating Chars', diff: 'Medium' },
      { id: 'lc-200', title: 'Number of Islands', diff: 'Medium' },
      { id: 'lc-42', title: 'Trapping Rain Water', diff: 'Hard' },
      { id: 'lc-33', title: 'Search in Rotated Sorted Array', diff: 'Medium' },
      { id: 'lc-322', title: 'Coin Change', diff: 'Medium' },
    ],
    aptTopics: ['Leadership Principles (14 LPs)', 'STAR format answers'],
    csTopics: ['System Design: URL Shortener', 'System Design: WhatsApp', 'HLD Concepts'],
  },
  {
    id: 'infosys', company: 'Infosys SP', logo: '🟢', color: '#10b981',
    rounds: ['Online Test (120 min)', 'Technical Interview', 'HR Interview'],
    focus: 'Aptitude, verbal, basic programming',
    problems: [
      { id: 'lc-1', title: 'Two Sum', diff: 'Easy' },
      { id: 'c2', title: 'Find duplicates in array', diff: 'Easy' },
      { id: 'lc-704', title: 'Binary Search', diff: 'Easy' },
    ],
    aptTopics: ['Quantitative', 'Verbal Ability', 'Logical Reasoning', 'Pseudo-code questions'],
    csTopics: ['OOP: Inheritance, Polymorphism', 'SQL Joins', 'Computer Networks Basics'],
  },
  {
    id: 'microsoft', company: 'Microsoft SDE', logo: '🔷', color: '#0ea5e9',
    rounds: ['Coding Round (1h)', 'Technical Loop x3', 'As-Appropriate'],
    focus: 'Data Structures, Algorithms, System Design',
    problems: [
      { id: 'lc-3', title: 'Longest Substring Without Repeating Chars', diff: 'Medium' },
      { id: 'lc-15', title: 'Three Sum', diff: 'Medium' },
      { id: 'lc-322', title: 'Coin Change', diff: 'Medium' },
      { id: 'lc-200', title: 'Number of Islands', diff: 'Medium' },
    ],
    aptTopics: ['Growth mindset Q&A', 'Behavioral scenarios'],
    csTopics: ['System Design: File Storage', 'DBMS Transactions', 'OS Memory Management'],
  },
  {
    id: 'google', company: 'Google SDE', logo: '🔴', color: '#ef4444',
    rounds: ['Phone Screen (45 min)', 'Onsite x4-5', 'Hiring Committee'],
    focus: 'Hard DSA, Scalability, Code quality',
    problems: [
      { id: 'lc-42', title: 'Trapping Rain Water', diff: 'Hard' },
      { id: 'lc-33', title: 'Search in Rotated Sorted Array', diff: 'Medium' },
      { id: 'lc-322', title: 'Coin Change', diff: 'Medium' },
      { id: 'lc-200', title: 'Number of Islands', diff: 'Medium' },
    ],
    aptTopics: ['Googleyness & Leadership', 'Cognitive ability'],
    csTopics: ['System Design: Netflix', 'Distributed Systems', 'Complexity Analysis'],
  },
];

const diffColor = (d: string) => d === 'Easy' ? 'var(--easy)' : d === 'Medium' ? 'var(--medium)' : 'var(--hard)';

export default function CompanyPrepKits() {
  const { solvedProblems } = useAppStore();
  const [active, setActive] = useState(KITS[0].id);
  const kit = KITS.find((k) => k.id === active) ?? KITS[0];
  const solvedCount = kit.problems.filter((p) => solvedProblems[p.id]).length;
  const readiness = Math.round((solvedCount / kit.problems.length) * 100);

  return (
    <div className="company-prep-page">
      <div className="cp-header">
        <div><h1>Company Prep Kits</h1><p className="sub">Curated prep tracks for top companies</p></div>
      </div>

      <div className="cp-layout">
        {/* Company sidebar */}
        <div className="cp-sidebar">
          {KITS.map((kit) => {
            const sc = kit.problems.filter((p) => solvedProblems[p.id]).length;
            const pct = Math.round((sc / kit.problems.length) * 100);
            return (
              <button key={kit.id} className={`cp-company-btn ${active === kit.id ? 'active' : ''}`} style={active === kit.id ? { borderColor: kit.color, background: kit.color + '11' } : {}} onClick={() => setActive(kit.id)}>
                <span className="cpb-logo">{kit.logo}</span>
                <div className="cpb-info">
                  <span className="cpb-name">{kit.company}</span>
                  <div className="cpb-bar-wrap">
                    <div className="cpb-bar" style={{ width: `${pct}%`, background: kit.color }} />
                  </div>
                </div>
                <span className="cpb-pct" style={{ color: kit.color }}>{pct}%</span>
              </button>
            );
          })}
        </div>

        {/* Kit detail */}
        <div className="cp-detail">
          {/* Header */}
          <div className="cpd-header" style={{ borderColor: kit.color + '44' }}>
            <div className="cpd-logo">{kit.logo}</div>
            <div>
              <h2>{kit.company}</h2>
              <p className="cpd-focus">{kit.focus}</p>
            </div>
            <div className="cpd-readiness">
              <svg viewBox="0 0 60 60" width="60" height="60">
                <circle cx="30" cy="30" r="24" fill="none" stroke="var(--border)" strokeWidth="5" />
                <circle cx="30" cy="30" r="24" fill="none" stroke={kit.color} strokeWidth="5"
                  strokeDasharray={`${2 * Math.PI * 24 * readiness / 100} ${2 * Math.PI * 24}`}
                  strokeLinecap="round" transform="rotate(-90 30 30)" />
              </svg>
              <div className="cpr-inner">
                <span style={{ color: kit.color, fontWeight: 800, fontSize: 14 }}>{readiness}%</span>
                <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>ready</span>
              </div>
            </div>
          </div>

          {/* Interview rounds */}
          <div className="cpd-section">
            <h3>Interview Rounds</h3>
            <div className="rounds-list">
              {kit.rounds.map((r, i) => (
                <div key={i} className="round-pill">
                  <span className="round-num">{i + 1}</span>
                  {r}
                </div>
              ))}
            </div>
          </div>

          {/* DSA Problems */}
          <div className="cpd-section">
            <h3>Must-Solve DSA Problems ({solvedCount}/{kit.problems.length})</h3>
            <div className="kit-problems">
              {kit.problems.map((p) => {
                const solved = !!solvedProblems[p.id];
                return (
                  <Link key={p.id} to={`/problem/${p.id}`} className={`kit-prob-row ${solved ? 'solved' : ''}`}>
                    <div className="kpr-status">{solved ? <CheckCircle2 size={14} style={{ color: 'var(--success)' }} /> : <span className="kpr-empty" />}</div>
                    <span className="kpr-title">{p.title}</span>
                    <span style={{ color: diffColor(p.diff), fontSize: 12, fontWeight: 600 }}>{p.diff}</span>
                    <ChevronRight size={14} style={{ color: 'var(--text-faint)' }} />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Aptitude topics */}
          <div className="cpd-section">
            <h3>Aptitude / HR Focus</h3>
            <div className="topic-chips">
              {kit.aptTopics.map((t) => <span key={t} className="topic-chip apt">{t}</span>)}
            </div>
          </div>

          {/* CS topics */}
          <div className="cpd-section">
            <h3>Core CS Topics</h3>
            <div className="topic-chips">
              {kit.csTopics.map((t) => <span key={t} className="topic-chip cs">{t}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
