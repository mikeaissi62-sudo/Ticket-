import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

const intlMiddleware = createIntlMiddleware({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
});

// Routes protégées par rôle
const PARTNER_ROUTES = /^\/partner(\/|$)/;
const ADMIN_ROUTES = /^\/admin(\/|$)/;

export async function middleware(request: NextRequest) {
  // 1. Run intl middleware first for locale detection
  const intlResponse = intlMiddleware(request);

  const pathname = request.nextUrl.pathname;
  // Strip locale prefix to get the base path
  const basePath = pathname.replace(/^\/(fr|en)/, '') || '/';

  const isPartner = PARTNER_ROUTES.test(basePath);
  const isAdmin = ADMIN_ROUTES.test(basePath);
  const isLoginPage = basePath === '/login' || basePath === '/register';

  // Fast path: Check if any Supabase auth cookie exists
  const hasAuthCookie = request.cookies.getAll().some(
    (c) => c.name.includes('sb-') || c.name.includes('supabase')
  );

  // Check if user clicked "Passer cette étape" (Guest mode)
  const isGuest = request.cookies.has('tp_guest');

  // Extract locale (default 'fr')
  const localeMatch = pathname.match(/^\/(fr|en)/);
  const locale = localeMatch ? localeMatch[1] : 'fr';

  // If already authenticated and trying to access /login, redirect to profile
  if (isLoginPage && hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/profil`;
    return NextResponse.redirect(url);
  }

  // GATEKEEPER: If first time visitor (not logged in, not marked as guest, not on login page, not on public asset)
  // redirect them to the login & onboarding page first
  if (!hasAuthCookie && !isGuest && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  // PERFORMANCE BOOST: If it's a public route and no auth session exists,
  // skip the external Supabase network roundtrip completely.
  if (!isPartner && !isAdmin && !hasAuthCookie) {
    return intlResponse;
  }

  // 2. Create Supabase client with cookie handling only when needed
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return intlResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            intlResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 3. Refresh the session only when an auth cookie exists or route is protected
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 4. Protect partner routes
  if (isPartner && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/fr';
    return NextResponse.redirect(url);
  }

  // 5. Protect admin routes
  if (isAdmin && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/fr';
    return NextResponse.redirect(url);
  }

  return intlResponse;
}

export const config = {
  // Match only localized pages, ignore static files, api, images, etc.
  matcher: ['/', '/(fr|en)/:path*'],
};
