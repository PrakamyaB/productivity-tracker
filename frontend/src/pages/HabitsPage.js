import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Flame, Clock, Calendar, X, Check } from 'lucide-react';
import { useHabits } from '../hooks/useData';
import toast from 'react-hot-toast';

const CATEGORIES = ['Study', 'Health', 'Personal', 'Work', 'Fitness', 'Mindfulness', 'Creative', 'Social', 'Other'];
const COLORS = ['#7c6ff2','#f29ac2','#7fb9f2','#78b96e','#e9a94f','#c9b7ff','#ef4444','#14b8a6','#d8f45b'];
const ICONS = ['📚','💻','💪','🏃','🧘','📖','🎯','🎨','🎵','🌱','🏋️','✍️','🧠','💼','🔬','📝','⚡','🌟'];

const defaultForm = { name: '', description: '', category: 'Study', color: '#6366f1', icon: '📚', targetHoursPerDay: 1, targetDaysPerWeek: 7 };

export default function HabitsPage() {
  const { habits, loading, create, update, remove } = useHabits();
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const openCreate = () => { setForm(defaultForm); setEditingHabit(null); setShowModal(true); };
  const openEdit = (h) => { setForm({ name: h.name, description: h.description || '', category: h.category, color: h.color, icon: h.icon, targetHoursPerDay: h.targetHoursPerDay, targetDaysPerWeek: h.targetDaysPerWeek }); setEditingHabit(h); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Habit name is required');
    const duplicate = habits.some(h => h._id !== editingHabit?._id && h.name.trim().toLowerCase() === form.name.trim().toLowerCase());
    if (duplicate) return toast.error('That habit already exists');
    setSaving(true);
    try {
      if (editingHabit) {
        await update(editingHabit._id, form);
        toast.success('Habit updated!');
      } else {
        await create(form);
        toast.success('Habit created! 🎉');
      }
      setShowModal(false);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to save habit');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await remove(id);
      toast.success('Habit removed');
      setDeleteConfirm(null);
    } catch { toast.error('Failed to delete habit'); }
  };

  if (loading) return (
    <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 18 }} />)}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: 4 }}>My Habits</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{habits.length} habit{habits.length !== 1 ? 's' : ''} tracked</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus size={16} /> New Habit
        </button>
      </div>

      {/* Empty state */}
      {habits.length === 0 && (
        <div className="card card-padding" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>🌱</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: 8 }}>Start building your habits</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
            Create your first habit to begin tracking your daily progress, streaks, and productivity insights.
          </p>
          <button onClick={openCreate} className="btn btn-primary">
            <Plus size={16} /> Create First Habit
          </button>
        </div>
      )}

      {/* Habits grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {habits.map(h => (
          <div key={h._id} className="card" style={{ overflow: 'hidden', borderTop: `4px solid ${h.color}` }}>
            <div style={{ padding: '20px' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${h.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                    {h.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{h.name}</div>
                    <div style={{ fontSize: '0.75rem', color: h.color, fontWeight: 600, marginTop: 2 }}>{h.category}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => openEdit(h)} className="btn-icon" title="Edit"><Pencil size={15} /></button>
                  <button onClick={() => setDeleteConfirm(h._id)} className="btn-icon" title="Delete" style={{ color: 'var(--danger)' }}><Trash2 size={15} /></button>
                </div>
              </div>

              {h.description && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>{h.description}</p>
              )}

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                {[
                  { icon: Flame, label: 'Streak', value: `${h.currentStreak}d`, color: '#f59e0b' },
                  { icon: Clock, label: 'Target', value: `${h.targetHoursPerDay}h/day`, color: h.color },
                  { icon: Calendar, label: 'Total', value: `${h.totalDaysLogged}d`, color: 'var(--success)' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} style={{ background: 'var(--stat-card-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', color }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Longest streak */}
              {h.longestStreak > 0 && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>🏆 Longest streak:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{h.longestStreak} days</strong>
                </div>
              )}

              {/* Delete confirm */}
              {deleteConfirm === h._id && (
                <div style={{ marginTop: 14, padding: '12px', background: 'var(--danger-light)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--danger)', fontWeight: 500 }}>Delete this habit?</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => handleDelete(h._id)} className="btn btn-sm" style={{ background: 'var(--danger)', color: 'white', padding: '4px 12px' }}>
                      <Check size={13} /> Yes
                    </button>
                    <button onClick={() => setDeleteConfirm(null)} className="btn btn-secondary btn-sm">
                      <X size={13} /> No
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700 }}>
                {editingHabit ? 'Edit Habit' : 'New Habit'}
              </h2>
              <button onClick={() => setShowModal(false)} className="btn-icon"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Icon picker */}
                <div className="form-group">
                  <label className="form-label">Icon</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {ICONS.map(ic => (
                      <button key={ic} type="button" onClick={() => setForm(p => ({ ...p, icon: ic }))}
                        style={{ fontSize: '1.375rem', padding: '6px 8px', borderRadius: 8, border: `2px solid ${form.icon === ic ? form.color : 'transparent'}`, background: form.icon === ic ? `${form.color}15` : 'var(--bg-input)', cursor: 'pointer', transition: 'all 0.15s' }}>
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Habit Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Study DSA, Morning Workout" maxLength={100} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional description..." rows={2} style={{ resize: 'vertical' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Color</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
                      {COLORS.map(c => (
                        <button key={c} type="button" onClick={() => setForm(p => ({ ...p, color: c }))}
                          style={{ width: 28, height: 28, borderRadius: 8, background: c, border: `3px solid ${form.color === c ? 'var(--text-primary)' : 'transparent'}`, cursor: 'pointer', transition: 'all 0.15s' }} />
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Target Hours/Day</label>
                    <input type="number" className="form-input" min={0.5} max={24} step={0.5} value={form.targetHoursPerDay} onChange={e => setForm(p => ({ ...p, targetHoursPerDay: parseFloat(e.target.value) }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Target Days/Week</label>
                    <input type="number" className="form-input" min={1} max={7} step={1} value={form.targetDaysPerWeek} onChange={e => setForm(p => ({ ...p, targetDaysPerWeek: parseInt(e.target.value) }))} />
                  </div>
                </div>

                {/* Preview */}
                <div style={{ background: 'var(--stat-card-bg)', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, border: `1px solid ${form.color}40` }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${form.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>{form.icon}</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{form.name || 'Habit Name'}</div>
                    <div style={{ fontSize: '0.75rem', color: form.color, fontWeight: 600 }}>{form.category}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : editingHabit ? 'Save Changes' : 'Create Habit'}
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
