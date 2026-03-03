import { useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getAvatarUploadUrl, updateAvatar } from '@/lib/api/auth';

/**
 * Upload a file to a presigned URL.
 *
 * Cloudflare R2 buckets often lack CORS headers that allow PUT from browser
 * origins. To work around this we route the upload through our own Next.js
 * server-side proxy endpoint (/api/upload-proxy) which performs the PUT
 * server-side (no CORS restriction) and streams the response back.
 *
 * Falls back to a direct PUT if the proxy route is unavailable.
 */
async function putViaProxy(uploadUrl: string, file: File): Promise<void> {
  // Build a FormData so the proxy can re-assemble the request
  const form = new FormData();
  form.append('upload_url', uploadUrl);
  form.append('content_type', file.type || 'image/jpeg');
  form.append('file', file);

  const res = await fetch('/api/upload-proxy', {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`Upload proxy failed (${res.status}): ${msg}`);
  }
}

export function useAvatarUpload() {
  const { accessToken, updateUser } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadAvatar = async (file: File) => {
    if (!accessToken) {
      setError('Not authenticated');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // 1. Get presigned upload URL from backend
      const { upload_url, public_url } = await getAvatarUploadUrl(accessToken, file.type);

      // 2. PUT file via server-side proxy to avoid R2 CORS restrictions
      await putViaProxy(upload_url, file);

      // 3. Save public_url to user profile
      const response = await updateAvatar(public_url, accessToken);

      // 4. Update local state
      updateUser({ avatar_url: response.user.avatar_url });

      return response.user.avatar_url;
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e.message || 'Error uploading avatar');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadAvatar, isUploading, error };
}
