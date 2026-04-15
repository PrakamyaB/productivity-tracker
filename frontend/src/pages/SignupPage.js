import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Field = ({ name, label, type = 'text', icon: Icon, placeholder, autoComplete, value, error, onChange, toggle, showPw }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <div style={{ position: 'relative' }}>
      <Icon size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
      <input
        type={type}
        className={`form-input ${error ? 'error' : ''}`}
        style={{ paddingLeft: 40, paddingRight: toggle ? 44 : undefined }}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
      />
      {toggle && (
        <button type="button" onClick={toggle} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
    {error && <span className="form-error">{error}</span>}
  </div>
);

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { signup } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      toast.success('Account created! Let\'s get productive 🚀');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Signup failed. Please try again.';
      toast.error(msg);
      if (msg.includes('email')) setErrors({ email: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
          }}>
            <Zap size={24} color="white" fill="white" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.875rem', fontWeight: 800, marginBottom: 8 }}>
            Start tracking today
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Create your free account and take control of your productivity.
          </p>
        </div>

        <div className="card card-padding">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field
              name="name"
              label="Full Name"
              icon={User}
              placeholder="Alex Johnson"
              autoComplete="name"
              value={form.name}
              error={errors.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            />
            <Field
              name="email"
              label="Email address"
              icon={Mail}
              placeholder="alex@example.com"
              autoComplete="email"
              value={form.email}
              error={errors.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            />
            <Field
              name="password"
              label="Password"
              type={showPw ? 'text' : 'password'}
              icon={Lock}
              placeholder="Min. 6 characters"
              autoComplete="new-password"
              value={form.password}
              error={errors.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              toggle={() => setShowPw(p => !p)}
              showPw={showPw}
            />
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  className={`form-input ${errors.confirm ? 'error' : ''}`}
                  style={{ paddingLeft: 40 }}
                  placeholder="Re-enter password"
                  value={form.confirm}
                  onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                  autoComplete="new-password"
                />
              </div>
              {errors.confirm && <span className="form-error">{errors.confirm}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 8 }}>
              {loading
                ? <div className="animate-spin" style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} />
                : <><span>Create Account</span><ArrowRight size={16} /></>
              }
            </button>
          </form>
        </div>

        <p style={{ marginTop: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
