'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

// FAQ Items
interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Comment puis-je réserver mon billet sur Ticket+ ?",
    answer: "C'est très simple et rapide : connectez-vous ou créez votre compte en quelques secondes, sélectionnez votre ville de départ (ex: Cotonou), votre destination (ex: Parakou) et votre date de voyage. Comparez les horaires et tarifs des compagnies partenaires, choisissez votre place préférée, puis réglez instantanément par MTN Mobile Money, Moov Money ou Carte bancaire. Votre e-billet avec QR Code est généré sur-le-champ."
  },
  {
    question: "Quels sont les moyens de paiement acceptés au Bénin ?",
    answer: "Nous acceptons tous les moyens de paiement locaux les plus populaires : MTN Mobile Money (MoMo), Moov Money (Flooz), Celtiis Cash ainsi que les cartes bancaires Visa et Mastercard internationales. Toutes les transactions sont cryptées et 100% sécurisées."
  },
  {
    question: "Dois-je obligatoirement imprimer mon billet avant de monter dans le bus ?",
    answer: "Non, absolument pas ! Ticket+ est une solution 100% numérique et écologique. Dès votre réservation validée, votre e-billet avec QR Code officiel est disponible sur votre espace personnel, et vous est envoyé par SMS et sur WhatsApp. Il vous suffit de présenter l'écran de votre smartphone au contrôleur lors de l'embarquement."
  },
  {
    question: "Que se passe-t-il si j'ai un imprévu ou si je souhaite modifier mon voyage ?",
    answer: "Vous pouvez modifier votre date ou heure de départ directement depuis votre espace voyageur jusqu'à 3 heures avant l'horaire prévu, selon les conditions de la compagnie sélectionnée. Notre service d'assistance voyageur est également joignable 24h/24 via WhatsApp pour vous accompagner."
  },
  {
    question: "Les prix sur Ticket+ sont-ils plus chers qu'au guichet de la gare ?",
    answer: "Non, les tarifs affichés sur Ticket+ sont exactement les tarifs officiels homologués par nos compagnies partenaires conventionnées (Confort Lines, Baobab Express, ATT Transports, STM Voyageurs). Aucun surcoût abusif n'est appliqué."
  },
  {
    question: "Comment contacter l'assistance en cas de retard ou de question ?",
    answer: "Notre équipe support dédiée aux voyageurs est joignable 7j/7 et 24h/24 via WhatsApp au +229 01 54 65 89 07 ou directement par le chat intégré à la plateforme. Nous vous répondons en moins de 3 minutes."
  }
];

// Avis clients réalistes
interface ReviewItem {
  id: string;
  name: string;
  role: string;
  city: string;
  avatar: string;
  rating: number;
  route: string;
  company: string;
  date: string;
  comment: string;
}

