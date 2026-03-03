import { useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { getAvatarUploadUrl, updateAvatar } from '@/lib/api/auth';

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
      // 1. Получаем URL для загрузки (signed URL для R2)
      const { upload_url, public_url } = await getAvatarUploadUrl(accessToken, file.type);
      // 2. Загружаем файл напрямую в хранилище (PUT запрос)
      const uploadResponse = await fetch(upload_url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'image/jpeg',
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();        throw new Error(`Failed to upload to storage: ${uploadResponse.statusText}`);
      }
      // 3. Сохраняем public_url в профиль пользователя через наш API
      const response = await updateAvatar(public_url, accessToken);
      
      // 4. Обновляем локальный стейт
      updateUser({ avatar_url: response.user.avatar_url });
      
      return response.user.avatar_url;
    } catch (err: unknown) {
      const error = err as Error;      
      // Специальная обработка для ошибок сети/CORS
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        setError('CORS Error: Please check R2 Bucket CORS settings to allow uploads from your domain.');
      } else {
        setError(error.message || 'Error uploading avatar');
      }
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadAvatar, isUploading, error };
}
