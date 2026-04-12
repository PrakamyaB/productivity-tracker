import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, GraduationCap, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import api from '../services/api';
import toast from 'react-hot-toast';

const GRADE_OPTIONS_10 = [
  { label: 'O (Outstanding)', value: 'O', point: 10 },
  { label: 'A+ (Excellent)', value: 'A+', point: 9 },
  { label: 'A (Very Good)', value: 'A', point: 8 },
  { label: 'B+ (Good)', value: 'B+', point: 7 },
  { label: 'B (Above Average)', value: 'B', point: 6 },
  { label: 'C (Average)', value: 'C', point: 5 },
  { label: 'F (Fail)', value: 'F', point: 0 },
];

const CGPA_LABELS = (cgpa) => {
  if (cgpa >= 9) return { label: 'Outstanding 🏆', color: '#10b981' };
  if (cgpa >= 8) return { label: 'Excellent 🌟', color: '#6366f1' };
  if (cgpa >= 7) return { label: 'Very Good 👍', color: '#3b82f6' };
  if (cgpa >= 6) return { label: 'Good', color: '#f59e0b' };
  if (cgpa >= 5) return { label: 'Average', color: '#f97316' };
  return { label: 'Needs Improvement', color: '#ef4444' };
};

const emptySubject = { name: '', credits: 3, grade: 'A', gradePoint: 8 };

