import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { supabaseConfig } from '../../../../lib/supabase/config';

export const dynamic = 'force-dynamic';
export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key: parts } = await params;
  const key = parts.join('/');
  if (!supabaseConfig() || !/^[a-f0-9-]{36}\/[a-f0-9-]{36}\.(png|jpg|webp)$/.test(key)) return new Response('No encontrado.', { status: 404 });
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.storage.from('catalog-images').download(key);
  if (error || !data) return new Response('No encontrado.', { status: 404 });
  return new Response(data, { headers: { 'Content-Type': data.type, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'private, no-store' } });
}
