import { useState } from 'react';
import { Plus, X, Copy, Trash2, Check } from 'lucide-react';
import { useAppStore, CodeSnippet } from '../store/useAppStore';
import './CodeSnippets.css';

const LANGS = ['All', 'python', 'javascript', 'cpp', 'java'];

function AddSnippetModal({ onClose, onAdd }: { onClose: () => void; onAdd: (s: CodeSnippet) => void }) {
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [tags, setTags] = useState('');

  const submit = () => {
    if (!title.trim() || !code.trim()) return;
    onAdd({ id: crypto.randomUUID(), title: title.trim(), language, code: code.trim(), tags: tags.split(',').map(t => t.trim()).filter(Boolean), createdAt: new Date().toISOString() });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Save Code Snippet</h3>
          <button onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="form-row-2">
            <div className="form-field">
              <label>Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. BFS Template" autoFocus />
            </div>
            <div className="form-field">
              <label>Language</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                {LANGS.slice(1).map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="form-field">
            <label>Tags</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="BFS, Graph, Template…" />
          </div>
          <div className="form-field">
            <label>Code *</label>
            <textarea value={code} onChange={(e) => setCode(e.target.value)} placeholder="Paste your code here…" rows={10} className="code-ta" />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-primary-sm" onClick={submit} disabled={!title.trim() || !code.trim()}>Save Snippet</button>
        </div>
      </div>
    </div>
  );
}

export default function CodeSnippets() {
  const { codeSnippets, addSnippet, deleteSnippet } = useAppStore();
  const [langFilter, setLangFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = codeSnippets.filter((s) => {
    const matchLang = langFilter === 'All' || s.language === langFilter;
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) || s.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchLang && matchSearch;
  });

  const copy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="code-snippets-page">
      <div className="cs-header">
        <div><h1>Code Snippets</h1><p className="sub">Your personal template library — copy-paste into editor</p></div>
        <button className="btn-add" onClick={() => setShowAdd(true)}><Plus size={14} /> Save Snippet</button>
      </div>

      <div className="cs-filters">
        <input className="cs-search" placeholder="Search snippets…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="lang-filter">
          {LANGS.map((l) => (
            <button key={l} className={`lf-btn ${langFilter === l ? 'active' : ''}`} onClick={() => setLangFilter(l)}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="cs-grid">
        {filtered.length === 0 && <p className="cs-empty">No snippets found. Save your first template!</p>}
        {filtered.map((s) => (
          <div key={s.id} className={`cs-card ${expanded === s.id ? 'expanded' : ''}`}>
            <div className="csc-top">
              <div className="csc-info">
                <span className="csc-lang">{s.language}</span>
                <h3 className="csc-title">{s.title}</h3>
              </div>
              <div className="csc-actions">
                <button className={`copy-btn ${copied === s.id ? 'copied' : ''}`} onClick={() => copy(s.id, s.code)} title="Copy to clipboard">
                  {copied === s.id ? <Check size={13} /> : <Copy size={13} />}
                </button>
                <button className="del-btn" onClick={() => deleteSnippet(s.id)} title="Delete"><Trash2 size={13} /></button>
              </div>
            </div>
            <div className="csc-tags">{s.tags.map((t) => <span key={t} className="cs-tag">{t}</span>)}</div>
            <pre className={`csc-code ${expanded === s.id ? '' : 'truncated'}`}>{s.code}</pre>
            <button className="expand-btn" onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
              {expanded === s.id ? '▲ Collapse' : '▼ Expand'}
            </button>
          </div>
        ))}
      </div>

      {showAdd && <AddSnippetModal onClose={() => setShowAdd(false)} onAdd={addSnippet} />}
    </div>
  );
}
