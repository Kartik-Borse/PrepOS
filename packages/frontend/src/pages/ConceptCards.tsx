import { useState } from 'react';
import { Plus, X, RotateCcw, Trash2 } from 'lucide-react';
import { useAppStore, ConceptCard } from '../store/useAppStore';
import './ConceptCards.css';

const SUBJECTS = ['All', 'OS', 'DBMS', 'Networks', 'OOP', 'System Design', 'Other'];
const CONF_LABELS = ['New', 'Hard', 'Okay', 'Easy'];
const CONF_COLORS = ['var(--text-faint)', 'var(--error)', 'var(--warning)', 'var(--success)'];

function AddCardModal({ onClose, onAdd }: { onClose: () => void; onAdd: (c: ConceptCard) => void }) {
  const [subject, setSubject] = useState('OS');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [tags, setTags] = useState('');

  const submit = () => {
    if (!question.trim() || !answer.trim()) return;
    onAdd({ id: crypto.randomUUID(), subject, question: question.trim(), answer: answer.trim(), tags: tags.split(',').map(t => t.trim()).filter(Boolean), confidence: 0 });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create Concept Card</h3>
          <button onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="form-row-2">
            <div className="form-field">
              <label>Subject</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                {SUBJECTS.slice(1).map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Tags</label>
              <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Deadlock, Scheduling…" />
            </div>
          </div>
          <div className="form-field">
            <label>Question *</label>
            <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g. What is a deadlock?" rows={2} autoFocus />
          </div>
          <div className="form-field">
            <label>Answer *</label>
            <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Write the answer here…" rows={5} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-primary-sm" onClick={submit} disabled={!question.trim() || !answer.trim()}>Add Card</button>
        </div>
      </div>
    </div>
  );
}

export default function ConceptCards() {
  const { conceptCards, addConceptCard, deleteConceptCard, rateConceptCard } = useAppStore();
  const [subject, setSubject] = useState('All');
  const [mode, setMode] = useState<'grid' | 'review'>('grid');
  const [reviewIdx, setReviewIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const filtered = subject === 'All' ? conceptCards : conceptCards.filter((c) => c.subject === subject);
  const reviewCards = filtered.filter((c) => c.confidence < 3);

  const rate = (conf: ConceptCard['confidence']) => {
    rateConceptCard(reviewCards[reviewIdx]?.id, conf);
    setFlipped(false);
    if (reviewIdx < reviewCards.length - 1) setReviewIdx((i) => i + 1);
    else setMode('grid');
  };

  if (mode === 'review' && reviewCards.length > 0) {
    const card = reviewCards[reviewIdx];
    return (
      <div className="concept-cards-page">
        <div className="cc-review-header">
          <button className="back-btn" onClick={() => { setMode('grid'); setFlipped(false); setReviewIdx(0); }}>← Back</button>
          <span>{reviewIdx + 1} / {reviewCards.length} cards</span>
          <span className="cc-subject-tag">{card.subject}</span>
        </div>

        <div className={`cc-flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)}>
          <div className="ccf-front">
            <div className="ccf-label">Question</div>
            <p>{card.question}</p>
            <div className="ccf-tap-hint">Tap to reveal answer</div>
          </div>
          <div className="ccf-back">
            <div className="ccf-label">Answer</div>
            <pre>{card.answer}</pre>
          </div>
        </div>

        {flipped && (
          <div className="cc-rate-row">
            <p className="cc-rate-label">How well did you know this?</p>
            {([0, 1, 2, 3] as ConceptCard['confidence'][]).map((c) => (
              <button key={c} className="cc-rate-btn" style={{ borderColor: CONF_COLORS[c], color: CONF_COLORS[c] }} onClick={() => rate(c)}>
                {CONF_LABELS[c]}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="concept-cards-page">
      <div className="cc-header">
        <div><h1>Concept Cards</h1><p className="sub">Flashcard-style Core CS revision</p></div>
        <div className="cc-header-actions">
          {reviewCards.length > 0 && (
            <button className="review-btn" onClick={() => { setMode('review'); setReviewIdx(0); setFlipped(false); }}>
              <RotateCcw size={14} /> Review {reviewCards.length} cards
            </button>
          )}
          <button className="btn-add" onClick={() => setShowAdd(true)}><Plus size={14} /> Add Card</button>
        </div>
      </div>

      <div className="cc-subject-filter">
        {SUBJECTS.map((s) => (
          <button key={s} className={`sf-btn ${subject === s ? 'active' : ''}`} onClick={() => setSubject(s)}>{s}</button>
        ))}
      </div>

      <div className="cc-grid">
        {filtered.map((card) => (
          <div key={card.id} className="cc-card" style={{ borderColor: CONF_COLORS[card.confidence] + '44' }}>
            <div className="ccc-top">
              <span className="ccc-subject">{card.subject}</span>
              <span className="ccc-conf" style={{ color: CONF_COLORS[card.confidence] }}>{CONF_LABELS[card.confidence]}</span>
              <button className="ccc-del" onClick={() => deleteConceptCard(card.id)}><Trash2 size={12} /></button>
            </div>
            <p className="ccc-q">{card.question}</p>
            <div className="ccc-tags">{card.tags.map((t) => <span key={t} className="cc-tag">{t}</span>)}</div>
            {card.lastReviewed && <div className="ccc-meta">Reviewed {new Date(card.lastReviewed).toLocaleDateString()}</div>}
          </div>
        ))}
        {filtered.length === 0 && <p className="cc-empty">No cards for this subject. Add some!</p>}
      </div>

      {showAdd && <AddCardModal onClose={() => setShowAdd(false)} onAdd={addConceptCard} />}
    </div>
  );
}
