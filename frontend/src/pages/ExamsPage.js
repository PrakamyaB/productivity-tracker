import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, BookOpen, Clock, MapPin, AlertCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format, formatDistanceToNow, isPast, differenceInDays, differenceInHours } from 'date-fns';

const TYPE_COLORS = { midterm: '#6366f1', final: '#ef4444', quiz: '#f59e0b', practical: '#10b981', viva: '#8b5cf6', other: '#3b82f6' };
const TYPE_EMOJI = { midterm: '📋', final: '🎓', quiz: '❓', practical: '🔬', viva: '🗣️', other: '📝' };

const CountdownBadge = ({ examDate }) => {
  const now = new Date();
  const days = differenceInDays(new Date(examDate), now);
  const hours = differenceInHours(new Date(examDate), now);

  if (isPast(new Date(examDate))) return (
    <span style={{ background: '#fee2e2', color: '#ef4444', padding: '4px 12px', borderRadius: 99, fontSize: '0.8125rem', fontWeight: 700 }}>
      ✓ Completed
    </span>
  );
  if (days === 0) return (
    <span style={{ background: '#ffedd5', color: '#f97316', padding: '4px 12px', borderRadius: 99, fontSize: '0.8125rem', fontWeight: 700, animation: 'pulse 1.5s infinite' }}>
      ⚡ {hours}h left!
    </span>
  );
  if (days <= 3) return (
    <span style={{ background: '#fef3c7', color: '#f59e0b', padding: '4px 12px', borderRadius: 99, fontSize: '0.8125rem', fontWeight: 700 }}>
      🔥 {days}d left
    </span>
  );
  if (days <= 7) return (
    <span style={{ background: '#ede9fe', color: '#8b5cf6', padding: '4px 12px', borderRadius: 99, fontSize: '0.8125rem', fontWeight: 700 }}>
      📅 {days}d left
    </span>
  );
  return (
    <span style={{ background: 'var(--bg-input)', color: 'var(--text-muted)', padding: '4px 12px', borderRadius: 99, fontSize: '0.8125rem', fontWeight: 600 }}>
      {days}d left
    </span>
  );
};

