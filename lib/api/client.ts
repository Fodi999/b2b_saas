const API_URL = 'https://ministerial-yetta-fodi999-c58d8823.koyeb.app';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string
): Promise<T | null> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // 🧪 ТЕСТ: Проверяем localStorage как fallback
  const token = accessToken || localStorage.getItem('access_token');
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  const url = `${API_URL}${path}`;
  console.log('[BACKEND REQUEST]', {
    method: options.method || 'GET',
    url,
    hasAuth: !!accessToken,
    fullUrl: url, // Добавляем полный URL для проверки
  });

  const res = await fetch(url, {
    ...options,
    headers,
    // ⏳ credentials: 'include' - включить ПОСЛЕ настройки CORS на backend
  });

  console.log('[BACKEND RESPONSE]', {
    url,
    status: res.status,
    ok: res.ok,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    
    // Не логируем 401 как ошибку в консоль, так как это может быть ожидаемым случаем 
    // для истекшего токена, который будет обработан логикой refresh
    if (res.status === 401) {
      console.warn('[BACKEND AUTH 401]', { url, status: res.status });
    } else {
      console.error('[BACKEND ERROR]', JSON.stringify({
        url,
        status: res.status,
        error,
      }, null, 2));
    }

    throw new ApiError(
      error.details || error.message || 'API request failed',
      res.status,
      error
    );
  }

  // Если ответ 204 No Content - возвращаем null (DELETE обычно возвращает пустое тело)
  if (res.status === 204) {
    console.log('✅ [BACKEND SUCCESS - NO CONTENT]', { url, status: 204 });
    return null;
  }

  const data = await res.json();
  console.log('✅ [BACKEND SUCCESS]', {
    url,
    dataKeys: Object.keys(data),
    fullData: data, // Добавляем полные данные
  });

  return data;
}
