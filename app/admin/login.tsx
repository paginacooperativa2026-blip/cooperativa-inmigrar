'use client';
import { useState } from 'react';
export default function Login({ configured }: { configured: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return <form className="panel login-panel" onSubmit={async event => {
    event.preventDefault(); setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.get('email'), password: form.get('password') }) });
      if (!response.ok) throw new Error(await response.text());
      window.location.assign('/admin');
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo iniciar sesión.'); setBusy(false); }
  }}><h2>Bienvenida a tu espacio</h2><p>Ingresa con tu correo y clave para administrar tu emprendimiento.</p>
    {!configured && <p className="setup-notice" role="status"><strong>Acceso pendiente de configuración.</strong><br/>El panel estará disponible cuando conectemos el proyecto de Supabase.</p>}
    <label>Correo electrónico<input name="email" type="email" autoComplete="username" required placeholder="tu@correo.cl" disabled={!configured || busy}/></label>
    <label>Clave<input name="password" type="password" autoComplete="current-password" required disabled={!configured || busy}/></label>
    <p role="alert" className="status">{error}</p><button className="button" disabled={!configured || busy}>{busy ? 'Ingresando…' : 'Iniciar sesión'}</button>
    {!configured && <p><a className="text-link" href="/admin/demo">Explorar el panel de demostración →</a></p>}
    <p className="hint">Las cuentas son habilitadas por la administradora. Si necesitas acceso o recuperar tu contraseña, contacta a la cooperativa.</p>
  </form>;
}