const defaultForm = { subject: '', examDate: '', examTime: '09:00', venue: '', type: 'final', syllabus: '' };

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams');
      setExams(res.data.exams);
    } catch { toast.error('Failed to load exams'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchExams(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.examDate) return toast.error('Subject and date required');
    setSaving(true);
    try {
      const res = await api.post('/exams', form);
      setExams(prev => [...prev, { ...res.data.exam, daysLeft: differenceInDays(new Date(res.data.exam.examDate), new Date()) }].sort((a, b) => new Date(a.examDate) - new Date(b.examDate)));
      toast.success('Exam added! Start preparing 📚');
      setShowModal(false); setForm(defaultForm);
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const updatePrep = async (id, value) => {
    try {
      const res = await api.put(`/exams/${id}`, { preparationStatus: value });
      setExams(prev => prev.map(e => e._id === id ? { ...res.data.exam, daysLeft: e.daysLeft } : e));
      if (value === 100) toast.success('100% prepared! +75 XP 🎓');
    } catch { toast.error('Failed to update'); }
  };

  const deleteExam = async (id) => {
    try {
      await api.delete(`/exams/${id}`);
      setExams(prev => prev.filter(e => e._id !== id));
      toast.success('Removed.');
    } catch { toast.error('Failed'); }
  };

  const upcoming = exams.filter(e => !isPast(new Date(e.examDate)));
  const past = exams.filter(e => isPast(new Date(e.examDate)));

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {[1,2].map(i => <div key={i} className="skeleton" style={{ height: 140, borderRadius: 16 }} />)}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: 4 }}>🎓 Exam Countdown</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{upcoming.length} upcoming · {past.length} completed</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus size={16} /> Add Exam</button>
      </div>

      {/* Upcoming exams */}
      {upcoming.length === 0 && past.length === 0 ? (
        <div className="card card-padding" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: '4rem', marginBottom: 14 }}>🎓</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: 8 }}>No exams added yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Add your exam schedule to track countdowns and preparation progress.</p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus size={16} /> Add First Exam</button>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text-secondary)' }}>UPCOMING</h3>
              {upcoming.map(exam => {
                const color = TYPE_COLORS[exam.type];
                const days = differenceInDays(new Date(exam.examDate), new Date());
                const urgency = days <= 3 ? '#ef4444' : days <= 7 ? '#f59e0b' : color;

                return (
                  <div key={exam._id} className="card" style={{ overflow: 'hidden', borderTop: `4px solid ${urgency}` }}>
                    <div style={{ padding: '20px 22px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 46, height: 46, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                            {TYPE_EMOJI[exam.type]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '1.0625rem' }}>{exam.subject}</div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <span style={{ color, fontWeight: 600 }}>{exam.type.charAt(0).toUpperCase() + exam.type.slice(1)}</span>
                              <span>·</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Clock size={12} /> {format(new Date(exam.examDate), 'PPP')} at {exam.examTime}
                              </span>
                              {exam.venue && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={12} /> {exam.venue}</span>}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <CountdownBadge examDate={exam.examDate} />
                          <button onClick={() => deleteExam(exam._id)} className="btn-icon"><Trash2 size={15} color="var(--danger)" /></button>
                        </div>
                      </div>

                      {/* Preparation slider */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: 8 }}>
                          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>📖 Preparation</span>
                          <span style={{ fontWeight: 700, color: exam.preparationStatus >= 80 ? '#10b981' : exam.preparationStatus >= 50 ? '#f59e0b' : '#ef4444' }}>
                            {exam.preparationStatus}%
                          </span>
                        </div>
                        <input
                          type="range" min={0} max={100} step={5}
                          value={exam.preparationStatus}
                          onChange={e => updatePrep(exam._id, parseInt(e.target.value))}
                          style={{ width: '100%', accentColor: urgency }}
                        />
                        <div className="progress-bar" style={{ height: 6, marginTop: 4 }}>
                          <div className="progress-fill" style={{ width: `${exam.preparationStatus}%`, background: exam.preparationStatus >= 80 ? '#10b981' : exam.preparationStatus >= 50 ? '#f59e0b' : '#ef4444' }} />
                        </div>
                      </div>

                      {exam.syllabus && (
                        <div style={{ marginTop: 12, fontSize: '0.8125rem', color: 'var(--text-muted)', background: 'var(--bg-input)', borderRadius: 8, padding: '8px 12px' }}>
                          <strong>Syllabus:</strong> {exam.syllabus}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {past.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text-muted)' }}>COMPLETED</h3>
              {past.map(exam => (
                <div key={exam._id} className="card" style={{ padding: '14px 20px', opacity: 0.6, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '1.25rem' }}>{TYPE_EMOJI[exam.type]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{exam.subject}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{format(new Date(exam.examDate), 'PPP')}</div>
                  </div>
                  <span style={{ fontSize: '0.8125rem', background: '#d1fae5', color: '#10b981', padding: '3px 10px', borderRadius: 99, fontWeight: 600 }}>Done ✓</span>
                  <button onClick={() => deleteExam(exam._id)} className="btn-icon"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem' }}>Add Exam</h2>
              <button onClick={() => setShowModal(false)} className="btn-icon"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <input className="form-input" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="e.g., Data Structures & Algorithms" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Exam Date *</label>
                    <input type="date" className="form-input" value={form.examDate} onChange={e => setForm(p => ({ ...p, examDate: e.target.value }))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time</label>
                    <input type="time" className="form-input" value={form.examTime} onChange={e => setForm(p => ({ ...p, examTime: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                      {Object.keys(TYPE_EMOJI).map(t => <option key={t} value={t}>{TYPE_EMOJI[t]} {t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Venue</label>
                    <input className="form-input" value={form.venue} onChange={e => setForm(p => ({ ...p, venue: e.target.value }))} placeholder="e.g., Hall A, Room 201" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Syllabus / Topics</label>
                  <textarea className="form-input" value={form.syllabus} onChange={e => setForm(p => ({ ...p, syllabus: e.target.value }))} rows={3} placeholder="Units 1-4, Chapter 5-8..." style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Adding...' : '🎓 Add Exam'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
