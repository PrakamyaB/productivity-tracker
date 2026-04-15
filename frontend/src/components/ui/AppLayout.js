// REPLACE frontend/src/components/ui/AppLayout.js with this

import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Target, BarChart3,
  Settings, LogOut, Moon, Sun, Menu, Zap, ListChecks,
  Timer, BookOpen, GraduationCap, FileText, Users, Trophy, CalendarDays
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/today', icon: CheckSquare, label: "Today's Log" },
      { to: '/habits', icon: ListChecks, label: 'Habits' },
      { to: '/analytics', icon: BarChart3, label: 'Analytics' },
      { to: '/goals', icon: Target, label: 'Goals' },
    ],
  },
  {
    label: 'Student Tools',
    items: [
      { to: '/pomodoro', icon: Timer, label: 'Pomodoro', badge: '🍅' },
      { to: '/assignments', icon: FileText, label: 'Assignments' },
      { to: '/exams', icon: CalendarDays, label: 'Exam Countdown' },
      { to: '/cgpa', icon: GraduationCap, label: 'CGPA Calculator' },
      { to: '/notes', icon: BookOpen, label: 'Quick Notes' },
      { to: '/study-rooms', icon: Users, label: 'Study Rooms' },
    ],
  },
  {
    label: 'Progress',
    items: [
      { to: '/gamification', icon: Trophy, label: 'XP & Badges', badge: '🎮' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('See you soon! 👋');
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="app-layout">
      {sidebarOpen && (
        <div className="modal-overlay" style={{ zIndex: 99 }} onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, var(--pink-light), var(--blue-light))', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="var(--accent)" fill="var(--accent)" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>ProductivityOS</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: -1 }}>Student Edition</div>
            </div>
          </div>
        </div>

        {/* Nav sections */}
        <nav style={{ padding: '12px 10px', flex: 1, overflowY: 'auto' }}>
          {NAV_SECTIONS.map(({ label, items }) => (
            <div key={label} style={{ marginBottom: 4 }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '10px 10px 4px' }}>
                {label}
              </div>
              {items.map(({ to, icon: Icon, label: itemLabel, badge }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '8px 10px', borderRadius: 8, marginBottom: 4,
                    fontSize: '0.8375rem', fontWeight: 500, textDecoration: 'none',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    background: isActive ? 'linear-gradient(135deg, var(--lilac-light), var(--pink-light))' : 'transparent',
                    border: isActive ? '1px solid var(--border)' : '1px solid transparent',
                    boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s',
                  })}
                >
                  <Icon size={15} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{itemLabel}</span>
                  {badge && <span style={{ fontSize: '0.75rem' }}>{badge}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
          <button onClick={toggle} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.8375rem', fontWeight: 500, width: '100%', border: 'none', cursor: 'pointer', marginBottom: 4, fontFamily: 'var(--font-body)', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--lilac-light)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
            {dark ? <Sun size={15} /> : <Moon size={15} />}
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px', borderRadius: 8, background: 'rgba(255,255,255,0.62)', border: '1px solid var(--border)', marginTop: 4 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--accent), var(--pink))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            </div>
            <button onClick={handleLogout} title="Logout" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, borderRadius: 6, transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }} id="mobile-header">
          <button className="btn-icon" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9375rem' }}>ProductivityOS</div>
          <button className="btn-icon" onClick={toggle}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
        </div>
        <div className="page-container"><Outlet /></div>
      </main>

      <style>{`@media (max-width: 768px) { #mobile-header { display: flex !important; } }`}</style>
    </div>
  );
}
