import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Types ──────────────────────────────────────────────

export interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  patternId: string;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  testCases: { input: string; expected: string }[];
  companies: string[];
  leetcodeLink?: string;
  images?: string[];
  tags?: string[];
  selfRating?: 1 | 2 | 3 | 4 | 5;
  addedAt?: string;
  metaData?: any;
}

export interface Attempt {
  id: string;
  problemId: string;
  problemTitle: string;
  patternId: string;
  code: string;
  language: string;
  status: 'Accepted' | 'Wrong Answer' | 'TLE' | 'Error';
  timeMs: number;
  timeTaken: number; // seconds
  hintsUsed: number;
  date: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  note?: string;
  title?: string;
}

export interface MistakeEntry {
  id: string;
  problemId: string;
  problemTitle: string;
  patternId: string;
  difficulty: string;
  mistakeType: 'Wrong logic' | 'Edge case missed' | 'TLE' | 'Off-by-one' | 'Wrong data structure' | 'Other';
  note: string;
  date: string;
  resolved: boolean;
}

export interface MockContest {
  id: string;
  title: string;
  problemIds: string[];
  durationMin: number;
  startedAt: string;
  finishedAt?: string;
  score?: number;
  results?: { problemId: string; status: string; timeTaken: number }[];
}

export interface CodeSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
  tags: string[];
  createdAt: string;
}

export interface ConceptCard {
  id: string;
  subject: string;
  question: string;
  answer: string;
  tags: string[];
  lastReviewed?: string;
  confidence: 0 | 1 | 2 | 3; // 0=new 1=hard 2=ok 3=easy
}

export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  college: string;
  degree: string;
  graduationYear: string;
  cgpa: string;
  skills: string;
  projects: { title: string; tech: string; description: string }[];
  achievements: string;
  links: string;
}

export interface ProblemNote {
  problemId: string;
  content: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastVisited: string;
}

export interface HRQuestion {
  id: string;
  question: string;
  category: string;
  myAnswer: string;
  updatedAt: string;
}

export interface PatternImage {
  patternId: string;
  url: string;
  caption: string;
  addedAt: string;
}

export interface CustomPattern {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
}

export interface DashboardConfig {
  widgetOrder: string[];
  hiddenWidgets: string[];
  dailyGoal: {
    targetProblems: number;
    tasks: string[];
  };
}

// ── Default HR Questions ───────────────────────────────

const DEFAULT_HR_QUESTIONS: HRQuestion[] = [
  { id: 'hr1',  question: 'Tell me about yourself.',                                          category: 'Introduction',           myAnswer: '', updatedAt: '' },
  { id: 'hr2',  question: 'What are your strengths?',                                         category: 'Strengths & Weaknesses', myAnswer: '', updatedAt: '' },
  { id: 'hr3',  question: 'What are your weaknesses?',                                        category: 'Strengths & Weaknesses', myAnswer: '', updatedAt: '' },
  { id: 'hr4',  question: 'Why do you want to join this company?',                            category: 'Motivation',             myAnswer: '', updatedAt: '' },
  { id: 'hr5',  question: 'Where do you see yourself in 5 years?',                            category: 'Career Goals',           myAnswer: '', updatedAt: '' },
  { id: 'hr6',  question: 'Describe a challenging situation and how you overcame it.',        category: 'Behavioral (STAR)',      myAnswer: '', updatedAt: '' },
  { id: 'hr7',  question: 'Tell me about a time you worked in a team.',                       category: 'Behavioral (STAR)',      myAnswer: '', updatedAt: '' },
  { id: 'hr8',  question: 'How do you handle pressure or tight deadlines?',                   category: 'Work Style',             myAnswer: '', updatedAt: '' },
  { id: 'hr9',  question: 'What is your biggest achievement so far?',                         category: 'Achievements',           myAnswer: '', updatedAt: '' },
  { id: 'hr10', question: 'Why should we hire you?',                                          category: 'Motivation',             myAnswer: '', updatedAt: '' },
  { id: 'hr11', question: 'Do you prefer working alone or in a team?',                        category: 'Work Style',             myAnswer: '', updatedAt: '' },
  { id: 'hr12', question: 'Tell me about a time you failed. What did you learn?',             category: 'Behavioral (STAR)',      myAnswer: '', updatedAt: '' },
  { id: 'hr13', question: 'What motivates you?',                                              category: 'Motivation',             myAnswer: '', updatedAt: '' },
  { id: 'hr14', question: 'How do you prioritize tasks when you have multiple deadlines?',    category: 'Work Style',             myAnswer: '', updatedAt: '' },
  { id: 'hr15', question: 'Do you have any questions for us?',                                category: 'Closing',                myAnswer: '', updatedAt: '' },
];

