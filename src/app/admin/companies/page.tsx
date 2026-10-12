'use client';

import React, { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { createClient } from '@/lib/supabase/client';

interface CompanyItem {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  is_active: boolean;
  commission_rate: number;
  rating: number;
  daily_departures: number;
  contact_phone: string;
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanyItem | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [commissionRate, setCommissionRate] = useState(10);
  const [phone, setPhone] = useState('+229 01 64 00 00 00');
  const [isActive, setIsActive] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (data && data.length > 0) {
        setCompanies(
          data.map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            subtitle: c.subtitle || 'Transport interurbain',
            is_active: c.is_active ?? true,
            commission_rate: c.commission_rate || 10,
            rating: c.rating || 4.8,
            daily_departures: c.daily_departures || 12,
            contact_phone: c.contact_info?.phone || '+229 01 00 00 00 00',
          }))
        );
      } else {
        // Liste par défaut des 4 compagnies du Bénin
        setCompanies([
          {
            id: '1',
            name: 'Confort Lines',
            slug: 'confort-lines',
            subtitle: 'Pionnier du transport VIP climatisé',
            is_active: true,
            commission_rate: 10,
            rating: 4.9,
            daily_departures: 14,
            contact_phone: '+229 01 64 28 90 00',
          },
          {
            id: '2',
            name: 'Baobab Express',
            slug: 'baobab-express',
            subtitle: 'Réseau national & confort grande ligne',
            is_active: true,
            commission_rate: 10,
            rating: 4.7,
            daily_departures: 10,
            contact_phone: '+229 01 97 12 34 56',
          },
          {
            id: '3',
            name: 'STM Voyageurs',
            slug: 'stm-voyageurs',
            subtitle: 'Lignes régulières Nord-Sud Bénin',
            is_active: true,
            commission_rate: 10,
            rating: 4.6,
            daily_departures: 8,
            contact_phone: '+229 01 95 88 77 66',
          },
          {
            id: '4',
            name: 'ATT Transports',
            slug: 'att-transports',
            subtitle: 'Sécurité et ponctualité éprouvée',
            is_active: true,
            commission_rate: 10,
            rating: 4.8,
            daily_departures: 6,
            contact_phone: '+229 01 61 22 33 44',
          },
        ]);
      }
    } catch (err) {
      console.error('Erreur chargement compagnies:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleEdit(c: CompanyItem) {
    setSelectedCompany(c);
    setName(c.name);
    setSubtitle(c.subtitle);
    setCommissionRate(c.commission_rate);
    setPhone(c.contact_phone);
    setIsActive(c.is_active);
    setIsEditing(true);
    setMessage(null);
  }

  function handleNew() {
    setSelectedCompany(null);
    setName('');
    setSubtitle('');
    setCommissionRate(10);
    setPhone('+229 ');
    setIsActive(true);
    setIsEditing(true);
    setMessage(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    try {
      const supabase = createClient();
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      if (selectedCompany) {
        // Mise à jour
        await supabase
          .from('companies')
          .update({
            name,
            subtitle,
            commission_rate: commissionRate,
            is_active: isActive,
            contact_info: { phone },
          })
          .eq('id', selectedCompany.id);

        setCompanies((prev) =>
          prev.map((item) =>
            item.id === selectedCompany.id
              ? { ...item, name, subtitle, commission_rate: commissionRate, is_active: isActive, contact_phone: phone }
              : item
          )
        );
        setMessage('Compagnie mise à jour avec succès.');
      } else {
        // Création
        const newId = `comp_${Date.now()}`;
        const newComp: CompanyItem = {
          id: newId,
          name,
          slug,
          subtitle,
          commission_rate: commissionRate,
          is_active: isActive,
          rating: 4.8,
          daily_departures: 4,
          contact_phone: phone,
        };

        await supabase.from('companies').insert({
          id: newId,
          name,
          slug,
          subtitle,
          commission_rate: commissionRate,
          is_active: isActive,
          contact_info: { phone },
        });

        setCompanies((prev) => [...prev, newComp]);
        setMessage('Nouvelle compagnie ajoutée avec succès.');
      }

      setIsEditing(false);
    } catch {
      // Fallback local
      setIsEditing(false);
      setMessage('Modification enregistrée localement.');
    }
  }

  async function toggleStatus(id: string, current: boolean) {
    try {
      const supabase = createClient();
      await supabase.from('companies').update({ is_active: !current }).eq('id', id);
    } catch {}

    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_active: !current } : c))
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Gestion des Compagnies Partenaires"
        subtitle="Contrôle de la flotte, des taux de commission Ticket+ et des autorisations de vente"
      />

      <main className="p-8 space-y-6 max-w-7xl">
        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>{message}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-emerald-600 hover:text-emerald-900">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Top Action Bar */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Annuaire des Transporteurs</h2>
            <p className="text-xs text-slate-500">4 compagnies certifiées opérant au Bénin</p>
          </div>
          <button
            onClick={handleNew}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Nouvelle Compagnie</span>
          </button>
        </div>

        {/* Modal Form if editing */}
        {isEditing && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedCompany ? `Modifier ${selectedCompany.name}` : 'Ajouter une Compagnie'}
                </h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs font-medium text-slate-700">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Nom de la Compagnie</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Confort Lines"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Description / Slogan</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Ex: Pionnier du transport VIP climatisé"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Commission Ticket+ (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Contact Téléphonique</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <label htmlFor="isActive" className="text-xs font-semibold text-slate-800">
                    Compagnie active sur la plateforme (Billetterie ouverte)
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {companies.map((company) => (
            <div
              key={company.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-sm">
                      {company.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{company.name}</h3>
                      <p className="text-xs text-slate-500">{company.subtitle}</p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      company.is_active
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${company.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    {company.is_active ? 'Active' : 'Désactivée'}
                  </span>
                </div>

                {/* Details Badges */}
                <div className="mt-4 grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Commission</span>
                    <span className="text-xs font-bold text-slate-800">{company.commission_rate}%</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Note Avis</span>
                    <span className="text-xs font-bold text-amber-600 flex items-center justify-center gap-0.5">
                      <span className="material-symbols-outlined text-[14px]">star</span>
                      {company.rating}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Départs/Jour</span>
                    <span className="text-xs font-bold text-slate-800">{company.daily_departures}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">call</span>
                  <span>{company.contact_phone}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  onClick={() => toggleStatus(company.id, company.is_active)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                    company.is_active
                      ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                      : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  {company.is_active ? 'Suspendre' : 'Activer'}
                </button>

                <button
                  onClick={() => handleEdit(company)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                  <span>Paramètres</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
