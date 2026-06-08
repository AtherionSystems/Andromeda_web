import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { handleCallback } from './ociAuth';

async function bootstrap() {
  const path = window.location.pathname;

  // ── Handle OAuth2 callback ──────────────────────────────────────────────────
  if (path === '/callback' || path === '/Andromeda_web/callback') {
    try {
      await handleCallback();
      // Clean the URL and navigate to home
      window.history.replaceState({}, '', '/');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('OAuth2 callback failed:', msg);
      // Redirect to /login (not /) so React Router doesn't swallow the params.
      // The LoginForm reads auth_error + desc and displays them.
      window.location.href =
        `/login?auth_error=1&desc=${encodeURIComponent(msg)}`;
      return;
    }
  }

  // ── Render app ─────────────────────────────────────────────────────────────
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

bootstrap().catch(console.error);
