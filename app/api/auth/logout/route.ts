import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { supabaseConfig } from '../../../../lib/supabase/config';
import { sameOrigin } from '../../../../lib/access';

export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response('Origen no válido.', { status: 403 });
  if (supabaseConfig()) {
    const { error } = await (await createSupabaseServerClient()).auth.signOut();
    if (error) return new Response('No se pudo cerrar la sesión. Intenta nuevamente.', { status: 503 });
  }
  return Response.json({ ok: true }, { headers: { 'Cache-Control': 'private, no-store' } });
}
