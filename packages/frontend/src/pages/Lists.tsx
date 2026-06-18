import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, X, ChevronRight, List, Pencil } from 'lucide-react';
import { useAppStore, ProblemList } from '../store/useAppStore';
import './Lists.css';

const COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#f97316', '#ef4444'];

function NewListModal({ onClose, onAdd }: { onClose: () => void; onAdd: (l: ProblemList) => void }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  const submit = () => {
    if (!name.trim()) return;
    onAdd({ id: 'list-' + Date.now(), name: name.trim(), description: desc.trim(), color, createdAt: new Date().toISOString(), items: [] });
    onClose();
  };

  return (
    <div className="lists-overlay" onClick={onClose}>
      <div className="lists-modal" onClick={e => e.stopPropagation()}>
        <div className="lm-header">
          <h3>New List</h3>
          <button onClick={onClose}><X size={16} /></button>
        </div>
        <div className="lm-body">
          <div className="lm-field">
            <label>Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Google Prep, Hard Problems…" autoFocus />
          </div>
          <div className="lm-field">
            <label>Description</label>
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Optional note about this list" />
          </div>
          <div className="lm-field">
            <label>Color</label>
            <div className="lm-colors">
              {COLORS.map(c => (
                <button key={c} className={`lm-color-dot ${color === c ? 'selected' : ''}`} style={{ background: c }} onClick={() => setColor(c)} />
              ))}
            </div>
          </div>
        </div>
        <div className="lm-footer">
          <button className="lm-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="lm-btn-primary" onClick={submit} disabled={!name.trim()}>Create List</button>
        </div>
      </div>
    </div>
  );
}

export default function Lists() {
  const { problemLists: rawLists, addList, deleteList, renameList, removeProblemFromList } = useAppStore();
  const problemLists = rawLists ?? [];
  const [showNew, setShowNew] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(problemLists[0]?.id ?? null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const active = problemLists.find(l => l.id === activeId) ?? null;

  const startRename = (l: ProblemList) => {
    setEditingId(l.id);
    setEditName(l.name);
  };

  const commitRename = () => {
    if (editingId && editName.trim()) renameList(editingId, editName.trim());
    setEditingId(null);
  };

  return (
    <div className="lists-page">
      <div className="lists-header">
        <div>
          <h1>Lists</h1>
          <p className="sub">Organise problems into custom collections</p>
        </div>
        <button className="lists-new-btn" onClick={() => setShowNew(true)}>
          <Plus size={14} /> New List
        </button>
      </div>

      <div className="lists-layout">
        {/* Sidebar */}
        <div className="lists-sidebar">
          {problemLists.length === 0 && (
            <div className="lists-empty-side">
              <List size={28} style={{ color: 'var(--text-faint)', marginBottom: 8 }} />
              <p>No lists yet</p>
              <button className="lists-new-btn" onClick={() => setShowNew(true)} style={{ marginTop: 8 }}><Plus size={13} /> Create one</button>
            </div>
          )}
          {problemLists.map(l => (
            <button
              key={l.id}
              className={`lists-list-btn ${activeId === l.id ? 'active' : ''}`}
              style={activeId === l.id ? { borderColor: l.color, background: l.color + '14' } : {}}
              onClick={() => setActiveId(l.id)}
            >
              <span className="llb-dot" style={{ background: l.color }} />
              <div className="llb-info">
                {editingId === l.id ? (
                  <input
                    className="llb-rename"
                    value={editName}
                    autoFocus
                    onChange={e => setEditName(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={e => e.key === 'Enter' && commitRename()}
                    onClick={e => e.stopPropagation()}
                  />
                ) : (
                  <span className="llb-name">{l.name}</span>
                )}
                <span className="llb-count">{l.items.length} problems</span>
              </div>
              <div className="llb-actions">
                <button title="Rename" onClick={e => { e.stopPropagation(); startRename(l); }}><Pencil size={12} /></button>
                <button title="Delete" onClick={e => { e.stopPropagation(); deleteList(l.id); if (activeId === l.id) setActiveId(null); }}><Trash2 size={12} /></button>
              </div>
            </button>
          ))}
        </div>

        {/* Detail */}
        <div className="lists-detail">
          {!active ? (
            <div className="lists-empty-main">
              <List size={40} style={{ color: 'var(--text-faint)', marginBottom: 12 }} />
              <h3>Select or create a list</h3>
              <p>Add problems to lists from any problem page — look for the "Add to List" option.</p>
            </div>
          ) : (
            <>
              <div className="ld-header" style={{ borderLeft: `4px solid ${active.color}` }}>
                <div>
                  <h2>{active.name}</h2>
                  {active.description && <p className="ld-desc">{active.description}</p>}
                </div>
                <span className="ld-count">{active.items.length} problems</span>
              </div>

              {active.items.length === 0 ? (
                <div className="lists-empty-main" style={{ marginTop: 32 }}>
                  <p style={{ color: 'var(--text-faint)', fontSize: 13 }}>
                    No problems yet. Open any problem and use the <strong>⋯</strong> menu or star icon to add it here.
                  </p>
                </div>
              ) : (
                <div className="ld-problems">
                  {active.items.map((item, idx) => (
                    <div key={item.problemId} className="ld-row">
                      <span className="ld-num">{idx + 1}</span>
                      <Link to={`/problem/${item.problemId}`} className="ld-title">{item.problemTitle}</Link>
                      <span className="ld-added">{new Date(item.addedAt).toLocaleDateString()}</span>
                      <button className="ld-remove" onClick={() => removeProblemFromList(active.id, item.problemId)} title="Remove">
                        <X size={13} />
                      </button>
                      <Link to={`/problem/${item.problemId}`} className="ld-open"><ChevronRight size={14} /></Link>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showNew && <NewListModal onClose={() => setShowNew(false)} onAdd={(l) => { addList(l); setActiveId(l.id); }} />}
    </div>
  );
}
