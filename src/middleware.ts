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

// Routes publiques : accueil, recherche, résultats, compagnies, tarifs, contact
const PUBLIC_ROUTES = [
  '/',
  '/recherche',
  '/resultats',
  '/compagnies',
  '/tarifs-et-lignes',
  '/contact',
  '/login',
  '/register',
];

// Routes protégées (voyageur) : réservation, mon-billet, profil, notifications
const TRAVELER_PROTECTED_ROUTES = [
  '/reservation',
  '/mon-billet',
  '/profil',
  '/notifications',
];

// Routes protégées par rôle
const PARTNER_ROUTES = /^\/partner(\/|$)/;
const ADMIN_ROUTES = /^\/admin(\/|$)/;

export async function middleware(request: NextRequest) {
  // 1. Exécution du middleware intl pour la gestion des langues
  const intlResponse = intlMiddleware(request);

  const pathname = request.nextUrl.pathname;
  // Extraire le chemin de base sans préfixe de langue (ex: /reservation depuis /fr/reservation)
  const basePath = pathname.replace(/^\/(fr|en)/, '') || '/';

  // Extraction de la locale (défaut 'fr')
  const localeMatch = pathname.match(/^\/(fr|en)/);
  const locale = localeMatch ? localeMatch[1] : 'fr';

  // Catégorisation des routes
  const isPublic = PUBLIC_ROUTES.some(
    (route) => basePath === route || basePath.startsWith(route + '/')
  );
  const isTravelerProtected = TRAVELER_PROTECTED_ROUTES.some(
    (route) => basePath === route || basePath.startsWith(route + '/')
  );
  const isPartner = PARTNER_ROUTES.test(basePath);
  const isAdmin = ADMIN_ROUTES.test(basePath);
  const isLoginPage = basePath === '/login' || basePath === '/register';

  // Fast path: Détection rapide de cookie de session Supabase
  const hasAuthCookie = request.cookies.getAll().some(
    (c) => c.name.includes('sb-') || c.name.includes('supabase')
  );

  // Redirection : Utilisateur déjà connecté tentant d'accéder à /login ou /register
  if (isLoginPage && hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}`;
    return NextResponse.redirect(url);
  }

  // Protection Voyageur : Non authentifié sur route voyageur protégée
  if (isTravelerProtected && !hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.searchParams.set('redirect', basePath);
    return NextResponse.redirect(url);
  }

  // Protection Partner/Admin : Non authentifié sur route partner ou admin
  if ((isPartner || isAdmin) && !hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.searchParams.set('redirect', basePath);
    return NextResponse.redirect(url);
  }

  // PERFORMANCE BOOST : Si route publique et pas de cookie d'authentification
  // on retourne directement sans appel externe Supabase
  if (isPublic && !hasAuthCookie) {
    return intlResponse;
  }

  // Configuration Supabase pour validation serveur et contrôle des rôles
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

  // Rafraîchir la session et vérifier l'utilisateur courant
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

  // 5.3 Contrôle des rôles : Partner et Admin
  if ((isPartner || isAdmin) && user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role || 'traveler';

    // Route Partner : réservée aux 'partner' et 'admin'
    if (isPartner && role !== 'partner' && role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}`;
      return NextResponse.redirect(url);
    }

    // Route Admin : réservée strictement aux 'admin'
    if (isAdmin && role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}`;
      return NextResponse.redirect(url);
    }
  }

  return intlResponse;
}

export const config = {
  // Intercepter les pages localisées ainsi que /partner et /admin
  matcher: ['/', '/(fr|en)/:path*', '/partner/:path*', '/admin/:path*'],
};
