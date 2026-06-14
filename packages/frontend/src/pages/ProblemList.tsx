import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Circle, RotateCcw, Star, Link2 } from 'lucide-react';
import { useState } from 'react';
import LeetcodeImport from '../components/LeetcodeImport';
import './ProblemList.css';

const problems = [
  { id: 1, title: 'Maximum Average Subarray I', difficulty: 'Easy', acceptance: 46, companies: ['Google', 'Amazon'], status: 'solved', bookmarked: false },
  { id: 2, title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', acceptance: 34, companies: ['Amazon', 'Microsoft', 'Adobe'], status: 'revision', bookmarked: true },
  { id: 3, title: 'Minimum Size Subarray Sum', difficulty: 'Medium', acceptance: 45, companies: ['Facebook'], status: 'solved', bookmarked: false },
  { id: 4, title: 'Longest Repeating Character Replacement', difficulty: 'Medium', acceptance: 52, companies: ['Google'], status: 'revision', bookmarked: false },
  { id: 5, title: 'Permutation in String', difficulty: 'Medium', acceptance: 45, companies: ['Microsoft', 'Amazon'], status: 'solved', bookmarked: false },
  { id: 6, title: 'Minimum Window Substring', difficulty: 'Hard', acceptance: 41, companies: ['Google', 'Facebook', 'Amazon'], status: 'unsolved', bookmarked: false },
  { id: 7, title: 'Sliding Window Maximum', difficulty: 'Hard', acceptance: 47, companies: ['Amazon', 'Google', 'Uber'], status: 'unsolved', bookmarked: true },
  { id: 8, title: 'Fruit Into Baskets', difficulty: 'Medium', acceptance: 43, companies: ['Google', 'Facebook'], status: 'unsolved', bookmarked: false },
  { id: 9, title: 'Find All Anagrams in a String', difficulty: 'Medium', acceptance: 49, companies: ['Amazon', 'Spotify'], status: 'unsolved', bookmarked: false },
  { id: 10, title: 'Longest Subarray with Ones after Replacement', difficulty: 'Medium', acceptance: 57, companies: ['Google'], status: 'unsolved', bookmarked: false },
];

const patternNames: Record<string, string> = {
  'sliding-window': 'Sliding Window',
  'two-pointers': 'Two Pointers',
  'dynamic-programming': 'Dynamic Programming',
  'graph-traversal': 'Graph Traversal',
  'binary-search': 'Modified Binary Search',
};

type Status = 'all' | 'solved' | 'revision' | 'unsolved';
type Difficulty = 'All' | 'Easy' | 'Medium' | 'Hard';

const diffColor = (d: string) =>
  d === 'Easy' ? 'var(--easy)' : d === 'Medium' ? 'var(--medium)' : 'var(--hard)';

const StatusIcon = ({ s }: { s: string }) =>
  s === 'solved' ? <CheckCircle2 size={15} style={{ color: 'var(--success)' }} /> :
  s === 'revision' ? <RotateCcw size={15} style={{ color: 'var(--warning)' }} /> :
  <Circle size={15} style={{ color: 'var(--text-faint)' }} />;

export default function ProblemList() {
  const { patternId = 'sliding-window' } = useParams();
  const [filter, setFilter] = useState<Difficulty>('All');
  const [statusFilter, setStatusFilter] = useState<Status>('all');
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set([2, 7]));
  const [showLCImport, setShowLCImport] = useState(false);

  const patternName = patternNames[patternId] ?? patternId;

  const filtered = problems.filter(p =>
    (filter === 'All' || p.difficulty === filter) &&
    (statusFilter === 'all' || p.status === statusFilter)
  );

  const toggleBookmark = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    setBookmarks(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <>
    <div className="problem-list-page">
      <div className="plp-header">
        <Link to="/dsa" className="back-link">← DSA Patterns</Link>
        <h1>{patternName}</h1>
        <p className="sub">{problems.length} problems</p>
        <button className="btn-lc-import-sm" onClick={() => setShowLCImport(true)}>
          <Link2 size={13} /> Import from LeetCode
        </button>
      </div>

      <div className="plp-filters">
        <div className="filter-group">
          {(['All', 'Easy', 'Medium', 'Hard'] as Difficulty[]).map(d => (
            <button key={d} className={`filter-btn ${filter === d ? 'active' : ''}`} onClick={() => setFilter(d)}>
              {d}
            </button>
          ))}
        </div>
        <div className="filter-group">
          {(['all', 'solved', 'revision', 'unsolved'] as Status[]).map(s => (
            <button key={s} className={`filter-btn ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="problem-table">
        <div className="pt-head">
          <span className="col-status">Status</span>
          <span className="col-title">Title</span>
          <span className="col-diff">Difficulty</span>
          <span className="col-acc">Acceptance</span>
          <span className="col-comp">Companies</span>
          <span className="col-bm" />
        </div>

        {filtered.map((p) => (
          <Link key={p.id} to={`/problem/${p.id}`} className="pt-row">
            <span className="col-status"><StatusIcon s={p.status} /></span>
            <span className="col-title">{p.title}</span>
            <span className="col-diff" style={{ color: diffColor(p.difficulty) }}>{p.difficulty}</span>
            <span className="col-acc">{p.acceptance}%</span>
            <span className="col-comp">
              {p.companies.slice(0, 3).map(c => (
                <span key={c} className="company-chip">{c}</span>
              ))}
              {p.companies.length > 3 && <span className="company-chip">+{p.companies.length - 3}</span>}
            </span>
            <span className="col-bm">
              <button
                className={`bm-btn ${bookmarks.has(p.id) ? 'bookmarked' : ''}`}
                onClick={(e) => toggleBookmark(p.id, e)}
                aria-label={bookmarks.has(p.id) ? 'Remove bookmark' : 'Bookmark'}
              >
                <Star size={14} fill={bookmarks.has(p.id) ? 'var(--primary)' : 'none'} />
              </button>
            </span>
          </Link>
        ))}
      </div>
    </div>

    {showLCImport && (
      <LeetcodeImport onClose={() => setShowLCImport(false)} />
    )}
    </>
  );
}
