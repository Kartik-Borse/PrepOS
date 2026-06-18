import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Circle, RotateCcw, Link2, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import LeetcodeImport from '../components/LeetcodeImport';
import { useAppStore, Problem } from '../store/useAppStore';
import { BUILTIN_PROBLEMS } from './DSAPatterns';
import './ProblemList.css';

// Map every built-in pattern id → display name
const PATTERN_NAMES: Record<string, string> = {
  'two-pointers':       'Two Pointers',
  'sliding-window':     'Sliding Window',
  'fast-slow-pointers': 'Fast & Slow Pointers',
  'merge-intervals':    'Merge Intervals',
  'cyclic-sort':        'Cyclic Sort',
  'reversal-ll':        'In-place Reversal of LinkedList',
  'tree-bfs':           'Tree BFS',
  'tree-dfs':           'Tree DFS',
  'two-heaps':          'Two Heaps',
  'backtracking':       'Subsets / Backtracking',
  'binary-search':      'Modified Binary Search',
  'bitwise':            'Bitwise XOR / Bit Manipulation',
  'top-k':              'Top K Elements',
  'k-way-merge':        'K-way Merge',
  'dp':                 'Dynamic Programming',
  'graph':              'Graph Traversal',
  'monotonic-stack':    'Monotonic Stack / Queue',
  'prefix-sum':         'Prefix Sum / Difference Array',
  'hashmap':            'HashMap / Frequency Count',
  'greedy':             'Greedy Algorithms',
};

type Status = 'all' | 'solved' | 'revision' | 'unsolved';
type Difficulty = 'All' | 'Easy' | 'Medium' | 'Hard';
type SortBy = 'latest' | 'difficulty' | 'title';

const diffColor = (d: string) =>
  d === 'Easy' ? 'var(--easy)' : d === 'Medium' ? 'var(--medium)' : 'var(--hard)';

const StatusIcon = ({ s }: { s: string }) =>
  s === 'solved'   ? <CheckCircle2 size={15} style={{ color: 'var(--success)' }} /> :
  s === 'revision' ? <RotateCcw    size={15} style={{ color: 'var(--warning)' }} /> :
                     <Circle       size={15} style={{ color: 'var(--text-faint)' }} />;

