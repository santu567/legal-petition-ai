import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

export default function Landing() {
  const navigate   = useNavigate();
  const canvasRef  = useRef();

  // ── Scroll fade-in observer ───────────────────────────
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('lp-v');
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.lp-fi').forEach(el => obs.observe(el));

    // ── Three.js background ──────────────────────────────
    if (!window.THREE) return;
    const THREE   = window.THREE;
    const canvas  = canvasRef.current;
    const W       = window.innerWidth;
    const H       = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
    camera.position.set(0, 0, 14);

    // Ambient + gold light
    scene.add(new THREE.AmbientLight(0xfff8e7, 0.4));
    const goldLight = new THREE.PointLight(0xC9A84C, 3, 40);
    goldLight.position.set(8, 4, 6);
    scene.add(goldLight);

    // Particles
    const pGeo = new THREE.BufferGeometry();
    const pArr = new Float32Array(600 * 3);
    for (let i = 0; i < 600 * 3; i++)
      pArr[i] = (Math.random() - 0.5) * 60;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pArr, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xC9A84C, size: 0.06, transparent: true, opacity: 0.5
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Scales of justice
    const scalesGroup = new THREE.Group();
    scene.add(scalesGroup);
    scalesGroup.position.set(-5, 2, -2);

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xC9A84C, metalness: 0.9, roughness: 0.1,
      emissive: 0x7a5010, emissiveIntensity: 0.2
    });

    // Pole
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 5, 8), goldMat
    );
    scalesGroup.add(pole);

    // Crossbar
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.07, 0.07), goldMat
    );
    bar.position.y = 2.5;
    scalesGroup.add(bar);

    // Pans
    [-2, 2].forEach((x, idx) => {
      const tilt = idx === 0 ? -0.3 : 0.5;
      const pan = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 0.7, 0.08, 32), goldMat
      );
      pan.position.set(x, tilt, 0);
      scalesGroup.add(pan);
    });

    // Floating rings
    const rings = [];
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(2 + i * 1.2, 0.04, 8, 60),
        new THREE.MeshBasicMaterial({
          color: 0xC9A84C, transparent: true,
          opacity: 0.08 - i * 0.02
        })
      );
      ring.position.set(i % 2 === 0 ? 3 : -3, i - 1, -4 - i * 2);
      ring.rotation.x = Math.PI / 2 + i * 0.3;
      scene.add(ring);
      rings.push(ring);
    }

    // Mouse parallax
    let mouseX = 0, mouseY = 0, tgX = 0, tgY = 0;
    const onMouse = e => {
      mouseX = (e.clientX / W - 0.5) * 2;
      mouseY = (e.clientY / H - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouse);

    // Animate
    let t = 0;
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.008;
      tgX += (mouseX - tgX) * 0.04;
      tgY += (mouseY - tgY) * 0.04;
      camera.position.x = tgX * 2.5;
      camera.position.y = tgY * 1.5;
      camera.lookAt(0, 0, 0);
      particles.rotation.y = t * 0.04;
      particles.rotation.x = t * 0.02;
      scalesGroup.rotation.z = Math.sin(t * 0.4) * 0.04;
      scalesGroup.position.y = 2 + Math.sin(t * 0.6) * 0.3;
      scalesGroup.rotation.y = t * 0.08;
      rings.forEach((r, i) => {
        r.rotation.z = t * (0.15 + i * 0.08);
        r.position.y = (i - 1) + Math.sin(t * 0.5 + i) * 0.4;
      });
      goldLight.position.x = Math.cos(t * 0.5) * 8;
      goldLight.position.z = Math.sin(t * 0.5) * 8 + 6;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ background: 'var(--bg-main)', color: 'var(--text-primary)', minHeight: '100vh', transition: 'background 0.3s ease, color 0.3s ease' }}>

      {/* Three.js Canvas */}
      <canvas ref={canvasRef} style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none'
      }} />

      {/* ── Advisory Bar ─────────────────────────────────── */}
      <div style={{
        position: 'relative', zIndex: 50,
        background: 'linear-gradient(90deg, rgba(201,168,76,0.1), rgba(179,58,58,0.08))',
        borderBottom: '1px solid var(--border)',
        color: 'var(--gold)', padding: '9px 36px',
        display: 'flex', alignItems: 'center', gap: '12px',
        fontFamily: "'DM Mono', monospace", fontSize: '10px',
        letterSpacing: '.1em', textTransform: 'uppercase',
        backdropFilter: 'blur(20px)'
      }}>
        <span style={{ flex: 1 }}>
          ⚠ Advisory system only — AI predictions do not constitute legal advice
        </span>
        <span style={{ opacity: 0.6 }}>
          InLegalBERT · Qwen 2.5 · FAISS · SHAP
        </span>
      </div>

      {/* ── Navbar ───────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--bg-nav)',
        backdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: '1px solid var(--border)',
        padding: '0 44px',
        boxShadow: 'var(--navbar-shadow)',
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '14px 0', gap: '20px'
        }}>
          {/* Brand */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <div style={{
              width: '40px', height: '40px',
              background: 'linear-gradient(135deg, rgba(201,168,76,0.8), var(--gold-light))',
              borderRadius: '10px', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '20px',
              boxShadow: '0 0 20px rgba(201,168,76,0.35)'
            }}>
              ⚖️
            </div>
            <div>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '21px', fontWeight: '700',
                color: 'var(--text-primary)', letterSpacing: '-.4px'
              }}>
                Legal<span style={{ color: 'var(--gold)' }}>AI</span>
              </div>
              <div style={{
                fontFamily: "'DM Mono', monospace", fontSize: '9px',
                letterSpacing: '.12em', textTransform: 'uppercase',
                color: 'var(--muted)'
              }}>
                Judicial Intelligence Platform
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <div style={{ display: 'flex', gap: '0', marginLeft: 'auto' }}>
            {[
              { label: 'Features',    id: 'features' },
              { label: 'How It Works',id: 'howitworks' },
              { label: 'Pricing',     id: 'pricing' },
              { label: 'About',       id: 'about' },
            ].map(item => (
              <button key={item.id} onClick={() => scrollTo(item.id)}
                style={{
                  padding: '8px 18px',
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '10px', letterSpacing: '.1em',
                  textTransform: 'uppercase', color: 'var(--muted)',
                  cursor: 'pointer', border: 'none', background: 'none',
                  transition: 'color .2s'
                }}
                onMouseEnter={e => e.target.style.color = 'var(--gold)'}
                onMouseLeave={e => e.target.style.color = 'var(--muted)'}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* CTA */}
          <button
            className="btn-primary"
            style={{ marginLeft: '14px', borderRadius: '2px' }}
            onClick={() => navigate('/login')}
          >
            Begin Analysis →
          </button>
          
          <ThemeToggle />
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={{
        minHeight: '96vh', display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden', padding: '80px 60px'
      }}>
        <div
          id="heroPanel"
          style={{
            position: 'relative', zIndex: 2, maxWidth: '680px',
            background: 'var(--bg-card)',
            backdropFilter: 'blur(24px) saturate(160%)',
            border: '1px solid var(--border)',
            borderRadius: '4px', padding: '56px 60px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            transformStyle: 'preserve-3d',
            transition: 'transform .1s ease-out, background 0.3s ease'
          }}
          onMouseMove={e => {
            const r = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            e.currentTarget.style.transform =
              `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 8}deg) translateZ(12px)`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform =
              'perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0px)';
          }}
        >
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            fontFamily: "'DM Mono', monospace", fontSize: '10px',
            letterSpacing: '.22em', textTransform: 'uppercase',
            color: 'var(--gold)', marginBottom: '24px',
            padding: '7px 14px', border: '1px solid rgba(201,168,76,0.3)',
            background: 'rgba(201,168,76,0.06)', borderRadius: '2px'
          }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--gold)',
              animation: 'bounce 2s infinite',
              boxShadow: '0 0 8px rgba(201,168,76,0.9)'
            }} />
            🇮🇳 Supreme Court · High Court Intelligence
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(38px,5.5vw,64px)', fontWeight: '900',
            lineHeight: '1.06', color: 'var(--text-primary)',
            marginBottom: '24px', letterSpacing: '-.02em'
          }}>
            Know if Your<br />
            Petition Will Be{' '}
            <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>
              Admitted
            </em>
            <br />Before You File
          </h1>

          {/* Description */}
          <p style={{
            fontSize: '17px', color: 'var(--text-secondary)',
            lineHeight: '1.78', marginBottom: '36px', fontWeight: '300'
          }}>
            AI-powered petition analysis trained on{' '}
            <strong style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
              32,302 real Supreme Court judgments
            </strong>
            . Get instant ADMIT/REJECT prediction with legal reasoning
            and actionable improvement suggestions.
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '36px' }}>
            <button
              className="btn-primary"
              onClick={() => navigate('/dashboard')}
            >
              Analyze Petition Free →
            </button>
            <button
              className="btn-secondary"
              onClick={() => scrollTo('howitworks')}
            >
              See How It Works ↓
            </button>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: "'DM Mono', monospace", fontSize: '10px',
              letterSpacing: '.12em', textTransform: 'uppercase',
              color: 'var(--muted)'
            }}>
              Powered by
            </span>
            {['InLegalBERT', 'Qwen 2.5', 'FAISS', 'SHAP'].map(b => (
              <span key={b} style={{
                fontFamily: "'DM Mono', monospace", fontSize: '9px',
                color: 'rgba(245,240,232,0.7)', padding: '4px 10px',
                border: '1px solid rgba(201,168,76,0.2)',
                background: 'rgba(255,255,255,0.03)',
                display: 'flex', alignItems: 'center', gap: '5px',
                borderRadius: '2px', transition: 'all .2s'
              }}>
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{
          position: 'absolute', bottom: '36px', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
          fontFamily: "'DM Mono', monospace", fontSize: '9px',
          letterSpacing: '.2em', textTransform: 'uppercase',
          color: 'rgba(201,168,76,0.4)', zIndex: 2
        }}>
          Scroll
          <div style={{
            width: '1px', height: '32px',
            background: 'linear-gradient(to bottom, rgba(201,168,76,0.4), transparent)'
          }} />
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <section className="lp-fi" style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '48px 60px', position: 'relative', zIndex: 1,
        background: 'var(--bg-card)',
        backdropFilter: 'blur(20px)',
        display: 'flex', justifyContent: 'center',
        gap: '80px', flexWrap: 'wrap'
      }}>
        {[
          { number: '32,302', label: 'Court Cases Trained' },
          { number: '57%+',   label: 'Prediction Accuracy' },
          { number: '4 AI',   label: 'Models Working Together' },
          { number: '100%',   label: 'Private & Local' },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '40px', fontWeight: '900',
              color: 'var(--gold)', marginBottom: '8px'
            }}>
              {s.number}
            </div>
            <div style={{
              fontFamily: "'DM Mono', monospace", fontSize: '10px',
              letterSpacing: '.12em', textTransform: 'uppercase',
              color: 'var(--muted)'
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section id="features" className="lp-fi" style={{
        padding: '100px 60px', position: 'relative', zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: '10px',
            letterSpacing: '.22em', textTransform: 'uppercase',
            color: 'var(--gold)', marginBottom: '16px'
          }}>
            Platform Capabilities
          </div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '42px', fontWeight: '700',
            color: 'var(--text-primary)', marginBottom: '16px'
          }}>
            Everything a Lawyer Needs
          </h2>
          <p style={{
            color: 'var(--text-secondary)', fontSize: '16px', fontWeight: '300'
          }}>
            Built specifically for Indian legal professionals
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px', maxWidth: '1100px', margin: '0 auto'
        }}>
          {[
            { icon: '🔮', title: 'Admission Prediction',
              desc: 'InLegalBERT trained on 32,302 real Supreme Court cases predicts ADMIT or REJECT with confidence scoring.' },
            { icon: '🧠', title: 'SHAP Explainability',
              desc: 'Understand exactly which phrases in your petition pushed the AI toward rejection or admission.' },
            { icon: '📋', title: 'Improvement Roadmap',
              desc: 'Qwen 2.5 AI generates 3 specific actionable steps to strengthen a rejected petition before refiling.' },
            { icon: '📚', title: 'Precedent Retrieval',
              desc: 'FAISS vector search finds 3 most similar real Supreme Court cases from 5,000 indexed judgments.' },
            { icon: '🔒', title: '100% Private',
              desc: 'All analysis runs locally on our secure servers. Your petition text never leaves our system.' },
            { icon: '⚡', title: 'Multi-Model Pipeline',
              desc: '4 AI models work together — classifier, generator, explainer, and retriever — in one seamless flow.' },
          ].map((f, i) => (
            <div
              key={i}
              className="card"
              style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
              onMouseMove={e => {
                const r = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width - 0.5;
                const y = (e.clientY - r.top) / r.height - 0.5;
                e.currentTarget.style.transform =
                  `perspective(700px) rotateY(${x * 14}deg) rotateX(${-y * 10}deg) translateZ(8px)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform =
                  'perspective(700px) rotateY(0) rotateX(0) translateZ(0)';
                e.currentTarget.style.transition = 'transform 0.6s ease';
              }}
              onClick={() => navigate('/dashboard')}
            >
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>{f.icon}</div>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '18px', fontWeight: '600',
                color: 'var(--text-primary)', marginBottom: '12px'
              }}>
                {f.title}
              </h3>
              <p style={{
                color: 'var(--text-secondary)', lineHeight: '1.7',
                fontSize: '14px', fontWeight: '300'
              }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section id="howitworks" className="lp-fi" style={{
        padding: '100px 60px',
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        position: 'relative', zIndex: 1,
        backdropFilter: 'blur(20px)',
        transition: 'background 0.3s ease'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: '10px',
            letterSpacing: '.22em', textTransform: 'uppercase',
            color: 'var(--gold)', marginBottom: '16px'
          }}>
            Process
          </div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '42px', fontWeight: '700', color: 'var(--text-primary)'
          }}>
            How It Works
          </h2>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'center',
          gap: '0', maxWidth: '1000px', margin: '0 auto', flexWrap: 'wrap'
        }}>
          {[
            { step: '01', icon: '📄', title: 'Submit Petition',
              desc: 'Paste text or upload PDF' },
            { step: '02', icon: '🤖', title: 'AI Analyzes',
              desc: 'InLegalBERT reads legal arguments' },
            { step: '03', icon: '⚖️', title: 'Get Verdict',
              desc: 'ADMIT/REJECT with confidence band' },
            { step: '04', icon: '📋', title: 'Improve & File',
              desc: 'Use AI suggestions to strengthen' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div className="card" style={{
                textAlign: 'center', width: '200px', padding: '32px 20px'
              }}>
                <div style={{
                  fontFamily: "'DM Mono', monospace", fontSize: '11px',
                  color: 'var(--gold)', fontWeight: '700',
                  marginBottom: '12px', letterSpacing: '2px'
                }}>
                  {s.step}
                </div>
                <div style={{ fontSize: '36px', marginBottom: '14px' }}>
                  {s.icon}
                </div>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: '600', marginBottom: '8px',
                  fontSize: '15px', color: 'var(--text-primary)'
                }}>
                  {s.title}
                </div>
                <div style={{
                  color: 'var(--text-secondary)',
                  fontSize: '12px', lineHeight: '1.5',
                  fontFamily: "'DM Mono', monospace"
                }}>
                  {s.desc}
                </div>
              </div>
              {i < 3 && (
                <div style={{
                  color: 'var(--gold)', fontSize: '20px',
                  margin: '0 8px', opacity: 0.5
                }}>→</div>
              )}
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '56px' }}>
          <button
            className="btn-primary"
            style={{ fontSize: '12px', padding: '16px 40px' }}
            onClick={() => navigate('/dashboard')}
          >
            Try It Now — Free →
          </button>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────── */}
      <section id="pricing" className="lp-fi" style={{
        padding: '100px 60px',
        borderTop: '1px solid var(--border)',
        position: 'relative', zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: '10px',
            letterSpacing: '.22em', textTransform: 'uppercase',
            color: 'var(--gold)', marginBottom: '16px'
          }}>
            Pricing
          </div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '42px', fontWeight: '700', color: 'var(--text-primary)',
            marginBottom: '16px'
          }}>
            Simple, Transparent Pricing
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontWeight: '300' }}>
            For individual lawyers and law firms
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px', maxWidth: '960px', margin: '0 auto'
        }}>
          {[
            {
              plan    : 'Free',
              price   : '₹0',
              period  : 'forever',
              features: ['3 analyses/month', 'Basic prediction', 'No explanation', 'No similar cases'],
              cta     : 'Get Started',
              popular : false,
              action  : () => navigate('/dashboard')
            },
            {
              plan    : 'Professional',
              price   : '₹2,999',
              period  : 'per month',
              features: ['50 analyses/month', 'Full SHAP explanation', 'Similar case retrieval', 'Improvement suggestions', 'PDF upload'],
              cta     : 'Start Free Trial',
              popular : true,
              action  : () => navigate('/login')
            },
            {
              plan    : 'Firm',
              price   : '₹9,999',
              period  : 'per month',
              features: ['Unlimited analyses', 'Bulk PDF upload', '5 team accounts', 'Email reports', 'API access'],
              cta     : 'Contact Sales',
              popular : false,
              action  : () => window.location.href = 'mailto:legal.ai.contact@gmail.com'
            },
          ].map((p, i) => (
            <div key={i} style={{
              background: p.popular
                ? 'var(--bg-card)'
                : 'var(--bg-card)',
              border: p.popular
                ? '1px solid var(--border-s)'
                : '1px solid var(--border)',
              borderRadius: '4px', padding: '36px 28px',
              backdropFilter: 'blur(20px)',
              position: 'relative', textAlign: 'center',
              transition: 'transform .3s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {p.popular && (
                <div style={{
                  position: 'absolute', top: '-14px', left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
                  color: 'var(--deep)', padding: '4px 20px',
                  borderRadius: '2px', fontSize: '10px',
                  fontFamily: "'DM Mono', monospace",
                  fontWeight: '700', letterSpacing: '.1em',
                  textTransform: 'uppercase', whiteSpace: 'nowrap'
                }}>
                  ⭐ Most Popular
                </div>
              )}
              <div style={{
                fontFamily: "'DM Mono', monospace", fontSize: '11px',
                letterSpacing: '.14em', textTransform: 'uppercase',
                color: 'var(--gold)', marginBottom: '12px'
              }}>
                {p.plan}
              </div>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '44px', fontWeight: '900',
                color: 'var(--text-primary)', marginBottom: '4px'
              }}>
                {p.price}
              </div>
              <div style={{
                fontFamily: "'DM Mono', monospace", fontSize: '10px',
                color: 'var(--muted)', marginBottom: '28px',
                letterSpacing: '.08em'
              }}>
                {p.period}
              </div>
              <ul style={{ listStyle: 'none', marginBottom: '28px', textAlign: 'left' }}>
                {p.features.map((f, j) => (
                  <li key={j} style={{
                    padding: '10px 0',
                    borderBottom: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    fontSize: '13px', display: 'flex',
                    alignItems: 'center', gap: '8px',
                    fontFamily: "'DM Sans', sans-serif"
                  }}>
                    <span style={{ color: 'var(--gold)' }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <button
                className={p.popular ? 'btn-primary' : 'btn-secondary'}
                style={{ width: '100%' }}
                onClick={p.action}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── About ────────────────────────────────────────── */}
      <section id="about" className="lp-fi" style={{
        padding: '100px 60px',
        background: 'var(--bg-nav)',
        borderTop: '1px solid var(--border)',
        position: 'relative', zIndex: 1,
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: '10px',
            letterSpacing: '.22em', textTransform: 'uppercase',
            color: 'var(--gold)', marginBottom: '16px'
          }}>
            About
          </div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '42px', fontWeight: '700',
            color: 'var(--text-primary)', marginBottom: '24px'
          }}>
            About LegalAI
          </h2>
          <p style={{
            color: 'var(--text-secondary)', lineHeight: '1.8',
            fontSize: '16px', fontWeight: '300', marginBottom: '40px'
          }}>
            LegalAI is a Final Year B.Tech project that combines InLegalBERT,
            Qwen 2.5, FAISS, and SHAP to make Indian legal processes more
            accessible and transparent — trained on 32,302 real Supreme Court
            judgments from the ILDC dataset.
          </p>
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '16px'
          }}>
            {[
              { name: '👩‍💻 Ekta', role: 'ML Pipeline + Full Stack' },
              { name: '👨‍💻 Santu', role: 'Generative AI + Backend' },
            ].map((m, i) => (
              <div key={i} className="card" style={{
                padding: '20px 32px', textAlign: 'center'
              }}>
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '18px', fontWeight: '600',
                  marginBottom: '6px'
                }}>
                  {m.name}
                </div>
                <div style={{
                  fontFamily: "'DM Mono', monospace", fontSize: '10px',
                  color: 'var(--gold)', letterSpacing: '.08em'
                }}>
                  {m.role}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer style={{
        textAlign: 'center', padding: '40px 60px',
        borderTop: '1px solid var(--border)',
        position: 'relative', zIndex: 1
      }}>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center', gap: '24px' }}>
          {['Features', 'How It Works', 'Pricing', 'About'].map((l, i) => (
            <span
              key={i}
              onClick={() => scrollTo(l.toLowerCase().replace(' ', ''))}
              style={{
                fontFamily: "'DM Mono', monospace", fontSize: '10px',
                letterSpacing: '.1em', textTransform: 'uppercase',
                color: 'var(--muted)', cursor: 'pointer', transition: 'color .2s'
              }}
              onMouseEnter={e => e.target.style.color = 'var(--gold)'}
              onMouseLeave={e => e.target.style.color = 'var(--muted)'}
            >
              {l}
            </span>
          ))}
        </div>
        <div style={{
          fontFamily: "'DM Mono', monospace", fontSize: '10px',
          letterSpacing: '.08em', color: 'var(--muted)'
        }}>
          ⚖️ LegalAI — Advisory system only. Not legal advice.
          Built by Ekta & Santu | Final Year B.Tech Project
        </div>
      </footer>

    </div>
  );
}