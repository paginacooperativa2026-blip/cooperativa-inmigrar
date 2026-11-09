import { access, sameOrigin } from '../../../lib/access';
import { detectImage } from '../../../lib/validation';

export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response('Origen no válido.', { status: 403 });
  const user = await access();
  if (!user) return new Response('Acceso no autorizado.', { status: 403 });
  if (Number(req.headers.get('content-length') || 0) > 5 * 1024 * 1024) return new Response('Selecciona una imagen de hasta 4 MB.', { status: 413 });
  let form;
  try { form = await req.formData(); } catch { return new Response('Archivo no válido.', { status: 400 }); }
  const file = form.get('image');
  if (!(file instanceof File) || file.size > 4 * 1024 * 1024) return new Response('Selecciona una imagen de hasta 4 MB.', { status: 400 });
  const bytes = new Uint8Array(await file.arrayBuffer());
  const detected = detectImage(bytes);
  if (!detected) return new Response('Usa una fotografía PNG, JPG o WebP.', { status: 400 });
  const key = `${user.userId}/${crypto.randomUUID()}.${detected.ext}`;
  const { error } = await user.supabase.storage.from('catalog-images').upload(key, bytes, { contentType: detected.type, upsert: false });
  if (error) return new Response('No se pudo subir la imagen. Verifica el almacenamiento y tus permisos.', { status: 503 });
  return Response.json({ key }, { headers: { 'Cache-Control': 'private, no-store' } });
}
