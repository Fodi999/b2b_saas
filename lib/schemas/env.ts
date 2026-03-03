/**
 * Runtime environment validation.
 * Imported once in the root layout to fail fast on missing vars.
 */
import { z } from 'zod';

const FALLBACK_API_URL = 'https://ministerial-yetta-fodi999-c58d8823.koyeb.app';

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
});

function validateEnv() {
  // Skip validation entirely during static build / SSG phase
  // (env vars may not be injected yet — Vercel injects them at runtime)
  if (typeof process === 'undefined') return;

  const result = envSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  });

  if (!result.success) {
    const missing = result.error.issues.map(i => `  ${i.path.join('.')}: ${i.message}`).join('\n');
    // Always warn — never throw (build must succeed even without env vars)
    console.warn(`⚠️  Environment variables missing/invalid:\n${missing}\n  → Using built-in fallback URL.`);
  }
}

// Execute on import (warn only, never throw)
validateEnv();

export const env = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || FALLBACK_API_URL,
} as const;