const REVIEWS: ReviewItem[] = [
  {
    id: '1',
    name: 'Astride K.',
    role: 'Cadre Commerciale',
    city: 'Cotonou',
    avatar: '👩🏾‍💼',
    rating: 5,
    route: 'Cotonou ➔ Parakou',
    company: 'Confort Lines VIP',
    date: 'Il y a 3 jours',
    comment: "J'emprunte la ligne Cotonou-Parakou deux fois par mois. Réserver la veille depuis mon lit et payer par MTN MoMo m'a fait gagner un temps précieux. Billet reçu sur WhatsApp en 10 secondes et place VIP garantie !"
  },
  {
    id: '2',
    name: 'Marc Dossou',
    role: 'Entrepreneur Agro',
    city: 'Parakou',
    avatar: '👨🏾‍💻',
    rating: 5,
    route: 'Parakou ➔ Cotonou',
    company: 'Baobab Express',
    date: 'Il y a 5 jours',
    comment: "Avant Ticket+, je devais envoyer un coursier à la gare pour m'acheter un ticket en avance. Maintenant, je choisis mon siège sur mon téléphone et le rappel SMS 2h avant le départ m'évite tout stress."
  },
  {
    id: '3',
    name: 'Sèna B.',
    role: 'Étudiante en Médecine',
    city: 'Abomey-Calavi',
    avatar: '👩🏾‍🎓',
    rating: 5,
    route: 'Cotonou ➔ Bohicon',
    company: 'STM Voyageurs',
    date: 'La semaine dernière',
    comment: "Super simple d'utilisation. Même ma maman a réussi à réserver son billet toute seule pour aller voir la famille à Bohicon. Le contrôleur a scanné le QR Code directement sur son téléphone sans problème."
  },
  {
    id: '4',
    name: 'Éric Houndété',
    role: 'Consultant en Développement',
    city: 'Natitingou',
    avatar: '👨🏾‍🏫',
    rating: 5,
    route: 'Cotonou ➔ Natitingou',
    company: 'ATT Transports',
    date: 'Il y a 2 semaines',
    comment: "La transparence sur les tarifs et pouvoir comparer tous les départs du jour sur un seul écran, c'est ce qui manquait au secteur du transport au Bénin. Bravo pour ce travail d'excellence !"
  }
];

// Flottes partenaires
const PARTNERS = [
  {
    name: 'Confort Lines',
    tag: 'Flottes VIP Climatisées • WiFi',
    badge: '11 départs/jour',
    logo: 'directions_bus',
    color: 'from-emerald-500 to-teal-700'
  },
  {
    name: 'Baobab Express',
    tag: 'Réseau National Express • Ponctualité 99%',
    badge: 'Nord & Sud',
    logo: 'airport_shuttle',
    color: 'from-amber-500 to-orange-700'
  },
  {
    name: 'ATT Transports',
    tag: 'Liaisons Interurbaines & Sahel',
    badge: 'Confort & Sécurité',
    logo: 'departure_board',
    color: 'from-blue-500 to-indigo-700'
  },
  {
    name: 'STM Voyageurs',
    tag: 'Liaisons Express Régionales',
    badge: 'Départs Quotidiens',
    logo: 'directions_bus_filled',
    color: 'from-slate-700 to-slate-900'
  }
];

