import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, ScatterChart, Scatter } from 'recharts';
import {
  TrendingUp, TrendingDown, Plus, Calendar as CalIcon, Settings as SettingsIcon,
  Home, List, X, Check, Target, Flame, Award, DollarSign, Clock, ChevronLeft,
  ChevronRight, Trash2, Camera, Download, Zap, Palette, Star, AlertCircle,
  Activity, LogIn, ArrowUpRight, ArrowDownRight, Hash, Image as ImageIcon,
  Sparkles, Play, Pause, Layers, BookOpen, Filter, Search, RefreshCw,
  Wifi, WifiOff, Bitcoin, Landmark, BarChart3, Crown, Eye, EyeOff, Lock, Brain
} from 'lucide-react';

// ============================================================
// THEME SYSTEM
// ============================================================
const THEMES = {
  blue:   { name: 'Cobalt',  mode: 'dark',  accent: '#3b82f6', glow: '59,130,246',  bg: '#070b14', panel: '#0d1423' },
  green:  { name: 'Matrix',  mode: 'dark',  accent: '#10d9a0', glow: '16,217,160',  bg: '#05120e', panel: '#0a1d17' },
  yellow: { name: 'Solar',   mode: 'dark',  accent: '#fbbf24', glow: '251,191,36',  bg: '#0f0b00', panel: '#1a1403' },
  pink:   { name: 'Neon',    mode: 'dark',  accent: '#f472b6', glow: '244,114,182', bg: '#10060f', panel: '#1d0c1a' },
  purple: { name: 'Royal',   mode: 'dark',  accent: '#a78bfa', glow: '167,139,250', bg: '#0a0614', panel: '#150d24' },
  black:  { name: 'Stealth', mode: 'dark',  accent: '#e5e7eb', glow: '229,231,235', bg: '#030303', panel: '#0c0c0c' },
  light:  { name: 'Day',     mode: 'light', accent: '#0f172a', glow: '15,23,42',    bg: '#f5f5f4', panel: '#ffffff' },
};

// ============================================================
// MARKETS — live price data
// ============================================================
const CRYPTO_MARKETS = [
  { symbol: 'BTCUSDT',  display: 'BTCUSD',   name: 'Bitcoin',     decimals: 2 },
  { symbol: 'ETHUSDT',  display: 'ETHUSD',   name: 'Ethereum',    decimals: 2 },
  { symbol: 'SOLUSDT',  display: 'SOLUSD',   name: 'Solana',      decimals: 2 },
  { symbol: 'BNBUSDT',  display: 'BNBUSD',   name: 'BNB',         decimals: 2 },
  { symbol: 'XRPUSDT',  display: 'XRPUSD',   name: 'Ripple',      decimals: 4 },
  { symbol: 'DOGEUSDT', display: 'DOGEUSD',  name: 'Dogecoin',    decimals: 5 },
  { symbol: 'ADAUSDT',  display: 'ADAUSD',   name: 'Cardano',     decimals: 4 },
  { symbol: 'AVAXUSDT', display: 'AVAXUSD',  name: 'Avalanche',   decimals: 3 },
  { symbol: 'LINKUSDT', display: 'LINKUSD',  name: 'Chainlink',   decimals: 3 },
  { symbol: 'DOTUSDT',  display: 'DOTUSD',   name: 'Polkadot',    decimals: 3 },
  { symbol: 'TRXUSDT',  display: 'TRXUSD',   name: 'Tron',        decimals: 5 },
  { symbol: 'LTCUSDT',  display: 'LTCUSD',   name: 'Litecoin',    decimals: 2 },
  { symbol: 'MATICUSDT',display: 'MATICUSD', name: 'Polygon',     decimals: 4 },
  { symbol: 'SUIUSDT',  display: 'SUIUSD',   name: 'Sui',         decimals: 4 },
  { symbol: 'PAXGUSDT', display: 'XAUUSD*',  name: 'Gold (PAXG)', decimals: 2 },
];

const FOREX_MARKETS = [
  { base: 'EUR', quote: 'USD', display: 'EURUSD', name: 'Euro / US Dollar',       decimals: 5 },
  { base: 'GBP', quote: 'USD', display: 'GBPUSD', name: 'Pound / US Dollar',      decimals: 5 },
  { base: 'USD', quote: 'JPY', display: 'USDJPY', name: 'US Dollar / Yen',        decimals: 3 },
  { base: 'USD', quote: 'CHF', display: 'USDCHF', name: 'US Dollar / Swiss',      decimals: 5 },
  { base: 'AUD', quote: 'USD', display: 'AUDUSD', name: 'Aussie / US Dollar',     decimals: 5 },
  { base: 'USD', quote: 'CAD', display: 'USDCAD', name: 'US Dollar / Canadian',   decimals: 5 },
  { base: 'NZD', quote: 'USD', display: 'NZDUSD', name: 'Kiwi / US Dollar',       decimals: 5 },
  { base: 'EUR', quote: 'JPY', display: 'EURJPY', name: 'Euro / Yen',             decimals: 3 },
  { base: 'GBP', quote: 'JPY', display: 'GBPJPY', name: 'Pound / Yen',            decimals: 3 },
  { base: 'EUR', quote: 'GBP', display: 'EURGBP', name: 'Euro / Pound',           decimals: 5 },
  { base: 'AUD', quote: 'JPY', display: 'AUDJPY', name: 'Aussie / Yen',           decimals: 3 },
  { base: 'USD', quote: 'MXN', display: 'USDMXN', name: 'US Dollar / Peso',       decimals: 4 },
  { base: 'USD', quote: 'ZAR', display: 'USDZAR', name: 'US Dollar / Rand',       decimals: 4 },
];

// default shown on dashboard
const DEFAULT_DASHBOARD_MARKETS = ['BTCUSD', 'ETHUSD', 'EURUSD', 'XAUUSD*'];

async function fetchCryptoPrices() {
  // CoinGecko primary (works globally, including Nigeria where Binance is often blocked)
  // Binance fallback if CoinGecko fails or is rate-limited
  try {
    return await fetchCryptoCoinGecko();
  } catch (e) {
    console.warn('CoinGecko failed, trying Binance:', e.message);
    return await fetchCryptoBinance();
  }
}

const COINGECKO_IDS = {
  BTCUSDT: 'bitcoin',       ETHUSDT: 'ethereum',      SOLUSDT: 'solana',
  BNBUSDT: 'binancecoin',   XRPUSDT: 'ripple',        DOGEUSDT: 'dogecoin',
  ADAUSDT: 'cardano',       AVAXUSDT: 'avalanche-2',  LINKUSDT: 'chainlink',
  DOTUSDT: 'polkadot',      TRXUSDT: 'tron',          LTCUSDT: 'litecoin',
  MATICUSDT: 'matic-network', SUIUSDT: 'sui',         PAXGUSDT: 'pax-gold',
};

async function fetchCryptoCoinGecko() {
  const ids = Object.values(COINGECKO_IDS).join(',');
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko returned ${res.status}`);
  const data = await res.json();
  return CRYPTO_MARKETS.map(m => {
    const geckoId = COINGECKO_IDS[m.symbol];
    const d = data.find(item => item.id === geckoId);
    if (!d) return null;
    return {
      symbol: m.display,
      name: m.name,
      price: d.current_price,
      change: d.price_change_percentage_24h || 0,
      high: d.high_24h,
      low: d.low_24h,
      volume: d.total_volume,
      decimals: m.decimals,
      category: 'crypto',
      source: 'CoinGecko · real-time',
      timestamp: Date.now(),
    };
  }).filter(Boolean);
}

async function fetchCryptoBinance() {
  const symbols = CRYPTO_MARKETS.map(s => s.symbol);
  const params = encodeURIComponent(JSON.stringify(symbols));
  const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${params}`);
  if (!res.ok) throw new Error(`Binance returned ${res.status}`);
  const data = await res.json();
  return data.map(d => {
    const m = CRYPTO_MARKETS.find(s => s.symbol === d.symbol);
    return {
      symbol: m.display,
      name: m.name,
      price: parseFloat(d.lastPrice),
      change: parseFloat(d.priceChangePercent),
      high: parseFloat(d.highPrice),
      low: parseFloat(d.lowPrice),
      volume: parseFloat(d.quoteVolume),
      decimals: m.decimals,
      category: 'crypto',
      source: 'Binance · real-time',
      timestamp: Date.now(),
    };
  });
}

async function fetchForexPrices() {
  // today's rates (ECB daily)
  const pad = (n) => String(n).padStart(2, '0');
  const dateKey = (dt) => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 4); // 4 days back to safely hit a business day
  const [todayRes, pastRes] = await Promise.all([
    fetch('https://api.frankfurter.dev/v1/latest?base=USD'),
    fetch(`https://api.frankfurter.dev/v1/${dateKey(pastDate)}?base=USD`),
  ]);
  if (!todayRes.ok || !pastRes.ok) throw new Error('Forex feed unavailable');
  const today = await todayRes.json();
  const past = await pastRes.json();

  const compute = (pair) => {
    const { base, quote, display, name, decimals } = pair;
    let priceNow, pricePast;
    if (base === 'USD') {
      priceNow = today.rates[quote];
      pricePast = past.rates[quote];
    } else if (quote === 'USD') {
      priceNow = today.rates[base] ? 1 / today.rates[base] : null;
      pricePast = past.rates[base] ? 1 / past.rates[base] : null;
    } else {
      priceNow = today.rates[base] && today.rates[quote] ? today.rates[quote] / today.rates[base] : null;
      pricePast = past.rates[base] && past.rates[quote] ? past.rates[quote] / past.rates[base] : null;
    }
    const change = pricePast && priceNow ? ((priceNow - pricePast) / pricePast) * 100 : 0;
    return {
      symbol: display,
      name,
      price: priceNow,
      change,
      decimals,
      category: 'forex',
      source: `ECB · ${today.date}`,
      timestamp: Date.now(),
    };
  };
  return FOREX_MARKETS.map(compute).filter(m => m.price);
}

