import { useState } from 'react';
import { CheckCircle2, XCircle, ChevronRight, Lightbulb } from 'lucide-react';
import './Aptitude.css';

// ── Topic data with shortcuts ──────────────────────────────────────────────

const TOPICS = [
  {
    id: 'time-work', category: 'Quantitative', label: 'Time & Work',
    shortcut: 'If A does work in x days and B in y days, together = xy/(x+y) days. Pipes: add rates (1/x + 1/y).',
    shortcutFormulas: ['Combined rate = 1/x + 1/y', 'Time together = xy/(x+y)', 'Efficiency ∝ 1/Time'],
  },
  {
    id: 'speed-distance', category: 'Quantitative', label: 'Speed, Distance & Time',
    shortcut: 'Distance = Speed × Time. Average speed = 2xy/(x+y) for equal distances at speeds x and y.',
    shortcutFormulas: ['D = S × T', 'Avg speed (equal dist) = 2xy/(x+y)', 'Relative speed (opp) = S1+S2'],
  },
  {
    id: 'percentages', category: 'Quantitative', label: 'Percentages',
    shortcut: 'x% of y = y% of x. If price up by r%, to restore original: decrease by r/(100+r) × 100.',
    shortcutFormulas: ['x% of y = xy/100', 'Successive: (a+b+ab/100)%', 'Population: P(1±r/100)^n'],
  },
  {
    id: 'profit-loss', category: 'Quantitative', label: 'Profit & Loss',
    shortcut: 'If two items sold at same price, one at x% profit and other at x% loss → always a loss of (x/10)²%.',
    shortcutFormulas: ['Profit% = (Profit/CP)×100', 'SP = CP×(100+P%)/100', 'Marked price + Discount = SP'],
  },
  {
    id: 'blood-relations', category: 'Logical', label: 'Blood Relations',
    shortcut: 'Draw a family tree. Key: "X is the son of Y\'s father" means X is Y\'s brother/uncle.',
    shortcutFormulas: ['Son/Daughter of Father = Sibling', 'Mother\'s brother = Uncle', 'Draw tree for complex Qs'],
  },
  {
    id: 'syllogisms', category: 'Logical', label: 'Syllogisms',
    shortcut: 'Use Venn diagrams. "All A are B" = A circle inside B. "No A is B" = disjoint circles.',
    shortcutFormulas: ['All A→B + All B→C = All A→C', '"Some" = at least one', '"No" = completely separate'],
  },
  {
    id: 'reading-comp', category: 'Verbal', label: 'Reading Comprehension',
    shortcut: 'Read the questions FIRST, then the passage. Eliminate extreme/absolute options.',
    shortcutFormulas: ['Read Qs first', 'Eliminate "always/never"', 'Tone: +ve/-ve/neutral?'],
  },
];

interface Question {
  id: string;
  topicId: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  shortcut?: string;
}

const QUESTIONS: Question[] = [
  {
    id: 'q1', topicId: 'time-work',
    question: 'A can do a piece of work in 10 days and B in 15 days. How many days will they take together?',
    options: ['5 days', '6 days', '8 days', '12 days'],
    correct: 1,
    explanation: 'Together = (10×15)/(10+15) = 150/25 = 6 days.',
    shortcut: 'Combined time = xy/(x+y) = 10×15/(10+15) = 6',
  },
  {
    id: 'q2', topicId: 'speed-distance',
    question: 'A train travels 360 km at 90 km/h and stops 5 min at each of 4 stations. Total time?',
    options: ['4h 20min', '5h 0min', '4h 40min', '4h 50min'],
    correct: 0,
    explanation: 'Travel: 360/90 = 4h. Stops: 4×5 = 20min. Total = 4h 20min.',
    shortcut: 'T = D/S then add stops',
  },
  {
    id: 'q3', topicId: 'percentages',
    question: 'If price of a commodity is increased by 25%, by what % should it be decreased to restore?',
    options: ['20%', '25%', '22%', '18%'],
    correct: 0,
    explanation: '25/(100+25)×100 = 25/125×100 = 20%',
    shortcut: 'Restore% = r/(100+r)×100',
  },
  {
    id: 'q4', topicId: 'profit-loss',
    question: 'Two articles sold at ₹1200 each — one at 20% profit, other at 20% loss. Net result?',
    options: ['No profit no loss', '4% loss', '4% profit', '2% loss'],
    correct: 1,
    explanation: 'Net loss = (20/10)² = 4% loss. This is a classic trap!',
    shortcut: 'Same price same %: loss = (x/10)²%',
  },
  {
    id: 'q5', topicId: 'blood-relations',
    question: 'A is the brother of B. B is the sister of C. C is the son of D. How is D related to A?',
    options: ['Father', 'Mother', 'Parent (either)', 'Uncle'],
    correct: 2,
    explanation: 'C is D\'s son → D is parent. A and B are siblings. B is C\'s sister → A is C\'s sibling → D is A\'s parent.',
    shortcut: 'Draw the family tree!',
  },
];

