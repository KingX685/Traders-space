import React, { createContext, useContext } from 'react';
import { useStore } from './use-store.js';

// ============================================================
// StoreContext — provides the adapter to any component
// ------------------------------------------------------------
// Pattern: <StoreProvider><App /></StoreProvider>. Inside App,
// any component can call useStoreCtx() to get { adapter, status,
// isCloud }. Saves passing adapter through 10 levels of props.
// ============================================================
const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const store = useStore();
  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStoreCtx() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStoreCtx must be used inside StoreProvider');
  return ctx;
}
