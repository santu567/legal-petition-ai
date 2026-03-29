import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ThemeToggle from '../components/ThemeToggle';

/* ─── Inline SVG Icons ─────────────────────────────────────────────── */
const Ico = {
  Scale: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18"/><path d="M3 9l9-6 9 6"/><path d="M5 20h14"/><path d="M8 12H4l-1 5h18l-1-5h-4"/>
    </svg>
  ),
  Dashboard: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  Predict: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
    </svg>
  ),
  Cases: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Explain: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Upload: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  Logout: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Check: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Alert: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Brain: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.04-4.63A3 3 0 0 1 4.5 9.5a3 3 0 0 1 .46-1.63 2.5 2.5 0 0 1 4.54-3.37z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.04-4.63A3 3 0 0 0 19.5 9.5a3 3 0 0 0-.46-1.63 2.5 2.5 0 0 0-4.54-3.37z"/>
    </svg>
  ),
  Settings: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  Search: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  FileText: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  Target: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  Zap: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  Clock: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  User: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Globe: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  Link: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  X: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  CircleCheck: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  CircleX: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
};

/* ─── Toast ─────────────────────────────────────────────────────────── */
function Toast({ msg, show }) {
  return (
    <div className={`toast ${show ? 'show' : ''}`}>
      <span>{msg}</span>
    </div>
  );
}

/* ─── Confidence Bar ─────────────────────────────────────────────────── */
function ConfBar({ pct, color }) {
  return (
    <div className="conf-bar">
      <div className="conf-track">
        <div className="conf-fill" style={{ width: `${pct}%`, background: color || undefined }} />
      </div>
      <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'DM Mono, monospace' }}>{pct}%</span>
    </div>
  );
}

