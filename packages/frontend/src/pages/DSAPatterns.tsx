import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ChevronRight, Plus, Trash2, X, CheckCircle2, RotateCcw, Circle, Link2,
  GripVertical, ListChecks, ExternalLink, Search, Loader2,
} from 'lucide-react';
import { useAppStore, Problem, CustomPattern } from '../store/useAppStore';
import LeetcodeImport from '../components/LeetcodeImport';
import { api } from '../lib/api';
import './DSAPatterns.css';

// ── Built-in patterns ─────────────────────────────────────────────────────────
const BUILTIN_PATTERNS = [
  { id: 'two-pointers',       name: 'Two Pointers',                      count: 28, solved: 22, desc: 'Two indices moving toward each other.', color: '#8b5cf6' },
  { id: 'sliding-window',     name: 'Sliding Window',                    count: 30, solved: 18, desc: 'Use a window that slides over data.', color: '#06b6d4' },
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
export const BUILTIN_PROBLEMS: Problem[] = [
  // ── Sliding Window ──────────────────────────────────────────────────────────
  { id: 'lc-3',   title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', patternId: 'sliding-window', description: '', examples: [], constraints: [], testCases: [{ input: '"abcabcbb"', expected: '3' }], companies: ['Amazon','Microsoft','Adobe'], leetcodeLink: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
  { id: 'lc-76',  title: 'Minimum Window Substring',                       difficulty: 'Hard',   patternId: 'sliding-window', description: '', examples: [], constraints: [], testCases: [], companies: ['Google','Facebook'], leetcodeLink: 'https://leetcode.com/problems/minimum-window-substring/' },
  { id: 'lc-567', title: 'Permutation in String',                          difficulty: 'Medium', patternId: 'sliding-window', description: '', examples: [], constraints: [], testCases: [], companies: ['Microsoft','Amazon'], leetcodeLink: 'https://leetcode.com/problems/permutation-in-string/' },
  // ── Two Pointers ────────────────────────────────────────────────────────────
  { id: 'lc-15',  title: 'Three Sum',                                      difficulty: 'Medium', patternId: 'two-pointers',   description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Google'], leetcodeLink: 'https://leetcode.com/problems/3sum/' },
  { id: 'lc-42',  title: 'Trapping Rain Water',                            difficulty: 'Hard',   patternId: 'two-pointers',   description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Google','Meta'], leetcodeLink: 'https://leetcode.com/problems/trapping-rain-water/' },
  { id: 'lc-11',  title: 'Container With Most Water',                      difficulty: 'Medium', patternId: 'two-pointers',   description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Google','Meta'], leetcodeLink: 'https://leetcode.com/problems/container-with-most-water/' },
  // ── HashMap ─────────────────────────────────────────────────────────────────
  { id: 'lc-1',   title: 'Two Sum',                                        difficulty: 'Easy',   patternId: 'hashmap',        description: '', examples: [], constraints: [], testCases: [{ input: '[2,7,11,15], 9', expected: '[0,1]' }], companies: ['Google','Amazon','Meta'], leetcodeLink: 'https://leetcode.com/problems/two-sum/' },
  { id: 'lc-49',  title: 'Group Anagrams',                                 difficulty: 'Medium', patternId: 'hashmap',        description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Facebook','Google'], leetcodeLink: 'https://leetcode.com/problems/group-anagrams/' },
  { id: 'lc-128', title: 'Longest Consecutive Sequence',                   difficulty: 'Medium', patternId: 'hashmap',        description: '', examples: [], constraints: [], testCases: [], companies: ['Google','Amazon'], leetcodeLink: 'https://leetcode.com/problems/longest-consecutive-sequence/' },
  // ── Binary Search ───────────────────────────────────────────────────────────
  { id: 'lc-704', title: 'Binary Search',                                  difficulty: 'Easy',   patternId: 'binary-search',  description: '', examples: [], constraints: [], testCases: [], companies: ['Google'], leetcodeLink: 'https://leetcode.com/problems/binary-search/' },
  { id: 'lc-33',  title: 'Search in Rotated Sorted Array',                 difficulty: 'Medium', patternId: 'binary-search',  description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Microsoft','Facebook'], leetcodeLink: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
  { id: 'lc-153', title: 'Find Minimum in Rotated Sorted Array',           difficulty: 'Medium', patternId: 'binary-search',  description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Microsoft'], leetcodeLink: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/' },
  // ── Graph ───────────────────────────────────────────────────────────────────
  { id: 'lc-200', title: 'Number of Islands',                              difficulty: 'Medium', patternId: 'graph',          description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Google','Microsoft'], leetcodeLink: 'https://leetcode.com/problems/number-of-islands/' },
  { id: 'lc-133', title: 'Clone Graph',                                    difficulty: 'Medium', patternId: 'graph',          description: '', examples: [], constraints: [], testCases: [], companies: ['Facebook','Amazon','Microsoft'], leetcodeLink: 'https://leetcode.com/problems/clone-graph/' },
  { id: 'lc-417', title: 'Pacific Atlantic Water Flow',                    difficulty: 'Medium', patternId: 'graph',          description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Google'], leetcodeLink: 'https://leetcode.com/problems/pacific-atlantic-water-flow/' },
  // ── Dynamic Programming ─────────────────────────────────────────────────────
  { id: 'lc-322', title: 'Coin Change',                                    difficulty: 'Medium', patternId: 'dp',             description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Google'], leetcodeLink: 'https://leetcode.com/problems/coin-change/' },
  { id: 'lc-1143',title: 'Longest Common Subsequence',                     difficulty: 'Medium', patternId: 'dp',             description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Google','Microsoft'], leetcodeLink: 'https://leetcode.com/problems/longest-common-subsequence/' },
  { id: 'lc-300', title: 'Longest Increasing Subsequence',                 difficulty: 'Medium', patternId: 'dp',             description: '', examples: [], constraints: [], testCases: [], companies: ['Microsoft','Amazon','Google'], leetcodeLink: 'https://leetcode.com/problems/longest-increasing-subsequence/' },
  // ── Tree BFS ────────────────────────────────────────────────────────────────
  { id: 'lc-102', title: 'Binary Tree Level Order Traversal',              difficulty: 'Medium', patternId: 'tree-bfs',       description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Microsoft','Google'], leetcodeLink: 'https://leetcode.com/problems/binary-tree-level-order-traversal/' },
  { id: 'lc-103', title: 'Binary Tree Zigzag Level Order Traversal',       difficulty: 'Medium', patternId: 'tree-bfs',       description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Microsoft'], leetcodeLink: 'https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/' },
  // ── Tree DFS ────────────────────────────────────────────────────────────────
  { id: 'lc-112', title: 'Path Sum',                                       difficulty: 'Easy',   patternId: 'tree-dfs',       description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Microsoft'], leetcodeLink: 'https://leetcode.com/problems/path-sum/' },
  { id: 'lc-124', title: 'Binary Tree Maximum Path Sum',                   difficulty: 'Hard',   patternId: 'tree-dfs',       description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Meta','Google'], leetcodeLink: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/' },
  // ── Fast & Slow Pointers ────────────────────────────────────────────────────
  { id: 'lc-141', title: 'Linked List Cycle',                              difficulty: 'Easy',   patternId: 'fast-slow-pointers', description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Microsoft'], leetcodeLink: 'https://leetcode.com/problems/linked-list-cycle/' },
  { id: 'lc-142', title: 'Linked List Cycle II',                           difficulty: 'Medium', patternId: 'fast-slow-pointers', description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Microsoft'], leetcodeLink: 'https://leetcode.com/problems/linked-list-cycle-ii/' },
  // ── Backtracking ────────────────────────────────────────────────────────────
  { id: 'lc-78',  title: 'Subsets',                                        difficulty: 'Medium', patternId: 'backtracking',   description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Facebook','Google'], leetcodeLink: 'https://leetcode.com/problems/subsets/' },
  { id: 'lc-46',  title: 'Permutations',                                   difficulty: 'Medium', patternId: 'backtracking',   description: '', examples: [], constraints: [], testCases: [], companies: ['Microsoft','Amazon'], leetcodeLink: 'https://leetcode.com/problems/permutations/' },
  { id: 'lc-79',  title: 'Word Search',                                    difficulty: 'Medium', patternId: 'backtracking',   description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Microsoft','Facebook'], leetcodeLink: 'https://leetcode.com/problems/word-search/' },
  // ── Two Heaps ───────────────────────────────────────────────────────────────
  { id: 'lc-295', title: 'Find Median from Data Stream',                   difficulty: 'Hard',   patternId: 'two-heaps',      description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Google','Microsoft'], leetcodeLink: 'https://leetcode.com/problems/find-median-from-data-stream/' },
  // ── Merge Intervals ─────────────────────────────────────────────────────────
  { id: 'lc-56',  title: 'Merge Intervals',                                difficulty: 'Medium', patternId: 'merge-intervals', description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Google','Facebook'], leetcodeLink: 'https://leetcode.com/problems/merge-intervals/' },
  { id: 'lc-57',  title: 'Insert Interval',                                difficulty: 'Medium', patternId: 'merge-intervals', description: '', examples: [], constraints: [], testCases: [], companies: ['Google','LinkedIn'], leetcodeLink: 'https://leetcode.com/problems/insert-interval/' },
  // ── Top K Elements ──────────────────────────────────────────────────────────
  { id: 'lc-215', title: 'Kth Largest Element in an Array',                difficulty: 'Medium', patternId: 'top-k',          description: '', examples: [], constraints: [], testCases: [], companies: ['Facebook','Amazon','Microsoft'], leetcodeLink: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
  { id: 'lc-347', title: 'Top K Frequent Elements',                        difficulty: 'Medium', patternId: 'top-k',          description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Facebook','Google'], leetcodeLink: 'https://leetcode.com/problems/top-k-frequent-elements/' },
  // ── Monotonic Stack ─────────────────────────────────────────────────────────
  { id: 'lc-739', title: 'Daily Temperatures',                             difficulty: 'Medium', patternId: 'monotonic-stack', description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Google'], leetcodeLink: 'https://leetcode.com/problems/daily-temperatures/' },
  { id: 'lc-84',  title: 'Largest Rectangle in Histogram',                 difficulty: 'Hard',   patternId: 'monotonic-stack', description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Google','Microsoft'], leetcodeLink: 'https://leetcode.com/problems/largest-rectangle-in-histogram/' },
  // ── Prefix Sum ──────────────────────────────────────────────────────────────
  { id: 'lc-560', title: 'Subarray Sum Equals K',                          difficulty: 'Medium', patternId: 'prefix-sum',     description: '', examples: [], constraints: [], testCases: [], companies: ['Facebook','Amazon','Google'], leetcodeLink: 'https://leetcode.com/problems/subarray-sum-equals-k/' },
  { id: 'lc-238', title: 'Product of Array Except Self',                   difficulty: 'Medium', patternId: 'prefix-sum',     description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Facebook','Microsoft'], leetcodeLink: 'https://leetcode.com/problems/product-of-array-except-self/' },
  // ── Greedy ──────────────────────────────────────────────────────────────────
  { id: 'lc-55',  title: 'Jump Game',                                      difficulty: 'Medium', patternId: 'greedy',         description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Microsoft'], leetcodeLink: 'https://leetcode.com/problems/jump-game/' },
  { id: 'lc-45',  title: 'Jump Game II',                                   difficulty: 'Medium', patternId: 'greedy',         description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Google'], leetcodeLink: 'https://leetcode.com/problems/jump-game-ii/' },
  // ── Bitwise ─────────────────────────────────────────────────────────────────
  { id: 'lc-136', title: 'Single Number',                                  difficulty: 'Easy',   patternId: 'bitwise',        description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Adobe'], leetcodeLink: 'https://leetcode.com/problems/single-number/' },
  { id: 'lc-191', title: 'Number of 1 Bits',                               difficulty: 'Easy',   patternId: 'bitwise',        description: '', examples: [], constraints: [], testCases: [], companies: ['Microsoft','Apple'], leetcodeLink: 'https://leetcode.com/problems/number-of-1-bits/' },
  // ── K-way Merge ─────────────────────────────────────────────────────────────
  { id: 'lc-23',  title: 'Merge K Sorted Lists',                           difficulty: 'Hard',   patternId: 'k-way-merge',    description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Google','Microsoft'], leetcodeLink: 'https://leetcode.com/problems/merge-k-sorted-lists/' },
  // ── In-place Reversal of LinkedList ─────────────────────────────────────────
  { id: 'lc-206', title: 'Reverse Linked List',                            difficulty: 'Easy',   patternId: 'reversal-ll',    description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Adobe','Microsoft'], leetcodeLink: 'https://leetcode.com/problems/reverse-linked-list/' },
  { id: 'lc-92',  title: 'Reverse Linked List II',                         difficulty: 'Medium', patternId: 'reversal-ll',    description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Microsoft'], leetcodeLink: 'https://leetcode.com/problems/reverse-linked-list-ii/' },
  // ── Cyclic Sort ─────────────────────────────────────────────────────────────
  { id: 'lc-268', title: 'Missing Number',                                 difficulty: 'Easy',   patternId: 'cyclic-sort',    description: '', examples: [], constraints: [], testCases: [], companies: ['Microsoft','Amazon'], leetcodeLink: 'https://leetcode.com/problems/missing-number/' },
  { id: 'lc-41',  title: 'First Missing Positive',                         difficulty: 'Hard',   patternId: 'cyclic-sort',    description: '', examples: [], constraints: [], testCases: [], companies: ['Amazon','Google'], leetcodeLink: 'https://leetcode.com/problems/first-missing-positive/' },
];


const COLORS = ['#06b6d4','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#f97316','#a855f7','#22c55e','#ef4444'];

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
  const [customCode, setCustomCode] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('python3');
  const [fetchingLC, setFetchingLC] = useState(false);
  const [metaData, setMetaData] = useState<any>(null);

  const fetchLCData = async () => {
    if (!lcLink.trim()) return;
    setFetchingLC(true);
    try {
      const { problem } = await api.fetchLeetcode(lcLink.trim());
      setTitle(problem.title || '');
      if (['Easy', 'Medium', 'Hard'].includes(problem.difficulty)) {
        setDifficulty(problem.difficulty as any);
      }
      setDesc(problem.description || '');
      setCompanies((problem.companyTags || []).join(', '));
      setMetaData(problem.metaData || null);
      if (problem.exampleTestcases) {
        const cases = problem.exampleTestcases.split('\n').filter(Boolean);
        if (cases.length > 0) setTc1Input(cases[0]);
      }
    } catch (err) {
      console.error('Failed to fetch LC data', err);
    }
    setFetchingLC(false);
  };

  const submit = () => {
    if (!title.trim()) return;
    const newMetaData = metaData || {};
    if (customCode.trim()) {
      newMetaData.codeSnippets = [{ langSlug: codeLanguage, code: customCode }];
    }
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
      addedAt: new Date().toISOString(),
      metaData: Object.keys(newMetaData).length > 0 ? newMetaData : undefined,
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
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={lcLink} onChange={(e) => setLcLink(e.target.value)} placeholder="https://leetcode.com/problems/…" style={{ flex: 1 }} />
                <button
                  onClick={fetchLCData}
                  disabled={!lcLink.trim() || fetchingLC}
                  className="btn-secondary"
                  style={{ whiteSpace: 'nowrap', padding: '0 12px' }}
                >
                  {fetchingLC ? <Loader2 size={14} className="spin" /> : 'Fetch Details'}
                </button>
              </div>
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
          <div className="form-field">
            <label>Solution Code</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <select value={codeLanguage} onChange={(e) => setCodeLanguage(e.target.value)} style={{ padding: '6px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)' }}>
                <option value="python3">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>
            <textarea value={customCode} onChange={(e) => setCustomCode(e.target.value)} placeholder="Paste your code here..." rows={4} style={{ fontFamily: 'monospace' }} />
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

// ── Manage Questions Modal ────────────────────────────────────────────────────
function ManageQuestionsModal({
  patternId, patternName, allProblems, solvedProblems, onClose, onDelete, onNavigate,
}: {
  patternId: string;
  patternName: string;
  allProblems: Problem[];
  solvedProblems: Record<string, { status: 'solved' | 'revision'; solvedAt: string }>;
  onClose: () => void;
  onDelete: (problem: Problem) => void;
  onNavigate: (id: string) => void;
}) {
  const patternProblems = allProblems.filter((p) => p.patternId === patternId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            <ListChecks size={16} style={{ display: 'inline', marginRight: 8 }} />
            Questions in <span style={{ color: 'var(--primary)' }}>{patternName}</span>
          </h3>
          <button onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body" style={{ padding: 0, maxHeight: '60vh', overflowY: 'auto' }}>
          {patternProblems.length === 0 && (
            <div className="mq-empty">No questions yet. Add some with the + button on the card.</div>
          )}
          {patternProblems.map((p) => {
            const status = solvedProblems[p.id]?.status;
            return (
              <div key={p.id} className="mq-row">
                <span className="mq-status">
                  {status === 'solved'
                    ? <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
                    : status === 'revision'
                    ? <RotateCcw size={14} style={{ color: 'var(--warning)' }} />
                    : <Circle size={14} style={{ color: 'var(--text-faint)' }} />}
                </span>
                <span className="mq-title" onClick={() => { onNavigate(p.id); onClose(); }}>
                  {p.title}
                </span>
                <span className="mq-diff" style={{ color: diffColor(p.difficulty) }}>{p.difficulty}</span>
                <div className="mq-actions">
                  {p.leetcodeLink && (
                    <a href={p.leetcodeLink} target="_blank" rel="noreferrer" className="mq-lc-btn" onClick={(e) => e.stopPropagation()}>
                      <ExternalLink size={12} />
                    </a>
                  )}
                  <button
                    className="mq-del-btn"
                    title="Remove from pattern"
                    onClick={() => onDelete(p)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Sortable Pattern Card ─────────────────────────────────────────────────────
interface PatternCardProps {
  pattern: {
    id: string; name: string; color: string; desc?: string;
    description?: string; isCustom: boolean;
  };
  total: number;
  solved: number;
  onAddQuestion: () => void;
  onManageQuestions: () => void;
  onDelete?: () => void;
  onView: () => void;
  isDragging?: boolean;
}

function SortablePatternCard({ pattern, total, solved, onAddQuestion, onManageQuestions, onDelete, onView, isDragging }: PatternCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: pattern.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.35 : 1,
  };

  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
  const desc = (pattern as { desc?: string; description?: string }).desc
    ?? (pattern as { desc?: string; description?: string }).description
    ?? '';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`pattern-card ${isDragging ? 'pc-ghost' : ''}`}
    >
      <div className="pc-top">
        {/* Drag handle */}
        <button
          className="drag-handle"
          {...attributes}
          {...listeners}
          title="Drag to reorder"
          tabIndex={0}
        >
          <GripVertical size={14} />
        </button>
        <div className="pc-dot" style={{ background: pattern.color }} />
        <div className="pc-meta">
          <span className="pc-name">{pattern.name}</span>
          <span className="pc-count">
            {total} problems {pattern.isCustom && <span className="custom-badge">Custom</span>}
          </span>
        </div>
        <div className="pc-actions">
          <button className="pc-action-btn add" onClick={onAddQuestion} title="Add question">
            <Plus size={13} />
          </button>
          <button className="pc-action-btn manage" onClick={onManageQuestions} title="Manage questions">
            <ListChecks size={13} />
          </button>
          <button className="pc-action-btn view" onClick={onView} title="View problems">
            <ChevronRight size={13} />
          </button>
          {pattern.isCustom && onDelete && (
            <button className="pc-action-btn del" onClick={onDelete} title="Delete pattern">
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
      <p className="pc-desc">{desc}</p>
      <div className="pc-footer">
        <div className="pc-bar-wrap">
          <div className="pc-bar" style={{ width: `${pct}%`, background: pattern.color }} />
        </div>
        <span className="pc-pct">{pct}%</span>
      </div>
      <div className="pc-solved-line">{solved}/{total} solved</div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DSAPatterns() {
  const {
    customPatterns, addPattern, deletePattern,
    customProblems, addProblem, deleteProblem,
    hiddenProblems, hideBuiltinProblem,
    solvedProblems,
    patternOrder, reorderPatterns,
  } = useAppStore();
  const navigate = useNavigate();

  const [showAddPattern, setShowAddPattern] = useState(false);
  const [showLCImport, setShowLCImport] = useState(false);
  const [view, setView] = useState<'patterns' | 'all-problems'>('patterns');
  const [addQuestionFor, setAddQuestionFor] = useState<{ id: string; name: string } | null>(null);
  const [manageQuestionsFor, setManageQuestionsFor] = useState<{ id: string; name: string } | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ problem: Problem } | null>(null);

  // All Problems filters
  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [patternFilter, setPatternFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Solved' | 'Unsolved'>('All');
  const [allProblemsSortBy, setAllProblemsSortBy] = useState<'latest' | 'difficulty-asc' | 'difficulty-desc' | 'title-asc' | 'title-desc' | 'unsolved-first'>('latest');

  // Merge and sort patterns — first apply user-defined order
  const builtinPatterns = BUILTIN_PATTERNS.map((p) => ({ ...p, isCustom: false }));
  const customPatternsEnriched = customPatterns.map((p) => ({ ...p, count: 0, solved: 0, isCustom: true, desc: p.description }));
  const allPatternsUnordered = [...builtinPatterns, ...customPatternsEnriched];

  const allPatterns = patternOrder.length > 0
    ? [
        ...patternOrder
          .map((id) => allPatternsUnordered.find((p) => p.id === id))
          .filter(Boolean) as typeof allPatternsUnordered,
        ...allPatternsUnordered.filter((p) => !patternOrder.includes(p.id)),
      ]
    : allPatternsUnordered;

  // All visible problems (built-in minus hidden + custom)
  const allProblems = [
    ...BUILTIN_PROBLEMS.filter((p) => !hiddenProblems.includes(p.id)),
    ...customProblems,
  ];

  // Count problems per pattern
  const patternCounts = allProblems.reduce<Record<string, number>>((acc, p) => {
    acc[p.patternId] = (acc[p.patternId] ?? 0) + 1;
    return acc;
  }, {});

  // All Problems — sorted by user-selected sort
  const allProblemsSorted = [...allProblems].sort((a, b) => {
    const aS = solvedProblems[a.id];
    const bS = solvedProblems[b.id];
    const dMap: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3 };
    switch (allProblemsSortBy) {
      case 'latest':
        if (aS && bS) return new Date(bS.solvedAt).getTime() - new Date(aS.solvedAt).getTime();
        if (aS) return -1; if (bS) return 1;
        return new Date(b.addedAt ?? 0).getTime() - new Date(a.addedAt ?? 0).getTime();
      case 'difficulty-asc':  return (dMap[a.difficulty] ?? 2) - (dMap[b.difficulty] ?? 2);
      case 'difficulty-desc': return (dMap[b.difficulty] ?? 2) - (dMap[a.difficulty] ?? 2);
      case 'title-asc':  return a.title.localeCompare(b.title);
      case 'title-desc': return b.title.localeCompare(a.title);
      case 'unsolved-first': return (!aS ? -1 : !bS ? 1 : 0);
      default: return 0;
    }
  });

  const filteredProblems = allProblemsSorted.filter((p) => {
    const matchSearch  = p.title.toLowerCase().includes(search.toLowerCase());
    const matchDiff    = diffFilter === 'All' || p.difficulty === diffFilter;
    const matchPattern = patternFilter === 'all' || p.patternId === patternFilter;
    const isSolved = solvedProblems[p.id]?.status === 'solved';
    const matchStatus = statusFilter === 'All' || (statusFilter === 'Solved' && isSolved) || (statusFilter === 'Unsolved' && !isSolved);
    return matchSearch && matchDiff && matchPattern && matchStatus;
  });

  const getPatternName  = (id: string) => allPatterns.find((p) => p.id === id)?.name ?? id;
  const getPatternColor = (id: string) => allPatterns.find((p) => p.id === id)?.color ?? '#888';

  // ── DnD sensors ──
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const ids = allPatterns.map((p) => p.id);
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    reorderPatterns(arrayMove(ids, oldIndex, newIndex));
  };

  // ── Delete a problem (custom = delete, builtin = hide) ──
  const handleDeleteProblem = (problem: Problem) => {
    const isBuiltin = BUILTIN_PROBLEMS.some((b) => b.id === problem.id);
    if (isBuiltin) {
      hideBuiltinProblem(problem.id);
    } else {
      deleteProblem(problem.id);
    }
    setConfirmDelete(null);
  };

  const activePattern = activeId ? allPatterns.find((p) => p.id === activeId) : null;

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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={allPatterns.map((p) => p.id)} strategy={rectSortingStrategy}>
            <div className="patterns-grid">
              {allPatterns.map((p) => {
                const total = patternCounts[p.id] || 0;
                const solved = Object.keys(solvedProblems).filter((pid) =>
                  allProblems.find((prob) => prob.id === pid && prob.patternId === p.id)
                ).length;

                return (
                  <SortablePatternCard
                    key={p.id}
                    pattern={p}
                    total={total}
                    solved={solved}
                    onAddQuestion={() => setAddQuestionFor({ id: p.id, name: p.name })}
                    onManageQuestions={() => setManageQuestionsFor({ id: p.id, name: p.name })}
                    onDelete={p.isCustom ? () => deletePattern(p.id as string) : undefined}
                    onView={() => navigate(`/dsa/${p.id}`)}
                  />
                );
              })}

              {/* Create pattern card */}
              <button className="pattern-card create-card" onClick={() => setShowAddPattern(true)}>
                <Plus size={28} style={{ color: 'var(--text-faint)' }} />
                <span>Create Pattern</span>
              </button>
            </div>
          </SortableContext>

          {/* Drag overlay */}
          <DragOverlay>
            {activePattern && (
              <div className="pattern-card pc-overlay">
                <div className="pc-top">
                  <div className="pc-dot" style={{ background: activePattern.color }} />
                  <div className="pc-meta">
                    <span className="pc-name">{activePattern.name}</span>
                  </div>
                </div>
              </div>
            )}
          </DragOverlay>
        </DndContext>
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
              {(['All', 'Easy', 'Medium', 'Hard'] as const).map((d) => (
                <button key={d} className={`filter-btn ${diffFilter === d ? 'active' : ''}`} onClick={() => setDiffFilter(d)}>{d}</button>
              ))}
            </div>
            <select
              className="pattern-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              aria-label="Filter by status"
            >
              <option value="All">All Status</option>
              <option value="Solved">Solved</option>
              <option value="Unsolved">Unsolved</option>
            </select>
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
              onClick={() => setAddQuestionFor({
                id: patternFilter === 'all' ? allPatterns[0].id : patternFilter,
                name: getPatternName(patternFilter === 'all' ? allPatterns[0].id : patternFilter),
              })}
            >
              <Plus size={14} /> Add Question
            </button>
          </div>

          {/* Stats */}
          <div className="ap-stats">
            <span className="ap-stat-chip">{filteredProblems.length} shown</span>
            <span className="ap-stat-chip easy-chip">{filteredProblems.filter((p) => p.difficulty === 'Easy').length} Easy</span>
            <span className="ap-stat-chip medium-chip">{filteredProblems.filter((p) => p.difficulty === 'Medium').length} Medium</span>
            <span className="ap-stat-chip hard-chip">{filteredProblems.filter((p) => p.difficulty === 'Hard').length} Hard</span>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sort</span>
              <select
                className="pattern-select"
                value={allProblemsSortBy}
                onChange={(e) => setAllProblemsSortBy(e.target.value as any)}
                aria-label="Sort problems"
              >
                <option value="latest">Latest Solved First</option>
                <option value="unsolved-first">Unsolved First</option>
                <option value="difficulty-asc">Difficulty: Easy → Hard</option>
                <option value="difficulty-desc">Difficulty: Hard → Easy</option>
                <option value="title-asc">Title: A → Z</option>
                <option value="title-desc">Title: Z → A</option>
              </select>
            </div>
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
              <span className="col-del" />
            </div>

            {filteredProblems.length === 0 && (
              <div className="pt-empty">No problems found. Add questions to your patterns!</div>
            )}

            {filteredProblems.map((p) => {
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
                  <span className="col-st">
                    {status === 'solved' ? <CheckCircle2 size={15} style={{ color: 'var(--success)' }} /> :
                     status === 'revision' ? <RotateCcw size={15} style={{ color: 'var(--warning)' }} /> :
                     <Circle size={15} style={{ color: 'var(--text-faint)' }} />}
                  </span>
                  <span className="col-ti">
                    {p.title}
                    {latestSolve && (
                      <span className="solved-badge">
                        {latestSolve.status === 'solved' ? '✓' : '↻'} {timeAgo(latestSolve.solvedAt)}
                      </span>
                    )}
                  </span>
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
                  <span className="col-del">
                    <button
                      className="row-del-btn"
                      title="Remove question"
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete({ problem: p }); }}
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
      )}

      {/* ── Modals ── */}
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

      {manageQuestionsFor && (
        <ManageQuestionsModal
          patternId={manageQuestionsFor.id}
          patternName={manageQuestionsFor.name}
          allProblems={allProblems}
          solvedProblems={solvedProblems}
          onClose={() => setManageQuestionsFor(null)}
          onDelete={(problem) => setConfirmDelete({ problem })}
          onNavigate={(id) => navigate(`/problem/${id}`)}
        />
      )}

      {/* Confirm delete dialog */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-box confirm-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Remove Question</h3>
              <button onClick={() => setConfirmDelete(null)}><X size={16} /></button>
            </div>
            <div className="modal-body" style={{ paddingTop: 16, paddingBottom: 16 }}>
              <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.6 }}>
                Remove <strong style={{ color: 'var(--text)' }}>{confirmDelete.problem.title}</strong> from this pattern?
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button
                className="btn-danger"
                onClick={() => {
                  handleDeleteProblem(confirmDelete.problem);
                  // If manage modal is still open, it will auto-update
                }}
              >
                <Trash2 size={13} /> Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {showLCImport && (
        <LeetcodeImport
          patterns={allPatterns.map(p => ({ id: p.id, name: p.name }))}
          onClose={() => setShowLCImport(false)}
          onImported={(p, patternId) => {
            addProblem({
              id: `lc-${p.slug}`,
              title: p.title,
              difficulty: p.difficulty as Problem['difficulty'],
              patternId: patternId,
              description: p.description,
              examples: [],
              constraints: [],
              testCases: p.exampleTestcases
                ? p.exampleTestcases.split('\n').filter(Boolean).map((line: string) => ({ input: line, expected: '' }))
                : [],
              companies: p.companyTags ?? [],
              leetcodeLink: p.leetcodeUrl,
              tags: p.topicTags ?? [],
              metaData: p.metaData,
              addedAt: new Date().toISOString(),
            });
          }}
        />
      )}
    </div>
  );
}

// ── Helper ────────────────────────────────────────────────────────────────────
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)  return 'just now';
  if (hours < 1) return `${mins}m ago`;
  if (days < 1)  return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}
