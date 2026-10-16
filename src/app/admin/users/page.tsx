'use client';

import React, { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { createClient } from '@/lib/supabase/client';

interface UserItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'traveler' | 'partner' | 'admin';
  company_name?: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [filterRole, setFilterRole] = useState<'all' | 'traveler' | 'partner' | 'admin'>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('users')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          role,
          created_at,
          company:companies (name)
        `)
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setUsers(
          data.map((u: any) => ({
            id: u.id,
            name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Utilisateur',
            email: u.email || 'Non renseigné',
            phone: u.phone || '+229 -- -- -- --',
            role: u.role || 'traveler',
            company_name: u.company?.name,
            created_at: new Date(u.created_at).toLocaleDateString('fr-FR'),
          }))
        );
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error('Erreur utilisateurs:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateRole(userId: string, newRole: 'traveler' | 'partner' | 'admin') {
    try {
      const supabase = createClient();
      await supabase.from('users').update({ role: newRole }).eq('id', userId);
    } catch {}

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    setMessage(`Rôle mis à jour vers "${newRole}".`);
  }

  const filtered = users
    .filter((u) => filterRole === 'all' || u.role === filterRole)
    .filter(
      (u) =>
        !search ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.phone.includes(search) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Gestion des Utilisateurs & Rôles"
        subtitle="Contrôle d'accès des voyageurs, des agents de compagnie et des administrateurs"
      />

      <main className="p-8 space-y-6 max-w-7xl">
        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage(null)} className="text-emerald-600 hover:text-emerald-900">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-slate-400">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Chercher nom, tél, email..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex gap-1.5 flex-wrap w-full sm:w-auto">
            {(['all', 'traveler', 'partner', 'admin'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setFilterRole(r)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterRole === r
                    ? 'bg-[#0F172A] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r === 'all' ? 'Tous' : r === 'traveler' ? 'Voyageurs' : r === 'partner' ? 'Partenaires' : 'Admins'}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Utilisateur</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Rôle Actuel</th>
                  <th className="py-3 px-4">Affiliation Compagnie</th>
                  <th className="py-3 px-4">Inscription</th>
                  <th className="py-3 px-4 text-right">Attribuer un Rôle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs font-medium">
                      Aucun compte utilisateur trouvé.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                          {u.name[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="font-bold text-slate-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="text-slate-900 font-semibold">{u.phone}</span>
                        <span className="text-[10px] text-slate-400">{u.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : u.role === 'partner'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {u.role === 'admin' ? 'Administrateur' : u.role === 'partner' ? 'Partenaire Compagnie' : 'Voyageur'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {u.company_name || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{u.created_at}</td>
                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => updateRole(u.id, e.target.value as any)}
                        className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-slate-400 outline-none"
                      >
                        <option value="traveler">Voyageur</option>
                        <option value="partner">Partenaire</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
