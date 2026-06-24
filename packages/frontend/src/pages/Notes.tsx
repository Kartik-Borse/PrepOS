import { useState, useEffect, useRef } from 'react';
import {
  Plus, Trash2, FileText, Clock, Tag, Search, Eye, Edit3, Image, X, Paperclip,
  FolderPlus, Folder, FolderOpen, ChevronDown, ChevronRight, MoreHorizontal,
} from 'lucide-react';
import { useAppStore, Note, NoteFolder } from '../store/useAppStore';
import {
  NoteAttachment,
  getAttachmentsByNoteId,
  addAttachment,
  deleteAttachment,
} from '../lib/notesDB';
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

function parseMarkdown(text: string, urls: Record<string, string>) {
  if (!text) return '<p class="empty-preview">Nothing to preview. Start writing in Edit mode!</p>';

  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html.replace(/```([\s\S]*?)```/g, (_, code) => {
    return `<pre><code>${code.trim()}</code></pre>`;
  });
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  const lines = html.split('\n');
  let inList = false;
  const processedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const content = trimmed.substring(2);
      let res = '';
      if (!inList) { inList = true; res += '<ul class="preview-list">'; }
      res += `<li>${content}</li>`;
      return res;
    } else {
      let res = '';
      if (inList) { inList = false; res += '</ul>'; }
      return res + line;
    }
  });
  if (inList) processedLines.push('</ul>');
  html = processedLines.join('\n');

  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
    const resolvedUrl = url.startsWith('attachment:')
      ? urls[url.replace('attachment:', '')]
      : url;
    if (resolvedUrl) {
      return `<div class="preview-img-container"><img src="${resolvedUrl}" alt="${alt || 'Image'}" class="preview-img" /></div>`;
    }
    return `<strong class="preview-error">[Image: ${alt} (Not loaded)]</strong>`;
  });

  html = html.replace(/\[([^\]]*)\]\(([^)]+)\)/g, (_, label, url) => {
    const isAttachment = url.startsWith('attachment:');
    const attachmentId = isAttachment ? url.replace('attachment:', '') : '';
    const resolvedUrl = isAttachment ? urls[attachmentId] : url;
    if (isAttachment) {
      return `<a href="#" class="preview-link pdf-link" data-attachment-id="${attachmentId}"><span class="pdf-icon-inline">📄</span> ${label || 'Attachment'}</a>`;
    }
    return `<a href="${resolvedUrl}" target="_blank" rel="noopener noreferrer" class="preview-link">${label || 'Link'}</a>`;
  });

  const finalLines = html.split('\n');
  html = finalLines.map(line => {
    const t = line.trim();
    if (!t) return '<br/>';
    if (t.startsWith('<h') || t.startsWith('<pre') || t.startsWith('<ul') || t.startsWith('<li') || t.startsWith('</ul') || t.startsWith('<div') || t.startsWith('<p')) {
      return line;
    }
    return `<p>${line}</p>`;
  }).join('\n');

  return html;
}

