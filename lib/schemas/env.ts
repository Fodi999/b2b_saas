/**
 * Runtime environment validation.
 * Imported once in the root layout to fail fast on missing vars.
 */
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url('NEXT_PUBLIC_API_URL must be a valid URL'),
});

function validateEnv() {
  const result = envSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  });

  if (!result.success) {
    const missing = result.error.issues.map(i => `  ${i.path.join('.')}: ${i.message}`).join('\n');
    // In development, warn loudly; in production, throw
    const msg = `❌ Invalid environment variables:\n${missing}`;
    if (process.env.NODE_ENV === 'production') {
      throw new Error(msg);
    } else {
      console.warn(msg);
    }
  }
}

// Execute on import
validateEnv();

export const env = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://ministerial-yetta-fodi999-c58d8823.koyeb.app',
} as const;
