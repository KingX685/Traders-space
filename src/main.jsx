import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import Landing from './landing.jsx';

// Storage shim — backs window.storage with localStorage so the App code
// (which was originally an artifact using window.storage) runs unchanged.
if (!window.storage) {
  window.storage = {
    get: async (key) => {
      try {
        const v = localStorage.getItem(key);
        return v !== null ? { key, value: v, shared: false } : null;
      } catch (e) { return null; }
    },
    set: async (key, value) => {
      try {
        localStorage.setItem(key, value);
        return { key, value, shared: false };
      } catch (e) {
        console.warn('storage.set failed:', e.message);
        return null;
      }
    },
    delete: async (key) => {
      try { localStorage.removeItem(key); return { key, deleted: true, shared: false }; }
      catch (e) { return null; }
    },
    list: async (prefix) => {
      try {
        const keys = Object.keys(localStorage).filter(k => !prefix || k.startsWith(prefix));
        return { keys, prefix, shared: false };
      } catch (e) { return { keys: [], prefix, shared: false }; }
    },
  };
}

// Path-based routing. "/" = landing, anything else = app.
function Root() {
  const path = window.location.pathname;
  const isApp = path === '/app' || path.startsWith('/app/');
  return isApp ? <App /> : <Landing />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