function useMarketData() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [crypto, forex] = await Promise.allSettled([
        fetchCryptoPrices(),
        fetchForexPrices(),
      ]);
      const all = [];
      const failed = [];
      if (crypto.status === 'fulfilled') all.push(...crypto.value);
      else { failed.push('crypto'); console.warn('Crypto fetch failed:', crypto.reason); }
      if (forex.status === 'fulfilled') all.push(...forex.value);
      else { failed.push('forex'); console.warn('Forex fetch failed:', forex.reason); }

      if (all.length === 0) {
        setError('All market feeds unreachable. Your ISP may be blocking them — try a VPN or mobile data.');
      } else {
        setMarkets(all);
        setLastFetch(Date.now());
        if (failed.length) setError(`${failed.join(' & ')} feed unavailable — showing what we got.`);
      }
    } catch (e) {
      setError(e.message || 'Failed to load markets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // auto-refresh every 30s
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  return { markets, loading, error, lastFetch, refresh: load };
}

function fmtPrice(price, decimals = 2) {
  if (price === null || price === undefined || isNaN(price)) return '—';
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return price.toFixed(decimals);
}


// ============================================================
const KEY = {
  profile: 'tlp:profile',
  confluences: 'tlp:confluences',
  trades: 'tlp:trades',
  screenshot: (id) => `tlp:shot:${id}`,
};

async function storageGet(key, fallback = null) {
  try {
    const res = await window.storage.get(key);
    return res ? JSON.parse(res.value) : fallback;
  } catch { return fallback; }
}
async function storageSet(key, value) {
  try { await window.storage.set(key, JSON.stringify(value)); return true; }
  catch { return false; }
}
async function storageDel(key) {
  try { await window.storage.delete(key); } catch {}
}

// ============================================================
// FORMATTERS
// ============================================================
const fmtMoney = (n, compact = false) => {
  if (n === null || n === undefined || isNaN(n)) return '$0.00';
  const abs = Math.abs(n);
  if (compact && abs >= 1000) {
    if (abs >= 1e6) return `${n < 0 ? '-' : ''}$${(abs / 1e6).toFixed(2)}M`;
    return `${n < 0 ? '-' : ''}$${(abs / 1e3).toFixed(2)}K`;
  }
  return `${n < 0 ? '-' : ''}$${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const fmtPct = (n, d = 1) => `${n >= 0 ? '' : ''}${(n || 0).toFixed(d)}%`;
const fmtDuration = (mins) => {
  if (!mins || mins < 1) return '<1m';
  if (mins < 60) return `${Math.round(mins)}m`;
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  if (h < 24) return m ? `${h}h ${m}m` : `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h`;
};
const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const fmtTime = (iso) => new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const ymd = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};

// ============================================================
// ANALYTICS
// ============================================================
function computeStats(trades, startingBalance) {
  const sorted = [...trades].sort((a, b) => new Date(a.entryAt) - new Date(b.entryAt));
  const total = sorted.length;
  const wins = sorted.filter(t => t.pnl > 0);
  const losses = sorted.filter(t => t.pnl < 0);
  const totalPnl = sorted.reduce((s, t) => s + (t.pnl || 0), 0);
  const winRate = total ? (wins.length / total) * 100 : 0;
  const avgWin = wins.length ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
  const avgLoss = losses.length ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length) : 0;
  const rr = avgLoss ? avgWin / avgLoss : 0;
  const expectancy = total
    ? ((wins.length / total) * avgWin) - ((losses.length / total) * avgLoss)
    : 0;

  // equity curve
  let equity = startingBalance;
  let peak = startingBalance;
  let maxDD = 0;
  const curve = [{ idx: 0, equity: startingBalance, date: sorted[0]?.entryAt || new Date().toISOString() }];
  sorted.forEach((t, i) => {
    equity += (t.pnl || 0);
    if (equity > peak) peak = equity;
    const dd = peak > 0 ? ((peak - equity) / peak) * 100 : 0;
    if (dd > maxDD) maxDD = dd;
    curve.push({ idx: i + 1, equity, date: t.exitAt || t.entryAt });
  });

  // streaks
  let curStreak = 0, curType = null, bestWin = 0, worstLoss = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const w = sorted[i].pnl > 0;
    if (curType === null) { curType = w ? 'W' : 'L'; curStreak = 1; }
    else if ((w && curType === 'W') || (!w && curType === 'L')) curStreak++;
    else break;
  }
  sorted.forEach(t => {
    if (t.pnl > bestWin) bestWin = t.pnl;
    if (t.pnl < worstLoss) worstLoss = t.pnl;
  });

  // best/worst day
  const byDay = {};
  sorted.forEach(t => {
    const d = ymd(t.entryAt);
    byDay[d] = (byDay[d] || 0) + (t.pnl || 0);
  });
  const dayEntries = Object.entries(byDay);
  const bestDay = dayEntries.reduce((b, c) => !b || c[1] > b[1] ? c : b, null);
  const worstDay = dayEntries.reduce((b, c) => !b || c[1] < b[1] ? c : b, null);

  // avg hold
  const avgHold = total
    ? sorted.reduce((s, t) => s + (t.durationMinutes || 0), 0) / total
    : 0;

  // discipline
  const disc = sorted.filter(t => t.discipline).map(t => t.discipline);
  const avgDiscipline = disc.length ? disc.reduce((s, d) => s + d, 0) / disc.length : 0;

  return {
    total, wins: wins.length, losses: losses.length, winRate,
    totalPnl, equity, avgWin, avgLoss, rr, expectancy,
    maxDD, peak, curve, curStreak, curType,
    bestWin, worstLoss, bestDay, worstDay, avgHold, avgDiscipline,
    pctGrowth: startingBalance ? (totalPnl / startingBalance) * 100 : 0,
  };
}

// ============================================================
// FONT & GLOBAL STYLES
// ============================================================
function useFonts() {
  useEffect(() => {
    if (document.getElementById('tlp-fonts')) return;
    const link = document.createElement('link');
    link.id = 'tlp-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&display=swap';
    document.head.appendChild(link);
  }, []);
}

// ============================================================
// IMAGE COMPRESSION
// ============================================================
async function compressImage(file, maxW = 1200, quality = 0.72) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ============================================================
// REUSABLE UI
// ============================================================
function GlassPanel({ children, className = '', style = {} }) {
  return (
    <div className={`tlp-glass ${className}`} style={style}>{children}</div>
  );
}

function StatChip({ label, value, sub, trend, icon: Icon, accent }) {
  const color = trend === 'up' ? 'var(--win)' : trend === 'down' ? 'var(--loss)' : 'var(--fg)';
  return (
    <GlassPanel className="tlp-stat">
      <div className="tlp-stat-head">
        <span className="tlp-stat-label">{label}</span>
        {Icon && <Icon size={14} style={{ color: accent ? 'var(--accent)' : 'var(--muted)' }} />}
      </div>
      <div className="tlp-stat-value" style={{ color }}>{value}</div>
      {sub && <div className="tlp-stat-sub">{sub}</div>}
    </GlassPanel>
  );
}

function Btn({ children, onClick, variant = 'primary', size = 'md', full, disabled, className = '', style = {}, type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`tlp-btn tlp-btn-${variant} tlp-btn-${size} ${full ? 'tlp-btn-full' : ''} ${className}`}
      style={style}
    >
      {children}
    </button>
  );
}

function Sheet({ open, onClose, children, title, footer }) {
  return (
    <>
      <div className={`tlp-backdrop ${open ? 'tlp-open' : ''}`} onClick={onClose} />
      <div className={`tlp-sheet ${open ? 'tlp-open' : ''}`}>
        <div className="tlp-sheet-drag" />
        {title && (
          <div className="tlp-sheet-head">
            <h3 className="tlp-sheet-title">{title}</h3>
            <button className="tlp-icon-btn" onClick={onClose}><X size={18} /></button>
          </div>
        )}
        <div className="tlp-sheet-body">{children}</div>
        {footer && <div className="tlp-sheet-foot">{footer}</div>}
      </div>
    </>
  );
}

function Toast({ toast, onDone }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => onDone(), 2800);
    return () => clearTimeout(t);
  }, [toast, onDone]);
  if (!toast) return null;
  return (
    <div className={`tlp-toast tlp-toast-${toast.type || 'info'}`}>
      {toast.type === 'success' && <Check size={16} />}
      {toast.type === 'error' && <AlertCircle size={16} />}
      <span>{toast.msg}</span>
    </div>
  );
}

// ============================================================
// ONBOARDING
// ============================================================
function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [welcome, setWelcome] = useState('King');
  const [balance, setBalance] = useState('10000');
  const [theme, setTheme] = useState('green');

  const finish = async () => {
    const profile = {
      name: name.trim() || 'Trader',
      welcomeMessage: welcome.trim() || name.trim() || 'Trader',
      startingBalance: parseFloat(balance) || 0,
      theme,
      confluenceCheckSeconds: 20,
      confluenceCheckEnabled: true,
      onboarded: true,
      createdAt: new Date().toISOString(),
    };
    await storageSet(KEY.profile, profile);
    // seed a few default confluences
    const seeds = [
      { id: crypto.randomUUID(), name: 'Break of Structure', note: 'Clear higher high or lower low confirming trend shift', active: true },
      { id: crypto.randomUUID(), name: 'Liquidity Sweep', note: 'Price taking out obvious highs/lows before reversing', active: true },
      { id: crypto.randomUUID(), name: 'Key Support / Resistance', note: 'Reaction at a well-tested level on higher timeframe', active: true },
      { id: crypto.randomUUID(), name: 'Trend Alignment', note: '15m bias matches 5m confirmation matches 1m entry', active: true },
      { id: crypto.randomUUID(), name: 'Clear Invalidation', note: 'Stop loss placed at a logical level, not a round number', active: true },
    ];
    await storageSet(KEY.confluences, seeds);
    await storageSet(KEY.trades, []);
    onDone(profile);
  };

  return (
    <div className="tlp-onboard">
      <div className="tlp-onboard-bg" />
      <div className="tlp-onboard-card">
        <div className="tlp-brand-mark">
          <Activity size={22} />
          <span>TRADE LOG PRO</span>
        </div>

        {step === 0 && (
          <div className="tlp-onboard-step">
            <h1 className="tlp-h1">Welcome, trader.</h1>
            <p className="tlp-sub">Let's set up your journal. This takes 20 seconds.</p>
            <label className="tlp-field">
              <span>Your name</span>
              <input className="tlp-input" autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Alvin" />
            </label>
            <label className="tlp-field">
              <span>Welcome message (what the app calls you)</span>
              <input className="tlp-input" value={welcome} onChange={e => setWelcome(e.target.value)} placeholder="King" />
              <small className="tlp-hint">Shown on app launch: "Welcome, {welcome || 'King'}"</small>
            </label>
            <Btn full onClick={() => name.trim() && setStep(1)} disabled={!name.trim()}>
              Continue <ChevronRight size={16} />
            </Btn>
          </div>
        )}

        {step === 1 && (
          <div className="tlp-onboard-step">
            <h1 className="tlp-h1">Starting balance</h1>
            <p className="tlp-sub">Every metric is calculated from here. You can change it later.</p>
            <label className="tlp-field">
              <span>Account starting balance (USD)</span>
              <div className="tlp-input-prefix">
                <span>$</span>
                <input className="tlp-input" type="number" value={balance} onChange={e => setBalance(e.target.value)} placeholder="10000" autoFocus />
              </div>
            </label>
            <div className="tlp-row">
              <Btn variant="ghost" onClick={() => setStep(0)}>Back</Btn>
              <Btn onClick={() => setStep(2)} disabled={!balance || parseFloat(balance) <= 0}>
                Continue <ChevronRight size={16} />
              </Btn>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="tlp-onboard-step">
            <h1 className="tlp-h1">Pick your vibe</h1>
            <p className="tlp-sub">Theme changes the whole app. Switch anytime.</p>
            <div className="tlp-theme-grid">
              {Object.entries(THEMES).map(([key, t]) => (
                <button key={key} onClick={() => setTheme(key)} className={`tlp-theme-swatch ${theme === key ? 'tlp-active' : ''}`}>
                  <div className="tlp-swatch-orb" style={{ background: t.accent, boxShadow: `0 0 24px rgba(${t.glow}, 0.6)` }} />
                  <span>{t.name}</span>
                </button>
              ))}
            </div>
            <div className="tlp-row">
              <Btn variant="ghost" onClick={() => setStep(1)}>Back</Btn>
              <Btn onClick={finish}>Enter the journal <Sparkles size={14} /></Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// INTRO ANIMATION
// ============================================================
function IntroAnimation({ profile, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="tlp-intro">
      <div className="tlp-intro-grid" />
      <div className="tlp-intro-glow" />
      <div className="tlp-intro-content">
        <div className="tlp-intro-brand">
          <div className="tlp-intro-mark">
            <Activity size={18} />
            <span>TRADE LOG PRO</span>
          </div>
        </div>
        <h1 className="tlp-intro-welcome">
          <span className="tlp-word tlp-delay-1">Welcome,</span>
          <span className="tlp-word tlp-delay-2 tlp-accent-text">{profile.welcomeMessage}.</span>
        </h1>
        <p className="tlp-intro-sub tlp-delay-3">Discipline. Process. Repetition.</p>
        <div className="tlp-intro-bar tlp-delay-4" />
      </div>
    </div>
  );
}

// ============================================================
// CONFLUENCE CHECK (pre-trade awareness)
// ============================================================
function ConfluenceCheckScreen({ confluences, seconds, onDone }) {
  const [left, setLeft] = useState(seconds);
  const [checked, setChecked] = useState({});
  const active = confluences.filter(c => c.active);

  useEffect(() => {
    if (left <= 0) return;
    const t = setInterval(() => setLeft(l => Math.max(0, l - 1)), 1000);
    return () => clearInterval(t);
  }, [left]);

  const pct = ((seconds - left) / seconds) * 100;
  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="tlp-check">
      <div className="tlp-check-bg" />
      <div className="tlp-check-inner">
        <div className="tlp-check-head">
          <div className="tlp-check-label">
            <Zap size={14} />
            <span>PRE-TRADE CHECK</span>
          </div>
          <button className="tlp-skip" onClick={onDone}>Skip →</button>
        </div>
        <h2 className="tlp-check-title">Have you confirmed your edge?</h2>
        <p className="tlp-check-sub">Tap what you've actually validated on the chart. {active.length} active confluences.</p>

        <div className="tlp-check-list">
          {active.length === 0 && (
            <div className="tlp-empty-sm">No active confluences. Add some in Setup to enable this check.</div>
          )}
          {active.map(c => (
            <label key={c.id} className={`tlp-check-item ${checked[c.id] ? 'tlp-checked' : ''}`}>
              <input type="checkbox" checked={!!checked[c.id]} onChange={e => setChecked(s => ({ ...s, [c.id]: e.target.checked }))} />
              <div className="tlp-check-box">{checked[c.id] && <Check size={14} />}</div>
              <div className="tlp-check-info">
                <div className="tlp-check-name">{c.name}</div>
                {c.note && <div className="tlp-check-note">{c.note}</div>}
              </div>
            </label>
          ))}
        </div>

        <div className="tlp-check-foot">
          <div className="tlp-countdown">
            <div className="tlp-countdown-track">
              <div className="tlp-countdown-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="tlp-countdown-num">{left}s</span>
          </div>
          <Btn full onClick={onDone}>
            {checkedCount === active.length && active.length > 0 ? 'All confirmed — enter the app' : 'Enter the app'}
            <ChevronRight size={16} />
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MARKET TICKER (dashboard preview)
// ============================================================
function MarketTicker({ markets, loading, error, lastFetch, onSeeAll, onPickMarket }) {
  const featured = DEFAULT_DASHBOARD_MARKETS
    .map(sym => markets.find(m => m.symbol === sym))
    .filter(Boolean);

  const freshness = lastFetch ? Math.floor((Date.now() - lastFetch) / 1000) : null;

  return (
    <div className="tlp-markets-widget">
      <div className="tlp-section-head tlp-markets-head">
        <div className="tlp-markets-title">
          <h3>Markets</h3>
          {loading && !markets.length && <span className="tlp-markets-loading">loading…</span>}
          {!loading && lastFetch && (
            <span className="tlp-markets-fresh">
              <span className="tlp-live-dot" />
              {freshness < 60 ? 'live' : `${Math.floor(freshness / 60)}m ago`}
            </span>
          )}
        </div>
        <button className="tlp-link-btn" onClick={onSeeAll}>
          View all <ChevronRight size={14} />
        </button>
      </div>

      {error && !markets.length ? (
        <GlassPanel className="tlp-markets-err">
          <WifiOff size={20} style={{ color: 'var(--muted)' }} />
          <div>
            <div className="tlp-markets-err-title">Can't reach markets</div>
            <div className="tlp-markets-err-sub">{error}</div>
          </div>
        </GlassPanel>
      ) : (
        <div className="tlp-markets-grid">
          {loading && !featured.length
            ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="tlp-market-skel" />)
            : featured.map(m => (
                <button key={m.symbol} className="tlp-market-tile" onClick={() => onPickMarket(m)}>
                  <div className="tlp-market-tile-top">
                    <span className="tlp-market-sym">{m.symbol}</span>
                    <span className={`tlp-market-chg ${m.change >= 0 ? 'tlp-up' : 'tlp-down'}`}>
                      {m.change >= 0 ? '+' : ''}{m.change.toFixed(2)}%
                    </span>
                  </div>
                  <div className="tlp-market-price">{fmtPrice(m.price, m.decimals)}</div>
                  <div className="tlp-market-cat">{m.category === 'crypto' ? 'CRYPTO' : 'FX'}</div>
                </button>
              ))
          }
        </div>
      )}
    </div>
  );
}

// ============================================================
// MARKETS SHEET (full list + search)
// ============================================================
function MarketsSheet({ open, onClose, markets, loading, error, lastFetch, onRefresh, onPickMarket }) {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');

  useEffect(() => { if (open) setQuery(''); }, [open]);

  const filtered = useMemo(() => {
    let list = markets;
    if (tab === 'crypto') list = list.filter(m => m.category === 'crypto');
    if (tab === 'forex') list = list.filter(m => m.category === 'forex');
    const q = query.trim().toLowerCase();
    if (q) list = list.filter(m =>
      m.symbol.toLowerCase().includes(q) || m.name.toLowerCase().includes(q)
    );
    return list;
  }, [markets, tab, query]);

  const freshness = lastFetch ? Math.floor((Date.now() - lastFetch) / 1000) : null;

  return (
    <Sheet open={open} onClose={onClose} title="Markets">
      <div className="tlp-markets-body">
        <div className="tlp-markets-status">
          {lastFetch ? (
            <span className="tlp-markets-fresh">
              <span className="tlp-live-dot" />
              Updated {freshness < 60 ? `${freshness}s ago` : `${Math.floor(freshness / 60)}m ago`}
            </span>
          ) : loading ? (
            <span className="tlp-markets-loading">Loading…</span>
          ) : <span />}
          <button className="tlp-icon-btn" onClick={onRefresh} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'tlp-spin' : ''} /> Refresh
          </button>
        </div>

        <div className="tlp-search-wrap">
          <Search size={15} />
          <input className="tlp-search" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search BTC, EURUSD, Bitcoin…" />
          {query && <button className="tlp-search-clear" onClick={() => setQuery('')}><X size={14} /></button>}
        </div>

        <div className="tlp-seg tlp-seg-sm tlp-markets-tabs">
          <button className={`tlp-seg-btn ${tab === 'all' ? 'tlp-active' : ''}`} onClick={() => setTab('all')}>All</button>
          <button className={`tlp-seg-btn ${tab === 'crypto' ? 'tlp-active' : ''}`} onClick={() => setTab('crypto')}>
            <Bitcoin size={12} /> Crypto
          </button>
          <button className={`tlp-seg-btn ${tab === 'forex' ? 'tlp-active' : ''}`} onClick={() => setTab('forex')}>
            <Landmark size={12} /> Forex
          </button>
        </div>

        {error && !markets.length && (
          <GlassPanel className="tlp-markets-err">
            <WifiOff size={22} style={{ color: 'var(--muted)' }} />
            <div>
              <div className="tlp-markets-err-title">Can't reach markets</div>
              <div className="tlp-markets-err-sub">{error}</div>
            </div>
            <Btn size="sm" variant="ghost" onClick={onRefresh}>Retry</Btn>
          </GlassPanel>
        )}

        <div className="tlp-markets-list">
          {filtered.length === 0 && !loading && !error && (
            <div className="tlp-empty-sm">No markets match "{query}"</div>
          )}
          {filtered.map(m => (
            <button key={m.symbol} className="tlp-market-row" onClick={() => onPickMarket(m)}>
              <div className={`tlp-market-icon tlp-${m.category}`}>
                {m.category === 'crypto' ? <Bitcoin size={14} /> : <Landmark size={14} />}
              </div>
              <div className="tlp-market-info">
                <div className="tlp-market-row-top">
                  <span className="tlp-market-sym">{m.symbol}</span>
                  <span className="tlp-market-price-row">{fmtPrice(m.price, m.decimals)}</span>
                </div>
                <div className="tlp-market-row-bot">
                  <span className="tlp-market-name">{m.name}</span>
                  <span className={`tlp-market-chg ${m.change >= 0 ? 'tlp-up' : 'tlp-down'}`}>
                    {m.change >= 0 ? '+' : ''}{m.change.toFixed(2)}%
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="tlp-markets-foot-note">
          <span>Crypto: Binance live · Forex: ECB daily reference</span>
        </div>
      </div>
    </Sheet>
  );
}

// ============================================================
// MARKET DETAIL / QUICK-LOG SHEET
// ============================================================
function MarketDetailSheet({ market, onClose, onLogTrade }) {
  if (!market) return null;
  return (
    <Sheet open={!!market} onClose={onClose} title={market.symbol}
      footer={<Btn full onClick={() => onLogTrade(market)}><Plus size={14} /> Log trade on {market.symbol}</Btn>}>
      <div className="tlp-md-detail">
        <div className="tlp-md-name">{market.name}</div>
        <div className="tlp-md-price">{fmtPrice(market.price, market.decimals)}</div>
        <div className={`tlp-md-chg ${market.change >= 0 ? 'tlp-up' : 'tlp-down'}`}>
          {market.change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {market.change >= 0 ? '+' : ''}{market.change.toFixed(2)}% 
          <span className="tlp-md-chg-label">{market.category === 'crypto' ? '24h' : 'since ' + (market.source.split('· ')[1] || 'prev')}</span>
        </div>

        {market.category === 'crypto' && market.high !== undefined && (
          <div className="tlp-md-grid">
            <div><span>24h high</span><strong>{fmtPrice(market.high, market.decimals)}</strong></div>
            <div><span>24h low</span><strong>{fmtPrice(market.low, market.decimals)}</strong></div>
            <div><span>24h volume</span><strong>${(market.volume / 1e6).toFixed(1)}M</strong></div>
            <div><span>Source</span><strong style={{ fontSize: 11 }}>{market.source}</strong></div>
          </div>
        )}

        {market.category === 'forex' && (
          <div className="tlp-md-grid">
            <div><span>Source</span><strong style={{ fontSize: 12 }}>{market.source}</strong></div>
            <div><span>Type</span><strong>Reference rate</strong></div>
          </div>
        )}

        {market.category === 'forex' && (
          <div className="tlp-md-note">
            <AlertCircle size={13} />
            <span>ECB reference rates update once per business day. Your broker's live price will differ.</span>
          </div>
        )}
        {market.symbol === 'XAUUSD*' && (
          <div className="tlp-md-note">
            <AlertCircle size={13} />
            <span>Tracked via PAXG (tokenized gold, 1:1 backed). Spot gold may differ slightly.</span>
          </div>
        )}
      </div>
    </Sheet>
  );
}


function Dashboard({ profile, trades, stats, onOpenTrade, onLog, marketData, onOpenMarkets, onPickMarket }) {
  const recent = [...trades].sort((a, b) => new Date(b.entryAt) - new Date(a.entryAt)).slice(0, 4);

  return (
    <div className="tlp-view">
      <div className="tlp-view-head">
        <div>
          <div className="tlp-view-kicker">Hey {profile.welcomeMessage}</div>
          <h1 className="tlp-view-title">Dashboard</h1>
        </div>
      </div>

      {/* Hero: equity */}
      <GlassPanel className="tlp-hero">
        <div className="tlp-hero-top">
          <div>
            <div className="tlp-hero-label">Account equity</div>
            <div className="tlp-hero-value">{fmtMoney(stats.equity)}</div>
            <div className={`tlp-hero-delta ${stats.totalPnl >= 0 ? 'tlp-up' : 'tlp-down'}`}>
              {stats.totalPnl >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {fmtMoney(stats.totalPnl)} · {fmtPct(stats.pctGrowth, 2)}
            </div>
          </div>
          <div className="tlp-hero-meta">
            <span className="tlp-hero-meta-label">Starting</span>
            <span className="tlp-hero-meta-value">{fmtMoney(profile.startingBalance, true)}</span>
          </div>
        </div>
        <div className="tlp-hero-chart">
          {stats.curve.length > 1 ? (
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={stats.curve} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{ background: 'var(--panel-solid)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12, fontFamily: 'JetBrains Mono' }}
                  labelFormatter={() => ''}
                  formatter={(v) => [fmtMoney(v), 'Equity']}
                />
                <Area type="monotone" dataKey="equity" stroke="var(--accent)" strokeWidth={2} fill="url(#eq)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="tlp-chart-empty">Log your first trade to see the curve</div>
          )}
        </div>
      </GlassPanel>

      {/* Markets ticker */}
      <MarketTicker
        markets={marketData.markets}
        loading={marketData.loading}
        error={marketData.error}
        lastFetch={marketData.lastFetch}
        onSeeAll={onOpenMarkets}
        onPickMarket={onPickMarket}
      />

      {/* Key stats */}
      <div className="tlp-grid-2">
        <StatChip label="Win rate" value={fmtPct(stats.winRate)} sub={`${stats.wins}W · ${stats.losses}L`} icon={Target} accent />
        <StatChip label="Trades" value={stats.total} sub="lifetime" icon={Hash} />
        <StatChip label="R:R realized" value={stats.rr.toFixed(2)} sub="avg win / avg loss" icon={Layers} accent />
        <StatChip label="Expectancy" value={fmtMoney(stats.expectancy)} sub="per trade" icon={Award} trend={stats.expectancy >= 0 ? 'up' : 'down'} />
      </div>

      {/* Second row */}
      <div className="tlp-grid-3">
        <StatChip label="Max DD" value={fmtPct(stats.maxDD)} sub="peak-to-trough" />
        <StatChip label={stats.curType === 'W' ? 'Win streak' : stats.curType === 'L' ? 'Loss streak' : 'Streak'} value={stats.curStreak || 0} sub="current" icon={Flame} />
        <StatChip label="Avg hold" value={fmtDuration(stats.avgHold)} sub="time in trade" icon={Clock} />
      </div>

      {/* Best / Worst */}
      {stats.bestDay && (
        <div className="tlp-grid-2">
          <GlassPanel className="tlp-mini-card">
            <div className="tlp-mini-kicker"><TrendingUp size={13} /> Best day</div>
            <div className="tlp-mini-value tlp-up">{fmtMoney(stats.bestDay[1])}</div>
            <div className="tlp-mini-sub">{fmtDate(stats.bestDay[0])}</div>
          </GlassPanel>
          <GlassPanel className="tlp-mini-card">
            <div className="tlp-mini-kicker"><TrendingDown size={13} /> Worst day</div>
            <div className="tlp-mini-value tlp-down">{fmtMoney(stats.worstDay[1])}</div>
            <div className="tlp-mini-sub">{fmtDate(stats.worstDay[0])}</div>
          </GlassPanel>
        </div>
      )}

      {/* Discipline */}
      {stats.avgDiscipline > 0 && (
        <GlassPanel className="tlp-disc">
          <div className="tlp-disc-head">
            <span className="tlp-disc-label">Average discipline</span>
            <span className="tlp-disc-value">{stats.avgDiscipline.toFixed(1)} / 5</span>
          </div>
          <div className="tlp-disc-stars">
            {[1, 2, 3, 4, 5].map(n => (
              <Star key={n} size={16} fill={n <= Math.round(stats.avgDiscipline) ? 'var(--accent)' : 'transparent'} style={{ color: 'var(--accent)' }} />
            ))}
          </div>
          <div className="tlp-disc-hint">How well you followed your plan across all trades</div>
        </GlassPanel>
      )}

      {/* Recent trades */}
      <div className="tlp-section-head">
        <h3>Recent trades</h3>
        {trades.length > 4 && <span className="tlp-section-count">{trades.length} total</span>}
      </div>
      <div className="tlp-trade-list">
        {recent.length === 0 ? (
          <GlassPanel className="tlp-empty">
            <Activity size={28} style={{ color: 'var(--accent)' }} />
            <div className="tlp-empty-title">No trades yet</div>
            <div className="tlp-empty-sub">Tap the + button to log your first trade.</div>
            <Btn onClick={onLog}>Log a trade</Btn>
          </GlassPanel>
        ) : (
          recent.map(t => <TradeRow key={t.id} trade={t} onClick={() => onOpenTrade(t)} />)
        )}
      </div>
    </div>
  );
}

// ============================================================
// TRADE ROW
// ============================================================
function TradeRow({ trade, onClick }) {
  const win = trade.pnl > 0;
  const flat = trade.pnl === 0;
  return (
    <button className="tlp-trade-row" onClick={onClick}>
      <div className={`tlp-trade-side tlp-${trade.type}`}>
        {trade.type === 'buy' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      </div>
      <div className="tlp-trade-main">
        <div className="tlp-trade-top">
          <span className="tlp-trade-asset">{trade.asset}</span>
          <span className={`tlp-trade-pnl ${win ? 'tlp-up' : flat ? '' : 'tlp-down'}`}>
            {win ? '+' : ''}{fmtMoney(trade.pnl)}
          </span>
        </div>
        <div className="tlp-trade-bot">
          <span>{fmtDate(trade.entryAt)}</span>
          <span>·</span>
          <span>{fmtDuration(trade.durationMinutes)}</span>
          {trade.setupType && <><span>·</span><span>{trade.setupType}</span></>}
        </div>
      </div>
      <ChevronRight size={16} style={{ color: 'var(--muted)', flexShrink: 0 }} />
    </button>
  );
}

// ============================================================
// TRADE FORM
// ============================================================
function TradeForm({ open, onClose, onSave, confluences, editing, onDelete, showToast, prefillMarket }) {
  const [asset, setAsset] = useState('');
  const [type, setType] = useState('buy');
  const [lotSize, setLotSize] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [pnl, setPnl] = useState('');
  const [setupType, setSetupType] = useState('');
  const [notes, setNotes] = useState('');
  const [entryAt, setEntryAt] = useState(() => localDT(new Date()));
  const [exitAt, setExitAt] = useState(() => localDT(new Date()));
  const [confIds, setConfIds] = useState([]);
  const [discipline, setDiscipline] = useState(4);
  const [emotion, setEmotion] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    if (editing) {
      setAsset(editing.asset || '');
      setType(editing.type || 'buy');
      setLotSize(String(editing.lotSize || ''));
      setEntryPrice(String(editing.entryPrice ?? ''));
      setExitPrice(String(editing.exitPrice ?? ''));
      setPnl(String(editing.pnl ?? ''));
      setSetupType(editing.setupType || '');
      setNotes(editing.notes || '');
      setEntryAt(localDT(new Date(editing.entryAt)));
      setExitAt(localDT(new Date(editing.exitAt)));
      setConfIds(editing.confluenceIds || []);
      setDiscipline(editing.discipline || 4);
      setEmotion(editing.emotion || '');
      // load screenshot lazily
      storageGet(KEY.screenshot(editing.id)).then(s => setScreenshot(s));
    } else if (open) {
      // reset for new
      setAsset(prefillMarket?.symbol?.replace('*', '') || '');
      setType('buy');
      setLotSize('');
      setEntryPrice(prefillMarket?.price ? String(prefillMarket.price.toFixed(prefillMarket.decimals)) : '');
      setExitPrice('');
      setPnl('');
      setSetupType('');
      setNotes(prefillMarket ? `Entered at live price ${fmtPrice(prefillMarket.price, prefillMarket.decimals)} (${prefillMarket.source})` : '');
      setConfIds([]);
      setDiscipline(4);
      setEmotion('');
      setScreenshot(null);
      setEntryAt(localDT(new Date()));
      setExitAt(localDT(new Date()));
    }
  }, [editing, open, prefillMarket]);

  const submit = async () => {
    if (!asset.trim()) { showToast({ msg: 'Asset is required', type: 'error' }); return; }
    if (pnl === '' || isNaN(parseFloat(pnl))) { showToast({ msg: 'PnL is required', type: 'error' }); return; }
    const entry = new Date(entryAt);
    const exit = new Date(exitAt);
    const duration = Math.max(0, (exit - entry) / 60000);
    const id = editing?.id || crypto.randomUUID();
    const trade = {
      id,
      asset: asset.trim().toUpperCase(),
      type,
      lotSize: parseFloat(lotSize) || 0,
      entryPrice: entryPrice ? parseFloat(entryPrice) : null,
      exitPrice: exitPrice ? parseFloat(exitPrice) : null,
      pnl: parseFloat(pnl),
      confluenceIds: confIds,
      setupType: setupType.trim(),
      notes: notes.trim(),
      entryAt: entry.toISOString(),
      exitAt: exit.toISOString(),
      durationMinutes: duration,
      discipline,
      emotion: emotion.trim(),
      hasScreenshot: !!screenshot,
    };
    if (screenshot) await storageSet(KEY.screenshot(id), screenshot);
    onSave(trade);
  };

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const compressed = await compressImage(f);
    setScreenshot(compressed);
  };

  // quick auto-calc hint (not forced)
  const canAutoCalc = entryPrice && exitPrice && lotSize;
  const autoCalc = () => {
    const diff = parseFloat(exitPrice) - parseFloat(entryPrice);
    const size = parseFloat(lotSize);
    const raw = (type === 'buy' ? diff : -diff) * size;
    setPnl(raw.toFixed(2));
  };

  return (
    <Sheet open={open} onClose={onClose} title={editing ? 'Edit trade' : 'Log a trade'}
      footer={
        <div className="tlp-form-foot">
          {editing && (
            <Btn variant="danger" onClick={() => onDelete(editing.id)}><Trash2 size={14} /> Delete</Btn>
          )}
          <Btn onClick={submit} full>{editing ? 'Save changes' : 'Log trade'}</Btn>
        </div>
      }>
      <div className="tlp-form">
        <label className="tlp-field">
          <span>Asset</span>
          <input className="tlp-input" value={asset} onChange={e => setAsset(e.target.value.toUpperCase())} placeholder="EURUSD, BTCUSD, XAUUSD..." />
          <div className="tlp-chips">
            {['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'BTCUSD', 'NAS100', 'US30'].map(p => (
              <button key={p} className={`tlp-chip ${asset === p ? 'tlp-active' : ''}`} onClick={() => setAsset(p)}>{p}</button>
            ))}
          </div>
        </label>

        <div className="tlp-field">
          <span>Direction</span>
          <div className="tlp-seg">
            <button className={`tlp-seg-btn ${type === 'buy' ? 'tlp-active tlp-buy' : ''}`} onClick={() => setType('buy')}>
              <ArrowUpRight size={14} /> Buy / Long
            </button>
            <button className={`tlp-seg-btn ${type === 'sell' ? 'tlp-active tlp-sell' : ''}`} onClick={() => setType('sell')}>
              <ArrowDownRight size={14} /> Sell / Short
            </button>
          </div>
        </div>

        <div className="tlp-grid-2-form">
          <label className="tlp-field">
            <span>Lot size</span>
            <input className="tlp-input" type="number" step="0.01" value={lotSize} onChange={e => setLotSize(e.target.value)} placeholder="0.10" />
          </label>
          <label className="tlp-field">
            <span>P&L (USD)</span>
            <input className="tlp-input" type="number" step="0.01" value={pnl} onChange={e => setPnl(e.target.value)} placeholder="+85.00 or -40.00" />
          </label>
        </div>

        <div className="tlp-grid-2-form">
          <label className="tlp-field">
            <span>Entry price</span>
            <input className="tlp-input" type="number" step="any" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} placeholder="optional" />
          </label>
          <label className="tlp-field">
            <span>Exit price</span>
            <input className="tlp-input" type="number" step="any" value={exitPrice} onChange={e => setExitPrice(e.target.value)} placeholder="optional" />
          </label>
        </div>

        {canAutoCalc && (
          <button className="tlp-hint-btn" onClick={autoCalc}>
            <Zap size={12} /> Auto-fill P&L from prices × lot
          </button>
        )}

        <div className="tlp-grid-2-form">
          <label className="tlp-field">
            <span>Entry time</span>
            <input className="tlp-input" type="datetime-local" value={entryAt} onChange={e => setEntryAt(e.target.value)} />
          </label>
          <label className="tlp-field">
            <span>Exit time</span>
            <input className="tlp-input" type="datetime-local" value={exitAt} onChange={e => setExitAt(e.target.value)} />
          </label>
        </div>

        {entryAt && exitAt && (
          <div className="tlp-duration-preview">
            <Clock size={12} />
            <span>Time in trade: {fmtDuration(Math.max(0, (new Date(exitAt) - new Date(entryAt)) / 60000))}</span>
          </div>
        )}

        <label className="tlp-field">
          <span>Setup type</span>
          <input className="tlp-input" value={setupType} onChange={e => setSetupType(e.target.value)} placeholder="Breakout, Reversal, Scalp..." />
          <div className="tlp-chips">
            {['Breakout', 'Reversal', 'Scalp', 'Trend continuation', 'Range', 'News'].map(s => (
              <button key={s} className={`tlp-chip ${setupType === s ? 'tlp-active' : ''}`} onClick={() => setSetupType(s)}>{s}</button>
            ))}
          </div>
        </label>

        <div className="tlp-field">
          <span>Confluences met</span>
          <div className="tlp-conf-picker">
            {confluences.filter(c => c.active).length === 0 && (
              <div className="tlp-empty-sm">Add confluences in the Setup tab first.</div>
            )}
            {confluences.filter(c => c.active).map(c => {
              const on = confIds.includes(c.id);
              return (
                <button key={c.id} className={`tlp-conf-pill ${on ? 'tlp-active' : ''}`}
                  onClick={() => setConfIds(ids => on ? ids.filter(i => i !== c.id) : [...ids, c.id])}>
                  {on && <Check size={12} />} {c.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="tlp-field">
          <span>Discipline — did you follow your plan?</span>
          <div className="tlp-star-picker">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setDiscipline(n)}>
                <Star size={22} fill={n <= discipline ? 'var(--accent)' : 'transparent'} style={{ color: 'var(--accent)' }} />
              </button>
            ))}
          </div>
        </div>

        <label className="tlp-field">
          <span>Emotion / mental state</span>
          <input className="tlp-input" value={emotion} onChange={e => setEmotion(e.target.value)} placeholder="Calm, FOMO, revenge, patient..." />
        </label>

        <label className="tlp-field">
          <span>Notes</span>
          <textarea className="tlp-input tlp-textarea" value={notes} onChange={e => setNotes(e.target.value)} rows={4}
            placeholder="What did you see? What worked? What would you do differently?" />
        </label>

        <div className="tlp-field">
          <span>Chart screenshot</span>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
          {screenshot ? (
            <div className="tlp-shot-preview">
              <img src={screenshot} alt="chart" />
              <button className="tlp-shot-rm" onClick={() => setScreenshot(null)}><X size={14} /></button>
            </div>
          ) : (
            <button className="tlp-shot-add" onClick={() => fileRef.current?.click()}>
              <Camera size={18} />
              <span>Upload screenshot</span>
              <small>auto-compressed · max 1200px</small>
            </button>
          )}
        </div>
      </div>
    </Sheet>
  );
}

function localDT(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// ============================================================
// TRADE DETAIL
// ============================================================
function TradeDetail({ trade, confluences, onClose, onEdit }) {
  const [shot, setShot] = useState(null);
  useEffect(() => {
    if (trade?.hasScreenshot) storageGet(KEY.screenshot(trade.id)).then(setShot);
    else setShot(null);
  }, [trade]);
  if (!trade) return null;
  const confs = (trade.confluenceIds || []).map(id => confluences.find(c => c.id === id)).filter(Boolean);
  const win = trade.pnl > 0;
  return (
    <Sheet open={!!trade} onClose={onClose} title="Trade details"
      footer={<Btn full onClick={onEdit}>Edit</Btn>}>
      <div className="tlp-detail">
        <div className="tlp-detail-head">
          <div>
            <div className="tlp-detail-asset">{trade.asset}</div>
            <div className={`tlp-detail-type tlp-${trade.type}`}>
              {trade.type === 'buy' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {trade.type.toUpperCase()}
            </div>
          </div>
          <div className={`tlp-detail-pnl ${win ? 'tlp-up' : trade.pnl === 0 ? '' : 'tlp-down'}`}>
            {win ? '+' : ''}{fmtMoney(trade.pnl)}
          </div>
        </div>

        <div className="tlp-detail-grid">
          <div><span>Lot size</span><strong>{trade.lotSize || '—'}</strong></div>
          <div><span>Entry</span><strong>{trade.entryPrice ?? '—'}</strong></div>
          <div><span>Exit</span><strong>{trade.exitPrice ?? '—'}</strong></div>
          <div><span>Hold</span><strong>{fmtDuration(trade.durationMinutes)}</strong></div>
          <div><span>Entered</span><strong>{fmtDate(trade.entryAt)} {fmtTime(trade.entryAt)}</strong></div>
          <div><span>Exited</span><strong>{fmtDate(trade.exitAt)} {fmtTime(trade.exitAt)}</strong></div>
          {trade.setupType && <div><span>Setup</span><strong>{trade.setupType}</strong></div>}
          {trade.emotion && <div><span>Emotion</span><strong>{trade.emotion}</strong></div>}
        </div>

        {trade.discipline && (
          <div className="tlp-detail-block">
            <div className="tlp-detail-label">Discipline</div>
            <div className="tlp-disc-stars">
              {[1, 2, 3, 4, 5].map(n => (
                <Star key={n} size={16} fill={n <= trade.discipline ? 'var(--accent)' : 'transparent'} style={{ color: 'var(--accent)' }} />
              ))}
            </div>
          </div>
        )}

        {confs.length > 0 && (
          <div className="tlp-detail-block">
            <div className="tlp-detail-label">Confluences ({confs.length})</div>
            <div className="tlp-chips">
              {confs.map(c => <span key={c.id} className="tlp-chip tlp-active">{c.name}</span>)}
            </div>
          </div>
        )}

        {trade.notes && (
          <div className="tlp-detail-block">
            <div className="tlp-detail-label">Notes</div>
            <p className="tlp-notes-text">{trade.notes}</p>
          </div>
        )}

        {shot && (
          <div className="tlp-detail-block">
            <div className="tlp-detail-label">Screenshot</div>
            <img src={shot} alt="chart" className="tlp-detail-shot" />
          </div>
        )}
      </div>
    </Sheet>
  );
}

// ============================================================
// TRADES HISTORY
// ============================================================
function TradesView({ trades, onOpenTrade, onLog }) {
  const [filter, setFilter] = useState('all'); // all | win | loss
  const [assetFilter, setAssetFilter] = useState('');
  const [setupFilter, setSetupFilter] = useState('');

  const assets = useMemo(() => [...new Set(trades.map(t => t.asset))].sort(), [trades]);
  const setups = useMemo(() => [...new Set(trades.map(t => t.setupType).filter(Boolean))].sort(), [trades]);

  const filtered = useMemo(() => {
    return [...trades]
      .filter(t => filter === 'all' || (filter === 'win' ? t.pnl > 0 : t.pnl < 0))
      .filter(t => !assetFilter || t.asset === assetFilter)
      .filter(t => !setupFilter || t.setupType === setupFilter)
      .sort((a, b) => new Date(b.entryAt) - new Date(a.entryAt));
  }, [trades, filter, assetFilter, setupFilter]);

  return (
    <div className="tlp-view">
      <div className="tlp-view-head">
        <div>
          <div className="tlp-view-kicker">History</div>
          <h1 className="tlp-view-title">Trades</h1>
        </div>
      </div>

      <GlassPanel className="tlp-filter-bar">
        <div className="tlp-seg tlp-seg-sm">
          <button className={`tlp-seg-btn ${filter === 'all' ? 'tlp-active' : ''}`} onClick={() => setFilter('all')}>All</button>
          <button className={`tlp-seg-btn ${filter === 'win' ? 'tlp-active tlp-buy' : ''}`} onClick={() => setFilter('win')}>Wins</button>
          <button className={`tlp-seg-btn ${filter === 'loss' ? 'tlp-active tlp-sell' : ''}`} onClick={() => setFilter('loss')}>Losses</button>
        </div>
        <div className="tlp-filter-selects">
          <select className="tlp-select" value={assetFilter} onChange={e => setAssetFilter(e.target.value)}>
            <option value="">All pairs</option>
            {assets.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select className="tlp-select" value={setupFilter} onChange={e => setSetupFilter(e.target.value)}>
            <option value="">All setups</option>
            {setups.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </GlassPanel>

      <div className="tlp-trade-list">
        {filtered.length === 0 ? (
          <GlassPanel className="tlp-empty">
            <List size={26} style={{ color: 'var(--accent)' }} />
            <div className="tlp-empty-title">{trades.length ? 'No trades match' : 'No trades yet'}</div>
            <div className="tlp-empty-sub">{trades.length ? 'Try clearing filters.' : 'Tap + to log your first one.'}</div>
            {!trades.length && <Btn onClick={onLog}>Log a trade</Btn>}
          </GlassPanel>
        ) : (
          filtered.map(t => <TradeRow key={t.id} trade={t} onClick={() => onOpenTrade(t)} />)
        )}
      </div>
    </div>
  );
}

// ============================================================
// CALENDAR
// ============================================================
function CalendarView({ trades, onDayClick }) {
  const [cursor, setCursor] = useState(() => new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const byDay = useMemo(() => {
    const m = {};
    trades.forEach(t => {
      const k = ymd(t.entryAt);
      if (!m[k]) m[k] = { count: 0, pnl: 0 };
      m[k].count++;
      m[k].pnl += (t.pnl || 0);
    });
    return m;
  }, [trades]);

  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const monthPnl = Object.entries(byDay)
    .filter(([k]) => k.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
    .reduce((s, [, v]) => s + v.pnl, 0);
  const monthCount = Object.entries(byDay)
    .filter(([k]) => k.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`))
    .reduce((s, [, v]) => s + v.count, 0);

  return (
    <div className="tlp-view">
      <div className="tlp-view-head">
        <div>
          <div className="tlp-view-kicker">Calendar</div>
          <h1 className="tlp-view-title">{cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h1>
        </div>
        <div className="tlp-cal-nav">
          <button className="tlp-icon-btn" onClick={() => setCursor(new Date(year, month - 1, 1))}><ChevronLeft size={16} /></button>
          <button className="tlp-icon-btn" onClick={() => setCursor(new Date())}>Today</button>
          <button className="tlp-icon-btn" onClick={() => setCursor(new Date(year, month + 1, 1))}><ChevronRight size={16} /></button>
        </div>
      </div>

      <GlassPanel className="tlp-cal-summary">
        <div>
          <div className="tlp-stat-label">Month P&L</div>
          <div className={`tlp-cal-sum-val ${monthPnl >= 0 ? 'tlp-up' : 'tlp-down'}`}>
            {monthPnl >= 0 ? '+' : ''}{fmtMoney(monthPnl)}
          </div>
        </div>
        <div>
          <div className="tlp-stat-label">Trades</div>
          <div className="tlp-cal-sum-val">{monthCount}</div>
        </div>
      </GlassPanel>

      <div className="tlp-cal">
        <div className="tlp-cal-dow">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i}>{d}</span>)}
        </div>
        <div className="tlp-cal-grid">
          {cells.map((d, i) => {
            if (d === null) return <div key={i} className="tlp-cal-cell tlp-empty-cell" />;
            const k = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const data = byDay[k];
            const today = k === ymd(new Date());
            const cls = data ? (data.pnl > 0 ? 'tlp-cal-win' : data.pnl < 0 ? 'tlp-cal-loss' : 'tlp-cal-flat') : '';
            return (
              <button key={i} className={`tlp-cal-cell ${cls} ${today ? 'tlp-cal-today' : ''}`}
                onClick={() => data && onDayClick(k)}>
                <span className="tlp-cal-day">{d}</span>
                {data && (
                  <>
                    <span className="tlp-cal-pnl">{data.pnl >= 0 ? '+' : ''}{fmtMoney(data.pnl, true).replace('$', '')}</span>
                    <span className="tlp-cal-count">{data.count}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="tlp-cal-legend">
        <span><i className="tlp-dot tlp-dot-win" /> Profitable day</span>
        <span><i className="tlp-dot tlp-dot-loss" /> Losing day</span>
        <span><i className="tlp-dot tlp-dot-today" /> Today</span>
      </div>
    </div>
  );
}

// ============================================================
// DAY MODAL
// ============================================================
function DayModal({ dayKey, trades, onClose, onOpenTrade }) {
  if (!dayKey) return null;
  const dayTrades = trades.filter(t => ymd(t.entryAt) === dayKey).sort((a, b) => new Date(a.entryAt) - new Date(b.entryAt));
  const pnl = dayTrades.reduce((s, t) => s + (t.pnl || 0), 0);
  const wins = dayTrades.filter(t => t.pnl > 0).length;
  return (
    <Sheet open={!!dayKey} onClose={onClose} title={fmtDate(dayKey)}>
      <GlassPanel className="tlp-day-sum">
        <div>
          <span className="tlp-stat-label">P&L</span>
          <div className={`tlp-day-pnl ${pnl >= 0 ? 'tlp-up' : 'tlp-down'}`}>{pnl >= 0 ? '+' : ''}{fmtMoney(pnl)}</div>
        </div>
        <div>
          <span className="tlp-stat-label">Win rate</span>
          <div className="tlp-day-pnl">{dayTrades.length ? Math.round((wins / dayTrades.length) * 100) : 0}%</div>
        </div>
        <div>
          <span className="tlp-stat-label">Trades</span>
          <div className="tlp-day-pnl">{dayTrades.length}</div>
        </div>
      </GlassPanel>
      <div className="tlp-trade-list" style={{ marginTop: 16 }}>
        {dayTrades.map(t => <TradeRow key={t.id} trade={t} onClick={() => onOpenTrade(t)} />)}
      </div>
    </Sheet>
  );
}

// ============================================================
// CONFLUENCES MANAGER
// ============================================================
function ConfluencesView({ confluences, setConfluences, showToast }) {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');

  const add = () => {
    if (!name.trim()) return;
    const next = [...confluences, { id: crypto.randomUUID(), name: name.trim(), note: note.trim(), active: true }];
    setConfluences(next);
    setName(''); setNote('');
    showToast({ msg: 'Confluence added', type: 'success' });
  };
  const toggle = (id) => setConfluences(confluences.map(c => c.id === id ? { ...c, active: !c.active } : c));
  const del = (id) => setConfluences(confluences.filter(c => c.id !== id));

  return (
    <div className="tlp-view">
      <div className="tlp-view-head">
        <div>
          <div className="tlp-view-kicker">Your edge</div>
          <h1 className="tlp-view-title">Confluences</h1>
        </div>
      </div>

      <GlassPanel className="tlp-add-conf">
        <input className="tlp-input" value={name} onChange={e => setName(e.target.value)} placeholder="Confluence name (e.g. Order block tap)" />
        <textarea className="tlp-input tlp-textarea" value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Note / rule for yourself (optional)" />
        <Btn full onClick={add} disabled={!name.trim()}><Plus size={14} /> Add confluence</Btn>
      </GlassPanel>

      <div className="tlp-conf-list">
        {confluences.length === 0 ? (
          <GlassPanel className="tlp-empty">
            <BookOpen size={26} style={{ color: 'var(--accent)' }} />
            <div className="tlp-empty-title">No confluences yet</div>
            <div className="tlp-empty-sub">Add your checklist items above. These are the things you validate before every trade.</div>
          </GlassPanel>
        ) : (
          confluences.map(c => (
            <GlassPanel key={c.id} className={`tlp-conf-card ${!c.active ? 'tlp-inactive' : ''}`}>
              <div className="tlp-conf-top">
                <div className="tlp-conf-name">{c.name}</div>
                <div className="tlp-conf-actions">
                  <button className="tlp-toggle" data-on={c.active} onClick={() => toggle(c.id)}>
                    <span className="tlp-toggle-dot" />
                  </button>
                  <button className="tlp-icon-btn tlp-danger" onClick={() => del(c.id)}><Trash2 size={14} /></button>
                </div>
              </div>
              {c.note && <div className="tlp-conf-note">{c.note}</div>}
            </GlassPanel>
          ))
        )}
      </div>
    </div>
  );
}

// ============================================================
// SETTINGS
// ============================================================
function SettingsView({ profile, setProfile, trades, confluences, onReset, showToast, onUpgrade }) {
  const [name, setName] = useState(profile.name);
  const [welcome, setWelcome] = useState(profile.welcomeMessage);
  const [balance, setBalance] = useState(String(profile.startingBalance));
  const [checkEnabled, setCheckEnabled] = useState(profile.confluenceCheckEnabled ?? true);
  const [checkSec, setCheckSec] = useState(profile.confluenceCheckSeconds ?? 20);

  const save = async () => {
    const next = {
      ...profile,
      name: name.trim() || profile.name,
      welcomeMessage: welcome.trim() || profile.welcomeMessage,
      startingBalance: parseFloat(balance) || profile.startingBalance,
      confluenceCheckEnabled: checkEnabled,
      confluenceCheckSeconds: Math.max(5, Math.min(120, parseInt(checkSec) || 20)),
    };
    await setProfile(next);
    showToast({ msg: 'Settings saved', type: 'success' });
  };

  const setTheme = async (t) => {
    await setProfile({ ...profile, theme: t });
  };

  const exportCSV = () => {
    const headers = ['Date', 'Time', 'Asset', 'Type', 'Lot', 'Entry', 'Exit', 'PnL', 'Setup', 'Duration(min)', 'Discipline', 'Emotion', 'Notes'];
    const rows = trades.map(t => [
      ymd(t.entryAt), fmtTime(t.entryAt), t.asset, t.type, t.lotSize,
      t.entryPrice ?? '', t.exitPrice ?? '', t.pnl, t.setupType || '',
      Math.round(t.durationMinutes || 0), t.discipline || '', t.emotion || '',
      (t.notes || '').replace(/\n/g, ' ').replace(/"/g, '""'),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trade-log-${ymd(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast({ msg: 'Exported', type: 'success' });
  };

  return (
    <div className="tlp-view">
      <div className="tlp-view-head">
        <div>
          <div className="tlp-view-kicker">Account</div>
          <h1 className="tlp-view-title">Settings</h1>
        </div>
      </div>

      <button className="tlp-pro-card" onClick={onUpgrade}>
        <div className="tlp-pro-card-icon"><Crown size={18} /></div>
        <div className="tlp-pro-card-text">
          <div className="tlp-pro-card-title">Upgrade to Pro</div>
          <div className="tlp-pro-card-sub">Unlock setup expectancy, AI trade review, cloud sync</div>
        </div>
        <div className="tlp-pro-card-cta">
          <Sparkles size={14} />
        </div>
      </button>

      <GlassPanel className="tlp-settings-section">
        <h3 className="tlp-section-title"><Palette size={14} /> Theme</h3>
        <div className="tlp-theme-grid">
          {Object.entries(THEMES).map(([key, t]) => (
            <button key={key} onClick={() => setTheme(key)} className={`tlp-theme-swatch ${profile.theme === key ? 'tlp-active' : ''}`}>
              <div className="tlp-swatch-orb" style={{ background: t.accent, boxShadow: `0 0 20px rgba(${t.glow}, 0.6)` }} />
              <span>{t.name}</span>
            </button>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="tlp-settings-section">
        <h3 className="tlp-section-title">Profile</h3>
        <label className="tlp-field">
          <span>Name</span>
          <input className="tlp-input" value={name} onChange={e => setName(e.target.value)} />
        </label>
        <label className="tlp-field">
          <span>Welcome message</span>
          <input className="tlp-input" value={welcome} onChange={e => setWelcome(e.target.value)} />
        </label>
        <label className="tlp-field">
          <span>Starting balance</span>
          <input className="tlp-input" type="number" value={balance} onChange={e => setBalance(e.target.value)} />
          <small className="tlp-hint">Changes the baseline for equity & growth calculations.</small>
        </label>
      </GlassPanel>

      <GlassPanel className="tlp-settings-section">
        <h3 className="tlp-section-title"><Zap size={14} /> Pre-trade check</h3>
        <div className="tlp-toggle-row">
          <div>
            <div className="tlp-toggle-name">Show check on app open</div>
            <div className="tlp-toggle-sub">Force a pause to review your confluences.</div>
          </div>
          <button className="tlp-toggle" data-on={checkEnabled} onClick={() => setCheckEnabled(!checkEnabled)}>
            <span className="tlp-toggle-dot" />
          </button>
        </div>
        {checkEnabled && (
          <label className="tlp-field">
            <span>Countdown duration (seconds)</span>
            <input className="tlp-input" type="number" min="5" max="120" value={checkSec} onChange={e => setCheckSec(e.target.value)} />
          </label>
        )}
      </GlassPanel>

      <Btn full onClick={save}>Save changes</Btn>

      <GlassPanel className="tlp-settings-section">
        <h3 className="tlp-section-title"><Download size={14} /> Data</h3>
        <Btn full variant="ghost" onClick={exportCSV} disabled={!trades.length}>
          <Download size={14} /> Export trades as CSV
        </Btn>
        <Btn full variant="danger-ghost" onClick={onReset}>
          <Trash2 size={14} /> Reset everything
        </Btn>
        <small className="tlp-hint">Reset clears all trades, confluences and settings. Can't be undone.</small>
      </GlassPanel>

      <div className="tlp-foot-note">
        <Activity size={10} /> TRADE LOG PRO · built for discipline
      </div>
    </div>
  );
}

// ============================================================
// ANALYTICS VIEW — deep performance analysis
// Free: R-distribution, day-of-week PnL, hold-time scatter
// Pro: setup expectancy, confluence performance (blurred preview)
// ============================================================
function AnalyticsView({ trades, stats, confluences, onOpenTrade, onLog, onUpgrade }) {
  if (trades.length === 0) {
    return (
      <div className="tlp-view">
        <div className="tlp-view-head">
          <div>
            <div className="tlp-view-kicker">Insights</div>
            <h1 className="tlp-view-title">Analytics</h1>
          </div>
        </div>
        <GlassPanel className="tlp-empty">
          <BarChart3 size={28} style={{ color: 'var(--accent)' }} />
          <div className="tlp-empty-title">No data yet</div>
          <div className="tlp-empty-sub">Log a few trades and we'll calculate your edge — win rate, expectancy, R-distribution, and more.</div>
          <Btn onClick={onLog}>Log a trade</Btn>
        </GlassPanel>
      </div>
    );
  }

  // Compute analytics
  const rDist = computeRDistribution(trades, stats);
  const dayOfWeek = computeDayOfWeek(trades);
  const holdScatter = computeHoldScatter(trades);
  const setupPerf = computeSetupPerformance(trades);
  const conflPerf = computeConfluencePerformance(trades, confluences);

  return (
    <div className="tlp-view">
      <div className="tlp-view-head">
        <div>
          <div className="tlp-view-kicker">Insights</div>
          <h1 className="tlp-view-title">Analytics</h1>
        </div>
      </div>

      {/* Top-line summary */}
      <GlassPanel className="tlp-an-summary">
        <div className="tlp-an-sum-grid">
          <div>
            <span className="tlp-stat-label">Expectancy</span>
            <strong className={stats.expectancy >= 0 ? 'tlp-up' : 'tlp-down'}>{fmtMoney(stats.expectancy)}</strong>
            <small>per trade</small>
          </div>
          <div>
            <span className="tlp-stat-label">Profit factor</span>
            <strong>{computeProfitFactor(trades).toFixed(2)}</strong>
            <small>gains / losses</small>
          </div>
          <div>
            <span className="tlp-stat-label">Avg win / Avg loss</span>
            <strong>{fmtMoney(stats.avgWin)} / {fmtMoney(stats.avgLoss)}</strong>
            <small>R:R = {stats.rr.toFixed(2)}</small>
          </div>
        </div>
      </GlassPanel>

      {/* R-Multiple Distribution */}
      <div className="tlp-an-block">
        <div className="tlp-an-head">
          <h3>P&L distribution</h3>
          <span className="tlp-an-tag tlp-tag-free">FREE</span>
        </div>
        <p className="tlp-an-desc">How your trades cluster — fat tails on the right mean big winners, fat tails on the left mean you're letting losers run.</p>
        <GlassPanel className="tlp-an-chart">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={rDist} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: 'var(--muted)', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                contentStyle={{ background: 'var(--panel-solid)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12, fontFamily: 'JetBrains Mono' }}
                formatter={(v) => [`${v} trade${v !== 1 ? 's' : ''}`, '']}
                labelFormatter={(l) => `Range: ${l}`}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {rDist.map((d, i) => (
                  <rect key={i} fill={d.kind === 'win' ? 'var(--win)' : d.kind === 'loss' ? 'var(--loss)' : 'var(--muted)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassPanel>
      </div>

      {/* Day of Week */}
      <div className="tlp-an-block">
        <div className="tlp-an-head">
          <h3>P&L by day of week</h3>
          <span className="tlp-an-tag tlp-tag-free">FREE</span>
        </div>
        <p className="tlp-an-desc">Which days of the week are profitable for you. Bleed days are real — and usually identifiable.</p>
        <GlassPanel className="tlp-an-chart">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dayOfWeek} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'var(--muted)', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} tickLine={false} width={36}
                tickFormatter={(v) => v >= 1000 || v <= -1000 ? `${(v/1000).toFixed(0)}k` : v} />
              <Tooltip
                contentStyle={{ background: 'var(--panel-solid)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12, fontFamily: 'JetBrains Mono' }}
                formatter={(v) => [fmtMoney(v), 'P&L']}
              />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {dayOfWeek.map((d, i) => (
                  <rect key={i} fill={d.pnl >= 0 ? 'var(--win)' : 'var(--loss)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassPanel>
        <div className="tlp-an-callout">
          <span>Best: <strong className="tlp-up">{dayOfWeek.reduce((b, c) => !b || c.pnl > b.pnl ? c : b, null)?.day}</strong></span>
          <span>Worst: <strong className="tlp-down">{dayOfWeek.reduce((b, c) => !b || c.pnl < b.pnl ? c : b, null)?.day}</strong></span>
        </div>
      </div>

      {/* Hold time scatter */}
      <div className="tlp-an-block">
        <div className="tlp-an-head">
          <h3>Hold time vs P&L</h3>
          <span className="tlp-an-tag tlp-tag-free">FREE</span>
        </div>
        <p className="tlp-an-desc">How long you hold positions vs how much they earn. Look for whether your winners run or whether you're cutting them too early.</p>
        <GlassPanel className="tlp-an-chart">
          <ResponsiveContainer width="100%" height={200}>
            <ScatterChart margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" />
              <XAxis dataKey="x" type="number" name="Hold (min)" tick={{ fill: 'var(--muted)', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => v >= 60 ? `${Math.round(v/60)}h` : `${v}m`} />
              <YAxis dataKey="y" type="number" name="P&L" tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} tickLine={false} width={36}
                tickFormatter={(v) => v >= 1000 || v <= -1000 ? `${(v/1000).toFixed(0)}k` : v} />
              <Tooltip
                cursor={{ stroke: 'var(--accent)', strokeDasharray: '3 3' }}
                contentStyle={{ background: 'var(--panel-solid)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12, fontFamily: 'JetBrains Mono' }}
                formatter={(v, n) => n === 'Hold (min)' ? [fmtDuration(v), 'Hold'] : [fmtMoney(v), 'P&L']}
              />
              <Scatter data={holdScatter}>
                {holdScatter.map((d, i) => (
                  <circle key={i} r={4} fill={d.y >= 0 ? 'var(--win)' : 'var(--loss)'} fillOpacity={0.7} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </GlassPanel>
      </div>

      {/* PRO: Setup Performance — locked preview */}
      <div className="tlp-an-block">
        <div className="tlp-an-head">
          <h3>Setup-by-setup expectancy</h3>
          <span className="tlp-an-tag tlp-tag-pro"><Lock size={9} /> PRO</span>
        </div>
        <p className="tlp-an-desc">Which strategies actually make you money. Cut the losers, scale the winners.</p>
        <GlassPanel className="tlp-pro-locked">
          <div className="tlp-pro-blur">
            {setupPerf.slice(0, 3).map((s, i) => (
              <div key={i} className="tlp-perf-row">
                <div className="tlp-perf-name">{s.setup}</div>
                <div className={`tlp-perf-val ${s.expectancy >= 0 ? 'tlp-up' : 'tlp-down'}`}>{fmtMoney(s.expectancy)}</div>
                <div className="tlp-perf-meta">{s.count} trades · {s.winRate.toFixed(0)}% win</div>
              </div>
            ))}
            {setupPerf.length === 0 && (
              <div className="tlp-perf-row"><div className="tlp-perf-name">Add setup types to your trades to unlock</div></div>
            )}
          </div>
          <div className="tlp-pro-overlay">
            <div className="tlp-pro-overlay-icon"><Crown size={22} /></div>
            <div className="tlp-pro-overlay-title">Unlock with Pro</div>
            <div className="tlp-pro-overlay-sub">See expectancy, win rate, and average R for each of your setups.</div>
            <Btn size="sm" onClick={onUpgrade}>Join the waitlist <Sparkles size={12} /></Btn>
          </div>
        </GlassPanel>
      </div>

      {/* PRO: Confluence Performance — locked preview */}
      <div className="tlp-an-block">
        <div className="tlp-an-head">
          <h3>Confluence performance</h3>
          <span className="tlp-an-tag tlp-tag-pro"><Lock size={9} /> PRO</span>
        </div>
        <p className="tlp-an-desc">Which checklist items actually predict winners. Some confluences are real edge — others are noise.</p>
        <GlassPanel className="tlp-pro-locked">
          <div className="tlp-pro-blur">
            {conflPerf.slice(0, 3).map((c, i) => (
              <div key={i} className="tlp-perf-row">
                <div className="tlp-perf-name">{c.name}</div>
                <div className={`tlp-perf-val ${c.expectancy >= 0 ? 'tlp-up' : 'tlp-down'}`}>{fmtMoney(c.expectancy)}</div>
                <div className="tlp-perf-meta">{c.count} trades · {c.winRate.toFixed(0)}% win</div>
              </div>
            ))}
            {conflPerf.length === 0 && (
              <div className="tlp-perf-row"><div className="tlp-perf-name">Tag trades with confluences to unlock</div></div>
            )}
          </div>
          <div className="tlp-pro-overlay">
            <div className="tlp-pro-overlay-icon"><Crown size={22} /></div>
            <div className="tlp-pro-overlay-title">Unlock with Pro</div>
            <div className="tlp-pro-overlay-sub">Find out which confluences are edge and which are confirmation bias.</div>
            <Btn size="sm" onClick={onUpgrade}>Join the waitlist <Sparkles size={12} /></Btn>
          </div>
        </GlassPanel>
      </div>

      {/* PRO: AI Trade Review teaser */}
      <GlassPanel className="tlp-pro-teaser">
        <div className="tlp-pro-teaser-icon"><Brain size={20} /></div>
        <div className="tlp-pro-teaser-text">
          <div className="tlp-pro-teaser-title">AI Trade Review <span className="tlp-an-tag tlp-tag-pro"><Lock size={9} /> PRO</span></div>
          <p>Get an honest analysis of any trade. What you did right, what was emotional, what to do differently.</p>
        </div>
        <Btn size="sm" variant="ghost" onClick={onUpgrade}>Learn more</Btn>
      </GlassPanel>

      <div className="tlp-foot-note" style={{ marginTop: 8 }}>
        <Activity size={10} /> All metrics computed from {trades.length} trade{trades.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

// --- Analytics computations ---
function computeRDistribution(trades, stats) {
  // Bucket P&Ls into ranges expressed as multiples of average loss (R)
  const r = stats.avgLoss || 1;
  const buckets = [
    { label: '< -3R', min: -Infinity, max: -3 * r, count: 0, kind: 'loss' },
    { label: '-3R to -2R', min: -3 * r, max: -2 * r, count: 0, kind: 'loss' },
    { label: '-2R to -1R', min: -2 * r, max: -1 * r, count: 0, kind: 'loss' },
    { label: '-1R to 0', min: -1 * r, max: 0, count: 0, kind: 'loss' },
    { label: '0 to 1R', min: 0, max: 1 * r, count: 0, kind: 'win' },
    { label: '1R to 2R', min: 1 * r, max: 2 * r, count: 0, kind: 'win' },
    { label: '2R to 3R', min: 2 * r, max: 3 * r, count: 0, kind: 'win' },
    { label: '> 3R', min: 3 * r, max: Infinity, count: 0, kind: 'win' },
  ];
  trades.forEach(t => {
    const b = buckets.find(b => t.pnl >= b.min && t.pnl < b.max) || buckets[buckets.length - 1];
    b.count++;
  });
  return buckets;
}

function computeDayOfWeek(trades) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const data = days.map(d => ({ day: d, pnl: 0, count: 0 }));
  trades.forEach(t => {
    const dow = new Date(t.entryAt).getDay();
    data[dow].pnl += t.pnl || 0;
    data[dow].count++;
  });
  return data;
}

function computeHoldScatter(trades) {
  return trades
    .filter(t => t.durationMinutes !== undefined && t.durationMinutes >= 0)
    .map(t => ({ x: t.durationMinutes, y: t.pnl }));
}

function computeSetupPerformance(trades) {
  const groups = {};
  trades.forEach(t => {
    const key = t.setupType || '(unspecified)';
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });
  return Object.entries(groups).map(([setup, list]) => {
    const wins = list.filter(t => t.pnl > 0);
    const losses = list.filter(t => t.pnl < 0);
    const avgWin = wins.length ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length) : 0;
    const winRate = list.length ? (wins.length / list.length) * 100 : 0;
    const expectancy = ((wins.length / list.length) * avgWin) - ((losses.length / list.length) * avgLoss);
    return { setup, count: list.length, winRate, expectancy, avgWin, avgLoss };
  }).sort((a, b) => b.expectancy - a.expectancy);
}

function computeConfluencePerformance(trades, confluences) {
  return confluences.map(c => {
    const tagged = trades.filter(t => (t.confluenceIds || []).includes(c.id));
    if (tagged.length === 0) return null;
    const wins = tagged.filter(t => t.pnl > 0);
    const losses = tagged.filter(t => t.pnl < 0);
    const avgWin = wins.length ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length) : 0;
    const winRate = tagged.length ? (wins.length / tagged.length) * 100 : 0;
    const expectancy = ((wins.length / tagged.length) * avgWin) - ((losses.length / tagged.length) * avgLoss);
    return { name: c.name, count: tagged.length, winRate, expectancy };
  }).filter(Boolean).sort((a, b) => b.expectancy - a.expectancy);
}

function computeProfitFactor(trades) {
  const gains = trades.filter(t => t.pnl > 0).reduce((s, t) => s + t.pnl, 0);
  const losses = Math.abs(trades.filter(t => t.pnl < 0).reduce((s, t) => s + t.pnl, 0));
  if (losses === 0) return gains > 0 ? Infinity : 0;
  return gains / losses;
}

// ============================================================
// UPGRADE MODAL — waitlist signup
// ============================================================
function UpgradeModal({ open, onClose, showToast }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) {
      setEmail('');
      setSubmitted(false);
      setSubmitting(false);
      setError(null);
    }
  }, [open]);

  const submit = async (e) => {
    e?.preventDefault();
    if (!email.includes('@') || submitting) return;
    setSubmitting(true);
    setError(null);

    // Always save locally first, so we never lose an email
    // even if Formspree is down or blocked.
    try {
      const list = JSON.parse(localStorage.getItem('tlp:waitlist') || '[]');
      if (!list.includes(email)) list.push(email);
      localStorage.setItem('tlp:waitlist', JSON.stringify(list));
    } catch {}

    // Then send to Formspree (the real inbox)
    try {
      const res = await fetch('https://formspree.io/f/xvzdydze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email,
          source: 'in-app upgrade modal',
          timestamp: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Submission failed (${res.status})`);
      }
      setSubmitted(true);
      showToast?.({ msg: "You're on the waitlist", type: 'success' });
    } catch (err) {
      setError(err.message || 'Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title={submitted ? "You're in" : 'Unlock Pro'}>
      {!submitted ? (
        <div className="tlp-upgrade">
          <div className="tlp-upgrade-icon"><Crown size={22} /></div>
          <h2 className="tlp-upgrade-title">Get 50% off Pro for life</h2>
          <p className="tlp-upgrade-sub">Pro launches once 100 traders are using the free version daily. Waitlist members lock in $4/mo forever (regular price $8/mo).</p>

          <div className="tlp-upgrade-perks">
            <div><Check size={14} /> Setup-by-setup expectancy breakdown</div>
            <div><Check size={14} /> Confluence performance analysis</div>
            <div><Check size={14} /> AI trade review (powered by Claude)</div>
            <div><Check size={14} /> Day-of-week & time-of-day heatmaps</div>
            <div><Check size={14} /> Cloud sync across devices</div>
            <div><Check size={14} /> PDF performance reports</div>
          </div>

          <form onSubmit={submit} className="tlp-upgrade-form">
            <input type="email" className="tlp-input" autoFocus required value={email}
              onChange={e => { setEmail(e.target.value); setError(null); }}
              placeholder="you@email.com" disabled={submitting} />
            {error && (
              <div className="tlp-form-error">
                <AlertCircle size={13} />
                <span>{error}</span>
              </div>
            )}
            <Btn type="submit" full disabled={submitting || !email.includes('@')}>
              {submitting ? <>Sending… <RefreshCw size={14} className="tlp-spin" /></> : <>Reserve my spot <Sparkles size={14} /></>}
            </Btn>
          </form>
          <small className="tlp-hint" style={{ textAlign: 'center', display: 'block', marginTop: 12 }}>
            No spam. One email when Pro is ready.
          </small>
        </div>
      ) : (
        <div className="tlp-upgrade tlp-upgrade-done">
          <div className="tlp-upgrade-icon tlp-upgrade-icon-ok"><Check size={22} /></div>
          <h2 className="tlp-upgrade-title">Locked in.</h2>
          <p className="tlp-upgrade-sub">We'll email you the moment Pro launches with your 50%-off code waiting.</p>
          <Btn full onClick={onClose}>Back to the journal</Btn>
        </div>
      )}
    </Sheet>
  );
}

// ============================================================
// BOTTOM NAV + FAB
// ============================================================
function BottomNav({ view, setView, onLog }) {
  const items = [
    { key: 'home', icon: Home, label: 'Home' },
    { key: 'calendar', icon: CalIcon, label: 'Calendar' },
    { key: 'fab', icon: Plus, label: 'Log' },
    { key: 'analytics', icon: BarChart3, label: 'Analytics' },
    { key: 'settings', icon: SettingsIcon, label: 'Setup' },
  ];
  return (
    <nav className="tlp-nav">
      {items.map(it => {
        if (it.key === 'fab') {
          return (
            <button key="fab" className="tlp-fab" onClick={onLog}>
              <Plus size={22} />
            </button>
          );
        }
        const active = view === it.key || (it.key === 'settings' && (view === 'settings' || view === 'confluences'));
        const Icon = it.icon;
        return (
          <button key={it.key} className={`tlp-nav-item ${active ? 'tlp-active' : ''}`} onClick={() => setView(it.key)}>
            <Icon size={18} />
            <span>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  useFonts();
  const [booted, setBooted] = useState(false);
  const [profile, setProfileState] = useState(null);
  const [confluences, setConfluencesState] = useState([]);
  const [trades, setTradesState] = useState([]);

  // phase: 'onboard' | 'intro' | 'check' | 'app'
  const [phase, setPhase] = useState('loading');
  const [view, setView] = useState('home');
  const [settingsSubView, setSettingsSubView] = useState('main'); // main | confluences

  const [tradeFormOpen, setTradeFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detail, setDetail] = useState(null);
  const [dayKey, setDayKey] = useState(null);
  const [toast, setToast] = useState(null);

  // markets
  const marketData = useMarketData();
  const [marketsOpen, setMarketsOpen] = useState(false);
  const [marketDetail, setMarketDetail] = useState(null);
  const [prefillMarket, setPrefillMarket] = useState(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  // load state
  useEffect(() => {
    (async () => {
      const p = await storageGet(KEY.profile);
      const c = await storageGet(KEY.confluences, []);
      const t = await storageGet(KEY.trades, []);
      setProfileState(p);
      setConfluencesState(c || []);
      setTradesState(t || []);
      if (!p || !p.onboarded) setPhase('onboard');
      else setPhase('intro');
      setBooted(true);
    })();
  }, []);

  const setProfile = async (next) => { setProfileState(next); await storageSet(KEY.profile, next); };
  const setConfluences = async (next) => { setConfluencesState(next); await storageSet(KEY.confluences, next); };
  const setTrades = async (next) => { setTradesState(next); await storageSet(KEY.trades, next); };

  const stats = useMemo(() => computeStats(trades, profile?.startingBalance || 0), [trades, profile?.startingBalance]);

  const onboardDone = (p) => {
    setProfileState(p);
    setPhase('intro');
  };

  const introDone = () => {
    if (profile?.confluenceCheckEnabled !== false && confluences.some(c => c.active)) {
      setPhase('check');
    } else {
      setPhase('app');
    }
  };

  const checkDone = () => setPhase('app');

  const saveTrade = async (trade) => {
    const exists = trades.find(t => t.id === trade.id);
    const next = exists ? trades.map(t => t.id === trade.id ? trade : t) : [...trades, trade];
    await setTrades(next);
    setTradeFormOpen(false);
    setEditing(null);
    setPrefillMarket(null);
    setToast({ msg: exists ? 'Trade updated' : 'Trade logged', type: 'success' });
  };

  const deleteTrade = async (id) => {
    await setTrades(trades.filter(t => t.id !== id));
    await storageDel(KEY.screenshot(id));
    setTradeFormOpen(false);
    setEditing(null);
    setDetail(null);
    setToast({ msg: 'Trade deleted', type: 'success' });
  };

  const openEdit = () => {
    setEditing(detail);
    setDetail(null);
    setTradeFormOpen(true);
  };

  const resetAll = async () => {
    if (!confirm('This wipes all trades, confluences and settings. Continue?')) return;
    // delete screenshots
    for (const t of trades) await storageDel(KEY.screenshot(t.id));
    await storageDel(KEY.trades);
    await storageDel(KEY.confluences);
    await storageDel(KEY.profile);
    setProfileState(null);
    setTradesState([]);
    setConfluencesState([]);
    setPhase('onboard');
  };

  // Market handlers
  const onPickMarketTile = (m) => { setMarketDetail(m); };
  const onPickMarketRow = (m) => { setMarketsOpen(false); setMarketDetail(m); };
  const onLogTradeFromMarket = (m) => {
    setMarketDetail(null);
    setMarketsOpen(false);
    setPrefillMarket(m);
    setTradeFormOpen(true);
  };

  const theme = THEMES[profile?.theme || 'green'];

  if (!booted) {
    return <div className="tlp-boot"><div className="tlp-spinner" /></div>;
  }

  return (
    <div className={`tlp-root tlp-${theme.mode}`} style={{
      '--accent': theme.accent,
      '--accent-glow': `rgba(${theme.glow}, 0.5)`,
      '--accent-soft': `rgba(${theme.glow}, 0.12)`,
      '--accent-border': `rgba(${theme.glow}, 0.28)`,
      '--bg': theme.bg,
      '--panel': theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
      '--panel-solid': theme.panel,
      '--border': theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
      '--fg': theme.mode === 'dark' ? '#f4f4f5' : '#0f172a',
      '--muted': theme.mode === 'dark' ? '#8a8a8f' : '#64748b',
      '--win': '#10d9a0',
      '--loss': '#ef4444',
    }}>
      <GlobalStyles />

      {phase === 'onboard' && <Onboarding onDone={onboardDone} />}
      {phase === 'intro' && profile && <IntroAnimation profile={profile} onDone={introDone} />}
      {phase === 'check' && <ConfluenceCheckScreen
        confluences={confluences}
        seconds={profile?.confluenceCheckSeconds || 20}
        onDone={checkDone}
      />}

      {phase === 'app' && profile && (
        <div className="tlp-app">
          <div className="tlp-app-bg">
            <div className="tlp-bg-orb tlp-bg-orb-1" />
            <div className="tlp-bg-orb tlp-bg-orb-2" />
            <div className="tlp-bg-grid" />
          </div>

          <main className="tlp-main">
            {view === 'home' && (
              <Dashboard
                profile={profile}
                trades={trades}
                stats={stats}
                onOpenTrade={setDetail}
                onLog={() => setTradeFormOpen(true)}
                marketData={marketData}
                onOpenMarkets={() => setMarketsOpen(true)}
                onPickMarket={onPickMarketTile}
              />
            )}
            {view === 'calendar' && (
              <CalendarView trades={trades} onDayClick={setDayKey} />
            )}
            {view === 'analytics' && (
              <AnalyticsView
                trades={trades}
                stats={stats}
                confluences={confluences}
                onOpenTrade={setDetail}
                onLog={() => setTradeFormOpen(true)}
                onUpgrade={() => setUpgradeOpen(true)}
              />
            )}
            {view === 'settings' && (
              <>
                <div className="tlp-settings-tabs">
                  <button className={settingsSubView === 'main' ? 'tlp-active' : ''} onClick={() => setSettingsSubView('main')}>Settings</button>
                  <button className={settingsSubView === 'confluences' ? 'tlp-active' : ''} onClick={() => setSettingsSubView('confluences')}>Confluences</button>
                </div>
                {settingsSubView === 'main' ? (
                  <SettingsView profile={profile} setProfile={setProfile} trades={trades} confluences={confluences} onReset={resetAll} showToast={setToast} onUpgrade={() => setUpgradeOpen(true)} />
                ) : (
                  <ConfluencesView confluences={confluences} setConfluences={setConfluences} showToast={setToast} />
                )}
              </>
            )}
          </main>

          <BottomNav view={view} setView={setView} onLog={() => setTradeFormOpen(true)} />

          <TradeForm
            open={tradeFormOpen}
            onClose={() => { setTradeFormOpen(false); setEditing(null); setPrefillMarket(null); }}
            onSave={saveTrade}
            confluences={confluences}
            editing={editing}
            onDelete={deleteTrade}
            showToast={setToast}
            prefillMarket={prefillMarket}
          />

          <TradeDetail
            trade={detail}
            confluences={confluences}
            onClose={() => setDetail(null)}
            onEdit={openEdit}
          />

          <DayModal
            dayKey={dayKey}
            trades={trades}
            onClose={() => setDayKey(null)}
            onOpenTrade={(t) => { setDayKey(null); setDetail(t); }}
          />

          <MarketsSheet
            open={marketsOpen}
            onClose={() => setMarketsOpen(false)}
            markets={marketData.markets}
            loading={marketData.loading}
            error={marketData.error}
            lastFetch={marketData.lastFetch}
            onRefresh={marketData.refresh}
            onPickMarket={onPickMarketRow}
          />

          <MarketDetailSheet
            market={marketDetail}
            onClose={() => setMarketDetail(null)}
            onLogTrade={onLogTradeFromMarket}
          />

          <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} showToast={setToast} />
        </div>
      )}

      <Toast toast={toast} onDone={() => setToast(null)} />
    </div>
  );
}

// ============================================================
// GLOBAL STYLES
// ============================================================
function GlobalStyles() {
  return (
    <style>{`
      .tlp-root { font-family: 'Outfit', system-ui, sans-serif; color: var(--fg); min-height: 100vh; }
      .tlp-root, .tlp-root * { box-sizing: border-box; }
      .tlp-root button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }
      .tlp-root input, .tlp-root textarea, .tlp-root select { font-family: inherit; }

      .tlp-boot { min-height: 100vh; display: grid; place-items: center; background: #050505; }
      .tlp-spinner { width: 32px; height: 32px; border: 2px solid rgba(255,255,255,0.1); border-top-color: #10d9a0; border-radius: 50%; animation: tlp-spin 0.8s linear infinite; }
      @keyframes tlp-spin { to { transform: rotate(360deg); } }

      /* ==== APP LAYOUT ==== */
      .tlp-app { min-height: 100vh; background: var(--bg); position: relative; overflow: hidden; padding-bottom: 96px; }
      .tlp-app-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
      .tlp-bg-orb { position: absolute; width: 400px; height: 400px; border-radius: 50%; filter: blur(90px); opacity: 0.35; }
      .tlp-bg-orb-1 { background: var(--accent); top: -150px; right: -120px; animation: tlp-float 18s ease-in-out infinite; }
      .tlp-bg-orb-2 { background: var(--accent); bottom: -150px; left: -150px; opacity: 0.2; animation: tlp-float 22s ease-in-out infinite reverse; }
      @keyframes tlp-float { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,-30px) scale(1.1); } }
      .tlp-bg-grid { position: absolute; inset: 0; background-image: linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px); background-size: 48px 48px; opacity: 0.35; mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%); }

      .tlp-main { position: relative; z-index: 1; max-width: 560px; margin: 0 auto; padding: 20px 16px; }

      /* ==== GLASS PANEL ==== */
      .tlp-glass { background: var(--panel); backdrop-filter: blur(18px) saturate(140%); -webkit-backdrop-filter: blur(18px) saturate(140%); border: 1px solid var(--border); border-radius: 16px; padding: 16px; position: relative; }
      .tlp-dark .tlp-glass { background: linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)); }
      .tlp-light .tlp-glass { background: rgba(255,255,255,0.7); box-shadow: 0 1px 2px rgba(0,0,0,0.04); }

      /* ==== MARKETS TICKER ==== */
      .tlp-markets-widget { display: flex; flex-direction: column; gap: 8px; }
      .tlp-markets-head { margin-bottom: 0 !important; }
      .tlp-markets-title { display: flex; align-items: center; gap: 8px; }
      .tlp-markets-title h3 { font-size: 15px; font-weight: 600; margin: 0; letter-spacing: -0.01em; }
      .tlp-markets-fresh { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; color: var(--accent); text-transform: uppercase; font-family: 'JetBrains Mono', monospace; }
      .tlp-markets-loading { font-size: 11px; color: var(--muted); font-weight: 500; }
      .tlp-live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 6px var(--accent-glow); animation: tlp-pulse 1.6s ease-in-out infinite; }
      @keyframes tlp-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.85); } }
      .tlp-link-btn { display: inline-flex; align-items: center; gap: 2px; font-size: 12px; color: var(--accent); font-weight: 600; padding: 4px 2px; }
      .tlp-link-btn:hover { opacity: 0.8; }

      .tlp-markets-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
      .tlp-market-tile { padding: 12px 14px; background: var(--panel); border: 1px solid var(--border); border-radius: 13px; backdrop-filter: blur(12px); text-align: left; transition: all 0.15s ease; display: flex; flex-direction: column; gap: 4px; position: relative; overflow: hidden; }
      .tlp-market-tile::before { content: ''; position: absolute; top: 0; left: 0; width: 2px; height: 100%; background: var(--accent); opacity: 0; transition: opacity 0.2s ease; }
      .tlp-market-tile:hover { border-color: var(--accent-border); transform: translateY(-1px); }
      .tlp-market-tile:hover::before { opacity: 1; }
      .tlp-market-tile:active { transform: scale(0.99); }
      .tlp-market-tile-top { display: flex; justify-content: space-between; align-items: center; gap: 6px; }
      .tlp-market-sym { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 13px; letter-spacing: -0.01em; }
      .tlp-market-chg { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 11px; padding: 2px 6px; border-radius: 5px; }
      .tlp-market-chg.tlp-up { color: var(--win); background: rgba(16, 217, 160, 0.12); }
      .tlp-market-chg.tlp-down { color: var(--loss); background: rgba(239, 68, 68, 0.12); }
      .tlp-market-price { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 18px; letter-spacing: -0.02em; line-height: 1; }
      .tlp-market-cat { font-size: 9px; letter-spacing: 0.12em; color: var(--muted); font-weight: 700; font-family: 'JetBrains Mono', monospace; }

      .tlp-market-skel { height: 78px; background: linear-gradient(90deg, var(--panel) 0%, var(--accent-soft) 50%, var(--panel) 100%); background-size: 200% 100%; animation: tlp-skel 1.4s ease-in-out infinite; border: 1px solid var(--border); border-radius: 13px; }
      @keyframes tlp-skel { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

      .tlp-markets-err { display: flex; align-items: center; gap: 12px; padding: 16px; }
      .tlp-markets-err-title { font-size: 13px; font-weight: 600; }
      .tlp-markets-err-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }

      /* ==== MARKETS SHEET ==== */
      .tlp-markets-body { display: flex; flex-direction: column; gap: 12px; }
      .tlp-markets-status { display: flex; justify-content: space-between; align-items: center; padding: 0 2px; }
      .tlp-search-wrap { display: flex; align-items: center; gap: 8px; padding: 11px 13px; background: var(--panel); border: 1px solid var(--border); border-radius: 11px; transition: all 0.15s ease; color: var(--muted); }
      .tlp-search-wrap:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
      .tlp-search { flex: 1; background: transparent; border: none; outline: none; color: var(--fg); font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 500; }
      .tlp-search::placeholder { color: var(--muted); }
      .tlp-search-clear { padding: 2px; display: grid; place-items: center; color: var(--muted); }

      .tlp-markets-tabs { width: 100%; }
      .tlp-markets-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; }
      .tlp-market-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: var(--panel); border: 1px solid var(--border); border-radius: 12px; text-align: left; transition: all 0.15s ease; backdrop-filter: blur(10px); width: 100%; }
      .tlp-market-row:hover { border-color: var(--accent-border); }
      .tlp-market-row:active { transform: scale(0.99); }
      .tlp-market-icon { width: 32px; height: 32px; border-radius: 10px; display: grid; place-items: center; flex-shrink: 0; }
      .tlp-market-icon.tlp-crypto { background: linear-gradient(135deg, rgba(247, 147, 26, 0.18), rgba(247, 147, 26, 0.06)); color: #f7931a; }
      .tlp-market-icon.tlp-forex { background: linear-gradient(135deg, var(--accent-soft), transparent); color: var(--accent); }
      .tlp-market-info { flex: 1; min-width: 0; }
      .tlp-market-row-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
      .tlp-market-price-row { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 14px; }
      .tlp-market-row-bot { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: 2px; }
      .tlp-market-name { font-size: 11px; color: var(--muted); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 60%; }

      .tlp-markets-foot-note { text-align: center; font-size: 10px; color: var(--muted); letter-spacing: 0.1em; font-weight: 600; text-transform: uppercase; padding: 8px 0; font-family: 'JetBrains Mono', monospace; opacity: 0.6; }

      .tlp-spin { animation: tlp-spin 0.9s linear infinite; }

      /* ==== MARKET DETAIL ==== */
      .tlp-md-detail { display: flex; flex-direction: column; gap: 14px; }
      .tlp-md-name { font-size: 13px; color: var(--muted); font-weight: 500; }
      .tlp-md-price { font-family: 'JetBrains Mono', monospace; font-size: 44px; font-weight: 700; letter-spacing: -0.03em; line-height: 1; color: var(--accent); text-shadow: 0 0 24px var(--accent-glow); }
      .tlp-md-chg { display: inline-flex; align-items: center; gap: 6px; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 14px; padding: 6px 10px; border-radius: 8px; align-self: flex-start; }
      .tlp-md-chg.tlp-up { color: var(--win); background: rgba(16, 217, 160, 0.12); }
      .tlp-md-chg.tlp-down { color: var(--loss); background: rgba(239, 68, 68, 0.12); }
      .tlp-md-chg-label { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.7; margin-left: 4px; }
      .tlp-md-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; padding-top: 12px; border-top: 1px solid var(--border); }
      .tlp-md-grid > div { display: flex; flex-direction: column; gap: 3px; }
      .tlp-md-grid span { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); font-weight: 600; }
      .tlp-md-grid strong { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 600; }
      .tlp-md-note { display: flex; gap: 8px; padding: 10px 12px; background: var(--accent-soft); border: 1px solid var(--accent-border); border-radius: 9px; font-size: 11px; color: var(--fg); line-height: 1.45; align-items: flex-start; }
      .tlp-md-note svg { flex-shrink: 0; margin-top: 1px; color: var(--accent); }

      /* ==== CSS VARS (updates) ==== */

      /* ==== TYPOGRAPHY ==== */
      .tlp-view { display: flex; flex-direction: column; gap: 14px; }
      .tlp-view-head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 4px; }
      .tlp-view-kicker { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--muted); font-weight: 600; }
      .tlp-view-title { font-size: 28px; font-weight: 700; margin: 2px 0 0; letter-spacing: -0.02em; }

      .tlp-h1 { font-size: 26px; font-weight: 700; margin: 0 0 8px; letter-spacing: -0.02em; }
      .tlp-sub { color: var(--muted); font-size: 14px; margin: 0 0 16px; }

      /* ==== HERO ==== */
      .tlp-hero { padding: 20px; background: linear-gradient(140deg, var(--accent-soft) 0%, transparent 60%), var(--panel) !important; border: 1px solid var(--accent-border) !important; position: relative; overflow: hidden; }
      .tlp-hero::before { content: ''; position: absolute; top: -50%; right: -20%; width: 60%; height: 200%; background: radial-gradient(circle, var(--accent-glow), transparent 70%); opacity: 0.25; filter: blur(30px); pointer-events: none; }
      .tlp-hero-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; position: relative; }
      .tlp-hero-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; color: var(--muted); font-weight: 600; margin-bottom: 4px; }
      .tlp-hero-value { font-family: 'JetBrains Mono', monospace; font-size: 36px; font-weight: 700; letter-spacing: -0.02em; line-height: 1; margin: 4px 0 8px; }
      .tlp-hero-delta { font-family: 'JetBrains Mono', monospace; font-size: 13px; display: inline-flex; align-items: center; gap: 4px; font-weight: 600; padding: 4px 8px; border-radius: 6px; }
      .tlp-hero-delta.tlp-up { color: var(--win); background: rgba(16, 217, 160, 0.12); }
      .tlp-hero-delta.tlp-down { color: var(--loss); background: rgba(239, 68, 68, 0.12); }
      .tlp-hero-meta { text-align: right; }
      .tlp-hero-meta-label { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; color: var(--muted); font-weight: 600; }
      .tlp-hero-meta-value { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 500; color: var(--fg); }
      .tlp-hero-chart { margin-top: 12px; margin-left: -16px; margin-right: -16px; margin-bottom: -4px; }
      .tlp-chart-empty { padding: 40px 20px; text-align: center; color: var(--muted); font-size: 13px; }

      /* ==== STATS GRID ==== */
      .tlp-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
      .tlp-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
      .tlp-stat { padding: 12px 14px; }
      .tlp-stat-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
      .tlp-stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--muted); font-weight: 600; }
      .tlp-stat-value { font-family: 'JetBrains Mono', monospace; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.1; }
      .tlp-stat-sub { font-size: 11px; color: var(--muted); margin-top: 4px; font-weight: 500; }

      .tlp-mini-card { padding: 14px; }
      .tlp-mini-kicker { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--muted); font-weight: 600; margin-bottom: 6px; }
      .tlp-mini-value { font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 700; letter-spacing: -0.02em; }
      .tlp-mini-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }

      .tlp-up { color: var(--win); }
      .tlp-down { color: var(--loss); }

      /* ==== DISCIPLINE CARD ==== */
      .tlp-disc { padding: 14px 16px; }
      .tlp-disc-head { display: flex; justify-content: space-between; align-items: center; }
      .tlp-disc-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--muted); font-weight: 600; }
      .tlp-disc-value { font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 700; color: var(--accent); }
      .tlp-disc-stars { display: flex; gap: 4px; margin: 8px 0 6px; }
      .tlp-disc-hint { font-size: 11px; color: var(--muted); }

      /* ==== SECTION HEAD ==== */
      .tlp-section-head { display: flex; justify-content: space-between; align-items: baseline; margin-top: 6px; margin-bottom: 2px; }
      .tlp-section-head h3 { font-size: 15px; font-weight: 600; margin: 0; letter-spacing: -0.01em; }
      .tlp-section-count { font-size: 11px; color: var(--muted); font-family: 'JetBrains Mono', monospace; }

      /* ==== TRADE ROW ==== */
      .tlp-trade-list { display: flex; flex-direction: column; gap: 8px; }
      .tlp-trade-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: var(--panel); border: 1px solid var(--border); border-radius: 14px; backdrop-filter: blur(12px); text-align: left; width: 100%; transition: all 0.15s ease; }
      .tlp-trade-row:hover { border-color: var(--accent-border); transform: translateY(-1px); }
      .tlp-trade-row:active { transform: scale(0.99); }
      .tlp-trade-side { width: 32px; height: 32px; border-radius: 10px; display: grid; place-items: center; flex-shrink: 0; }
      .tlp-trade-side.tlp-buy { background: rgba(16, 217, 160, 0.14); color: var(--win); }
      .tlp-trade-side.tlp-sell { background: rgba(239, 68, 68, 0.14); color: var(--loss); }
      .tlp-trade-main { flex: 1; min-width: 0; }
      .tlp-trade-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
      .tlp-trade-asset { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 14px; letter-spacing: -0.01em; }
      .tlp-trade-pnl { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 14px; }
      .tlp-trade-bot { display: flex; gap: 6px; align-items: center; margin-top: 2px; font-size: 11px; color: var(--muted); font-weight: 500; }

      /* ==== EMPTY ==== */
      .tlp-empty { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 36px 20px; text-align: center; }
      .tlp-empty-title { font-size: 15px; font-weight: 600; margin-top: 2px; }
      .tlp-empty-sub { font-size: 13px; color: var(--muted); max-width: 280px; }
      .tlp-empty-sm { padding: 14px; color: var(--muted); text-align: center; font-size: 13px; background: var(--panel); border-radius: 10px; border: 1px dashed var(--border); }

      /* ==== BUTTONS ==== */
      .tlp-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 11px 16px; border-radius: 11px; font-weight: 600; font-size: 14px; letter-spacing: -0.01em; transition: all 0.15s ease; white-space: nowrap; }
      .tlp-btn-primary { background: var(--accent); color: var(--bg); box-shadow: 0 4px 20px rgba(var(--accent-glow), 0.3); }
      .tlp-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 24px var(--accent-glow); }
      .tlp-btn-primary:active:not(:disabled) { transform: scale(0.98); }
      .tlp-btn-ghost { background: var(--panel); border: 1px solid var(--border); color: var(--fg); }
      .tlp-btn-ghost:hover { border-color: var(--accent-border); }
      .tlp-btn-danger { background: rgba(239,68,68,0.12); color: var(--loss); border: 1px solid rgba(239,68,68,0.3); }
      .tlp-btn-danger-ghost { background: transparent; color: var(--loss); border: 1px solid rgba(239,68,68,0.3); }
      .tlp-btn-danger-ghost:hover { background: rgba(239,68,68,0.08); }
      .tlp-btn-full { width: 100%; }
      .tlp-btn-sm { padding: 8px 12px; font-size: 13px; }
      .tlp-btn:disabled { opacity: 0.45; cursor: not-allowed; }

      .tlp-icon-btn { padding: 8px; border-radius: 9px; background: var(--panel); border: 1px solid var(--border); color: var(--fg); display: inline-flex; align-items: center; justify-content: center; transition: all 0.15s ease; font-size: 13px; font-weight: 500; gap: 4px; }
      .tlp-icon-btn:hover { border-color: var(--accent-border); }
      .tlp-icon-btn.tlp-danger:hover { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.3); color: var(--loss); }

      .tlp-hint-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--accent); padding: 6px 10px; background: var(--accent-soft); border-radius: 8px; align-self: flex-start; font-weight: 600; }

      .tlp-row { display: flex; gap: 10px; margin-top: 12px; }
      .tlp-row .tlp-btn { flex: 1; }

      /* ==== FIELDS ==== */
      .tlp-field { display: flex; flex-direction: column; gap: 6px; }
      .tlp-field > span { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 600; color: var(--muted); }
      .tlp-input { width: 100%; padding: 12px 14px; background: var(--panel); border: 1px solid var(--border); border-radius: 11px; color: var(--fg); font-size: 15px; font-weight: 500; transition: all 0.15s ease; font-family: 'JetBrains Mono', monospace; }
      .tlp-input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
      .tlp-textarea { font-family: 'Outfit', sans-serif; resize: vertical; min-height: 80px; }
      .tlp-input-prefix { display: flex; align-items: center; background: var(--panel); border: 1px solid var(--border); border-radius: 11px; padding-left: 14px; }
      .tlp-input-prefix span { color: var(--muted); font-family: 'JetBrains Mono', monospace; }
      .tlp-input-prefix input { background: transparent; border: none; padding-left: 6px; }
      .tlp-input-prefix input:focus { box-shadow: none; }
      .tlp-hint { font-size: 11px; color: var(--muted); font-weight: 500; }
      .tlp-select { width: 100%; padding: 9px 12px; background: var(--panel); border: 1px solid var(--border); border-radius: 9px; color: var(--fg); font-size: 13px; font-weight: 500; }

      /* ==== SEGMENTED ==== */
      .tlp-seg { display: flex; background: var(--panel); border: 1px solid var(--border); border-radius: 11px; padding: 4px; gap: 2px; }
      .tlp-seg-btn { flex: 1; padding: 10px 8px; border-radius: 8px; font-weight: 600; font-size: 13px; color: var(--muted); transition: all 0.15s ease; display: inline-flex; align-items: center; justify-content: center; gap: 4px; }
      .tlp-seg-btn.tlp-active { color: var(--fg); background: rgba(255,255,255,0.06); }
      .tlp-light .tlp-seg-btn.tlp-active { background: rgba(0,0,0,0.06); }
      .tlp-seg-btn.tlp-active.tlp-buy { color: var(--win); background: rgba(16, 217, 160, 0.12); }
      .tlp-seg-btn.tlp-active.tlp-sell { color: var(--loss); background: rgba(239, 68, 68, 0.12); }
      .tlp-seg-sm .tlp-seg-btn { padding: 8px 6px; font-size: 12px; }

      /* ==== CHIPS ==== */
      .tlp-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
      .tlp-chip { padding: 6px 10px; background: var(--panel); border: 1px solid var(--border); border-radius: 7px; font-size: 12px; font-weight: 500; color: var(--muted); transition: all 0.15s ease; font-family: 'JetBrains Mono', monospace; }
      .tlp-chip:hover { color: var(--fg); }
      .tlp-chip.tlp-active { background: var(--accent-soft); color: var(--accent); border-color: var(--accent-border); }

      /* ==== CONFLUENCE PILLS IN FORM ==== */
      .tlp-conf-picker { display: flex; flex-wrap: wrap; gap: 6px; }
      .tlp-conf-pill { display: inline-flex; align-items: center; gap: 4px; padding: 7px 11px; background: var(--panel); border: 1px solid var(--border); border-radius: 999px; font-size: 12px; font-weight: 500; color: var(--muted); transition: all 0.15s ease; }
      .tlp-conf-pill.tlp-active { background: var(--accent-soft); color: var(--accent); border-color: var(--accent-border); }

      /* ==== STARS ==== */
      .tlp-star-picker { display: flex; gap: 6px; padding: 8px 0; }
      .tlp-star-picker button { padding: 2px; transition: transform 0.15s ease; }
      .tlp-star-picker button:hover { transform: scale(1.15); }

      /* ==== SCREENSHOT ==== */
      .tlp-shot-add { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 20px; background: var(--panel); border: 1.5px dashed var(--border); border-radius: 12px; color: var(--muted); font-size: 13px; font-weight: 500; transition: all 0.15s ease; }
      .tlp-shot-add:hover { border-color: var(--accent); color: var(--accent); }
      .tlp-shot-add small { font-size: 11px; opacity: 0.7; }
      .tlp-shot-preview { position: relative; border-radius: 12px; overflow: hidden; border: 1px solid var(--border); }
      .tlp-shot-preview img { display: block; width: 100%; max-height: 260px; object-fit: cover; }
      .tlp-shot-rm { position: absolute; top: 8px; right: 8px; width: 28px; height: 28px; border-radius: 50%; background: rgba(0,0,0,0.6); color: white; backdrop-filter: blur(6px); display: grid; place-items: center; }

      /* ==== SHEET / MODAL ==== */
      .tlp-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); opacity: 0; pointer-events: none; transition: opacity 0.25s ease; z-index: 100; }
      .tlp-backdrop.tlp-open { opacity: 1; pointer-events: auto; }
      .tlp-sheet { position: fixed; left: 0; right: 0; bottom: 0; max-height: 92vh; background: var(--panel-solid); border-top: 1px solid var(--border); border-radius: 22px 22px 0 0; z-index: 101; transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; box-shadow: 0 -8px 40px rgba(0,0,0,0.4); }
      .tlp-sheet.tlp-open { transform: translateY(0); }
      @media (min-width: 640px) {
        .tlp-sheet { left: 50%; right: auto; bottom: 3vh; transform: translate(-50%, calc(100% + 3vh)); width: 540px; border-radius: 22px; border: 1px solid var(--border); max-height: 90vh; }
        .tlp-sheet.tlp-open { transform: translate(-50%, 0); }
      }
      .tlp-sheet-drag { width: 40px; height: 4px; background: var(--border); border-radius: 2px; margin: 10px auto 0; flex-shrink: 0; }
      .tlp-sheet-head { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px 4px; flex-shrink: 0; }
      .tlp-sheet-title { font-size: 18px; font-weight: 700; margin: 0; letter-spacing: -0.01em; }
      .tlp-sheet-body { overflow-y: auto; padding: 12px 20px 20px; flex: 1; }
      .tlp-sheet-foot { padding: 12px 20px 20px; border-top: 1px solid var(--border); flex-shrink: 0; display: flex; gap: 8px; }

      /* ==== FORM ==== */
      .tlp-form { display: flex; flex-direction: column; gap: 14px; }
      .tlp-grid-2-form { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .tlp-duration-preview { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; background: var(--accent-soft); color: var(--accent); border-radius: 9px; font-size: 12px; font-weight: 600; align-self: flex-start; }
      .tlp-form-foot { display: flex; gap: 8px; width: 100%; }

      /* ==== TRADE DETAIL ==== */
      .tlp-detail { display: flex; flex-direction: column; gap: 16px; }
      .tlp-detail-head { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
      .tlp-detail-asset { font-family: 'JetBrains Mono', monospace; font-size: 22px; font-weight: 700; letter-spacing: -0.01em; }
      .tlp-detail-type { display: inline-flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; padding: 3px 8px; border-radius: 5px; margin-top: 4px; }
      .tlp-detail-type.tlp-buy { background: rgba(16, 217, 160, 0.12); color: var(--win); }
      .tlp-detail-type.tlp-sell { background: rgba(239, 68, 68, 0.12); color: var(--loss); }
      .tlp-detail-pnl { font-family: 'JetBrains Mono', monospace; font-size: 22px; font-weight: 700; }
      .tlp-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; }
      .tlp-detail-grid > div { display: flex; flex-direction: column; gap: 2px; }
      .tlp-detail-grid span { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); font-weight: 600; }
      .tlp-detail-grid strong { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 600; }
      .tlp-detail-block { padding-top: 12px; border-top: 1px solid var(--border); }
      .tlp-detail-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--muted); font-weight: 600; margin-bottom: 8px; }
      .tlp-notes-text { margin: 0; font-size: 14px; line-height: 1.5; white-space: pre-wrap; }
      .tlp-detail-shot { width: 100%; border-radius: 12px; border: 1px solid var(--border); }

      /* ==== CALENDAR ==== */
      .tlp-cal-nav { display: flex; gap: 6px; }
      .tlp-cal-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 16px; }
      .tlp-cal-sum-val { font-family: 'JetBrains Mono', monospace; font-size: 20px; font-weight: 700; margin-top: 2px; }
      .tlp-cal { padding: 14px 10px; background: var(--panel); border: 1px solid var(--border); border-radius: 16px; backdrop-filter: blur(12px); }
      .tlp-cal-dow { display: grid; grid-template-columns: repeat(7, 1fr); margin-bottom: 8px; }
      .tlp-cal-dow span { text-align: center; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; color: var(--muted); }
      .tlp-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
      .tlp-cal-cell { aspect-ratio: 1; display: flex; flex-direction: column; justify-content: space-between; padding: 4px 5px; border-radius: 8px; font-size: 11px; border: 1px solid transparent; transition: all 0.15s ease; overflow: hidden; }
      .tlp-cal-cell.tlp-empty-cell { background: transparent; }
      .tlp-cal-day { font-family: 'JetBrains Mono', monospace; font-weight: 600; font-size: 11px; color: var(--muted); align-self: flex-start; }
      .tlp-cal-pnl { font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 700; letter-spacing: -0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .tlp-cal-count { font-size: 8px; color: var(--muted); font-weight: 500; }
      .tlp-cal-win { background: rgba(16, 217, 160, 0.15); border-color: rgba(16, 217, 160, 0.3); }
      .tlp-cal-win .tlp-cal-day { color: var(--win); }
      .tlp-cal-win .tlp-cal-pnl { color: var(--win); }
      .tlp-cal-loss { background: rgba(239, 68, 68, 0.13); border-color: rgba(239, 68, 68, 0.28); }
      .tlp-cal-loss .tlp-cal-day { color: var(--loss); }
      .tlp-cal-loss .tlp-cal-pnl { color: var(--loss); }
      .tlp-cal-flat { background: rgba(255,255,255,0.03); }
      .tlp-cal-today { box-shadow: 0 0 0 1.5px var(--accent); }
      .tlp-cal-today .tlp-cal-day { color: var(--accent) !important; }
      .tlp-cal-cell:not(.tlp-empty-cell):hover { transform: scale(1.04); }

      .tlp-cal-legend { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; font-size: 11px; color: var(--muted); font-weight: 500; padding: 4px; }
      .tlp-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 5px; vertical-align: middle; }
      .tlp-dot-win { background: var(--win); }
      .tlp-dot-loss { background: var(--loss); }
      .tlp-dot-today { background: var(--accent); }

      /* ==== DAY MODAL ==== */
      .tlp-day-sum { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 16px; }
      .tlp-day-pnl { font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 700; margin-top: 2px; }

      /* ==== FILTER BAR ==== */
      .tlp-filter-bar { padding: 10px; display: flex; flex-direction: column; gap: 8px; }
      .tlp-filter-selects { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

      /* ==== CONFLUENCES ==== */
      .tlp-add-conf { display: flex; flex-direction: column; gap: 10px; }
      .tlp-conf-list { display: flex; flex-direction: column; gap: 10px; }
      .tlp-conf-card { padding: 14px; }
      .tlp-conf-card.tlp-inactive { opacity: 0.55; }
      .tlp-conf-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
      .tlp-conf-name { font-weight: 600; font-size: 15px; letter-spacing: -0.01em; }
      .tlp-conf-actions { display: flex; gap: 6px; align-items: center; }
      .tlp-conf-note { font-size: 13px; color: var(--muted); margin-top: 6px; line-height: 1.45; }

      .tlp-toggle { width: 36px; height: 20px; background: var(--border); border-radius: 999px; position: relative; transition: background 0.2s ease; flex-shrink: 0; }
      .tlp-toggle[data-on="true"] { background: var(--accent); }
      .tlp-toggle-dot { position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; background: white; border-radius: 50%; transition: transform 0.2s ease; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
      .tlp-toggle[data-on="true"] .tlp-toggle-dot { transform: translateX(16px); }

      /* ==== SETTINGS ==== */
      .tlp-settings-tabs { display: flex; background: var(--panel); border: 1px solid var(--border); border-radius: 11px; padding: 4px; gap: 2px; margin-bottom: 12px; }
      .tlp-settings-tabs button { flex: 1; padding: 9px; border-radius: 8px; font-weight: 600; font-size: 13px; color: var(--muted); transition: all 0.15s ease; }
      .tlp-settings-tabs button.tlp-active { color: var(--accent); background: var(--accent-soft); }
      .tlp-settings-section { display: flex; flex-direction: column; gap: 12px; }
      .tlp-section-title { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; margin: 0 0 4px; letter-spacing: -0.01em; color: var(--muted); }

      .tlp-theme-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
      .tlp-theme-swatch { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px 6px; background: var(--panel); border: 1.5px solid var(--border); border-radius: 12px; transition: all 0.15s ease; font-size: 11px; font-weight: 600; color: var(--muted); }
      .tlp-theme-swatch:hover { border-color: var(--accent-border); }
      .tlp-theme-swatch.tlp-active { border-color: var(--accent); color: var(--fg); background: var(--accent-soft); }
      .tlp-swatch-orb { width: 28px; height: 28px; border-radius: 50%; }

      .tlp-toggle-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
      .tlp-toggle-name { font-size: 14px; font-weight: 600; }
      .tlp-toggle-sub { font-size: 12px; color: var(--muted); margin-top: 2px; }

      .tlp-foot-note { text-align: center; font-size: 10px; color: var(--muted); letter-spacing: 0.14em; font-weight: 600; text-transform: uppercase; padding: 16px 0 8px; display: inline-flex; gap: 6px; align-items: center; justify-content: center; width: 100%; opacity: 0.5; }

      /* ==== BOTTOM NAV ==== */
      .tlp-nav { position: fixed; bottom: 0; left: 0; right: 0; background: var(--panel-solid); border-top: 1px solid var(--border); backdrop-filter: blur(24px) saturate(180%); padding: 6px 10px calc(env(safe-area-inset-bottom, 6px) + 6px); display: grid; grid-template-columns: repeat(5, 1fr); gap: 4px; z-index: 50; max-width: 560px; margin: 0 auto; border-radius: 22px 22px 0 0; }
      @media (min-width: 640px) { .tlp-nav { bottom: 16px; border-radius: 22px; border: 1px solid var(--border); box-shadow: 0 8px 40px rgba(0,0,0,0.25); } }
      .tlp-nav-item { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 8px 4px; border-radius: 10px; color: var(--muted); font-size: 10px; font-weight: 600; transition: all 0.15s ease; }
      .tlp-nav-item.tlp-active { color: var(--accent); }
      .tlp-nav-item.tlp-active svg { filter: drop-shadow(0 0 6px var(--accent-glow)); }
      .tlp-fab { background: var(--accent); color: var(--bg); border-radius: 14px; display: grid; place-items: center; box-shadow: 0 4px 20px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.2); transform: translateY(-6px); transition: all 0.2s ease; margin: 0 4px; }
      .tlp-fab:hover { transform: translateY(-8px) scale(1.03); }
      .tlp-fab:active { transform: translateY(-4px) scale(0.97); }

      /* ==== TOAST ==== */
      .tlp-toast { position: fixed; bottom: 108px; left: 50%; transform: translateX(-50%); background: var(--panel-solid); border: 1px solid var(--border); border-radius: 11px; padding: 10px 14px; display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; backdrop-filter: blur(12px); z-index: 200; animation: tlp-toast-in 0.25s ease; box-shadow: 0 4px 24px rgba(0,0,0,0.3); max-width: 90vw; }
      .tlp-toast-success { border-color: rgba(16, 217, 160, 0.4); color: var(--win); }
      .tlp-toast-error { border-color: rgba(239, 68, 68, 0.4); color: var(--loss); }
      @keyframes tlp-toast-in { from { transform: translate(-50%, 16px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }

      /* ==== ONBOARDING ==== */
      .tlp-onboard { min-height: 100vh; background: var(--bg); position: relative; display: grid; place-items: center; padding: 20px; overflow: hidden; }
      .tlp-onboard-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at top, var(--accent-soft), transparent 60%), radial-gradient(ellipse at bottom, var(--accent-soft), transparent 50%); opacity: 0.8; }
      .tlp-onboard-card { position: relative; width: 100%; max-width: 400px; background: var(--panel-solid); border: 1px solid var(--border); border-radius: 22px; padding: 28px 24px; backdrop-filter: blur(20px); box-shadow: 0 20px 60px rgba(0,0,0,0.4); animation: tlp-fade-up 0.4s ease; }
      @keyframes tlp-fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      .tlp-brand-mark { display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; background: var(--accent-soft); color: var(--accent); border-radius: 7px; font-size: 10px; font-weight: 800; letter-spacing: 0.15em; margin-bottom: 18px; font-family: 'JetBrains Mono', monospace; }
      .tlp-onboard-step { display: flex; flex-direction: column; gap: 14px; }

      /* ==== INTRO ANIMATION ==== */
      .tlp-intro { position: fixed; inset: 0; background: var(--bg); z-index: 1000; display: grid; place-items: center; overflow: hidden; }
      .tlp-intro-grid { position: absolute; inset: 0; background-image: linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px); background-size: 40px 40px; mask-image: radial-gradient(circle at center, black 0%, transparent 65%); animation: tlp-grid-in 1s ease forwards; }
      @keyframes tlp-grid-in { from { opacity: 0; transform: scale(1.1); } to { opacity: 1; transform: scale(1); } }
      .tlp-intro-glow { position: absolute; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, var(--accent-glow), transparent 60%); filter: blur(80px); opacity: 0; animation: tlp-glow-in 2s ease forwards; }
      @keyframes tlp-glow-in { to { opacity: 0.45; } }
      .tlp-intro-content { position: relative; text-align: center; padding: 24px; }
      .tlp-intro-brand { margin-bottom: 24px; }
      .tlp-intro-mark { display: inline-flex; align-items: center; gap: 7px; padding: 6px 12px; background: var(--accent-soft); color: var(--accent); border-radius: 7px; font-size: 10px; font-weight: 800; letter-spacing: 0.2em; font-family: 'JetBrains Mono', monospace; border: 1px solid var(--accent-border); opacity: 0; animation: tlp-fade-in 0.4s ease 0.1s forwards; }
      .tlp-intro-welcome { font-size: clamp(32px, 8vw, 56px); font-weight: 700; margin: 0; letter-spacing: -0.03em; line-height: 1.05; display: flex; flex-direction: column; gap: 4px; }
      .tlp-word { opacity: 0; transform: translateY(20px); display: inline-block; animation: tlp-word-in 0.6s cubic-bezier(0.2, 0.9, 0.3, 1) forwards; }
      .tlp-delay-1 { animation-delay: 0.3s; }
      .tlp-delay-2 { animation-delay: 0.55s; }
      .tlp-delay-3 { animation-delay: 0.8s; opacity: 0; animation: tlp-fade-in 0.5s ease 0.8s forwards; }
      .tlp-delay-4 { animation-delay: 1.1s; opacity: 0; animation: tlp-bar-in 0.6s ease 1.1s forwards; }
      @keyframes tlp-word-in { to { opacity: 1; transform: translateY(0); } }
      @keyframes tlp-fade-in { to { opacity: 1; } }
      @keyframes tlp-bar-in { to { opacity: 1; width: 80px; } }
      .tlp-accent-text { color: var(--accent); text-shadow: 0 0 30px var(--accent-glow); }
      .tlp-intro-sub { color: var(--muted); margin: 14px 0 0; font-size: 13px; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 600; }
      .tlp-intro-bar { height: 2px; width: 0; background: var(--accent); margin: 20px auto 0; box-shadow: 0 0 16px var(--accent-glow); }

      /* ==== CONFLUENCE CHECK ==== */
      .tlp-check { position: fixed; inset: 0; background: var(--bg); z-index: 1000; display: flex; justify-content: center; padding: 20px 16px; overflow-y: auto; }
      .tlp-check-bg { position: fixed; inset: 0; background: radial-gradient(ellipse at top right, var(--accent-soft), transparent 50%); pointer-events: none; }
      .tlp-check-inner { position: relative; max-width: 440px; width: 100%; padding-top: 28px; padding-bottom: 24px; display: flex; flex-direction: column; gap: 18px; animation: tlp-fade-up 0.4s ease; }
      .tlp-check-head { display: flex; justify-content: space-between; align-items: center; }
      .tlp-check-label { display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; background: var(--accent-soft); color: var(--accent); border-radius: 7px; font-size: 10px; font-weight: 800; letter-spacing: 0.15em; font-family: 'JetBrains Mono', monospace; border: 1px solid var(--accent-border); }
      .tlp-skip { font-size: 13px; color: var(--muted); font-weight: 600; padding: 4px 8px; }
      .tlp-skip:hover { color: var(--fg); }
      .tlp-check-title { font-size: 26px; font-weight: 700; letter-spacing: -0.02em; margin: 0; line-height: 1.15; }
      .tlp-check-sub { color: var(--muted); font-size: 14px; margin: -8px 0 0; }
      .tlp-check-list { display: flex; flex-direction: column; gap: 8px; }
      .tlp-check-item { display: flex; align-items: flex-start; gap: 12px; padding: 14px; background: var(--panel); border: 1px solid var(--border); border-radius: 13px; cursor: pointer; transition: all 0.15s ease; }
      .tlp-check-item:hover { border-color: var(--accent-border); }
      .tlp-check-item.tlp-checked { background: var(--accent-soft); border-color: var(--accent-border); }
      .tlp-check-item input { display: none; }
      .tlp-check-box { width: 22px; height: 22px; border-radius: 7px; border: 1.5px solid var(--border); display: grid; place-items: center; color: var(--accent); flex-shrink: 0; transition: all 0.15s ease; }
      .tlp-check-item.tlp-checked .tlp-check-box { background: var(--accent); border-color: var(--accent); color: var(--bg); }
      .tlp-check-info { flex: 1; }
      .tlp-check-name { font-weight: 600; font-size: 14px; }
      .tlp-check-note { font-size: 12px; color: var(--muted); margin-top: 3px; line-height: 1.4; }
      .tlp-check-foot { margin-top: auto; padding-top: 14px; display: flex; flex-direction: column; gap: 12px; }
      .tlp-countdown { display: flex; align-items: center; gap: 10px; }
      .tlp-countdown-track { flex: 1; height: 3px; background: var(--border); border-radius: 999px; overflow: hidden; }
      .tlp-countdown-fill { height: 100%; background: var(--accent); transition: width 1s linear; box-shadow: 0 0 8px var(--accent-glow); }
      .tlp-countdown-num { font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--accent); font-size: 13px; min-width: 30px; text-align: right; }

      /* ==== MEDIA ==== */
      @media (max-width: 380px) {
        .tlp-hero-value { font-size: 30px; }
        .tlp-view-title { font-size: 24px; }
        .tlp-grid-3 { grid-template-columns: 1fr 1fr; }
        .tlp-grid-3 > :last-child { grid-column: 1 / -1; }
      }

      /* Hide scrollbar on iOS */
      .tlp-sheet-body { -webkit-overflow-scrolling: touch; }

      /* ==== ANALYTICS ==== */
      .tlp-an-summary { padding: 16px; }
      .tlp-an-sum-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
      .tlp-an-sum-grid > div { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
      .tlp-an-sum-grid strong { font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .tlp-an-sum-grid small { font-size: 10px; color: var(--muted); font-weight: 500; }

      .tlp-an-block { display: flex; flex-direction: column; gap: 10px; margin-top: 6px; }
      .tlp-an-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
      .tlp-an-head h3 { font-size: 15px; font-weight: 600; margin: 0; letter-spacing: -0.01em; }
      .tlp-an-tag { display: inline-flex; align-items: center; gap: 3px; font-size: 9px; font-weight: 800; letter-spacing: 0.12em; padding: 3px 7px; border-radius: 5px; font-family: 'JetBrains Mono', monospace; }
      .tlp-tag-free { background: var(--accent-soft); color: var(--accent); border: 1px solid var(--accent-border); }
      .tlp-tag-pro { background: linear-gradient(135deg, rgba(167,139,250,0.18), rgba(167,139,250,0.06)); color: #c4b5fd; border: 1px solid rgba(167,139,250,0.28); }
      .tlp-an-desc { font-size: 12px; color: var(--muted); margin: -2px 0 0; line-height: 1.5; }
      .tlp-an-chart { padding: 14px 6px 8px; }
      .tlp-an-callout { display: flex; gap: 16px; flex-wrap: wrap; padding: 0 6px; font-size: 12px; color: var(--muted); }
      .tlp-an-callout strong { font-family: 'JetBrains Mono', monospace; font-weight: 700; margin-left: 2px; }

      /* === PRO LOCKED PREVIEW === */
      .tlp-pro-locked { padding: 16px; position: relative; overflow: hidden; min-height: 160px; }
      .tlp-pro-blur { filter: blur(7px); pointer-events: none; user-select: none; opacity: 0.55; display: flex; flex-direction: column; gap: 10px; }
      .tlp-perf-row { display: grid; grid-template-columns: 1fr auto; gap: 4px 12px; padding: 10px 12px; background: var(--panel); border: 1px solid var(--border); border-radius: 9px; align-items: center; }
      .tlp-perf-name { font-size: 13px; font-weight: 600; }
      .tlp-perf-val { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 14px; text-align: right; }
      .tlp-perf-meta { grid-column: 1 / -1; font-size: 11px; color: var(--muted); }

      .tlp-pro-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 20px; text-align: center; background: linear-gradient(180deg, rgba(10,13,24,0.5) 0%, rgba(10,13,24,0.85) 60%); backdrop-filter: blur(2px); }
      .tlp-pro-overlay-icon { width: 44px; height: 44px; border-radius: 13px; background: linear-gradient(135deg, rgba(167,139,250,0.25), rgba(167,139,250,0.08)); border: 1px solid rgba(167,139,250,0.3); color: #c4b5fd; display: grid; place-items: center; box-shadow: 0 8px 24px rgba(167,139,250,0.25); }
      .tlp-pro-overlay-title { font-size: 16px; font-weight: 700; letter-spacing: -0.01em; margin-top: 4px; }
      .tlp-pro-overlay-sub { font-size: 12px; color: var(--muted); max-width: 280px; line-height: 1.4; margin-bottom: 6px; }

      .tlp-pro-teaser { display: flex; align-items: center; gap: 12px; padding: 14px; background: linear-gradient(140deg, rgba(167,139,250,0.06), transparent) !important; border-color: rgba(167,139,250,0.18) !important; }
      .tlp-pro-teaser-icon { width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, rgba(167,139,250,0.18), rgba(167,139,250,0.06)); color: #c4b5fd; display: grid; place-items: center; flex-shrink: 0; }
      .tlp-pro-teaser-text { flex: 1; min-width: 0; }
      .tlp-pro-teaser-title { font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
      .tlp-pro-teaser-text p { margin: 3px 0 0; font-size: 12px; color: var(--muted); line-height: 1.4; }

      /* === PRO UPGRADE CARD (settings) === */
      .tlp-pro-card { display: flex; align-items: center; gap: 12px; padding: 16px; background: linear-gradient(140deg, rgba(167,139,250,0.12), rgba(167,139,250,0.03)); border: 1px solid rgba(167,139,250,0.28); border-radius: 14px; cursor: pointer; transition: all 0.2s ease; backdrop-filter: blur(12px); width: 100%; text-align: left; position: relative; overflow: hidden; }
      .tlp-pro-card::before { content: ''; position: absolute; top: -100%; left: -100%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(167,139,250,0.18), transparent 50%); transition: all 0.6s ease; pointer-events: none; }
      .tlp-pro-card:hover { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(167,139,250,0.2); border-color: rgba(167,139,250,0.45); }
      .tlp-pro-card:hover::before { top: -50%; left: -50%; }
      .tlp-pro-card > * { position: relative; }
      .tlp-pro-card-icon { width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(135deg, #a78bfa, #8b5cf6); color: #fff; display: grid; place-items: center; flex-shrink: 0; box-shadow: 0 4px 16px rgba(167,139,250,0.4); }
      .tlp-pro-card-text { flex: 1; min-width: 0; }
      .tlp-pro-card-title { font-size: 15px; font-weight: 700; letter-spacing: -0.01em; }
      .tlp-pro-card-sub { font-size: 12px; color: var(--muted); margin-top: 2px; }
      .tlp-pro-card-cta { color: #c4b5fd; flex-shrink: 0; }

      /* === UPGRADE MODAL === */
      .tlp-upgrade { display: flex; flex-direction: column; gap: 16px; align-items: center; text-align: center; padding: 8px 0 16px; }
      .tlp-upgrade-icon { width: 56px; height: 56px; border-radius: 16px; background: linear-gradient(135deg, #a78bfa, #8b5cf6); color: #fff; display: grid; place-items: center; box-shadow: 0 12px 32px rgba(167,139,250,0.45); margin-bottom: 4px; }
      .tlp-upgrade-icon-ok { background: var(--accent); color: var(--bg); box-shadow: 0 12px 32px var(--accent-glow); }
      .tlp-upgrade-title { font-size: 24px; font-weight: 700; letter-spacing: -0.02em; margin: 0; }
      .tlp-upgrade-sub { font-size: 14px; color: var(--muted); line-height: 1.55; margin: 0; max-width: 360px; }
      .tlp-upgrade-perks { display: flex; flex-direction: column; gap: 8px; align-self: stretch; padding: 16px; background: var(--panel); border: 1px solid var(--border); border-radius: 12px; }
      .tlp-upgrade-perks > div { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; line-height: 1.4; text-align: left; }
      .tlp-upgrade-perks svg { color: var(--accent); flex-shrink: 0; margin-top: 3px; }
      .tlp-upgrade-form { display: flex; flex-direction: column; gap: 10px; align-self: stretch; }
      .tlp-upgrade-done { padding: 24px 0; }
      .tlp-form-error { display: flex; align-items: flex-start; gap: 7px; padding: 10px 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 9px; font-size: 12px; color: var(--loss); line-height: 1.4; text-align: left; }
      .tlp-form-error svg { flex-shrink: 0; margin-top: 1px; }
    `}</style>
  );
}
