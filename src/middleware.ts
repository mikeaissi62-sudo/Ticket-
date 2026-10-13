import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

const intlMiddleware = createIntlMiddleware({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
});

// ============================================================
// 5.2 Middleware de Protection — Matrice des routes
// ============================================================

// Routes publiques : accueil, recherche, résultats, compagnies, tarifs, contact, billets, notifications, profil
const PUBLIC_ROUTES = [
  '/',
  '/recherche',
  '/resultats',
  '/compagnies',
  '/tarifs-et-lignes',
  '/contact',
  '/mon-billet',
  '/notifications',
  '/profil',
  '/login',
  '/register',
];

// Routes protégées (voyageur) : réservation (flux de commande)
const TRAVELER_PROTECTED_ROUTES = [
  '/reservation',
];

// Regex des routes de gestion
const PARTNER_ROUTES = /^\/partner(\/.*)?$/;
const ADMIN_ROUTES = /^\/admin(\/.*)?$/;

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Rediriger les tentatives d'accès aux portails avec préfixe de langue vers les routes racine
  // (ex: /fr/admin -> /admin, /fr/partner -> /partner)
  if (/^\/(fr|en)\/(admin|partner)(\/.*)?$/.test(pathname)) {
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.pathname = pathname.replace(/^\/(fr|en)/, '');
    return NextResponse.redirect(cleanUrl);
  }

  const isPartner = PARTNER_ROUTES.test(pathname);
  const isAdmin = ADMIN_ROUTES.test(pathname);

  // ============================================================
  // 2. Traitement dédié des portails /admin et /partner (HORS next-intl)
  // ============================================================
  if (isPartner || isAdmin) {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return response;
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Non connecté -> Redirection vers /fr/login
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/fr/login';
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Vérifier le rôle dans public.users
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role || 'traveler';

    // Route Partner : réservée aux 'partner' et 'admin'
    if (isPartner && role !== 'partner' && role !== 'admin') {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = '/fr';
      return NextResponse.redirect(homeUrl);
    }

    // Route Admin : réservée strictement aux 'admin'
    if (isAdmin && role !== 'admin') {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = '/fr';
      return NextResponse.redirect(homeUrl);
    }

    return response;
  }

  // ============================================================
  // 3. Traitement des routes grand public / voyageur (avec next-intl)
  // ============================================================
  const intlResponse = intlMiddleware(request);

  // Extraire le chemin de base sans préfixe de langue (ex: /reservation depuis /fr/reservation)
  const basePath = pathname.replace(/^\/(fr|en)/, '') || '/';

  // Extraction de la locale (défaut 'fr')
  const localeMatch = pathname.match(/^\/(fr|en)/);
  const locale = localeMatch ? localeMatch[1] : 'fr';

  const isPublic = PUBLIC_ROUTES.some(
    (route) => basePath === route || basePath.startsWith(route + '/')
  );
  const isTravelerProtected = TRAVELER_PROTECTED_ROUTES.some(
    (route) => basePath === route || basePath.startsWith(route + '/')
  );
  const isLoginPage = basePath === '/login' || basePath === '/register';

  // Fast path: Détection rapide de cookie de session Supabase
  const hasAuthCookie = request.cookies.getAll().some(
    (c) => c.name.includes('sb-') || c.name.includes('supabase')
  );

  // Si route publique et pas de cookie d'authentification, retourner directement
  if (isPublic && !hasAuthCookie) {
    return intlResponse;
  }

  // Configuration Supabase pour validation serveur voyageur
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return intlResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si route voyageur protégée et session invalide côté Supabase
  if (isTravelerProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.searchParams.set('redirect', basePath);
    return NextResponse.redirect(url);
  }

  return intlResponse;
}

export const config = {
  // Intercepter toutes les requêtes d'application sauf api, _next et fichiers statiques (images, fonts, etc.)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