const DEFAULT_CONCEPT_CARDS: ConceptCard[] = [
  { id: 'cc1', subject: 'OS', question: 'What is a deadlock? What are the 4 conditions?', answer: 'Deadlock = circular wait for resources.\n1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait\nPrevention: break any one condition.', tags: ['OS','Deadlock'], confidence: 0 },
  { id: 'cc2', subject: 'OS', question: 'Difference between process and thread?', answer: 'Process: independent execution unit with its own memory space.\nThread: lightweight unit within a process, shares memory.\nThreads are faster to create/switch. Processes are isolated.', tags: ['OS','Process'], confidence: 0 },
  { id: 'cc3', subject: 'DBMS', question: 'What is ACID? Explain each property.', answer: 'Atomicity: all or nothing.\nConsistency: DB stays valid.\nIsolation: concurrent txns don\'t interfere.\nDurability: committed data persists even after crash.', tags: ['DBMS','Transactions'], confidence: 0 },
  { id: 'cc4', subject: 'DBMS', question: 'What is normalization? Why is it needed?', answer: 'Organizing DB to reduce redundancy and improve integrity.\n1NF: atomic values\n2NF: no partial dependency\n3NF: no transitive dependency\nBCNF: every determinant is candidate key', tags: ['DBMS','Normalization'], confidence: 0 },
  { id: 'cc5', subject: 'Networks', question: 'Explain the OSI model layers.', answer: '7. Application (HTTP, FTP)\n6. Presentation (SSL, encryption)\n5. Session (session management)\n4. Transport (TCP, UDP)\n3. Network (IP, routing)\n2. Data Link (MAC, frames)\n1. Physical (bits, cables)', tags: ['Networks','OSI'], confidence: 0 },
  { id: 'cc6', subject: 'Networks', question: 'TCP vs UDP — when to use each?', answer: 'TCP: reliable, ordered, connection-oriented. Use for HTTP, email, file transfer.\nUDP: fast, connectionless, no guarantee. Use for video streaming, DNS, gaming.', tags: ['Networks','TCP'], confidence: 0 },
  { id: 'cc7', subject: 'OOP', question: 'What are the 4 pillars of OOP?', answer: 'Encapsulation: hide internal state, expose via methods.\nAbstraction: show only necessary details.\nInheritance: child class reuses parent code.\nPolymorphism: same interface, different behavior.', tags: ['OOP'], confidence: 0 },
  { id: 'cc8', subject: 'OOP', question: 'What is the difference between abstract class and interface?', answer: 'Abstract class: can have implementation + state. Single inheritance.\nInterface: only contracts (Java 8+ allows default methods). Multiple inheritance.\nUse abstract class for "is-a", interface for "can-do".', tags: ['OOP','Java'], confidence: 0 },
];

