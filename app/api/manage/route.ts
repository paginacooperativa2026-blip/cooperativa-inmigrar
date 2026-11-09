import { access, sameOrigin } from '../../../lib/access';
import { validateEntry, validEmail } from '../../../lib/validation';

export const dynamic = 'force-dynamic';
const noStore = { 'Cache-Control': 'private, no-store' };

export async function GET() {
  const user = await access();
  if (!user) return new Response('Acceso no autorizado.', { status: 403 });
  let query = user.supabase.from('entries').select('*').order('updated', { ascending: false });
  if (user.role !== 'admin') query = query.eq('owner_id', user.userId);
  const result = await query;
  const memberResult = await user.supabase.from('members').select('user_id,email,role,enabled').order('email');
  if (result.error || memberResult.error) return new Response('No se pudo cargar el panel.', { status: 503 });
  const members = memberResult.data || [];
  return Response.json({
    user: { userId: user.userId, email: user.email, role: user.role },
    entries: (result.data || []).map(entry => ({ ...entry, ownerEmail: members.find(member => member.user_id === entry.owner_id)?.email || user.email })),
    members: user.role === 'admin' ? members : [],
  }, { headers: noStore });
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response('Origen no válido.', { status: 403 });
  const user = await access();
  if (!user) return new Response('Acceso no autorizado.', { status: 403 });
  let data;
  try { data = await req.json(); } catch { return new Response('Datos no válidos.', { status: 400 }); }
  if (!data || typeof data !== 'object') return new Response('Datos no válidos.', { status: 400 });
  const supabase = user.supabase;
  if (['member', 'remove-member'].includes(data.action)) {
    if (user.role !== 'admin') return new Response('Acceso no autorizado.', { status: 403 });
    if (!validEmail(data.email)) return new Response('Correo no válido.', { status: 400 });
    const { error } = await supabase.rpc(data.action === 'member' ? 'grant_member' : 'revoke_member', { target_email: data.email.trim().toLowerCase() });
    if (error) return new Response(data.action === 'member' ? 'No se pudo habilitar el acceso. Crea primero la cuenta en Supabase Authentication y verifica que no sea una administradora.' : 'No se pudo revocar el acceso. Las administradoras se gestionan desde Supabase.', { status: 400 });
    return Response.json({ ok: true }, { headers: noStore });
  }
  let old = null;
  if (data.id) {
    if (typeof data.id !== 'string' || !/^[a-f0-9-]{36}$/.test(data.id)) return new Response('Identificador no válido.', { status: 400 });
    const result = await supabase.from('entries').select('*').eq('id', data.id).maybeSingle();
    if (result.error) return new Response('No se pudo consultar la ficha.', { status: 503 });
    old = result.data;
    if (!old) return new Response('Ficha no encontrada.', { status: 404 });
    if (user.role !== 'admin' && old.owner_id !== user.userId) return new Response('Acceso no autorizado.', { status: 403 });
  }
  if (data.action === 'delete') {
    if (!old) return new Response('Ficha no encontrada.', { status: 404 });
    const { error } = await supabase.from('entries').delete().eq('id', old.id);
    return error ? new Response('No se pudo eliminar la ficha.', { status: 503 }) : Response.json({ ok: true }, { headers: noStore });
  }
  let record;
  try { record = validateEntry(data.entry || {}); } catch (e) { return new Response(e instanceof Error ? e.message : 'Datos no válidos.', { status: 400 }); }
  let ownerId = user.userId;
  if (user.role === 'admin') {
    const email = String(data.entry.ownerEmail || user.email).trim().toLowerCase();
    const { data: member, error } = await supabase.from('members').select('user_id').eq('email', email).eq('enabled', true).maybeSingle();
    if (error || !member) return new Response('Habilita primero el correo de la integrante responsable.', { status: 400 });
    ownerId = member.user_id;
  }
  if (record.image && record.image !== old?.image && user.role !== 'admin' && !record.image.startsWith(user.userId + '/')) return new Response('Imagen no autorizada.', { status: 403 });
  const result = old
    ? await supabase.from('entries').update({ ...record, owner_id: ownerId }).eq('id', old.id)
    : await supabase.from('entries').insert({ ...record, owner_id: ownerId });
  if (result.error) return new Response('No se pudo guardar la ficha. Verifica sus datos y permisos.', { status: 400 });
  return Response.json({ ok: true }, { headers: noStore });
}
