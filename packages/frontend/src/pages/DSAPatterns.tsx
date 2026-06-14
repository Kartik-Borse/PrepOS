import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Plus, Trash2, X, Search, CheckCircle2, RotateCcw, Circle, Link2 } from 'lucide-react';
import { useAppStore, Problem, CustomPattern } from '../store/useAppStore';
import LeetcodeImport from '../components/LeetcodeImport';
import './DSAPatterns.css';

// ── Built-in patterns ────────────────────────────────────────────────────────
const BUILTIN_PATTERNS = [
  { id: 'sliding-window',     name: 'Sliding Window',                    count: 30, solved: 18, desc: 'Use a window that slides over data.', color: '#06b6d4' },
  { id: 'two-pointers',       name: 'Two Pointers',                      count: 28, solved: 22, desc: 'Two indices moving toward each other.', color: '#8b5cf6' },
  { id: 'fast-slow-pointers', name: 'Fast & Slow Pointers',              count: 18, solved: 12, desc: "Floyd's cycle detection.", color: '#ec4899' },
  { id: 'merge-intervals',    name: 'Merge Intervals',                   count: 22, solved: 8,  desc: 'Overlapping interval problems.', color: '#f59e0b' },
  { id: 'cyclic-sort',        name: 'Cyclic Sort',                       count: 15, solved: 5,  desc: 'Sort in O(n) by correct index placement.', color: '#10b981' },
  { id: 'reversal-ll',        name: 'In-place Reversal of LinkedList',   count: 14, solved: 9,  desc: 'Reverse sub-lists in-place.', color: '#14b8a6' },
  { id: 'tree-bfs',           name: 'Tree BFS',                          count: 20, solved: 14, desc: 'Level-order traversal with a queue.', color: '#22c55e' },
  { id: 'tree-dfs',           name: 'Tree DFS',                          count: 25, solved: 11, desc: 'Pre/In/Post-order and path problems.', color: '#84cc16' },
  { id: 'two-heaps',          name: 'Two Heaps',                         count: 12, solved: 4,  desc: 'Min + max heap for median.', color: '#f97316' },
  { id: 'backtracking',       name: 'Subsets / Backtracking',            count: 30, solved: 7,  desc: 'Generate all combinations and subsets.', color: '#a855f7' },
  { id: 'binary-search',      name: 'Modified Binary Search',            count: 26, solved: 19, desc: 'Search in rotated arrays and spaces.', color: '#3b82f6' },
  { id: 'bitwise',            name: 'Bitwise XOR / Bit Manipulation',    count: 18, solved: 6,  desc: 'XOR tricks and bit masks.', color: '#06b6d4' },
  { id: 'top-k',              name: 'Top K Elements',                    count: 20, solved: 10, desc: 'Kth largest/smallest using heaps.', color: '#f59e0b' },
  { id: 'k-way-merge',        name: 'K-way Merge',                       count: 10, solved: 3,  desc: 'Merge K sorted lists with min-heap.', color: '#ef4444' },
  { id: 'dp',                 name: 'Dynamic Programming',               count: 45, solved: 9,  desc: 'Knapsack, LCS, LIS, palindromes.', color: '#f97316' },
  { id: 'graph',              name: 'Graph Traversal',                   count: 35, solved: 14, desc: 'BFS/DFS, topological sort, Union-Find.', color: '#10b981' },
  { id: 'monotonic-stack',    name: 'Monotonic Stack / Queue',           count: 22, solved: 8,  desc: 'Next greater/smaller element patterns.', color: '#8b5cf6' },
  { id: 'prefix-sum',         name: 'Prefix Sum / Difference Array',     count: 20, solved: 11, desc: 'Precompute range queries in O(1).', color: '#22c55e' },
  { id: 'hashmap',            name: 'HashMap / Frequency Count',         count: 28, solved: 20, desc: 'Frequency maps and complement lookups.', color: '#3b82f6' },
  { id: 'greedy',             name: 'Greedy Algorithms',                 count: 25, solved: 12, desc: 'Locally optimal → globally optimal.', color: '#ec4899' },
];

