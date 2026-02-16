import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createIntlMiddleware({
  locales: ['pl', 'en', 'uk', 'ru'],
  defaultLocale: 'pl'
});

// 🔐 Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/recipes',
  '/inventory',
  '/dishes',
  '/menu-engineering',
  '/reports',
  '/assistant',
];

// 🌐 Public routes (no auth required)
const publicRoutes = [
  '/login',
  '/register',
  '/',
];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get access token from httpOnly cookie
  const accessToken = request.cookies.get('access_token')?.value;
  
  // Extract locale from pathname (e.g., /pl/dashboard → pl)
  const pathnameLocale = pathname.split('/')[1];
  const locales = ['pl', 'en', 'uk', 'ru'];
  const hasLocale = locales.includes(pathnameLocale);
  
  // Remove locale prefix for route matching
  const pathWithoutLocale = hasLocale 
    ? '/' + pathname.split('/').slice(2).join('/')
    : pathname;
  
  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathWithoutLocale.startsWith(route)
  );
  
  const isPublicRoute = publicRoutes.some(route => 
    pathWithoutLocale === route || pathWithoutLocale === ''
  );
  
  console.log('🔐 [MIDDLEWARE]', {
    pathname,
    pathWithoutLocale,
    hasToken: !!accessToken,
    isProtectedRoute,
    isPublicRoute,
  });
  
  // 🚫 Protected route without token → redirect to login
  if (isProtectedRoute && !accessToken) {
    console.log('❌ [MIDDLEWARE] Unauthorized access, redirecting to login');
    const loginUrl = new URL(`/${pathnameLocale}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // ✅ Has token but on public route (login/register) → redirect to dashboard
  if (accessToken && (pathWithoutLocale === '/login' || pathWithoutLocale === '/register')) {
    console.log('✅ [MIDDLEWARE] Already authenticated, redirecting to dashboard');
    const dashboardUrl = new URL(`/${pathnameLocale}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }
  
  // Apply i18n middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
