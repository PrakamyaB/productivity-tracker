import React, { useState, useEffect } from 'react';
import { Trophy, Star, Zap, Award, Medal } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const LEVEL_COLORS = ['', '#94a3b8','#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#f97316','#ffd700'];

export default function GamificationPage() {
  const [profile, setProfile] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('profile');

  const fetchData = async () => {
    try {
      const [profRes, lbRes] = await Promise.all([
        api.get('/gamification/profile'),
        api.get('/gamification/leaderboard'),
      ]);
      setProfile(profRes.data);
      setLeaderboard(lbRes.data.leaderboard);
    } catch (e) { toast.error('Failed to load profile'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="skeleton" style={{ height: 200, borderRadius: 20 }} />
      <div className="skeleton" style={{ height: 300, borderRadius: 20 }} />
    </div>
  );

  const levelColor = LEVEL_COLORS[profile?.level] || '#6366f1';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: 4 }}>
          🎮 Gamification
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Earn XP, unlock badges, climb the leaderboard</p>
      </div>

      {/* XP Hero card */}
      <div className="card card-padding" style={{ background: `linear-gradient(135deg, ${levelColor}20, ${levelColor}05)`, border: `1px solid ${levelColor}30`, position: 'relative', overflow: 'hidden' }}>
        {/* Background decoration */}
        <div style={{ position: 'absolute', right: -20, top: -20, width: 150, height: 150, borderRadius: '50%', background: `${levelColor}10` }} />
        <div style={{ position: 'absolute', right: 40, bottom: -30, width: 100, height: 100, borderRadius: '50%', background: `${levelColor}08` }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', position: 'relative' }}>
          {/* Level badge */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg, ${levelColor}, ${levelColor}aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 24px ${levelColor}40` }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2rem', color: 'white' }}>
                {profile?.level}
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: levelColor, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {profile?.levelName}
            </span>
          </div>

          {/* XP stats */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.5rem', color: levelColor }}>{profile?.xp?.toLocaleString()}</span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>XP</span>
            </div>

            {/* XP Progress bar */}
            <div style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                <span>Level {profile?.level}</span>
                <span>{profile?.progressToNext}% → Level {(profile?.level || 0) + 1}</span>
              </div>
              <div className="progress-bar" style={{ height: 10 }}>
                <div className="progress-fill" style={{
                  width: `${profile?.progressToNext}%`,
                  background: `linear-gradient(90deg, ${levelColor}, ${levelColor}aa)`,
                  boxShadow: `0 0 8px ${levelColor}60`,
                }} />
              </div>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {profile?.nextLevelXP ? `${(profile.nextLevelXP - profile.xp).toLocaleString()} XP to next level` : '🏆 Max level reached!'}
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { label: 'Badges', value: profile?.earnedBadges?.length || 0, icon: '🏅' },
              { label: 'Pomodoros', value: profile?.pomodorosCompleted || 0, icon: '🍅' },
              { label: 'Today XP', value: profile?.dailyXP || 0, icon: '⚡' },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{ textAlign: 'center', background: 'var(--bg-card)', borderRadius: 12, padding: '12px 16px', minWidth: 80 }}>
                <div style={{ fontSize: '1.25rem', marginBottom: 4 }}>{icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem' }}>{value}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab selector */}
      <div style={{ display: 'flex', background: 'var(--bg-input)', borderRadius: 12, padding: 4, gap: 4, width: 'fit-content' }}>
        {[
          { key: 'profile', label: '🏅 Badges' },
          { key: 'leaderboard', label: '🏆 Leaderboard' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            style={{
              padding: '8px 20px', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.875rem',
              background: tab === key ? 'var(--bg-card)' : 'transparent',
              color: tab === key ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: tab === key ? 'var(--shadow-sm)' : 'none', transition: 'all 0.15s',
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Badges tab */}
      {tab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Earned badges */}
          <div className="card card-padding">
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>
              🏅 Earned Badges ({profile?.earnedBadges?.length || 0})
            </h3>
            {profile?.earnedBadges?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Complete actions to earn badges and XP!</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {profile.earnedBadges.map(badge => (
                  <div key={badge.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--success-light)', borderRadius: 12, border: '1px solid var(--success)30' }}>
                    <span style={{ fontSize: '1.75rem' }}>{badge.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{badge.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{badge.desc}</div>
                      <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700, marginTop: 2 }}>+{badge.xp} XP</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Locked badges */}
          <div className="card card-padding">
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>
              🔒 Locked Badges ({profile?.unearnedBadges?.length || 0})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {profile?.unearnedBadges?.map(badge => (
                <div key={badge.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-input)', borderRadius: 12, opacity: 0.6, filter: 'grayscale(0.5)' }}>
                  <span style={{ fontSize: '1.75rem' }}>{badge.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{badge.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{badge.desc}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>+{badge.xp} XP on unlock</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard tab */}
      {tab === 'leaderboard' && (
        <div className="card card-padding">
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 16 }}>🏆 Global Leaderboard</h3>
          {leaderboard.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No one on the leaderboard yet. Be the first! 🚀</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {leaderboard.map((entry, i) => {
                const rankColor = i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'var(--text-muted)';
                const rankEmoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`;
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
                    borderRadius: 12, background: entry.isMe ? 'var(--accent-light)' : 'var(--bg-input)',
                    border: entry.isMe ? '1px solid var(--accent)30' : '1px solid transparent',
                    transition: 'all 0.15s',
                  }}>
                    <div style={{ width: 32, textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: i < 3 ? '1.25rem' : '0.9375rem', color: rankColor }}>
                      {rankEmoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                        {entry.name} {entry.isMe && <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>(You)</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Level {entry.level} {entry.levelName} · {entry.badges} badges
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: LEVEL_COLORS[entry.level] || '#6366f1', fontSize: '1.125rem' }}>
                        {entry.xp.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>XP</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
