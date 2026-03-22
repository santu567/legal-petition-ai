import React, { useState, useRef } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const [text, setText]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState('');
  const [pdfName, setPdfName]   = useState('');
  const fileRef                 = useRef();

  // ── PDF Upload Handler ─────────────────────────────────────
  const handlePDF = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file only.');
      return;
    }
    setPdfName(file.name);
    setError('');

    // Extract text from PDF using FileReader
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        // Use pdf.js via CDN to extract text
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        if (!pdfjsLib) {
          // Fallback — just show filename, user must also paste text
          setError(
            'PDF text extraction requires pdf.js. ' +
            'Please also paste the petition text manually.'
          );
          return;
        }
        const pdf  = await pdfjsLib.getDocument(ev.target.result).promise;
        let fullText = '';
        for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
          const page    = await pdf.getPage(i);
          const content = await page.getTextContent();
          fullText += content.items.map(s => s.str).join(' ') + ' ';
        }
        setText(fullText.trim());
      } catch {
        setError('Could not extract PDF text. Please paste text manually.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ── Analyze Handler ───────────────────────────────────────
  const analyze = async () => {
    if (!text.trim() || text.length < 50) {
      setError('Please enter at least 50 characters.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);

    try {
      const res = await axios.post(
        'http://localhost:8000/api/analyze',
        { text, generate_explanation: true },
        { timeout: 300000 }
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

  // ── Band Colors ───────────────────────────────────────────
  const bandStyle = (urgency) => ({
    critical : {
      bg    : '#3b0000',
      border: '#f87171',
      color : '#f87171'
    },
    warning  : {
      bg    : '#3b1a00',
      border: '#fb923c',
      color : '#fb923c'
    },
    caution  : {
      bg    : '#2d2600',
      border: '#fbbf24',
      color : '#fbbf24'
    },
    good     : {
      bg    : '#003b1a',
      border: '#34d399',
      color : '#34d399'
    },
  }[urgency] || { bg: '#1a1d2e', border: '#2d3148', color: '#fff' });

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117' }}>

      {/* pdf.js CDN */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js" />

      {/* Header */}
      <div style={{
        padding       : '16px 40px',
        borderBottom  : '1px solid #2d3148',
        display       : 'flex',
        alignItems    : 'center',
        gap           : '16px',
        position      : 'sticky',
        top           : 0,
        background    : '#0f1117',
        zIndex        : 100
      }}>
        <a href="/" style={{
          color         : '#667eea',
          textDecoration: 'none',
          fontSize      : '22px',
          fontWeight    : '800'
        }}>
          ⚖️ LegalAI
        </a>
        <span style={{ color: '#2d3148' }}>|</span>
        <span style={{ color: '#9ca3af', fontSize: '14px' }}>
          Petition Analyzer
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <div style={{
            width       : '8px',
            height      : '8px',
            borderRadius: '50%',
            background  : '#34d399',
            marginTop   : '6px'
          }} />
          <span style={{ color: '#34d399', fontSize: '13px' }}>
            AI Models Online
          </span>
        </div>
      </div>

      <div style={{
        maxWidth: '860px',
        margin  : '32px auto',
        padding : '0 20px'
      }}>

        {/* Input Card */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{
            display       : 'flex',
            justifyContent: 'space-between',
            alignItems    : 'center',
            marginBottom  : '16px'
          }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '700' }}>
                📄 Petition Text
              </h2>
              <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>
                Paste petition text or upload a PDF
              </p>
            </div>

            {/* PDF Upload Button */}
            <div>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                onChange={handlePDF}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileRef.current.click()}
                style={{
                  background  : '#1a1d2e',
                  border      : '1px solid #2d3148',
                  color       : '#9ca3af',
                  padding     : '8px 16px',
                  borderRadius: '8px',
                  cursor      : 'pointer',
                  fontSize    : '13px',
                  display     : 'flex',
                  alignItems  : 'center',
                  gap         : '6px'
                }}
              >
                📎 Upload PDF
              </button>
              {pdfName && (
                <div style={{
                  fontSize  : '11px',
                  color     : '#667eea',
                  marginTop : '4px',
                  textAlign : 'right'
                }}>
                  {pdfName}
                </div>
              )}
            </div>
          </div>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste your legal petition text here...&#10;&#10;Example: The petitioner files this writ petition under Article 32 challenging..."
            style={{
              width       : '100%',
              minHeight   : '180px',
              background  : '#0f1117',
              border      : '1px solid #2d3148',
              borderRadius: '8px',
              padding     : '14px',
              color       : '#ffffff',
              fontSize    : '14px',
              resize      : 'vertical',
              outline     : 'none',
              lineHeight  : '1.7',
              fontFamily  : 'inherit'
            }}
          />

          <div style={{
            display        : 'flex',
            justifyContent : 'space-between',
            alignItems     : 'center',
            marginTop      : '12px'
          }}>
            <span style={{ color: '#9ca3af', fontSize: '13px' }}>
              {text.length} characters
              {text.length < 50 && text.length > 0 && (
                <span style={{ color: '#f87171' }}> (min 50)</span>
              )}
            </span>
            <button
              className="btn-primary"
              onClick={analyze}
              disabled={loading || text.length < 50}
              style={{ minWidth: '160px', fontSize: '15px' }}
            >
              {loading ? '⏳ Analyzing...' : '🔍 Analyze Petition'}
            </button>
          </div>

          {error && (
            <div style={{
              marginTop   : '12px',
              padding     : '12px',
              background  : '#7f1d1d',
              borderRadius: '8px',
              color       : '#f87171',
              fontSize    : '13px'
            }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="card" style={{
            textAlign: 'center', padding: '48px'
          }}>
            <div style={{
              display        : 'flex',
              justifyContent : 'center',
              gap            : '8px',
              marginBottom   : '20px'
            }}>
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
            <p style={{
              color     : '#ffffff',
              fontSize  : '16px',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              Analyzing your petition...
            </p>
            <p style={{ color: '#9ca3af', fontSize: '13px' }}>
              InLegalBERT → Qwen AI → FAISS Search
            </p>
            <p style={{ color: '#667eea', fontSize: '12px', marginTop: '8px' }}>
              This takes 2-4 minutes on first run
            </p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{
            display      : 'flex',
            flexDirection: 'column',
            gap          : '16px'
          }}>

            {/* Prediction + Band Card */}
            <div className="card">
              <div style={{
                display        : 'flex',
                justifyContent : 'space-between',
                alignItems     : 'center',
                marginBottom   : '16px'
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

              {/* Confidence Band */}
              {result.band && (() => {
                const s = bandStyle(result.urgency);
                return (
                  <div style={{
                    padding     : '16px',
                    borderRadius: '10px',
                    marginBottom: '20px',
                    background  : s.bg,
                    border      : `1px solid ${s.border}`
                  }}>
                    <div style={{
                      fontSize    : '18px',
                      fontWeight  : '800',
                      color       : s.color,
                      marginBottom: '6px'
                    }}>
                      {result.band_emoji} {result.band}
                    </div>
                    <div style={{
                      color     : '#d1d5db',
                      fontSize  : '13px',
                      lineHeight: '1.6'
                    }}>
                      {result.band_message}
                    </div>
                    <div style={{
                      marginTop: '10px',
                      fontSize : '13px',
                      color    : '#9ca3af'
                    }}>
                      Overall Confidence:
                      <strong style={{ color: s.color, marginLeft: '6px' }}>
                        {result.confidence}%
                      </strong>
                    </div>
                  </div>
                );
              })()}

              {/* Probability Bars */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{
                  display        : 'flex',
                  justifyContent : 'space-between',
                  marginBottom   : '6px',
                  fontSize       : '13px'
                }}>
                  <span style={{ color: '#34d399' }}>✅ ADMIT</span>
                  <span style={{ color: '#34d399' }}>
                    {result.admit_prob}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill-admit"
                    style={{ width: `${result.admit_prob}%` }} />
                </div>
              </div>
              <div>
                <div style={{
                  display        : 'flex',
                  justifyContent : 'space-between',
                  marginBottom   : '6px',
                  fontSize       : '13px'
                }}>
                  <span style={{ color: '#f87171' }}>❌ REJECT</span>
                  <span style={{ color: '#f87171' }}>
                    {result.reject_prob}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill-reject"
                    style={{ width: `${result.reject_prob}%` }} />
                </div>
              </div>
            </div>

            {/* AI Legal Analysis */}
            {result.explanation && (
              <div className="card">
                <h3 style={{
                  fontSize    : '18px',
                  fontWeight  : '700',
                  marginBottom: '16px'
                }}>
                  🧠 AI Legal Analysis
                </h3>
                <div style={{
                  background  : '#0f1117',
                  borderRadius: '8px',
                  padding     : '16px',
                  lineHeight  : '1.8',
                  color       : '#d1d5db',
                  fontSize    : '14px',
                  whiteSpace  : 'pre-wrap'
                }}>
                  {result.explanation}
                </div>
              </div>
            )}

            {/* Similar Cases */}
            {result.similar_cases && result.similar_cases.length > 0 && (
              <div className="card">
                <h3 style={{
                  fontSize    : '18px',
                  fontWeight  : '700',
                  marginBottom: '4px'
                }}>
                  📚 Similar Precedent Cases
                </h3>
                <p style={{
                  color       : '#9ca3af',
                  fontSize    : '13px',
                  marginBottom: '16px'
                }}>
                  Real Supreme Court cases similar to your petition
                </p>
                <div style={{
                  display      : 'flex',
                  flexDirection: 'column',
                  gap          : '12px'
                }}>
                  {result.similar_cases.map((c, i) => (
                    <div key={i} style={{
                      background  : '#0f1117',
                      border      : `1px solid ${
                        c.outcome === 'ADMITTED'
                          ? '#064e3b' : '#7f1d1d'
                      }`,
                      borderRadius: '8px',
                      padding     : '14px'
                    }}>
                      <div style={{
                        display        : 'flex',
                        justifyContent : 'space-between',
                        alignItems     : 'center',
                        marginBottom   : '8px'
                      }}>
                        <span style={{
                          fontWeight: '700',
                          fontSize  : '14px',
                          color     : '#667eea'
                        }}>
                          Case #{c.rank}
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <span style={{
                            fontSize    : '12px',
                            color       : '#9ca3af',
                            background  : '#1a1d2e',
                            padding     : '2px 10px',
                            borderRadius: '999px'
                          }}>
                            {c.similarity}% match
                          </span>
                          <span className={
                            c.outcome === 'ADMITTED'
                              ? 'admit-badge' : 'reject-badge'
                          } style={{ fontSize: '11px', padding: '2px 10px' }}>
                            {c.outcome}
                          </span>
                        </div>
                      </div>
                      <p style={{
                        color     : '#9ca3af',
                        fontSize  : '13px',
                        lineHeight: '1.6'
                      }}>
                        {c.excerpt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div style={{
              padding     : '12px 16px',
              background  : '#1a1d2e',
              border      : '1px solid #2d3148',
              borderRadius: '8px',
              color       : '#9ca3af',
              fontSize    : '12px',
              textAlign   : 'center'
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