const DEFAULT_CODE_SNIPPETS: CodeSnippet[] = [
  { id: 'cs1', title: 'BFS Template', language: 'python', tags: ['BFS','Graph','Tree'], createdAt: new Date().toISOString(), code: `from collections import deque\n\ndef bfs(graph, start):\n    visited = set()\n    q = deque([start])\n    visited.add(start)\n    while q:\n        node = q.popleft()\n        for neighbor in graph[node]:\n            if neighbor not in visited:\n                visited.add(neighbor)\n                q.append(neighbor)` },
  { id: 'cs2', title: 'Binary Search', language: 'python', tags: ['Binary Search'], createdAt: new Date().toISOString(), code: `def binary_search(arr, target):\n    lo, hi = 0, len(arr) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            lo = mid + 1\n        else:\n            hi = mid - 1\n    return -1` },
  { id: 'cs3', title: 'Union Find', language: 'python', tags: ['Graph','Union Find'], createdAt: new Date().toISOString(), code: `class UnionFind:\n    def __init__(self, n):\n        self.parent = list(range(n))\n        self.rank = [0] * n\n    def find(self, x):\n        if self.parent[x] != x:\n            self.parent[x] = self.find(self.parent[x])\n        return self.parent[x]\n    def union(self, x, y):\n        px, py = self.find(x), self.find(y)\n        if px == py: return False\n        if self.rank[px] < self.rank[py]: px, py = py, px\n        self.parent[py] = px\n        if self.rank[px] == self.rank[py]: self.rank[px] += 1\n        return True` },
  { id: 'cs4', title: 'AI: Dijkstra Shortest Path', language: 'python', tags: ['Graph','Shortest Path','AI'], createdAt: new Date().toISOString(), code: `import heapq\n\ndef dijkstra(graph, start):\n    # graph is an adjacency list: {node: [(neighbor, weight)]}\n    distances = {node: float('inf') for node in graph}\n    distances[start] = 0\n    pq = [(0, start)]\n    \n    while pq:\n        current_dist, current_node = heapq.heappop(pq)\n        \n        if current_dist > distances[current_node]:\n            continue\n            \n        for neighbor, weight in graph[current_node]:\n            distance = current_dist + weight\n            if distance < distances[neighbor]:\n                distances[neighbor] = distance\n                heapq.heappush(pq, (distance, neighbor))\n                \n    return distances` },
  { id: 'cs5', title: 'AI: Monotonic Stack', language: 'python', tags: ['Stack','Array','AI'], createdAt: new Date().toISOString(), code: `def next_greater_elements(nums):\n    """\n    Finds the next greater element for each element in the array.\n    Returns a list of the same length with the NGE, or -1 if none exists.\n    """\n    n = len(nums)\n    res = [-1] * n\n    stack = [] # Stores indices\n    \n    for i in range(n):\n        while stack and nums[stack[-1]] < nums[i]:\n            idx = stack.pop()\n            res[idx] = nums[i]\n        stack.append(i)\n        \n    return res` }
];


// ── Store ──────────────────────────────────────────────

interface AppState {
  customProblems: Problem[];
  addProblem: (p: Problem) => void;
  updateProblem: (id: string, updates: Partial<Problem>) => void;
  deleteProblem: (id: string) => void;

  // Hidden built-in problems (user "deleted" them from a pattern)
  hiddenProblems: string[];
  hideBuiltinProblem: (id: string) => void;
  unhideBuiltinProblem: (id: string) => void;

  attempts: Attempt[];
  addAttempt: (a: Attempt) => void;
  updateAttempt: (id: string, updates: Partial<Attempt>) => void;

  mistakes: MistakeEntry[];
  addMistake: (m: MistakeEntry) => void;
  resolveMistake: (id: string) => void;
  deleteMistake: (id: string) => void;

  mockContests: MockContest[];
  addMockContest: (c: MockContest) => void;
  finishMockContest: (id: string, results: MockContest['results'], score: number) => void;

  codeSnippets: CodeSnippet[];
  addSnippet: (s: CodeSnippet) => void;
  updateSnippet: (id: string, updates: Partial<CodeSnippet>) => void;
  deleteSnippet: (id: string) => void;

  conceptCards: ConceptCard[];
  addConceptCard: (c: ConceptCard) => void;
  updateConceptCard: (id: string, updates: Partial<ConceptCard>) => void;
  deleteConceptCard: (id: string) => void;
  rateConceptCard: (id: string, confidence: ConceptCard['confidence']) => void;

  resumeData: ResumeData;
  setResumeData: (data: Partial<ResumeData>) => void;

  problemNotes: ProblemNote[];
  setProblemNote: (problemId: string, content: string) => void;

  notes: Note[];
  addNote: (n: Note) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  touchNote: (id: string) => void;

