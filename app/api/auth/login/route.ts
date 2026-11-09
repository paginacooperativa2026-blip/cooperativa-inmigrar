import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { supabaseConfig } from '../../../../lib/supabase/config';
import { sameOrigin } from '../../../../lib/access';

export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response('Origen no válido.', { status: 403 });
  if (!supabaseConfig()) return new Response('El acceso estará disponible al conectar Supabase.', { status: 503 });
  let values;
  try { values = await req.json(); } catch { return new Response('Datos no válidos.', { status: 400 }); }
  if (!values || typeof values !== 'object' || typeof values.email !== 'string' || typeof values.password !== 'string' || values.email.length > 254 || values.password.length > 1024) return new Response('Correo o contraseña no válidos.', { status: 400 });
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email: values.email.trim(), password: values.password });
  if (error) return new Response(error.status === 429 ? 'Demasiados intentos. Intenta más tarde.' : 'No pudimos ingresar. Revisa tu correo y contraseña.', { status: error.status === 429 ? 429 : 401 });
  return Response.json({ ok: true }, { headers: { 'Cache-Control': 'private, no-store' } });
}
