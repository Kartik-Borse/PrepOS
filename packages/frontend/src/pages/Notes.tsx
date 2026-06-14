import { useState } from 'react';
import { Plus, Trash2, FileText, Clock, Tag, Search } from 'lucide-react';
import { useAppStore, Note } from '../store/useAppStore';
import './Notes.css';

function timeAgo(iso: string) {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function Notes() {
  const { notes, addNote, updateNote, deleteNote, touchNote } = useAppStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');
  const [saved, setSaved] = useState(false);

  const activeNote = notes.find((n) => n.id === activeId);
  const filtered = notes.filter(
    (n) => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase())
  );

  const createNote = () => {
    const n: Note = {
      id: crypto.randomUUID(),
      title: 'Untitled Note',
      content: '',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastVisited: new Date().toISOString(),
    };
    addNote(n);
    openNote(n);
  };

  const openNote = (n: Note) => {
    setActiveId(n.id);
    setEditTitle(n.title);
    setEditContent(n.content);
    setEditTags(n.tags.join(', '));
    touchNote(n.id);
  };

  const saveNote = () => {
    if (!activeId) return;
    updateNote(activeId, {
      title: editTitle || 'Untitled Note',
      content: editContent,
      tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="notes-page">
      <div className="notes-layout">
        {/* Sidebar */}
        <div className="notes-sidebar">
          <div className="notes-sidebar-header">
            <h1>Notes</h1>
            <button className="new-note-btn" onClick={createNote} aria-label="New note"><Plus size={16} /></button>
          </div>
          <div className="notes-search">
            <Search size={13} className="ns-icon" />
            <input placeholder="Search notes…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search notes" />
          </div>
          <div className="notes-list">
            {filtered.length === 0 && (
              <div className="notes-empty">
                <FileText size={28} />
                <p>No notes yet</p>
                <button onClick={createNote} className="btn-sm-primary">Create first note</button>
              </div>
            )}
            {filtered.map((n) => (
              <div key={n.id} className={`note-item ${activeId === n.id ? 'active' : ''}`} onClick={() => openNote(n)}>
                <div className="ni-title">{n.title}</div>
                <div className="ni-preview">{n.content.slice(0, 60) || 'Empty note'}</div>
                <div className="ni-meta">
                  <span className="ni-visited">
                    <Clock size={11} /> {timeAgo(n.lastVisited)}
                  </span>
                  {n.tags.slice(0, 2).map((t) => <span key={t} className="ni-tag">{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        {activeNote ? (
          <div className="notes-editor">
            <div className="ne-toolbar">
              <input
                className="ne-title-input"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Note title…"
                aria-label="Note title"
              />
              <div className="ne-actions">
                <span className="ne-meta">
                  Last visited {timeAgo(activeNote.lastVisited)} · Updated {timeAgo(activeNote.updatedAt)}
                </span>
                <button className="save-btn" onClick={saveNote}>{saved ? '✓ Saved' : 'Save'}</button>
                <button className="del-btn" onClick={() => { deleteNote(activeId!); setActiveId(null); }} aria-label="Delete note">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="ne-tags-row">
              <Tag size={12} className="tag-icon" />
              <input
                className="ne-tags-input"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="Add tags (comma separated): DSA, Sliding Window, Revision…"
                aria-label="Note tags"
              />
            </div>

            <textarea
              className="ne-textarea"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder={`Write your notes here…\n\nTips:\n- Use ## for headings\n- Use - for bullet points\n- Use \`code\` for inline code\n- Use \`\`\` for code blocks`}
              aria-label="Note content"
            />
          </div>
        ) : (
          <div className="notes-empty-editor">
            <FileText size={48} style={{ color: 'var(--text-faint)' }} />
            <h2>Select a note or create one</h2>
            <p>Your notes are stored locally and persist across sessions.</p>
            <button className="btn-primary-lg" onClick={createNote}>+ New Note</button>
          </div>
        )}
      </div>
    </div>
  );
}
