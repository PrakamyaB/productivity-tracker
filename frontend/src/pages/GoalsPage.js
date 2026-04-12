import React, { useState } from 'react';
import { Plus, Target, Trash2, X, AlertTriangle, CheckCircle } from 'lucide-react';
import { useGoals, useHabits } from '../hooks/useData';
import toast from 'react-hot-toast';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export default function GoalsPage() {
  const { goals, loading, create, remove } = useGoals();
  const { habits } = useHabits();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ habitId: '', title: '', type: 'weekly', targetHours: 10 });

  const handleTypeChange = (type) => {
    const now = new Date();
    let startDate, endDate;
    if (type === 'daily') { startDate = now; endDate = now; }
    else if (type === 'weekly') { startDate = startOfWeek(now, { weekStartsOn: 1 }); endDate = endOfWeek(now, { weekStartsOn: 1 }); }
    else { startDate = startOfMonth(now); endDate = endOfMonth(now); }
    setForm(p => ({ ...p, type, startDate: format(startDate, 'yyyy-MM-dd'), endDate: format(endDate, 'yyyy-MM-dd') }));
  };

  const openModal = () => {
    handleTypeChange('weekly');
    setForm(p => ({ ...p, habitId: habits[0]?._id || '', title: '', targetHours: 10 }));
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.habitId) return toast.error('Select a habit');
    setSaving(true);
    try {
      await create(form);
      toast.success('Goal set! 🎯');
      setShowModal(false);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to create goal');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this goal?')) return;
    try { await remove(id); toast.success('Goal removed'); }
    catch { toast.error('Failed to remove goal'); }
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {[1,2].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: 4 }}>Goals</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Set targets and track your progress</p>
        </div>
        <button onClick={openModal} className="btn btn-primary" disabled={habits.length === 0}>
          <Plus size={16} /> New Goal
        </button>
      </div>

      {habits.length === 0 && (
        <div className="card card-padding" style={{ textAlign: 'center', padding: '32px 24px', background: 'var(--warning-light)', border: '1px solid var(--warning)30' }}>
          <AlertTriangle size={28} color="var(--warning)" style={{ margin: '0 auto 10px' }} />
          <p style={{ fontWeight: 600 }}>Create at least one habit before setting goals.</p>
        </div>
      )}

      {goals.length === 0 && habits.length > 0 && (
        <div className="card card-padding" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 14 }}>🎯</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: 8 }}>No goals yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 340, margin: '0 auto 24px' }}>
            Set daily, weekly, or monthly hour targets for your habits to stay accountable.
          </p>
          <button onClick={openModal} className="btn btn-primary"><Plus size={16} /> Set First Goal</button>
        </div>
      )}

      {goals.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {goals.map(goal => {
            const progress = goal.progress ?? 0;
            const isAtRisk = goal.atRisk && !goal.achieved;
            const isDone = goal.achieved || progress >= 100;
            const borderColor = isDone ? 'var(--success)' : isAtRisk ? 'var(--warning)' : 'var(--accent)';

            return (
              <div key={goal._id} className="card" style={{ border: `1px solid ${borderColor}30`, overflow: 'hidden' }}>
                <div style={{ padding: '20px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${goal.habit?.color || '#6366f1'}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                        {isDone ? '🏆' : isAtRisk ? '⚠️' : '🎯'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{goal.title || goal.habit?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          {goal.habit?.name} · {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)} · {goal.targetHours}h target
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isDone && <CheckCircle size={18} color="var(--success)" />}
                      {isAtRisk && <AlertTriangle size={18} color="var(--warning)" />}
                      <button onClick={() => handleDelete(goal._id)} className="btn-icon"><Trash2 size={15} color="var(--danger)" /></button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: 6 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {goal.achieved || 0}h / {goal.targetHours}h
                      </span>
                      <span style={{ fontWeight: 700, color: isDone ? 'var(--success)' : isAtRisk ? 'var(--warning)' : 'var(--accent)' }}>
                        {progress}%
                      </span>
                    </div>
                    <div className="progress-bar" style={{ height: 8 }}>
                      <div className="progress-fill" style={{
                        width: `${progress}%`,
                        background: isDone ? 'var(--success)' : isAtRisk ? 'var(--warning)' : `linear-gradient(90deg, var(--accent), #8b5cf6)`,
                      }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 16, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    <span>📅 {format(new Date(goal.startDate), 'MMM d')} – {format(new Date(goal.endDate), 'MMM d, yyyy')}</span>
                    {goal.daysLeft > 0 && <span>⏳ {goal.daysLeft} day{goal.daysLeft !== 1 ? 's' : ''} left</span>}
                    {isAtRisk && <span style={{ color: 'var(--warning)', fontWeight: 600 }}>⚠️ At risk</span>}
                    {isDone && <span style={{ color: 'var(--success)', fontWeight: 600 }}>✅ Achieved!</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700 }}>New Goal</h2>
              <button onClick={() => setShowModal(false)} className="btn-icon"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Habit</label>
                  <select className="form-input" value={form.habitId} onChange={e => setForm(p => ({ ...p, habitId: e.target.value }))}>
                    <option value="">Select a habit...</option>
                    {habits.map(h => <option key={h._id} value={h._id}>{h.icon} {h.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Goal Title</label>
                  <input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g., Study 40 hours this week" />
                </div>

                <div className="form-group">
                  <label className="form-label">Period</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['daily','weekly','monthly'].map(t => (
                      <button key={t} type="button" onClick={() => handleTypeChange(t)}
                        className={`btn ${form.type === t ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        style={{ flex: 1 }}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Target Hours: <strong>{form.targetHours}h</strong></label>
                  <input type="range" min={1} max={form.type === 'monthly' ? 200 : form.type === 'weekly' ? 70 : 16} step={0.5} value={form.targetHours}
                    onChange={e => setForm(p => ({ ...p, targetHours: parseFloat(e.target.value) }))}
                    style={{ width: '100%', accentColor: 'var(--accent)', marginTop: 4 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>1h</span>
                    <span>{form.type === 'monthly' ? '200h' : form.type === 'weekly' ? '70h' : '16h'}</span>
                  </div>
                </div>

                <div style={{ background: 'var(--accent-light)', borderRadius: 10, padding: '12px 14px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  🎯 Goal: <strong style={{ color: 'var(--text-primary)' }}>{form.targetHours}h</strong> {form.type} from{' '}
                  <strong>{form.startDate}</strong> to <strong>{form.endDate}</strong>
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Creating...' : '🎯 Set Goal'}
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
