import createMiddleware from 'next-intl/middleware';
 
const intlMiddleware = createMiddleware({
  locales: ['fr', 'en'],
  defaultLocale: 'fr'
});

export default function middleware(req: any) {
  console.log('Middleware called for:', req.nextUrl.pathname);
  return intlMiddleware(req);
}
 
export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(fr|en)/:path*']
};
