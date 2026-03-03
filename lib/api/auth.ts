import { apiFetch } from './client';
import {
  AuthResponseSchema,
  RefreshResponseSchema,
  MeResponseSchema,
  type AuthResponseDTO,
  type RefreshResponseDTO,
  type MeResponseDTO,
} from '@/lib/schemas/dto';

// ============================================================================
// Re-export types for consumers
// ============================================================================
export type { AuthResponseDTO, RefreshResponseDTO, MeResponseDTO };

// ============================================================================
// Avatar
// ============================================================================

interface AvatarUploadUrlResponse {
  upload_url: string;
  public_url: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Register a new user.
 */
export async function registerUser(data: {
  email: string;
  password: string;
  display_name: string;
  restaurant_name: string;
  language: 'pl' | 'en' | 'ru' | 'uk';
}): Promise<AuthResponseDTO> {
  const payload = {
    email: data.email,
    password: data.password,
    owner_name: data.display_name,
    restaurant_name: data.restaurant_name,
    language: data.language,
  };

  const raw = await apiFetch<unknown>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return AuthResponseSchema.parse(raw);
}

/**
 * Login an existing user.
 */
export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<AuthResponseDTO> {
  const raw = await apiFetch<unknown>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return AuthResponseSchema.parse(raw);
}

/**
 * Refresh access token.
 */
export async function refreshToken(refresh: string): Promise<RefreshResponseDTO> {
  const raw = await apiFetch<unknown>('/api/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refresh }),
  });

  return RefreshResponseSchema.parse(raw);
}

/**
 * Get current user profile.
 */
export async function fetchMe(accessToken: string): Promise<MeResponseDTO> {
  const raw = await apiFetch<unknown>('/api/me', {}, accessToken);
  return MeResponseSchema.parse(raw);
}

/**
 * Update user language.
 */
export async function updateUserLanguage(
  language: 'pl' | 'en' | 'ru' | 'uk',
  accessToken: string
): Promise<MeResponseDTO> {
  const raw = await apiFetch<unknown>('/api/me', {
    method: 'PATCH',
    body: JSON.stringify({ language }),
  }, accessToken);

  return MeResponseSchema.parse(raw);
}

/**
 * Get presigned avatar upload URL.
 */
export async function getAvatarUploadUrl(
  accessToken: string,
  contentType: string = 'image/jpeg'
): Promise<AvatarUploadUrlResponse> {
  const result = await apiFetch<AvatarUploadUrlResponse>('/api/profile/avatar/upload-url', {
    method: 'POST',
    body: JSON.stringify({ content_type: contentType }),
  }, accessToken);

  if (!result) throw new Error('Empty response from server');
  return result;
}

/**
 * Update avatar URL in profile.
 */
export async function updateAvatar(
  publicUrl: string,
  accessToken: string
): Promise<MeResponseDTO> {
  const raw = await apiFetch<unknown>('/api/profile/avatar', {
    method: 'PUT',
    body: JSON.stringify({ avatar_url: publicUrl }),
  }, accessToken);

  return MeResponseSchema.parse(raw);
}
