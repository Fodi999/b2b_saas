/**
 * Production API Client — single-flight refresh, timeout, typed errors.
 *
 * Key behaviours:
 * 1. Authorization: Bearer header when accessToken is provided.
 * 2. On 401 → trigger refresh. Multiple concurrent 401s share ONE refresh call.
 * 3. If refresh fails → logout + redirect to login.
 * 4. AbortController timeout (default 20 s, customisable).
 * 5. x-request-id header for tracing.
 * 6. Normalised ApiError (status, message, details).
 */

import { env } from '@/lib/schemas/env';

// ============================================================================
// ApiError
// ============================================================================

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ============================================================================
// Single-flight refresh lock
// ============================================================================

let refreshPromise: Promise<boolean> | null = null;

async function singleFlightRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const { useAuthStore } = await import('@/lib/stores/auth-store');
      const success = await useAuthStore.getState().refreshAccessToken();
      if (!success) {
        useAuthStore.getState().logout();
      }
      return success;
    } catch {
      try {
        const { useAuthStore } = await import('@/lib/stores/auth-store');
        useAuthStore.getState().logout();
      } catch { /* noop */ }
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ============================================================================
// Helpers
// ============================================================================

function generateRequestId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function extractMessage(body: unknown, fallback: string): string {
  if (typeof body === 'string') return body || fallback;
  if (typeof body === 'object' && body !== null) {
    const obj = body as Record<string, unknown>;
    return (
      (typeof obj.message === 'string' ? obj.message : '') ||
      (typeof obj.error === 'string' ? obj.error : '') ||
      (typeof obj.details === 'string' ? obj.details : '') ||
      (typeof obj.detail === 'string' ? obj.detail : '') ||
      fallback
    );
  }
  return fallback;
}

// ============================================================================
// apiFetch
// ============================================================================

interface ApiFetchOptions extends RequestInit {
  /** Timeout in ms. Default 20 000. */
  timeout?: number;
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
  accessToken?: string,
  _isRetry = false
): Promise<T | null> {
  const { timeout = 20_000, ...fetchInit } = options;

  // Headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-request-id': generateRequestId(),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  if (fetchInit.headers) {
    Object.assign(headers, fetchInit.headers);
  }

  // AbortController timeout
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  // In the browser, route through the Next.js proxy to avoid CORS issues.
  // On the server (SSR/RSC), call the backend directly.
  const isBrowser = typeof window !== 'undefined';
  const url = isBrowser
    ? `${window.location.origin}/api/proxy${path.replace(/^\/api/, '')}`
    : `${env.API_URL}${path}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...fetchInit,
      headers,
      signal: controller.signal,
    });
  } catch (err: unknown) {
    clearTimeout(timer);
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }
    throw new ApiError(
      err instanceof Error ? err.message : 'Network error',
      0
    );
  } finally {
    clearTimeout(timer);
  }

  // 204 No Content
  if (res.status === 204) return null;

  // Success
  if (res.ok) {
    try {
      return (await res.json()) as T;
    } catch {
      return null;
    }
  }

  // --- Error path ---

  let body: unknown;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try { body = await res.json(); } catch { body = await res.text().catch(() => ''); }
  } else {
    body = await res.text().catch(() => '');
  }

  const message = extractMessage(body, `API ${res.status}`);

  // 401 → single-flight refresh + retry ONCE
  if (
    res.status === 401 &&
    !_isRetry &&
    !path.includes('/api/auth/login') &&
    !path.includes('/api/auth/register') &&
    !path.includes('/api/auth/refresh')
  ) {
    const refreshed = await singleFlightRefresh();
    if (refreshed) {
      const { useAuthStore } = await import('@/lib/stores/auth-store');
      const newToken = useAuthStore.getState().accessToken;
      if (newToken) {
        return apiFetch<T>(path, options, newToken, true);
      }
    }
  }

  throw new ApiError(message, res.status, body);
}
