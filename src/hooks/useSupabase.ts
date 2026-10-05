'use client';

import { useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Hook pour accéder au client Supabase côté navigateur.
 * Utilise useMemo pour éviter de recréer le client à chaque render.
 */
export function useSupabase() {
  const supabase = useMemo(() => createClient(), []);
  return supabase;
}
