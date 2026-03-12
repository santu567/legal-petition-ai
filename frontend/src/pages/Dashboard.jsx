import React, { useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [text, setText]           = useState('');
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState('');

  const analyze = async () => {
    if (!text.trim() || text.length < 50) {
      setError('Please enter at least 50 characters of petition text.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post(
        'http://127.0.0.1:8000/api/analyze',
        { text, generate_explanation: true },
        { timeout: 120000 }
      );
      setResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Server error. Make sure the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117' }}>

      {/* Header */}
      <div style={{
        padding: '20px 40px',
        borderBottom: '1px solid #2d3148',
        display: 'flex', alignItems: 'center', gap: '16px'
      }}>
        <a href="/" style={{
          color: '#667eea', textDecoration: 'none',
          fontSize: '24px', fontWeight: '800'
        }}>
          ⚖️ LegalAI
        </a>
        <span style={{ color: '#2d3148' }}>|</span>
        <span style={{ color: '#9ca3af' }}>Petition Analyzer</span>
      </div>

      <div style={{
        maxWidth: '900px', margin: '40px auto', padding: '0 20px'
      }}>

        {/* Input Section */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '22px', fontWeight: '700', marginBottom: '8px'
          }}>
            📄 Paste Your Petition Text
          </h2>
          <p style={{
            color: '#9ca3af', fontSize: '14px', marginBottom: '16px'
          }}>
            Enter the full text of your petition for AI analysis
          </p>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste your legal petition text here...

Example: The petitioner challenges the constitutional validity of Section 66A of the Information Technology Act 2000 as being violative of Article 19(1)(a) of the Constitution of India..."
            style={{
              width: '100%', minHeight: '200px',
              background: '#0f1117', border: '1px solid #2d3148',
              borderRadius: '8px', padding: '16px',
              color: '#ffffff', fontSize: '14px',
              resize: 'vertical', outline: 'none',
              lineHeight: '1.6', fontFamily: 'inherit'
            }}
          />
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginTop: '16px'
          }}>
            <span style={{ color: '#9ca3af', fontSize: '13px' }}>
              {text.length} characters
              {text.length < 50 && text.length > 0 &&
                <span style={{ color: '#f87171' }}>
                  {' '}(minimum 50)
                </span>
              }
            </span>
            <button
              className="btn-primary"
              onClick={analyze}
              disabled={loading || text.length < 50}
              style={{ minWidth: '160px' }}
            >
              {loading ? 'Analyzing...' : '🔍 Analyze Petition'}
            </button>
          </div>
          {error && (
            <div style={{
              marginTop: '12px', padding: '12px',
              background: '#7f1d1d', borderRadius: '8px',
              color: '#f87171', fontSize: '14px'
            }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="card" style={{
            textAlign: 'center', padding: '40px'
          }}>
            <div style={{
              display: 'flex', justifyContent: 'center',
              gap: '8px', marginBottom: '16px'
            }}>
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
            <p style={{ color: '#9ca3af' }}>
              Analyzing petition with InLegalBERT + Qwen AI...
            </p>
            <p style={{
              color: '#667eea', fontSize: '13px', marginTop: '8px'
            }}>
              This may take 20-30 seconds
            </p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Prediction Card */}
            <div className="card">
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: '20px'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700' }}>
                  🔮 AI Prediction
                </h3>
                <span className={
                  result.prediction === 'ADMITTED'
                    ? 'admit-badge' : 'reject-badge'
                }>
                  {result.prediction}
                </span>
              </div>

              {/* Confidence bars */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  marginBottom: '6px', fontSize: '14px'
                }}>
                  <span style={{ color: '#34d399' }}>
                    ✅ ADMIT
                  </span>
                  <span style={{ color: '#34d399' }}>
                    {result.admit_prob}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill-admit"
                    style={{ width: `${result.admit_prob}%` }}
                  />
                </div>
              </div>

              <div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  marginBottom: '6px', fontSize: '14px'
                }}>
                  <span style={{ color: '#f87171' }}>
                    ❌ REJECT
                  </span>
                  <span style={{ color: '#f87171' }}>
                    {result.reject_prob}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill-reject"
                    style={{ width: `${result.reject_prob}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Explanation Card */}
            {result.explanation && (
              <div className="card">
                <h3 style={{
                  fontSize: '18px', fontWeight: '700',
                  marginBottom: '16px'
                }}>
                  🧠 AI Legal Analysis
                </h3>
                <div style={{
                  background: '#0f1117', borderRadius: '8px',
                  padding: '16px', lineHeight: '1.8',
                  color: '#d1d5db', fontSize: '14px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {result.explanation}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div style={{
              padding: '12px 16px',
              background: '#1a1d2e',
              border: '1px solid #2d3148',
              borderRadius: '8px',
              color: '#9ca3af', fontSize: '13px',
              textAlign: 'center'
            }}>
              ⚠️ This is an AI advisory tool only. Results do not
              constitute legal advice. Always consult a qualified
              legal professional before filing.
            </div>

          </div>
        )}
      </div>
    </div>
  );
}