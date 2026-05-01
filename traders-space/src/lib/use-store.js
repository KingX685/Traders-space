import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './auth.jsx';
import { getStorageAdapter, migrateLocalToCloud } from './storage.js';

// ============================================================
// useStore — central data hook
// ------------------------------------------------------------
// Returns the right storage adapter based on auth state, and
// tracks a coarse sync status for the UI indicator.
//
// Status values:
//   'local'  — anonymous mode, localStorage backend
//   'synced' — signed in, last write succeeded
//   'syncing' — write in flight
//   'error'  — last write failed (typically network)
// ============================================================
export function useStore() {
  const auth = useAuth();
  const [status, setStatus] = useState('local');
  const [lastError, setLastError] = useState(null);
  // Used to invalidate the adapter ref when user changes
  const userId = auth.user?.id || null;

  // Build the adapter once per user change. The original adapter
  // doesn't track status, so we wrap each write to update it.
  const adapter = useMemo(() => {
    const base = getStorageAdapter(auth.user);
    if (base.mode === 'local') return base;

    // Wrap each write method so the UI can show a sync indicator.
    const wrap = (fn) => async (...args) => {
      setStatus('syncing');
      try {
        const result = await fn(...args);
        setStatus('synced');
        setLastError(null);
        return result;
      } catch (err) {
        console.warn('[useStore] write failed:', err);
        setStatus('error');
        setLastError(err.message || 'Save failed');
        // Re-throw so callers can decide how to handle it
        throw err;
      }
    };

    return {
      ...base,
      saveProfile: wrap(base.saveProfile.bind(base)),
      saveTrade: wrap(base.saveTrade.bind(base)),
      deleteTrade: wrap(base.deleteTrade.bind(base)),
      bulkInsertTrades: wrap(base.bulkInsertTrades.bind(base)),
      saveConfluences: wrap(base.saveConfluences.bind(base)),
      saveJournalEntry: wrap(base.saveJournalEntry.bind(base)),
      deleteJournalEntry: wrap(base.deleteJournalEntry.bind(base)),
      saveScreenshots: wrap(base.saveScreenshots.bind(base)),
      wipeAll: wrap(base.wipeAll.bind(base)),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Initial status when auth state settles
  useEffect(() => {
    setStatus(adapter.mode === 'local' ? 'local' : 'synced');
    setLastError(null);
  }, [adapter.mode]);

  return { adapter, status, lastError, isCloud: adapter.mode === 'cloud' };
}