type Mode = 'topics' | 'shortcut' | 'practice' | 'result';

export default function Aptitude() {
  const [activeTopic, setActiveTopic] = useState<typeof TOPICS[0] | null>(null);
  const [mode, setMode] = useState<Mode>('topics');
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [filter, setFilter] = useState<'All' | 'Quantitative' | 'Logical' | 'Verbal'>('All');

  const topicQuestions = activeTopic ? QUESTIONS.filter((q) => q.topicId === activeTopic.id) : [];
  const currentQ = topicQuestions[qIdx];
  const filteredTopics = TOPICS.filter((t) => filter === 'All' || t.category === filter);

  const startTopic = (topic: typeof TOPICS[0]) => {
    setActiveTopic(topic);
    setMode('shortcut');
    setQIdx(0);
    setSelected(null);
    setSubmitted(false);
    setAnswers([]);
  };

  const startPractice = () => {
    setMode('practice');
    setSelected(null);
    setSubmitted(false);
  };

  const submitAnswer = () => {
    if (selected === null) return;
    setSubmitted(true);
    const newAnswers = [...answers];
    newAnswers[qIdx] = selected;
    setAnswers(newAnswers);
  };

  const nextQ = () => {
    if (qIdx < topicQuestions.length - 1) {
      setQIdx((i) => i + 1);
      setSelected(null);
      setSubmitted(false);
    } else {
      setMode('result');
    }
  };

  const score = answers.filter((a, i) => a === topicQuestions[i]?.correct).length;

  // Topics list
  if (mode === 'topics') return (
    <div className="aptitude-page">
      <div className="page-header-row">
        <div><h1>Aptitude Practice</h1><p className="sub">Topic-wise with shortcuts — master each concept before mixed tests</p></div>
      </div>
      <div className="apt-filter">
        {(['All', 'Quantitative', 'Logical', 'Verbal'] as const).map((f) => (
          <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>
      <div className="topics-grid">
        {filteredTopics.map((topic) => (
          <div key={topic.id} className="topic-card" onClick={() => startTopic(topic)}>
            <div className="tc-header">
              <div>
                <span className="tc-cat">{topic.category}</span>
                <h3>{topic.label}</h3>
              </div>
              <ChevronRight size={18} className="tc-arrow" />
            </div>
            <div className="tc-shortcut-preview">
              <Lightbulb size={12} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span>{topic.shortcutFormulas[0]}</span>
            </div>
            <div className="tc-footer">
              <span>{QUESTIONS.filter((q) => q.topicId === topic.id).length} questions</span>
              <button className="btn-sm-primary">Practice →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Shortcut view before practice
  if (mode === 'shortcut' && activeTopic) return (
    <div className="aptitude-page">
      <button className="back-link" onClick={() => setMode('topics')}>← All Topics</button>
      <div className="shortcut-page">
        <div className="sp-badge">{activeTopic.category}</div>
        <h1>{activeTopic.label} — Key Shortcuts</h1>
        <p className="sub">Learn these before attempting questions. Saves 60–80% solving time.</p>

        <div className="shortcut-main">{activeTopic.shortcut}</div>

        <div className="formula-grid">
          {activeTopic.shortcutFormulas.map((f, i) => (
            <div key={i} className="formula-card">
              <span className="formula-num">{i + 1}</span>
              <code>{f}</code>
            </div>
          ))}
        </div>

        <div className="shortcut-actions">
          <button className="btn-primary-lg" onClick={startPractice}>Start Practice ({topicQuestions.length} Qs)</button>
        </div>
      </div>
    </div>
  );

  // Practice mode
  if (mode === 'practice' && currentQ) return (
    <div className="aptitude-page">
      <div className="practice-topbar">
        <button className="back-link" onClick={() => setMode('shortcut')}>← {activeTopic?.label}</button>
        <div className="q-progress">
          {topicQuestions.map((_, i) => (
            <div key={i} className={`q-dot ${i === qIdx ? 'current' : answers[i] !== undefined ? (answers[i] === topicQuestions[i]?.correct ? 'correct' : 'wrong') : ''}`} />
          ))}
        </div>
        <span className="q-counter">{qIdx + 1} / {topicQuestions.length}</span>
      </div>

      <div className="practice-body">
        {/* Shortcut reminder */}
        {currentQ.shortcut && (
          <div className="shortcut-reminder">
            <Lightbulb size={13} style={{ color: 'var(--primary)' }} />
            <span><strong>Shortcut:</strong> {currentQ.shortcut}</span>
          </div>
        )}

        <div className="question-card">
          <p className="question-text">{currentQ.question}</p>
          <div className="options-list">
            {currentQ.options.map((opt, i) => {
              let cls = 'option';
              if (submitted) {
                if (i === currentQ.correct) cls += ' correct';
                else if (i === selected) cls += ' wrong';
              } else if (selected === i) cls += ' selected';
              return (
                <button key={i} className={cls} onClick={() => !submitted && setSelected(i)} aria-pressed={selected === i}>
                  <span className="opt-letter">{String.fromCharCode(65 + i)}</span>
                  <span>{opt}</span>
                  {submitted && i === currentQ.correct && <CheckCircle2 size={14} className="opt-icon" style={{ color: 'var(--success)' }} />}
                  {submitted && i === selected && i !== currentQ.correct && <XCircle size={14} className="opt-icon" style={{ color: 'var(--error)' }} />}
                </button>
              );
            })}
          </div>

          {submitted && (
            <div className="explanation-box">
              <strong>Explanation:</strong> {currentQ.explanation}
            </div>
          )}
        </div>

        <div className="practice-actions">
          {!submitted ? (
            <button className="btn-primary-lg" disabled={selected === null} onClick={submitAnswer}>Submit</button>
          ) : (
            <button className="btn-primary-lg" onClick={nextQ}>
              {qIdx < topicQuestions.length - 1 ? 'Next Question →' : 'See Results'}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Result
  if (mode === 'result') return (
    <div className="aptitude-page">
      <div className="result-page">
        <div className="result-score">
          <div className="rs-ring">
            <svg viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border)" strokeWidth="7" />
              <circle cx="40" cy="40" r="32" fill="none" stroke="var(--primary)" strokeWidth="7"
                strokeDasharray={`${2 * Math.PI * 32 * score / topicQuestions.length} ${2 * Math.PI * 32}`}
                strokeLinecap="round" transform="rotate(-90 40 40)" />
            </svg>
            <div className="rs-inner"><span>{score}/{topicQuestions.length}</span><small>correct</small></div>
          </div>
          <h2>{activeTopic?.label} Complete!</h2>
          <p className="sub">{score === topicQuestions.length ? '🎉 Perfect score!' : score >= topicQuestions.length / 2 ? '✅ Good job! Review the explanations.' : '📖 Review shortcuts and try again.'}</p>
        </div>
        <div className="result-review">
          {topicQuestions.map((q, i) => (
            <div key={q.id} className={`rr-item ${answers[i] === q.correct ? 'pass' : 'fail'}`}>
              <div className="rr-top">
                <span>{answers[i] === q.correct ? '✓' : '✗'} Q{i + 1}</span>
                <span>{q.options[q.correct]}</span>
              </div>
              <div className="rr-exp">{q.explanation}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button className="btn-primary-lg" onClick={() => { setMode('topics'); setActiveTopic(null); }}>Back to Topics</button>
          <button className="btn-outline-lg" onClick={() => startTopic(activeTopic!)}>Retry</button>
        </div>
      </div>
    </div>
  );

  return null;
}
