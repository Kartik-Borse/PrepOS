import { useState } from 'react';
import { CheckCircle2, Trash2, Plus, X, AlertCircle } from 'lucide-react';
import { useAppStore, MistakeEntry } from '../store/useAppStore';
import './MistakeJournal.css';

const MISTAKE_TYPES: MistakeEntry['mistakeType'][] = [
  'Wrong logic', 'Edge case missed', 'TLE', 'Off-by-one', 'Wrong data structure', 'Other',
];

const TYPE_COLOR: Record<string, string> = {
  'Wrong logic': '#ef4444', 'Edge case missed': '#f59e0b', 'TLE': '#a855f7',
  'Off-by-one': '#f97316', 'Wrong data structure': '#3b82f6', 'Other': '#6b7280',
};

const TYPE_DESC: Record<string, string> = {
  'Wrong logic':          'Your core algorithm was incorrect — the approach itself doesn\'t solve the problem.',
  'Edge case missed':     'Solution worked for main cases but failed on boundary inputs like empty arrays, negatives, or single elements.',
  'TLE':                  'Time Limit Exceeded — your solution is too slow (likely O(n²) or worse where O(n log n) is needed).',
  'Off-by-one':           'Index was one too high or too low — common in loops, binary search, and sliding window boundaries.',
  'Wrong data structure': 'Used an array when you needed a hashmap, or a stack when a queue was needed — wrong tool for the job.',
  'Other':                'Miscellaneous mistake — syntax error, wrong output format, or something that doesn\'t fit the categories above.',
};

function AddMistakeModal({ onClose, onAdd }: { onClose: () => void; onAdd: (m: MistakeEntry) => void }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<MistakeEntry['mistakeType']>('Wrong logic');
  const [note, setNote] = useState('');

  const submit = () => {
    if (!title.trim()) return;
    onAdd({
      id: crypto.randomUUID(), problemId: 'manual-' + Date.now(),
      problemTitle: title.trim(), patternId: '', difficulty: 'Medium',
      mistakeType: type, note: note.trim(),
      date: new Date().toISOString(), resolved: false,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Log a Mistake</h3>
          <button onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="form-field">
            <label>Problem Name *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Merge Intervals" autoFocus />
          </div>
          <div className="form-field">
            <label>Mistake Type</label>
            <div className="type-grid">
              {MISTAKE_TYPES.map((t) => (
                <button key={t} className={`type-chip ${type === t ? 'active' : ''}`}
                  style={type === t ? { background: TYPE_COLOR[t] + '22', color: TYPE_COLOR[t], borderColor: TYPE_COLOR[t] } : {}}
                  onClick={() => setType(t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="form-field">
            <label>What went wrong? How to fix?</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Forgot to handle empty array. Should check if arr.length === 0 first." rows={3} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-primary-sm" onClick={submit} disabled={!title.trim()}>Log Mistake</button>
        </div>
      </div>
    </div>
  );
}

export default function MistakeJournal() {
  const { mistakes, addMistake, resolveMistake, deleteMistake } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  const filtered = mistakes.filter((m) => {
    const matchStatus = filter === 'all' || (filter === 'open' ? !m.resolved : m.resolved);
    const matchType = typeFilter === 'All' || m.mistakeType === typeFilter;
    return matchStatus && matchType;
  });

  const typeCounts = MISTAKE_TYPES.reduce<Record<string, number>>((acc, t) => {
    acc[t] = mistakes.filter((m) => m.mistakeType === t && !m.resolved).length;
    return acc;
  }, {});

  return (
    <div className="mistake-journal-page">
      <div className="mj-header">
        <div>
          <h1>Mistake Journal</h1>
          <p className="sub">Track what went wrong and learn from every attempt</p>
        </div>
        <button className="btn-add" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> Log Mistake
        </button>
      </div>

      {/* Type breakdown */}
      <div className="mj-type-grid">
        <button className={`mj-type-card ${typeFilter === 'All' ? 'active' : ''}`} onClick={() => setTypeFilter('All')}>
          <span className="mtc-count">{mistakes.filter((m) => !m.resolved).length}</span>
          <span className="mtc-label">All Open</span>
          <span className="mtc-desc">All unresolved mistakes across every category</span>
        </button>
        {MISTAKE_TYPES.map((t) => (
          <button key={t} className={`mj-type-card ${typeFilter === t ? 'active' : ''}`}
            onClick={() => setTypeFilter(t)}
            style={typeFilter === t ? { borderColor: TYPE_COLOR[t], background: TYPE_COLOR[t] + '11' } : {}}>
            <span className="mtc-count" style={{ color: TYPE_COLOR[t] }}>{typeCounts[t]}</span>
            <span className="mtc-label">{t}</span>
            <span className="mtc-desc">{TYPE_DESC[t]}</span>
          </button>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="mj-filter-row">
        {(['all', 'open', 'resolved'] as const).map((f) => (
          <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? `All (${mistakes.length})` : f === 'open' ? `Open (${mistakes.filter(m => !m.resolved).length})` : `Resolved (${mistakes.filter(m => m.resolved).length})`}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="mj-list">
        {filtered.length === 0 && (
          <div className="mj-empty">
            <AlertCircle size={32} style={{ color: 'var(--text-faint)' }} />
            <p>No mistakes logged yet — that's either great or suspicious 😄</p>
            <button className="btn-add" onClick={() => setShowAdd(true)}><Plus size={13} /> Log your first mistake</button>
          </div>
        )}
        {filtered.map((m) => (
          <div key={m.id} className={`mj-item ${m.resolved ? 'resolved' : ''}`}>
            <div className="mji-top">
              <div className="mji-left">
                <span className="mji-type" style={{ background: TYPE_COLOR[m.mistakeType] + '1a', color: TYPE_COLOR[m.mistakeType], borderColor: TYPE_COLOR[m.mistakeType] + '44' }}>
                  {m.mistakeType}
                </span>
                <span className="mji-title">{m.problemTitle}</span>
                {m.resolved && <span className="resolved-badge">✓ Resolved</span>}
              </div>
              <div className="mji-actions">
                <span className="mji-date">{new Date(m.date).toLocaleDateString()}</span>
                {!m.resolved && (
                  <button className="mji-btn resolve" onClick={() => resolveMistake(m.id)} title="Mark resolved">
                    <CheckCircle2 size={14} />
                  </button>
                )}
                <button className="mji-btn del" onClick={() => deleteMistake(m.id)} title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            {m.note && <p className="mji-note">{m.note}</p>}
          </div>
        ))}
      </div>

      {showAdd && <AddMistakeModal onClose={() => setShowAdd(false)} onAdd={addMistake} />}
    </div>
  );
}
