import { useState, useRef } from 'react';
import { Sparkles, Download, X, Loader2, AlertCircle, ImageDown } from 'lucide-react';
import { api } from '../lib/api';
import './CheatsheetGenerator.css';

interface CheatsheetData {
  title: string;
  tag: string;
  color: string;
  sections: { heading: string; lines: string[] }[];
}

interface Props {
  onClose: () => void;
  onSave?: (sheet: CheatsheetData & { type: string; topic: string }) => void;
}

const TYPES = [
  { key: 'code',     label: 'Code Template',   emoji: '💻', desc: 'Patterns & templates' },
  { key: 'concepts', label: 'Concepts',         emoji: '🧠', desc: 'Definitions & properties' },
  { key: 'formulas', label: 'Formulas',         emoji: '📐', desc: 'Shortcuts & math tricks' },
  { key: 'revision', label: 'Quick Revision',   emoji: '⚡', desc: '80/20 must-knows' },
];

const LANGUAGES = ['python', 'javascript', 'java', 'cpp'];

const TOPIC_SUGGESTIONS: Record<string, string[]> = {
  code:     ['Sliding Window', 'Binary Search', 'BFS/DFS', 'Dynamic Programming', 'Two Pointers', 'Backtracking', 'Union Find'],
  concepts: ['Operating Systems', 'DBMS & SQL', 'Computer Networks', 'OOP Principles', 'System Design Basics', 'Trees & Graphs'],
  formulas: ['Time & Work', 'Percentages', 'Probability', 'Permutations & Combinations', 'Number Series', 'Profit & Loss'],
  revision: ['Sorting Algorithms', 'Hash Maps', 'Heap', 'Stack & Queue', 'Linked Lists', 'Recursion'],
};

export default function CheatsheetGenerator({ onClose, onSave }: Props) {
  const [topic, setTopic] = useState('');
  const [type, setType] = useState('concepts');
  const [language, setLanguage] = useState('python');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sheet, setSheet] = useState<CheatsheetData | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    setSheet(null);
    try {
      const { cheatsheet } = await api.generateCheatsheet(topic.trim(), type, language);
      setSheet(cheatsheet);
    } catch (err: any) {
      setError(err.message?.includes('GEMINI_API_KEY')
        ? 'Add your GEMINI_API_KEY to packages/backend/.env'
        : err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadAsImage = async () => {
    if (!cardRef.current || !sheet) return;
    // Use html2canvas via dynamic import
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: '#0f1117',
      scale: 2,
      useCORS: true,
    });
    const link = document.createElement('a');
    link.download = `${sheet.tag}-${type}-cheatsheet.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const saveToSlideshow = () => {
    if (!sheet) return;
    onSave?.({ ...sheet, type, topic });
    onClose();
  };

  const color = sheet?.color ?? '#f89f1b';

  return (
    <div className="csg-overlay" onClick={onClose}>
      <div className="csg-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="csg-header">
          <div className="csg-title"><Sparkles size={16} /> AI Cheatsheet Generator</div>
          <button className="csg-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="csg-body">
          {/* Left — Config */}
          <div className="csg-config">
            {/* Type selector */}
            <div className="csg-section">
              <label>Type</label>
              <div className="csg-type-grid">
                {TYPES.map(t => (
                  <button key={t.key} className={`csg-type-btn ${type === t.key ? 'active' : ''}`}
                    onClick={() => setType(t.key)}>
                    <span>{t.emoji}</span>
                    <div>
                      <div className="csg-type-label">{t.label}</div>
                      <div className="csg-type-desc">{t.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Topic input */}
            <div className="csg-section">
              <label>Topic</label>
              <input
                className="csg-input"
                placeholder="e.g. Sliding Window, DBMS, Probability…"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && generate()}
                autoFocus
              />
              <div className="csg-suggestions">
                {(TOPIC_SUGGESTIONS[type] ?? []).map(s => (
                  <button key={s} className="csg-suggest" onClick={() => setTopic(s)}>{s}</button>
                ))}
              </div>
            </div>

            {/* Language (only for code type) */}
            {type === 'code' && (
              <div className="csg-section">
                <label>Language</label>
                <div className="csg-lang-row">
                  {LANGUAGES.map(l => (
                    <button key={l} className={`csg-lang-btn ${language === l ? 'active' : ''}`}
                      onClick={() => setLanguage(l)}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && <div className="csg-error"><AlertCircle size={14} />{error}</div>}

            <button className="csg-gen-btn" onClick={generate} disabled={loading || !topic.trim()}>
              {loading
                ? <><Loader2 size={15} className="spin" /> Generating…</>
                : <><Sparkles size={15} /> Generate Cheatsheet</>}
            </button>
          </div>

          {/* Right — Preview */}
          <div className="csg-preview">
            {!sheet && !loading && (
              <div className="csg-empty">
                <Sparkles size={32} style={{ color: 'var(--text-faint)', opacity: 0.4 }} />
                <p>Your cheatsheet will appear here</p>
              </div>
            )}
            {loading && (
              <div className="csg-empty">
                <Loader2 size={32} className="spin" style={{ color: 'var(--primary)' }} />
                <p>Gemini is generating your cheatsheet…</p>
              </div>
            )}

            {sheet && (
              <>
                {/* The visual card — this is what gets exported */}
                <div className="csg-card-wrap" ref={cardRef}>
                  <div className="csg-card" style={{ '--card-color': color } as React.CSSProperties}>
                    {/* Card header */}
                    <div className="csg-card-header" style={{ background: color + '22', borderBottom: `1px solid ${color}33` }}>
                      <span className="csg-card-tag" style={{ background: color + '33', color }}>
                        {sheet.tag}
                      </span>
                      <span className="csg-card-title">{sheet.title}</span>
                      <span className="csg-card-type-badge">{TYPES.find(t => t.key === type)?.emoji} {type}</span>
                    </div>

                    {/* Sections */}
                    <div className="csg-card-body">
                      {sheet.sections.map((sec, i) => (
                        <div key={i} className="csg-section-block">
                          <div className="csg-sec-heading" style={{ color }}>{sec.heading}</div>
                          <div className="csg-sec-lines">
                            {sec.lines.map((line, j) => (
                              <div key={j} className={`csg-line ${type === 'code' ? 'csg-code-line' : ''}`}>
                                {type !== 'code' && <span className="csg-bullet" style={{ color }}>▸</span>}
                                <span>{line}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="csg-card-footer">
                      <span>PrepOS · AI Generated</span>
                      <span style={{ color }}>{sheet.tag}</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="csg-actions">
                  <button className="csg-action-btn" onClick={downloadAsImage}>
                    <ImageDown size={14} /> Download PNG
                  </button>
                  <button className="csg-action-btn primary" onClick={saveToSlideshow}>
                    <Download size={14} /> Add to Slideshow
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
