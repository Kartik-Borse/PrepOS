import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Trash2, Upload, X, Pause, Play, Sparkles } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import CheatsheetGenerator from './CheatsheetGenerator';
import './CheatsheetSlideshow.css';

// ── Built-in text cheatsheet cards ────────────────────────────────────────────
const BUILTIN_CARDS = [
  {
    id: 'b1', tag: 'Sliding Window', color: '#06b6d4',
    title: 'Sliding Window Template',
    content: [
      'left = 0, max_len = 0',
      'for right in range(len(s)):',
      '    # expand: add s[right] to window',
      '    while window_invalid:',
      '        # shrink: remove s[left]',
      '        left += 1',
      '    max_len = max(max_len, right - left + 1)',
    ],
    type: 'code' as const,
  },
  {
    id: 'b2', tag: 'Two Pointers', color: '#8b5cf6',
    title: 'Two Pointers — Sorted Array',
    content: [
      'l, r = 0, len(arr) - 1',
      'while l < r:',
      '    s = arr[l] + arr[r]',
      '    if s == target: return [l, r]',
      '    elif s < target: l += 1',
      '    else: r -= 1',
    ],
    type: 'code' as const,
  },
  {
    id: 'b3', tag: 'Binary Search', color: '#3b82f6',
    title: 'Binary Search Template',
    content: [
      'lo, hi = 0, len(arr) - 1',
      'while lo <= hi:',
      '    mid = (lo + hi) // 2',
      '    if arr[mid] == t: return mid',
      '    elif arr[mid] < t: lo = mid + 1',
      '    else: hi = mid - 1',
      'return -1',
    ],
    type: 'code' as const,
  },
  {
    id: 'b4', tag: 'BFS / Tree Level Order', color: '#10b981',
    title: 'BFS Template',
    content: [
      'from collections import deque',
      'q = deque([root])',
      'while q:',
      '    level_size = len(q)',
      '    for _ in range(level_size):',
      '        node = q.popleft()',
      '        if node.left: q.append(node.left)',
      '        if node.right: q.append(node.right)',
    ],
    type: 'code' as const,
  },
  {
    id: 'b5', tag: 'Dynamic Programming', color: '#f59e0b',
    title: '0/1 Knapsack',
    content: [
      'dp = [0] * (W + 1)',
      'for i in range(n):',
      '    for w in range(W, wt[i]-1, -1):',
      '        dp[w] = max(dp[w],',
      '                    dp[w-wt[i]] + val[i])',
      '# Key: iterate w in reverse!',
    ],
    type: 'code' as const,
  },
  {
    id: 'b6', tag: 'Graph — DFS', color: '#ef4444',
    title: 'DFS Template',
    content: [
      'visited = set()',
      'def dfs(node):',
      '    if node in visited: return',
      '    visited.add(node)',
      '    for neighbor in graph[node]:',
      '        dfs(neighbor)',
      '',
      '# Or iterative with stack',
    ],
    type: 'code' as const,
  },
  {
    id: 'b7', tag: 'Time Complexity', color: '#a855f7',
    title: 'Big-O Quick Reference',
    content: [
      'O(1)    → HashMap get/set',
      'O(log n) → Binary Search, Heap ops',
      'O(n)    → Linear scan, Two pointers',
      'O(n log n) → Sort, Merge sort',
      'O(n²)   → Nested loops, Bubble sort',
      'O(2ⁿ)   → Backtracking subsets',
      'O(n!)   → Permutations',
    ],
    type: 'list' as const,
  },
  {
    id: 'b8', tag: 'Aptitude Shortcuts', color: '#f97316',
    title: 'Must-Know Formulas',
    content: [
      'Time & Work: T = xy/(x+y)',
      'Speed: Avg = 2xy/(x+y) [equal dist]',
      'Profit & Loss: SP = CP×(100+P%)/100',
      'Compound Interest: A = P(1+r/100)ⁿ',
      'Permutation: nPr = n!/(n-r)!',
      'Combination: nCr = n!/r!(n-r)!',
      'Sum 1..n: n(n+1)/2',
    ],
    type: 'list' as const,
  },
  {
    id: 'b9', tag: 'OS Concepts', color: '#22c55e',
    title: 'Scheduling Algorithms',
    content: [
      'FCFS → Non-preemptive, convoy effect',
      'SJF  → Min avg wait, need burst time',
      'SRTF → Preemptive SJF',
      'RR   → Time quantum, fair, interactive',
      'Priority → Can starve → use aging',
      'Deadlock: Mutual excl + Hold wait',
      '       + No preempt + Circular wait',
    ],
    type: 'list' as const,
  },
  {
    id: 'b10', tag: 'DBMS', color: '#06b6d4',
    title: 'Normalization & SQL',
    content: [
      '1NF: Atomic values, no repeating groups',
      '2NF: 1NF + no partial dependency',
      '3NF: 2NF + no transitive dependency',
      'BCNF: Every determinant is candidate key',
      'ACID: Atomicity Consistency Isolation Dur.',
      'JOIN types: INNER LEFT RIGHT FULL CROSS',
    ],
    type: 'list' as const,
  },
];