export default function LandingPage() {
  const locale = useLocale();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col w-full bg-slate-50 text-[#0F172A] selection:bg-[#10B981] selection:text-white">
      
      {/* ============================================================ */}
      {/* 1. HERO SECTION (UPWORK-STYLE)                                 */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50/50 to-slate-100/70">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Badge Pills */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                <span className="text-[12px] font-bold text-emerald-800 tracking-wide uppercase">
                  N°1 de la billetterie interurbaine au Bénin
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-[36px] sm:text-[46px] lg:text-[52px] font-black text-[#0F172A] tracking-tight leading-[1.12]">
                Voyagez l&apos;esprit tranquille. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#047857]">
                  Réservez votre bus
                </span> en 2 minutes.
              </h1>

              {/* Subtitle */}
              <p className="text-[16px] sm:text-[18px] text-slate-600 leading-relaxed max-w-xl">
                Comparez les flottes officielles (Confort Lines, Baobab, ATT, STM), évitez les files d&apos;attente sous le soleil et recevez votre e-billet certifié avec QR Code par SMS &amp; WhatsApp.
              </p>

              {/* Call-To-Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Link
                  href={`/${locale}/login`}
                  className="px-7 py-4 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white text-[15px] font-extrabold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 transition-all text-center flex items-center justify-center gap-2.5 active:scale-98"
                >
                  <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
                  <span>Réserver mon billet</span>
                </Link>

                <a
                  href="#comment-ca-marche"
                  className="px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 text-[#0F172A] border border-slate-300 text-[15px] font-bold transition-all text-center flex items-center justify-center gap-2 shadow-xs active:scale-98"
                >
                  <span>Comment ça marche</span>
                  <span className="material-symbols-outlined text-[18px] text-slate-500">arrow_downward</span>
                </a>
              </div>

              {/* Trust Indicators / Social Proof Strip */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 text-amber-500">
                    <span className="font-black text-[17px] text-[#0F172A]">4.9</span>
                    <span className="text-[13px]">★★★★★</span>
                  </div>
                  <span className="text-[12px] text-slate-500 font-medium">+12 000 avis vérifiés</span>
                </div>

                <div className="flex flex-col">
                  <span className="font-black text-[17px] text-[#0F172A]">100%</span>
                  <span className="text-[12px] text-slate-500 font-medium">Prix officiel garanti</span>
                </div>

                <div className="flex flex-col">
                  <span className="font-black text-[17px] text-[#0F172A]">Instant</span>
                  <span className="text-[12px] text-slate-500 font-medium">QR Code SMS &amp; WhatsApp</span>
                </div>
              </div>

            </div>

            {/* Right Column: Interactive Digital Ticket Preview Mockup */}
            <div className="lg:col-span-5 relative flex justify-center">
              
              {/* Decorative background glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/20 to-teal-400/10 rounded-3xl blur-2xl pointer-events-none"></div>

              {/* Simulated E-Ticket Card */}
              <div className="relative w-full max-w-[390px] bg-white rounded-3xl border border-slate-200/80 shadow-2xl shadow-slate-900/10 overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
                
                {/* Ticket Top Banner */}
                <div className="bg-[#0F172A] p-5 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#10B981] flex items-center justify-center font-black text-white text-[13px]">
                        T+
                      </div>
                      <div>
                        <span className="font-extrabold text-[14px] tracking-tight block">Ticket+ Bénin</span>
                        <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">E-Billet Officiel</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                      Confirmé
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">DÉPART</span>
                      <span className="text-[18px] font-black text-white">Cotonou</span>
                      <span className="text-[11px] text-slate-400 block">Gare Jonquet • 07:00</span>
                    </div>

                    <div className="flex flex-col items-center px-3">
                      <span className="text-[11px] text-emerald-400 font-bold mb-1">6h30</span>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <div className="w-12 h-0.5 bg-slate-700 border-t border-dashed border-slate-500"></div>
                        <span className="material-symbols-outlined text-[16px] text-emerald-400">directions_bus</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 font-medium block">ARRIVÉE</span>
                      <span className="text-[18px] font-black text-white">Parakou</span>
                      <span className="text-[11px] text-slate-400 block">Gare Centrale • 13:30</span>
                    </div>
                  </div>
                </div>

                {/* Ticket Body Details */}
                <div className="p-5 space-y-3.5 bg-slate-50/60 border-t border-dashed border-slate-300">
                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Compagnie</span>
                      <span className="text-[13px] font-bold text-slate-800">Confort Lines VIP</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Siège Réservé</span>
                      <span className="text-[13px] font-bold text-emerald-600">N° 14 (Fenêtre)</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Voyageur</span>
                      <span className="text-[13px] font-bold text-slate-800">Astride Koffi</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Paiement</span>
                      <span className="text-[13px] font-bold text-slate-800">MTN MoMo (Payé)</span>
                    </div>
                  </div>

                  {/* QR Code Simulation */}
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                    <div className="text-left">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Code Réservation</span>
                      <span className="text-[14px] font-mono font-black text-slate-900 tracking-wider">TKP-2026-9812</span>
                      <span className="text-[11px] text-emerald-700 block mt-0.5 font-medium">Scannable à l&apos;embarquement</span>
                    </div>

                    {/* QR Code box */}
                    <div className="w-16 h-16 rounded-xl bg-white border border-slate-300 p-1.5 flex items-center justify-center shadow-xs">
                      <span className="material-symbols-outlined text-[44px] text-[#0F172A]">
                        qr_code_2
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action in Card */}
                <div className="p-4 bg-white border-t border-slate-200 text-center">
                  <Link
                    href={`/${locale}/login`}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[12px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Réserver un billet identique</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. PARTENAIRES & COMPAGNIES OFFICIELLES ("TRUSTED BY")        */}
      {/* ============================================================ */}
      <section id="partenaires" className="py-12 bg-white border-b border-slate-200/80">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <p className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-8">
            En partenariat officiel avec les flottes certifiées de la République du Bénin
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PARTNERS.map((p, idx) => (
              <div
                key={idx}
                className="group p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-300 bg-slate-50/60 hover:bg-emerald-50/30 transition-all text-left flex flex-col justify-between shadow-xs hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shadow-xs group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-[22px]">{p.logo}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                      {p.badge}
                    </span>
                  </div>
                  <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-[12px] text-slate-500 mt-1 leading-normal">
                    {p.tag}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-emerald-600 font-bold">
                  <span>Voir les départs</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </div>
              </div>
            ))}
          </div>

          {/* Supported Mobile Money Brands */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-6 text-slate-400 text-[12px] font-semibold">
            <span className="text-slate-500">Paiements 100% sécurisés :</span>
            <span className="px-3 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">MTN Mobile Money (MoMo)</span>
            <span className="px-3 py-1 bg-blue-50 text-blue-800 rounded-lg border border-blue-200">Moov Money (Flooz)</span>
            <span className="px-3 py-1 bg-teal-50 text-teal-800 rounded-lg border border-teal-200">Celtiis Cash</span>
            <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg border border-slate-200">Carte Visa / Mastercard</span>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. POURQUOI TICKET+ (VALUE PROPOSITION - 4 PILIERS)           */}
      {/* ============================================================ */}
      <section id="pourquoi" className="py-16 sm:py-24 bg-slate-50/50 border-b border-slate-200/80">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[12px] font-extrabold uppercase tracking-widest text-[#10B981] mb-2 block">
              La promesse Ticket+
            </span>
            <h2 className="text-[30px] sm:text-[38px] font-black text-[#0F172A] tracking-tight leading-tight">
              Pourquoi des milliers de voyageurs choisissent Ticket+
            </h2>
            <p className="text-[15px] text-slate-600 mt-3">
              Nous réinventons le transport interurbain au Bénin pour vous faire gagner du temps, de l&apos;argent et de la sérénité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pilier 1 */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 border border-emerald-100">
                  <span className="material-symbols-outlined text-[28px]">chair</span>
                </div>
                <h3 className="text-[17px] font-extrabold text-[#0F172A] mb-2">
                  Zéro file d&apos;attente
                </h3>
                <p className="text-[13px] text-slate-600 leading-relaxed">
                  Fini les réveils aux aurores pour faire la queue au guichet sous la chaleur. Réservez votre place assise préférée 24h/24 en 3 clics depuis chez vous.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 text-[12px] font-bold text-emerald-600 flex items-center gap-1">
                <span>Gain de temps garanti</span>
              </div>
            </div>

            {/* Pilier 2 */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-13 h-13 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-5 border border-teal-100">
                  <span className="material-symbols-outlined text-[28px]">qr_code_scanner</span>
                </div>
                <h3 className="text-[17px] font-extrabold text-[#0F172A] mb-2">
                  E-Billet avec QR Code
                </h3>
                <p className="text-[13px] text-slate-600 leading-relaxed">
                  Reçu par SMS et WhatsApp instantanément. Pas besoin d&apos;imprimer : le contrôleur scanne directement l&apos;écran de votre téléphone au départ.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 text-[12px] font-bold text-teal-600 flex items-center gap-1">
                <span>Accessible hors-ligne</span>
              </div>
            </div>

            {/* Pilier 3 */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-13 h-13 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 border border-blue-100">
                  <span className="material-symbols-outlined text-[28px]">verified_user</span>
                </div>
                <h3 className="text-[17px] font-extrabold text-[#0F172A] mb-2">
                  Tarifs officiels vérifiés
                </h3>
                <p className="text-[13px] text-slate-600 leading-relaxed">
                  Vous payez exactement le prix fixé par la compagnie, sans majoration pirate ni intermédiaire véreux. Vos transactions Mobile Money sont sécurisées.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 text-[12px] font-bold text-blue-600 flex items-center gap-1">
                <span>Transparence totale</span>
              </div>
            </div>

            {/* Pilier 4 */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-13 h-13 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 border border-amber-100">
                  <span className="material-symbols-outlined text-[28px]">support_agent</span>
                </div>
                <h3 className="text-[17px] font-extrabold text-[#0F172A] mb-2">
                  Alertes &amp; Assistance 24/7
                </h3>
                <p className="text-[13px] text-slate-600 leading-relaxed">
                  Recevez un rappel SMS 2h avant le départ avec le quai et le numéro de bus. Notre support voyageur WhatsApp répond à toutes vos questions en direct.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 text-[12px] font-bold text-amber-600 flex items-center gap-1">
                <span>Support réactif 7j/7</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. COMMENT ÇA MARCHE (1-2-3-4 PROCESS)                       */}
      {/* ============================================================ */}
      <section id="comment-ca-marche" className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[12px] font-extrabold uppercase tracking-widest text-[#10B981] mb-2 block">
              Simplicité absolue
            </span>
            <h2 className="text-[30px] sm:text-[38px] font-black text-[#0F172A] tracking-tight leading-tight">
              Comment fonctionne Ticket+ ?
            </h2>
            <p className="text-[15px] text-slate-600 mt-3">
              De votre smartphone au siège de votre bus climatisé, en seulement 4 étapes rapides.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            
            {/* Step 1 */}
            <div className="text-center md:text-left relative space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-black text-[18px] flex items-center justify-center shadow-md mb-4 mx-auto md:mx-0">
                1
              </div>
              <h3 className="text-[16px] font-extrabold text-[#0F172A]">Recherchez votre trajet</h3>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                Indiquez votre ville de départ (ex: Cotonou), votre destination (ex: Parakou) et la date souhaitée.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center md:text-left relative space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#10B981] text-white font-black text-[18px] flex items-center justify-center shadow-md mb-4 mx-auto md:mx-0">
                2
              </div>
              <h3 className="text-[16px] font-extrabold text-[#0F172A]">Comparez les flottes</h3>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                Visualisez tous les départs, les tarifs officiels, le standing du bus (WiFi, climatisation) et vos places libres.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center md:text-left relative space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-black text-[18px] flex items-center justify-center shadow-md mb-4 mx-auto md:mx-0">
                3
              </div>
              <h3 className="text-[16px] font-extrabold text-[#0F172A]">Payez par Mobile Money</h3>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                Validez votre commande en toute sécurité par MTN MoMo, Moov Money ou Carte sans frais supplémentaires.
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center md:text-left relative space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#10B981] text-white font-black text-[18px] flex items-center justify-center shadow-md mb-4 mx-auto md:mx-0">
                4
              </div>
              <h3 className="text-[16px] font-extrabold text-[#0F172A]">Embarquez avec le QR Code</h3>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                Présentez votre QR Code reçu sur SMS et WhatsApp lors du contrôle en gare et profitez d&apos;un voyage reposant.
              </p>
            </div>

          </div>

          {/* Central Action */}
          <div className="mt-14 text-center">
            <Link
              href={`/${locale}/login`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#0F172A] hover:bg-slate-800 text-white text-[14px] font-bold shadow-md transition-all active:scale-98"
            >
              <span>Commencer ma première réservation</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. CHIFFRES CLÉS & STATISTIQUES AU BÉNIN                    */}
      {/* ============================================================ */}
      <section className="py-16 bg-gradient-to-r from-[#0F172A] via-slate-900 to-[#0F172A] text-white">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            
            <div className="space-y-1">
              <div className="text-[36px] sm:text-[44px] font-black text-[#10B981] tracking-tight">
                +50 000
              </div>
              <div className="text-[14px] font-bold text-white">Billets émis en ligne</div>
              <p className="text-[12px] text-slate-400">Voyageurs transportés avec succès</p>
            </div>

            <div className="space-y-1">
              <div className="text-[36px] sm:text-[44px] font-black text-[#10B981] tracking-tight">
                99.4%
              </div>
              <div className="text-[14px] font-bold text-white">Ponctualité respectée</div>
              <p className="text-[12px] text-slate-400">Départs à heure fixe garantie</p>
            </div>

            <div className="space-y-1">
              <div className="text-[36px] sm:text-[44px] font-black text-[#10B981] tracking-tight">
                4 Flottes
              </div>
              <div className="text-[14px] font-bold text-white">Partenaires officiels</div>
              <p className="text-[12px] text-slate-400">Confort, Baobab, ATT, STM</p>
            </div>

            <div className="space-y-1">
              <div className="text-[36px] sm:text-[44px] font-black text-[#10B981] tracking-tight">
                0 Min
              </div>
              <div className="text-[14px] font-bold text-white">Attente au guichet</div>
              <p className="text-[12px] text-slate-400">Réservation directe sans file</p>
            </div>

          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. AVIS CLIENTS & TÉMOIGNAGES (UPWORK-STYLE REVIEWS)          */}
      {/* ============================================================ */}
      <section id="avis" className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <span className="text-[12px] font-extrabold uppercase tracking-widest text-[#10B981] mb-2 block">
                Témoignages authentiques
              </span>
              <h2 className="text-[30px] sm:text-[38px] font-black text-[#0F172A] tracking-tight leading-tight">
                Ce que nos voyageurs disent de Ticket+
              </h2>
              <p className="text-[15px] text-slate-600 mt-2">
                Découvrez les retours d&apos;expérience de personnes qui voyagent chaque semaine au Bénin.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl shrink-0">
              <div className="flex text-amber-500 text-[16px]">★★★★★</div>
              <span className="text-[13px] font-bold text-slate-800">4.9 / 5 sur Google &amp; Réseaux</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {REVIEWS.map((rev) => (
              <div
                key={rev.id}
                className="bg-slate-50/70 rounded-3xl p-6 border border-slate-200/80 flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition-all"
              >
                <div>
                  {/* Rating + Route */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex text-amber-500 text-[14px]">
                      {'★'.repeat(rev.rating)}
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">{rev.date}</span>
                  </div>

                  <p className="text-[13px] text-slate-700 leading-relaxed italic mb-4">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/60">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[18px] shadow-xs">
                      {rev.avatar}
                    </div>
                    <div>
                      <h4 className="text-[13px] font-extrabold text-[#0F172A] leading-tight">{rev.name}</h4>
                      <p className="text-[11px] text-slate-500">{rev.role} • {rev.city}</p>
                    </div>
                  </div>

                  <div className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-bold text-emerald-800 flex items-center justify-between">
                    <span>{rev.route}</span>
                    <span className="text-slate-400">{rev.company}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. ESPACE TRANSPORTEURS / COMPAGNIES (UPWORK ENTERPRISE STYLE)*/}
      {/* ============================================================ */}
      <section className="py-16 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/80 p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-10">
            
            <div className="space-y-4 max-w-2xl text-left">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[11px] font-extrabold uppercase tracking-widest inline-block">
                Espace Partenaires &amp; Transporteurs
              </span>
              <h2 className="text-[28px] sm:text-[36px] font-black tracking-tight leading-tight">
                Vous dirigez une compagnie de transport au Bénin ?
              </h2>
              <p className="text-[15px] text-slate-300 leading-relaxed">
                Rejoignez le réseau Ticket+ pour digitaliser vos ventes, maximiser le taux de remplissage de vos autocars et éliminer les fraudes de billetterie grâce à notre suite logicielle professionnelle (gestion des bus, horaires, scan des billets en gare).
              </p>

              <div className="pt-2 flex flex-wrap gap-4 text-[12px] font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
                  Dashboard flotte en temps réel
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
                  Scan embarqué par smartphone
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-emerald-400 text-[18px]">check_circle</span>
                  Versement garanti des recettes
                </span>
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto">
              <Link
                href={`/${locale}/login?role=partner`}
                className="px-8 py-4 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white font-extrabold text-[14px] transition-all text-center shadow-lg shadow-emerald-500/25 active:scale-98"
              >
                Accéder au Portail Compagnie
              </Link>
              <a
                href="https://wa.me/2290154658907"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-[13px] transition-all text-center border border-white/20 active:scale-98"
              >
                Devenir Partenaire Officiel
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. FAQ INTERACTIVE (ACCORDÉON FLUIDE)                         */}
      {/* ============================================================ */}
      <section id="faq" className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-14">
            <span className="text-[12px] font-extrabold uppercase tracking-widest text-[#10B981] mb-2 block">
              Foire Aux Questions
            </span>
            <h2 className="text-[30px] sm:text-[38px] font-black text-[#0F172A] tracking-tight leading-tight">
              Tout ce que vous devez savoir avant de partir
            </h2>
            <p className="text-[15px] text-slate-600 mt-2">
              Une question ? Voici les réponses aux interrogations les plus fréquentes des voyageurs.
            </p>
          </div>

          <div className="space-y-3.5">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isOpen
                      ? 'border-emerald-300 bg-emerald-50/20 shadow-sm'
                      : 'border-slate-200/90 bg-slate-50/50 hover:border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 select-none outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="text-[15px] font-bold text-[#0F172A] leading-snug">
                      {item.question}
                    </span>
                    <span
                      className={`material-symbols-outlined text-[22px] transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      expand_more
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-[14px] text-slate-600 leading-relaxed border-t border-emerald-100/60 pt-3">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 9. BANNIÈRE CTA FINALE (HAUTE CONVERSION)                    */}
      {/* ============================================================ */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-100">
        <div className="max-w-[1140px] mx-auto px-4 sm:px-6 text-center">
          
          <div className="bg-[#0F172A] rounded-3xl p-10 sm:p-14 text-white shadow-2xl relative overflow-hidden">
            
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-extrabold uppercase tracking-widest inline-block border border-emerald-500/30">
                Rejoignez la révolution du voyage
              </span>

              <h2 className="text-[32px] sm:text-[42px] font-black tracking-tight leading-tight">
                Prêt à voyager sans stress partout au Bénin ?
              </h2>

              <p className="text-[16px] text-slate-300 leading-relaxed">
                Créez votre compte en 30 secondes ou connectez-vous pour choisir votre trajet, votre compagnie et votre place préférée.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href={`/${locale}/login`}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#10B981] hover:bg-[#059669] text-white text-[15px] font-extrabold shadow-lg shadow-emerald-500/30 transition-all text-center flex items-center justify-center gap-2 active:scale-98"
                >
                  <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
                  <span>Créer un compte / Se connecter</span>
                </Link>

                <a
                  href="https://wa.me/2290154658907"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-[14px] font-bold border border-white/20 transition-all text-center flex items-center justify-center gap-2 active:scale-98"
                >
                  <span className="material-symbols-outlined text-[20px] text-emerald-400">chat</span>
                  <span>Assistance WhatsApp (24h/24)</span>
                </a>
              </div>

              <div className="pt-4 text-[12px] text-slate-400 font-medium">
                Aucune carte bancaire requise • Inscription gratuite par numéro de téléphone
              </div>

            </div>

          </div>

        </div>
      </section>

    </div>
  );
}

