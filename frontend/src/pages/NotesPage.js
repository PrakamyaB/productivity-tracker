import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Pin, Search, X, Edit3, Save } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const NOTE_COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6'];
const defaultForm = { title: '', content: '', subject: 'General', tags: '', color: '#6366f1' };

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetchNotes = async () => {
    try {
      const res = await api.get('/notes');
      setNotes(res.data.notes);
    } catch { toast.error('Failed to load notes'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotes(); }, []);

  const openCreate = () => { setEditingNote(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (note) => {
    setEditingNote(note);
    setForm({ title: note.title, content: note.content, subject: note.subject, tags: (note.tags || []).join(', '), color: note.color });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
    try {
      if (editingNote) {
        const res = await api.put(`/notes/${editingNote._id}`, payload);
        setNotes(prev => prev.map(n => n._id === editingNote._id ? res.data.note : n));
        toast.success('Note updated!');
      } else {
        const res = await api.post('/notes', payload);
        setNotes(prev => [res.data.note, ...prev]);
        toast.success('Note saved! 📝');
      }
      setShowModal(false);
    } catch { toast.error('Failed to save note'); }
    finally { setSaving(false); }
  };

  const togglePin = async (note) => {
    try {
      const res = await api.put(`/notes/${note._id}`, { isPinned: !note.isPinned });
      setNotes(prev => {
        const updated = prev.map(n => n._id === note._id ? res.data.note : n);
        return [...updated.filter(n => n.isPinned), ...updated.filter(n => !n.isPinned)];
      });
    } catch { toast.error('Failed'); }
  };

  const deleteNote = async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      setNotes(prev => prev.filter(n => n._id !== id));
      toast.success('Note deleted.');
    } catch { toast.error('Failed'); }
  };

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase()) ||
    n.subject.toLowerCase().includes(search.toLowerCase())
  );

  const pinned = filtered.filter(n => n.isPinned);
  const unpinned = filtered.filter(n => !n.isPinned);

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
      {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 16 }} />)}
    </div>
  );

  const NoteCard = ({ note }) => (
    <div style={{ background: 'var(--bg-card)', border: `1px solid var(--border)`, borderTop: `4px solid ${note.color}`, borderRadius: 14, padding: '16px', position: 'relative', display: 'flex', flexDirection: 'column', gap: 10, transition: 'box-shadow 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {note.title || 'Untitled'}
          </div>
          <div style={{ fontSize: '0.75rem', color: note.color, fontWeight: 600 }}>{note.subject}</div>
        </div>
        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
          <button onClick={() => togglePin(note)} className="btn-icon" style={{ color: note.isPinned ? '#f59e0b' : 'var(--text-muted)', padding: 4 }} title={note.isPinned ? 'Unpin' : 'Pin'}>
            <Pin size={13} fill={note.isPinned ? '#f59e0b' : 'none'} />
          </button>
          <button onClick={() => openEdit(note)} className="btn-icon" style={{ padding: 4 }} title="Edit"><Edit3 size={13} /></button>
          <button onClick={() => deleteNote(note._id)} className="btn-icon" style={{ color: 'var(--danger)', padding: 4 }} title="Delete"><Trash2 size={13} /></button>
        </div>
      </div>

      {/* Content preview */}
      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>
        {note.content || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No content</span>}
      </div>

      {/* Tags */}
      {note.tags?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {note.tags.map(tag => (
            <span key={tag} style={{ fontSize: '0.7rem', background: `${note.color}15`, color: note.color, padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>#{tag}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 'auto' }}>
        {format(new Date(note.updatedAt), 'MMM d, h:mm a')}
        {note.isPinned && <span style={{ marginLeft: 8, color: '#f59e0b' }}>📌 Pinned</span>}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: 4 }}>📓 Quick Notes</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary"><Plus size={16} /> New Note</button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="form-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..." style={{ paddingLeft: 40 }} />
      </div>

      {notes.length === 0 ? (
        <div className="card card-padding" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: '4rem', marginBottom: 14 }}>📓</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: 8 }}>No notes yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Capture lecture notes, ideas, and important info quickly.</p>
          <button onClick={openCreate} className="btn btn-primary"><Plus size={16} /> Create First Note</button>
        </div>
      ) : (
        <>
          {pinned.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>📌 Pinned</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                {pinned.map(n => <NoteCard key={n._id} note={n} />)}
              </div>
            </div>
          )}
          {unpinned.length > 0 && (
            <div>
              {pinned.length > 0 && <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>ALL NOTES</div>}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                {unpinned.map(n => <NoteCard key={n._id} note={n} />)}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem' }}>{editingNote ? 'Edit Note' : 'New Note'}</h2>
              <button onClick={() => setShowModal(false)} className="btn-icon"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Note title..." />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input className="form-input" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="e.g., Algorithms" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tags (comma separated)</label>
                    <input className="form-input" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="e.g., important, exam" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {NOTE_COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setForm(p => ({ ...p, color: c }))}
                        style={{ width: 28, height: 28, borderRadius: 8, background: c, border: `3px solid ${form.color === c ? 'var(--text-primary)' : 'transparent'}`, cursor: 'pointer' }} />
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Content</label>
                  <textarea className="form-input" value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={8} placeholder="Write your notes here..." style={{ resize: 'vertical', fontFamily: 'var(--font-body)', lineHeight: 1.7 }} />
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    <Save size={14} /> {saving ? 'Saving...' : 'Save Note'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
