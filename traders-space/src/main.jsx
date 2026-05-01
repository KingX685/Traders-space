import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import Landing from './landing.jsx';
import { AuthProvider } from './lib/auth.jsx';
import { StoreProvider } from './lib/store-context.jsx';

const App = lazy(() => import('./App.jsx'));

// localStorage shim used by the local adapter and by migration-flag tracking.
if (!window.storage) {
  window.storage = {
    get: async (key) => {
      try {
        const v = localStorage.getItem(key);
        return v !== null ? { key, value: v, shared: false } : null;
      } catch { return null; }
    },
    set: async (key, value) => {
      try { localStorage.setItem(key, value); return { key, value, shared: false }; }
      catch (e) { console.warn('storage.set:', e); return null; }
    },
    delete: async (key) => {
      try { localStorage.removeItem(key); return { key, deleted: true, shared: false }; }
      catch { return null; }
    },
    list: async (prefix) => {
      try {
        const keys = Object.keys(localStorage).filter(k => !prefix || k.startsWith(prefix));
        return { keys, prefix, shared: false };
      } catch { return { keys: [], prefix, shared: false }; }
    },
  };
}

function AppSplash() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      background: '#05120e',
    }}>
      <div style={{
        width: 32, height: 32,
        border: '2px solid rgba(255,255,255,0.1)',
        borderTopColor: '#10d9a0',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Root() {
  const path = window.location.pathname;
  const isApp = path === '/app' || path.startsWith('/app/');
  if (!isApp) return <Landing />;
  return (
    <Suspense fallback={<AppSplash />}>
      <StoreProvider>
        <App />
      </StoreProvider>
    </Suspense>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </React.StrictMode>
);
