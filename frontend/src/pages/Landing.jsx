import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // ── Smooth scroll to section ──────────────────────────────
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117' }}>

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav style={{
        display        : 'flex',
        justifyContent : 'space-between',
        alignItems     : 'center',
        padding        : '20px 60px',
        borderBottom   : '1px solid #2d3148',
        position       : 'sticky',
        top            : 0,
        background     : '#0f1117',
        zIndex         : 100
      }}>
        <div style={{ fontSize: '24px', fontWeight: '800' }}>
          ⚖️ <span className="gradient-text">LegalAI</span>
        </div>
        <div style={{ display: 'flex', gap: '32px' }}>
          {[
            { label: 'Features', id: 'features' },
            { label: 'How It Works', id: 'howitworks' },
            { label: 'Pricing', id: 'pricing' },
            { label: 'About', id: 'about' },
          ].map((item) => (
            <span
              key={item.id}
              onClick={() => scrollTo(item.id)}
              style={{
                color     : '#9ca3af',
                cursor    : 'pointer',
                fontSize  : '15px',
                transition: 'color 0.2s'
              }}
              onMouseEnter={e => e.target.style.color = '#ffffff'}
              onMouseLeave={e => e.target.style.color = '#9ca3af'}
            >
              {item.label}
            </span>
          ))}
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate('/dashboard')}
        >
          Try Free →
        </button>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <div style={{
        textAlign : 'center',
        padding   : '100px 20px 60px',
        maxWidth  : '800px',
        margin    : '0 auto'
      }}>
        <div style={{
          display      : 'inline-block',
          background   : '#1a1d2e',
          border       : '1px solid #2d3148',
          borderRadius : '999px',
          padding      : '8px 20px',
          fontSize     : '14px',
          color        : '#667eea',
          marginBottom : '24px'
        }}>
          🇮🇳 Built for Indian Courts — Supreme Court & High Court
        </div>

        <h1 style={{
          fontSize    : '56px',
          fontWeight  : '900',
          lineHeight  : '1.1',
          marginBottom: '24px'
        }}>
          Know if Your Petition
          <br />
          <span className="gradient-text">Will Be Admitted</span>
          <br />
          Before You File
        </h1>

        <p style={{
          fontSize    : '20px',
          color       : '#9ca3af',
          marginBottom: '40px',
          lineHeight  : '1.6'
        }}>
          AI-powered petition analysis trained on 32,000+ real
          Supreme Court cases. Get instant ADMIT/REJECT prediction
          with legal reasoning and improvement suggestions.
        </p>

        <div style={{
          display        : 'flex',
          gap            : '16px',
          justifyContent : 'center',
          flexWrap       : 'wrap'
        }}>
          <button
            className="btn-primary"
            style={{ fontSize: '18px', padding: '16px 40px' }}
            onClick={() => navigate('/dashboard')}
          >
            Analyze Petition Free →
          </button>
          <button
            onClick={() => scrollTo('howitworks')}
            style={{
              background   : 'transparent',
              border       : '1px solid #2d3148',
              color        : '#9ca3af',
              padding      : '16px 40px',
              borderRadius : '8px',
              cursor       : 'pointer',
              fontSize     : '18px',
              transition   : 'border-color 0.2s'
            }}
            onMouseEnter={e => e.target.style.borderColor = '#667eea'}
            onMouseLeave={e => e.target.style.borderColor = '#2d3148'}
          >
            See How It Works ↓
          </button>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────── */}
      <div style={{
        display        : 'flex',
        justifyContent : 'center',
        gap            : '60px',
        padding        : '60px 20px',
        borderTop      : '1px solid #2d3148',
        borderBottom   : '1px solid #2d3148',
        flexWrap       : 'wrap'
      }}>
        {[
          { number: '32,000+', label: 'Court Cases Trained' },
          { number: '57%+',    label: 'Prediction Accuracy' },
          { number: '3 sec',   label: 'Analysis Time' },
          { number: '100%',    label: 'Local & Private' },
        ].map((stat, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{
              fontSize    : '36px',
              fontWeight  : '800',
              marginBottom: '8px'
            }} className="gradient-text">
              {stat.number}
            </div>
            <div style={{ color: '#9ca3af', fontSize: '14px' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Features ───────────────────────────────────────── */}
      <div id="features" style={{ padding: '80px 60px' }}>
        <h2 style={{
          textAlign   : 'center',
          fontSize    : '36px',
          fontWeight  : '800',
          marginBottom: '16px'
        }}>
          Everything a Lawyer Needs
        </h2>
        <p style={{
          textAlign   : 'center',
          color       : '#9ca3af',
          marginBottom: '60px'
        }}>
          Built specifically for Indian legal professionals
        </p>
        <div style={{
          display             : 'grid',
          gridTemplateColumns : 'repeat(3, 1fr)',
          gap                 : '24px',
          maxWidth            : '1000px',
          margin              : '0 auto'
        }}>
          {[
            {
              icon : '🔮',
              title: 'Admission Prediction',
              desc : 'InLegalBERT trained on 32,000 real Supreme Court cases predicts ADMIT or REJECT instantly.'
            },
            {
              icon : '🧠',
              title: 'AI Legal Reasoning',
              desc : 'Understand exactly WHY your petition was flagged with phrase-level SHAP analysis.'
            },
            {
              icon : '📋',
              title: 'Improvement Guide',
              desc : 'Get 3 specific actionable steps to strengthen a rejected petition before refiling.'
            },
            {
              icon : '📚',
              title: 'Similar Cases',
              desc : 'Find real precedent cases from our database of 5,000 indexed Supreme Court judgments.'
            },
            {
              icon : '🔒',
              title: '100% Private',
              desc : 'All analysis runs locally. Your petition text never leaves our secure servers.'
            },
            {
              icon : '⚡',
              title: 'Instant Results',
              desc : 'Full analysis including prediction, explanation and similar cases in under 10 seconds.'
            },
          ].map((f, i) => (
            <div
              key={i}
              className="card"
              style={{
                textAlign : 'center',
                cursor    : 'pointer',
                transition: 'transform 0.2s, border-color 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform   = 'translateY(-4px)';
                e.currentTarget.style.borderColor = '#667eea';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform   = 'translateY(0)';
                e.currentTarget.style.borderColor = '#2d3148';
              }}
              onClick={() => navigate('/dashboard')}
            >
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>
                {f.icon}
              </div>
              <h3 style={{
                fontSize    : '18px',
                fontWeight  : '700',
                marginBottom: '12px'
              }}>
                {f.title}
              </h3>
              <p style={{ color: '#9ca3af', lineHeight: '1.6' }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── How It Works ───────────────────────────────────── */}
      <div id="howitworks" style={{
        padding    : '80px 60px',
        borderTop  : '1px solid #2d3148',
        background : '#0d0f1a'
      }}>
        <h2 style={{
          textAlign   : 'center',
          fontSize    : '36px',
          fontWeight  : '800',
          marginBottom: '16px'
        }}>
          How It Works
        </h2>
        <p style={{
          textAlign   : 'center',
          color       : '#9ca3af',
          marginBottom: '60px'
        }}>
          4 steps from petition to prediction
        </p>
        <div style={{
          display        : 'flex',
          justifyContent : 'center',
          gap            : '0px',
          maxWidth       : '900px',
          margin         : '0 auto',
          flexWrap       : 'wrap'
        }}>
          {[
            {
              step : '01',
              icon : '📄',
              title: 'Paste Petition',
              desc : 'Paste your petition text or upload a PDF directly'
            },
            {
              step : '02',
              icon : '🤖',
              title: 'AI Analyzes',
              desc : 'InLegalBERT reads and understands the legal arguments'
            },
            {
              step : '03',
              icon : '⚖️',
              title: 'Get Prediction',
              desc : 'Receive ADMIT/REJECT with confidence score and risk band'
            },
            {
              step : '04',
              icon : '📋',
              title: 'Improve & File',
              desc : 'Use AI suggestions to strengthen your petition'
            },
          ].map((s, i) => (
            <div key={i} style={{
              display   : 'flex',
              alignItems: 'center'
            }}>
              <div className="card" style={{
                textAlign: 'center',
                width    : '180px',
                padding  : '24px 16px'
              }}>
                <div style={{
                  fontSize    : '12px',
                  color       : '#667eea',
                  fontWeight  : '700',
                  marginBottom: '8px',
                  letterSpacing: '2px'
                }}>
                  STEP {s.step}
                </div>
                <div style={{
                  fontSize    : '32px',
                  marginBottom: '12px'
                }}>
                  {s.icon}
                </div>
                <div style={{
                  fontWeight  : '700',
                  marginBottom: '8px',
                  fontSize    : '15px'
                }}>
                  {s.title}
                </div>
                <div style={{
                  color   : '#9ca3af',
                  fontSize: '12px',
                  lineHeight: '1.5'
                }}>
                  {s.desc}
                </div>
              </div>
              {i < 3 && (
                <div style={{
                  color    : '#667eea',
                  fontSize : '24px',
                  margin   : '0 8px',
                  marginTop: '-20px'
                }}>
                  →
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <button
            className="btn-primary"
            style={{ fontSize: '16px', padding: '14px 36px' }}
            onClick={() => navigate('/dashboard')}
          >
            Try It Now →
          </button>
        </div>
      </div>

      {/* ── Pricing ────────────────────────────────────────── */}
      <div id="pricing" style={{
        padding  : '80px 60px',
        borderTop: '1px solid #2d3148'
      }}>
        <h2 style={{
          textAlign   : 'center',
          fontSize    : '36px',
          fontWeight  : '800',
          marginBottom: '16px'
        }}>
          Simple Pricing
        </h2>
        <p style={{
          textAlign   : 'center',
          color       : '#9ca3af',
          marginBottom: '60px'
        }}>
          For individual lawyers and law firms
        </p>
        <div style={{
          display             : 'grid',
          gridTemplateColumns : 'repeat(3, 1fr)',
          gap                 : '24px',
          maxWidth            : '900px',
          margin              : '0 auto'
        }}>
          {[
            {
              plan    : 'Free',
              price   : '₹0',
              period  : 'forever',
              color   : '#9ca3af',
              features: [
                '3 analyses/month',
                'Basic prediction only',
                'No explanation',
                'No similar cases',
              ],
              cta      : 'Get Started Free',
              highlight: false,
              action   : () => navigate('/dashboard')
            },
            {
              plan    : 'Professional',
              price   : '₹2,999',
              period  : 'per month',
              color   : '#667eea',
              features: [
                '50 analyses/month',
                'Full SHAP explanation',
                'Similar case retrieval',
                'Improvement suggestions',
                'PDF upload support',
              ],
              cta      : 'Start Free Trial',
              highlight: true,
              action   : () => navigate('/dashboard')
            },
            {
              plan    : 'Firm',
              price   : '₹9,999',
              period  : 'per month',
              color   : '#a78bfa',
              features: [
                'Unlimited analyses',
                'Bulk PDF upload',
                '5 team accounts',
                'Email reports',
                'API access',
              ],
              cta      : 'Contact Sales',
              highlight: false,
              action   : () => window.location.href =
                'mailto:legal.ai.contact@gmail.com?subject=Firm Plan Inquiry'
            },
          ].map((p, i) => (
            <div
              key={i}
              className="card"
              style={{
                textAlign: 'center',
                border   : p.highlight
                  ? `2px solid ${p.color}`
                  : '1px solid #2d3148',
                position : 'relative',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={e =>
                e.currentTarget.style.transform = 'translateY(-4px)'
              }
              onMouseLeave={e =>
                e.currentTarget.style.transform = 'translateY(0)'
              }
            >
              {p.highlight && (
                <div style={{
                  position : 'absolute',
                  top      : '-14px',
                  left     : '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color    : 'white',
                  padding  : '4px 16px',
                  borderRadius: '999px',
                  fontSize : '11px',
                  fontWeight: '700',
                  whiteSpace: 'nowrap'
                }}>
                  ⭐ MOST POPULAR
                </div>
              )}
              <div style={{
                fontSize    : '18px',
                fontWeight  : '700',
                marginBottom: '8px',
                color       : p.color
              }}>
                {p.plan}
              </div>
              <div style={{
                fontSize    : '36px',
                fontWeight  : '900',
                marginBottom: '4px',
                color       : '#ffffff'
              }}>
                {p.price}
              </div>
              <div style={{
                color       : '#9ca3af',
                fontSize    : '13px',
                marginBottom: '24px'
              }}>
                {p.period}
              </div>
              <ul style={{
                listStyle  : 'none',
                marginBottom: '24px',
                textAlign  : 'left'
              }}>
                {p.features.map((f, j) => (
                  <li key={j} style={{
                    padding      : '8px 0',
                    borderBottom : '1px solid #2d3148',
                    color        : '#d1d5db',
                    fontSize     : '13px',
                    display      : 'flex',
                    alignItems   : 'center',
                    gap          : '8px'
                  }}>
                    <span style={{ color: p.color }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                className="btn-primary"
                style={{
                  width     : '100%',
                  background: p.highlight
                    ? 'linear-gradient(135deg, #667eea, #764ba2)'
                    : '#1a1d2e',
                  border    : `1px solid ${p.color}`,
                  color     : p.highlight ? 'white' : p.color
                }}
                onClick={p.action}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── About ──────────────────────────────────────────── */}
      <div id="about" style={{
        padding  : '80px 60px',
        borderTop: '1px solid #2d3148',
        background: '#0d0f1a'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize    : '36px',
            fontWeight  : '800',
            marginBottom: '24px'
          }}>
            About LegalAI
          </h2>
          <p style={{
            color      : '#9ca3af',
            lineHeight : '1.8',
            fontSize   : '16px',
            marginBottom: '24px'
          }}>
            LegalAI is a Final Year B.Tech project built to make
            Indian legal processes more accessible and transparent.
            We trained InLegalBERT — a BERT model specifically
            designed for Indian legal text — on 32,302 real Supreme
            Court judgments from the ILDC dataset.
          </p>
          <p style={{
            color      : '#9ca3af',
            lineHeight : '1.8',
            fontSize   : '16px',
            marginBottom: '32px'
          }}>
            Our system combines classification, generative AI,
            explainability (SHAP) and vector similarity search
            (FAISS) to give lawyers a complete picture of their
            petition's chances — before they file.
          </p>
          <div style={{
            display        : 'flex',
            justifyContent : 'center',
            gap            : '16px',
            flexWrap       : 'wrap'
          }}>
            <div className="card" style={{ padding: '16px 24px' }}>
              <div style={{ fontWeight: '700', marginBottom: '4px' }}>
                👩‍💻 Ekta
              </div>
              <div style={{ color: '#9ca3af', fontSize: '13px' }}>
                ML Pipeline + Full Stack
              </div>
            </div>
            <div className="card" style={{ padding: '16px 24px' }}>
              <div style={{ fontWeight: '700', marginBottom: '4px' }}>
                👨‍💻 Santu
              </div>
              <div style={{ color: '#9ca3af', fontSize: '13px' }}>
                Generative AI + Backend
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <div style={{
        textAlign  : 'center',
        padding    : '32px',
        borderTop  : '1px solid #2d3148',
        color      : '#9ca3af',
        fontSize   : '13px'
      }}>
        <div style={{ marginBottom: '12px' }}>
          <span
            onClick={() => scrollTo('features')}
            style={{ cursor: 'pointer', margin: '0 12px' }}
          >
            Features
          </span>
          <span
            onClick={() => scrollTo('howitworks')}
            style={{ cursor: 'pointer', margin: '0 12px' }}
          >
            How It Works
          </span>
          <span
            onClick={() => scrollTo('pricing')}
            style={{ cursor: 'pointer', margin: '0 12px' }}
          >
            Pricing
          </span>
          <span
            onClick={() => scrollTo('about')}
            style={{ cursor: 'pointer', margin: '0 12px' }}
          >
            About
          </span>
        </div>
        ⚖️ LegalAI — Advisory system only. Not legal advice.
        <br />
        Final Year B.Tech Project
      </div>

    </div>
  );
}