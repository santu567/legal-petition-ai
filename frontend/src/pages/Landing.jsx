import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117' }}>

      {/* Navbar */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '20px 60px',
        borderBottom: '1px solid #2d3148'
      }}>
        <div style={{ fontSize: '24px', fontWeight: '800' }}>
          ⚖️ <span className="gradient-text">LegalAI</span>
        </div>
        <div style={{ display: 'flex', gap: '32px', color: '#9ca3af' }}>
          <span style={{ cursor: 'pointer' }}>Features</span>
          <span style={{ cursor: 'pointer' }}>Pricing</span>
          <span style={{ cursor: 'pointer' }}>About</span>
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate('/dashboard')}
        >
          Try Free →
        </button>
      </nav>

      {/* Hero */}
      <div style={{
        textAlign: 'center', padding: '100px 20px 60px',
        maxWidth: '800px', margin: '0 auto'
      }}>
        <div style={{
          display: 'inline-block',
          background: '#1a1d2e', border: '1px solid #2d3148',
          borderRadius: '999px', padding: '8px 20px',
          fontSize: '14px', color: '#667eea', marginBottom: '24px'
        }}>
          🇮🇳 Built for Indian Courts — Supreme Court & High Court
        </div>

        <h1 style={{
          fontSize: '56px', fontWeight: '900',
          lineHeight: '1.1', marginBottom: '24px'
        }}>
          Know if Your Petition
          <br />
          <span className="gradient-text">Will Be Admitted</span>
          <br />
          Before You File
        </h1>

        <p style={{
          fontSize: '20px', color: '#9ca3af',
          marginBottom: '40px', lineHeight: '1.6'
        }}>
          AI-powered petition analysis trained on 32,000+ real
          Supreme Court cases. Get instant ADMIT/REJECT prediction
          with legal reasoning and improvement suggestions.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button
            className="btn-primary"
            style={{ fontSize: '18px', padding: '16px 40px' }}
            onClick={() => navigate('/dashboard')}
          >
            Analyze Petition Free →
          </button>
          <button style={{
            background: 'transparent',
            border: '1px solid #2d3148',
            color: '#9ca3af', padding: '16px 40px',
            borderRadius: '8px', cursor: 'pointer',
            fontSize: '18px'
          }}>
            See How It Works
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex', justifyContent: 'center',
        gap: '60px', padding: '60px 20px',
        borderTop: '1px solid #2d3148',
        borderBottom: '1px solid #2d3148'
      }}>
        {[
          { number: '32,000+', label: 'Court Cases Trained' },
          { number: '57%+',    label: 'Prediction Accuracy' },
          { number: '3 sec',   label: 'Analysis Time' },
          { number: '100%',    label: 'Local & Private' },
        ].map((stat, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '36px', fontWeight: '800',
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

      {/* Features */}
      <div style={{ padding: '80px 60px' }}>
        <h2 style={{
          textAlign: 'center', fontSize: '36px',
          fontWeight: '800', marginBottom: '60px'
        }}>
          Everything a Lawyer Needs
        </h2>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px', maxWidth: '1000px', margin: '0 auto'
        }}>
          {[
            {
              icon: '🔮',
              title: 'Admission Prediction',
              desc: 'InLegalBERT trained on 32,000 real Supreme Court cases predicts ADMIT or REJECT instantly.'
            },
            {
              icon: '🧠',
              title: 'AI Legal Reasoning',
              desc: 'Understand exactly WHY your petition was flagged with phrase-level SHAP analysis.'
            },
            {
              icon: '📋',
              title: 'Improvement Guide',
              desc: 'Get 3 specific actionable steps to strengthen a rejected petition before refiling.'
            },
            {
              icon: '📚',
              title: 'Similar Cases',
              desc: 'Find real precedent cases from our database of 5,000 indexed Supreme Court judgments.'
            },
            {
              icon: '🔒',
              title: '100% Private',
              desc: 'All analysis runs locally on our servers. Your petition text never leaves our system.'
            },
            {
              icon: '⚡',
              title: 'Instant Results',
              desc: 'Full analysis including prediction, explanation and similar cases in under 10 seconds.'
            },
          ].map((f, i) => (
            <div key={i} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>
                {f.icon}
              </div>
              <h3 style={{
                fontSize: '18px', fontWeight: '700',
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

      {/* Pricing */}
      <div style={{
        padding: '80px 60px',
        borderTop: '1px solid #2d3148'
      }}>
        <h2 style={{
          textAlign: 'center', fontSize: '36px',
          fontWeight: '800', marginBottom: '16px'
        }}>
          Simple Pricing
        </h2>
        <p style={{
          textAlign: 'center', color: '#9ca3af',
          marginBottom: '60px'
        }}>
          For individual lawyers and law firms
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px', maxWidth: '900px', margin: '0 auto'
        }}>
          {[
            {
              plan: 'Free',
              price: '₹0',
              period: 'forever',
              features: [
                '3 analyses/month',
                'Basic prediction',
                'No explanation',
              ],
              cta: 'Get Started',
              highlight: false
            },
            {
              plan: 'Professional',
              price: '₹2,999',
              period: 'per month',
              features: [
                '50 analyses/month',
                'Full SHAP explanation',
                'Similar case retrieval',
                'Improvement suggestions',
                'PDF upload',
              ],
              cta: 'Start Free Trial',
              highlight: true
            },
            {
              plan: 'Firm',
              price: '₹9,999',
              period: 'per month',
              features: [
                'Unlimited analyses',
                'Bulk upload',
                '5 team accounts',
                'Email reports',
                'API access',
              ],
              cta: 'Contact Sales',
              highlight: false
            },
          ].map((p, i) => (
            <div key={i} className="card" style={{
              textAlign: 'center',
              border: p.highlight
                ? '2px solid #667eea'
                : '1px solid #2d3148',
              position: 'relative'
            }}>
              {p.highlight && (
                <div style={{
                  position: 'absolute', top: '-12px',
                  left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white', padding: '4px 16px',
                  borderRadius: '999px', fontSize: '12px',
                  fontWeight: '700'
                }}>
                  MOST POPULAR
                </div>
              )}
              <div style={{
                fontSize: '18px', fontWeight: '700',
                marginBottom: '8px'
              }}>
                {p.plan}
              </div>
              <div style={{
                fontSize: '36px', fontWeight: '900',
                marginBottom: '4px'
              }} className="gradient-text">
                {p.price}
              </div>
              <div style={{
                color: '#9ca3af', fontSize: '14px',
                marginBottom: '24px'
              }}>
                {p.period}
              </div>
              <ul style={{
                listStyle: 'none', marginBottom: '24px',
                textAlign: 'left'
              }}>
                {p.features.map((f, j) => (
                  <li key={j} style={{
                    padding: '8px 0',
                    borderBottom: '1px solid #2d3148',
                    color: '#d1d5db', fontSize: '14px'
                  }}>
                    ✅ {f}
                  </li>
                ))}
              </ul>
              <button
                className="btn-primary"
                style={{ width: '100%' }}
                onClick={() => navigate('/dashboard')}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center', padding: '40px',
        borderTop: '1px solid #2d3148',
        color: '#9ca3af', fontSize: '14px'
      }}>
        ⚖️ LegalAI — Advisory system only. Not legal advice.
        Built by Ekta | Final Year B.Tech Project
      </div>

    </div>
  );
}