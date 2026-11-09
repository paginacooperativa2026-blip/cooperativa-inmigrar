import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../../../lib/supabase/config';
import { demoCatalog } from '../../../lib/demo-catalog';

export const dynamic = 'force-dynamic';
export async function GET() {
  const demo = process.env.DEMO_CATALOG !== 'false';
  const config = supabaseConfig();
  if (!config) return demo
    ? Response.json(demoCatalog, { headers: { 'Cache-Control': 'no-store' } })
    : Response.json({ error: 'Catálogo pendiente de configuración.' }, { status: 503 });
  const supabase = createClient(config.url, config.key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await supabase.from('catalog').select('*').order('updated', { ascending: false });
  if (error) {
    console.error('Catalog query failed:', error.code);
    return Response.json({ error: 'No se pudo cargar el catálogo.' }, { status: 503 });
  }
  return Response.json([...(data || []), ...(demo ? demoCatalog : [])], { headers: { 'Cache-Control': 'no-store' } });
}
