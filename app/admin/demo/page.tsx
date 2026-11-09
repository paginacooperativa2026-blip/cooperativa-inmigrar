import Dashboard from '../dashboard';

export default function AdminDemo(){return <main className="admin-shell">
  <a className="back" href="/">← Volver al sitio</a>
  <img className="logo" src="/logo-inmigrar.png" alt="Cooperativa Inmigrar"/>
  <p className="eyebrow">COOPERATIVA INMIGRAR · VISTA PREVIA</p>
  <h1 style={{fontSize:'clamp(32px,5vw,46px)'}}>Panel de administración</h1>
  <div className="setup-notice"><strong>Demostración con datos ficticios.</strong> Puedes explorar las fichas y el formulario de edición. Guardar, subir imágenes, eliminar y gestionar accesos estarán disponibles al conectar Supabase e iniciar sesión.</div>
  <Dashboard demo/>
</main>}
