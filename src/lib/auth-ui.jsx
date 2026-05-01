import React, { useState } from 'react';
import {
  Mail, Lock, User, ArrowRight, Check, AlertCircle, X,
  LogOut, Cloud, CloudOff, Sparkles, Loader
} from 'lucide-react';
import { useAuth } from './auth.jsx';

// ============================================================
// AUTH SHEET — sign in / sign up modal
// Triggered from a "Sign in" CTA in Settings or onboarding.
// ============================================================
export function AuthSheet({ open, onClose, defaultMode = 'signin', onSuccess }) {
  const [mode, setMode] = useState(defaultMode); // 'signin' | 'signup' | 'magic' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  const auth = useAuth();

  React.useEffect(() => {
    if (!open) {
      setMode(defaultMode); setEmail(''); setPassword(''); setName('');
      setError(null); setInfo(null); setLoading(false);
    }
  }, [open, defaultMode]);

  if (!open) return null;

  const handle = async (e) => {
    e?.preventDefault();
    setError(null);
    setInfo(null);

    if (!auth.isSupabaseConfigured) {
      setError('Accounts are not yet configured for this deployment. Anonymous mode still works.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        if (!email || !password) { setError('Email and password required'); setLoading(false); return; }
        const { error } = await auth.signIn({ email, password });
        if (error) { setError(error.message); setLoading(false); return; }
        onSuccess?.();
        onClose();
      }
      else if (mode === 'signup') {
        if (!email || !password || !name) { setError('All fields required'); setLoading(false); return; }
        if (password.length < 8) { setError('Password must be at least 8 characters'); setLoading(false); return; }
        const { error, data } = await auth.signUp({ email, password, name });
        if (error) { setError(error.message); setLoading(false); return; }
        // Supabase may or may not require email confirmation depending on project settings
        if (data?.session) {
          onSuccess?.();
          onClose();
        } else {
          setInfo('Account created. Check your email to confirm, then sign in.');
          setMode('signin');
        }
      }
      else if (mode === 'magic') {
        if (!email) { setError('Email required'); setLoading(false); return; }
        const { error } = await auth.signInWithMagicLink(email);
        if (error) { setError(error.message); setLoading(false); return; }
        setInfo("Magic link sent. Check your email — the link signs you in.");
      }
      else if (mode === 'reset') {
        if (!email) { setError('Email required'); setLoading(false); return; }
        const { error } = await auth.sendPasswordReset(email);
        if (error) { setError(error.message); setLoading(false); return; }
        setInfo('Password reset email sent.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-bg" onClick={onClose} />
      <div className="auth-modal">
        <button className="auth-close" onClick={onClose} aria-label="Close"><X size={18} /></button>

        <div className="auth-icon">
          {mode === 'signup' ? <Sparkles size={20} /> : <Cloud size={20} />}
        </div>

        <h2 className="auth-title">
          {mode === 'signin' && 'Welcome back'}
          {mode === 'signup' && 'Create your account'}
          {mode === 'magic' && 'Sign in with magic link'}
          {mode === 'reset' && 'Reset your password'}
        </h2>

        <p className="auth-sub">
          {mode === 'signin' && 'Sign in to sync your trades across devices.'}
          {mode === 'signup' && 'Get cloud sync, never lose your data, use the same journal everywhere.'}
          {mode === 'magic' && "We'll email you a link that signs you in instantly."}
          {mode === 'reset' && "We'll send a reset link to your email."}
        </p>

        <form onSubmit={handle} className="auth-form">
          {mode === 'signup' && (
            <label className="auth-field">
              <span><User size={12} /> Your name</span>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Alvin" autoFocus />
            </label>
          )}

          <label className="auth-field">
            <span><Mail size={12} /> Email</span>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoFocus={mode !== 'signup'}
              autoComplete={mode === 'signin' ? 'username' : 'email'}
            />
          </label>

          {(mode === 'signin' || mode === 'signup') && (
            <label className="auth-field">
              <span><Lock size={12} /> Password</span>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                minLength={8}
              />
            </label>
          )}

          {error && (
            <div className="auth-msg auth-err">
              <AlertCircle size={13} />
              <span>{error}</span>
            </div>
          )}
          {info && (
            <div className="auth-msg auth-info">
              <Check size={13} />
              <span>{info}</span>
            </div>
          )}

          <button type="submit" className="auth-btn auth-btn-primary" disabled={loading}>
            {loading ? <Loader size={14} className="auth-spin" /> : (
              <>
                {mode === 'signin' && <>Sign in <ArrowRight size={14} /></>}
                {mode === 'signup' && <>Create account <ArrowRight size={14} /></>}
                {mode === 'magic' && <>Send magic link <ArrowRight size={14} /></>}
                {mode === 'reset' && <>Send reset link <ArrowRight size={14} /></>}
              </>
            )}
          </button>
        </form>

        <div className="auth-alt">
          {mode === 'signin' && (
            <>
              <button className="auth-link" onClick={() => setMode('magic')}>Use a magic link instead</button>
              <span className="auth-sep">·</span>
              <button className="auth-link" onClick={() => setMode('reset')}>Forgot password</button>
            </>
          )}
          {mode === 'magic' && (
            <button className="auth-link" onClick={() => setMode('signin')}>Use password instead</button>
          )}
          {mode === 'reset' && (
            <button className="auth-link" onClick={() => setMode('signin')}>Back to sign in</button>
          )}
        </div>

        <div className="auth-footer">
          {mode === 'signin' || mode === 'magic' || mode === 'reset' ? (
            <>Don't have an account? <button className="auth-link" onClick={() => setMode('signup')}>Create one</button></>
          ) : (
            <>Already have one? <button className="auth-link" onClick={() => setMode('signin')}>Sign in</button></>
          )}
        </div>

        <p className="auth-fine">
          By creating an account you agree that your trade data is stored on our Supabase servers (eu-west-2).
          You can export or delete your data anytime.
        </p>
      </div>

      <AuthStyles />
    </>
  );
}

// ============================================================
// ACCOUNT BANNER — shown in Settings to invite signup
// ============================================================
export function AccountBanner({ onSignIn }) {
  const auth = useAuth();
  if (!auth.isSupabaseConfigured) return null;
  if (auth.isAuthenticated) return null;

  return (
    <button className="acct-banner" onClick={onSignIn}>
      <div className="acct-banner-icon"><Cloud size={20} /></div>
      <div className="acct-banner-text">
        <div className="acct-banner-title">Sync your data</div>
        <div className="acct-banner-sub">Sign in to use Traders Space on phone + laptop. Free.</div>
      </div>
      <ArrowRight size={16} className="acct-banner-arrow" />
      <AuthStyles />
    </button>
  );
}

// ============================================================
// ACCOUNT CARD — shown in Settings when signed in
// ============================================================
export function AccountCard({ onSignOut, onMigrate, migrating }) {
  const auth = useAuth();
  if (!auth.user) return null;
  return (
    <div className="acct-card">
      <div className="acct-card-row">
        <div className="acct-card-icon"><Cloud size={16} /></div>
        <div className="acct-card-info">
          <div className="acct-card-email">{auth.user.email}</div>
          <div className="acct-card-status"><Check size={11} /> Synced to cloud</div>
        </div>
      </div>
      <button className="acct-card-action" onClick={onSignOut}>
        <LogOut size={13} /> Sign out
      </button>
      <AuthStyles />
    </div>
  );
}

// ============================================================
// MIGRATION SHEET — first-time sign-in: import local data?
// ============================================================
export function MigrationSheet({ open, onClose, onConfirm, localCounts }) {
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState(null);

  if (!open) return null;

  const total = (localCounts?.trades || 0) + (localCounts?.confluences || 0) + (localCounts?.journal || 0);

  const start = async () => {
    setMigrating(true);
    await onConfirm((p) => setProgress(p));
  };

  return (
    <>
      <div className="auth-bg" onClick={migrating ? undefined : onClose} />
      <div className="auth-modal">
        {!migrating && (
          <button className="auth-close" onClick={onClose}><X size={18} /></button>
        )}

        <div className="auth-icon"><Cloud size={20} /></div>

        {!migrating ? (
          <>
            <h2 className="auth-title">Import your existing data?</h2>
            <p className="auth-sub">
              We found data on this device that's not in your account yet:
            </p>

            <div className="migrate-list">
              {localCounts?.trades > 0 && <div className="migrate-row"><strong>{localCounts.trades}</strong> trade{localCounts.trades !== 1 ? 's' : ''}</div>}
              {localCounts?.confluences > 0 && <div className="migrate-row"><strong>{localCounts.confluences}</strong> confluence{localCounts.confluences !== 1 ? 's' : ''}</div>}
              {localCounts?.journal > 0 && <div className="migrate-row"><strong>{localCounts.journal}</strong> journal entr{localCounts.journal !== 1 ? 'ies' : 'y'}</div>}
              {localCounts?.profile && <div className="migrate-row">your profile settings</div>}
            </div>

            <div className="auth-msg auth-info">
              <Check size={13} />
              <span>Importing copies your local data into your account. Your local data is never deleted by import.</span>
            </div>

            <button className="auth-btn auth-btn-primary" onClick={start}>
              Import {total > 0 ? `${total} item${total !== 1 ? 's' : ''}` : 'data'} <ArrowRight size={14} />
            </button>
            <button className="auth-link auth-skip" onClick={onClose}>
              Skip for now (start fresh)
            </button>
          </>
        ) : (
          <>
            <h2 className="auth-title">Importing…</h2>
            <p className="auth-sub">{labelFor(progress?.step)}</p>
            <div className="migrate-progress">
              <div className="migrate-progress-bar">
                <div className="migrate-progress-fill" style={{
                  width: progress?.step === 'done' ? '100%'
                    : progress?.step === 'journal' ? '85%'
                    : progress?.step === 'trades' ? '60%'
                    : progress?.step === 'confluences' ? '30%'
                    : '15%'
                }} />
              </div>
            </div>
            {progress?.step === 'done' && (
              <button className="auth-btn auth-btn-primary" onClick={onClose}>
                Done <Check size={14} />
              </button>
            )}
          </>
        )}

        <AuthStyles />
      </div>
    </>
  );
}
function labelFor(step) {
  switch (step) {
    case 'profile': return 'Copying profile…';
    case 'confluences': return 'Copying confluences…';
    case 'trades': return 'Copying trades…';
    case 'journal': return 'Copying journal entries…';
    case 'done': return 'All done. Welcome back.';
    default: return 'Starting import…';
  }
}

// ============================================================
// STYLES (local — namespaced with `auth-` and `acct-` and `migrate-`)
// ============================================================
function AuthStyles() {
  return (
    <style>{`
      .auth-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.78); backdrop-filter: blur(8px); z-index: 200; animation: auth-fade 0.2s ease; }
      .auth-modal { position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%); width: calc(100% - 32px); max-width: 420px; max-height: 92vh; overflow-y: auto; padding: 28px 24px; background: var(--panel-solid, #0a1d17); border: 1px solid var(--accent-border, rgba(16,217,160,0.25)); border-radius: 22px; box-shadow: 0 40px 100px rgba(0,0,0,0.6); z-index: 201; animation: auth-in 0.25s cubic-bezier(0.2, 0.9, 0.3, 1); text-align: center; color: var(--fg, #f4f4f5); }
      @keyframes auth-fade { from { opacity: 0; } to { opacity: 1; } }
      @keyframes auth-in { from { opacity: 0; transform: translate(-50%, -45%); } to { opacity: 1; transform: translate(-50%, -50%); } }

      .auth-close { position: absolute; top: 12px; right: 14px; width: 30px; height: 30px; border-radius: 9px; background: transparent; border: none; color: var(--muted, #71717a); display: grid; place-items: center; cursor: pointer; }
      .auth-close:hover { background: rgba(255,255,255,0.05); color: var(--fg, #f4f4f5); }

      .auth-icon { width: 48px; height: 48px; border-radius: 14px; background: linear-gradient(135deg, rgba(16,217,160,0.2), rgba(16,217,160,0.06)); border: 1px solid rgba(16,217,160,0.3); color: var(--accent, #10d9a0); display: grid; place-items: center; margin: 0 auto 16px; }

      .auth-title { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 6px; }
      .auth-sub { font-size: 14px; color: var(--muted, #a1a1aa); line-height: 1.55; margin: 0 0 20px; }

      .auth-form { display: flex; flex-direction: column; gap: 12px; text-align: left; }
      .auth-field { display: flex; flex-direction: column; gap: 5px; }
      .auth-field > span { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted, #71717a); font-weight: 600; }
      .auth-field input { width: 100%; padding: 12px 14px; background: rgba(255,255,255,0.03); border: 1px solid var(--border, rgba(255,255,255,0.1)); border-radius: 11px; color: var(--fg, #f4f4f5); font-size: 15px; font-family: inherit; transition: all 0.15s ease; }
      .auth-field input:focus { outline: none; border-color: var(--accent, #10d9a0); box-shadow: 0 0 0 3px rgba(16,217,160,0.15); }

      .auth-msg { display: flex; align-items: flex-start; gap: 7px; padding: 10px 12px; border-radius: 9px; font-size: 12px; line-height: 1.4; text-align: left; }
      .auth-msg svg { flex-shrink: 0; margin-top: 1px; }
      .auth-err { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: var(--loss, #ef4444); }
      .auth-info { background: rgba(16,217,160,0.1); border: 1px solid rgba(16,217,160,0.3); color: var(--accent, #10d9a0); }

      .auth-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 12px 18px; border-radius: 11px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.15s ease; border: none; font-family: inherit; }
      .auth-btn-primary { background: var(--accent, #10d9a0); color: var(--bg, #05120e); box-shadow: 0 4px 20px rgba(16,217,160,0.3); margin-top: 4px; }
      .auth-btn-primary:hover:not(:disabled) { transform: translateY(-1px); }
      .auth-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
      .auth-spin { animation: auth-spin 0.8s linear infinite; }
      @keyframes auth-spin { to { transform: rotate(360deg); } }

      .auth-alt { display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 14px; flex-wrap: wrap; font-size: 12px; }
      .auth-sep { color: var(--muted, #52525b); }
      .auth-link { background: none; border: none; color: var(--accent, #10d9a0); font-weight: 600; cursor: pointer; font-size: 12px; padding: 0; font-family: inherit; }
      .auth-link:hover { text-decoration: underline; }

      .auth-footer { margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--border, rgba(255,255,255,0.08)); font-size: 13px; color: var(--muted, #a1a1aa); }
      .auth-skip { margin-top: 12px; }

      .auth-fine { font-size: 10px; color: var(--muted, #52525b); margin-top: 18px; line-height: 1.5; }

      /* ==== ACCOUNT BANNER ==== */
      .acct-banner { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: linear-gradient(140deg, rgba(16,217,160,0.1), rgba(16,217,160,0.02)); border: 1px solid rgba(16,217,160,0.25); border-radius: 14px; cursor: pointer; transition: all 0.2s ease; backdrop-filter: blur(12px); width: 100%; text-align: left; color: inherit; font-family: inherit; }
      .acct-banner:hover { border-color: rgba(16,217,160,0.45); transform: translateY(-1px); }
      .acct-banner-icon { width: 38px; height: 38px; border-radius: 11px; background: var(--accent, #10d9a0); color: var(--bg, #05120e); display: grid; place-items: center; flex-shrink: 0; box-shadow: 0 4px 16px rgba(16,217,160,0.35); }
      .acct-banner-text { flex: 1; min-width: 0; }
      .acct-banner-title { font-size: 14px; font-weight: 700; letter-spacing: -0.01em; }
      .acct-banner-sub { font-size: 12px; color: var(--muted, #a1a1aa); margin-top: 2px; }
      .acct-banner-arrow { color: var(--accent, #10d9a0); flex-shrink: 0; }

      /* ==== ACCOUNT CARD (signed in) ==== */
      .acct-card { padding: 14px 16px; background: var(--panel, rgba(255,255,255,0.02)); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 14px; }
      .acct-card-row { display: flex; align-items: center; gap: 10px; }
      .acct-card-icon { width: 32px; height: 32px; border-radius: 9px; background: rgba(16,217,160,0.12); color: var(--accent, #10d9a0); display: grid; place-items: center; flex-shrink: 0; }
      .acct-card-info { flex: 1; min-width: 0; }
      .acct-card-email { font-size: 13px; font-weight: 600; word-break: break-all; }
      .acct-card-status { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; color: var(--accent, #10d9a0); font-weight: 600; margin-top: 2px; }
      .acct-card-action { display: inline-flex; align-items: center; gap: 5px; padding: 7px 11px; margin-top: 12px; background: transparent; border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 9px; color: var(--muted, #a1a1aa); font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; }
      .acct-card-action:hover { color: var(--loss, #ef4444); border-color: rgba(239,68,68,0.3); }

      /* ==== MIGRATION ==== */
      .migrate-list { display: flex; flex-direction: column; gap: 8px; padding: 14px; background: var(--panel, rgba(255,255,255,0.02)); border: 1px solid var(--border, rgba(255,255,255,0.08)); border-radius: 11px; margin-bottom: 14px; text-align: left; }
      .migrate-row { font-size: 13px; color: var(--fg, #f4f4f5); }
      .migrate-row strong { font-family: 'JetBrains Mono', monospace; color: var(--accent, #10d9a0); margin-right: 4px; }
      .migrate-progress { padding: 16px 0; }
      .migrate-progress-bar { height: 4px; background: var(--border, rgba(255,255,255,0.08)); border-radius: 999px; overflow: hidden; }
      .migrate-progress-fill { height: 100%; background: var(--accent, #10d9a0); box-shadow: 0 0 12px rgba(16,217,160,0.5); transition: width 0.4s ease; }
    `}</style>
  );
}