// ── Add Question Modal ─────────────────────────────────────────────────────────
function AddQuestionModal({
  patternId, patternName, onClose, onAdd,
}: {
  patternId: string; patternName: string;
  onClose: () => void; onAdd: (p: Problem) => void;
}) {
  const [title, setTitle]           = useState('');
  const [difficulty, setDifficulty] = useState<Problem['difficulty']>('Medium');
  const [lcLink, setLcLink]         = useState('');
  const [companies, setCompanies]   = useState('');

  const submit = () => {
    if (!title.trim()) return;
    onAdd({
      id: 'custom-' + Date.now(),
      title: title.trim(),
      difficulty,
      patternId,
      description: '',
      examples: [],
      constraints: [],
      testCases: [],
      companies: companies.split(',').map((c) => c.trim()).filter(Boolean),
      leetcodeLink: lcLink.trim() || undefined,
      addedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="plp-modal-overlay" onClick={onClose}>
      <div className="plp-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="plp-modal-header">
          <h3>Add Question to <span style={{ color: 'var(--primary)' }}>{patternName}</span></h3>
          <button onClick={onClose}><X size={16} /></button>
        </div>
        <div className="plp-modal-body">
          <div className="plp-form-field">
            <label>Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Container With Most Water" autoFocus />
          </div>
          <div className="plp-form-row2">
            <div className="plp-form-field">
              <label>Difficulty</label>
              <div className="plp-diff-toggle">
                {(['Easy', 'Medium', 'Hard'] as Problem['difficulty'][]).map((d) => (
                  <button
                    key={d}
                    className={`plp-diff-chip ${difficulty === d ? 'active' : ''} ${d.toLowerCase()}`}
                    onClick={() => setDifficulty(d)}
                  >{d}</button>
                ))}
              </div>
            </div>
            <div className="plp-form-field">
              <label>LeetCode Link</label>
              <input value={lcLink} onChange={(e) => setLcLink(e.target.value)} placeholder="https://leetcode.com/…" />
            </div>
          </div>
          <div className="plp-form-field">
            <label>Companies (comma separated)</label>
            <input value={companies} onChange={(e) => setCompanies(e.target.value)} placeholder="Google, Amazon, Microsoft" />
          </div>
        </div>
        <div className="plp-modal-footer">
          <button className="plp-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="plp-btn-primary" onClick={submit} disabled={!title.trim()}>Add Question</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ProblemList() {
  const { patternId = 'two-pointers' } = useParams();
  const navigate = useNavigate();

  const {
    customProblems, addProblem, deleteProblem,
    hiddenProblems, hideBuiltinProblem,
    solvedProblems,
    customPatterns,
  } = useAppStore();

  const [filter, setFilter]           = useState<Difficulty>('All');
  const [statusFilter, setStatusFilter] = useState<Status>('all');
  const [sortBy, setSortBy]           = useState<SortBy>('latest');
  const [showLCImport, setShowLCImport] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Problem | null>(null);

  // Pattern name (built-in or custom)
  const customPattern = customPatterns.find((p) => p.id === patternId);
  const patternName = customPattern?.name ?? PATTERN_NAMES[patternId] ?? patternId;

  // Build problem list for this pattern:
  // built-in (not hidden) + custom problems in this pattern
  const builtinForPattern = BUILTIN_PROBLEMS.filter(
    (p) => p.patternId === patternId && !hiddenProblems.includes(p.id)
  );
  const customForPattern = customProblems.filter((p) => p.patternId === patternId);

  // Sort: most recently solved first, then most recently added, then rest
  const sorted = [...builtinForPattern, ...customForPattern].sort((a, b) => {
    if (sortBy === 'latest') {
      const aS = solvedProblems[a.id];
      const bS = solvedProblems[b.id];
      if (aS && bS) return new Date(bS.solvedAt).getTime() - new Date(aS.solvedAt).getTime();
      if (aS) return -1;
      if (bS) return 1;
      const aA = a.addedAt ? new Date(a.addedAt).getTime() : 0;
      const bA = b.addedAt ? new Date(b.addedAt).getTime() : 0;
      return bA - aA;
    } else if (sortBy === 'difficulty') {
      const dMap = { Easy: 1, Medium: 2, Hard: 3 };
      return dMap[a.difficulty] - dMap[b.difficulty];
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  const filtered = sorted.filter((p) => {
    const matchDiff = filter === 'All' || p.difficulty === filter;
    const status = solvedProblems[p.id]?.status;
    const statusStr = status ?? 'unsolved';
    const matchStatus = statusFilter === 'all' || statusStr === statusFilter;
    return matchDiff && matchStatus;
  });

  const handleDelete = (problem: Problem) => {
    const isBuiltin = BUILTIN_PROBLEMS.some((b) => b.id === problem.id);
    if (isBuiltin) {
      hideBuiltinProblem(problem.id);
    } else {
      deleteProblem(problem.id);
    }
    setConfirmDelete(null);
  };

  return (
    <>
      <div className="problem-list-page">
        {/* Header */}
        <div className="plp-header">
          <Link to="/dsa" className="back-link">← DSA Patterns</Link>
          <h1>{patternName}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-dim)' }}>
            <span>{sorted.length} problems</span>
            <span>·</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', fontSize: '13px', cursor: 'pointer', outline: 'none' }}>
              <option value="latest">↓ Sorted by Latest Solve</option>
              <option value="difficulty">Sorted by Difficulty</option>
              <option value="title">Sorted by Title</option>
            </select>
          </div>
          <div className="plp-header-btns">
            <button className="btn-lc-import-sm" onClick={() => setShowLCImport(true)}>
              <Link2 size={13} /> Import from LeetCode
            </button>
            <button className="btn-add-q" onClick={() => setShowAddModal(true)}>
              <Plus size={13} /> Add Question
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="plp-filters">
          <div className="filter-group">
            {(['All', 'Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => (
              <button key={d} className={`filter-btn ${filter === d ? 'active' : ''}`} onClick={() => setFilter(d)}>
                {d}
              </button>
            ))}
          </div>
          <div className="filter-group">
            {(['all', 'solved', 'revision', 'unsolved'] as Status[]).map((s) => (
              <button key={s} className={`filter-btn ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="plp-stats">
          <span className="plp-stat-chip">{filtered.length} shown</span>
          <span className="plp-stat-chip easy-chip">{filtered.filter((p) => p.difficulty === 'Easy').length} Easy</span>
          <span className="plp-stat-chip medium-chip">{filtered.filter((p) => p.difficulty === 'Medium').length} Medium</span>
          <span className="plp-stat-chip hard-chip">{filtered.filter((p) => p.difficulty === 'Hard').length} Hard</span>
        </div>

        {/* Table */}
        <div className="problem-table">
          <div className="pt-head">
            <span className="col-status">Status</span>
            <span className="col-title">Title</span>
            <span className="col-diff">Difficulty</span>
            <span className="col-comp">Companies</span>
            <span className="col-lc" />
            <span className="col-del" />
          </div>

          {filtered.length === 0 && (
            <div className="pt-empty">No problems match your filters.</div>
          )}

          {filtered.map((p) => {
            const status = solvedProblems[p.id]?.status;
            const latestSolve = solvedProblems[p.id];

            return (
              <div
                key={p.id}
                className="pt-row"
                onClick={() => navigate(`/problem/${p.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/problem/${p.id}`)}
              >
                <span className="col-status"><StatusIcon s={status ?? 'unsolved'} /></span>
                <span className="col-title">
                  {p.title}
                  {latestSolve && (
                    <span className="solved-time-badge">
                      {latestSolve.status === 'solved' ? '✓' : '↻'} {timeAgo(latestSolve.solvedAt)}
                    </span>
                  )}
                </span>
                <span className="col-diff" style={{ color: diffColor(p.difficulty) }}>{p.difficulty}</span>
                <span className="col-comp">
                  {p.companies.slice(0, 2).map((c) => (
                    <span key={c} className="company-chip">{c}</span>
                  ))}
                  {p.companies.length > 2 && <span className="company-chip">+{p.companies.length - 2}</span>}
                </span>
                <span className="col-lc">
                  {p.leetcodeLink && (
                    <a href={p.leetcodeLink} target="_blank" rel="noreferrer" className="lc-badge" onClick={(e) => e.stopPropagation()}>LC</a>
                  )}
                </span>
                <span className="col-del">
                  <button
                    className="row-del-btn"
                    title="Remove question"
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(p); }}
                    aria-label={`Remove ${p.title}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add question modal */}
      {showAddModal && (
        <AddQuestionModal
          patternId={patternId}
          patternName={patternName}
          onClose={() => setShowAddModal(false)}
          onAdd={addProblem}
        />
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="plp-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="plp-modal-box plp-confirm-box" onClick={(e) => e.stopPropagation()}>
            <div className="plp-modal-header">
              <h3>Remove Question</h3>
              <button onClick={() => setConfirmDelete(null)}><X size={16} /></button>
            </div>
            <div className="plp-modal-body">
              <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.6 }}>
                Remove <strong style={{ color: 'var(--text)' }}>{confirmDelete.title}</strong> from <strong style={{ color: 'var(--primary)' }}>{patternName}</strong>?
              </p>
            </div>
            <div className="plp-modal-footer">
              <button className="plp-btn-cancel" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="plp-btn-danger" onClick={() => handleDelete(confirmDelete)}>
                <Trash2 size={13} /> Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LeetCode Import */}
      {showLCImport && (
        <LeetcodeImport
          patterns={[{ id: patternId, name: patternName }]}
          onClose={() => setShowLCImport(false)}
          onImported={(p, importPatternId) => {
            addProblem({
              id: `lc-${p.slug}`,
              title: p.title,
              difficulty: p.difficulty as Problem['difficulty'],
              patternId: importPatternId,
              description: p.description,
              examples: [],
              constraints: [],
              testCases: p.exampleTestcases
                ? p.exampleTestcases.split('\n').filter(Boolean).map((line: string) => ({ input: line, expected: '' }))
                : [],
              companies: p.companyTags ?? [],
              leetcodeLink: p.leetcodeUrl,
              tags: p.topicTags ?? [],
              addedAt: new Date().toISOString(),
            });
          }}
        />
      )}
    </>
  );
}

// ── Helper ────────────────────────────────────────────────────────────────────
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'just now';
  if (hours < 1)  return `${mins}m ago`;
  if (days < 1)   return `${hours}h ago`;
  if (days < 30)  return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}
