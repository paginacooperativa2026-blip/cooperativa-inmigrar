export function sameOrigin(req: Request) {
  const value = req.headers.get('origin');
  if (!value) return false;
  try {
    const origin = new URL(value);
    // Next.js may normalize req.url to localhost behind a reverse proxy.
    // Host is the browser's destination; forwarded protocol comes from Netlify.
    const host = req.headers.get('host') || new URL(req.url).host;
    const protocol = req.headers.get('x-forwarded-proto') || new URL(req.url).protocol.slice(0, -1);
    return origin.host === host && origin.protocol === protocol + ':';
  } catch { return false; }
}
