import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, BookOpen, Settings, Volume2, VolumeX } from 'lucide-react';
import { analyticsAPI } from '../services/api';
import api from '../services/api';
import toast from 'react-hot-toast';

const MODES = {
  focus: { label: 'Focus', duration: 25 * 60, color: '#6366f1', emoji: '🍅' },
  short: { label: 'Short Break', duration: 5 * 60, color: '#10b981', emoji: '☕' },
  long: { label: 'Long Break', duration: 15 * 60, color: '#3b82f6', emoji: '🌿' },
};

const pad = n => String(n).padStart(2, '0');

export default function PomodoroPage() {
  const [mode, setMode] = useState('focus');
  const [seconds, setSeconds] = useState(MODES.focus.duration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [customMinutes, setCustomMinutes] = useState(25);
  const [showSettings, setShowSettings] = useState(false);
  const [sound, setSound] = useState(true);
  const [task, setTask] = useState('');
  const [completedToday, setCompletedToday] = useState([]);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const currentMode = MODES[mode];
  const total = mode === 'focus' ? customMinutes * 60 : currentMode.duration;
  const progress = ((total - seconds) / total) * 100;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const playSound = useCallback((type) => {
    if (!sound) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = type === 'complete' ? 880 : 440;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  }, [sound]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            handleComplete();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const handleComplete = async () => {
    playSound('complete');
    if (mode === 'focus') {
      const newSessions = sessions + 1;
      setSessions(newSessions);
      const focusMins = customMinutes;
      setTotalFocusTime(t => t + focusMins);
      setCompletedToday(prev => [...prev, { task: task || 'Focus session', duration: focusMins, time: new Date() }]);
      toast.success(`🍅 Pomodoro complete! +25 XP`, { duration: 4000 });
      try {
        await api.post('/gamification/pomodoro');
      } catch {}
      // Auto-switch to break
      const nextMode = newSessions % 4 === 0 ? 'long' : 'short';
      setTimeout(() => { switchMode(nextMode); }, 500);
    } else {
      toast.success('Break over! Time to focus 💪');
      setTimeout(() => { switchMode('focus'); }, 500);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setRunning(false);
    setSeconds(newMode === 'focus' ? customMinutes * 60 : MODES[newMode].duration);
  };

  const handleStart = () => { setRunning(true); playSound('start'); };
  const handlePause = () => setRunning(false);
  const handleReset = () => { setRunning(false); setSeconds(mode === 'focus' ? customMinutes * 60 : currentMode.duration); };

  const circumference = 2 * Math.PI * 120;
  const strokeDash = circumference - (progress / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, animation: 'fadeIn 0.4s ease', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: 4 }}>
            🍅 Pomodoro Timer
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Stay focused, earn XP, level up.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setSound(s => !s)} className="btn btn-secondary btn-sm">
            {sound ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
          <button onClick={() => setShowSettings(s => !s)} className="btn btn-secondary btn-sm">
            <Settings size={15} /> Settings
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="card card-padding" style={{ background: 'var(--accent-light)', border: '1px solid var(--accent)30' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <label className="form-label" style={{ whiteSpace: 'nowrap' }}>Focus Duration</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {[15, 20, 25, 30, 45, 60].map(m => (
                  <button key={m} onClick={() => { setCustomMinutes(m); if (mode === 'focus') setSeconds(m * 60); }}
                    className={`btn btn-sm ${customMinutes === m ? 'btn-primary' : 'btn-secondary'}`}>
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Timer */}
        <div className="card card-padding" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          {/* Mode selector */}
          <div style={{ display: 'flex', background: 'var(--bg-input)', borderRadius: 12, padding: 4, gap: 4, width: '100%' }}>
            {Object.entries(MODES).map(([key, m]) => (
              <button key={key} onClick={() => switchMode(key)}
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 9, border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.8125rem',
                  background: mode === key ? m.color : 'transparent',
                  color: mode === key ? 'white' : 'var(--text-muted)',
                  transition: 'all 0.2s',
                }}>
                {m.emoji} {m.label}
              </button>
            ))}
          </div>

          {/* Task input */}
          <input className="form-input" value={task} onChange={e => setTask(e.target.value)}
            placeholder="What are you working on? (optional)"
            style={{ width: '100%', textAlign: 'center', fontSize: '0.9375rem' }} />

          {/* SVG Timer Ring */}
          <div style={{ position: 'relative', width: 280, height: 280 }}>
            <svg width="280" height="280" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="140" cy="140" r="120" fill="none" stroke="var(--bg-input)" strokeWidth="12" />
              <circle cx="140" cy="140" r="120" fill="none"
                stroke={currentMode.color}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDash}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 4
            }}>
              <div style={{ fontSize: '4rem', fontFamily: 'var(--font-display)', fontWeight: 800, lineHeight: 1, color: currentMode.color }}>
                {pad(mins)}:{pad(secs)}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {currentMode.emoji} {currentMode.label}
              </div>
              {running && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  Session #{sessions + 1}
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button onClick={handleReset} className="btn btn-secondary" style={{ borderRadius: '50%', width: 46, height: 46, padding: 0 }}>
              <RotateCcw size={18} />
            </button>
            <button
              onClick={running ? handlePause : handleStart}
              style={{
                width: 72, height: 72, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: currentMode.color, color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', boxShadow: `0 8px 24px ${currentMode.color}50`,
                transition: 'all 0.2s', transform: running ? 'scale(0.95)' : 'scale(1)',
              }}>
              {running ? <Pause size={28} /> : <Play size={28} />}
            </button>
            <button onClick={() => switchMode(mode === 'focus' ? 'short' : 'focus')}
              className="btn btn-secondary" style={{ borderRadius: '50%', width: 46, height: 46, padding: 0 }}>
              {mode === 'focus' ? <Coffee size={18} /> : <BookOpen size={18} />}
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 20, width: '100%' }}>
            {[
              { label: 'Sessions Today', value: sessions, color: currentMode.color },
              { label: 'Focus Time', value: `${totalFocusTime}m`, color: '#10b981' },
              { label: 'XP Earned', value: `${sessions * 25}`, color: '#f59e0b' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ flex: 1, textAlign: 'center', background: 'var(--bg-input)', borderRadius: 12, padding: '12px 8px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.375rem', color }}>{value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar - session log */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Progress to next break */}
          <div className="card card-padding">
            <div style={{ fontWeight: 700, marginBottom: 12, fontFamily: 'var(--font-display)' }}>Progress to Long Break</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{
                  flex: 1, height: 10, borderRadius: 5,
                  background: i < (sessions % 4) ? '#6366f1' : 'var(--bg-input)',
                  transition: 'background 0.3s',
                }} />
              ))}
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {4 - (sessions % 4)} sessions until long break 🌿
            </div>
          </div>

          {/* Today's sessions */}
          <div className="card card-padding" style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, marginBottom: 12, fontFamily: 'var(--font-display)' }}>
              Today's Sessions
            </div>
            {completedToday.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '20px 0' }}>
                🍅 No sessions yet.<br />Start focusing!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
                {completedToday.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--bg-input)', borderRadius: 10 }}>
                    <span style={{ fontSize: '1rem' }}>🍅</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{s.task}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.duration}m · {s.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700 }}>+25 XP</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="card card-padding" style={{ background: 'var(--accent-light)', border: '1px solid var(--accent)20' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              💡 <strong>Tip:</strong> Every completed Pomodoro earns you <strong>+25 XP</strong>. Complete 4 in a row to unlock a long break!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
