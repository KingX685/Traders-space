import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, ScatterChart, Scatter } from 'recharts';
import {
  TrendingUp, TrendingDown, Plus, Calendar as CalIcon, Settings as SettingsIcon,
  Home, List, X, Check, Target, Flame, Award, DollarSign, Clock, ChevronLeft,
  ChevronRight, Trash2, Camera, Download, Zap, Palette, Star, AlertCircle,
  Activity, LogIn, ArrowUpRight, ArrowDownRight, Hash, Image as ImageIcon,
  Sparkles, Play, Pause, Layers, BookOpen, Filter, Search, RefreshCw,
  Wifi, WifiOff, Bitcoin, Landmark, BarChart3, Crown, Eye, EyeOff, Lock, Brain,
  Info, Pin, Link2, Upload, FileText
} from 'lucide-react';
import { useAuth } from './lib/auth.jsx';
import { AuthSheet, AccountBanner, AccountCard, MigrationSheet } from './lib/auth-ui.jsx';
import { joinWaitlist, migrateLocalToCloud } from './lib/storage.js';
import { useStoreCtx } from './lib/store-context.jsx';

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
// Each asset has its own brand color so they're visually distinct.
const ASSET_COLORS = {
  BTCUSD: '#f7931a',  ETHUSD: '#627eea',  SOLUSD: '#9945ff',
  BNBUSD: '#f3ba2f',  XRPUSD: '#23292f',  DOGEUSD: '#c2a633',
  ADAUSD: '#0033ad',  AVAXUSD: '#e84142', LINKUSD: '#2a5ada',
  DOTUSD: '#e6007a',  TRXUSD: '#ff060a',  LTCUSD: '#345d9d',
  MATICUSD: '#8247e5', SUIUSD: '#4ca3ff',
  XAUUSD: '#fbbf24',
  EURUSD: '#3b82f6',  GBPUSD: '#dc2626',  USDJPY: '#10b981',
  USDCHF: '#ef4444',  AUDUSD: '#f59e0b',  USDCAD: '#dc2626',
  NZDUSD: '#06b6d4',  EURJPY: '#3b82f6',  GBPJPY: '#dc2626',
  EURGBP: '#3b82f6',  AUDJPY: '#f59e0b',  USDMXN: '#10b981',
  USDZAR: '#f59e0b',
  default: '#71717a'
};

function getAssetColor(symbol) {
  const clean = (symbol || '').replace('*', '').toUpperCase();
  return ASSET_COLORS[clean] || ASSET_COLORS.default;
}

function getAssetInitials(symbol) {
  if (!symbol) return '?';
  const clean = symbol.replace('*', '').toUpperCase();
  // Crypto: first 3 chars
  if (clean.endsWith('USD') && !['EURUSD','GBPUSD','AUDUSD','NZDUSD'].includes(clean)) {
    return clean.slice(0, Math.min(3, clean.length - 3)) || clean.slice(0, 3);
  }
  // Forex: split at 3
  return clean.slice(0, 3);
}

// Visual asset chip — colored circle with first 2-3 letters
function AssetChip({ symbol, size = 32 }) {
  const color = getAssetColor(symbol);
  const initials = getAssetInitials(symbol);
  return (
    <div className="tlp-asset-chip" style={{
      width: size, height: size,
      background: `linear-gradient(135deg, ${color}, ${color}cc)`,
      fontSize: size <= 24 ? 9 : 10,
    }}>
      {initials}
    </div>
  );
}

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
];

// Metals get their own category — XAUUSD is gold, fundamentally different from crypto.
// Tracked via PAXG (Pax Gold) on Binance which is 1:1 backed by London Good Delivery gold.
const METAL_MARKETS = [
  { symbol: 'PAXGUSDT', display: 'XAUUSD',  name: 'Gold (spot)',    decimals: 2 },
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
const DEFAULT_DASHBOARD_MARKETS = ['BTCUSD', 'ETHUSD', 'EURUSD', 'XAUUSD'];

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
  const allCoins = [...CRYPTO_MARKETS, ...METAL_MARKETS];
  const ids = allCoins.map(m => COINGECKO_IDS[m.symbol]).filter(Boolean).join(',');
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko returned ${res.status}`);
  const data = await res.json();
  return allCoins.map(m => {
    const geckoId = COINGECKO_IDS[m.symbol];
    const d = data.find(item => item.id === geckoId);
    if (!d) return null;
    const isMetal = METAL_MARKETS.some(x => x.symbol === m.symbol);
    return {
      symbol: m.display,
      name: m.name,
      price: d.current_price,
      change: d.price_change_percentage_24h || 0,
      high: d.high_24h,
      low: d.low_24h,
      volume: d.total_volume,
      decimals: m.decimals,
      category: isMetal ? 'metal' : 'crypto',
      source: isMetal ? 'CoinGecko · PAXG (gold-backed)' : 'CoinGecko · real-time',
      timestamp: Date.now(),
    };
  }).filter(Boolean);
}

async function fetchCryptoBinance() {
  const allCoins = [...CRYPTO_MARKETS, ...METAL_MARKETS];
  const symbols = allCoins.map(s => s.symbol);
  const params = encodeURIComponent(JSON.stringify(symbols));
  const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${params}`);
  if (!res.ok) throw new Error(`Binance returned ${res.status}`);
  const data = await res.json();
  return data.map(d => {
    const m = allCoins.find(s => s.symbol === d.symbol);
    if (!m) return null;
    const isMetal = METAL_MARKETS.some(x => x.symbol === m.symbol);
    return {
      symbol: m.display,
      name: m.name,
      price: parseFloat(d.lastPrice),
      change: parseFloat(d.priceChangePercent),
      high: parseFloat(d.highPrice),
      low: parseFloat(d.lowPrice),
      volume: parseFloat(d.quoteVolume),
      decimals: m.decimals,
      category: isMetal ? 'metal' : 'crypto',
      source: isMetal ? 'Binance · PAXG (gold-backed)' : 'Binance · real-time',
      timestamp: Date.now(),
    };
  }).filter(Boolean);
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
// useThemeColors — reads actual computed CSS colors so Recharts
// SVG <text fill> works (SVG fill attr doesn't resolve var()).
// Re-reads when the theme prop on root changes.
// ============================================================
function useThemeColors(themeKey) {
  const [colors, setColors] = useState({
    muted: '#8a8a8f', accent: '#10d9a0', border: 'rgba(255,255,255,0.08)',
    win: '#10d9a0', loss: '#ef4444', fg: '#f4f4f5', panel: '#0c0c0c'
  });
  useEffect(() => {
    const root = document.querySelector('.tlp-root');
    if (!root) return;
    const cs = getComputedStyle(root);
    setColors({
      muted: cs.getPropertyValue('--muted').trim() || '#8a8a8f',
      accent: cs.getPropertyValue('--accent').trim() || '#10d9a0',
      border: cs.getPropertyValue('--border').trim() || 'rgba(255,255,255,0.08)',
      win: cs.getPropertyValue('--win').trim() || '#10d9a0',
      loss: cs.getPropertyValue('--loss').trim() || '#ef4444',
      fg: cs.getPropertyValue('--fg').trim() || '#f4f4f5',
      panel: cs.getPropertyValue('--panel-solid').trim() || '#0c0c0c',
    });
  }, [themeKey]);
  return colors;
}

