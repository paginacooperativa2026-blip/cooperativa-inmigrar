export function validateEntry(value: Record<string, unknown>) {
  for (const key of ['name', 'person', 'category', 'description']) {
    if (typeof value[key] !== 'string' || !(value[key] as string).trim() || (value[key] as string).length > (key === 'description' ? 10000 : 150)) throw new Error('Completa nombre, emprendedora, rubro y descripción dentro de la longitud permitida.');
  }
  const whatsapp = String(value.whatsapp || '').replace(/[\s+()-]/g, '');
  if (whatsapp && !/^\d{8,15}$/.test(whatsapp)) throw new Error('WhatsApp debe incluir el código de país y entre 8 y 15 dígitos.');
  const image = String(value.image || '');
  if (image && !/^[a-f0-9-]{36}\/[a-f0-9-]{36}\.(png|jpg|webp)$/.test(image)) throw new Error('Imagen no válida. Sube una fotografía desde el panel.');
  return {
    name: (value.name as string).trim(), person: (value.person as string).trim(),
    category: (value.category as string).trim(), description: (value.description as string).trim(),
    image: image || null, price: String(value.price || '').slice(0, 150), whatsapp: whatsapp || null,
    status: value.status === 'published' ? 'published' : 'draft', updated: new Date().toISOString(),
  };
}

export function validEmail(value: unknown) {
  return typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function detectImage(bytes: Uint8Array) {
  if (bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71) return { ext: 'png', type: 'image/png' };
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return { ext: 'jpg', type: 'image/jpeg' };
  if (String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') return { ext: 'webp', type: 'image/webp' };
  return null;
}
