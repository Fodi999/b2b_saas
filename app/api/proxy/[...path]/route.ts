/**
 * API Proxy Route — forwards all /api/proxy/* requests to the backend.
 *
 * This solves CORS issues when the dev server runs on a port other than
 * what the backend has whitelisted (e.g. :3001 vs :3000).
 *
 * Browser → POST /api/proxy/auth/login → Next.js server → backend /api/auth/login
 *
 * Key behaviours:
 *  - Forwards method, Authorization, Content-Type, x-request-id
 *  - Strips Accept-Encoding so the backend returns uncompressed data
 *    (Node fetch auto-decompresses; re-sending Content-Encoding to the browser
 *     causes ERR_CONTENT_DECODING_FAILED because the body is already decoded)
 *  - Strips Content-Encoding from the response for the same reason
 *  - Strips all other hop-by-hop headers
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://ministerial-yetta-fodi999-c58d8823.koyeb.app';

// Headers that must not be forwarded to the backend request
const STRIP_REQUEST_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'host',
  // Prevent the backend from sending compressed responses.
  // Node's fetch auto-decompresses, so if we forward Content-Encoding
  // to the browser the decoded body appears "corrupted".
  'accept-encoding',
]);

// Headers that must not be forwarded back to the browser
const STRIP_RESPONSE_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  // Body is already decompressed by Node fetch — remove encoding hint
  'content-encoding',
]);

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const { path } = await params;
  const backendPath = `/api/${path.join('/')}`;

  // Preserve query string
  const search = req.nextUrl.search;
  const targetUrl = `${BACKEND_URL}${backendPath}${search}`;

  // Build forwarded headers — skip problematic headers
  const forwardedHeaders: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (!STRIP_REQUEST_HEADERS.has(key.toLowerCase())) {
      forwardedHeaders[key] = value;
    }
  });

  // Read body for mutating methods
  let body: ArrayBuffer | undefined;
  if (!['GET', 'HEAD'].includes(req.method)) {
    body = await req.arrayBuffer();
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(targetUrl, {
      method: req.method,
      headers: forwardedHeaders,
      body: body && body.byteLength > 0 ? body : undefined,
      cache: 'no-store',
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Proxy error';
    console.error(`[proxy] ${req.method} ${targetUrl} → fetch error: ${msg}`);
    return NextResponse.json(
      { error: 'Backend unreachable', detail: msg, target: targetUrl },
      { status: 502 }
    );
  }

  // Forward response headers — strip encoding/hop-by-hop
  const resHeaders = new Headers();
  backendRes.headers.forEach((value, key) => {
    if (!STRIP_RESPONSE_HEADERS.has(key.toLowerCase())) {
      resHeaders.set(key, value);
    }
  });

  const resBody = await backendRes.arrayBuffer();

  return new NextResponse(resBody, {
    status: backendRes.status,
    headers: resHeaders,
  });
}

export const GET     = handler;
export const POST    = handler;
export const PUT     = handler;
export const PATCH   = handler;
export const DELETE  = handler;
export const HEAD    = handler;
export const OPTIONS = handler;
