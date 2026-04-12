import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function StudyRoomPage() {
  const [rooms, setRooms] = useState([]);
  const [myRooms, setMyRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(null);
  const [form, setForm] = useState({ name: '', subject: 'General Study', description: '', isPublic: true, maxMembers: 10 });

  const fetchRooms = async () => {
    try {
      const res = await api.get('/studyrooms');
      setRooms(res.data.rooms);
    } catch { toast.error('Failed to load rooms'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRooms(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('Room name required');
    setSaving(true);
    try {
      const res = await api.post('/studyrooms', form);
      setRooms(prev => [res.data.room, ...prev]);
      toast.success(`Room created! Code: ${res.data.room.code} 🎉 +20 XP`);
      setShowCreate(false);
      setForm({ name: '', subject: 'General Study', description: '', isPublic: true, maxMembers: 10 });
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinCode) return toast.error('Enter a room code');
    setSaving(true);
    try {
      const res = await api.post('/studyrooms/join', { code: joinCode.toUpperCase() });
      toast.success('Joined room! +20 XP 🎉');
      fetchRooms();
      setShowJoin(false);
      setJoinCode('');
    } catch (e) { toast.error(e.response?.data?.error || 'Room not found'); }
    finally { setSaving(false); }
  };

  const handleLeave = async (roomId) => {
    try {
      await api.delete(`/studyrooms/${roomId}/leave`);
      fetchRooms();
      toast.success('Left room.');
    } catch { toast.error('Failed to leave'); }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    toast.success('Code copied!');
    setTimeout(() => setCopied(null), 2000);
  };

  const updateTopic = async (roomId, topic) => {
    try {
      await api.put(`/studyrooms/${roomId}/topic`, { topic });
    } catch {}
  };

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 16 }} />)}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: 4 }}>
            👥 Study Rooms
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Study together, stay accountable, earn XP</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowJoin(true)} className="btn btn-secondary">
            <LogIn size={15} /> Join Room
          </button>
          <button onClick={() => setShowCreate(true)} className="btn btn-primary">
            <Plus size={15} /> Create Room
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div className="card card-padding" style={{ background: 'var(--accent-light)', border: '1px solid var(--accent)20', padding: '14px 20px' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
          💡 <strong>Study Rooms</strong> let you study alongside others virtually. Create a public room or share a private code with friends. Each join or creation earns you <strong>+20 XP</strong> and the <strong>Study Buddy 👥</strong> badge!
        </p>
      </div>

      {/* Active public rooms */}
      <div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.0625rem', marginBottom: 16, color: 'var(--text-secondary)' }}>
          🌍 PUBLIC ROOMS ({rooms.length})
        </h3>
        {rooms.length === 0 ? (
          <div className="card card-padding" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>👥</div>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>No active rooms</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Be the first to create a study room!</p>
            <button onClick={() => setShowCreate(true)} className="btn btn-primary"><Plus size={15} /> Create Room</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {rooms.map(room => {
              const activeMembers = room.members?.filter(m => m.isActive) || [];
              return (
                <div key={room._id} className="card" style={{ overflow: 'hidden' }}>
                  <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{room.name}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--accent)', fontWeight: 600, marginTop: 2 }}>
                          📚 {room.subject}
                        </div>
                      </div>
                      {/* Room code */}
                      <button onClick={() => copyCode(room.code)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-input)', border: 'none', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                        {room.code}
                        {copied === room.code ? <Check size={12} color="var(--success)" /> : <Copy size={12} />}
                      </button>
                    </div>
                    {room.description && (
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{room.description}</p>
                    )}
                  </div>

                  {/* Members list */}
                  <div style={{ padding: '12px 20px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Users size={12} />
                      {activeMembers.length}/{room.maxMembers} members
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                      {activeMembers.slice(0, 4).map((m, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 26, height: 26, borderRadius: 8, background: `hsl(${i * 60}, 70%, 60%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                            {m.name?.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{m.name}</div>
                            {m.studyingTopic && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>📖 {m.studyingTopic}</div>}
                          </div>
                        </div>
                      ))}
                      {activeMembers.length > 4 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+{activeMembers.length - 4} more</div>
                      )}
                    </div>

                    {/* Join/Leave button */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => { api.post('/studyrooms/join', { code: room.code }).then(() => { fetchRooms(); toast.success('Joined! +20 XP'); }).catch(e => toast.error(e.response?.data?.error || 'Failed')); }}
                        className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                        <LogIn size={13} /> Join Room
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem' }}>Create Study Room</h2>
              <button onClick={() => setShowCreate(false)} className="btn-icon"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Room Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., DSA Grind Session 💪" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input className="form-input" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="e.g., Data Structures" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max Members</label>
                    <input type="number" className="form-input" value={form.maxMembers} min={2} max={50} onChange={e => setForm(p => ({ ...p, maxMembers: parseInt(e.target.value) }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input className="form-input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What will you be studying?" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input type="checkbox" id="public" checked={form.isPublic} onChange={e => setForm(p => ({ ...p, isPublic: e.target.checked }))} style={{ width: 16, height: 16 }} />
                  <label htmlFor="public" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>🌍 Make this room public (visible to everyone)</label>
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowCreate(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : '👥 Create Room'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Join Modal */}
      {showJoin && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowJoin(false)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem' }}>Join a Room</h2>
              <button onClick={() => setShowJoin(false)} className="btn-icon"><X size={18} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Room Code</label>
                  <input className="form-input" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="e.g., AB12CD" maxLength={6} style={{ fontSize: '1.25rem', letterSpacing: '0.2em', textAlign: 'center', fontFamily: 'monospace', textTransform: 'uppercase' }} required />
                  <span className="form-error" style={{ color: 'var(--text-muted)' }}>Ask your friend for their 6-character room code</span>
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowJoin(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving || joinCode.length < 6}>{saving ? 'Joining...' : '🚀 Join Room'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
