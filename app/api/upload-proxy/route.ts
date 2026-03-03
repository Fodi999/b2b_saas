/**
 * Upload Proxy — forwards file PUT requests to external presigned URLs
 * (Cloudflare R2, S3, etc.) server-side to bypass browser CORS restrictions.
 *
 * Flow:
 *   Browser → POST /api/upload-proxy (multipart FormData)
 *             { upload_url, content_type, file }
 *           → Server PUT <upload_url> with raw file bytes
 *           → Returns { ok: true } or error JSON
 *
 * This avoids the "No 'Access-Control-Allow-Origin' header" error that occurs
 * when the browser tries to PUT directly to r2.cloudflarestorage.com.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest): Promise<NextResponse> {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid FormData' }, { status: 400 });
  }

  const uploadUrl = form.get('upload_url');
  const contentType = (form.get('content_type') as string | null) || 'application/octet-stream';
  const file = form.get('file');

  if (!uploadUrl || typeof uploadUrl !== 'string') {
    return NextResponse.json({ error: 'Missing upload_url' }, { status: 400 });
  }

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  }

  // Validate the target URL is a known storage host (security guard)
  let targetHost: string;
  try {
    targetHost = new URL(uploadUrl).hostname;
  } catch {
    return NextResponse.json({ error: 'Invalid upload_url' }, { status: 400 });
  }

  const ALLOWED_HOSTS = [
    'r2.cloudflarestorage.com',
    's3.amazonaws.com',
    'storage.googleapis.com',
  ];
  const isAllowed = ALLOWED_HOSTS.some(h => targetHost.endsWith(h));
  if (!isAllowed) {
    return NextResponse.json(
      { error: `Upload target not allowed: ${targetHost}` },
      { status: 403 }
    );
  }

  // Perform the PUT server-side (no CORS restriction on server)
  let res: Response;
  try {
    const bytes = await file.arrayBuffer();
    res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: bytes,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Network error';
    console.error(`[upload-proxy] PUT ${uploadUrl} failed: ${msg}`);
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error(`[upload-proxy] PUT ${uploadUrl} → ${res.status}: ${body}`);
    return NextResponse.json(
      { error: `Storage returned ${res.status}`, detail: body },
      { status: res.status }
    );
  }

  return NextResponse.json({ ok: true });
}
