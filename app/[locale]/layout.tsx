import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/layout/header";
import { AuthInitializer } from "@/components/auth/auth-initializer";
import { NetworkStatus } from "@/components/network-status";
import "../globals.css";

// Runtime env validation — fails fast if NEXT_PUBLIC_API_URL is missing
import '@/lib/schemas/env';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "RestoAI | Pro Management Platform",
  description: "Smart restaurant management: inventory, recipes, and AI analytics for modern food business.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RestoAI",
  },
  formatDetection: {
    telephone: false,
  },
};

const locales = ['pl', 'en', 'uk', 'ru'];

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout(props: Props) {
  const params = await props.params;
  const { locale } = params;

  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthInitializer>
            <NextIntlClientProvider messages={messages}>
              <Header />
              {props.children}
              <NetworkStatus />
            </NextIntlClientProvider>
          </AuthInitializer>
        </ThemeProvider>
      </body>
    </html>
  );
}
