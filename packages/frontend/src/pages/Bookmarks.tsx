import { Link } from 'react-router-dom';
import { Star, CheckCircle2, RotateCcw, Circle } from 'lucide-react';
import './Bookmarks.css';

const bookmarked = [
  { id: 2, title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', pattern: 'Sliding Window', status: 'revision' },
  { id: 7, title: 'Sliding Window Maximum', difficulty: 'Hard', pattern: 'Sliding Window', status: 'unsolved' },
  { id: 12, title: 'Kth Largest Element in an Array', difficulty: 'Medium', pattern: 'Top K Elements', status: 'solved' },
  { id: 15, title: 'Word Ladder', difficulty: 'Hard', pattern: 'Graph Traversal', status: 'unsolved' },
  { id: 18, title: 'Coin Change', difficulty: 'Medium', pattern: 'Dynamic Programming', status: 'solved' },
  { id: 23, title: 'LRU Cache', difficulty: 'Medium', pattern: 'HashMap / Frequency Count', status: 'revision' },
];

const diffColor = (d: string) =>
  d === 'Easy' ? 'var(--easy)' : d === 'Medium' ? 'var(--medium)' : 'var(--hard)';

const StatusIcon = ({ s }: { s: string }) =>
  s === 'solved' ? <CheckCircle2 size={14} style={{ color: 'var(--success)' }} /> :
  s === 'revision' ? <RotateCcw size={14} style={{ color: 'var(--warning)' }} /> :
  <Circle size={14} style={{ color: 'var(--text-faint)' }} />;

export default function Bookmarks() {
  return (
    <div className="bookmarks-page">
      <div className="page-header-row">
        <div>
          <h1>Bookmarked Problems</h1>
          <p className="sub">{bookmarked.length} problems saved</p>
        </div>
      </div>

      <div className="bm-list">
        {bookmarked.map(p => (
          <Link key={p.id} to={`/problem/${p.id}`} className="bm-row">
            <StatusIcon s={p.status} />
            <div className="bm-info">
              <span className="bm-title">{p.title}</span>
              <span className="bm-pattern">{p.pattern}</span>
            </div>
            <span className="bm-diff" style={{ color: diffColor(p.difficulty) }}>{p.difficulty}</span>
            <Star size={14} fill="var(--primary)" style={{ color: 'var(--primary)', flexShrink: 0 }} />
          </Link>
        ))}
      </div>
    </div>
  );
}