export default function CGPAPage() {
  const [semesters, setSemesters] = useState([]);
  const [cgpa, setCgpa] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [semForm, setSemForm] = useState({
    semesterName: '', semesterNumber: 1,
    subjects: [{ ...emptySubject }],
  });

  const fetchData = async () => {
    try {
      const res = await api.get('/cgpa');
      setSemesters(res.data.semesters);
      setCgpa(res.data.cgpa);
    } catch { toast.error('Failed to load grades'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const addSubjectRow = () => setSemForm(p => ({ ...p, subjects: [...p.subjects, { ...emptySubject }] }));
  const removeSubjectRow = (i) => setSemForm(p => ({ ...p, subjects: p.subjects.filter((_, idx) => idx !== i) }));

  const updateSubject = (i, field, value) => {
    setSemForm(p => {
      const subs = [...p.subjects];
      subs[i] = { ...subs[i], [field]: value };
      if (field === 'grade') {
        const match = GRADE_OPTIONS_10.find(g => g.value === value);
        if (match) subs[i].gradePoint = match.point;
      }
      return { ...p, subjects: subs };
    });
  };

  const calcPreviewSGPA = () => {
    const subs = semForm.subjects.filter(s => s.name && s.credits > 0);
    const total = subs.reduce((s, sub) => s + parseFloat(sub.credits), 0);
    const weighted = subs.reduce((s, sub) => s + (sub.gradePoint * parseFloat(sub.credits)), 0);
    return total > 0 ? (weighted / total).toFixed(2) : '—';
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const validSubs = semForm.subjects.filter(s => s.name.trim());
    if (!semForm.semesterName || validSubs.length === 0) return toast.error('Add semester name and at least one subject');
    setSaving(true);
    try {
      const res = await api.post('/cgpa', { ...semForm, subjects: validSubs });
      setSemesters(prev => [...prev, res.data.semester].sort((a, b) => a.semesterNumber - b.semesterNumber));
      const allRes = await api.get('/cgpa');
      setCgpa(allRes.data.cgpa);
      toast.success(`Semester added! SGPA: ${res.data.sgpa} 🎓`);
      setShowModal(false);
      setSemForm({ semesterName: '', semesterNumber: semesters.length + 2, subjects: [{ ...emptySubject }] });
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const deleteSemester = async (id) => {
    try {
      await api.delete(`/cgpa/${id}`);
      const res = await api.get('/cgpa');
      setSemesters(res.data.semesters);
      setCgpa(res.data.cgpa);
      toast.success('Semester removed.');
    } catch { toast.error('Failed'); }
  };

  const cgpaInfo = CGPA_LABELS(cgpa);
  const chartData = semesters.map(s => ({ name: s.semesterName.replace('Semester ', 'Sem '), sgpa: s.sgpa, credits: s.totalCredits }));

  if (loading) return <div className="skeleton" style={{ height: 300, borderRadius: 18 }} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: 4 }}>🎓 CGPA Calculator</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track your grades across all semesters</p>
        </div>
        <button onClick={() => { setSemForm(p => ({ ...p, semesterNumber: semesters.length + 1, semesterName: `Semester ${semesters.length + 1}` })); setShowModal(true); }} className="btn btn-primary">
          <Plus size={16} /> Add Semester
        </button>
      </div>

      {/* CGPA hero card */}
      {semesters.length > 0 && (
        <div className="card card-padding" style={{ background: `linear-gradient(135deg, ${cgpaInfo.color}15, ${cgpaInfo.color}05)`, border: `1px solid ${cgpaInfo.color}30` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 80, height: 80, borderRadius: 20, background: `${cgpaInfo.color}20`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `2px solid ${cgpaInfo.color}40` }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: cgpaInfo.color, lineHeight: 1 }}>{cgpa}</div>
                <div style={{ fontSize: '0.6875rem', color: cgpaInfo.color, fontWeight: 600 }}>CGPA</div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.375rem', fontWeight: 800 }}>
                  {cgpaInfo.label}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
                  {semesters.length} semester{semesters.length !== 1 ? 's' : ''} · {semesters.reduce((s, sem) => s + sem.totalCredits, 0)} total credits
                </div>
              </div>
            </div>

            {/* CGPA progress bar to 10 */}
            <div style={{ minWidth: 200 }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 6 }}>Progress to 10.0</div>
              <div className="progress-bar" style={{ height: 10 }}>
                <div className="progress-fill" style={{ width: `${(cgpa / 10) * 100}%`, background: cgpaInfo.color }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                Need {(10 - cgpa).toFixed(2)} more points
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SGPA chart */}
      {chartData.length > 1 && (
        <div className="card card-padding">
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 20 }}>SGPA Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <Tooltip formatter={(v) => [v, 'SGPA']} />
              <ReferenceLine y={cgpa} stroke="#6366f1" strokeDasharray="4 4" label={{ value: `CGPA: ${cgpa}`, fill: '#6366f1', fontSize: 11 }} />
              <Bar dataKey="sgpa" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Semester cards */}
      {semesters.length === 0 ? (
        <div className="card card-padding" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{ fontSize: '4rem', marginBottom: 14 }}>🎓</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: 8 }}>Add your first semester</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Enter your grades to calculate your CGPA automatically.</p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus size={16} /> Add Semester</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {semesters.map(sem => (
            <div key={sem._id} className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{sem.semesterName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{sem.totalCredits} credits</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: sem.sgpa >= 8 ? '#10b981' : sem.sgpa >= 6 ? '#f59e0b' : '#ef4444' }}>
                      {sem.sgpa}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SGPA</div>
                  </div>
                  <button onClick={() => deleteSemester(sem._id)} className="btn-icon"><Trash2 size={14} color="var(--danger)" /></button>
                </div>
              </div>
              <div style={{ padding: '12px 20px' }}>
                {sem.subjects.map((sub, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < sem.subjects.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{sub.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.credits} credits</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: sub.gradePoint >= 8 ? '#10b981' : sub.gradePoint >= 6 ? '#f59e0b' : '#ef4444' }}>
                        {sub.grade}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({sub.gradePoint})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem' }}>Add Semester</h2>
              <button onClick={() => setShowModal(false)} className="btn-icon"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Semester Name *</label>
                    <input className="form-input" value={semForm.semesterName} onChange={e => setSemForm(p => ({ ...p, semesterName: e.target.value }))} placeholder="e.g., Semester 3" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Semester Number</label>
                    <input type="number" className="form-input" value={semForm.semesterNumber} min={1} max={12} onChange={e => setSemForm(p => ({ ...p, semesterNumber: parseInt(e.target.value) }))} />
                  </div>
                </div>

                {/* Subject rows */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Subjects</label>
                    <button type="button" onClick={addSubjectRow} className="btn btn-secondary btn-sm"><Plus size={13} /> Add Subject</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {semForm.subjects.map((sub, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 80px 130px 36px', gap: 8, alignItems: 'center' }}>
                        <input className="form-input" value={sub.name} onChange={e => updateSubject(i, 'name', e.target.value)} placeholder="Subject name" style={{ fontSize: '0.875rem' }} />
                        <input type="number" className="form-input" value={sub.credits} min={0.5} max={10} step={0.5} onChange={e => updateSubject(i, 'credits', parseFloat(e.target.value))} style={{ fontSize: '0.875rem' }} placeholder="Credits" />
                        <select className="form-input" value={sub.grade} onChange={e => updateSubject(i, 'grade', e.target.value)} style={{ fontSize: '0.875rem' }}>
                          {GRADE_OPTIONS_10.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                        </select>
                        <button type="button" onClick={() => removeSubjectRow(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 4 }}>
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview SGPA */}
                <div style={{ background: 'var(--accent-light)', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Preview SGPA:</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--accent)' }}>{calcPreviewSGPA()}</span>
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : '🎓 Add Semester'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
