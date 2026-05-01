import { supabase, isSupabaseConfigured } from './supabase.js';

// ============================================================
// STORAGE ADAPTER
// ------------------------------------------------------------
// The same five methods (loadProfile, saveProfile, listTrades,
// saveTrade, deleteTrade, ...) work whether the user is signed
// in (Supabase backend) or anonymous (localStorage backend).
//
// This is the file to read if you need to understand how data
// flows through the app.
// ============================================================

// ---- LocalStorage keys (kept identical to original artifact) ----
const LS = {
  profile: 'tlp:profile',
  trades: 'tlp:trades',
  confluences: 'tlp:confluences',
  journal: 'tlp:journal',
  screenshot: (id) => `tlp:shot:${id}`,
  migrationDone: 'tlp:migration_done',
};

// ---- Local helpers ----
async function lsGet(key, fallback = null) {
  try {
    const r = await window.storage.get(key);
    return r ? JSON.parse(r.value) : fallback;
  } catch {
    return fallback;
  }
}
async function lsSet(key, value) {
  try {
    await window.storage.set(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn('lsSet failed:', e);
    return false;
  }
}
async function lsDel(key) {
  try { await window.storage.delete(key); } catch {}
}

// ============================================================
// SHAPE CONVERTERS
// ------------------------------------------------------------
// The DB uses snake_case columns. The app uses camelCase. These
// keep the rest of the app code free of DB-specific naming.
// ============================================================
function tradeFromRow(r) {
  return {
    id: r.id,
    asset: r.asset,
    type: r.type,
    lotSize: r.lot_size,
    entryPrice: r.entry_price,
    exitPrice: r.exit_price,
    pnl: Number(r.pnl) || 0,
    entryAt: r.entry_at,
    exitAt: r.exit_at,
    durationMinutes: r.duration_minutes,
    setupType: r.setup_type || '',
    notes: r.notes || '',
    emotion: r.emotion || '',
    discipline: r.discipline,
    confluenceIds: r.confluence_ids || [],
    missed: r.missed,
    missedReason: r.missed_reason,
    estimatedPnl: r.estimated_pnl,
    ticket: r.ticket,
    imported: r.imported,
    hasScreenshot: (r.screenshot_paths || []).length > 0,
    screenshotPaths: r.screenshot_paths || [],
  };
}
function tradeToRow(t, userId) {
  return {
    id: t.id,
    user_id: userId,
    asset: t.asset,
    type: t.type,
    lot_size: t.lotSize ?? null,
    entry_price: t.entryPrice ?? null,
    exit_price: t.exitPrice ?? null,
    pnl: t.pnl || 0,
    entry_at: t.entryAt,
    exit_at: t.exitAt,
    duration_minutes: t.durationMinutes || 0,
    setup_type: t.setupType || null,
    notes: t.notes || null,
    emotion: t.emotion || null,
    discipline: t.discipline ?? null,
    confluence_ids: t.confluenceIds || [],
    missed: t.missed || false,
    missed_reason: t.missedReason || null,
    estimated_pnl: t.estimatedPnl ?? null,
    ticket: t.ticket || null,
    imported: t.imported || false,
    screenshot_paths: t.screenshotPaths || [],
  };
}

function profileFromRow(r) {
  return {
    name: r.name,
    welcomeMessage: r.welcome_message,
    startingBalance: Number(r.starting_balance),
    theme: r.theme,
    confluenceCheckEnabled: r.confluence_check_enabled,
    confluenceCheckSeconds: r.confluence_check_seconds,
    onboarded: true,
    plan: r.plan || 'free',
    email: r.email,
    createdAt: r.created_at,
  };
}
function profileToRow(p) {
  return {
    name: p.name || 'Trader',
    welcome_message: p.welcomeMessage || p.name || 'Trader',
    starting_balance: p.startingBalance || 10000,
    theme: p.theme || 'green',
    confluence_check_enabled: p.confluenceCheckEnabled !== false,
    confluence_check_seconds: p.confluenceCheckSeconds || 20,
  };
}

function confluenceFromRow(r) {
  return { id: r.id, name: r.name, note: r.note || '', active: r.active };
}
function confluenceToRow(c, userId) {
  return { id: c.id, user_id: userId, name: c.name, note: c.note || null, active: c.active !== false };
}

function journalFromRow(r) {
  return {
    id: r.id,
    title: r.title,
    blocks: r.blocks || [],
    tags: r.tags || {},
    linkedTradeId: r.linked_trade_id,
    pinned: r.pinned,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
function journalToRow(e, userId) {
  return {
    id: e.id,
    user_id: userId,
    title: e.title || '',
    blocks: e.blocks || [],
    tags: e.tags || {},
    linked_trade_id: e.linkedTradeId || null,
    pinned: e.pinned || false,
  };
}

// ============================================================
// LOCAL ADAPTER
// ============================================================
const localAdapter = {
  mode: 'local',

  async loadProfile() {
    return lsGet(LS.profile);
  },
  async saveProfile(profile) {
    return lsSet(LS.profile, profile);
  },

  async listTrades() {
    return (await lsGet(LS.trades, [])) || [];
  },
  async saveTrade(trade) {
    const all = await this.listTrades();
    const idx = all.findIndex(t => t.id === trade.id);
    if (idx >= 0) all[idx] = trade;
    else all.push(trade);
    await lsSet(LS.trades, all);
    return trade;
  },
  async deleteTrade(id) {
    const all = await this.listTrades();
    await lsSet(LS.trades, all.filter(t => t.id !== id));
    await lsDel(LS.screenshot(id));
  },
  async bulkInsertTrades(trades) {
    const all = await this.listTrades();
    const existingIds = new Set(all.map(t => t.id));
    const fresh = trades.filter(t => !existingIds.has(t.id));
    await lsSet(LS.trades, [...all, ...fresh]);
    return fresh.length;
  },

  async listConfluences() {
    return (await lsGet(LS.confluences, [])) || [];
  },
  async saveConfluences(list) {
    return lsSet(LS.confluences, list);
  },

  async listJournal() {
    return (await lsGet(LS.journal, [])) || [];
  },
  async saveJournalEntry(entry) {
    const all = await this.listJournal();
    const idx = all.findIndex(e => e.id === entry.id);
    if (idx >= 0) all[idx] = entry;
    else all.unshift(entry);
    await lsSet(LS.journal, all);
    return entry;
  },
  async deleteJournalEntry(id) {
    const all = await this.listJournal();
    await lsSet(LS.journal, all.filter(e => e.id !== id));
  },

  async loadScreenshots(tradeId) {
    return lsGet(LS.screenshot(tradeId)) || [];
  },
  async saveScreenshots(tradeId, dataUris) {
    if (!dataUris || dataUris.length === 0) {
      await lsDel(LS.screenshot(tradeId));
      return [];
    }
    await lsSet(LS.screenshot(tradeId), dataUris);
    return dataUris.map((_, i) => `local:${tradeId}:${i}`); // placeholder paths
  },

  async wipeAll() {
    const trades = await this.listTrades();
    for (const t of trades) await lsDel(LS.screenshot(t.id));
    await lsDel(LS.trades);
    await lsDel(LS.confluences);
    await lsDel(LS.journal);
    await lsDel(LS.profile);
    await lsDel(LS.migrationDone);
  },
};

// ============================================================
// SUPABASE ADAPTER
// ============================================================
function makeSupabaseAdapter(userId) {
  return {
    mode: 'cloud',
    userId,

    async loadProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) {
        console.warn('loadProfile error:', error);
        return null;
      }
      return profileFromRow(data);
    },
    async saveProfile(profile) {
      const row = profileToRow(profile);
      const { error } = await supabase
        .from('profiles')
        .update(row)
        .eq('id', userId);
      if (error) console.warn('saveProfile error:', error);
      return !error;
    },

    async listTrades() {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', userId)
        .order('entry_at', { ascending: false });
      if (error) { console.warn('listTrades error:', error); return []; }
      return data.map(tradeFromRow);
    },
    async saveTrade(trade) {
      const row = tradeToRow(trade, userId);
      const { error } = await supabase
        .from('trades')
        .upsert(row, { onConflict: 'id' });
      if (error) console.warn('saveTrade error:', error);
      return trade;
    },
    async deleteTrade(id) {
      // Best-effort: delete screenshots from storage too
      const { data: t } = await supabase
        .from('trades').select('screenshot_paths').eq('id', id).single();
      if (t?.screenshot_paths?.length) {
        await supabase.storage.from('screenshots').remove(t.screenshot_paths);
      }
      const { error } = await supabase.from('trades').delete().eq('id', id);
      if (error) console.warn('deleteTrade error:', error);
    },
    async bulkInsertTrades(trades) {
      if (!trades.length) return 0;
      const rows = trades.map(t => tradeToRow(t, userId));
      const { data, error } = await supabase
        .from('trades')
        .upsert(rows, { onConflict: 'user_id,ticket', ignoreDuplicates: true });
      if (error) console.warn('bulkInsertTrades error:', error);
      return data?.length || trades.length;
    },

    async listConfluences() {
      const { data, error } = await supabase
        .from('confluences')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      if (error) { console.warn('listConfluences:', error); return []; }
      return data.map(confluenceFromRow);
    },
    async saveConfluences(list) {
      // Diff against current and apply minimal upsert/delete
      const current = await this.listConfluences();
      const currentIds = new Set(current.map(c => c.id));
      const nextIds = new Set(list.map(c => c.id));
      // Delete removed
      const toDelete = [...currentIds].filter(id => !nextIds.has(id));
      if (toDelete.length) {
        await supabase.from('confluences').delete().in('id', toDelete);
      }
      // Upsert all
      if (list.length) {
        const rows = list.map(c => confluenceToRow(c, userId));
        const { error } = await supabase.from('confluences').upsert(rows, { onConflict: 'id' });
        if (error) console.warn('saveConfluences error:', error);
      }
      return true;
    },

    async listJournal() {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('pinned', { ascending: false })
        .order('updated_at', { ascending: false });
      if (error) { console.warn('listJournal:', error); return []; }
      return data.map(journalFromRow);
    },
    async saveJournalEntry(entry) {
      const row = journalToRow(entry, userId);
      const { error } = await supabase
        .from('journal_entries')
        .upsert(row, { onConflict: 'id' });
      if (error) console.warn('saveJournalEntry:', error);
      return entry;
    },
    async deleteJournalEntry(id) {
      const { error } = await supabase.from('journal_entries').delete().eq('id', id);
      if (error) console.warn('deleteJournalEntry:', error);
    },

    async loadScreenshots(tradeId) {
      // Look up the trade's screenshot_paths and create signed URLs
      const { data: trade } = await supabase
        .from('trades').select('screenshot_paths').eq('id', tradeId).single();
      if (!trade?.screenshot_paths?.length) return [];
      const urls = await Promise.all(trade.screenshot_paths.map(async (path) => {
        const { data } = await supabase.storage
          .from('screenshots')
          .createSignedUrl(path, 3600); // 1-hour signed URL
        return data?.signedUrl || null;
      }));
      return urls.filter(Boolean);
    },
    async saveScreenshots(tradeId, dataUris) {
      if (!dataUris || dataUris.length === 0) return [];
      const paths = [];
      for (let i = 0; i < dataUris.length; i++) {
        const blob = await dataUriToBlob(dataUris[i]);
        const path = `${userId}/${tradeId}/${i}.jpg`;
        const { error } = await supabase.storage
          .from('screenshots')
          .upload(path, blob, { upsert: true, contentType: 'image/jpeg' });
        if (!error) paths.push(path);
        else console.warn('Screenshot upload failed:', error);
      }
      // Update the trade's screenshot_paths column
      await supabase.from('trades')
        .update({ screenshot_paths: paths })
        .eq('id', tradeId);
      return paths;
    },

    async wipeAll() {
      // Cascading deletes on auth.users handle most of this if account is deleted.
      // For "wipe but keep account" we delete each table:
      await supabase.from('trades').delete().eq('user_id', userId);
      await supabase.from('journal_entries').delete().eq('user_id', userId);
      await supabase.from('confluences').delete().eq('user_id', userId);
      // Profile stays (but reset to defaults via update if user wants)
    },
  };
}

async function dataUriToBlob(dataUri) {
  const res = await fetch(dataUri);
  return res.blob();
}

// ============================================================
// FACTORY
// ------------------------------------------------------------
// Pass a user (from useAuth) and get back the right adapter.
// ============================================================
export function getStorageAdapter(user) {
  if (user && isSupabaseConfigured) {
    return makeSupabaseAdapter(user.id);
  }
  return localAdapter;
}

// ============================================================
// MIGRATION
// ------------------------------------------------------------
// On first sign-in, copy localStorage data into Supabase.
// Only runs once per device per account.
// ============================================================
export async function migrateLocalToCloud(userId, { onProgress } = {}) {
  if (!isSupabaseConfigured) return { migrated: false };

  const flagKey = `${LS.migrationDone}:${userId}`;
  const alreadyDone = await lsGet(flagKey);
  if (alreadyDone) return { migrated: false, reason: 'already_done' };

  const cloud = makeSupabaseAdapter(userId);
  const counts = { trades: 0, confluences: 0, journal: 0, profile: false };

  // Profile: only migrate if cloud profile is at defaults (just-created)
  onProgress?.({ step: 'profile' });
  const localProfile = await localAdapter.loadProfile();
  const cloudProfile = await cloud.loadProfile();
  if (localProfile?.onboarded && cloudProfile && cloudProfile.name === 'Trader') {
    await cloud.saveProfile(localProfile);
    counts.profile = true;
  }

  // Confluences
  onProgress?.({ step: 'confluences' });
  const localConfluences = await localAdapter.listConfluences();
  if (localConfluences.length) {
    await cloud.saveConfluences(localConfluences);
    counts.confluences = localConfluences.length;
  }

  // Trades
  onProgress?.({ step: 'trades' });
  const localTrades = await localAdapter.listTrades();
  for (const trade of localTrades) {
    await cloud.saveTrade(trade);
    // Migrate screenshots if present
    const shots = await localAdapter.loadScreenshots(trade.id);
    if (shots.length) {
      await cloud.saveScreenshots(trade.id, shots);
    }
    counts.trades++;
    if (counts.trades % 5 === 0) onProgress?.({ step: 'trades', done: counts.trades, total: localTrades.length });
  }

  // Journal
  onProgress?.({ step: 'journal' });
  const localJournal = await localAdapter.listJournal();
  for (const entry of localJournal) {
    await cloud.saveJournalEntry(entry);
    counts.journal++;
  }

  await lsSet(flagKey, true);
  onProgress?.({ step: 'done', counts });
  return { migrated: true, counts };
}

// ============================================================
// WAITLIST (uses anon key, public insert allowed by RLS)
// ============================================================
export async function joinWaitlist(email, source = 'app') {
  if (!isSupabaseConfigured) {
    // Fall back to localStorage so the UI flow still works
    try {
      const list = JSON.parse(localStorage.getItem('tlp:waitlist') || '[]');
      if (!list.includes(email)) list.push(email);
      localStorage.setItem('tlp:waitlist', JSON.stringify(list));
    } catch {}
    return { ok: true, mode: 'local' };
  }
  const { error } = await supabase.from('waitlist').insert({ email, source });
  if (error && !error.message.includes('duplicate')) {
    console.warn('joinWaitlist error:', error);
    return { ok: false, error: error.message };
  }
  return { ok: true, mode: 'cloud' };
}
