'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export default function ConfidentialitePage() {
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
          <span className="text-slate-800 font-semibold">Politique de Confidentialité</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[11px] font-bold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Protection des Données Personnelles • APDP Bénin
          </div>
          <h1 className="text-[28px] sm:text-[34px] font-black text-slate-900 tracking-tight leading-tight">
            Politique de Confidentialité
          </h1>
          <p className="text-slate-600 text-[14px] mt-2 leading-relaxed">
            Chez <strong>Ticket+ Bénin</strong>, la protection de votre vie privée et de vos données personnelles est une priorité absolue. Cette politique détaille de manière transparente comment nous collectons, traitons et protégeons vos informations.
          </p>
          <div className="text-[12px] text-slate-400 mt-4 flex items-center gap-4">
            <span>Dernière révision : 16 Octobre 2026</span>
            <span>•</span>
            <span>Conforme au Code du Numérique du Bénin</span>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm space-y-10 text-slate-700 text-[14px] leading-relaxed">
          
          {/* Section 1 : Responsable du Traitement */}
          <section className="space-y-3">
            <h2 className="text-[18px] font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 text-[14px] font-black">
                1
              </span>
              Responsable du Traitement des Données
            </h2>
            <p>
              Le responsable du traitement de vos données personnelles est la société <strong>TICKET+ TECHNOLOGIES BÉNIN SARL</strong>, sise à Cotonou, Immeuble Le Phénix, Boulevard Saint-Michel, République du Bénin.
            </p>
            <p>
              Pour toute question ou demande relative à vos données personnelles, vous pouvez joindre notre Délégué à la Protection des Données (DPO) par courrier électronique à : <a href="mailto:privacy@ticketplus.bj" className="text-emerald-600 font-semibold hover:underline">privacy@ticketplus.bj</a>.
            </p>
          </section>

          {/* Section 2 : Données Collectées */}
          <section className="space-y-3">
            <h2 className="text-[18px] font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 text-[14px] font-black">
                2
              </span>
              Données Personnelles que Nous Collectons
            </h2>
            <p>
              Dans le cadre de l&apos;utilisation de nos services de billetterie, nous sommes amenés à collecter les catégories de données suivantes :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
              <div className="bg-slate-50 border border-slate-200/70 p-4 rounded-2xl">
                <p className="font-bold text-slate-900">Données d&apos;identité du voyageur</p>
                <p className="text-slate-600 mt-1">Nom, prénom(s), type et numéro de pièce d&apos;identité (CNI, Passeport, CIP) requis légalement pour l&apos;embarquement interurbain.</p>
              </div>
              <div className="bg-slate-50 border border-slate-200/70 p-4 rounded-2xl">
                <p className="font-bold text-slate-900">Coordonnées de communication</p>
                <p className="text-slate-600 mt-1">Numéro de téléphone mobile (SMS, WhatsApp) pour l&apos;envoi du e-billet et des alertes de départ, adresse email facultative.</p>
              </div>
              <div className="bg-slate-50 border border-slate-200/70 p-4 rounded-2xl">
                <p className="font-bold text-slate-900">Données de réservation</p>
                <p className="text-slate-600 mt-1">Ligne de voyage, gare de départ, destination, compagnie choisie, siège assigné, date et heure du voyage, historique des billets.</p>
              </div>
              <div className="bg-slate-50 border border-slate-200/70 p-4 rounded-2xl">
                <p className="font-bold text-slate-900">Données de paiement sécurisé</p>
                <p className="text-slate-600 mt-1">Référence de transaction, numéro Mobile Money masqué, montant, statut. <em>Ticket+ ne stocke aucun code secret Mobile Money ni cryptogramme bancaire.</em></p>
              </div>
            </div>
          </section>

          {/* Section 3 : Finalités du Traitement */}
          <section className="space-y-3">
            <h2 className="text-[18px] font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 text-[14px] font-black">
                3
              </span>
              Finalités et Bases Légales du Traitement
            </h2>
            <p>
              Vos données ne sont collectées et traitées que pour des finalités précises, légitimes et proportionnées :
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[13px]">
              <li>
                <strong>Exécution du contrat de transport :</strong> Émission du titre de transport électronique, assignation de siège, transmission de la liste des passagers à la compagnie de bus partenaire pour l&apos;embarquement.
              </li>
              <li>
                <strong>Notifications de voyage :</strong> Envoi instantané du billet par SMS/WhatsApp, alertes de rappel de départ (H-2) et informations éventuelles sur des modifications d&apos;horaires.
              </li>
              <li>
                <strong>Gestion du service client :</strong> Traitement des demandes d&apos;assistance, annulations, réclamations et remboursements autorisés.
              </li>
              <li>
                <strong>Obligations légales et réglementaires :</strong> Tenue des registres de passagers conformément aux exigences du Ministère des Transports et des services de sécurité de l&apos;État béninois.
              </li>
              <li>
                <strong>Sécurité et lutte contre la fraude :</strong> Prévention des transactions suspectes et sécurisation des accès aux comptes utilisateurs.
              </li>
            </ul>
          </section>

          {/* Section 4 : Destinataires et Partage des Données */}
          <section className="space-y-3">
            <h2 className="text-[18px] font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 text-[14px] font-black">
                4
              </span>
              Destinataires et Partage Limité des Données
            </h2>
            <p>
              <strong>Ticket+ ne vend, ne loue, ni ne cède jamais vos données personnelles à des fins publicitaires ou commerciales tierces.</strong> Vos données sont partagées uniquement avec :
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[13px]">
              <li><strong>La compagnie de transport concernée :</strong> Transmission exclusive des nom, prénom, siège et numéro de billet pour permettre le contrôle à bord et l&apos;embarquement.</li>
              <li><strong>Les prestataires de paiement agréés :</strong> Opérateurs de téléphonie et passerelles bancaires (MTN, Moov, banques partenaires) pour la réalisation des règlements.</li>
              <li><strong>Les autorités administratives ou judiciaires compétentes :</strong> Uniquement sur réquisition officielle formulée dans le cadre des lois béninoises en vigueur.</li>
            </ul>
          </section>

          {/* Section 5 : Sécurité et Confidentialité */}
          <section className="space-y-3">
            <h2 className="text-[18px] font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 text-[14px] font-black">
                5
              </span>
              Sécurité et Chiffrement des Données
            </h2>
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles robustes pour garantir la sécurité, l&apos;intégrité et la confidentialité de vos données :
            </p>
            <div className="bg-slate-50 border border-slate-200/70 p-4 rounded-2xl space-y-2 text-[13px]">
              <p>• <strong>Chiffrement de bout en bout :</strong> Tous les échanges sont chiffrés en transit avec le protocole HTTPS / TLS 1.3.</p>
              <p>• <strong>QR Code infalsifiable :</strong> Chaque billet électronique intègre une signature cryptographique vérifiée lors du scan par les contrôleurs en gare.</p>
              <p>• <strong>Isolation stricte des données :</strong> Les comptes utilisateurs, billets et notifications sont isolés et protégés par des règles de sécurité (Row Level Security Supabase).</p>
              <p>• <strong>Contrôle des accès :</strong> Seuls les agents habilités de notre support technique peuvent accéder aux données d&apos;une commande pour résoudre une réclamation.</p>
            </div>
          </section>

          {/* Section 6 : Durée de Conservation */}
          <section className="space-y-3">
            <h2 className="text-[18px] font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 text-[14px] font-black">
                6
              </span>
              Durée de Conservation des Données
            </h2>
            <p className="text-[13px]">
              Les données de compte restent actives tant que l&apos;utilisateur conserve son compte. Les données de réservations et billets sont conservées pour une durée de <strong>3 ans</strong> à compter de la date de voyage pour des impératifs comptables, fiscaux et de preuve juridique, après quoi elles sont anonymisées ou purgées de nos serveurs.
            </p>
          </section>

          {/* Section 7 : Vos Droits et Contact APDP */}
          <section className="space-y-3">
            <h2 className="text-[18px] font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 text-[14px] font-black">
                7
              </span>
              Vos Droits et Exercice (APDP Bénin)
            </h2>
            <p>
              Conformément à la Loi N° 2017-20 du 20 avril 2018 portant Code du Numérique en République du Bénin, vous disposez des droits suivants sur vos données personnelles :
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-[13px]">
              <li><strong>Droit d&apos;accès :</strong> Obtenir confirmation que des données vous concernant sont traitées et en recevoir une copie.</li>
              <li><strong>Droit de rectification :</strong> Mettre à jour ou corriger vos informations directement dans votre espace « Profil » ou via notre support.</li>
              <li><strong>Droit à l&apos;effacement :</strong> Demander la suppression de vos données personnelles sous réserve des obligations légales de conservation.</li>
              <li><strong>Droit d&apos;opposition :</strong> Vous opposer à tout moment à la réception de communications de service non essentielles.</li>
            </ul>
            <div className="bg-slate-50 border border-slate-200/70 p-4 rounded-2xl mt-3 text-[13px]">
              <p>
                Pour exercer l&apos;un de ces droits, adressez votre demande accompagnée d&apos;un justificatif d&apos;identité par courriel à : <a href="mailto:privacy@ticketplus.bj" className="text-emerald-600 font-semibold hover:underline">privacy@ticketplus.bj</a> ou par WhatsApp au <span className="font-bold text-slate-800">+229 01 54 65 89 07</span>.
              </p>
              <p className="text-slate-500 text-[12px] mt-2">
                Vous avez également la possibilité de saisir l&apos;Autorité de Protection des Données Personnelles du Bénin (APDP) : <em>www.apdp.bj</em>.
              </p>
            </div>
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
