import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

const intlMiddleware = createIntlMiddleware({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
});

// Routes publiques (accessibles sans auth)
const PUBLIC_ROUTES = [
  '/',
  '/recherche',
  '/resultats',
  '/compagnies',
  '/tarifs-et-lignes',
  '/contact',
];

// Routes protégées par rôle
const PARTNER_ROUTES = /^\/partner(\/|$)/;
const ADMIN_ROUTES = /^\/admin(\/|$)/;

export async function middleware(request: NextRequest) {
  // 1. Run intl middleware first for locale detection
  const intlResponse = intlMiddleware(request);

  // 2. Create Supabase client with cookie handling
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase is not configured yet, just run intl middleware
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

  // 3. Refresh the session (important for server components)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Strip locale prefix to get the base path
  const basePath = pathname.replace(/^\/(fr|en)/, '') || '/';

  // 4. Check if route is public
  const isPublic = PUBLIC_ROUTES.some(
    (route) => basePath === route || basePath.startsWith(route + '/')
  );

  // 5. Protect partner routes
  if (PARTNER_ROUTES.test(basePath)) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/fr';
      return NextResponse.redirect(url);
    }
    // TODO: check user role === 'partner' from DB
  }

  // 6. Protect admin routes
  if (ADMIN_ROUTES.test(basePath)) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/fr';
      return NextResponse.redirect(url);
    }
    // TODO: check user role === 'admin' from DB
  }

  // 7. Protect traveler routes (reservation, mon-billet, profil, notifications)
  const PROTECTED_TRAVELER = ['/reservation', '/mon-billet', '/profil', '/notifications'];
  const isTravelerProtected = PROTECTED_TRAVELER.some(
    (route) => basePath.startsWith(route)
  );

  if (isTravelerProtected && !user) {
    // For now, allow access even without auth (Phase 5 will enforce this)
    // When Phase 5 is complete, uncomment:
    // const url = request.nextUrl.clone();
    // url.pathname = '/fr';
    // return NextResponse.redirect(url);
  }

  return intlResponse;
}

export const config = {
  matcher: ['/', '/(fr|en)/:path*'],
};