/* ─── Pill ─────────────────────────────────────────────────────────── */
function Pill({ outcome }) {
  const cls = outcome === 'ADMITTED' || outcome === 'ADMIT'
    ? 'pill-admit' : outcome === 'REJECTED' || outcome === 'REJECT'
    ? 'pill-reject' : 'pill-pending';
  const label = outcome === 'ADMITTED' || outcome === 'ADMIT' ? 'ADMIT'
    : outcome === 'REJECTED' || outcome === 'REJECT' ? 'REJECT' : 'PENDING';
  return (
    <span className={`badge ${cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {label}
    </span>
  );
}

/* ─── Donut Chart ────────────────────────────────────────────────────── */
function Donut() {
  return (
    <div className="donut-wrap">
      <div className="donut">
        <div className="donut-inner">45%</div>
      </div>
      <div className="legend">
        {[
          { color: 'var(--green-text)', label: 'Admitted',       val: '45%' },
          { color: 'var(--scarlet)',    label: 'Rejected',        val: '20%' },
          { color: 'var(--gold)',       label: 'Pending Review',  val: '35%' },
        ].map(l => (
          <div className="legend-item" key={l.label}>
            <div className="legend-label">
              <div className="legend-dot" style={{ background: l.color }} />
              {l.label}
            </div>
            <div className="legend-val">{l.val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── DASHBOARD VIEW ─────────────────────────────────────────────────── */
function DashboardView({ openModal }) {
  const STATS = [
    { icon: <Ico.FileText />, val: '2,847', label: 'Petitions Analysed',   change: '+12.4% this month',   dir: 'up' },
    { icon: <Ico.Target />,   val: '87.3%', label: 'Model Accuracy',       change: '+2.1% vs last quarter', dir: 'up' },
    { icon: <Ico.Zap />,      val: '38s',   label: 'Avg. Analysis Time',   change: '99% faster than manual', dir: 'up' },
    { icon: <Ico.Clock />,    val: '184',   label: 'Pending Review Queue', change: '23 fewer than yesterday', dir: 'up' },
  ];

  const CASES = [
    { id: 'SC/2025/04821', pet: 'Ramesh Kumar',  cat: 'Fundamental Rights', verdict: 'ADMIT',   conf: 91 },
    { id: 'HC/2025/00192', pet: 'Priya Sharma',  cat: 'Service Matter',     verdict: 'REJECT',  conf: 78 },
    { id: 'SC/2025/04799', pet: 'Anil Gupta',    cat: 'Constitutional',     verdict: 'ADMIT',   conf: 96 },
    { id: 'HC/2025/00187', pet: 'Sunita Devi',   cat: 'Consumer',           verdict: 'PENDING', conf: 64 },
    { id: 'SC/2025/04750', pet: 'Mohammed Ali',  cat: 'Criminal',           verdict: 'ADMIT',   conf: 83 },
  ];

  return (
    <div>
      <div className="stats-grid">
        {STATS.map((s, i) => (
          <div className="stat-card animate-in" key={s.label} style={{ animationDelay: `${i * 80}ms` }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value serif">{s.val}</div>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-change ${s.dir}`}>{s.change}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Petitions</div>
            <span className="badge badge-gold">Live</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Case ID</th><th>Petitioner</th><th>Category</th>
                  <th>Verdict</th><th>Confidence</th>
                </tr>
              </thead>
              <tbody>
                {CASES.map(c => (
                  <tr key={c.id} onClick={() => openModal(c)}>
                    <td><span className="mono text-gold" style={{ fontSize: 12 }}>{c.id}</span></td>
                    <td>{c.pet}</td>
                    <td><span className="badge badge-slate">{c.cat}</span></td>
                    <td><Pill outcome={c.verdict} /></td>
                    <td><ConfBar pct={c.conf} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Admission Breakdown</div>
            <span className="badge badge-gold">Mar 2025</span>
          </div>
          <Donut />
          <div style={{ padding: '0 20px 20px' }}>
            <div style={{ padding: 12, background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 8, fontSize: 12, color: 'var(--gold)', textAlign: 'center' }}>
              +8.3% improvement in admission rate vs Q4 2024
            </div>
          </div>
        </div>
      </div>

      {/* Model Health */}
      <div className="card mt-16">
        <div className="card-header">
          <div className="card-title">Model Health &amp; Performance</div>
          <span className="badge badge-green">Operational</span>
        </div>
        <div className="model-health-grid" style={{ padding: '16px 0' }}>
          {[
            { val: '87.3%', label: 'Precision',      color: 'var(--gold)' },
            { val: '84.1%', label: 'Recall',          color: 'var(--green-text)' },
            { val: '85.7%', label: 'F1 Score',        color: 'var(--cream)' },
            { val: '32K',   label: 'Training Cases',  color: '#6CB4E4' },
            { val: 'Low',   label: 'Drift Risk',      color: 'var(--red-text)' },
          ].map(m => (
            <div className="model-metric" key={m.label}>
              <div className="stat-value" style={{ fontSize: 20, color: m.color }}>{m.val}</div>
              <div className="stat-label">{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── PREDICT VIEW ────────────────────────────────────────────────────── */
function PredictView({ toast }) {
  const [text, setText]         = useState('');
  const [form, setForm]         = useState({ petitioner: '', respondent: '', category: '', court: 'Supreme Court of India', grounds: '' });
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState('');
  const [pdfLabel, setPdfLabel] = useState('');
  const [step, setStep]         = useState(0);
  const fileRef = useRef();
  const token = localStorage.getItem('token');

  const STEPS = [
    'Tokenising legal text with InLegalBERT...',
    'Extracting constitutional provisions...',
    'Comparing with 32,000 historical cases...',
    'Running SHAP explainability analysis...',
    'Compiling prediction report...',
  ];

  const handlePDF = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfLabel(`Extracting ${file.name}...`);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await axios.post('http://localhost:8000/api/extract-pdf', fd, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 30000 });
      setText(res.data.text);
      setPdfLabel(`${file.name} — ${res.data.characters?.toLocaleString()} chars extracted`);
      toast(`PDF extracted successfully`);
    } catch {
      setPdfLabel('');
      setError('PDF extraction failed. Please paste the text manually.');
    }
  };

  const analyze = async () => {
    const full = [form.petitioner && `Petitioner: ${form.petitioner}`, form.respondent && `Respondent: ${form.respondent}`, form.category && `Category: ${form.category}`, form.grounds && `Legal Grounds: ${form.grounds}`, text].filter(Boolean).join('\n\n');
    if (full.trim().length < 50) { setError('Please enter at least 50 characters of petition details.'); return; }
    setError(''); setLoading(true); setResult(null); setStep(0);

    const iv = setInterval(() => setStep(s => Math.min(s + 1, STEPS.length - 1)), 700);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post('http://localhost:8000/api/analyze', { text: full, generate_explanation: true }, { timeout: 300000, headers });
      setResult(res.data);
      toast('Analysis complete — ' + res.data.confidence + '% confidence');
    } catch (err) {
      setError(err.response?.data?.detail || 'Server error. Ensure the backend is running on port 8000.');
    } finally {
      clearInterval(iv); setLoading(false);
    }
  };

  const isAdmit  = result?.prediction === 'ADMITTED';
  const resColor = isAdmit ? 'var(--green-text)' : 'var(--red-text)';
  const deg      = result ? Math.round((result.confidence / 100) * 360) : 0;

  return (
    <div>
      <div className="section-heading">
        <h2>Predict Petition Admission</h2>
        <p>Submit petition details for AI-powered admission likelihood assessment using InLegalBERT</p>
      </div>

      <div className="step-indicator">
        {['Petition Details', 'Legal Grounds', 'Analysis Result'].map((s, i) => (
          <React.Fragment key={s}>
            <div className={`step ${i < (result ? 3 : i === 0 ? 1 : 0) ? 'done' : i === (result ? 2 : 0) ? 'current' : ''}`}>
              <div className="step-num">{i + 1}</div> {s}
            </div>
            {i < 2 && <div className="step-line" />}
          </React.Fragment>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24 }}>
        {/* Form */}
        <div className="form-card">
          <div className="form-header">
            <div className="form-title">Petition Information</div>
            <div className="form-sub">Enter petition details for accurate prediction</div>
          </div>
          <div className="form-body">
            <div className="form-grid">
              <div className="form-group">
                <label>Petitioner Name</label>
                <input value={form.petitioner} onChange={e => setForm({ ...form, petitioner: e.target.value })} placeholder="e.g. Ramesh Kumar" />
              </div>
              <div className="form-group">
                <label>Respondent</label>
                <input value={form.respondent} onChange={e => setForm({ ...form, respondent: e.target.value })} placeholder="e.g. State of Maharashtra" />
              </div>
              <div className="form-group">
                <label>Case Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="">Select Category</option>
                  {['Constitutional Matter','Fundamental Rights','Criminal','Civil','Service Matter','Consumer','Writ Petition','Special Leave Petition','PIL'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Court Level</label>
                <select value={form.court} onChange={e => setForm({ ...form, court: e.target.value })}>
                  <option>Supreme Court of India</option>
                  <option>High Court</option>
                  <option>District Court</option>
                </select>
              </div>
              <div className="form-group full">
                <label>Petition Summary <span className="text-muted" style={{ fontSize: 10, letterSpacing: 0, textTransform: 'none', fontWeight: 400 }}>— or paste full petition text</span></label>
                <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Paste the petition text here, or briefly describe key facts, relief sought, and constitutional grounds..." style={{ minHeight: 140 }} />
                <div className="char-count">{text.length} characters</div>
              </div>
              <div className="form-group full">
                <label>Legal Grounds &amp; Provisions</label>
                <textarea value={form.grounds} onChange={e => setForm({ ...form, grounds: e.target.value })} placeholder="e.g. Article 21 — Right to Life; Section 482 CrPC..." style={{ minHeight: 70 }} />
              </div>
            </div>

            {/* PDF Upload */}
            <div className="form-group mb-20">
              <label>Attach Petition PDF</label>
              <input type="file" ref={fileRef} accept=".pdf" onChange={handlePDF} style={{ display: 'none' }} />
              <div className="upload-zone" onClick={() => fileRef.current.click()}>
                <div className="upload-icon" style={{ color: 'var(--gold)' }}><Ico.Upload /></div>
                <div className="upload-text">Drag &amp; drop or <span className="link">browse file</span></div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>PDF only, max 10 MB</div>
              </div>
              {pdfLabel && <div style={{ fontSize: 12, color: 'var(--gold)', marginTop: 6 }}>{pdfLabel}</div>}
            </div>

            {error && (
              <div className="alert alert-error mb-16">
                <Ico.Alert />{error}
              </div>
            )}

            <div className="flex gap-8">
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setText(''); setForm({ petitioner: '', respondent: '', category: '', court: 'Supreme Court of India', grounds: '' }); setResult(null); setError(''); setPdfLabel(''); }}>
                Clear
              </button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={analyze} disabled={loading}>
                {loading ? <><span className="spinner-sm" /> Analysing...</> : 'Analyse Petition'}
              </button>
            </div>
          </div>
        </div>

        {/* Result Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="result-card">
            <div className="card-header">
              <div className="card-title">AI Prediction</div>
              <span className={`badge ${result ? (isAdmit ? 'badge-green' : 'badge-red') : 'badge-gold'}`}>
                {result ? 'Complete' : loading ? 'Running' : 'Ready'}
              </span>
            </div>

            {loading ? (
              <div style={{ padding: 28, textAlign: 'center' }}>
                <div className="spinner-ring" style={{ margin: '0 auto 16px' }} />
                <div className="serif" style={{ fontSize: 15, marginBottom: 8 }}>Analysing Petition</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'DM Mono, monospace' }}>
                  {STEPS[step]}
                </div>
              </div>
            ) : result ? (
              <div style={{ padding: 24, textAlign: 'center' }}>
                <div style={{ width: 120, height: 120, borderRadius: '50%', background: `conic-gradient(${resColor} 0deg ${deg}deg, rgba(255,255,255,0.05) ${deg}deg)`, margin: '0 auto 16px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', background: 'var(--deep)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="serif" style={{ fontSize: 24, fontWeight: 700, color: resColor, lineHeight: 1 }}>{result.confidence}%</div>
                    <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--muted)' }}>confidence</div>
                  </div>
                </div>
                <div className="serif" style={{ fontSize: 18, fontWeight: 700, color: resColor, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {isAdmit ? <><Ico.CircleCheck /> Likely Admitted</> : <><Ico.CircleX /> Likely Rejected</>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 16 }}>
                  {result.band_message || 'Based on InLegalBERT analysis of petition content and historical patterns.'}
                </div>

                {/* Prob bars */}
                <div style={{ textAlign: 'left', marginBottom: 16 }}>
                  {[
                    { label: 'Admit Probability',  val: result.admit_prob,  cls: 'prob-fill-admit' },
                    { label: 'Reject Probability', val: result.reject_prob, cls: 'prob-fill-reject' },
                  ].map(b => (
                    <div key={b.label} style={{ marginBottom: 10 }}>
                      <div className="flex justify-between mb-4">
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{b.label}</span>
                        <span className="mono" style={{ fontSize: 12, color: 'var(--cream)' }}>{b.val}%</span>
                      </div>
                      <div className="prob-track">
                        <div className={b.cls} style={{ width: `${b.val}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12, color: 'var(--gold)', display: 'flex', justifyContent: 'center' }}><Ico.Scale /></div>
                <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
                  Fill in the petition details and click<br />
                  <strong style={{ color: 'var(--cream)' }}>Analyse Petition</strong> to get an AI-powered admission prediction.
                </div>
              </div>
            )}
          </div>

          {/* AI Explanation */}
          {result?.explanation && (
            <div className="result-card" style={{ animationDelay: '0.1s' }}>
              <div className="card-header">
                <div className="card-title">AI Legal Analysis</div>
                <span className="badge badge-gold">Qwen 2.5</span>
              </div>
              <div style={{ padding: 20, fontSize: 13, color: 'var(--muted)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
                {result.explanation}
              </div>
            </div>
          )}

          {/* Similar Cases */}
          {result?.similar_cases?.length > 0 && (
            <div className="result-card">
              <div className="card-header">
                <div className="card-title">Precedent Cases</div>
                <span className="badge badge-green">FAISS</span>
              </div>
              <div style={{ padding: '0 0 8px' }}>
                {result.similar_cases.map((c, i) => (
                  <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                    <div className="flex justify-between mb-8">
                      <span className="mono text-gold" style={{ fontSize: 11 }}>Case #{c.rank}</span>
                      <div className="flex gap-8 items-center">
                        <span style={{ fontSize: 11, color: 'var(--muted)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 12, padding: '2px 8px' }}>{c.similarity}% match</span>
                        <Pill outcome={c.outcome} />
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.65 }}>{c.excerpt}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          {result && (
            <div className="disclaimer-box">
              <Ico.Alert />
              <div>Advisory system only. Final admission decision rests with the presiding Judicial Officer and is not legally binding.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── CASES VIEW ─────────────────────────────────────────────────────── */
function CasesView({ openModal }) {
  const [filter, setFilter] = useState('all');
  const ALL = [
    { id: 'SC/2025/04821', pet: 'Ramesh Kumar',  resp: 'State of Maharashtra',           cat: 'Fundamental Rights', verdict: 'ADMIT',   conf: 91, date: '25 Mar 2025' },
    { id: 'HC/2025/00192', pet: 'Priya Sharma',  resp: 'Delhi High Court',                cat: 'Service Matter',     verdict: 'REJECT',  conf: 78, date: '24 Mar 2025' },
    { id: 'SC/2025/04799', pet: 'Anil Gupta',    resp: 'Union of India',                  cat: 'Constitutional',     verdict: 'ADMIT',   conf: 96, date: '23 Mar 2025' },
    { id: 'HC/2025/00187', pet: 'Sunita Devi',   resp: 'Bank of India',                   cat: 'Consumer',           verdict: 'PENDING', conf: 64, date: '23 Mar 2025' },
    { id: 'SC/2024/03981', pet: 'Vikram Singh',  resp: 'Central Bureau of Investigation', cat: 'Criminal',           verdict: 'ADMIT',   conf: 88, date: '15 Dec 2024' },
  ];
  const shown = filter === 'all' ? ALL : ALL.filter(c => c.verdict.toLowerCase().includes(filter));
  return (
    <div>
      <div className="flex justify-between items-center mb-20" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div className="section-heading" style={{ marginBottom: 0 }}>
          <h2>Case Repository</h2>
          <p>35,000+ historical petitions from Supreme Court &amp; High Courts</p>
        </div>
      </div>
      <div className="flex gap-8 mb-16" style={{ flexWrap: 'wrap' }}>
        {[['all', 'All Cases'], ['admit', 'Admitted'], ['reject', 'Rejected'], ['pending', 'Pending']].map(([v, l]) => (
          <button key={v} className={`filter-chip ${filter === v ? 'active' : ''}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Case ID</th><th>Petitioner</th><th>Respondent</th><th>Category</th><th>AI Verdict</th><th>Confidence</th><th>Date</th></tr>
            </thead>
            <tbody>
              {shown.map(c => (
                <tr key={c.id} onClick={() => openModal(c)}>
                  <td><span className="mono text-gold" style={{ fontSize: 12 }}>{c.id}</span></td>
                  <td>{c.pet}</td>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>{c.resp}</td>
                  <td><span className="badge badge-slate">{c.cat}</span></td>
                  <td><Pill outcome={c.verdict} /></td>
                  <td><ConfBar pct={c.conf} /></td>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>{c.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <span>Showing {shown.length} of 35,000 cases</span>
          <div className="flex gap-6">
            {['Prev', '1', '2', '3', 'Next'].map(p => (
              <button key={p} className="btn btn-outline btn-sm" style={p === '1' ? { borderColor: 'var(--gold)', color: 'var(--gold)' } : {}}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── EXPLAIN VIEW ───────────────────────────────────────────────────── */
function ExplainView() {
  const BARS = [
    { label: 'Constitutional Grounds', pct: 82, val: '+0.342', pos: true },
    { label: 'Prior Case Outcome',     pct: 58, val: '+0.218', pos: true },
    { label: 'Petition Length',        pct: 40, val: '+0.156', pos: true },
    { label: 'Petitioner Type',        pct: 28, val: '+0.098', pos: true },
    { label: 'Legal Citations',        pct: 25, val: '-0.094', pos: false },
    { label: 'Procedural Errors',      pct: 13, val: '-0.047', pos: false },
  ];
  return (
    <div>
      <div className="section-heading">
        <h2>Explainability Dashboard</h2>
        <p>SHAP-based explanations — understand how the model reaches its decisions</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">SHAP Feature Importance</div>
            <span className="badge badge-gold">Case SC/2025/04821</span>
          </div>
          <div className="bar-chart">
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12 }}>
              Base value: <span className="text-gold mono">0.421</span> &rarr; Final: <span className="text-green mono">0.910</span>
            </div>
            {BARS.map(b => (
              <div className="bar-row" key={b.label}>
                <div className="bar-label">{b.label}</div>
                <div className="bar-track">
                  <div className={`bar-fill ${b.pos ? 'pos' : 'neg'}`} style={{ width: `${b.pct}%` }} />
                </div>
                <div className={`bar-val ${b.pos ? 'text-green' : 'text-red'}`}>{b.val}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Confidence Distribution</div>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>Admit vs Reject</span>
          </div>
          <div style={{ padding: 20 }}>
            {[{ label: 'Admit', val: 91, cls: 'prob-fill-admit', color: 'var(--green-text)' }, { label: 'Reject', val: 9, cls: 'prob-fill-reject', color: 'var(--red-text)' }].map(b => (
              <div key={b.label} style={{ marginBottom: 20 }}>
                <div className="flex justify-between mb-8">
                  <span style={{ fontSize: 13, color: b.color, fontWeight: 600 }}>{b.label}</span>
                  <span className="mono" style={{ fontSize: 13, color: b.color }}>{b.val}.0%</span>
                </div>
                <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 5, overflow: 'hidden' }}>
                  <div className={b.cls} style={{ width: `${b.val}%`, height: '100%', borderRadius: 5 }} />
                </div>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>LIME Local Explanation</div>
              <p style={{ fontSize: 13, color: 'var(--cream)', lineHeight: 1.7 }}>
                The model identifies <span className="text-gold">strong constitutional language</span> referencing Article 21 and prior favourable judgements as primary drivers for the high admission probability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── SIMILAR VIEW ───────────────────────────────────────────────────── */
function SimilarView({ openModal }) {
  const CASES = [
    { id: 'SC/2021/01234', sim: '94.2', title: 'State of Punjab vs. Baldev Singh — Right to Fair Trial', excerpt: 'Petition concerning violation of Article 21 — right to speedy trial. The court held that prolonged detention without trial constitutes a violation of fundamental rights...', court: 'Supreme Court', year: 2021, outcome: 'ADMIT' },
    { id: 'HC/2022/00891', sim: '89.7', title: 'Mukesh & Anr vs. Union of India — Custodial Rights', excerpt: 'Writ petition challenging custodial detention beyond statutory limits. Court emphasised Article 22 safeguards against arbitrary detention and police accountability...', court: 'Delhi High Court', year: 2022, outcome: 'ADMIT' },
    { id: 'SC/2020/02019', sim: '85.3', title: 'MC Mehta vs. Union of India — Environmental Rights', excerpt: 'PIL challenging industrial pollution affecting fundamental right to clean environment under Article 21. Landmark case establishing environmental protection...', court: 'Supreme Court', year: 2020, outcome: 'ADMIT' },
    { id: 'HC/2023/00445', sim: '72.1', title: 'Sharma vs. State of Bihar — Service Reinstatement', excerpt: 'Petition for reinstatement in government service. Rejected on grounds of delay in filing — laches doctrine applied...', court: 'Patna High Court', year: 2023, outcome: 'REJECT' },
    { id: 'SC/2019/00782', sim: '68.9', title: 'Navtej Singh Johar vs. Union of India — Dignity', excerpt: 'Five-judge constitution bench petition on personal liberty and dignity under Article 21. Court unanimously upheld the right to dignity...', court: 'Supreme Court', year: 2019, outcome: 'ADMIT' },
    { id: 'HC/2024/01102', sim: '61.4', title: 'Ratan Lal vs. Municipal Corporation of Delhi', excerpt: 'Civil writ against illegal demolition without notice. Dismissed for lack of locus standi and failure to exhaust statutory remedies...', court: 'Delhi High Court', year: 2024, outcome: 'REJECT' },
  ];
  return (
    <div>
      <div className="section-heading">
        <h2>Similar Case Retrieval</h2>
        <p>Semantic similarity search across 35,000 historical petitions using InLegalBERT embeddings</p>
      </div>
      <div className="flex gap-10 mb-20" style={{ flexWrap: 'wrap' }}>
        <div className="search-bar">
          <Ico.Search />
          <input type="text" placeholder="Search: 'Article 21 violation, right to life...'" />
        </div>
        <button className="btn btn-primary">Search Similar Cases</button>
      </div>
      <div className="cases-grid">
        {CASES.map(c => (
          <div className="similar-card" key={c.id} onClick={() => openModal({ id: c.id, pet: c.title.split(' vs. ')[0], cat: 'Constitutional', verdict: c.outcome, conf: Math.round(parseFloat(c.sim)) })}>
            <div className="flex justify-between items-center mb-8">
              <div className="sc-id">{c.id}</div>
              <span className="similarity-score" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Ico.Brain /> {c.sim}%</span>
            </div>
            <div className="sc-title">{c.title}</div>
            <div className="sc-excerpt">{c.excerpt}</div>
            <div className="sc-meta">
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Ico.Scale /> {c.court}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Ico.Calendar /> {c.year}</span>
              <Pill outcome={c.outcome} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── SETTINGS VIEW ──────────────────────────────────────────────────── */
function SettingsView({ toast }) {
  const [toggles, setToggles] = useState({ conf: true, flag: true, shap: true, similar: true, email: false, daily: true });
  const toggle = k => setToggles(t => ({ ...t, [k]: !t[k] }));
  return (
    <div>
      <div className="section-heading">
        <h2>System Settings</h2>
        <p>Configure LegalAI prediction parameters and notifications</p>
      </div>
      <div className="settings-grid">
        <div className="settings-nav">
          {[
            { icon: <Ico.Settings />, label: 'General' },
            { icon: <Ico.Brain />,    label: 'Model' },
            { icon: <Ico.Link />,     label: 'API' },
            { icon: <Ico.User />,     label: 'Account' }
          ].map((item) => (
            <button key={item.label} className="nav-item" style={{ marginBottom: 4 }}>
              <span className="nav-icon">{item.icon}</span> {item.label}
            </button>
          ))}
        </div>
        <div>
          <div className="settings-section">
            <div className="settings-title">Prediction Settings</div>
            {[
              { k: 'conf',    label: 'Confidence Threshold Warning',   desc: 'Alert when confidence is below 70%' },
              { k: 'flag',    label: 'Auto-flag Low Confidence Cases',  desc: 'Send to human review queue automatically' },
              { k: 'shap',    label: 'SHAP Explanations',              desc: 'Show factor-level explanations with every prediction' },
              { k: 'similar', label: 'Similar Case Retrieval',         desc: 'Retrieve top 5 similar historical cases automatically' },
            ].map(s => (
              <div className="toggle-row" key={s.k}>
                <div>
                  <div className="toggle-label">{s.label}</div>
                  <div className="toggle-desc">{s.desc}</div>
                </div>
                <button className={`toggle ${toggles[s.k] ? 'on' : ''}`} onClick={() => toggle(s.k)} />
              </div>
            ))}
          </div>
          <div className="settings-section">
            <div className="settings-title">Notifications</div>
            {[
              { k: 'email', label: 'Email Notifications', desc: 'Receive prediction results via email' },
              { k: 'daily', label: 'Daily Summary Report', desc: 'Automated daily report of pending cases' },
            ].map(s => (
              <div className="toggle-row" key={s.k}>
                <div>
                  <div className="toggle-label">{s.label}</div>
                  <div className="toggle-desc">{s.desc}</div>
                </div>
                <button className={`toggle ${toggles[s.k] ? 'on' : ''}`} onClick={() => toggle(s.k)} />
              </div>
            ))}
          </div>
          <div className="flex gap-10">
            <button className="btn btn-primary" onClick={() => toast('Settings saved successfully')}>Save Changes</button>
            <button className="btn btn-outline" onClick={() => toast('Settings reset to defaults')}>Reset Defaults</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── CASE MODAL ─────────────────────────────────────────────────────── */
function CaseModal({ caseData, onClose }) {
  if (!caseData) return null;
  return (
    <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="flex justify-between items-start mb-20">
          <div>
            <div className="mono text-gold" style={{ fontSize: 12, marginBottom: 4 }}>{caseData.id}</div>
            <div className="serif" style={{ fontSize: 17, fontWeight: 700 }}>{caseData.pet} &mdash; {caseData.cat}</div>
          </div>
          <button className="modal-close" onClick={onClose}><Ico.X /></button>
        </div>
        <div className="flex gap-10 mb-20" style={{ flexWrap: 'wrap' }}>
          <Pill outcome={caseData.verdict} />
          <span className="badge badge-slate">{caseData.cat}</span>
          <span style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}>Confidence: <span className="mono text-gold">{caseData.conf}%</span></span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {[['Petitioner', caseData.pet], ['Court', 'Supreme Court of India'], ['Date Filed', '25 March 2025'], ['Category', caseData.cat]].map(([l, v]) => (
            <div key={l} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--muted)', marginBottom: 6 }}>{l}</div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8, padding: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--muted)', marginBottom: 8 }}>AI Summary</div>
          <p style={{ fontSize: 13, lineHeight: 1.7 }}>This petition challenges decisions affecting fundamental rights, citing constitutional provisions and established precedents. The AI model predicts a {caseData.verdict === 'ADMIT' ? 'favourable' : 'challenging'} outcome based on the petition structure and legal grounds cited.</p>
        </div>
        <div className="disclaimer-box" style={{ marginBottom: 16 }}>
          <Ico.Alert /><div>AI-generated preliminary assessment. Final admission decision rests with the Judicial Officer.</div>
        </div>
        <div className="flex gap-10">
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={onClose}>Add to Review Queue</button>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN DASHBOARD ─────────────────────────────────────────────────── */
const VIEWS = [
  { id: 'dashboard', label: 'Dashboard',        Icon: Ico.Dashboard },
  { id: 'predict',   label: 'Predict Admission', Icon: Ico.Predict  },
  { id: 'cases',     label: 'Case Repository',   Icon: Ico.Cases    },
  { id: 'explain',   label: 'Explainability',    Icon: Ico.Explain  },
  { id: 'similar',   label: 'Similar Cases',     Icon: Ico.Brain    },
  { id: 'settings',  label: 'Settings',          Icon: Ico.Settings },
];

const PAGE_META = {
  dashboard: ['Dashboard',        'Overview'],
  predict:   ['Predict Admission','New Prediction'],
  cases:     ['Case Repository',  'All Cases'],
  explain:   ['Explainability',   'SHAP / LIME Analysis'],
  similar:   ['Similar Cases',    'Semantic Search'],
  settings:  ['Settings',         'Configuration'],
};

export default function Dashboard() {
  const [view,     setView]     = useState('dashboard');
  const [sideOpen, setSideOpen] = useState(false);
  const [modal,    setModal]    = useState(null);
  const [toast,    setToast]    = useState({ msg: '', show: false });

  const userRaw = localStorage.getItem('user');
  const user    = userRaw ? JSON.parse(userRaw) : null;

  const showToast = (msg) => {
    setToast({ msg, show: true });
    setTimeout(() => setToast({ msg, show: false }), 3000);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const [title, breadcrumb] = PAGE_META[view] || ['Dashboard', 'Overview'];

  return (
    <div className="app-bg">
      {/* Sidebar overlay */}
      {sideOpen && <div className="sidebar-overlay open" onClick={() => setSideOpen(false)} />}

      {/* ── SIDEBAR ── */}
      <nav className={`sidebar ${sideOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-mark">
            <div className="logo-icon"><Ico.Scale /></div>
            <div>
              <div className="logo-text">Legal<span className="text-gold">AI</span></div>
              <div className="logo-sub">Judicial Intelligence</div>
            </div>
          </div>
        </div>

        <div className="sidebar-scroll">
          <div className="sidebar-section">
            <div className="sidebar-label">Navigation</div>
            {VIEWS.map(v => (
              <button key={v.id} className={`nav-item ${view === v.id ? 'active' : ''}`}
                onClick={() => { setView(v.id); setSideOpen(false); }}>
                <span className="nav-icon"><v.Icon /></span>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-footer">
          {user ? (
            <div>
              <div className="user-card mb-8">
                <div className="user-avatar">{user.name?.[0]?.toUpperCase() || 'U'}</div>
                <div>
                  <div className="user-name">{user.name}</div>
                  <div className="user-role">{user.plan} plan</div>
                </div>
              </div>
              <button className="btn btn-ghost btn-full btn-sm" onClick={logout}>
                <Ico.Logout /> Sign out
              </button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8, textAlign: 'center' }}>Guest session</div>
              <button className="btn btn-primary btn-full btn-sm" onClick={() => window.location.href = '/login'}>Sign in</button>
            </div>
          )}
        </div>
      </nav>

      {/* ── MAIN ── */}
      <div className="main-content">

        {/* Topbar */}
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="hamburger" onClick={() => setSideOpen(s => !s)}>☰</button>
            <div>
              <div className="page-title">{title}</div>
              <div className="breadcrumb">LegalAI &rsaquo; {breadcrumb}</div>
            </div>
          </div>
          <div className="topbar-right">
            <div className="court-badge">Supreme Court · India</div>
            <ThemeToggle />
            <button className="icon-btn" onClick={() => showToast('3 new petitions require review')} title="Notifications">
              🔔<div className="badge-dot" />
            </button>
            {!user && (
              <button className="btn btn-primary btn-sm" onClick={() => window.location.href = '/login'}>Sign in</button>
            )}
          </div>
        </header>

        {/* View content */}
        <div className="view-content">
          {view === 'dashboard' && <DashboardView openModal={setModal} />}
          {view === 'predict'   && <PredictView toast={showToast} />}
          {view === 'cases'     && <CasesView openModal={setModal} />}
          {view === 'explain'   && <ExplainView />}
          {view === 'similar'   && <SimilarView openModal={setModal} />}
          {view === 'settings'  && <SettingsView toast={showToast} />}
        </div>
      </div>

      {/* Case Modal */}
      {modal && <CaseModal caseData={modal} onClose={() => setModal(null)} />}

      {/* Toast */}
      <Toast msg={toast.msg} show={toast.show} />
    </div>
  );
}