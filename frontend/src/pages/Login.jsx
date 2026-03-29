import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ThemeToggle from '../components/ThemeToggle';

/* ── SVG Icons ────────────────────────────────────────────────────── */
const IconMail = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const IconLock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconUser = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconEye = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconEyeOff = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const IconAlertTriangle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IconArrowLeft = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/>
    <polyline points="12 19 5 12 12 5"/>
  </svg>
);

const IconArrowRight = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);


/* ── Input Field Component ────────────────────────────────────────── */
function InputField({
  id,
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  icon: Icon,
  autoComplete,
  suffix,
  onKeyDown,
}) {
  return (
    <div className="field-group">
      <label htmlFor={id} className="field-label">
        {label}
      </label>

      <div style={{ position: 'relative' }}>
        {/* Left icon */}
        {Icon && (
          <div
            style={{
              position     : 'absolute',
              left         : 14,
              top          : '50%',
              transform    : 'translateY(-50%)',
              color        : 'var(--muted)',
              pointerEvents: 'none',
              display      : 'flex',
            }}
          >
            <Icon />
          </div>
        )}

        <input
          id={id}
          className="field-input"
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onKeyDown={onKeyDown}
          style={{
            paddingLeft : Icon ? 42 : 14,
            paddingRight: suffix ? 48 : 14,
            width       : '100%',
          }}
        />

        {/* Right suffix (e.g. show/hide password) */}
        {suffix && (
          <div
            style={{
              position : 'absolute',
              right    : 14,
              top      : '50%',
              transform: 'translateY(-50%)',
              display  : 'flex',
            }}
          >
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
}


/* ── Plan Feature Bullets ────────────────────────────────────────── */
const PLAN_FEATURES = [
  'InLegalBERT ADMIT / REJECT prediction',
  'Confidence score and risk band',
  'AI-generated legal explanation',
  'FAISS similar case retrieval',
  'Full analysis history',
];


/* ── Login / Register Page ───────────────────────────────────────── */
export default function Login() {
  const navigate = useNavigate();

  const [tab,     setTab]     = useState('login');
  const [form,    setForm]    = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async () => {
    /* Client-side validation */
    if (!form.email.trim() || !form.password.trim()) {
      setError('Email and password are required.');
      return;
    }
    if (tab === 'register' && !form.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const url = tab === 'login'
        ? 'http://localhost:8000/api/auth/login'
        : 'http://localhost:8000/api/auth/register';

      const payload = tab === 'login'
        ? { email: form.email.trim(), password: form.password }
        : { name: form.name.trim(), email: form.email.trim(), password: form.password };

      const res = await axios.post(url, payload);

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');

    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEnter = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="login-page app-bg" style={{ minHeight: '100vh', display: 'flex', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 24, right: 24, zIndex: 10 }}>
        <ThemeToggle />
      </div>
      <div className="login-grid" style={{ flex: 1, display: 'grid', gridTemplateColumns: 'minmax(400px, 45%) 1fr' }}>

        {/* ── Left Panel — Branding ──────────────────────────── */}
        <div className="login-brand" style={{ background: 'var(--bg-card)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '64px' }}>
          {/* Logo */}
          <div>
            <a href="/" className="logo-mark" style={{ marginBottom: 80, display: 'inline-flex' }}>
              <div className="logo-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v18"/><path d="M3 9l9-6 9 6"/><path d="M5 20h14"/><path d="M8 12H4l-1 5h18l-1-5h-4"/>
                </svg>
              </div>
              <div className="logo-text">Legal<span className="text-gold">AI</span></div>
            </a>

            {/* Main copy */}
            <h1 className="hero-title" style={{ textAlign: 'left', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', marginBottom: 20, color: 'var(--text-primary)' }}>
              Predict petition outcomes<br />
              <span className="text-gold">before you file</span>
            </h1>

            <p className="text-body" style={{ marginBottom: 48, maxWidth: 380, fontSize: '1rem' }}>
              AI-powered analysis trained on 32,000+ real Supreme Court
              judgments, built for Indian legal professionals.
            </p>

            {/* Feature list */}
            <div className="feature-list" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {PLAN_FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-12" style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                  <div style={{ color: 'var(--green-text)', display: 'flex' }}>
                    <IconCheck />
                  </div>
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom attribution */}
          <div>
            <div style={{ width: 48, height: 1, background: 'var(--border)', marginBottom: 20 }} />
            <p className="text-caption">
              Final Year B.Tech Project &mdash; Ekta &amp; Santu
            </p>
            <p className="text-caption" style={{ marginTop: 4 }}>
              Models: InLegalBERT &bull; Qwen 2.5 &bull; SHAP &bull; FAISS
            </p>
          </div>
        </div>


        {/* ── Right Panel — Form ────────────────────────────── */}
        <div className="login-form-wrap" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '64px' }}>
          <div style={{ width: '100%', maxWidth: 400 }}>

            {/* Back link */}
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginBottom: 40, paddingLeft: 0 }}
              onClick={() => navigate('/')}
            >
              <IconArrowLeft />
              Back to home
            </button>

            {/* Heading */}
            <div style={{ marginBottom: 36 }}>
              <h2 className="serif" style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>
                {tab === 'login' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="text-body" style={{ fontSize: '0.9rem' }}>
                {tab === 'login'
                  ? 'Sign in to access your LegalAI dashboard.'
                  : 'Start with 3 free petition analyses per month.'}
              </p>
            </div>

            {/* Tab switcher */}
            <div className="tab-strip" style={{ marginBottom: 28 }}>
              <button
                className={`tab-btn ${tab === 'login' ? 'active' : ''}`}
                onClick={() => { setTab('login'); setError(''); }}
              >
                Sign In
              </button>
              <button
                className={`tab-btn ${tab === 'register' ? 'active' : ''}`}
                onClick={() => { setTab('register'); setError(''); }}
              >
                Register
              </button>
            </div>

            {/* Form fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 24 }}>
              {tab === 'register' && (
                <InputField
                  id="name"
                  label="Full Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Adv. Ramesh Kumar"
                  icon={IconUser}
                  autoComplete="name"
                />
              )}

              <InputField
                id="email"
                label="Email Address"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="advocate@lawfirm.in"
                icon={IconMail}
                autoComplete={tab === 'login' ? 'email' : 'off'}
              />

              <InputField
                id="password"
                label="Password"
                type={showPwd ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={tab === 'register' ? 'Minimum 6 characters' : 'Your password'}
                icon={IconLock}
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                onKeyDown={handleEnter}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    style={{
                      background: 'none',
                      border    : 'none',
                      cursor    : 'pointer',
                      color     : 'var(--muted)',
                      padding   : 0,
                      display   : 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showPwd ? <IconEyeOff /> : <IconEye />}
                  </button>
                }
              />
            </div>

            {/* Error */}
            {error && (
              <div className="alert alert-error mb-20">
                <IconAlertTriangle style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              className="btn btn-primary w-full"
              style={{ fontSize: '0.9375rem', padding: '13px 24px' }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-sm" style={{ marginRight: 8 }} />
                  {tab === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                <>
                  {tab === 'login' ? 'Sign In' : 'Create Account'}
                  <IconArrowRight style={{ marginLeft: 8 }} />
                </>
              )}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span className="text-caption">or</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            {/* Guest access */}
            <button
              className="btn btn-outline w-full"
              onClick={() => navigate('/dashboard')}
            >
              Continue as guest (3 free analyses)
            </button>

            {/* Switch tab hint */}
            <p className="text-center text-caption" style={{ marginTop: 28 }}>
              {tab === 'login' ? (
                <>
                  Don&rsquo;t have an account?{' '}
                  <span
                    style={{ color: 'var(--gold)', cursor: 'pointer', fontWeight: 600 }}
                    onClick={() => { setTab('register'); setError(''); }}
                  >
                    Register for free
                  </span>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <span
                    style={{ color: 'var(--gold)', cursor: 'pointer', fontWeight: 600 }}
                    onClick={() => { setTab('login'); setError(''); }}
                  >
                    Sign in
                  </span>
                </>
              )}
            </p>

          </div>
        </div>
      </div>

    </div>
  );
}