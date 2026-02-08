import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['pl', 'en', 'uk', 'ru'],
  defaultLocale: 'pl'
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