// ── Folder Create Modal ───────────────────────────────────────────────────────
function NewFolderModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string) => void }) {
  const [name, setName] = useState('');
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box nf-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3><Folder size={15} style={{ display: 'inline', marginRight: 6 }} />New Folder</h3>
          <button onClick={onClose}><X size={15} /></button>
        </div>
        <div className="modal-body" style={{ padding: '16px' }}>
          <input
            className="nf-name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Folder name (e.g. LinkedList, DP, Trees…)"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && name.trim() && (onCreate(name.trim()), onClose())}
          />
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary-sm"
            onClick={() => { if (name.trim()) { onCreate(name.trim()); onClose(); } }}
            disabled={!name.trim()}
          >
            Create Folder
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Note item with move-to-folder dropdown ────────────────────────────────────
function NoteItem({
  note,
  isActive,
  folders,
  onOpen,
  onMove,
}: {
  note: Note;
  isActive: boolean;
  folders: NoteFolder[];
  onOpen: () => void;
  onMove: (folderId: string | undefined) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={`note-item ${isActive ? 'active' : ''}`}
      onClick={onOpen}
    >
      <div className="ni-title">{note.title}</div>
      <div className="ni-preview">{note.content.slice(0, 60) || 'Empty note'}</div>
      <div className="ni-meta">
        <span className="ni-visited"><Clock size={11} /> {timeAgo(note.lastVisited)}</span>
        {note.tags.slice(0, 2).map((t) => <span key={t} className="ni-tag">{t}</span>)}
        <div className="ni-more-wrap" onClick={(e) => e.stopPropagation()}>
          <button
            className="ni-more-btn"
            onClick={() => setShowMenu((v) => !v)}
            title="Move to folder"
          >
            <MoreHorizontal size={12} />
          </button>
          {showMenu && (
            <div className="ni-folder-menu">
              <div className="nfm-label">Move to folder</div>
              <button className="nfm-item" onClick={() => { onMove(undefined); setShowMenu(false); }}>
                — No folder
              </button>
              {folders.map((f) => (
                <button
                  key={f.id}
                  className={`nfm-item ${note.folderId === f.id ? 'active' : ''}`}
                  onClick={() => { onMove(f.id); setShowMenu(false); }}
                >
                  <Folder size={11} /> {f.name}
                </button>
              ))}
              {folders.length === 0 && <div className="nfm-empty">No folders yet</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Notes() {
  const {
    notes, addNote, updateNote, deleteNote, touchNote,
    noteFolders, addFolder, renameFolder, deleteFolder,
  } = useAppStore();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');
  const [saved, setSaved] = useState(false);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null); // selected folder for new notes
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [renamingFolder, setRenamingFolder] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Attachment states
  const [attachments, setAttachments] = useState<NoteAttachment[]>([]);
  const [attachmentUrls, setAttachmentUrls] = useState<Record<string, string>>({});
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeNote = notes.find((n) => n.id === activeId);

  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  );

  // Group notes by folder
  const folderNotes = (folderId: string) => filtered.filter((n) => n.folderId === folderId);
  const unfolderedNotes = filtered.filter((n) => !n.folderId);

  useEffect(() => {
    if (activeId) {
      getAttachmentsByNoteId(activeId)
        .then(setAttachments)
        .catch((err) => console.error('Error fetching attachments:', err));
    } else {
      setAttachments([]);
    }
    setMode('edit');
  }, [activeId]);

  useEffect(() => {
    Object.values(attachmentUrls).forEach((url) => URL.revokeObjectURL(url));
    const urls: Record<string, string> = {};
    attachments.forEach((att) => { urls[att.id] = URL.createObjectURL(att.data); });
    setAttachmentUrls(urls);
    return () => { Object.values(urls).forEach((url) => URL.revokeObjectURL(url)); };
  }, [attachments]);

  const createNote = () => {
    const n: Note = {
      id: crypto.randomUUID(),
      title: 'Untitled Note',
      content: '',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastVisited: new Date().toISOString(),
      folderId: activeFolderId ?? undefined,
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

  const moveNote = (noteId: string, folderId: string | undefined) => {
    updateNote(noteId, { folderId });
  };

  const toggleFolder = (folderId: string) => {
    setCollapsedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };

  const handleCreateFolder = (name: string) => {
    const f: NoteFolder = { id: 'folder-' + crypto.randomUUID(), name, createdAt: new Date().toISOString() };
    addFolder(f);
  };

  const handleDeleteFolder = (id: string) => {
    if (!confirm('Delete this folder? Notes inside will be moved to "No Folder".')) return;
    deleteFolder(id);
    if (activeFolderId === id) setActiveFolderId(null);
  };

  const startRename = (f: NoteFolder) => {
    setRenamingFolder(f.id);
    setRenameValue(f.name);
  };

  const commitRename = (id: string) => {
    if (renameValue.trim()) renameFolder(id, renameValue.trim());
    setRenamingFolder(null);
  };

  const triggerUpload = (type: 'image' | 'pdf' | 'all') => {
    if (fileInputRef.current) {
      if (type === 'image') fileInputRef.current.accept = 'image/*';
      else if (type === 'pdf') fileInputRef.current.accept = 'application/pdf';
      else fileInputRef.current.accept = 'image/*,application/pdf';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeId) return;
    if (file.size > 10 * 1024 * 1024) { alert('File is too large. Maximum size is 10MB.'); return; }
    try {
      const attachment = await addAttachment({
        id: crypto.randomUUID(), noteId: activeId, name: file.name,
        type: file.type, size: file.size, data: file,
      });
      setAttachments((prev) => [...prev, attachment]);
      if (file.type.startsWith('image/')) {
        setEditContent((prev) => prev + `\n![${file.name}](attachment:${attachment.id})\n`);
      } else if (file.type === 'application/pdf') {
        setEditContent((prev) => prev + `\n[PDF: ${file.name}](attachment:${attachment.id})\n`);
      }
    } catch (err) {
      console.error('Failed to add attachment:', err);
      alert('Failed to save file.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteAttachment = async (id: string) => {
    if (!confirm('Delete this attachment?')) return;
    try {
      await deleteAttachment(id);
      setAttachments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert('Failed to delete attachment.');
    }
  };

  const insertAttachmentRef = (att: NoteAttachment) => {
    const isImg = att.type.startsWith('image/');
    const tag = isImg
      ? `\n![${att.name}](attachment:${att.id})\n`
      : `\n[PDF: ${att.name}](attachment:${att.id})\n`;
    setEditContent((prev) => prev + tag);
  };

  const handlePreviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG' && target.classList.contains('preview-img')) {
      const src = target.getAttribute('src');
      if (src) setLightboxUrl(src);
      return;
    }
    const anchor = target.closest('a');
    if (anchor && anchor.classList.contains('pdf-link')) {
      e.preventDefault();
      const attId = anchor.getAttribute('data-attachment-id');
      if (attId) { const url = attachmentUrls[attId]; if (url) window.open(url, '_blank'); }
    }
  };

  // ── Render folder section ──
  const renderFolderSection = (folder: NoteFolder) => {
    const fNotes = folderNotes(folder.id);
    const isCollapsed = collapsedFolders.has(folder.id);
    const isActive = activeFolderId === folder.id;

    return (
      <div key={folder.id} className="notes-folder">
        <div
          className={`nf-header ${isActive ? 'active' : ''}`}
          onClick={() => setActiveFolderId(isActive ? null : folder.id)}
        >
          <button
            className="nf-toggle"
            onClick={(e) => { e.stopPropagation(); toggleFolder(folder.id); }}
          >
            {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
          </button>
          {isCollapsed ? <Folder size={13} className="nf-icon" /> : <FolderOpen size={13} className="nf-icon" />}

          {renamingFolder === folder.id ? (
            <input
              className="nf-rename-input"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onBlur={() => commitRename(folder.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename(folder.id);
                if (e.key === 'Escape') setRenamingFolder(null);
              }}
              autoFocus
            />
          ) : (
            <span className="nf-name" onDoubleClick={(e) => { e.stopPropagation(); startRename(folder); }}>
              {folder.name}
            </span>
          )}

          <span className="nf-count">{fNotes.length}</span>

          <div className="nf-actions" onClick={(e) => e.stopPropagation()}>
            <button className="nf-action-btn" title="New note in this folder" onClick={() => { setActiveFolderId(folder.id); createNote(); }}>
              <Plus size={11} />
            </button>
            <button className="nf-action-btn del" title="Delete folder" onClick={() => handleDeleteFolder(folder.id)}>
              <Trash2 size={11} />
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <div className="nf-notes">
            {fNotes.length === 0 && (
              <div className="nf-empty-hint">No notes — click + to add one</div>
            )}
            {fNotes.map((n) => (
              <NoteItem
                key={n.id}
                note={n}
                isActive={activeId === n.id}
                folders={noteFolders}
                onOpen={() => openNote(n)}
                onMove={(fid) => moveNote(n.id, fid)}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="notes-page">
      <div className="notes-layout">
        {/* ── Sidebar ── */}
        <div className="notes-sidebar">
          <div className="notes-sidebar-header">
            <h1>Notes</h1>
            <div className="nsb-actions">
              <button className="nsb-btn" title="New folder" onClick={() => setShowNewFolder(true)}>
                <FolderPlus size={14} />
              </button>
              <button className="new-note-btn" onClick={createNote} aria-label="New note">
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="notes-search">
            <Search size={13} className="ns-icon" />
            <input
              placeholder="Search notes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search notes"
            />
          </div>

          <div className="notes-list">
            {filtered.length === 0 && (
              <div className="notes-empty">
                <FileText size={28} />
                <p>No notes yet</p>
                <button onClick={createNote} className="btn-sm-primary">Create first note</button>
              </div>
            )}

            {/* Folders */}
            {noteFolders.map((folder) => renderFolderSection(folder))}

            {/* Unfoldered notes */}
            {unfolderedNotes.length > 0 && (
              <div className="notes-unfoldered">
                {noteFolders.length > 0 && (
                  <div className="nuf-label">
                    <FileText size={11} /> No Folder
                  </div>
                )}
                {unfolderedNotes.map((n) => (
                  <NoteItem
                    key={n.id}
                    note={n}
                    isActive={activeId === n.id}
                    folders={noteFolders}
                    onOpen={() => openNote(n)}
                    onMove={(fid) => moveNote(n.id, fid)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Editor ── */}
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
                <button
                  className="del-btn"
                  onClick={() => { deleteNote(activeId!); setActiveId(null); }}
                  aria-label="Delete note"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="ne-subbar">
              <div className="ne-mode-tabs">
                <button className={`mode-tab ${mode === 'edit' ? 'active' : ''}`} onClick={() => setMode('edit')}>
                  <Edit3 size={12} /> Edit
                </button>
                <button className={`mode-tab ${mode === 'preview' ? 'active' : ''}`} onClick={() => setMode('preview')}>
                  <Eye size={12} /> Preview
                </button>
              </div>
              <div className="ne-upload-actions">
                <button className="attach-btn" onClick={() => triggerUpload('image')} title="Attach image photo">
                  <Image size={12} /> Add Photo
                </button>
                <button className="attach-btn" onClick={() => triggerUpload('pdf')} title="Import PDF file">
                  <FileText size={12} /> Import PDF
                </button>
                <button className="attach-btn" onClick={() => triggerUpload('all')} title="Attach any file">
                  <Paperclip size={12} /> Attach File
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
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

            {mode === 'edit' ? (
              <textarea
                className="ne-textarea"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder={`Write your notes here…\n\nTips:\n- Use ## for headings\n- Use - for bullet points\n- Use \`code\` for inline code\n- Use \`\`\` for code blocks\n- Upload images or PDFs using the toolbar buttons to insert them!`}
                aria-label="Note content"
              />
            ) : (
              <div
                className="ne-preview"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(editContent, attachmentUrls) }}
                onClick={handlePreviewClick}
              />
            )}

            {attachments.length > 0 && (
              <div className="ne-attachments-panel">
                <div className="nap-header">
                  <h3>Attachments ({attachments.length})</h3>
                </div>
                <div className="nap-grid">
                  {attachments.map((att) => {
                    const isImg = att.type.startsWith('image/');
                    const url = attachmentUrls[att.id];
                    return (
                      <div key={att.id} className="attachment-card">
                        {isImg ? (
                          <div className="ac-preview img" onClick={() => setLightboxUrl(url)}>
                            <img src={url} alt={att.name} />
                            <div className="ac-overlay"><Eye size={16} /></div>
                          </div>
                        ) : (
                          <div className="ac-preview pdf" onClick={() => window.open(url, '_blank')}>
                            <FileText size={32} className="pdf-icon" />
                            <span className="pdf-ext">PDF</span>
                          </div>
                        )}
                        <div className="ac-details">
                          <div className="ac-name" title={att.name}>{att.name}</div>
                          <div className="ac-size">{(att.size / 1024).toFixed(1)} KB</div>
                          <div className="ac-actions">
                            <button className="ac-action-btn insert" onClick={() => insertAttachmentRef(att)} title="Insert link into note text">Insert</button>
                            <button className="ac-action-btn delete" onClick={() => handleDeleteAttachment(att.id)} title="Delete file">Delete</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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

      {/* New Folder Modal */}
      {showNewFolder && (
        <NewFolderModal onClose={() => setShowNewFolder(false)} onCreate={handleCreateFolder} />
      )}

      {/* Image Lightbox */}
      {lightboxUrl && (
        <div className="lightbox-modal" onClick={() => setLightboxUrl(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightboxUrl(null)}><X size={20} /></button>
            <img src={lightboxUrl} alt="Enlarged view" className="lightbox-image" />
          </div>
        </div>
      )}
    </div>
  );
}
