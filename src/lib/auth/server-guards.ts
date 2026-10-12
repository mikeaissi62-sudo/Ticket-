import { redirect } from 'next/navigation';
import { createClient } from '../supabase/server';
import type { UserRole, User as UserProfile } from '../types/database';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface CurrentUserResult {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  role: UserRole | null;
}

/**
 * Récupère l'utilisateur actuellement connecté et son profil avec son rôle.
 * À utiliser dans les Server Components, Route Handlers et Server Actions.
 */
export async function getCurrentUser(): Promise<CurrentUserResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { user: null, profile: null, role: null };
    }

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      user,
      profile: profile as UserProfile | null,
      role: (profile?.role as UserRole) || 'traveler',
    };
  } catch {
    return { user: null, profile: null, role: null };
  }
}

/**
 * Guard côté serveur : Exige qu'un utilisateur soit authentifié.
 * Si non connecté, redirige automatiquement vers la page de login.
 */
export async function requireAuth(redirectPath?: string): Promise<{
  user: SupabaseUser;
  profile: UserProfile | null;
  role: UserRole;
}> {
  const { user, profile, role } = await getCurrentUser();

  if (!user) {
    const target = redirectPath ? `/fr/login?redirect=${encodeURIComponent(redirectPath)}` : '/fr/login';
    redirect(target);
  }

  return {
    user,
    profile,
    role: role || 'traveler',
  };
}

/**
 * Guard côté serveur : Exige un ou plusieurs rôles spécifiques ('traveler' | 'partner' | 'admin').
 * Si l'utilisateur n'a pas les droits requis, redirige vers l'accueil ou le chemin fourni.
 */
export async function requireRole(
  allowedRoles: UserRole[],
  fallbackPath: string = '/fr'
): Promise<{
  user: SupabaseUser;
  profile: UserProfile | null;
  role: UserRole;
}> {
  const auth = await requireAuth();

  if (!allowedRoles.includes(auth.role)) {
    redirect(fallbackPath);
  }

  return auth;
}

/**
 * Guard côté serveur : Exige le rôle administrateur ('admin').
 */
export async function requireAdmin(fallbackPath: string = '/fr') {
  return requireRole(['admin'], fallbackPath);
}

/**
 * Guard côté serveur : Exige le rôle partenaire ou administrateur ('partner' | 'admin').
 */
export async function requirePartner(fallbackPath: string = '/fr') {
  return requireRole(['partner', 'admin'], fallbackPath);
}
