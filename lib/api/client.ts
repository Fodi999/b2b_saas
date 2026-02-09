const API_URL = 'https://ministerial-yetta-fodi999-c58d8823.koyeb.app';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  const url = `${API_URL}${path}`;
  console.log('🌐 [BACKEND REQUEST]', {
    method: options.method || 'GET',
    url,
    hasAuth: !!accessToken,
  });

  const res = await fetch(url, {
    ...options,
    headers,
  });

  console.log('📦 [BACKEND RESPONSE]', {
    url,
    status: res.status,
    ok: res.ok,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    console.error('❌ [BACKEND ERROR]', {
      url,
      status: res.status,
      error,
    });
    throw new ApiError(
      error.details || error.message || 'API request failed',
      res.status,
      error
    );
  }

  const data = await res.json();
  console.log('✅ [BACKEND SUCCESS]', {
    url,
    dataKeys: Object.keys(data),
  });

  return data;
}
