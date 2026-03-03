/**
 * Next.js Instrumentation hook.
 *
 * This file intentionally overrides any auto-injected Vercel instrumentation
 * (Speed Insights / Analytics) to prevent:
 *   1. "[DEPRECATED] Default export is deprecated. Instead use import { create } from 'zustand'"
 *      (caused by Vercel's bundled instrument.js importing an old zustand copy)
 *   2. "Banner not shown: beforeinstallpromptevent.preventDefault() called"
 *      (caused by instrument.js calling preventDefault on the PWA install prompt)
 *
 * To enable Vercel Analytics, install @vercel/analytics and use the React
 * component explicitly instead:
 *   import { Analytics } from '@vercel/analytics/react'
 */
export async function register() {
  // no-op — intentionally empty
}