// ============================================================
// BRAND MARK — the Traders Space S logo, inline SVG
// ============================================================
function BrandMark({ size = 22 }) {
  return (
    <svg viewBox="0 0 512 512" width={size} height={size} style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id={`tsm-${size}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="1"/>
        </linearGradient>
      </defs>
      <path d="M 370 165 C 370 130, 320 115, 270 130 C 200 150, 145 200, 145 256 C 145 295, 195 320, 256 320 C 317 320, 367 345, 367 384 C 367 420, 320 440, 256 440 C 195 440, 145 425, 130 395"
        fill="none" stroke={`url(#tsm-${size})`} strokeWidth="48" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="370" cy="165" r="22" fill="var(--accent)"/>
    </svg>
  );
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

function StatChip({ label, value, sub, trend, icon: Icon, accent, metric }) {
  const color = trend === 'up' ? 'var(--win)' : trend === 'down' ? 'var(--loss)' : 'var(--fg)';
  return (
    <GlassPanel className="tlp-stat">
      <div className="tlp-stat-head">
        <span className="tlp-stat-label">
          {label}
          {metric && <MetricInfo metric={metric} />}
        </span>
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
          <BrandMark size={22} />
          <span>TRADERS SPACE</span>
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
            <BrandMark size={18} />
            <span>TRADERS SPACE</span>
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
                  <div className="tlp-market-cat">{m.category === 'crypto' ? 'CRYPTO' : m.category === 'metal' ? 'METAL' : 'FX'}</div>
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
    if (tab === 'metal') list = list.filter(m => m.category === 'metal');
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
          <button className={`tlp-seg-btn ${tab === 'metal' ? 'tlp-active' : ''}`} onClick={() => setTab('metal')}>
            <Sparkles size={12} /> Metals
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
              <AssetChip symbol={m.symbol} size={32} />
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

        {(market.category === 'crypto' || market.category === 'metal') && market.high !== undefined && (
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
        {market.category === 'metal' && (
          <div className="tlp-md-note">
            <AlertCircle size={13} />
            <span>Tracked via PAXG (Pax Gold) — a token 1:1 backed by London Good Delivery gold bars. Tracks spot XAU closely; your broker's gold spread will add ~$0.20–$0.50.</span>
          </div>
        )}
      </div>
    </Sheet>
  );
}


function Dashboard({ profile, trades, stats, onOpenTrade, onLog, marketData, onOpenMarkets, onPickMarket }) {
  const recent = [...trades].sort((a, b) => new Date(b.entryAt) - new Date(a.entryAt)).slice(0, 4);
  const colors = useThemeColors(profile.theme);

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
                  contentStyle={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 10, fontSize: 12, fontFamily: 'JetBrains Mono', color: colors.fg }}
                  itemStyle={{ color: colors.fg }}
                  labelStyle={{ color: colors.muted }}
                  labelFormatter={() => ''}
                  formatter={(v) => [fmtMoney(v), 'Equity']}
                />
                <Area type="monotone" dataKey="equity" stroke={colors.accent} strokeWidth={2} fill="url(#eq)" />
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
        <StatChip metric="winRate" label="Win rate" value={fmtPct(stats.winRate)} sub={`${stats.wins}W · ${stats.losses}L`} icon={Target} accent />
        <StatChip label="Trades" value={stats.total} sub="lifetime" icon={Hash} />
        <StatChip metric="rr" label="R:R realized" value={stats.rr.toFixed(2)} sub="avg win / avg loss" icon={Layers} accent />
        <StatChip metric="expectancy" label="Expectancy" value={fmtMoney(stats.expectancy)} sub="per trade" icon={Award} trend={stats.expectancy >= 0 ? 'up' : 'down'} />
      </div>

      {/* Second row */}
      <div className="tlp-grid-3">
        <StatChip metric="drawdown" label="Max DD" value={fmtPct(stats.maxDD)} sub="peak-to-trough" />
        <StatChip metric="streak" label={stats.curType === 'W' ? 'Win streak' : stats.curType === 'L' ? 'Loss streak' : 'Streak'} value={stats.curStreak || 0} sub="current" icon={Flame} />
        <StatChip metric="avgHold" label="Avg hold" value={fmtDuration(stats.avgHold)} sub="time in trade" icon={Clock} />
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
  const { adapter } = useStoreCtx();
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
  const [screenshots, setScreenshots] = useState([]); // up to 4 data URIs
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
      // load screenshots via adapter (works for both local and cloud)
      adapter.loadScreenshots(editing.id).then(s => {
        if (!s || s.length === 0) { setScreenshots([]); return; }
        setScreenshots(s);
      }).catch(() => setScreenshots([]));
    } else if (open) {
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
      setScreenshots([]);
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
      hasScreenshot: screenshots.length > 0,
      screenshotCount: screenshots.length,
    };
    // Save screenshots via adapter — local writes data URIs, cloud uploads to bucket
    if (screenshots.length > 0) await adapter.saveScreenshots(id, screenshots);
    else await adapter.saveScreenshots(id, []); // empty array clears
    onSave(trade);
  };

  const handleFile = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const remaining = 4 - screenshots.length;
    const toAdd = files.slice(0, remaining);
    const compressed = await Promise.all(toAdd.map(f => compressImage(f)));
    setScreenshots(s => [...s, ...compressed]);
    e.target.value = ''; // allow re-selecting same file
  };

  const removeScreenshot = (idx) => {
    setScreenshots(s => s.filter((_, i) => i !== idx));
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
          <span>Chart screenshots <small style={{ marginLeft: 6, opacity: 0.6, fontWeight: 500 }}>up to 4</small></span>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFile} />
          {screenshots.length > 0 && (
            <div className="tlp-shot-grid">
              {screenshots.map((src, i) => (
                <div key={i} className="tlp-shot-thumb">
                  <img src={src} alt={`screenshot ${i + 1}`} />
                  <button className="tlp-shot-rm" onClick={() => removeScreenshot(i)} type="button"><X size={14} /></button>
                  <span className="tlp-shot-num">{i + 1}</span>
                </div>
              ))}
            </div>
          )}
          {screenshots.length < 4 && (
            <button className="tlp-shot-add" onClick={() => fileRef.current?.click()} type="button">
              <Camera size={18} />
              <span>{screenshots.length === 0 ? 'Upload screenshots' : `Add more (${4 - screenshots.length} left)`}</span>
              <small>before / during / after · auto-compressed</small>
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
  const { adapter } = useStoreCtx();
  const [shots, setShots] = useState([]);
  useEffect(() => {
    if (trade?.hasScreenshot || (trade?.screenshotPaths && trade.screenshotPaths.length > 0)) {
      adapter.loadScreenshots(trade.id)
        .then(s => setShots(Array.isArray(s) ? s : (s ? [s] : [])))
        .catch(() => setShots([]));
    } else setShots([]);
  }, [trade, adapter]);
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

        {shots.length > 0 && (
          <div className="tlp-detail-block">
            <div className="tlp-detail-label">Screenshots ({shots.length})</div>
            <div className="tlp-detail-shots">
              {shots.map((src, i) => (
                <img key={i} src={src} alt={`screenshot ${i + 1}`} className="tlp-detail-shot" />
              ))}
            </div>
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
// Renders AccountCard only when the user is authenticated.
// Local helper so SettingsView signature stays clean.
function AccountCardSlot({ onSignOut }) {
  const auth = useAuth();
  if (!auth.isAuthenticated) return null;
  return <AccountCard onSignOut={onSignOut} />;
}

function SettingsView({ profile, setProfile, trades, confluences, onReset, showToast, onUpgrade, onShowAuth, onShowSignOut }) {
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
    a.download = `traders-space-${ymd(new Date())}.csv`;
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

      {/* Account banner / card — Phase 2 */}
      <AccountBanner onSignIn={onShowAuth} />
      <AccountCardSlot onSignOut={onShowSignOut} />

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
        <h3 className="tlp-section-title"><FileText size={14} /> Tools</h3>
        <Btn full variant="ghost" onClick={onImportStatement}>
          <Upload size={14} /> Import MT4 / MT5 statement
        </Btn>
        <Btn full variant="ghost" onClick={onLogMissed}>
          <Eye size={14} /> Log a missed trade
        </Btn>
        <small className="tlp-hint">MT statement covers Exness, FundedNext, Goat Funded, FTMO, and any MT broker.</small>
      </GlassPanel>

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
        <Activity size={10} /> TRADERS SPACE · your edge, your space
      </div>
    </div>
  );
}

// ============================================================
// ANALYTICS VIEW — deep performance analysis
// Free: R-distribution, day-of-week PnL, hold-time scatter
// Pro: setup expectancy, confluence performance (blurred preview)
// ============================================================
function AnalyticsView({ profile, trades, missedTrades = [], stats, confluences, onOpenTrade, onLog, onLogMissed, onUpgrade }) {
  const colors = useThemeColors(profile?.theme);
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
            <span className="tlp-stat-label">Expectancy <MetricInfo metric="expectancy" /></span>
            <strong className={stats.expectancy >= 0 ? 'tlp-up' : 'tlp-down'}>{fmtMoney(stats.expectancy)}</strong>
            <small>per trade</small>
          </div>
          <div>
            <span className="tlp-stat-label">Profit factor <MetricInfo metric="profitFactor" /></span>
            <strong>{computeProfitFactor(trades).toFixed(2)}</strong>
            <small>gains / losses</small>
          </div>
          <div>
            <span className="tlp-stat-label">Avg win / loss <MetricInfo metric="rr" /></span>
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
              <CartesianGrid stroke={colors.border} strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: colors.muted, fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: colors.muted, fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                contentStyle={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 10, fontSize: 12, fontFamily: 'JetBrains Mono', color: colors.fg }} itemStyle={{ color: colors.fg }} labelStyle={{ color: colors.muted }}
                formatter={(v) => [`${v} trade${v !== 1 ? 's' : ''}`, '']}
                labelFormatter={(l) => `Range: ${l}`}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {rDist.map((d, i) => (
                  <rect key={i} fill={d.kind === 'win' ? colors.win : d.kind === 'loss' ? colors.loss : colors.muted} />
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
              <CartesianGrid stroke={colors.border} strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: colors.muted, fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: colors.muted, fontSize: 10 }} axisLine={false} tickLine={false} width={36}
                tickFormatter={(v) => v >= 1000 || v <= -1000 ? `${(v/1000).toFixed(0)}k` : v} />
              <Tooltip
                contentStyle={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 10, fontSize: 12, fontFamily: 'JetBrains Mono', color: colors.fg }} itemStyle={{ color: colors.fg }} labelStyle={{ color: colors.muted }}
                formatter={(v) => [fmtMoney(v), 'P&L']}
              />
              <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                {dayOfWeek.map((d, i) => (
                  <rect key={i} fill={d.pnl >= 0 ? colors.win : colors.loss} />
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
              <CartesianGrid stroke={colors.border} strokeDasharray="2 4" />
              <XAxis dataKey="x" type="number" name="Hold (min)" tick={{ fill: colors.muted, fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => v >= 60 ? `${Math.round(v/60)}h` : `${v}m`} />
              <YAxis dataKey="y" type="number" name="P&L" tick={{ fill: colors.muted, fontSize: 10 }} axisLine={false} tickLine={false} width={36}
                tickFormatter={(v) => v >= 1000 || v <= -1000 ? `${(v/1000).toFixed(0)}k` : v} />
              <Tooltip
                cursor={{ stroke: colors.accent, strokeDasharray: '3 3' }}
                contentStyle={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 10, fontSize: 12, fontFamily: 'JetBrains Mono', color: colors.fg }} itemStyle={{ color: colors.fg }} labelStyle={{ color: colors.muted }}
                formatter={(v, n) => n === 'Hold (min)' ? [fmtDuration(v), 'Hold'] : [fmtMoney(v), 'P&L']}
              />
              <Scatter data={holdScatter}>
                {holdScatter.map((d, i) => (
                  <circle key={i} r={4} fill={d.y >= 0 ? colors.win : colors.loss} fillOpacity={0.7} />
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

      {/* MISSED OPPORTUNITY REPORT */}
      <div className="tlp-an-block">
        <div className="tlp-an-head">
          <h3>Missed opportunity report</h3>
          <span className="tlp-an-tag tlp-tag-free">FREE</span>
        </div>
        <p className="tlp-an-desc">Trades you saw but didn't take. The patterns here often hurt more than your losers — and they're fixable.</p>
        <MissedOpportunityReport missedTrades={missedTrades} onLogMissed={onLogMissed} />
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

    // Save to Supabase waitlist table (silent failure ok — Formspree is the source of truth)
    try { await joinWaitlist(email, 'upgrade-modal'); } catch {}

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
// METRIC EXPLAINERS — content + InfoSheet
// ============================================================
const METRIC_EXPLAINERS = {
  pnl: {
    title: 'Profit & Loss (P&L)',
    short: 'How much you made or lost on a trade or set of trades.',
    formula: 'P&L = (Exit Price − Entry Price) × Position Size × Direction',
    body: [
      'P&L is the most basic measurement: how much money you made or lost. For a buy: positive when price went up. For a sell: positive when price went down.',
      'In Traders Space you can either enter your P&L manually (most reliable, since brokers calculate fees and swaps for you), or let the app auto-calculate it from entry/exit price × lot size.',
      'Cumulative P&L is the running total across all your trades. That is what drives the equity curve on your dashboard.',
    ],
    matters: 'P&L is the score, but it is not the strategy. A profitable trader can have a bad week. An unprofitable strategy can have a great week. Look at expectancy and win rate to know if your edge is real.',
  },
  equity: {
    title: 'Account equity',
    short: 'Your starting balance plus the cumulative P&L of every trade you have logged.',
    formula: 'Equity = Starting Balance + Σ(P&L of each trade)',
    body: [
      'Equity is what your account would be worth right now if you closed every position. Traders Space is not connected to your broker, so it computes equity by adding all your logged P&L to the starting balance you entered during onboarding.',
      'If you log every trade honestly, your equity here should match your broker statement closely. Small differences come from spreads, swaps, or commissions you may not have included in your P&L entry.',
    ],
    matters: 'Watching the equity curve grow is more honest than watching daily P&L. A flat curve means you are breaking even. A bumpy upward curve means a real edge with normal volatility. A smooth straight line probably means you are not logging losers.',
  },
  winRate: {
    title: 'Win rate',
    short: 'The percentage of your trades that closed in profit.',
    formula: 'Win rate = (Winning trades / Total trades) × 100',
    body: [
      'A trade counts as a win if its P&L is greater than zero. Break-even trades are excluded from the win calculation.',
      'Win rate is the most overrated metric in trading. A trader with a 30% win rate and a 5R average winner can be more profitable than a trader with an 80% win rate and a 0.2R average winner.',
    ],
    matters: 'Use win rate together with R:R and expectancy. On its own, it tells you almost nothing about whether you should keep trading the strategy.',
  },
  rr: {
    title: 'Realized risk-to-reward (R:R)',
    short: 'How much your average winner makes compared to how much your average loser costs.',
    formula: 'R:R = Average winning P&L ÷ Average losing P&L (absolute value)',
    body: [
      'This is "realized" R:R, calculated from trades that have already closed — not the planned R:R you set when you placed the trade.',
      'A realized R:R of 1.5 means your average winner is 1.5× the size of your average loser. You only need a 40% win rate to be profitable at that R:R.',
      'A realized R:R of 0.5 means your winners are half the size of your losers. You would need an 67% win rate just to break even.',
    ],
    matters: 'Most losing traders have planned R:Rs of 2:1 or 3:1, but realized R:Rs below 1.0 — because they take winners early and let losers run. The gap between planned and realized R:R is one of the most diagnostic numbers in trading.',
  },
  expectancy: {
    title: 'Expectancy',
    short: 'How much money you make on average per trade. The single most important metric in your journal.',
    formula: 'Expectancy = (Win rate × Avg win) − (Loss rate × Avg loss)',
    body: [
      'Expectancy gives you a dollar amount you can expect to earn per trade, on average, if you keep trading the same way. Multiply it by how many trades you take to forecast your earnings.',
      'A positive expectancy means your strategy makes money over time, even if individual weeks are red. A negative expectancy means you are paying to play — every trade is a bleed.',
      'Example: 50% win rate, $200 average win, $100 average loss → expectancy = (0.5 × 200) − (0.5 × 100) = $50 per trade.',
    ],
    matters: 'If your expectancy is negative, no amount of position-sizing magic or risk management will save you long-term. Stop trading until you find a setup with positive expectancy.',
  },
  drawdown: {
    title: 'Maximum drawdown',
    short: 'The biggest peak-to-trough drop in your account equity, expressed as a percentage.',
    formula: 'Max DD = max((Peak equity − Current equity) / Peak equity) × 100',
    body: [
      'Drawdown measures how deep your account fell from its highest point before recovering (or before now, if you have not recovered yet). It is the pain measurement.',
      'Most prop firms set hard drawdown limits — usually 5% to 10%. Hit it, account closed. Knowing your typical drawdown lets you trade prop firm rules realistically instead of optimistically.',
    ],
    matters: 'Two strategies can have identical expectancy but very different drawdowns. The one with smaller drawdowns is psychologically tradable. The one with bigger drawdowns will get abandoned mid-streak even though it is "right" on paper.',
  },
  profitFactor: {
    title: 'Profit factor',
    short: 'Total dollars earned divided by total dollars lost.',
    formula: 'Profit factor = Σ(winning P&L) / Σ(absolute value of losing P&L)',
    body: [
      'A profit factor of 2.0 means for every dollar your strategy lost, it made two. Below 1.0 you are losing. At exactly 1.0 you are breaking even.',
      'Profit factor differs from R:R because it weights for trade frequency. A high-R:R strategy with very few wins can have a worse profit factor than a low-R:R strategy with many small wins.',
    ],
    matters: 'Profit factor between 1.5 and 2.5 is healthy and sustainable. Above 3.0 is exceptional and rare — be skeptical, you may have a tiny sample. Below 1.2 is fragile and one bad streak from being unprofitable.',
  },
  streak: {
    title: 'Win/loss streak',
    short: 'How many consecutive wins or losses you currently have.',
    formula: 'Counts consecutive trades from your most recent trade backwards.',
    body: [
      'Streaks are normal — even a profitable strategy will have losing streaks of 5, 10, sometimes 15 in a row. The math of probability guarantees it.',
      'The streak counter is here to give you context. If you are on a 5-loss streak, this is information. It is not necessarily a sign your edge is broken.',
    ],
    matters: 'Long winning streaks invite overconfidence and oversize positions. Long losing streaks invite revenge trading. Both are how good traders blow up. Use the streak counter to notice your emotional state, not to change strategy.',
  },
  avgHold: {
    title: 'Average hold time',
    short: 'How long, on average, you are in trades before exiting.',
    formula: 'Σ(exit time − entry time) / Total trades',
    body: [
      'Hold time tells you what kind of trader you actually are. If you call yourself a swing trader but your average hold is 35 minutes, you are a scalper in denial.',
      'In analytics you can also see hold time vs P&L scatter — this often reveals whether your winners run or you cut them too quickly.',
    ],
    matters: 'Mismatch between intended trading style and actual hold times is one of the most common (and fixable) causes of poor performance.',
  },
  discipline: {
    title: 'Discipline score',
    short: 'A 1–5 self-rating of how well you followed your own plan on a trade.',
    formula: 'You enter it. The app averages all your scores.',
    body: [
      'A 5 means: I had a plan, I executed it perfectly, I exited where I said I would. A 1 means: I revenge-traded, broke my rules, and got lucky (or unlucky).',
      'Over time, plot your discipline scores against P&L. You will almost certainly see a strong correlation — and you will see, with data, that your bad weeks are usually rule-breaking weeks, not bad-luck weeks.',
    ],
    matters: 'This is the most undervalued metric in the journal. If you can prove to yourself that discipline is what causes profit (and you almost certainly can), it is much easier to stay disciplined.',
  },
};

function MetricInfo({ metric, accent }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="tlp-info-btn" onClick={(e) => { e.stopPropagation(); setOpen(true); }} aria-label="What is this">
        <Info size={11} />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={METRIC_EXPLAINERS[metric]?.title || 'Metric'}>
        <MetricExplainerContent metric={metric} />
      </Sheet>
    </>
  );
}

function MetricExplainerContent({ metric }) {
  const data = METRIC_EXPLAINERS[metric];
  if (!data) return <div className="tlp-empty-sm">No explainer found.</div>;
  return (
    <div className="tlp-mx">
      <div className="tlp-mx-short">{data.short}</div>
      {data.formula && (
        <GlassPanel className="tlp-mx-formula">
          <div className="tlp-mx-formula-label">FORMULA</div>
          <div className="tlp-mx-formula-eq">{data.formula}</div>
        </GlassPanel>
      )}
      <div className="tlp-mx-section">
        <h4>How it works</h4>
        {data.body.map((p, i) => <p key={i}>{p}</p>)}
      </div>
      <div className="tlp-mx-section tlp-mx-matters">
        <h4>Why it matters</h4>
        <p>{data.matters}</p>
      </div>
    </div>
  );
}

// ============================================================
// JOURNAL — Notion-style entries
// Free-form writing space. Each entry has a title, multiple
// content blocks, optional tags (asset, timeframe, setup),
// and can optionally link to a logged trade.
// ============================================================
const JOURNAL_KEY = 'tlp:journal';
const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d', '1w'];
const BLOCK_TYPES = {
  text: { label: 'Text', icon: 'T' },
  heading: { label: 'Heading', icon: 'H' },
  bullet: { label: 'Bullet', icon: '•' },
  divider: { label: 'Divider', icon: '—' },
  quote: { label: 'Quote', icon: '"' },
};

function newJournalEntry() {
  return {
    id: crypto.randomUUID(),
    title: '',
    blocks: [{ id: crypto.randomUUID(), type: 'text', content: '' }],
    tags: { asset: '', timeframe: '', setup: '' },
    linkedTradeId: null,
    pinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function JournalView({ trades, onOpenTrade, showToast }) {
  const { adapter } = useStoreCtx();
  const [entries, setEntries] = useState([]);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('all');

  useEffect(() => {
    adapter.listJournal().then(setEntries).catch(() => setEntries([]));
  }, [adapter]);

  const handleSave = async (entry) => {
    const updated = { ...entry, updatedAt: new Date().toISOString() };
    const exists = entries.find(e => e.id === entry.id);
    const next = exists ? entries.map(e => e.id === entry.id ? updated : e) : [updated, ...entries];
    setEntries(next);
    try {
      await adapter.saveJournalEntry(updated);
      setEditing(null);
      showToast?.({ msg: exists ? 'Entry saved' : 'Entry created', type: 'success' });
    } catch (err) {
      showToast?.({ msg: 'Save failed — try again', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this journal entry? This cannot be undone.')) return;
    setEntries(entries.filter(e => e.id !== id));
    try { await adapter.deleteJournalEntry(id); } catch {}
    setEditing(null);
    showToast?.({ msg: 'Entry deleted', type: 'success' });
  };

  const handlePin = async (id) => {
    const target = entries.find(e => e.id === id);
    if (!target) return;
    const updated = { ...target, pinned: !target.pinned, updatedAt: new Date().toISOString() };
    setEntries(entries.map(e => e.id === id ? updated : e));
    try { await adapter.saveJournalEntry(updated); } catch {}
  };

  // Filter + sort
  const filtered = useMemo(() => {
    let list = entries;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(e => {
        const inTitle = e.title.toLowerCase().includes(q);
        const inBlocks = e.blocks.some(b => (b.content || '').toLowerCase().includes(q));
        const inTags = Object.values(e.tags || {}).some(t => (t || '').toLowerCase().includes(q));
        return inTitle || inBlocks || inTags;
      });
    }
    if (filterTag !== 'all') {
      list = list.filter(e => e.tags?.timeframe === filterTag);
    }
    return list.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  }, [entries, search, filterTag]);

  if (editing) {
    return (
      <JournalEntryEditor
        entry={editing}
        trades={trades}
        onSave={handleSave}
        onCancel={() => setEditing(null)}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <div className="tlp-view">
      <div className="tlp-view-head">
        <div>
          <div className="tlp-view-kicker">Your space</div>
          <h1 className="tlp-view-title">Journal</h1>
        </div>
        <Btn size="sm" onClick={() => setEditing(newJournalEntry())}>
          <Plus size={14} /> New entry
        </Btn>
      </div>

      {entries.length === 0 ? (
        <GlassPanel className="tlp-empty">
          <BookOpen size={28} style={{ color: 'var(--accent)' }} />
          <div className="tlp-empty-title">Your journal starts here</div>
          <div className="tlp-empty-sub">Write freely. Track setups across timeframes. Document trades before, during, and after. This space is yours.</div>
          <Btn onClick={() => setEditing(newJournalEntry())}>
            <Plus size={14} /> Write your first entry
          </Btn>
        </GlassPanel>
      ) : (
        <>
          <div className="tlp-search-wrap">
            <Search size={15} />
            <input className="tlp-search" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search title, content, tags…" />
            {search && <button className="tlp-search-clear" onClick={() => setSearch('')}><X size={14} /></button>}
          </div>

          <div className="tlp-tf-pills">
            <button className={`tlp-tf-pill ${filterTag === 'all' ? 'tlp-active' : ''}`} onClick={() => setFilterTag('all')}>All</button>
            {TIMEFRAMES.map(tf => (
              <button key={tf} className={`tlp-tf-pill ${filterTag === tf ? 'tlp-active' : ''}`} onClick={() => setFilterTag(tf)}>{tf}</button>
            ))}
          </div>

          <div className="tlp-journal-list">
            {filtered.length === 0 && (
              <div className="tlp-empty-sm">No entries match.</div>
            )}
            {filtered.map(entry => (
              <JournalEntryCard
                key={entry.id}
                entry={entry}
                trades={trades}
                onOpen={() => setEditing(entry)}
                onPin={() => handlePin(entry.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function JournalEntryCard({ entry, trades, onOpen, onPin }) {
  const preview = (entry.blocks || []).find(b => b.type === 'text' && b.content)?.content
    || (entry.blocks || []).find(b => b.content)?.content
    || 'Empty entry';
  const linkedTrade = entry.linkedTradeId ? trades.find(t => t.id === entry.linkedTradeId) : null;
  const dt = new Date(entry.updatedAt);
  const dateLabel = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <button className="tlp-journal-card" onClick={onOpen}>
      <div className="tlp-journal-card-top">
        <div className="tlp-journal-card-title">
          {entry.pinned && <span className="tlp-pin-marker"><Pin size={11} /></span>}
          {entry.title || 'Untitled'}
        </div>
        <button className="tlp-pin-btn" data-pinned={entry.pinned}
          onClick={(e) => { e.stopPropagation(); onPin(); }}
          aria-label={entry.pinned ? 'Unpin' : 'Pin'}>
          <Pin size={13} />
        </button>
      </div>
      <p className="tlp-journal-card-preview">{preview.slice(0, 120)}{preview.length > 120 ? '…' : ''}</p>
      <div className="tlp-journal-card-meta">
        <span>{dateLabel}</span>
        {entry.tags?.asset && <span className="tlp-meta-pill">{entry.tags.asset}</span>}
        {entry.tags?.timeframe && <span className="tlp-meta-pill tlp-tf">{entry.tags.timeframe}</span>}
        {entry.tags?.setup && <span className="tlp-meta-pill">{entry.tags.setup}</span>}
        {linkedTrade && (
          <span className={`tlp-meta-pill ${linkedTrade.pnl >= 0 ? 'tlp-up' : 'tlp-down'}`}>
            {linkedTrade.asset} {linkedTrade.pnl >= 0 ? '+' : ''}{fmtMoney(linkedTrade.pnl)}
          </span>
        )}
      </div>
    </button>
  );
}

function JournalEntryEditor({ entry, trades, onSave, onCancel, onDelete }) {
  const [title, setTitle] = useState(entry.title || '');
  const [blocks, setBlocks] = useState(entry.blocks || [{ id: crypto.randomUUID(), type: 'text', content: '' }]);
  const [tags, setTags] = useState(entry.tags || { asset: '', timeframe: '', setup: '' });
  const [linkedTradeId, setLinkedTradeId] = useState(entry.linkedTradeId || null);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [showLinkTrade, setShowLinkTrade] = useState(false);

  const updateBlock = (id, patch) => {
    setBlocks(bs => bs.map(b => b.id === id ? { ...b, ...patch } : b));
  };
  const addBlock = (type) => {
    const newBlock = { id: crypto.randomUUID(), type, content: '' };
    setBlocks(bs => [...bs, newBlock]);
    setShowAddBlock(false);
  };
  const removeBlock = (id) => {
    setBlocks(bs => bs.length > 1 ? bs.filter(b => b.id !== id) : bs);
  };
  const moveBlock = (id, dir) => {
    setBlocks(bs => {
      const i = bs.findIndex(b => b.id === id);
      if (i < 0) return bs;
      const j = i + dir;
      if (j < 0 || j >= bs.length) return bs;
      const next = [...bs];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const linkedTrade = linkedTradeId ? trades.find(t => t.id === linkedTradeId) : null;

  const save = () => {
    onSave({ ...entry, title: title.trim(), blocks, tags, linkedTradeId });
  };

  return (
    <div className="tlp-view tlp-editor">
      <div className="tlp-editor-bar">
        <button className="tlp-icon-btn" onClick={onCancel}>
          <ChevronLeft size={16} /> Back
        </button>
        <div className="tlp-editor-bar-actions">
          {entry.id && entries_id_exists(entry) && (
            <button className="tlp-icon-btn tlp-danger" onClick={() => onDelete(entry.id)}>
              <Trash2 size={14} />
            </button>
          )}
          <Btn size="sm" onClick={save}><Check size={14} /> Save</Btn>
        </div>
      </div>

      <input
        className="tlp-editor-title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Entry title…"
        autoFocus={!entry.title}
      />

      {/* Tag bar */}
      <GlassPanel className="tlp-tag-bar">
        <div className="tlp-tag-row">
          <input
            className="tlp-tag-input"
            value={tags.asset}
            onChange={e => setTags({ ...tags, asset: e.target.value.toUpperCase() })}
            placeholder="Asset (e.g. EURUSD)"
          />
          <select
            className="tlp-tag-select"
            value={tags.timeframe}
            onChange={e => setTags({ ...tags, timeframe: e.target.value })}
          >
            <option value="">Timeframe</option>
            {TIMEFRAMES.map(tf => <option key={tf} value={tf}>{tf}</option>)}
          </select>
        </div>
        <input
          className="tlp-tag-input"
          value={tags.setup}
          onChange={e => setTags({ ...tags, setup: e.target.value })}
          placeholder="Setup (e.g. Liquidity sweep + BoS)"
        />
        <button className="tlp-link-trade-btn" onClick={() => setShowLinkTrade(true)}>
          {linkedTrade ? (
            <>
              <Link2 size={13} />
              <span>Linked: {linkedTrade.asset} {linkedTrade.pnl >= 0 ? '+' : ''}{fmtMoney(linkedTrade.pnl)}</span>
              <X size={13} className="tlp-link-x" onClick={(e) => { e.stopPropagation(); setLinkedTradeId(null); }} />
            </>
          ) : (
            <>
              <Link2 size={13} />
              <span>Link a trade</span>
            </>
          )}
        </button>
      </GlassPanel>

      {/* Blocks */}
      <div className="tlp-blocks">
        {blocks.map((block, i) => (
          <BlockEditor
            key={block.id}
            block={block}
            isFirst={i === 0}
            isLast={i === blocks.length - 1}
            canDelete={blocks.length > 1}
            onChange={(patch) => updateBlock(block.id, patch)}
            onMoveUp={() => moveBlock(block.id, -1)}
            onMoveDown={() => moveBlock(block.id, 1)}
            onDelete={() => removeBlock(block.id)}
          />
        ))}
      </div>

      {showAddBlock ? (
        <GlassPanel className="tlp-block-picker">
          <div className="tlp-block-picker-label">Add a block</div>
          <div className="tlp-block-picker-grid">
            {Object.entries(BLOCK_TYPES).map(([k, t]) => (
              <button key={k} className="tlp-block-picker-btn" onClick={() => addBlock(k)}>
                <span className="tlp-block-icon">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
          <button className="tlp-block-picker-cancel" onClick={() => setShowAddBlock(false)}>Cancel</button>
        </GlassPanel>
      ) : (
        <button className="tlp-add-block-btn" onClick={() => setShowAddBlock(true)}>
          <Plus size={14} /> Add block
        </button>
      )}

      {/* Link trade picker */}
      <Sheet open={showLinkTrade} onClose={() => setShowLinkTrade(false)} title="Link a trade">
        <div className="tlp-trade-list">
          {trades.length === 0 && <div className="tlp-empty-sm">Log a trade first to link one here.</div>}
          {[...trades].sort((a, b) => new Date(b.entryAt) - new Date(a.entryAt)).slice(0, 30).map(t => (
            <button key={t.id} className="tlp-trade-row"
              onClick={() => { setLinkedTradeId(t.id); setShowLinkTrade(false); }}>
              <div className={`tlp-trade-side tlp-${t.type}`}>
                {t.type === 'buy' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              </div>
              <div className="tlp-trade-main">
                <div className="tlp-trade-top">
                  <span className="tlp-trade-asset">{t.asset}</span>
                  <span className={`tlp-trade-pnl ${t.pnl > 0 ? 'tlp-up' : 'tlp-down'}`}>
                    {t.pnl > 0 ? '+' : ''}{fmtMoney(t.pnl)}
                  </span>
                </div>
                <div className="tlp-trade-bot"><span>{fmtDate(t.entryAt)}</span></div>
              </div>
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}

// helper: detect if entry is being edited (has been saved before)
function entries_id_exists(entry) {
  return entry && entry.id && entry.title !== '' || (entry.blocks && entry.blocks.some(b => b.content));
}

function BlockEditor({ block, isFirst, isLast, canDelete, onChange, onMoveUp, onMoveDown, onDelete }) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="tlp-block" onMouseEnter={() => setShowActions(true)} onMouseLeave={() => setShowActions(false)}>
      <div className="tlp-block-actions" data-show={showActions}>
        {!isFirst && <button onClick={onMoveUp} aria-label="Move up"><ChevronLeft size={12} style={{ transform: 'rotate(90deg)' }} /></button>}
        {!isLast && <button onClick={onMoveDown} aria-label="Move down"><ChevronRight size={12} style={{ transform: 'rotate(90deg)' }} /></button>}
        {canDelete && <button onClick={onDelete} className="tlp-block-del" aria-label="Delete block"><Trash2 size={11} /></button>}
      </div>

      {block.type === 'text' && (
        <textarea
          className="tlp-block-text"
          value={block.content}
          onChange={e => onChange({ content: e.target.value })}
          placeholder="Write something… markdown not required."
          rows={3}
        />
      )}
      {block.type === 'heading' && (
        <input
          className="tlp-block-heading"
          value={block.content}
          onChange={e => onChange({ content: e.target.value })}
          placeholder="Heading"
        />
      )}
      {block.type === 'bullet' && (
        <div className="tlp-block-bullet">
          <span className="tlp-bullet-dot">•</span>
          <input
            className="tlp-block-bullet-input"
            value={block.content}
            onChange={e => onChange({ content: e.target.value })}
            placeholder="List item"
          />
        </div>
      )}
      {block.type === 'divider' && (
        <div className="tlp-block-divider" />
      )}
      {block.type === 'quote' && (
        <textarea
          className="tlp-block-quote"
          value={block.content}
          onChange={e => onChange({ content: e.target.value })}
          placeholder="Quote or callout"
          rows={2}
        />
      )}
    </div>
  );
}

// ============================================================
// MISSED TRADE LOGGING
// Adds entries to the same trades store with a `missed: true` flag.
// Filtered out of equity/win-rate/expectancy calculations but visible
// in the Missed Opportunity report.
// ============================================================
function MissedTradeForm({ open, onClose, onSave, showToast }) {
  const [asset, setAsset] = useState('');
  const [direction, setDirection] = useState('buy');
  const [setup, setSetup] = useState('');
  const [estPnl, setEstPnl] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [datetime, setDatetime] = useState(() => localDT(new Date()));

  useEffect(() => {
    if (open) {
      setAsset(''); setDirection('buy'); setSetup(''); setEstPnl('');
      setReason(''); setNotes(''); setDatetime(localDT(new Date()));
    }
  }, [open]);

  const submit = () => {
    if (!asset.trim()) { showToast?.({ msg: 'Asset is required', type: 'error' }); return; }
    if (!reason.trim()) { showToast?.({ msg: 'Why did you miss it?', type: 'error' }); return; }
    onSave({
      id: crypto.randomUUID(),
      asset: asset.trim().toUpperCase(),
      type: direction,
      missed: true,
      missedReason: reason.trim(),
      setupType: setup.trim(),
      estimatedPnl: parseFloat(estPnl) || 0,
      pnl: 0, // missed trades don't contribute to actual PnL
      notes: notes.trim(),
      entryAt: new Date(datetime).toISOString(),
      exitAt: new Date(datetime).toISOString(),
      durationMinutes: 0,
      lotSize: 0,
    });
  };

  return (
    <Sheet open={open} onClose={onClose} title="Log a missed opportunity"
      footer={<Btn onClick={submit} full>Log it</Btn>}>
      <div className="tlp-form">
        <p className="tlp-mx-short" style={{ marginTop: 0 }}>
          Track trades you saw but did not take. Over time, patterns emerge in what you miss — and what it costs you.
        </p>

        <label className="tlp-field">
          <span>Asset</span>
          <input className="tlp-input" value={asset} onChange={e => setAsset(e.target.value.toUpperCase())} placeholder="EURUSD, BTCUSD, XAUUSD…" />
        </label>

        <div className="tlp-field">
          <span>Direction you would have taken</span>
          <div className="tlp-seg">
            <button className={`tlp-seg-btn ${direction === 'buy' ? 'tlp-active tlp-buy' : ''}`} onClick={() => setDirection('buy')}>
              <ArrowUpRight size={14} /> Buy / Long
            </button>
            <button className={`tlp-seg-btn ${direction === 'sell' ? 'tlp-active tlp-sell' : ''}`} onClick={() => setDirection('sell')}>
              <ArrowDownRight size={14} /> Sell / Short
            </button>
          </div>
        </div>

        <label className="tlp-field">
          <span>Setup (optional)</span>
          <input className="tlp-input" value={setup} onChange={e => setSetup(e.target.value)} placeholder="Breakout, Liquidity sweep…" />
        </label>

        <label className="tlp-field">
          <span>Why did you miss it?</span>
          <select className="tlp-input" value={reason} onChange={e => setReason(e.target.value)}>
            <option value="">Pick a reason…</option>
            <option value="fear">Fear / hesitation</option>
            <option value="not-watching">Wasn't at the chart</option>
            <option value="rules-conflict">My rules said no, market said yes</option>
            <option value="overthinking">Overthinking the entry</option>
            <option value="size-doubt">Doubted my position size</option>
            <option value="recent-loss">Just took a loss, scared</option>
            <option value="distracted">Distracted / off the desk</option>
            <option value="other">Other</option>
          </select>
        </label>

        <label className="tlp-field">
          <span>Estimated P&L if you had taken it (USD)</span>
          <input className="tlp-input" type="number" step="0.01" value={estPnl} onChange={e => setEstPnl(e.target.value)} placeholder="50.00" />
          <small className="tlp-hint">Be honest. The point is to learn, not to torture yourself.</small>
        </label>

        <label className="tlp-field">
          <span>When?</span>
          <input className="tlp-input" type="datetime-local" value={datetime} onChange={e => setDatetime(e.target.value)} />
        </label>

        <label className="tlp-field">
          <span>Notes (optional)</span>
          <textarea className="tlp-input tlp-textarea" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="What did you see? What were you feeling?" />
        </label>
      </div>
    </Sheet>
  );
}

// ============================================================
// MT4/MT5 STATEMENT IMPORT
// Parses the HTML report exported from MetaTrader 4 or 5.
// Looks for the closed-deals table and extracts ticket, symbol,
// type, lot, time, price, profit columns. Dedupes by ticket+broker.
// ============================================================
function parseMtStatement(htmlText) {
  // Heuristic parser. MT4 and MT5 differ slightly but both produce
  // tabular HTML with <tr><td> rows. We look for rows that have
  // the classic columns: Time, Ticket, Symbol, Type, Volume, Price, Profit.
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, 'text/html');
  const rows = Array.from(doc.querySelectorAll('tr'));
  const trades = [];

  for (const row of rows) {
    const cells = Array.from(row.querySelectorAll('td')).map(c => c.textContent.trim());
    if (cells.length < 7) continue;

    // MT4 closed deals: Ticket, Open Time, Type, Lots, Symbol, OpenPrice, S/L, T/P, CloseTime, ClosePrice, Commission, Taxes, Swap, Profit
    // MT5 deals:        Time, Deal, Symbol, Type, Direction, Volume, Price, Order, Commission, Fee, Swap, Profit, Balance
    // We try MT4 shape first (ticket is numeric, symbol contains letters).
    const looksLikeTicket = /^\d{5,}$/.test(cells[0]);
    if (!looksLikeTicket) continue;

    // Try MT4 layout
    const ticket = cells[0];
    const openTime = cells[1];
    const type = cells[2]?.toLowerCase();
    const lots = parseFloat(cells[3]);
    const symbol = cells[4];
    const openPrice = parseFloat(cells[5]);
    const closeTime = cells[8];
    const closePrice = parseFloat(cells[9]);
    const profit = parseFloat(cells[cells.length - 1]?.replace(/\s/g, '').replace(',', '.'));

    if (!type || !symbol || isNaN(lots) || isNaN(profit)) continue;
    if (type !== 'buy' && type !== 'sell') continue;

    const entryAt = parseMtDate(openTime);
    const exitAt = parseMtDate(closeTime) || entryAt;
    if (!entryAt) continue;

    trades.push({
      id: `mt-${ticket}`,
      ticket,
      asset: symbol.toUpperCase().replace(/[^A-Z0-9]/g, ''),
      type,
      lotSize: lots,
      entryPrice: openPrice,
      exitPrice: closePrice,
      pnl: profit,
      entryAt,
      exitAt,
      durationMinutes: Math.max(0, (new Date(exitAt) - new Date(entryAt)) / 60000),
      setupType: '',
      notes: `Imported from MT statement (ticket #${ticket})`,
      confluenceIds: [],
      discipline: null,
      emotion: '',
      hasScreenshot: false,
      imported: true,
    });
  }

  return trades;
}

function parseMtDate(str) {
  if (!str) return null;
  // MT formats: "2024.05.12 14:23:45" or "2024.05.12 14:23"
  const m = str.match(/(\d{4})[.\-/](\d{2})[.\-/](\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return null;
  const [, y, mo, d, h, mi, s] = m;
  return new Date(`${y}-${mo}-${d}T${h}:${mi}:${s || '00'}`).toISOString();
}

function StatementImportSheet({ open, onClose, existingTrades, onImport, showToast }) {
  const [parsed, setParsed] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef();

  useEffect(() => { if (!open) { setParsed(null); setError(null); } }, [open]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    setError(null);
    try {
      const text = await file.text();
      const trades = parseMtStatement(text);
      if (trades.length === 0) {
        setError("Couldn't find any trades in this file. Make sure it's a Detailed Report (HTML) exported from MT4 or MT5.");
      } else {
        setParsed(trades);
      }
    } catch (err) {
      setError('Failed to read the file: ' + err.message);
    } finally {
      setParsing(false);
    }
  };

  const importIt = () => {
    if (!parsed) return;
    // Dedupe by ticket
    const existingTickets = new Set(existingTrades.filter(t => t.ticket).map(t => t.ticket));
    const fresh = parsed.filter(t => !existingTickets.has(t.ticket));
    const dupes = parsed.length - fresh.length;
    onImport(fresh);
    showToast?.({
      msg: dupes > 0
        ? `Imported ${fresh.length}, skipped ${dupes} duplicates`
        : `Imported ${fresh.length} trades`,
      type: 'success'
    });
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Import MT4 / MT5 statement"
      footer={parsed && <Btn onClick={importIt} full>Import {parsed.length} trades</Btn>}>
      <div className="tlp-import">
        <div className="tlp-import-help">
          <h4>How to export from MetaTrader</h4>
          <ol className="tlp-import-steps">
            <li>Open your MT4 or MT5 terminal</li>
            <li>Go to <strong>Toolbox → History</strong></li>
            <li>Right-click anywhere in the history table</li>
            <li>Choose <strong>"Save as Detailed Report"</strong> (MT5) or <strong>"Save as Report"</strong> (MT4)</li>
            <li>Save the .htm or .html file, then drop it here</li>
          </ol>
          <p className="tlp-import-note">
            <Info size={12} /> Works with statements from any MT4/MT5 broker — Exness, FundedNext, FTMO, Goat Funded, IC Markets, anywhere.
          </p>
        </div>

        <input ref={fileRef} type="file" accept=".htm,.html,text/html" style={{ display: 'none' }} onChange={handleFile} />

        {!parsed && (
          <button className="tlp-import-drop" onClick={() => fileRef.current?.click()} disabled={parsing}>
            {parsing ? (
              <>
                <RefreshCw size={20} className="tlp-spin" />
                <span>Parsing your trades…</span>
              </>
            ) : (
              <>
                <Upload size={20} />
                <span>Click to choose your statement file</span>
                <small>.htm / .html only</small>
              </>
            )}
          </button>
        )}

        {error && (
          <GlassPanel className="tlp-import-err">
            <AlertCircle size={16} style={{ color: 'var(--loss)' }} />
            <p>{error}</p>
          </GlassPanel>
        )}

        {parsed && (
          <GlassPanel className="tlp-import-preview">
            <div className="tlp-import-preview-head">
              <Check size={18} style={{ color: 'var(--win)' }} />
              <div>
                <strong>{parsed.length} trades found</strong>
                <small>Review and confirm import below</small>
              </div>
            </div>
            <div className="tlp-import-list">
              {parsed.slice(0, 5).map(t => (
                <div key={t.id} className="tlp-import-row">
                  <span className="tlp-import-asset">{t.asset}</span>
                  <span className={`tlp-import-type tlp-${t.type}`}>{t.type}</span>
                  <span className={`tlp-import-pnl ${t.pnl >= 0 ? 'tlp-up' : 'tlp-down'}`}>
                    {t.pnl >= 0 ? '+' : ''}{fmtMoney(t.pnl)}
                  </span>
                </div>
              ))}
              {parsed.length > 5 && <div className="tlp-empty-sm">+ {parsed.length - 5} more</div>}
            </div>
          </GlassPanel>
        )}
      </div>
    </Sheet>
  );
}


// ============================================================
// MISSED OPPORTUNITY REPORT
// ============================================================
const MISSED_REASON_LABELS = {
  fear: 'Fear / hesitation',
  'not-watching': "Wasn't at the chart",
  'rules-conflict': 'Rules vs. market',
  overthinking: 'Overthinking entry',
  'size-doubt': 'Doubted position size',
  'recent-loss': 'Just took a loss',
  distracted: 'Distracted',
  other: 'Other',
};

function MissedOpportunityReport({ missedTrades, onLogMissed }) {
  if (!missedTrades || missedTrades.length === 0) {
    return (
      <GlassPanel className="tlp-empty">
        <Eye size={26} style={{ color: 'var(--accent)' }} />
        <div className="tlp-empty-title">Track what you miss</div>
        <div className="tlp-empty-sub">When you see a setup but don't take it, log it here. Patterns become obvious within a few weeks.</div>
        <Btn onClick={onLogMissed}><Plus size={14} /> Log a missed trade</Btn>
      </GlassPanel>
    );
  }

  const totalMissed = missedTrades.reduce((s, t) => s + (t.estimatedPnl || 0), 0);
  const profitableMisses = missedTrades.filter(t => (t.estimatedPnl || 0) > 0);

  const reasonCounts = {};
  missedTrades.forEach(t => {
    const r = t.missedReason || 'other';
    reasonCounts[r] = (reasonCounts[r] || 0) + 1;
  });
  const topReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0];

  const assetCounts = {};
  missedTrades.forEach(t => {
    assetCounts[t.asset] = (assetCounts[t.asset] || 0) + (t.estimatedPnl || 0);
  });
  const topAsset = Object.entries(assetCounts).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent = missedTrades.filter(t => new Date(t.entryAt).getTime() > sevenDaysAgo);
  const recentMissed = recent.reduce((s, t) => s + (t.estimatedPnl || 0), 0);

  return (
    <>
      <GlassPanel className="tlp-missed-summary">
        <div className="tlp-missed-headline">
          <div>
            <div className="tlp-stat-label">Estimated profit missed</div>
            <div className={`tlp-missed-value ${totalMissed >= 0 ? 'tlp-up' : 'tlp-down'}`}>
              {totalMissed >= 0 ? '+' : ''}{fmtMoney(totalMissed)}
            </div>
            <small className="tlp-stat-sub">across {missedTrades.length} missed trade{missedTrades.length !== 1 ? 's' : ''}</small>
          </div>
          <Btn size="sm" variant="ghost" onClick={onLogMissed}>
            <Plus size={13} /> Log
          </Btn>
        </div>

        <div className="tlp-missed-row">
          <div className="tlp-missed-cell">
            <span>Last 7 days</span>
            <strong className={recentMissed >= 0 ? 'tlp-up' : 'tlp-down'}>
              {recentMissed >= 0 ? '+' : ''}{fmtMoney(recentMissed)}
            </strong>
            <small>{recent.length} trade{recent.length !== 1 ? 's' : ''}</small>
          </div>
          <div className="tlp-missed-cell">
            <span>Profitable misses</span>
            <strong>{profitableMisses.length}</strong>
            <small>of {missedTrades.length}</small>
          </div>
        </div>

        {topReason && (
          <div className="tlp-missed-callout">
            <AlertCircle size={14} />
            <div>
              <strong>Top reason: {MISSED_REASON_LABELS[topReason[0]] || topReason[0]}</strong>
              <span> · {topReason[1]} time{topReason[1] !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}

        {topAsset && (
          <div className="tlp-missed-callout">
            <Target size={14} />
            <div>
              <strong>Most-missed asset: {topAsset[0]}</strong>
              <span> · {fmtMoney(Math.abs(topAsset[1]))} estimated</span>
            </div>
          </div>
        )}
      </GlassPanel>

      <GlassPanel className="tlp-missed-list">
        <div className="tlp-missed-list-head">Recent</div>
        {[...missedTrades].sort((a, b) => new Date(b.entryAt) - new Date(a.entryAt)).slice(0, 5).map(t => (
          <div key={t.id} className="tlp-missed-row-item">
            <AssetChip symbol={t.asset} size={26} />
            <div className="tlp-missed-info">
              <div className="tlp-missed-info-top">
                <span className="tlp-missed-asset">{t.asset}</span>
                <span className={`tlp-missed-pnl ${(t.estimatedPnl || 0) >= 0 ? 'tlp-up' : 'tlp-down'}`}>
                  {(t.estimatedPnl || 0) >= 0 ? '+' : ''}{fmtMoney(t.estimatedPnl || 0)}
                </span>
              </div>
              <div className="tlp-missed-info-bot">
                <span>{fmtDate(t.entryAt)}</span>
                <span>·</span>
                <span>{MISSED_REASON_LABELS[t.missedReason] || t.missedReason}</span>
              </div>
            </div>
          </div>
        ))}
      </GlassPanel>
    </>
  );
}


function BottomNav({ view, setView, onLog }) {
  const items = [
    { key: 'home', icon: Home, label: 'Home' },
    { key: 'calendar', icon: CalIcon, label: 'Calendar' },
    { key: 'fab', icon: Plus, label: 'Log' },
    { key: 'analytics', icon: BarChart3, label: 'Analytics' },
    { key: 'journal', icon: BookOpen, label: 'Journal' },
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
  const [statementImportOpen, setStatementImportOpen] = useState(false);
  const [missedFormOpen, setMissedFormOpen] = useState(false);
  const [authSheetOpen, setAuthSheetOpen] = useState(false);
  const [migrationSheetOpen, setMigrationSheetOpen] = useState(false);
  const [migrationCounts, setMigrationCounts] = useState({ trades: 0, confluences: 0, journal: 0, profile: false });
  const auth = useAuth();
  const { adapter, status: syncStatus, isCloud } = useStoreCtx();

  // Re-load all data when:
  //   - first mount (anonymous)
  //   - user signs in (adapter switches to cloud)
  //   - user signs out (adapter switches back to local)
  // The adapter object identity changes whenever userId changes,
  // so we use it as the dependency.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [p, t, c] = await Promise.all([
          adapter.loadProfile(),
          adapter.listTrades(),
          adapter.listConfluences(),
        ]);
        if (cancelled) return;
        setProfileState(p);
        setConfluencesState(c || []);
        setTradesState(t || []);
        // Phase routing only matters on cold start (first ever load)
        if (!booted) {
          if (!p || !p.onboarded) setPhase('onboard');
          else setPhase('intro');
        }
        setBooted(true);
      } catch (err) {
        console.warn('Initial load failed:', err);
        // Fall back to anonymous so user isn't locked out
        if (!cancelled) setBooted(true);
      }
    })();
    return () => { cancelled = true; };
  }, [adapter]);

  // When user signs in for the first time on this device, offer to migrate
  // their localStorage data to the cloud account. Storage flag is on
  // localStorage (window.storage) because it's per-device.
  useEffect(() => {
    if (!auth.isAuthenticated || !auth.user || !booted) return;
    (async () => {
      const flag = await storageGet(`tlp:migration_done:${auth.user.id}`);
      if (flag) return;
      const localProfile = await storageGet(KEY.profile);
      const localTrades = (await storageGet(KEY.trades, [])) || [];
      const localConfluences = (await storageGet(KEY.confluences, [])) || [];
      const localJournal = (await storageGet('tlp:journal', [])) || [];
      const counts = {
        trades: localTrades.length,
        confluences: localConfluences.length,
        journal: localJournal.length,
        profile: !!localProfile?.onboarded,
      };
      if (counts.trades || counts.confluences || counts.journal || counts.profile) {
        setMigrationCounts(counts);
        setMigrationSheetOpen(true);
      } else {
        await storageSet(`tlp:migration_done:${auth.user.id}`, true);
      }
    })();
  }, [auth.isAuthenticated, auth.user, booted]);

  const handleMigrate = async (onProgress) => {
    if (!auth.user) return;
    await migrateLocalToCloud(auth.user.id, { onProgress });
    // After migration, re-load from cloud so the UI shows the imported data.
    const [p, t, c] = await Promise.all([
      adapter.loadProfile(),
      adapter.listTrades(),
      adapter.listConfluences(),
    ]);
    setProfileState(p);
    setConfluencesState(c || []);
    setTradesState(t || []);
  };

  const handleSignOut = async () => {
    if (!confirm('Sign out? Your local trades stay on this device. Cloud data stays in your account.')) return;
    await auth.signOut();
    setToast({ msg: 'Signed out', type: 'success' });
    // The auth state change will trigger the load effect above and the
    // adapter will switch back to local automatically.
  };

  // ---- WRITE PATHS — go through the adapter ----
  const setProfile = async (next) => {
    setProfileState(next);
    try { await adapter.saveProfile(next); }
    catch (err) { setToast({ msg: 'Profile save failed — try again', type: 'error' }); }
  };

  const setConfluences = async (next) => {
    setConfluencesState(next);
    try { await adapter.saveConfluences(next); }
    catch (err) { setToast({ msg: 'Confluence save failed', type: 'error' }); }
  };

  // setTrades is used in two ways: (1) bulk replace (rare — only after
  // import/migration), and (2) single-trade update. We branch by
  // computing the diff against current state.
  const setTrades = async (next) => {
    setTradesState(next);
    // Compute diff against current state to know what to persist
    const currentIds = new Set(trades.map(t => t.id));
    const nextIds = new Set(next.map(t => t.id));
    const added = next.filter(t => !currentIds.has(t.id));
    const removed = trades.filter(t => !nextIds.has(t.id));
    const possiblyUpdated = next.filter(t => currentIds.has(t.id));
    try {
      // Removals first
      for (const t of removed) await adapter.deleteTrade(t.id);
      // Then upserts (added + updated — adapter.saveTrade handles both)
      for (const t of [...added, ...possiblyUpdated.filter(t => {
        const cur = trades.find(c => c.id === t.id);
        return cur && JSON.stringify(cur) !== JSON.stringify(t);
      })]) {
        await adapter.saveTrade(t);
      }
    } catch (err) {
      setToast({ msg: 'Save failed — see console', type: 'error' });
    }
  };

  // Real trades vs missed trades (treated separately)
  const realTrades = useMemo(() => trades.filter(t => !t.missed), [trades]);
  const missedTrades = useMemo(() => trades.filter(t => t.missed), [trades]);
  const stats = useMemo(() => computeStats(realTrades, profile?.startingBalance || 0), [realTrades, profile?.startingBalance]);

  const onboardDone = async (p) => {
    setProfileState(p);
    // Persist via adapter so cloud users get their profile saved too
    try { await adapter.saveProfile(p); } catch {}
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
    setTradesState(next);
    try {
      await adapter.saveTrade(trade);
      setTradeFormOpen(false);
      setEditing(null);
      setPrefillMarket(null);
      setToast({ msg: exists ? 'Trade updated' : 'Trade logged', type: 'success' });
    } catch (err) {
      setToast({ msg: 'Save failed — try again', type: 'error' });
    }
  };

  const deleteTrade = async (id) => {
    const next = trades.filter(t => t.id !== id);
    setTradesState(next);
    try { await adapter.deleteTrade(id); } catch {}
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
    const message = isCloud
      ? 'This wipes all your trades, confluences and journal entries from the cloud. Your account stays. Continue?'
      : 'This wipes all trades, confluences and settings on this device. Continue?';
    if (!confirm(message)) return;
    try {
      await adapter.wipeAll();
    } catch (err) {
      setToast({ msg: 'Wipe failed — see console', type: 'error' });
      return;
    }
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
            {/* Top-right utility row, except on settings view itself */}
            {view !== 'settings' && (
              <div className="tlp-app-utility">
                {isCloud && (
                  <div className={`tlp-sync-pill tlp-sync-${syncStatus}`} title={
                    syncStatus === 'synced' ? 'Synced to cloud'
                    : syncStatus === 'syncing' ? 'Syncing...'
                    : syncStatus === 'error' ? 'Sync failed — check connection'
                    : 'Cloud'
                  }>
                    <span className="tlp-sync-dot" />
                    <span className="tlp-sync-label">
                      {syncStatus === 'syncing' ? 'syncing' : syncStatus === 'error' ? 'offline' : 'synced'}
                    </span>
                  </div>
                )}
                <button className="tlp-icon-btn tlp-utility-btn" onClick={() => setStatementImportOpen(true)} aria-label="Import statement">
                  <Upload size={14} />
                </button>
                <button className="tlp-icon-btn tlp-utility-btn" onClick={() => setView('settings')} aria-label="Settings">
                  <SettingsIcon size={14} />
                </button>
              </div>
            )}
            {view === 'home' && (
              <Dashboard
                profile={profile}
                trades={realTrades}
                stats={stats}
                onOpenTrade={setDetail}
                onLog={() => setTradeFormOpen(true)}
                marketData={marketData}
                onOpenMarkets={() => setMarketsOpen(true)}
                onPickMarket={onPickMarketTile}
              />
            )}
            {view === 'calendar' && (
              <CalendarView trades={realTrades} onDayClick={setDayKey} />
            )}
            {view === 'analytics' && (
              <AnalyticsView
                profile={profile}
                trades={realTrades}
                missedTrades={missedTrades}
                stats={stats}
                confluences={confluences}
                onOpenTrade={setDetail}
                onLog={() => setTradeFormOpen(true)}
                onLogMissed={() => setMissedFormOpen(true)}
                onUpgrade={() => setUpgradeOpen(true)}
              />
            )}
            {view === 'journal' && (
              <JournalView trades={realTrades} onOpenTrade={setDetail} showToast={setToast} />
            )}
            {view === 'settings' && (
              <>
                <div className="tlp-settings-tabs">
                  <button className={settingsSubView === 'main' ? 'tlp-active' : ''} onClick={() => setSettingsSubView('main')}>Settings</button>
                  <button className={settingsSubView === 'confluences' ? 'tlp-active' : ''} onClick={() => setSettingsSubView('confluences')}>Confluences</button>
                </div>
                {settingsSubView === 'main' ? (
                  <SettingsView
                    profile={profile}
                    setProfile={setProfile}
                    trades={trades}
                    confluences={confluences}
                    onReset={resetAll}
                    showToast={setToast}
                    onUpgrade={() => setUpgradeOpen(true)}
                    onImportStatement={() => setStatementImportOpen(true)}
                    onLogMissed={() => setMissedFormOpen(true)}
                    onShowAuth={() => setAuthSheetOpen(true)}
                    onShowSignOut={handleSignOut}
                  />
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

          <StatementImportSheet
            open={statementImportOpen}
            onClose={() => setStatementImportOpen(false)}
            existingTrades={trades}
            onImport={async (newTrades) => {
              // Bulk insert via adapter, then refresh from source of truth
              try {
                await adapter.bulkInsertTrades(newTrades);
                const fresh = await adapter.listTrades();
                setTradesState(fresh);
              } catch (err) {
                setToast({ msg: 'Import save failed', type: 'error' });
              }
            }}
            showToast={setToast}
          />

          <MissedTradeForm
            open={missedFormOpen}
            onClose={() => setMissedFormOpen(false)}
            onSave={async (t) => {
              setTradesState([...trades, t]);
              try { await adapter.saveTrade(t); } catch {}
              setMissedFormOpen(false);
              setToast({ msg: 'Missed trade logged', type: 'success' });
            }}
            showToast={setToast}
          />

          <AuthSheet
            open={authSheetOpen}
            onClose={() => setAuthSheetOpen(false)}
            onSuccess={() => setToast({ msg: 'Signed in', type: 'success' })}
          />

          <MigrationSheet
            open={migrationSheetOpen}
            onClose={async () => {
              if (auth.user) {
                // Mark done so we don't keep re-asking
                await storageSet(`tlp:migration_done:${auth.user.id}`, true);
              }
              setMigrationSheetOpen(false);
            }}
            onConfirm={handleMigrate}
            localCounts={migrationCounts}
          />
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

      /* Asset chip — colored circle with first 2-3 letters, real per-asset visual identity */
      .tlp-asset-chip { display: grid; place-items: center; border-radius: 10px; font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #fff; flex-shrink: 0; letter-spacing: -0.5px; box-shadow: 0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2); text-shadow: 0 1px 2px rgba(0,0,0,0.3); }
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

      /* ==== TOP-RIGHT UTILITY BUTTONS ==== */
      .tlp-app-utility { position: absolute; top: 18px; right: 16px; display: flex; gap: 6px; z-index: 5; }
      .tlp-utility-btn { background: var(--panel) !important; padding: 8px !important; }

      /* === SYNC INDICATOR === */
      .tlp-sync-pill { display: inline-flex; align-items: center; gap: 5px; padding: 4px 9px; background: var(--panel); border: 1px solid var(--border); border-radius: 999px; font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; transition: all 0.2s ease; }
      .tlp-sync-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
      .tlp-sync-synced { color: var(--accent); border-color: var(--accent-border); }
      .tlp-sync-synced .tlp-sync-dot { background: var(--accent); box-shadow: 0 0 6px var(--accent-glow); }
      .tlp-sync-syncing { color: var(--accent); border-color: var(--accent-border); }
      .tlp-sync-syncing .tlp-sync-dot { background: var(--accent); animation: tlp-pulse 1.2s ease-in-out infinite; }
      .tlp-sync-error { color: var(--loss); border-color: rgba(239,68,68,0.3); }
      .tlp-sync-error .tlp-sync-dot { background: var(--loss); }
      .tlp-sync-local { display: none; }
      @media (max-width: 380px) { .tlp-sync-label { display: none; } }

      /* ==== METRIC INFO BUTTON ==== */
      .tlp-info-btn { display: inline-grid; place-items: center; width: 16px; height: 16px; padding: 0; margin-left: 4px; border-radius: 50%; background: var(--panel); border: 1px solid var(--border); color: var(--muted); transition: all 0.15s ease; vertical-align: middle; }
      .tlp-info-btn:hover { color: var(--accent); border-color: var(--accent-border); }

      /* ==== METRIC EXPLAINER SHEET ==== */
      .tlp-mx { display: flex; flex-direction: column; gap: 16px; padding: 4px 0 12px; }
      .tlp-mx-short { font-size: 15px; color: var(--fg); line-height: 1.5; font-weight: 500; }
      .tlp-mx-formula { padding: 12px 14px; }
      .tlp-mx-formula-label { font-size: 9px; letter-spacing: 0.16em; color: var(--accent); font-weight: 700; font-family: 'JetBrains Mono', monospace; margin-bottom: 5px; }
      .tlp-mx-formula-eq { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 600; line-height: 1.5; color: var(--fg); }
      .tlp-mx-section h4 { font-size: 13px; font-weight: 700; margin: 0 0 8px; color: var(--accent); letter-spacing: -0.01em; }
      .tlp-mx-section p { font-size: 14px; color: var(--fg); line-height: 1.55; margin: 0 0 10px; }
      .tlp-mx-section p:last-child { margin-bottom: 0; }
      .tlp-mx-matters h4 { color: var(--fg); }
      .tlp-mx-matters { padding-top: 10px; border-top: 1px solid var(--border); }

      /* ==== JOURNAL ==== */
      .tlp-journal-list { display: flex; flex-direction: column; gap: 8px; }
      .tlp-journal-card { padding: 14px 16px; background: var(--panel); border: 1px solid var(--border); border-radius: 13px; backdrop-filter: blur(12px); width: 100%; text-align: left; transition: all 0.15s ease; cursor: pointer; }
      .tlp-journal-card:hover { border-color: var(--accent-border); transform: translateY(-1px); }
      .tlp-journal-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 6px; }
      .tlp-journal-card-title { font-size: 15px; font-weight: 700; letter-spacing: -0.01em; flex: 1; min-width: 0; display: flex; align-items: center; gap: 6px; line-height: 1.3; }
      .tlp-pin-marker { color: var(--accent); display: inline-flex; flex-shrink: 0; }
      .tlp-pin-btn { padding: 4px; color: var(--muted); border-radius: 6px; transition: all 0.15s; }
      .tlp-pin-btn:hover { color: var(--accent); }
      .tlp-pin-btn[data-pinned="true"] { color: var(--accent); }
      .tlp-journal-card-preview { margin: 0 0 10px; font-size: 13px; color: var(--muted); line-height: 1.5; }
      .tlp-journal-card-meta { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; font-size: 11px; color: var(--muted); font-weight: 500; }
      .tlp-meta-pill { padding: 2px 7px; background: var(--panel); border: 1px solid var(--border); border-radius: 5px; font-family: 'JetBrains Mono', monospace; font-size: 10px; }
      .tlp-meta-pill.tlp-tf { color: var(--accent); border-color: var(--accent-border); background: var(--accent-soft); }
      .tlp-meta-pill.tlp-up { color: var(--win); border-color: rgba(16,217,160,0.3); background: rgba(16,217,160,0.1); }
      .tlp-meta-pill.tlp-down { color: var(--loss); border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.1); }

      .tlp-tf-pills { display: flex; gap: 5px; overflow-x: auto; padding: 2px 0; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
      .tlp-tf-pills::-webkit-scrollbar { display: none; }
      .tlp-tf-pill { padding: 7px 12px; background: var(--panel); border: 1px solid var(--border); border-radius: 8px; font-size: 12px; font-weight: 600; font-family: 'JetBrains Mono', monospace; color: var(--muted); white-space: nowrap; transition: all 0.15s; flex-shrink: 0; }
      .tlp-tf-pill:hover { color: var(--fg); border-color: var(--accent-border); }
      .tlp-tf-pill.tlp-active { background: var(--accent-soft); color: var(--accent); border-color: var(--accent-border); }

      /* === EDITOR === */
      .tlp-editor { gap: 14px; }
      .tlp-editor-bar { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
      .tlp-editor-bar-actions { display: flex; gap: 6px; }
      .tlp-editor-title { width: 100%; padding: 14px 4px; background: transparent; border: none; outline: none; color: var(--fg); font-size: clamp(22px, 4vw, 30px); font-weight: 800; letter-spacing: -0.025em; font-family: 'Outfit', sans-serif; }
      .tlp-editor-title::placeholder { color: var(--muted); opacity: 0.6; }

      .tlp-tag-bar { display: flex; flex-direction: column; gap: 8px; padding: 12px; }
      .tlp-tag-row { display: flex; gap: 8px; }
      .tlp-tag-input { flex: 1; padding: 9px 12px; background: var(--panel); border: 1px solid var(--border); border-radius: 8px; color: var(--fg); font-size: 13px; font-family: 'JetBrains Mono', monospace; font-weight: 500; }
      .tlp-tag-input:focus { outline: none; border-color: var(--accent); }
      .tlp-tag-select { padding: 9px 10px; background: var(--panel); border: 1px solid var(--border); border-radius: 8px; color: var(--fg); font-size: 13px; font-family: 'JetBrains Mono', monospace; min-width: 110px; }
      .tlp-link-trade-btn { display: flex; align-items: center; gap: 6px; padding: 9px 12px; background: var(--accent-soft); border: 1px solid var(--accent-border); border-radius: 8px; color: var(--accent); font-size: 12px; font-weight: 600; transition: all 0.15s; }
      .tlp-link-trade-btn:hover { background: var(--accent-border); }
      .tlp-link-x { margin-left: auto; padding: 2px; }

      .tlp-blocks { display: flex; flex-direction: column; gap: 6px; }
      .tlp-block { position: relative; padding: 4px 0; }
      .tlp-block-actions { position: absolute; top: 8px; right: 0; display: flex; gap: 2px; opacity: 0; pointer-events: none; transition: opacity 0.15s; z-index: 2; }
      .tlp-block-actions[data-show="true"] { opacity: 1; pointer-events: auto; }
      .tlp-block-actions button { padding: 4px; background: var(--panel-solid); border: 1px solid var(--border); border-radius: 6px; color: var(--muted); display: grid; place-items: center; }
      .tlp-block-actions button:hover { color: var(--fg); border-color: var(--accent-border); }
      .tlp-block-del:hover { color: var(--loss) !important; border-color: rgba(239,68,68,0.3) !important; }

      .tlp-block-text { width: 100%; padding: 10px 12px; background: transparent; border: 1px solid transparent; border-radius: 8px; color: var(--fg); font-size: 15px; font-family: 'Outfit', sans-serif; line-height: 1.6; resize: vertical; transition: border-color 0.15s; min-height: 50px; }
      .tlp-block-text:focus, .tlp-block-text:hover { outline: none; border-color: var(--border); }
      .tlp-block-text:focus { border-color: var(--accent-border); background: var(--panel); }
      .tlp-block-text::placeholder { color: var(--muted); opacity: 0.5; }

      .tlp-block-heading { width: 100%; padding: 8px 12px; background: transparent; border: 1px solid transparent; border-radius: 8px; color: var(--fg); font-size: 22px; font-weight: 700; letter-spacing: -0.02em; font-family: 'Outfit', sans-serif; }
      .tlp-block-heading:focus, .tlp-block-heading:hover { outline: none; border-color: var(--border); }
      .tlp-block-heading:focus { border-color: var(--accent-border); background: var(--panel); }
      .tlp-block-heading::placeholder { color: var(--muted); opacity: 0.5; }

      .tlp-block-bullet { display: flex; align-items: flex-start; gap: 8px; padding: 8px 12px; border: 1px solid transparent; border-radius: 8px; transition: border-color 0.15s; }
      .tlp-block-bullet:focus-within { border-color: var(--accent-border); background: var(--panel); }
      .tlp-block-bullet:hover { border-color: var(--border); }
      .tlp-bullet-dot { color: var(--accent); font-weight: 700; flex-shrink: 0; line-height: 1.6; font-size: 18px; }
      .tlp-block-bullet-input { flex: 1; background: transparent; border: none; outline: none; color: var(--fg); font-size: 15px; font-family: 'Outfit', sans-serif; line-height: 1.5; }
      .tlp-block-bullet-input::placeholder { color: var(--muted); opacity: 0.5; }

      .tlp-block-divider { height: 1px; background: var(--border); margin: 14px 12px; }
      .tlp-block-quote { width: 100%; padding: 12px 16px; background: var(--accent-soft); border: 1px solid var(--accent-border); border-left: 3px solid var(--accent); border-radius: 8px; color: var(--fg); font-size: 14px; font-family: 'Outfit', sans-serif; font-style: italic; line-height: 1.55; resize: vertical; }
      .tlp-block-quote:focus { outline: none; }

      .tlp-add-block-btn { display: flex; align-items: center; justify-content: center; gap: 6px; padding: 12px; background: var(--panel); border: 1.5px dashed var(--border); border-radius: 11px; color: var(--muted); font-size: 13px; font-weight: 500; transition: all 0.15s; width: 100%; }
      .tlp-add-block-btn:hover { color: var(--accent); border-color: var(--accent-border); background: var(--accent-soft); border-style: solid; }

      .tlp-block-picker { padding: 16px; }
      .tlp-block-picker-label { font-size: 11px; letter-spacing: 0.12em; color: var(--muted); font-weight: 600; text-transform: uppercase; margin-bottom: 10px; font-family: 'JetBrains Mono', monospace; }
      .tlp-block-picker-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 8px; margin-bottom: 12px; }
      .tlp-block-picker-btn { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px 6px; background: var(--panel); border: 1px solid var(--border); border-radius: 9px; font-size: 12px; font-weight: 600; color: var(--fg); transition: all 0.15s; }
      .tlp-block-picker-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
      .tlp-block-icon { width: 28px; height: 28px; border-radius: 7px; background: var(--accent-soft); border: 1px solid var(--accent-border); color: var(--accent); display: grid; place-items: center; font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 14px; }
      .tlp-block-picker-cancel { width: 100%; padding: 8px; font-size: 12px; color: var(--muted); border-radius: 8px; }
      .tlp-block-picker-cancel:hover { color: var(--fg); }

      /* ==== STATEMENT IMPORT ==== */
      .tlp-import { display: flex; flex-direction: column; gap: 14px; padding: 4px 0 12px; }
      .tlp-import-help { padding: 14px 16px; background: var(--panel); border: 1px solid var(--border); border-radius: 11px; }
      .tlp-import-help h4 { margin: 0 0 8px; font-size: 13px; font-weight: 700; letter-spacing: -0.01em; }
      .tlp-import-steps { padding-left: 20px; margin: 0 0 10px; display: flex; flex-direction: column; gap: 5px; font-size: 13px; color: var(--fg); line-height: 1.45; }
      .tlp-import-steps li { padding-left: 4px; }
      .tlp-import-steps strong { color: var(--accent); font-weight: 600; }
      .tlp-import-note { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--muted); margin: 6px 0 0; line-height: 1.4; }
      .tlp-import-drop { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 28px 20px; background: var(--accent-soft); border: 2px dashed var(--accent-border); border-radius: 14px; color: var(--accent); font-size: 14px; font-weight: 600; transition: all 0.15s; cursor: pointer; }
      .tlp-import-drop:hover:not(:disabled) { background: var(--accent-border); }
      .tlp-import-drop small { font-size: 11px; opacity: 0.7; font-weight: 500; }
      .tlp-import-err { display: flex; align-items: flex-start; gap: 10px; padding: 14px; }
      .tlp-import-err p { margin: 0; font-size: 13px; line-height: 1.45; }
      .tlp-import-preview { padding: 14px; }
      .tlp-import-preview-head { display: flex; align-items: center; gap: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--border); margin-bottom: 12px; }
      .tlp-import-preview-head strong { display: block; font-size: 14px; font-weight: 700; }
      .tlp-import-preview-head small { display: block; font-size: 12px; color: var(--muted); margin-top: 2px; }
      .tlp-import-list { display: flex; flex-direction: column; gap: 6px; }
      .tlp-import-row { display: grid; grid-template-columns: auto auto 1fr; gap: 10px; align-items: center; padding: 8px 12px; background: var(--panel); border: 1px solid var(--border); border-radius: 8px; }
      .tlp-import-asset { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 13px; }
      .tlp-import-type { font-family: 'JetBrains Mono', monospace; font-size: 10px; padding: 2px 6px; border-radius: 5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
      .tlp-import-type.tlp-buy { background: rgba(16,217,160,0.12); color: var(--win); }
      .tlp-import-type.tlp-sell { background: rgba(239,68,68,0.12); color: var(--loss); }
      .tlp-import-pnl { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 13px; text-align: right; }

      /* ==== MISSED OPPORTUNITY ==== */
      .tlp-missed-summary { padding: 16px; display: flex; flex-direction: column; gap: 14px; }
      .tlp-missed-headline { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
      .tlp-missed-value { font-family: 'JetBrains Mono', monospace; font-size: 30px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.1; margin-top: 4px; }
      .tlp-missed-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; padding: 14px 0; border-top: 1px solid var(--border); }
      .tlp-missed-cell { display: flex; flex-direction: column; gap: 3px; }
      .tlp-missed-cell span { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); font-weight: 600; }
      .tlp-missed-cell strong { font-family: 'JetBrains Mono', monospace; font-size: 17px; font-weight: 700; letter-spacing: -0.01em; }
      .tlp-missed-cell small { font-size: 11px; color: var(--muted); font-weight: 500; }
      .tlp-missed-callout { display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: var(--accent-soft); border: 1px solid var(--accent-border); border-radius: 9px; }
      .tlp-missed-callout svg { color: var(--accent); flex-shrink: 0; }
      .tlp-missed-callout div { font-size: 13px; line-height: 1.4; }
      .tlp-missed-callout strong { font-weight: 700; }
      .tlp-missed-callout span { color: var(--muted); }

      .tlp-missed-list { padding: 14px; }
      .tlp-missed-list-head { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); font-weight: 600; margin-bottom: 10px; font-family: 'JetBrains Mono', monospace; }
      .tlp-missed-row-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-top: 1px solid var(--border); }
      .tlp-missed-row-item:first-of-type { border-top: none; padding-top: 0; }
      .tlp-missed-info { flex: 1; min-width: 0; }
      .tlp-missed-info-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
      .tlp-missed-asset { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 13px; }
      .tlp-missed-pnl { font-family: 'JetBrains Mono', monospace; font-weight: 700; font-size: 13px; }
      .tlp-missed-info-bot { display: flex; gap: 6px; align-items: center; margin-top: 2px; font-size: 11px; color: var(--muted); }

      /* ==== MULTI-SCREENSHOT ==== */
      .tlp-shot-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 8px; }
      .tlp-shot-thumb { position: relative; border-radius: 10px; overflow: hidden; border: 1px solid var(--border); aspect-ratio: 4/3; }
      .tlp-shot-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .tlp-shot-num { position: absolute; bottom: 6px; left: 6px; padding: 2px 7px; background: rgba(0,0,0,0.7); color: white; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; border-radius: 4px; backdrop-filter: blur(4px); }
      .tlp-detail-shots { display: flex; flex-direction: column; gap: 10px; }
    `}</style>
  );
}