interface SlideCard {
  id: string;
  tag: string;
  color: string;
  title: string;
  isImage: true;
  imageUrl: string;
  caption: string;
}

export default function CheatsheetSlideshow() {
  const { patternImages, addPatternImage, removePatternImage } = useAppStore();
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [caption, setCaption] = useState('');
  const [tag, setTag] = useState('');
  const [aiCards, setAiCards] = useState<typeof BUILTIN_CARDS>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  // Combine builtin + AI-generated + uploaded images
  const uploadedCards: SlideCard[] = patternImages.map((img) => ({
    id: img.url,
    tag: img.patternId,
    color: '#f89f1b',
    title: img.caption || img.patternId,
    isImage: true,
    imageUrl: img.url,
    caption: img.caption,
  }));

  const allCards = [...BUILTIN_CARDS, ...aiCards, ...uploadedCards];
  const total = allCards.length;
  const current = allCards[idx % total];

  const next = useCallback(() => setIdx((i) => (i + 1) % total), [total]);
  const prev = () => setIdx((i) => (i - 1 + total) % total);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(next, 5000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, next]);

  const handleSaveAiCard = (sheet: any) => {
    const newCard = {
      id: 'ai-' + Date.now(),
      tag: sheet.tag,
      color: sheet.color,
      title: sheet.title,
      content: sheet.sections.flatMap((s: any) => [
        `── ${s.heading} ──`,
        ...s.lines,
      ]),
      type: (sheet.type === 'code' ? 'code' : 'list') as 'code' | 'list',
    };
    setAiCards(prev => [...prev, newCard]);
    setIdx(allCards.length); // jump to new card
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      addPatternImage({
        patternId: tag || 'Custom',
        url,
        caption: caption || file.name,
        addedAt: new Date().toISOString(),
      });
      setShowUpload(false);
      setCaption('');
      setTag('');
      setIdx(total); // jump to new slide
    };
    reader.readAsDataURL(file);
  };

  const isImage = (c: typeof allCards[0]): c is SlideCard => 'isImage' in c && c.isImage;

  return (
    <div className="slideshow-card">
      <div className="ss-header">
        <div>
          <h2>Daily Quick Revision</h2>
          <p className="ss-sub">Cheatsheets · {idx + 1} / {total}</p>
        </div>
        <div className="ss-controls">
          <button className="ss-ctrl-btn ai-btn" onClick={() => setShowGenerator(true)} title="Generate AI cheatsheet">
            <Sparkles size={13} />
          </button>
          <button className="ss-ctrl-btn" onClick={() => setPlaying(!playing)} title={playing ? 'Pause' : 'Play'}>
            {playing ? <Pause size={13} /> : <Play size={13} />}
          </button>
          <button className="ss-ctrl-btn upload-btn" onClick={() => setShowUpload(true)} title="Upload cheatsheet image">
            <Upload size={13} />
          </button>
        </div>
      </div>

      {/* Slide */}
      <div className="ss-slide" style={{ borderColor: current.color + '44' }}>
        <div className="ss-slide-header" style={{ background: current.color + '18' }}>
          <span className="ss-tag" style={{ color: current.color, background: current.color + '22' }}>
            {current.tag}
          </span>
          <span className="ss-title">{current.title}</span>
          {isImage(current) && (
            <button
              className="ss-del-btn"
              onClick={() => { removePatternImage(current.tag, current.imageUrl); setIdx(0); }}
              title="Remove this slide"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>

        <div className="ss-slide-body">
          {isImage(current) ? (
            <img src={current.imageUrl} alt={current.caption} className="ss-image" />
          ) : (
            <pre className={`ss-code ${current.type === 'list' ? 'ss-list' : ''}`}>
              {current.content.join('\n')}
            </pre>
          )}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="ss-dots">
        <button className="ss-nav-btn" onClick={prev} aria-label="Previous"><ChevronLeft size={16} /></button>
        <div className="ss-dot-row">
          {allCards.map((_, i) => (
            <button
              key={i}
              className={`ss-dot ${i === idx % total ? 'active' : ''}`}
              style={i === idx % total ? { background: current.color } : {}}
              onClick={() => setIdx(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
        <button className="ss-nav-btn" onClick={next} aria-label="Next"><ChevronRight size={16} /></button>
      </div>

      {/* AI Generator modal */}
      {showGenerator && (
        <CheatsheetGenerator
          onClose={() => setShowGenerator(false)}
          onSave={handleSaveAiCard}
        />
      )}

      {/* Upload modal */}
      {showUpload && (
        <div className="ss-modal-overlay" onClick={() => setShowUpload(false)}>
          <div className="ss-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ss-modal-header">
              <h3>Upload Cheatsheet Image</h3>
              <button onClick={() => setShowUpload(false)}><X size={16} /></button>
            </div>
            <div className="ss-modal-body">
              <div className="ss-field">
                <label>Tag / Topic</label>
                <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="e.g. Sliding Window, OS, DBMS…" />
              </div>
              <div className="ss-field">
                <label>Caption</label>
                <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="e.g. Two Pointers patterns" />
              </div>
              <button className="ss-upload-area" onClick={() => fileRef.current?.click()}>
                <Upload size={24} />
                <span>Click to select image (PNG, JPG, WebP)</span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFile}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