  hrQuestions: HRQuestion[];
  setHRAnswer: (id: string, answer: string) => void;

  patternImages: PatternImage[];
  addPatternImage: (img: PatternImage) => void;
  removePatternImage: (patternId: string, url: string) => void;

  customPatterns: CustomPattern[];
  addPattern: (p: CustomPattern) => void;
  deletePattern: (id: string) => void;

  // Pattern ordering (array of pattern IDs in user-defined order)
  patternOrder: string[];
  reorderPatterns: (newOrder: string[]) => void;

  dashboardConfig: DashboardConfig;
  updateDashboardConfig: (updates: Partial<DashboardConfig>) => void;
  hideWidget: (widgetId: string) => void;
  unhideWidget: (widgetId: string) => void;
  reorderWidgets: (newOrder: string[]) => void;
  updateDailyGoal: (targetProblems: number, tasks: string[]) => void;

  solvedProblems: Record<string, { status: 'solved' | 'revision'; solvedAt: string; nextRevisionAt?: string }>;
  markSolved: (problemId: string, status: 'solved' | 'revision', nextRevisionAt?: string) => void;
}

const DEFAULT_RESUME: ResumeData = {
  name: '', email: '', phone: '', college: '', degree: 'B.Tech Computer Science',
  graduationYear: '2026', cgpa: '', skills: '', achievements: '', links: '',
  projects: [{ title: '', tech: '', description: '' }],
};

