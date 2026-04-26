import React, { useState, useEffect } from 'react';
import {
  Activity, ArrowRight, Check, Calendar, BarChart3, Target,
  Brain, Lock, Sparkles, Zap, TrendingUp, Eye, Star, Github,
  ChevronDown, ChevronRight, Shield, Smartphone, Database
} from 'lucide-react';

// ============================================================
// LANDING PAGE
// Lives at "/" — sells the product to visitors who haven't
// seen the app yet. Click "Open journal" → goes to /app.
// ============================================================

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(null);
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  // smooth-scroll for anchor links
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => { document.documentElement.style.scrollBehavior = ''; };
  }, []);

  const goToApp = () => { window.location.href = '/app'; };

  return (
    <div className="lp-root">
      <LandingStyles />

      {/* NAV */}
      <header className="lp-nav">
        <div className="lp-nav-inner">
          <a href="/" className="lp-brand">
            <div className="lp-brand-icon"><Activity size={16} /></div>
            <span>TRADE LOG PRO</span>
          </a>
          <nav className="lp-nav-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </nav>
          <button className="lp-btn lp-btn-primary lp-btn-sm" onClick={goToApp}>
            Open journal <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-hero-bg" />
        <div className="lp-hero-grid" />
        <div className="lp-hero-orb" />

        <div className="lp-container">
          <div className="lp-hero-badge">
            <span className="lp-hero-dot" /> Built for traders who want an edge, not just a logbook
          </div>

          <h1 className="lp-hero-title">
            Stop guessing if your<br />
            strategy actually works.<br />
            <span className="lp-grad">Find out.</span>
          </h1>

          <p className="lp-hero-sub">
            A trading journal that calculates your real edge — win rate, expectancy, R-multiple, drawdown — and tells you which setups make you money and which ones bleed you.
          </p>

          <div className="lp-hero-cta">
            <button className="lp-btn lp-btn-primary lp-btn-lg" onClick={goToApp}>
              Start journaling free <ArrowRight size={16} />
            </button>
            <a href="#features" className="lp-btn lp-btn-ghost lp-btn-lg">
              See how it works
            </a>
          </div>

          <div className="lp-hero-trust">
            <span><Check size={14} /> No signup required</span>
            <span><Check size={14} /> Your data stays on your device</span>
            <span><Check size={14} /> Free forever</span>
          </div>

          {/* Hero visual: stylized stats card */}
          <div className="lp-hero-visual">
            <div className="lp-visual-card lp-visual-main">
              <div className="lp-visual-row">
                <div>
                  <div className="lp-visual-label">Account equity</div>
                  <div className="lp-visual-value">$13,247.50</div>
                  <div className="lp-visual-delta lp-up">+ $3,247.50 · +32.48%</div>
                </div>
                <div className="lp-visual-spark">
                  <svg viewBox="0 0 120 60" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="sparkfill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10d9a0" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#10d9a0" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,45 L15,42 L30,38 L45,30 L60,32 L75,22 L90,18 L105,12 L120,8 L120,60 L0,60 Z" fill="url(#sparkfill)" />
                    <path d="M0,45 L15,42 L30,38 L45,30 L60,32 L75,22 L90,18 L105,12 L120,8" fill="none" stroke="#10d9a0" strokeWidth="2" />
                  </svg>
                </div>
              </div>
              <div className="lp-visual-stats">
                <div><span>Win rate</span><strong>64.3%</strong></div>
                <div><span>Trades</span><strong>147</strong></div>
                <div><span>R:R</span><strong>1.82</strong></div>
                <div><span>Expectancy</span><strong className="lp-up">+$22.08</strong></div>
              </div>
            </div>

            <div className="lp-visual-card lp-visual-side lp-visual-side-1">
              <div className="lp-visual-label">Best setup</div>
              <div className="lp-visual-name">Liquidity sweep + BoS</div>
              <div className="lp-up lp-visual-mini">+$1,840 · 78% win</div>
            </div>

            <div className="lp-visual-card lp-visual-side lp-visual-side-2">
              <div className="lp-visual-label">Worst setup</div>
              <div className="lp-visual-name">News breakout</div>
              <div className="lp-down lp-visual-mini">−$620 · 31% win</div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="lp-section lp-problem">
        <div className="lp-container">
          <div className="lp-section-kicker">The brutal truth</div>
          <h2 className="lp-section-title">
            Most traders journal in spreadsheets and<br />
            <span className="lp-strike">never look at the data again.</span>
          </h2>
          <p className="lp-section-sub">
            You think you have a winning strategy. But you don't actually know your win rate. You don't know which setups are profitable. You don't know if FOMO is costing you more than your bad entries. The data is sitting there — you've just never analyzed it.
          </p>

          <div className="lp-problem-grid">
            <div className="lp-problem-card">
              <div className="lp-problem-icon"><Eye size={18} /></div>
              <h3>You log trades but don't review them</h3>
              <p>Your spreadsheet has 200 rows. You've never built a single chart from it.</p>
            </div>
            <div className="lp-problem-card">
              <div className="lp-problem-icon"><Brain size={18} /></div>
              <h3>You blame discipline, not data</h3>
              <p>"I just need to stop revenge trading." Maybe. Or maybe one of your setups has a 30% win rate and you don't know it yet.</p>
            </div>
            <div className="lp-problem-card">
              <div className="lp-problem-icon"><Target size={18} /></div>
              <h3>You can't separate skill from luck</h3>
              <p>One green week feels like progress. One red week feels like failure. Without expectancy, you're flying blind.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="lp-section" id="features">
        <div className="lp-container">
          <div className="lp-section-kicker">What you get</div>
          <h2 className="lp-section-title">A journal built around <span className="lp-grad">the metrics that matter</span></h2>

          <div className="lp-features">
            <FeatureRow
              icon={<TrendingUp size={20} />}
              title="Equity curve & realized R:R"
              text="Watch your account grow trade by trade. See your average win vs average loss in real time — the only ratio that determines if you're profitable long-term."
              tag="Free"
            />
            <FeatureRow
              icon={<Calendar size={20} />}
              title="Calendar heatmap"
              text="Spot patterns in your trading days. Are you a Tuesday trader? Do Fridays bleed you? The calendar makes it obvious."
              tag="Free"
              reverse
            />
            <FeatureRow
              icon={<Zap size={20} />}
              title="Pre-trade confluence check"
              text="A 20-second forced pause that surfaces your edge checklist before every session. Train yourself out of impulse trades."
              tag="Free"
            />
            <FeatureRow
              icon={<BarChart3 size={20} />}
              title="Setup-by-setup analytics"
              text="Which of your strategies actually makes money? See expectancy, win rate, and average R for every setup type. Cut the losers, scale the winners."
              tag="Pro"
              reverse
            />
            <FeatureRow
              icon={<Brain size={20} />}
              title="AI trade review"
              text="Paste a trade. Get an honest breakdown of what you did right, what was emotional, and what to do differently next time."
              tag="Pro"
            />
            <FeatureRow
              icon={<Shield size={20} />}
              title="Discipline scoring"
              text="Rate every trade 1–5 on how well you followed your plan. Watch the correlation between discipline and PnL — it's not subtle."
              tag="Free"
              reverse
            />
          </div>
        </div>
      </section>

      {/* TRUST / DESIGN */}
      <section className="lp-section lp-trust-section">
        <div className="lp-container">
          <div className="lp-trust-grid">
            <div className="lp-trust-card">
              <Database size={20} className="lp-trust-icon" />
              <h3>Your data, your device</h3>
              <p>No cloud. No login required. Your trade history lives in your browser. Export to CSV anytime.</p>
            </div>
            <div className="lp-trust-card">
              <Smartphone size={20} className="lp-trust-icon" />
              <h3>Install as a real app</h3>
              <p>Add to home screen on iOS or Android. Opens fullscreen, works offline, feels native. No App Store gatekeeping.</p>
            </div>
            <div className="lp-trust-card">
              <Lock size={20} className="lp-trust-icon" />
              <h3>No tracking, no ads</h3>
              <p>We don't have analytics on you. We don't sell anything to anyone. Pro is opt-in, free is forever.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="lp-section" id="pricing">
        <div className="lp-container">
          <div className="lp-section-kicker">Pricing</div>
          <h2 className="lp-section-title">Free forever.<br /><span className="lp-grad">Pro pays for itself the first month.</span></h2>
          <p className="lp-section-sub">Pro launches once we hit 100 active users on free. Join the waitlist below and get 50% off for life.</p>

          <div className="lp-pricing">
            <div className="lp-price-card">
              <div className="lp-price-tier">Free</div>
              <div className="lp-price-amount">$0</div>
              <div className="lp-price-sub">forever, no card</div>
              <ul className="lp-price-list">
                <li><Check size={14} /> Unlimited trades</li>
                <li><Check size={14} /> Equity curve & core metrics</li>
                <li><Check size={14} /> Calendar view</li>
                <li><Check size={14} /> Confluence checklist</li>
                <li><Check size={14} /> Discipline scoring</li>
                <li><Check size={14} /> CSV export</li>
                <li><Check size={14} /> Live crypto + forex prices</li>
              </ul>
              <button className="lp-btn lp-btn-ghost lp-btn-full" onClick={goToApp}>
                Start free <ArrowRight size={14} />
              </button>
            </div>

            <div className="lp-price-card lp-price-pro">
              <div className="lp-price-ribbon">Pro · Coming soon</div>
              <div className="lp-price-tier">Pro</div>
              <div className="lp-price-amount">$8<span className="lp-price-mo">/mo</span></div>
              <div className="lp-price-sub">$4/mo for waitlist members</div>
              <ul className="lp-price-list">
                <li><Check size={14} /> <strong>Everything in Free</strong></li>
                <li><Check size={14} /> Setup-by-setup expectancy breakdown</li>
                <li><Check size={14} /> Confluence performance analysis</li>
                <li><Check size={14} /> AI trade review (powered by Claude)</li>
                <li><Check size={14} /> Day-of-week & time-of-day heatmaps</li>
                <li><Check size={14} /> Cloud sync across devices</li>
                <li><Check size={14} /> PDF performance reports</li>
              </ul>
              <button className="lp-btn lp-btn-primary lp-btn-full" onClick={() => setWaitlistOpen(true)}>
                Join waitlist <Sparkles size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="lp-section" id="faq">
        <div className="lp-container lp-narrow">
          <div className="lp-section-kicker">FAQ</div>
          <h2 className="lp-section-title">Questions, <span className="lp-grad">answered honestly.</span></h2>

          <div className="lp-faq">
            {FAQS.map((f, i) => (
              <div key={i} className={`lp-faq-item ${openFaq === i ? 'lp-open' : ''}`}>
                <button className="lp-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{f.q}</span>
                  <ChevronDown size={16} className="lp-faq-chev" />
                </button>
                <div className="lp-faq-a">{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="lp-section lp-cta-section">
        <div className="lp-container">
          <div className="lp-cta-card">
            <h2 className="lp-cta-title">Your edge is hiding<br /><span className="lp-grad">in trades you've already made.</span></h2>
            <p className="lp-cta-sub">Find it. Free. No signup. 30 seconds to your first logged trade.</p>
            <button className="lp-btn lp-btn-primary lp-btn-lg" onClick={goToApp}>
              Open the journal <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-foot-row">
            <a href="/" className="lp-brand">
              <div className="lp-brand-icon"><Activity size={14} /></div>
              <span>TRADE LOG PRO</span>
            </a>
            <div className="lp-foot-links">
              <a href="/app">Open app</a>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#faq">FAQ</a>
            </div>
          </div>
          <div className="lp-foot-bottom">
            <span>© {new Date().getFullYear()} Trade Log Pro · Built for traders, by a trader.</span>
          </div>
        </div>
      </footer>

      {waitlistOpen && <WaitlistModal onClose={() => setWaitlistOpen(false)} />}
    </div>
  );
}

// ============================================================
// FEATURE ROW
// ============================================================
function FeatureRow({ icon, title, text, tag, reverse }) {
  return (
    <div className={`lp-feat ${reverse ? 'lp-feat-reverse' : ''}`}>
      <div className="lp-feat-text">
        <div className="lp-feat-tag-row">
          <div className="lp-feat-icon">{icon}</div>
          <span className={`lp-feat-tag ${tag === 'Pro' ? 'lp-tag-pro' : 'lp-tag-free'}`}>
            {tag === 'Pro' && <Lock size={9} />} {tag}
          </span>
        </div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
      <div className="lp-feat-visual">
        <div className="lp-feat-visual-inner">{icon}</div>
      </div>
    </div>
  );
}

// ============================================================
// WAITLIST MODAL
// ============================================================
function WaitlistModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submit = (e) => {
    e?.preventDefault();
    if (!email.includes('@')) return;
    // Store locally so the user sees confirmation. To collect real signups,
    // replace this with a fetch() to Formspree, Tally, or your own endpoint:
    //   await fetch('https://formspree.io/f/YOUR_ID', { method: 'POST', body: JSON.stringify({ email }) })
    try {
      await fetch('https://formspree.io/f/xvzdydze', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
     body: JSON.stringify({ email })
   });
    } catch {}
    setSubmitted(true);
  };

  return (
    <>
      <div className="lp-modal-bg" onClick={onClose} />
      <div className="lp-modal">
        <button className="lp-modal-close" onClick={onClose}>×</button>
        {!submitted ? (
          <>
            <div className="lp-modal-icon"><Sparkles size={20} /></div>
            <h3 className="lp-modal-title">Get 50% off Pro for life</h3>
            <p className="lp-modal-sub">Pro launches once 100 traders are using the free version daily. Waitlist members lock in $4/mo forever (regular price $8/mo).</p>
            <form onSubmit={submit} className="lp-form">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="lp-input"
                autoFocus
                required
              />
              <button type="submit" className="lp-btn lp-btn-primary lp-btn-full">
                Reserve my spot <ArrowRight size={14} />
              </button>
            </form>
            <small className="lp-modal-fine">No spam. One email when Pro is ready. Unsubscribe anytime.</small>
          </>
        ) : (
          <>
            <div className="lp-modal-icon lp-modal-icon-ok"><Check size={22} /></div>
            <h3 className="lp-modal-title">You're on the list.</h3>
            <p className="lp-modal-sub">We'll email you the moment Pro launches with your 50%-off code locked in.</p>
            <button onClick={onClose} className="lp-btn lp-btn-primary lp-btn-full">
              Take me to the journal
            </button>
          </>
        )}
      </div>
    </>
  );
}

// ============================================================
// FAQ DATA
// ============================================================
const FAQS = [
  {
    q: 'Is this really free? What\'s the catch?',
    a: 'No catch. The free version is genuinely complete and free forever — unlimited trades, full calendar, equity curve, CSV export, the works. Pro adds advanced analytics (setup expectancy, AI trade review, cloud sync) for traders who want to go deeper. If the free tier is enough for you, it\'s enough.',
  },
  {
    q: 'Where is my data stored?',
    a: 'In your browser, on your device. Nowhere else. We don\'t have a server that sees your trades. The flip side: if you clear your browser data or switch devices, your trades don\'t come with you. That\'s why CSV export exists — back up regularly. Pro will add optional cloud sync.',
  },
  {
    q: 'Why not just use a spreadsheet?',
    a: 'Honestly? If a spreadsheet is working for you, keep using it. This app exists for traders who built a spreadsheet, logged 50 trades, and never opened it again. The journal forces a pre-trade discipline check, calculates expectancy and R-multiples for you, and visualizes patterns you wouldn\'t see in rows.',
  },
  {
    q: 'Does it support stocks / options / futures?',
    a: 'You can log any asset — type the symbol manually. The math (entry, exit, position size, PnL) works the same for any market. Where it shines is forex and crypto because of the live price integration. Stock and options traders get the same analytics, just enter your PnL directly.',
  },
  {
    q: 'How accurate are the live prices?',
    a: 'Crypto prices are real-time from CoinGecko/Binance. Forex prices are ECB daily reference rates — accurate enough to know "where the market is today" but not your broker\'s tick price. The app labels every price with its source so you\'re never confused.',
  },
  {
    q: 'Can I use it on my phone?',
    a: 'Yes — that\'s actually where it shines. Open the URL on iOS Safari or Android Chrome, then "Add to Home Screen." It installs as a real app icon, opens fullscreen, and works offline.',
  },
  {
    q: 'Who\'s building this?',
    a: 'A solo trader who got tired of spreadsheets. No VC money, no roadmap meetings, no growth hacks. Just a tool I\'m building because I needed it. If something\'s broken or missing, the feedback loop is direct.',
  },
];

// ============================================================
// STYLES
// ============================================================
function LandingStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap');

      .lp-root, .lp-root * { box-sizing: border-box; }
      .lp-root { font-family: 'Outfit', system-ui, sans-serif; color: #f4f4f5; background: #05120e; min-height: 100vh; line-height: 1.5; -webkit-font-smoothing: antialiased; }
      .lp-root a { color: inherit; text-decoration: none; }
      .lp-root button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }
      .lp-root h1, .lp-root h2, .lp-root h3 { margin: 0; }
      .lp-root p { margin: 0; }

      .lp-container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
      .lp-narrow { max-width: 760px; }

      .lp-grad { background: linear-gradient(120deg, #10d9a0, #3ee7bc); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
      .lp-up { color: #10d9a0; }
      .lp-down { color: #ef4444; }
      .lp-strike { text-decoration: line-through; text-decoration-color: rgba(239,68,68,0.6); text-decoration-thickness: 3px; }

      /* === BUTTONS === */
      .lp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 11px 18px; border-radius: 11px; font-weight: 600; font-size: 14px; transition: all 0.15s ease; white-space: nowrap; letter-spacing: -0.01em; }
      .lp-btn-primary { background: #10d9a0; color: #05120e; box-shadow: 0 4px 24px rgba(16, 217, 160, 0.35); }
      .lp-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 32px rgba(16, 217, 160, 0.5); }
      .lp-btn-ghost { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); color: #f4f4f5; }
      .lp-btn-ghost:hover { border-color: rgba(16, 217, 160, 0.4); background: rgba(16, 217, 160, 0.06); }
      .lp-btn-full { width: 100%; }
      .lp-btn-sm { padding: 8px 14px; font-size: 13px; }
      .lp-btn-lg { padding: 14px 22px; font-size: 15px; }

      /* === NAV === */
      .lp-nav { position: sticky; top: 0; z-index: 50; background: rgba(5, 18, 14, 0.7); backdrop-filter: blur(20px) saturate(180%); border-bottom: 1px solid rgba(255,255,255,0.06); }
      .lp-nav-inner { max-width: 1100px; margin: 0 auto; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
      .lp-brand { display: inline-flex; align-items: center; gap: 8px; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 800; letter-spacing: 0.15em; }
      .lp-brand-icon { width: 28px; height: 28px; border-radius: 8px; background: linear-gradient(135deg, #10d9a0, #0a8c66); display: grid; place-items: center; color: #05120e; }
      .lp-nav-links { display: flex; gap: 24px; font-size: 14px; font-weight: 500; color: #a1a1aa; }
      .lp-nav-links a:hover { color: #f4f4f5; }
      @media (max-width: 640px) { .lp-nav-links { display: none; } }

      /* === HERO === */
      .lp-hero { position: relative; padding: 80px 0 60px; overflow: hidden; }
      .lp-hero-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at top, rgba(16, 217, 160, 0.18), transparent 60%); pointer-events: none; }
      .lp-hero-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px); background-size: 50px 50px; mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%); pointer-events: none; }
      .lp-hero-orb { position: absolute; top: -100px; right: -100px; width: 500px; height: 500px; background: radial-gradient(circle, rgba(16, 217, 160, 0.25), transparent 70%); filter: blur(80px); pointer-events: none; animation: lp-float 20s ease-in-out infinite; }
      @keyframes lp-float { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(-30px, 40px); } }

      .lp-hero .lp-container { position: relative; text-align: center; }
      .lp-hero-badge { display: inline-flex; align-items: center; gap: 8px; padding: 7px 14px; background: rgba(16, 217, 160, 0.1); border: 1px solid rgba(16, 217, 160, 0.25); border-radius: 999px; color: #10d9a0; font-size: 13px; font-weight: 500; margin-bottom: 24px; }
      .lp-hero-dot { width: 6px; height: 6px; border-radius: 50%; background: #10d9a0; box-shadow: 0 0 10px #10d9a0; animation: lp-pulse 1.6s ease-in-out infinite; }
      @keyframes lp-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

      .lp-hero-title { font-size: clamp(36px, 6.5vw, 68px); font-weight: 800; letter-spacing: -0.035em; line-height: 1.05; margin-bottom: 22px; }
      .lp-hero-sub { font-size: clamp(15px, 2vw, 18px); color: #a1a1aa; max-width: 620px; margin: 0 auto 32px; line-height: 1.55; }
      .lp-hero-cta { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 24px; }
      .lp-hero-trust { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; font-size: 12px; color: #71717a; font-weight: 500; }
      .lp-hero-trust span { display: inline-flex; align-items: center; gap: 5px; }
      .lp-hero-trust svg { color: #10d9a0; }

      .lp-hero-visual { margin-top: 60px; position: relative; max-width: 720px; margin-left: auto; margin-right: auto; }
      .lp-visual-card { background: linear-gradient(140deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 20px; text-align: left; box-shadow: 0 30px 80px rgba(0,0,0,0.5); }
      .lp-visual-main { padding: 24px; }
      .lp-visual-row { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 18px; }
      .lp-visual-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; color: #71717a; font-weight: 600; margin-bottom: 4px; }
      .lp-visual-value { font-family: 'JetBrains Mono', monospace; font-size: clamp(24px, 4vw, 32px); font-weight: 700; letter-spacing: -0.02em; }
      .lp-visual-delta { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 600; padding: 3px 8px; border-radius: 6px; background: rgba(16, 217, 160, 0.12); display: inline-block; margin-top: 6px; }
      .lp-visual-spark { width: 120px; height: 60px; flex-shrink: 0; }
      .lp-visual-spark svg { width: 100%; height: 100%; }
      .lp-visual-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.06); }
      .lp-visual-stats > div { display: flex; flex-direction: column; gap: 2px; }
      .lp-visual-stats span { font-size: 9px; text-transform: uppercase; letter-spacing: 0.12em; color: #71717a; font-weight: 600; }
      .lp-visual-stats strong { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 700; }

      .lp-visual-side { position: absolute; padding: 14px 16px; max-width: 220px; }
      .lp-visual-side-1 { top: 20%; left: -8%; transform: rotate(-4deg); animation: lp-float-1 6s ease-in-out infinite; }
      .lp-visual-side-2 { bottom: 8%; right: -8%; transform: rotate(3deg); animation: lp-float-2 7s ease-in-out infinite; }
      @keyframes lp-float-1 { 0%, 100% { transform: rotate(-4deg) translateY(0); } 50% { transform: rotate(-4deg) translateY(-8px); } }
      @keyframes lp-float-2 { 0%, 100% { transform: rotate(3deg) translateY(0); } 50% { transform: rotate(3deg) translateY(-10px); } }
      .lp-visual-name { font-size: 14px; font-weight: 600; margin: 4px 0; }
      .lp-visual-mini { font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; }
      @media (max-width: 768px) { .lp-visual-side { display: none; } }

      /* === SECTIONS === */
      .lp-section { padding: 80px 0; position: relative; }
      .lp-section-kicker { display: inline-block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.18em; color: #10d9a0; font-weight: 700; margin-bottom: 14px; padding: 5px 12px; background: rgba(16, 217, 160, 0.08); border: 1px solid rgba(16, 217, 160, 0.2); border-radius: 6px; font-family: 'JetBrains Mono', monospace; }
      .lp-section-title { font-size: clamp(28px, 4.5vw, 44px); font-weight: 800; letter-spacing: -0.025em; line-height: 1.1; margin-bottom: 18px; }
      .lp-section-sub { font-size: 16px; color: #a1a1aa; max-width: 580px; line-height: 1.55; margin-bottom: 40px; }

      /* === PROBLEM === */
      .lp-problem { background: linear-gradient(180deg, transparent, rgba(239, 68, 68, 0.03)); }
      .lp-problem-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-top: 30px; }
      .lp-problem-card { padding: 24px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; transition: all 0.2s ease; }
      .lp-problem-card:hover { border-color: rgba(239, 68, 68, 0.3); transform: translateY(-2px); }
      .lp-problem-icon { width: 38px; height: 38px; border-radius: 10px; background: rgba(239, 68, 68, 0.1); color: #ef4444; display: grid; place-items: center; margin-bottom: 14px; }
      .lp-problem-card h3 { font-size: 16px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.01em; }
      .lp-problem-card p { font-size: 14px; color: #a1a1aa; line-height: 1.5; }

      /* === FEATURES === */
      .lp-features { display: flex; flex-direction: column; gap: 80px; margin-top: 60px; }
      .lp-feat { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
      .lp-feat-reverse .lp-feat-text { order: 2; }
      .lp-feat-text h3 { font-size: clamp(20px, 3vw, 28px); font-weight: 700; letter-spacing: -0.02em; margin-bottom: 12px; }
      .lp-feat-text p { font-size: 15px; color: #a1a1aa; line-height: 1.6; }
      .lp-feat-tag-row { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
      .lp-feat-icon { width: 40px; height: 40px; border-radius: 10px; background: rgba(16, 217, 160, 0.1); border: 1px solid rgba(16, 217, 160, 0.2); color: #10d9a0; display: grid; place-items: center; }
      .lp-feat-tag { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; padding: 4px 8px; border-radius: 5px; font-family: 'JetBrains Mono', monospace; }
      .lp-tag-free { background: rgba(16, 217, 160, 0.12); color: #10d9a0; }
      .lp-tag-pro { background: linear-gradient(135deg, rgba(167, 139, 250, 0.15), rgba(167, 139, 250, 0.08)); color: #a78bfa; border: 1px solid rgba(167, 139, 250, 0.25); }
      .lp-feat-visual { aspect-ratio: 4/3; background: linear-gradient(140deg, rgba(16, 217, 160, 0.05), rgba(16, 217, 160, 0.01)); border: 1px solid rgba(255,255,255,0.06); border-radius: 18px; display: grid; place-items: center; position: relative; overflow: hidden; }
      .lp-feat-visual::before { content: ''; position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 32px 32px; }
      .lp-feat-visual-inner { width: 80px; height: 80px; border-radius: 20px; background: linear-gradient(135deg, #10d9a0, #0a8c66); color: #05120e; display: grid; place-items: center; box-shadow: 0 20px 60px rgba(16, 217, 160, 0.4); position: relative; z-index: 1; }
      .lp-feat-visual-inner svg { width: 36px; height: 36px; }
      @media (max-width: 768px) {
        .lp-feat { grid-template-columns: 1fr; gap: 24px; }
        .lp-feat-reverse .lp-feat-text { order: 0; }
        .lp-feat-visual { max-width: 320px; margin: 0 auto; width: 100%; }
        .lp-features { gap: 50px; }
      }

      /* === TRUST === */
      .lp-trust-section { background: linear-gradient(180deg, rgba(16, 217, 160, 0.03), transparent); }
      .lp-trust-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
      .lp-trust-card { padding: 28px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; }
      .lp-trust-icon { color: #10d9a0; margin-bottom: 14px; }
      .lp-trust-card h3 { font-size: 17px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.01em; }
      .lp-trust-card p { font-size: 14px; color: #a1a1aa; line-height: 1.55; }

      /* === PRICING === */
      .lp-pricing { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; max-width: 760px; margin-top: 30px; }
      @media (max-width: 640px) { .lp-pricing { grid-template-columns: 1fr; } }
      .lp-price-card { padding: 28px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; position: relative; }
      .lp-price-pro { background: linear-gradient(140deg, rgba(167, 139, 250, 0.08), rgba(255,255,255,0.02)); border-color: rgba(167, 139, 250, 0.25); box-shadow: 0 20px 60px rgba(167, 139, 250, 0.15); }
      .lp-price-ribbon { position: absolute; top: -12px; right: 20px; padding: 4px 10px; background: linear-gradient(135deg, #a78bfa, #8b5cf6); color: #fff; font-size: 10px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; border-radius: 5px; font-family: 'JetBrains Mono', monospace; }
      .lp-price-tier { font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #a1a1aa; margin-bottom: 8px; }
      .lp-price-amount { font-family: 'JetBrains Mono', monospace; font-size: 44px; font-weight: 800; letter-spacing: -0.03em; line-height: 1; margin-bottom: 6px; }
      .lp-price-mo { font-size: 16px; font-weight: 500; color: #71717a; }
      .lp-price-sub { font-size: 13px; color: #71717a; margin-bottom: 22px; }
      .lp-price-list { list-style: none; padding: 0; margin: 0 0 24px; display: flex; flex-direction: column; gap: 10px; }
      .lp-price-list li { display: flex; align-items: flex-start; gap: 8px; font-size: 14px; color: #d4d4d8; line-height: 1.4; }
      .lp-price-list svg { color: #10d9a0; flex-shrink: 0; margin-top: 4px; }

      /* === FAQ === */
      .lp-faq { display: flex; flex-direction: column; gap: 8px; margin-top: 30px; }
      .lp-faq-item { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; overflow: hidden; transition: all 0.2s ease; }
      .lp-faq-item.lp-open { border-color: rgba(16, 217, 160, 0.2); }
      .lp-faq-q { width: 100%; padding: 18px 20px; display: flex; justify-content: space-between; align-items: center; gap: 12px; font-size: 15px; font-weight: 600; text-align: left; letter-spacing: -0.01em; }
      .lp-faq-chev { transition: transform 0.2s ease; color: #a1a1aa; flex-shrink: 0; }
      .lp-faq-item.lp-open .lp-faq-chev { transform: rotate(180deg); color: #10d9a0; }
      .lp-faq-a { padding: 0 20px; max-height: 0; overflow: hidden; font-size: 14px; color: #a1a1aa; line-height: 1.6; transition: all 0.3s ease; }
      .lp-faq-item.lp-open .lp-faq-a { padding: 0 20px 20px; max-height: 400px; }

      /* === CTA === */
      .lp-cta-section { padding: 60px 0 100px; }
      .lp-cta-card { padding: 60px 30px; background: linear-gradient(140deg, rgba(16, 217, 160, 0.08), rgba(16, 217, 160, 0.02)); border: 1px solid rgba(16, 217, 160, 0.2); border-radius: 24px; text-align: center; position: relative; overflow: hidden; }
      .lp-cta-card::before { content: ''; position: absolute; top: -50%; left: 50%; transform: translateX(-50%); width: 600px; height: 600px; background: radial-gradient(circle, rgba(16, 217, 160, 0.2), transparent 60%); filter: blur(60px); pointer-events: none; }
      .lp-cta-card > * { position: relative; }
      .lp-cta-title { font-size: clamp(28px, 4.5vw, 44px); font-weight: 800; letter-spacing: -0.025em; line-height: 1.15; margin-bottom: 14px; }
      .lp-cta-sub { font-size: 16px; color: #a1a1aa; margin-bottom: 28px; max-width: 500px; margin-left: auto; margin-right: auto; }

      /* === FOOTER === */
      .lp-footer { padding: 40px 0; border-top: 1px solid rgba(255,255,255,0.06); background: rgba(0,0,0,0.2); }
      .lp-foot-row { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
      .lp-foot-links { display: flex; gap: 22px; font-size: 13px; color: #a1a1aa; font-weight: 500; }
      .lp-foot-links a:hover { color: #f4f4f5; }
      .lp-foot-bottom { font-size: 12px; color: #52525b; }

      /* === MODAL === */
      .lp-modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); z-index: 100; animation: lp-fade 0.2s ease; }
      .lp-modal { position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%); width: calc(100% - 32px); max-width: 420px; padding: 32px 28px; background: #0a1d17; border: 1px solid rgba(16, 217, 160, 0.25); border-radius: 22px; box-shadow: 0 40px 100px rgba(0,0,0,0.6), 0 0 60px rgba(16, 217, 160, 0.15); z-index: 101; animation: lp-modal-in 0.3s cubic-bezier(0.2, 0.9, 0.3, 1); text-align: center; }
      @keyframes lp-fade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes lp-modal-in { from { opacity: 0; transform: translate(-50%, -45%); } to { opacity: 1; transform: translate(-50%, -50%); } }
      .lp-modal-close { position: absolute; top: 14px; right: 16px; width: 28px; height: 28px; border-radius: 8px; color: #71717a; font-size: 20px; line-height: 1; display: grid; place-items: center; }
      .lp-modal-close:hover { background: rgba(255,255,255,0.05); color: #f4f4f5; }
      .lp-modal-icon { width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg, rgba(16, 217, 160, 0.2), rgba(16, 217, 160, 0.05)); border: 1px solid rgba(16, 217, 160, 0.3); color: #10d9a0; display: grid; place-items: center; margin: 0 auto 16px; }
      .lp-modal-icon-ok { background: #10d9a0; color: #05120e; border-color: #10d9a0; }
      .lp-modal-title { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 8px; }
      .lp-modal-sub { font-size: 14px; color: #a1a1aa; line-height: 1.55; margin-bottom: 22px; }
      .lp-form { display: flex; flex-direction: column; gap: 10px; }
      .lp-input { width: 100%; padding: 13px 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 11px; color: #f4f4f5; font-size: 15px; font-family: inherit; transition: all 0.15s ease; }
      .lp-input:focus { outline: none; border-color: #10d9a0; box-shadow: 0 0 0 3px rgba(16, 217, 160, 0.15); }
      .lp-modal-fine { display: block; font-size: 11px; color: #52525b; margin-top: 14px; }
    `}</style>
  );
}
