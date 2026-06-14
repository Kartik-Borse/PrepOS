import { useState } from 'react';
import { Edit3, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import './HRQuestions.css';

const CATEGORIES = ['Introduction', 'Strengths & Weaknesses', 'Motivation', 'Career Goals', 'Behavioral (STAR)', 'Work Style', 'Achievements', 'Closing'];

const STAR_TIP = 'Use STAR Method: Situation → Task → Action → Result. Keep answer under 2 minutes. Be specific with metrics.';

export default function HRQuestions() {
  const { hrQuestions, setHRAnswer } = useAppStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [saved, setSaved] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const openEdit = (id: string) => {
    const q = hrQuestions.find((q) => q.id === id);
    setActiveId(id);
    setEditText(q?.myAnswer ?? '');
  };

  const saveAnswer = (id: string) => {
    setHRAnswer(id, editText);
    setSaved(id);
    setActiveId(null);
    setTimeout(() => setSaved(null), 1500);
  };

  const toggleCat = (cat: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  return (
    <div className="hr-page">
      <div className="page-header-row">
        <div>
          <h1>HR Questions Bank</h1>
          <p className="sub">Most-asked placement HR questions — write your personal answers</p>
        </div>
        <div className="hr-stats">
          <span className="hr-stat">{hrQuestions.filter((q) => q.myAnswer).length}/{hrQuestions.length} answered</span>
        </div>
      </div>

      <div className="star-tip">
        <strong>STAR Method:</strong> {STAR_TIP}
      </div>

      <div className="hr-categories">
        {CATEGORIES.map((cat) => {
          const qs = hrQuestions.filter((q) => q.category === cat);
          if (qs.length === 0) return null;
          const isCollapsed = collapsed.has(cat);
          const answered = qs.filter((q) => q.myAnswer).length;
          return (
            <div key={cat} className="hr-category">
              <button className="hr-cat-header" onClick={() => toggleCat(cat)}>
                <div className="hch-left">
                  {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                  <span className="hch-name">{cat}</span>
                  <span className="hch-count">{answered}/{qs.length}</span>
                </div>
                <div className="hch-bar-wrap">
                  <div className="hch-bar" style={{ width: `${qs.length ? (answered / qs.length) * 100 : 0}%` }} />
                </div>
              </button>

              {!isCollapsed && (
                <div className="hr-questions">
                  {qs.map((q) => (
                    <div key={q.id} className={`hr-item ${q.myAnswer ? 'answered' : ''} ${activeId === q.id ? 'editing' : ''}`}>
                      <div className="hi-question">
                        <p>{q.question}</p>
                        <button className="edit-btn" onClick={() => activeId === q.id ? saveAnswer(q.id) : openEdit(q.id)} aria-label={activeId === q.id ? 'Save' : 'Edit'}>
                          {activeId === q.id ? <Check size={14} /> : <Edit3 size={14} />}
                        </button>
                      </div>

                      {activeId === q.id ? (
                        <div className="hi-editor">
                          <textarea
                            className="hr-textarea"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            placeholder="Write your personal answer here. Use STAR format for behavioral questions…"
                            rows={5}
                            autoFocus
                            aria-label="Your answer"
                          />
                          <div className="hi-editor-actions">
                            <button className="cancel-btn" onClick={() => setActiveId(null)}>Cancel</button>
                            <button className="save-answer-btn" onClick={() => saveAnswer(q.id)}>Save Answer</button>
                          </div>
                        </div>
                      ) : q.myAnswer ? (
                        <div className="hi-answer" onClick={() => openEdit(q.id)}>
                          <div className="ha-content">{q.myAnswer}</div>
                          {q.updatedAt && <div className="ha-meta">Updated {new Date(q.updatedAt).toLocaleDateString()}</div>}
                        </div>
                      ) : (
                        <button className="add-answer-btn" onClick={() => openEdit(q.id)}>+ Add your answer</button>
                      )}

                      {saved === q.id && <div className="saved-flash">✓ Saved</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
