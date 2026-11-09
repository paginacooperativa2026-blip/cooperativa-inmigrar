'use client';

import { useState } from 'react';

export default function HeaderAccount({ signedIn }: { signedIn: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!signedIn) return <a className="header-login" href="/admin" aria-label="Iniciar sesión" title="Iniciar sesión">
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg>
  </a>;

  return <div className="header-account">
    <button type="button" className="header-login" aria-label={busy ? 'Cerrando sesión' : 'Cerrar sesión'} title="Cerrar sesión" disabled={busy} aria-busy={busy} onClick={async () => {
      setBusy(true); setError('');
      try {
        const response = await fetch('/api/auth/logout', { method: 'POST' });
        if (!response.ok) throw new Error(await response.text());
        window.location.assign('/');
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'No se pudo cerrar la sesión. Intenta nuevamente.');
        setBusy(false);
      }
    }}>
      <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4M16 17l5-5-5-5M21 12H9"/></svg>
    </button>
    {error && <p className="header-account-error" role="alert">{error}</p>}
  </div>;
}
