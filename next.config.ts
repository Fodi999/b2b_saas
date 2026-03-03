import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
});

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  // Stricter image origins — only your backend and known CDNs
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.koyeb.app',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '*.cloudflare.com',
      },
    ],
  },

  // Production optimisations
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Allow embedding from dima-fomin.pl (replaces blanket DENY)
          { key: 'X-Frame-Options',          value: 'ALLOW-FROM https://dima-fomin.pl' },
          { key: 'Content-Security-Policy',  value: "frame-ancestors 'self' https://dima-fomin.pl" },
          // Other security headers — unchanged
          { key: 'X-Content-Type-Options',   value: 'nosniff' },
          { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default withPWA(withNextIntl(nextConfig));
