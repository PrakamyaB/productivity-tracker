import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, Clock, ChevronUp, ChevronDown, Smile, MessageSquare } from 'lucide-react';
import { useHabits } from '../hooks/useData';
import { useTodayLogs } from '../hooks/useData';
import toast from 'react-hot-toast';

const MOOD_LABELS = ['', '😞', '😕', '😐', '🙂', '😄'];

export default function TodayPage() {
  const { habits, loading: habitsLoading } = useHabits();
  const { logs, upsert, loading: logsLoading } = useTodayLogs();
  const [expanded, setExpanded] = useState({});
  const [saving, setSaving] = useState({});

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const getLog = (habitId) => logs.find(l => (l.habit?._id || l.habit) === habitId);

  const getForm = (habitId) => {
    const log = getLog(habitId);
    return {
      hoursSpent: log?.hoursSpent ?? 0,
      completed: log?.completed ?? false,
      notes: log?.notes ?? '',
      mood: log?.mood ?? 3,
    };
  };

  const [formState, setFormState] = useState({});

  const getFormValue = (habitId, field) => {
    if (formState[habitId] !== undefined && formState[habitId][field] !== undefined) return formState[habitId][field];
    return getForm(habitId)[field];
  };

  const setField = (habitId, field, value) => {
    setFormState(prev => ({ ...prev, [habitId]: { ...getForm(habitId), ...(prev[habitId] || {}), [field]: value } }));
  };

  const handleHoursChange = (habitId, delta) => {
    const current = getFormValue(habitId, 'hoursSpent');
    const next = Math.max(0, Math.min(24, Math.round((current + delta) * 10) / 10));
    setField(habitId, 'hoursSpent', next);
  };

  const handleSave = async (habitId) => {
    setSaving(p => ({ ...p, [habitId]: true }));
    try {
      const data = {
        habitId,
        hoursSpent: getFormValue(habitId, 'hoursSpent'),
        completed: getFormValue(habitId, 'completed'),
        notes: getFormValue(habitId, 'notes'),
        mood: getFormValue(habitId, 'mood'),
        date: new Date().toISOString().split('T')[0],
      };
      await upsert(data);
      toast.success('Logged! 🎉');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to save log');
    } finally {
      setSaving(p => ({ ...p, [habitId]: false }));
    }
  };

  const loading = habitsLoading || logsLoading;
  const totalHoursToday = logs.reduce((s, l) => s + (l.hoursSpent || 0), 0);
  const completedCount = logs.filter(l => l.completed).length;

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 16 }} />)}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: 4 }}>
          Today's Log
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>{today}</p>
      </div>

      {/* Summary bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        {[
          { label: 'Hours Logged', value: `${Math.round(totalHoursToday * 10) / 10}h`, color: 'var(--accent)' },
          { label: 'Habits Done', value: `${completedCount}/${habits.length}`, color: 'var(--success)' },
          { label: 'Completion', value: habits.length ? `${Math.round((completedCount / habits.length) * 100)}%` : '0%', color: 'var(--warning)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      {habits.length > 0 && (
        <div style={{ marginBottom: -8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 6 }}>
            <span>Overall progress</span>
            <span>{completedCount}/{habits.length} habits</span>
          </div>
          <div className="progress-bar" style={{ height: 8 }}>
            <div className="progress-fill" style={{
              width: habits.length ? `${(completedCount / habits.length) * 100}%` : '0%',
              background: 'linear-gradient(90deg, var(--accent), var(--pink))',
            }} />
          </div>
        </div>
      )}

      {/* Habit list */}
      {habits.length === 0 ? (
        <div className="card card-padding" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📋</div>
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>No habits yet. Add one to start.</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 18 }}>Create one daily habit and your progress will show up here.</p>
          <Link to="/habits" className="btn btn-primary">Add first habit</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {habits.map(habit => {
            const log = getLog(habit._id);
            const hours = getFormValue(habit._id, 'hoursSpent');
            const completed = getFormValue(habit._id, 'completed');
            const notes = getFormValue(habit._id, 'notes');
            const mood = getFormValue(habit._id, 'mood');
            const progress = Math.min(100, (hours / (habit.targetHoursPerDay || 1)) * 100);
            const isExpanded = expanded[habit._id];

            return (
              <div key={habit._id} className="card" style={{ overflow: 'hidden', border: completed ? `1px solid ${habit.color}40` : undefined }}>
                {/* Main row */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', cursor: 'pointer', flexWrap: 'wrap' }}
                  onClick={() => setExpanded(p => ({ ...p, [habit._id]: !p[habit._id] }))}
                >
                  {/* Color dot + icon */}
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: `${habit.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0 }}>
                    {habit.icon}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{habit.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '2px 8px', borderRadius: 99 }}>{habit.category}</span>
                      {habit.currentStreak > 0 && (
                        <span style={{ fontSize: '0.75rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 2 }}>
                          🔥 {habit.currentStreak}
                        </span>
                      )}
                    </div>
                    <div className="progress-bar" style={{ height: 4, maxWidth: 200 }}>
                      <div className="progress-fill" style={{ width: `${progress}%`, background: habit.color }} />
                    </div>
                  </div>

                  {/* Hours display */}
                  <div style={{ textAlign: 'right', marginRight: 8, marginLeft: 'auto' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.125rem', color: habit.color }}>
                      {hours}h
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ {habit.targetHoursPerDay}h target</div>
                  </div>

                  {/* Completed toggle */}
                  <button
                    onClick={e => { e.stopPropagation(); setField(habit._id, 'completed', !completed); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: completed ? habit.color : 'var(--text-muted)', flexShrink: 0 }}
                  >
                    {completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                  </button>

                  {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                </div>

                {/* Expanded form */}
                {isExpanded && (
                  <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Hours stepper */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={15} color="var(--text-muted)" />
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Hours Spent</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto', flexWrap: 'wrap' }}>
                        <button onClick={() => handleHoursChange(habit._id, -0.5)} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', minWidth: 32 }}>−</button>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', minWidth: 48, textAlign: 'center' }}>{hours}h</span>
                        <button onClick={() => handleHoursChange(habit._id, 0.5)} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', minWidth: 32 }}>+</button>
                        <input
                          type="range" min={0} max={12} step={0.5} value={hours}
                          onChange={e => setField(habit._id, 'hoursSpent', parseFloat(e.target.value))}
                          style={{ width: 100, accentColor: habit.color }}
                        />
                      </div>
                    </div>

                    {/* Mood */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Smile size={15} color="var(--text-muted)" />
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Mood</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                        {[1,2,3,4,5].map(m => (
                          <button key={m} onClick={() => setField(habit._id, 'mood', m)}
                            style={{ fontSize: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', opacity: mood === m ? 1 : 0.3, transform: mood === m ? 'scale(1.2)' : 'scale(1)', transition: 'all 0.15s' }}>
                            {MOOD_LABELS[m]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                      <MessageSquare size={15} color="var(--text-muted)" style={{ marginTop: 10 }} />
                      <textarea
                        className="form-input"
                        placeholder="Quick note about today's session..."
                        value={notes}
                        onChange={e => setField(habit._id, 'notes', e.target.value)}
                        rows={2}
                        style={{ resize: 'vertical', marginLeft: 8 }}
                      />
                    </div>

                    {/* Save button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                      <button
                        onClick={() => handleSave(habit._id)}
                        className="btn btn-primary"
                        disabled={saving[habit._id]}
                        style={{ background: habit.color }}
                      >
                        {saving[habit._id]
                          ? <div className="animate-spin" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} />
                          : log ? 'Update Log' : 'Save Log'
                        }
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
