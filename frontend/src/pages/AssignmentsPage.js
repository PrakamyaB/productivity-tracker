import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, Clock, AlertTriangle, X, BookOpen, ChevronDown } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';

const PRIORITY_COLORS = { low: '#10b981', medium: '#f59e0b', high: '#f97316', urgent: '#ef4444' };
const PRIORITY_BG = { low: '#d1fae5', medium: '#fef3c7', high: '#ffedd5', urgent: '#fee2e2' };
const TYPE_ICONS = { assignment: '📝', project: '💼', lab: '🔬', presentation: '📊', quiz: '❓', other: '📌' };

const getDueLabel = (date) => {
  const d = new Date(date);
  if (isPast(d) && !isToday(d)) return { label: 'Overdue', color: '#ef4444' };
  if (isToday(d)) return { label: 'Due Today!', color: '#f97316' };
  if (isTomorrow(d)) return { label: 'Due Tomorrow', color: '#f59e0b' };
  return { label: `Due ${format(d, 'MMM d')}`, color: 'var(--text-muted)' };
};

const defaultForm = { title: '', subject: '', description: '', dueDate: '', priority: 'medium', type: 'assignment', maxMarks: 100 };

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, completed, overdue
  const [expandedId, setExpandedId] = useState(null);

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/assignments');
      setAssignments(res.data.assignments);
    } catch { toast.error('Failed to load assignments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAssignments(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.subject || !form.dueDate) return toast.error('Fill in required fields');
    setSaving(true);
    try {
      const res = await api.post('/assignments', form);
      setAssignments(prev => [...prev, res.data.assignment].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)));
      toast.success('Assignment added! 📝');
      setShowModal(false);
      setForm(defaultForm);
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const toggleStatus = async (a) => {
    const newStatus = a.status === 'completed' ? 'pending' : 'completed';
    try {
      const res = await api.put(`/assignments/${a._id}`, { status: newStatus });
      setAssignments(prev => prev.map(x => x._id === a._id ? res.data.assignment : x));
      if (newStatus === 'completed') toast.success('✅ Done! +50 XP earned!');
    } catch { toast.error('Failed to update'); }
  };

  const deleteAssignment = async (id) => {
    try {
      await api.delete(`/assignments/${id}`);
      setAssignments(prev => prev.filter(a => a._id !== id));
      toast.success('Removed.');
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = assignments.filter(a => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  const counts = {
    all: assignments.length,
    pending: assignments.filter(a => a.status === 'pending').length,
    in_progress: assignments.filter(a => a.status === 'in_progress').length,
    completed: assignments.filter(a => a.status === 'completed').length,
    overdue: assignments.filter(a => a.status === 'overdue').length,
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 14 }} />)}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: 4 }}>
            📝 Assignments
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>{counts.pending} pending · {counts.overdue} overdue</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={16} /> Add Assignment
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Total', value: counts.all, color: 'var(--accent)' },
          { label: 'Pending', value: counts.pending, color: '#f59e0b' },
          { label: 'Completed', value: counts.completed, color: '#10b981' },
          { label: 'Overdue', value: counts.overdue, color: '#ef4444' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.625rem', fontWeight: 800, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, background: 'var(--bg-input)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {['all', 'pending', 'in_progress', 'completed', 'overdue'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '0.8125rem',
              background: filter === f ? 'var(--bg-card)' : 'transparent',
              color: filter === f ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: filter === f ? 'var(--shadow-sm)' : 'none', transition: 'all 0.15s',
            }}>
            {f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Assignment list */}
      {filtered.length === 0 ? (
        <div className="card card-padding" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎉</div>
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>
            {filter === 'all' ? 'No assignments yet' : `No ${filter} assignments`}
          </h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            {filter === 'all' ? 'Add your assignments to track deadlines and earn XP!' : 'Good job staying on top of things!'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(a => {
            const due = getDueLabel(a.dueDate);
            const isExpanded = expandedId === a._id;
            const isCompleted = a.status === 'completed';
            const isOverdue = a.status === 'overdue';

            return (
              <div key={a._id} className="card" style={{
                overflow: 'hidden',
                opacity: isCompleted ? 0.7 : 1,
                borderLeft: `4px solid ${PRIORITY_COLORS[a.priority]}`,
              }}>
                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  {/* Complete toggle */}
                  <button onClick={() => toggleStatus(a)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isCompleted ? '#10b981' : 'var(--text-muted)', flexShrink: 0, padding: 4 }}>
                    <CheckCircle2 size={22} />
                  </button>

                  {/* Type icon */}
                  <div style={{ fontSize: '1.25rem', flexShrink: 0 }}>{TYPE_ICONS[a.type]}</div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9375rem', textDecoration: isCompleted ? 'line-through' : 'none', color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                        {a.title}
                      </span>
                      <span style={{ fontSize: '0.75rem', background: PRIORITY_BG[a.priority], color: PRIORITY_COLORS[a.priority], padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                        {a.priority}
                      </span>
                      <span style={{ fontSize: '0.75rem', background: 'var(--bg-input)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: 99 }}>
                        {a.subject}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: due.color, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {isOverdue && <AlertTriangle size={12} />}
                      <Clock size={12} />
                      {due.label}
                      {!isCompleted && !isOverdue && (
                        <span style={{ color: 'var(--text-muted)' }}>
                          · {formatDistanceToNow(new Date(a.dueDate), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* XP badge */}
                  {isCompleted && (
                    <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700, background: '#fef3c7', padding: '3px 8px', borderRadius: 99 }}>
                      +50 XP ✓
                    </span>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => setExpandedId(isExpanded ? null : a._id)} className="btn-icon">
                      <ChevronDown size={16} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>
                    <button onClick={() => deleteAssignment(a._id)} className="btn-icon" style={{ color: 'var(--danger)' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div style={{ padding: '0 20px 16px', borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                    {a.description && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.6 }}>{a.description}</p>}
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        📅 Due: <strong style={{ color: 'var(--text-primary)' }}>{format(new Date(a.dueDate), 'PPP')}</strong>
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        📊 Max Marks: <strong style={{ color: 'var(--text-primary)' }}>{a.maxMarks}</strong>
                      </div>
                      {a.grade !== null && (
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                          🎯 Grade: <strong style={{ color: '#10b981' }}>{a.grade}/{a.maxMarks}</strong>
                        </div>
                      )}
                    </div>
                    {/* Status updater */}
                    <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                      {['pending', 'in_progress', 'completed'].map(s => (
                        <button key={s} onClick={() => { api.put(`/assignments/${a._id}`, { status: s }).then(res => setAssignments(prev => prev.map(x => x._id === a._id ? res.data.assignment : x))); }}
                          className={`btn btn-sm ${a.status === s ? 'btn-primary' : 'btn-secondary'}`}>
                          {s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem' }}>Add Assignment</h2>
              <button onClick={() => setShowModal(false)} className="btn-icon"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g., OS Lab Report" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Subject *</label>
                    <input className="form-input" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="e.g., Operating Systems" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Due Date *</label>
                    <input type="datetime-local" className="form-input" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                      {Object.keys(TYPE_ICONS).map(t => <option key={t} value={t}>{TYPE_ICONS[t]} {t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-input" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                      {['low','medium','high','urgent'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Marks</label>
                    <input type="number" className="form-input" value={form.maxMarks} onChange={e => setForm(p => ({ ...p, maxMarks: parseInt(e.target.value) }))} min={0} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Optional details..." style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Adding...' : '📝 Add Assignment'}
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
