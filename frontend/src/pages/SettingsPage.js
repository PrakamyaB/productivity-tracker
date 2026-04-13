import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { usersAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Bell, Lock, Save, User } from 'lucide-react';

const Section = ({ title, icon: Icon, children }) => (
  <div className="card card-padding">
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={16} color="var(--accent)" />
      </div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.0625rem' }}>{title}</h3>
    </div>
    {children}
  </div>
);

const Toggle = ({ label, sub, checked, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
    <div>
      <div style={{ fontWeight: 500, fontSize: '0.9375rem' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
    </div>
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer',
        background: checked ? 'var(--accent)' : 'var(--bg-input)',
        position: 'relative', transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: 'white',
        position: 'absolute', top: 3, left: checked ? 23 : 3,
        transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
      }} />
    </button>
  </div>
);

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { dark, toggle: toggleTheme } = useTheme();

  const [profile, setProfile] = useState({ name: user?.name || '', timezone: user?.timezone || 'UTC' });
  const [prefs, setPrefs] = useState({ ...user?.preferences });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [saving, setSaving] = useState({ profile: false, prefs: false, password: false });

  const save = (key, fn) => async () => {
    setSaving(p => ({ ...p, [key]: true }));
    try {
      await fn();
      toast.success('Saved! ✓');
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(p => ({ ...p, [key]: false }));
    }
  };

  const saveProfile = save('profile', async () => {
    const res = await usersAPI.updateProfile(profile);
    updateUser(res.data.user);
  });

  const savePrefs = save('prefs', async () => {
    await usersAPI.updatePreferences(prefs);
    updateUser({ preferences: prefs });
  });

  const changePassword = save('password', async () => {
    if (passwords.new !== passwords.confirm) throw new Error('Passwords do not match');
    if (passwords.new.length < 6) throw new Error('Password too short');
    await usersAPI.changePassword({ currentPassword: passwords.current, newPassword: passwords.new });
    setPasswords({ current: '', new: '', confirm: '' });
  });

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640, animation: 'fadeIn 0.4s ease' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: 4 }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your account and preferences</p>
      </div>

      {/* Profile avatar */}
      <div className="card card-padding" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 60, height: 60, borderRadius: 16,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.25rem', fontWeight: 800, color: 'white', fontFamily: 'var(--font-display)', flexShrink: 0
        }}>
          {initials}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1.0625rem' }}>{user?.name}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user?.email}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 2 }}>
            Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''}
          </div>
        </div>
      </div>

      {/* Profile */}
      <Section title="Profile" icon={User}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Timezone</label>
            <select className="form-input" value={profile.timezone} onChange={e => setProfile(p => ({ ...p, timezone: e.target.value }))}>
              {['UTC', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Kolkata', 'Asia/Tokyo', 'Australia/Sydney'].map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
          <button onClick={saveProfile} className="btn btn-primary btn-sm" disabled={saving.profile} style={{ alignSelf: 'flex-end' }}>
            <Save size={14} /> {saving.profile ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </Section>

      {/* Appearance */}
      <Section title="Appearance & Notifications" icon={Bell}>
        <div>
          <Toggle label="Dark Mode" sub="Switch between light and dark theme" checked={dark} onChange={toggleTheme} />
          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
          <Toggle label="Email Reminders" sub="Get reminded to log habits at your set time"
            checked={prefs.emailReminders ?? true} onChange={v => setPrefs(p => ({ ...p, emailReminders: v }))} />
          <Toggle label="Weekly Report" sub="Receive a weekly productivity summary"
            checked={prefs.weeklyReport ?? true} onChange={v => setPrefs(p => ({ ...p, weeklyReport: v }))} />
          <div style={{ marginTop: 14 }} className="form-group">
            <label className="form-label">Daily Reminder Time (UTC)</label>
            <input type="time" className="form-input" value={prefs.reminderTime ?? '20:00'} onChange={e => setPrefs(p => ({ ...p, reminderTime: e.target.value }))} style={{ maxWidth: 160 }} />
          </div>
          <button onClick={savePrefs} className="btn btn-primary btn-sm" disabled={saving.prefs} style={{ marginTop: 16, alignSelf: 'flex-end', float: 'right' }}>
            <Save size={14} /> {saving.prefs ? 'Saving...' : 'Save Preferences'}
          </button>
          <div style={{ clear: 'both' }} />
        </div>
      </Section>

      {/* Password */}
      <Section title="Change Password" icon={Lock}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { key: 'current', label: 'Current Password', placeholder: '••••••••' },
            { key: 'new', label: 'New Password', placeholder: 'Min. 6 characters' },
            { key: 'confirm', label: 'Confirm New Password', placeholder: 'Re-enter new password' },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="form-group">
              <label className="form-label">{label}</label>
              <input type="password" className="form-input" value={passwords[key]} placeholder={placeholder}
                onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))} />
            </div>
          ))}
          <button onClick={changePassword} className="btn btn-primary btn-sm" disabled={saving.password} style={{ alignSelf: 'flex-end' }}>
            <Lock size={14} /> {saving.password ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </Section>

      {/* Danger zone */}
      <div className="card card-padding" style={{ border: '1px solid var(--danger)30', background: 'var(--danger-light)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--danger)', marginBottom: 8 }}>Danger Zone</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 14 }}>
          Once you delete your account, there is no going back. All your habits, logs, and goals will be permanently deleted.
        </p>
        <button className="btn btn-danger btn-sm" onClick={() => toast.error('Please contact support to delete your account.')}>
          Delete Account
        </button>
      </div>
    </div>
  );
}