// ── Built-in sample problems ──────────────────────────────────────────────────
const BUILTIN_PROBLEMS: Problem[] = [
  { id: 'lc-3',   title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', patternId: 'sliding-window', description: '', examples: [], constraints: [], testCases: [{ input: '"abcabcbb"', expected: '3' }], companies: ['Amazon','Microsoft','Adobe'], leetcodeLink: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
  { id: 'lc-76',  title: 'Minimum Window Substring',                       difficulty: 'Hard',   patternId: 'sliding-window', description: '', examples: [], constraints: [], testCases: [], companies: ['Google','Facebook'], leetcodeLink: 'https://leetcode.com/problems/minimum-window-substring/' },
  { id: 'lc-567', title: 'Permutation in String',                          difficulty: 'Medium', patternId: 'sliding-window', description: '', examples: [], constraints: [], testCases: [], companies: ['Microsoft','Amazon'], leetcodeLink: 'https://leetcode.com/problems/permutation-in-string/' },
  { id: 'lc-1',   title: 'Two Sum',                                        difficulty: 'Easy',   patternId: 'hashmap',        description: '', examples: [], constraints: [], testCases: [{ input: '[2,7,11,15], 9', expected: '[0,1]' }], companies: ['Google','Amazon','Meta'], leetcodeLink: 'https://leetcode.com/problems/two-sum/' },
  { id: 'lc-15',  title: 'Three Sum',                                      difficulty: 'Medium', patternId: 'two-pointers',   description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Google'], leetcodeLink: 'https://leetcode.com/problems/3sum/' },
  { id: 'lc-42',  title: 'Trapping Rain Water',                            difficulty: 'Hard',   patternId: 'two-pointers',   description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Google','Meta'], leetcodeLink: 'https://leetcode.com/problems/trapping-rain-water/' },
  { id: 'lc-200', title: 'Number of Islands',                              difficulty: 'Medium', patternId: 'graph',          description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Google','Microsoft'], leetcodeLink: 'https://leetcode.com/problems/number-of-islands/' },
  { id: 'lc-322', title: 'Coin Change',                                    difficulty: 'Medium', patternId: 'dp',             description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Google'], leetcodeLink: 'https://leetcode.com/problems/coin-change/' },
  { id: 'lc-704', title: 'Binary Search',                                  difficulty: 'Easy',   patternId: 'binary-search',  description: '', examples: [], constraints: [], testCases: [], companies: ['Google'], leetcodeLink: 'https://leetcode.com/problems/binary-search/' },
  { id: 'lc-33',  title: 'Search in Rotated Sorted Array',                 difficulty: 'Medium', patternId: 'binary-search',  description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Microsoft','Facebook'], leetcodeLink: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
];

const COLORS = ['#06b6d4','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#f97316','#a855f7','#22c55e','#ef4444'];

type View = 'patterns' | 'all-problems';
type DiffFilter = 'All' | 'Easy' | 'Medium' | 'Hard';

const diffColor = (d: string) => d === 'Easy' ? 'var(--easy)' : d === 'Medium' ? 'var(--medium)' : 'var(--hard)';

// ── Add Pattern Modal ─────────────────────────────────────────────────────────
function AddPatternModal({ onClose, onAdd }: { onClose: () => void; onAdd: (p: CustomPattern) => void }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  const submit = () => {
    if (!name.trim()) return;
    onAdd({ id: 'custom-' + Date.now(), name: name.trim(), description: desc.trim(), color, createdAt: new Date().toISOString() });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New Pattern</h3>
          <button onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="form-field">
            <label>Pattern Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Segment Tree, Trie, Bit DP…" autoFocus />
          </div>
          <div className="form-field">
            <label>Description</label>
            <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Brief description of this pattern…" />
          </div>
          <div className="form-field">
            <label>Color</label>
            <div className="color-picker">
              {COLORS.map((c) => (
                <button key={c} className={`color-dot ${color === c ? 'selected' : ''}`} style={{ background: c }} onClick={() => setColor(c)} aria-label={c} />
              ))}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-primary-sm" onClick={submit} disabled={!name.trim()}>Create Pattern</button>
        </div>
      </div>
    </div>
  );
}

// ── Add Question Modal ────────────────────────────────────────────────────────
function AddQuestionModal({
  patternId, patternName, onClose, onAdd,
}: {
  patternId: string; patternName: string;
  onClose: () => void; onAdd: (p: Problem) => void;
}) {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<Problem['difficulty']>('Medium');
  const [desc, setDesc] = useState('');
  const [lcLink, setLcLink] = useState('');
  const [companies, setCompanies] = useState('');
  const [tc1Input, setTc1Input] = useState('');
  const [tc1Expected, setTc1Expected] = useState('');

  const submit = () => {
    if (!title.trim()) return;
    onAdd({
      id: 'custom-' + Date.now(),
      title: title.trim(),
      difficulty,
      patternId,
      description: desc.trim(),
      examples: [],
      constraints: [],
      testCases: tc1Input ? [{ input: tc1Input, expected: tc1Expected }] : [],
      companies: companies.split(',').map((c) => c.trim()).filter(Boolean),
      leetcodeLink: lcLink.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Question to <span style={{ color: 'var(--primary)' }}>{patternName}</span></h3>
          <button onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="form-row-2">
            <div className="form-field">
              <label>Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Two Sum" autoFocus />
            </div>
            <div className="form-field">
              <label>Difficulty</label>
              <div className="diff-toggle">
                {(['Easy', 'Medium', 'Hard'] as Problem['difficulty'][]).map((d) => (
                  <button key={d} className={`diff-chip ${difficulty === d ? 'active' : ''} ${d.toLowerCase()}`} onClick={() => setDifficulty(d)}>{d}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="form-field">
            <label>Problem Description</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Describe the problem…" rows={3} />
          </div>
          <div className="form-row-2">
            <div className="form-field">
              <label>LeetCode Link</label>
              <input value={lcLink} onChange={(e) => setLcLink(e.target.value)} placeholder="https://leetcode.com/problems/…" />
            </div>
            <div className="form-field">
              <label>Companies (comma separated)</label>
              <input value={companies} onChange={(e) => setCompanies(e.target.value)} placeholder="Google, Amazon, Microsoft" />
            </div>
          </div>
          <div className="form-row-2">
            <div className="form-field">
              <label>Sample Input</label>
              <input value={tc1Input} onChange={(e) => setTc1Input(e.target.value)} placeholder='e.g. [2,7,11], target=9' />
            </div>
            <div className="form-field">
              <label>Expected Output</label>
              <input value={tc1Expected} onChange={(e) => setTc1Expected(e.target.value)} placeholder='e.g. [0,1]' />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-primary-sm" onClick={submit} disabled={!title.trim()}>Add Question</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DSAPatterns() {
  const { customPatterns, addPattern, deletePattern, customProblems, addProblem, solvedProblems } = useAppStore();
  const navigate = useNavigate();

  const [view, setView] = useState<View>('patterns');
  const [showAddPattern, setShowAddPattern] = useState(false);
  const [showLCImport, setShowLCImport] = useState(false);
  const [addQuestionFor, setAddQuestionFor] = useState<{ id: string; name: string } | null>(null);
  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState<DiffFilter>('All');
  const [patternFilter, setPatternFilter] = useState('all');

  const allPatterns = [
    ...BUILTIN_PATTERNS.map((p) => ({ ...p, isCustom: false })),
    ...customPatterns.map((p) => ({ ...p, count: 0, solved: 0, isCustom: true })),
  ];

  const allProblems = [...BUILTIN_PROBLEMS, ...customProblems];

  // Enrich builtin pattern counts with custom problems
  const patternCounts = allProblems.reduce<Record<string, number>>((acc, p) => {
    acc[p.patternId] = (acc[p.patternId] ?? 0) + 1;
    return acc;
  }, {});

  const filteredProblems = allProblems.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchDiff = diffFilter === 'All' || p.difficulty === diffFilter;
    const matchPattern = patternFilter === 'all' || p.patternId === patternFilter;
    return matchSearch && matchDiff && matchPattern;
  });

  const getPatternName = (id: string) =>
    allPatterns.find((p) => p.id === id)?.name ?? id;

  const getPatternColor = (id: string) =>
    allPatterns.find((p) => p.id === id)?.color ?? '#888';

  return (
    <div className="dsa-patterns">
      {/* Header */}
      <div className="dsp-header">
        <div>
          <h1>DSA Practice</h1>
          <p className="sub">{allPatterns.length} patterns · {allProblems.length} problems</p>
        </div>
        <div className="dsp-header-actions">
          <div className="view-toggle">
            <button className={`vt-btn ${view === 'patterns' ? 'active' : ''}`} onClick={() => setView('patterns')}>Patterns</button>
            <button className={`vt-btn ${view === 'all-problems' ? 'active' : ''}`} onClick={() => setView('all-problems')}>All Problems</button>
          </div>
          <button className="btn-lc-import" onClick={() => setShowLCImport(true)}>
            <Link2 size={14} /> Import from LC
          </button>
          {view === 'patterns' && (
            <button className="btn-add" onClick={() => setShowAddPattern(true)}>
              <Plus size={14} /> New Pattern
            </button>
          )}
        </div>
      </div>

      {/* ── PATTERNS VIEW ── */}
      {view === 'patterns' && (
        <div className="patterns-grid">
          {allPatterns.map((p) => {
            const total = patternCounts[p.id] ?? p.count;
            const solved = Object.keys(solvedProblems).filter((pid) =>
              allProblems.find((prob) => prob.id === pid && prob.patternId === p.id)
            ).length;
            const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

            return (
              <div key={p.id} className="pattern-card">
                <div className="pc-top">
                  <div className="pc-dot" style={{ background: p.color }} />
                  <div className="pc-meta">
                    <span className="pc-name">{p.name}</span>
                    <span className="pc-count">{total} problems {p.isCustom && <span className="custom-badge">Custom</span>}</span>
                  </div>
                  <div className="pc-actions">
                    <button
                      className="pc-action-btn add"
                      onClick={() => setAddQuestionFor({ id: p.id, name: p.name })}
                      title="Add question"
                    >
                      <Plus size={13} />
                    </button>
                    <button
                      className="pc-action-btn view"
                      onClick={() => navigate(`/dsa/${p.id}`)}
                      title="View problems"
                    >
                      <ChevronRight size={13} />
                    </button>
                    {p.isCustom && (
                      <button
                        className="pc-action-btn del"
                        onClick={() => deletePattern(p.id)}
                        title="Delete pattern"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="pc-desc">{('desc' in p ? p.desc : (p as CustomPattern).description) ?? ''}</p>
                <div className="pc-footer">
                  <div className="pc-bar-wrap">
                    <div className="pc-bar" style={{ width: `${pct}%`, background: p.color }} />
                  </div>
                  <span className="pc-pct">{pct}%</span>
                </div>
                <div className="pc-solved-line">{solved}/{total} solved</div>
              </div>
            );
          })}

          {/* Create pattern card */}
          <button className="pattern-card create-card" onClick={() => setShowAddPattern(true)}>
            <Plus size={28} style={{ color: 'var(--text-faint)' }} />
            <span>Create Pattern</span>
          </button>
        </div>
      )}

      {/* ── ALL PROBLEMS VIEW ── */}
      {view === 'all-problems' && (
        <div className="all-problems">
          {/* Filters */}
          <div className="ap-filters">
            <div className="ap-search-wrap">
              <Search size={13} className="ap-search-icon" />
              <input
                className="ap-search"
                placeholder="Search problems…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search problems"
              />
            </div>
            <div className="filter-group">
              {(['All', 'Easy', 'Medium', 'Hard'] as DiffFilter[]).map((d) => (
                <button key={d} className={`filter-btn ${diffFilter === d ? 'active' : ''}`} onClick={() => setDiffFilter(d)}>{d}</button>
              ))}
            </div>
            <select
              className="pattern-select"
              value={patternFilter}
              onChange={(e) => setPatternFilter(e.target.value)}
              aria-label="Filter by pattern"
            >
              <option value="all">All Patterns</option>
              {allPatterns.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <button
              className="btn-add"
              onClick={() => setAddQuestionFor({ id: patternFilter === 'all' ? allPatterns[0].id : patternFilter, name: getPatternName(patternFilter === 'all' ? allPatterns[0].id : patternFilter) })}
            >
              <Plus size={14} /> Add Question
            </button>
          </div>

          {/* Stats row */}
          <div className="ap-stats">
            <span className="ap-stat-chip">{filteredProblems.length} shown</span>
            <span className="ap-stat-chip easy-chip">{filteredProblems.filter(p => p.difficulty === 'Easy').length} Easy</span>
            <span className="ap-stat-chip medium-chip">{filteredProblems.filter(p => p.difficulty === 'Medium').length} Medium</span>
            <span className="ap-stat-chip hard-chip">{filteredProblems.filter(p => p.difficulty === 'Hard').length} Hard</span>
          </div>

          {/* Table */}
          <div className="problems-table">
            <div className="pt-head">
              <span className="col-st">Status</span>
              <span className="col-ti">Title</span>
              <span className="col-pa">Pattern</span>
              <span className="col-di">Difficulty</span>
              <span className="col-co">Companies</span>
              <span className="col-lc">LC</span>
            </div>

            {filteredProblems.length === 0 && (
              <div className="pt-empty">No problems found. Add some questions to your patterns!</div>
            )}

            {filteredProblems.map((p) => {
              const status = solvedProblems[p.id]?.status;
              return (
                <div
                  key={p.id}
                  className="pt-row"
                  onClick={() => navigate(`/problem/${p.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/problem/${p.id}`)}
                >
                  <span className="col-st">
                    {status === 'solved' ? <CheckCircle2 size={15} style={{ color: 'var(--success)' }} /> :
                     status === 'revision' ? <RotateCcw size={15} style={{ color: 'var(--warning)' }} /> :
                     <Circle size={15} style={{ color: 'var(--text-faint)' }} />}
                  </span>
                  <span className="col-ti">{p.title}</span>
                  <span className="col-pa">
                    <span className="pattern-pill" style={{ background: getPatternColor(p.patternId) + '22', color: getPatternColor(p.patternId) }}>
                      {getPatternName(p.patternId)}
                    </span>
                  </span>
                  <span className="col-di" style={{ color: diffColor(p.difficulty) }}>{p.difficulty}</span>
                  <span className="col-co">
                    {p.companies.slice(0, 2).map((c) => <span key={c} className="co-chip">{c}</span>)}
                    {p.companies.length > 2 && <span className="co-chip">+{p.companies.length - 2}</span>}
                  </span>
                  <span className="col-lc">
                    {p.leetcodeLink && (
                      <a href={p.leetcodeLink} target="_blank" rel="noreferrer" className="lc-badge" onClick={(e) => e.stopPropagation()}>LC</a>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddPattern && (
        <AddPatternModal onClose={() => setShowAddPattern(false)} onAdd={addPattern} />
      )}
      {addQuestionFor && (
        <AddQuestionModal
          patternId={addQuestionFor.id}
          patternName={addQuestionFor.name}
          onClose={() => setAddQuestionFor(null)}
          onAdd={addProblem}
        />
      )}
      {showLCImport && (
        <LeetcodeImport
          onClose={() => setShowLCImport(false)}
          onImported={(p) => {
            // Add to local store so it shows up immediately in the problem list
            addProblem({
              id: `lc-${p.slug}`,
              title: p.title,
              difficulty: p.difficulty as Problem['difficulty'],
              patternId: 'sliding-window',
              description: p.description,
              examples: [],
              constraints: [],
              testCases: p.exampleTestcases
                ? p.exampleTestcases.split('\n').filter(Boolean).map((line: string) => ({ input: line, expected: '' }))
                : [],
              companies: p.companyTags ?? [],
              leetcodeLink: p.leetcodeUrl,
              tags: p.topicTags ?? [],
            });
          }}
        />
      )}
    </div>
  );
}
