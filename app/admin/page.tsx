import { access, identity } from '../../lib/access';
import { supabaseConfig } from '../../lib/supabase/config';
import Dashboard from './dashboard';
import Login from './login';
import Logout from './logout';
export const dynamic='force-dynamic';
export default async function Admin(){
  const signed=await identity();
  const user=signed?await access():null;
  return <main className="admin-shell"><a href="/" className="back">← Volver al sitio</a><img className="logo" src="/logo-inmigrar.png" alt="Cooperativa Inmigrar"/><p className="eyebrow">ESPACIO DE INTEGRANTES</p><h1>Tu emprendimiento,<br/><em>con tu propia voz.</em></h1>
    {user?<Dashboard/>:signed?<div className="panel"><h2>Tu acceso está pendiente</h2><p>Tu sesión está iniciada con {signed.email}. Pide a la administradora que habilite tu cuenta como integrante.</p><Logout/></div>:<Login configured={Boolean(supabaseConfig())}/>}
  </main>;
}
