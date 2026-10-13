'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { createClient } from '../supabase/client';
import type { UserRole, User as UserProfile } from '../types/database';
import type { User as SupabaseUser } from '@supabase/supabase-js';

function useSafeLocale(): string {
  try {
    return useLocale();
  } catch {
    return 'fr';
  }
}

export interface AuthContextType {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  role: UserRole;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPartner: boolean;
  isTraveler: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  role: 'traveler',
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  isPartner: false,
  isTraveler: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const locale = useSafeLocale();
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('traveler');
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data as UserProfile);
        setRole((data.role as UserRole) || 'traveler');
      } else {
        setRole('traveler');
      }
    } catch {
      setRole('traveler');
    }
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setRole('traveler');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setRole('traveler');
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    setUser(null);
    setProfile(null);
    setRole('traveler');
    if (typeof window !== 'undefined') {
      // Redirection vers la page de présentation à la déconnexion
      window.location.href = `/${locale}`;
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    role,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: role === 'admin',
    isPartner: role === 'partner' || role === 'admin',
    isTraveler: role === 'traveler',
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook client pour accéder au contexte d'authentification et au rôle
 */
export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Composant Guard client : vérifie que l'utilisateur est connecté
 */
export function AuthGuard({
  children,
  fallback = null,
  redirectTo,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const locale = useSafeLocale();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && redirectTo) {
      router.push(`/${locale}${redirectTo}`);
    }
  }, [isLoading, isAuthenticated, redirectTo, router, locale]);

  if (isLoading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <span className="material-symbols-outlined text-[28px] text-primary animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Composant Guard client : vérifie que l'utilisateur possède un rôle autorisé
 */
export function RoleGuard({
  allowedRoles,
  children,
  fallback = null,
  redirectTo,
}: {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}) {
  const { role, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const locale = useSafeLocale();

  const isAllowed = isAuthenticated && allowedRoles.includes(role);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !allowedRoles.includes(role)) && redirectTo) {
      router.push(`/${locale}${redirectTo}`);
    }
  }, [isLoading, isAuthenticated, role, allowedRoles, redirectTo, router, locale]);

  if (isLoading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <span className="material-symbols-outlined text-[28px] text-primary animate-spin">
          progress_activity
        </span>
      </div>
    );
  }

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
