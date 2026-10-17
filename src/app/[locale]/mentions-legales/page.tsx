'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export default function MentionsLegalesPage() {
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[12px] font-medium text-slate-500 mb-6">
          <Link href={`/${locale}`} className="hover:text-emerald-600 transition-colors">
            Accueil
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Mentions Légales</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[11px] font-bold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Informations Légales &amp; Réglementaires
          </div>
          <h1 className="text-[28px] sm:text-[34px] font-black text-slate-900 tracking-tight leading-tight">
            Mentions Légales
          </h1>
          <p className="text-slate-600 text-[14px] mt-2 leading-relaxed">
            Conformément aux dispositions de la Loi N° 2017-20 du 20 avril 2018 portant Code du Numérique en République du Bénin, les présentes mentions légales définissent le cadre d&apos;exploitation de la plateforme numérique <strong>Ticket+</strong>.
          </p>
          <div className="text-[12px] text-slate-400 mt-4 flex items-center gap-4">
            <span>Dernière mise à jour : 16 Octobre 2026</span>
            <span>•</span>
            <span>Version 2.4.0 Bénin</span>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm space-y-10 text-slate-700 text-[14px] leading-relaxed">
          
          {/* Section 1 : Éditeur du Service */}
          <section className="space-y-3">
            <h2 className="text-[18px] font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 text-[14px] font-black">
                1
              </span>
              Éditeur de la Plateforme
            </h2>
            <p>
              Le site web et l&apos;application web accessible à l&apos;adresse <strong>ticketplus.bj</strong> (ci-après désignés « la Plateforme ») sont édités et exploités par :
            </p>
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/70 space-y-2 text-[13px]">
              <p><strong>Dénomination sociale :</strong> TICKET+ TECHNOLOGIES BÉNIN SARL</p>
              <p><strong>Forme juridique :</strong> Société à Responsabilité Limitée de droit béninois</p>
              <p><strong>Capital social :</strong> 5 000 000 FCFA</p>
              <p><strong>Siège social :</strong> Boulevard Saint-Michel, Immeuble Le Phénix, 3ème étage, Cotonou, République du Bénin</p>
              <p><strong>Numéro RCCM :</strong> RB/COT/24-B-31980</p>
              <p><strong>Identifiant Fiscal Unique (IFU) :</strong> 3202415890712</p>
              <p><strong>Contact électronique :</strong> <a href="mailto:contact@ticketplus.bj" className="text-emerald-600 font-semibold hover:underline">contact@ticketplus.bj</a> / <a href="mailto:support@ticketplus.bj" className="text-emerald-600 font-semibold hover:underline">support@ticketplus.bj</a></p>
              <p><strong>Service Client &amp; Assistance WhatsApp :</strong> +229 01 54 65 89 07 (Disponible 7j/7 de 06h00 à 22h00)</p>
              <p><strong>Directeur de la Publication :</strong> Direction Générale Ticket+ Bénin</p>
            </div>
          </section>

          {/* Section 2 : Activité et Rôle d'Intermédiation */}
          <section className="space-y-3">
            <h2 className="text-[18px] font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 text-[14px] font-black">
                2
              </span>
              Nature du Service et Intermédiation
            </h2>
            <p>
              <strong>Ticket+</strong> est une plateforme technologique d&apos;intermédiation en ligne dédiée à la billetterie et à la réservation de titres de transport interurbain en autocar en République du Bénin et dans la sous-région ouest-africaine.
            </p>
            <p>
              Ticket+ n&apos;est pas une compagnie de transport physique et n&apos;exploite pas directement les autocars. Les prestations de transport proprement dites sont exécutées sous l&apos;entière responsabilité des compagnies partenaires dûment agréées par le Ministère du Cadre de Vie et des Transports du Bénin (notamment <em>Confort Lines, Baobab Express, ATT Transports, STM Voyageurs</em>).
            </p>
          </section>

          {/* Section 3 : Hébergement et Infrastructure */}
          <section className="space-y-3">
            <h2 className="text-[18px] font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 text-[14px] font-black">
                3
              </span>
              Hébergement et Sécurité de l&apos;Infrastructure
            </h2>
            <p>
              La plateforme et ses bases de données sont hébergées sur des infrastructures sécurisées répondant aux normes internationales de disponibilité et de redondance :
            </p>
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/70 space-y-2 text-[13px]">
              <p><strong>Hébergement d&apos;application :</strong> Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA</p>
              <p><strong>Base de données sécurisée &amp; Authentification :</strong> Supabase Inc., 970 Toa Payoh North #07-04, Singapore / Datacenters certifiés ISO 27001 et SOC 2 Type II</p>
              <p><strong>Chiffrement des flux :</strong> Protocole HTTPS / TLS 1.3 avec certificat d&apos;autorité SSL 256 bits</p>
            </div>
          </section>

          {/* Section 4 : Propriété Intellectuelle */}
          <section className="space-y-3">
            <h2 className="text-[18px] font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 text-[14px] font-black">
                4
              </span>
              Propriété Intellectuelle
            </h2>
            <p>
              L&apos;ensemble des éléments composant la Plateforme Ticket+ (notamment la marque Ticket+, les logos, chartes graphiques, interfaces, bases de données, codes sources, textes et visuels) sont protégés par les lois béninoises et internationales relatives à la propriété intellectuelle et aux droits d&apos;auteur (OAPI).
            </p>
            <p>
              Toute reproduction, représentation, extraction, modification ou diffusion totale ou partielle de ces éléments, sans autorisation écrite préalable de TICKET+ TECHNOLOGIES BÉNIN SARL, est strictement interdite et passible de poursuites judiciaires. Les marques et logos des compagnies de transport partenaires demeurent la propriété exclusive de leurs entités respectives.
            </p>
          </section>

          {/* Section 5 : Données Personnelles et Conformité APDP */}
          <section className="space-y-3">
            <h2 className="text-[18px] font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 text-[14px] font-black">
                5
              </span>
              Protection des Données Personnelles (APDP Bénin)
            </h2>
            <p>
              Les traitements de données à caractère personnel effectués sur Ticket+ sont conformes au Livre V de la Loi N° 2017-20 du Code du Numérique du Bénin relatif à la protection des données personnelles.
            </p>
            <p>
              Pour toute question relative à vos données ou pour exercer vos droits d&apos;accès, de rectification ou de suppression, vous pouvez contacter notre Délégué à la Protection des Données (DPO) à l&apos;adresse : <a href="mailto:privacy@ticketplus.bj" className="text-emerald-600 font-semibold hover:underline">privacy@ticketplus.bj</a> ou consulter notre page <Link href={`/${locale}/confidentialite`} className="text-emerald-600 font-semibold hover:underline">Politique de Confidentialité</Link>.
            </p>
          </section>

          {/* Section 6 : Droit Applicable et Juridiction */}
          <section className="space-y-3">
            <h2 className="text-[18px] font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 text-[14px] font-black">
                6
              </span>
              Droit Applicable et Règlement des Différends
            </h2>
            <p>
              Les présentes mentions légales sont régies par le droit de la République du Bénin. En cas de contestation ou de litige, les parties s&apos;engagent à rechercher une solution amiable avant tout recours judiciaire. À défaut d&apos;accord amiable, compétence expresse est attribuée aux Tribunaux compétents de Cotonou (Bénin).
            </p>
          </section>

        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold text-[13px] hover:bg-slate-800 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Retour à l&apos;accueil Ticket+</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