const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
  widgetOrder: ['stats', 'patterns', 'revision', 'goal', 'heatmap', 'companies', 'cheatsheet'],
  hiddenWidgets: [],
  dailyGoal: {
    targetProblems: 5,
    tasks: ['Solve 2 Easy problems', 'Complete 1 Medium', 'Solve 1 Hard', 'Review 1 revision', 'Take aptitude quiz'],
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      customProblems: [],
      addProblem: (p) => set((s) => ({ customProblems: [...s.customProblems, { ...p, addedAt: p.addedAt ?? new Date().toISOString() }] })),
      updateProblem: (id, u) => set((s) => ({ customProblems: s.customProblems.map((p) => p.id === id ? { ...p, ...u } : p) })),
      deleteProblem: (id) => set((s) => ({ customProblems: s.customProblems.filter((p) => p.id !== id) })),

      hiddenProblems: [],
      hideBuiltinProblem: (id) => set((s) => ({ hiddenProblems: [...s.hiddenProblems, id] })),
      unhideBuiltinProblem: (id) => set((s) => ({ hiddenProblems: s.hiddenProblems.filter((h) => h !== id) })),

      attempts: [],
      addAttempt: (a) => set((s) => ({ attempts: [a, ...s.attempts] })),
      updateAttempt: (id, updates) => set((s) => ({ attempts: s.attempts.map((a) => a.id === id ? { ...a, ...updates } : a) })),

      mistakes: [],
      addMistake: (m) => set((s) => ({ mistakes: [m, ...s.mistakes] })),
      resolveMistake: (id) => set((s) => ({ mistakes: s.mistakes.map((m) => m.id === id ? { ...m, resolved: true } : m) })),
      deleteMistake: (id) => set((s) => ({ mistakes: s.mistakes.filter((m) => m.id !== id) })),

      mockContests: [],
      addMockContest: (c) => set((s) => ({ mockContests: [c, ...s.mockContests] })),
      finishMockContest: (id, results, score) =>
        set((s) => ({
          mockContests: s.mockContests.map((c) =>
            c.id === id ? { ...c, finishedAt: new Date().toISOString(), results, score } : c
          ),
        })),

      codeSnippets: DEFAULT_CODE_SNIPPETS,
      addSnippet: (s) => set((st) => ({ codeSnippets: [s, ...st.codeSnippets] })),
      updateSnippet: (id, u) => set((s) => ({ codeSnippets: s.codeSnippets.map((c) => c.id === id ? { ...c, ...u } : c) })),
      deleteSnippet: (id) => set((s) => ({ codeSnippets: s.codeSnippets.filter((c) => c.id !== id) })),

      conceptCards: DEFAULT_CONCEPT_CARDS,
      addConceptCard: (c) => set((s) => ({ conceptCards: [c, ...s.conceptCards] })),
      updateConceptCard: (id, u) => set((s) => ({ conceptCards: s.conceptCards.map((c) => c.id === id ? { ...c, ...u } : c) })),
      deleteConceptCard: (id) => set((s) => ({ conceptCards: s.conceptCards.filter((c) => c.id !== id) })),
      rateConceptCard: (id, confidence) =>
        set((s) => ({
          conceptCards: s.conceptCards.map((c) =>
            c.id === id ? { ...c, confidence, lastReviewed: new Date().toISOString() } : c
          ),
        })),

      resumeData: DEFAULT_RESUME,
      setResumeData: (data) => set((s) => ({ resumeData: { ...s.resumeData, ...data } })),

      problemNotes: [],
      setProblemNote: (problemId, content) =>
        set((s) => {
          const ex = s.problemNotes.find((n) => n.problemId === problemId);
          if (ex) return { problemNotes: s.problemNotes.map((n) => n.problemId === problemId ? { ...n, content, updatedAt: new Date().toISOString() } : n) };
          return { problemNotes: [...s.problemNotes, { problemId, content, updatedAt: new Date().toISOString() }] };
        }),

      notes: [],
      addNote: (n) => set((s) => ({ notes: [n, ...s.notes] })),
      updateNote: (id, u) => set((s) => ({ notes: s.notes.map((n) => n.id === id ? { ...n, ...u, updatedAt: new Date().toISOString() } : n) })),
      deleteNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
      touchNote: (id) => set((s) => ({ notes: s.notes.map((n) => n.id === id ? { ...n, lastVisited: new Date().toISOString() } : n) })),

      hrQuestions: DEFAULT_HR_QUESTIONS,
      setHRAnswer: (id, answer) =>
        set((s) => ({ hrQuestions: s.hrQuestions.map((q) => q.id === id ? { ...q, myAnswer: answer, updatedAt: new Date().toISOString() } : q) })),

      patternImages: [],
      addPatternImage: (img) => set((s) => ({ patternImages: [...s.patternImages, img] })),
      removePatternImage: (patternId, url) =>
        set((s) => ({ patternImages: s.patternImages.filter((i) => !(i.patternId === patternId && i.url === url)) })),

      customPatterns: [],
      addPattern: (p) => set((s) => ({ customPatterns: [...s.customPatterns, p] })),
      deletePattern: (id) =>
        set((s) => ({
          customPatterns: s.customPatterns.filter((p) => p.id !== id),
          customProblems: s.customProblems.filter((p) => p.patternId !== id),
          patternOrder: s.patternOrder.filter((oid) => oid !== id),
        })),

      patternOrder: [],
      reorderPatterns: (newOrder) => set(() => ({ patternOrder: newOrder })),

      dashboardConfig: DEFAULT_DASHBOARD_CONFIG,
      updateDashboardConfig: (updates) => set((s) => ({ dashboardConfig: { ...s.dashboardConfig, ...updates } })),
      hideWidget: (widgetId) => set((s) => ({ dashboardConfig: { ...s.dashboardConfig, hiddenWidgets: [...s.dashboardConfig.hiddenWidgets, widgetId] } })),
      unhideWidget: (widgetId) => set((s) => ({ dashboardConfig: { ...s.dashboardConfig, hiddenWidgets: s.dashboardConfig.hiddenWidgets.filter((w) => w !== widgetId) } })),
      reorderWidgets: (newOrder) => set((s) => ({ dashboardConfig: { ...s.dashboardConfig, widgetOrder: newOrder } })),
      updateDailyGoal: (targetProblems, tasks) => set((s) => ({ dashboardConfig: { ...s.dashboardConfig, dailyGoal: { targetProblems, tasks } } })),

      solvedProblems: {},
      markSolved: (problemId, status, nextRevisionAt) =>
        set((s) => ({ solvedProblems: { ...s.solvedProblems, [problemId]: { status, solvedAt: new Date().toISOString(), nextRevisionAt } } })),
    }),
    { name: 'prepos-storage' }
  )
);
