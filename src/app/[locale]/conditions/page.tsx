'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export default function ConditionsGeneralesPage() {
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
          <span className="text-slate-800 font-semibold">Conditions Générales</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[11px] font-bold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Cadre Contractuel Voyageurs &amp; Billetterie
          </div>
          <h1 className="text-[28px] sm:text-[34px] font-black text-slate-900 tracking-tight leading-tight">
            Conditions Générales d&apos;Utilisation et de Vente (CGU / CGV)
          </h1>
          <p className="text-slate-600 text-[14px] mt-2 leading-relaxed">
            Les présentes Conditions Générales régissent l&apos;accès, l&apos;utilisation de la plateforme <strong>Ticket+ Bénin</strong>, ainsi que les modalités de réservation et d&apos;achat de billets de transport interurbain en autocar.
          </p>
          <div className="text-[12px] text-slate-400 mt-4 flex items-center gap-4">
            <span>Date d&apos;entrée en vigueur : 16 Octobre 2026</span>
            <span>•</span>
            <span>Applicable à tout achat de billet</span>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm space-y-10 text-slate-700 text-[14px] leading-relaxed">
          
          {/* Article 1 : Objet et Champ d'Application */}
          <section className="space-y-3">
            <h2 className="text-[18px] font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 text-[14px] font-black">
                1
              </span>
              Objet et Champ d&apos;Application
            </h2>
            <p>
              Les présentes Conditions Générales définissent les droits et obligations réciproques entre <strong>TICKET+ TECHNOLOGIES BÉNIN SARL</strong> (opérant sous la marque Ticket+) et tout utilisateur ou voyageur (ci-après « le Client » ou « le Voyageur ») effectuant une recherche, une réservation ou un achat de billet de transport routier sur le site web ou l&apos;application web Ticket+.
            </p>
            <p>
              Toute confirmation de réservation ou paiement sur Ticket+ implique l&apos;acceptation pleine, entière et sans réserve des présentes conditions générales.
            </p>
          </section>

          {/* Article 2 : Réservation et Émission du E-Billet */}
          <section className="space-y-3">
            <h2 className="text-[18px] font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 text-[14px] font-black">
                2
              </span>
              Modalités de Réservation et Émission du Billet Électronique
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-[13px]">
              <li>
                <strong>Sélection du trajet :</strong> Le Client choisit sa ville de départ, sa destination, la date de voyage, la compagnie partenaire et son siège dans l&apos;autocar.
              </li>
              <li>
                <strong>Exactitude des informations :</strong> Le Client s&apos;engage à renseigner avec exactitude l&apos;identité du passager principal (telle qu&apos;inscrite sur sa pièce d&apos;identité officielle : CNI, Passeport ou CIP) ainsi qu&apos;un numéro de téléphone valide pour les alertes SMS et WhatsApp.
              </li>
              <li>
                <strong>Confirmation immédiate :</strong> Dès validation du paiement, le billet électronique officiel est généré instantanément. Il comprend une référence unique (ex: <code>TK-BEN-XXXXXX</code>) et un <strong>QR Code sécurisé et infalsifiable</strong> d&apos;embarquement.
              </li>
              <li>
                <strong>Accessibilité :</strong> Le e-billet est consultable à tout moment dans la rubrique « Mon Billet » de la plateforme et expédié par SMS et WhatsApp au numéro renseigné.
              </li>
            </ul>
          </section>

          {/* Article 3 : Tarifs et Modalités de Paiement */}
          <section className="space-y-3">
            <h2 className="text-[18px] font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 text-[14px] font-black">
                3
              </span>
              Prix, Frais et Modalités de Paiement Sécurisé
            </h2>
            <p>
              Les prix des billets sont indiqués en <strong>Francs CFA (XOF / FCFA)</strong> toutes taxes comprises (TTC), conformément aux grilles tarifaires officielles appliquées par chaque compagnie de transport partenaire.
            </p>
            <p>
              Ticket+ met à disposition des moyens de paiement dématérialisés 100% sécurisés :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
              <div className="bg-slate-50 border border-slate-200/70 p-4 rounded-2xl">
                <p className="font-bold text-slate-900 text-[13px]">MTN Mobile Money (MoMo)</p>
                <p className="text-[12px] text-slate-500 mt-1">Paiement direct USSD sur numéro béninois.</p>
              </div>
              <div className="bg-slate-50 border border-slate-200/70 p-4 rounded-2xl">
                <p className="font-bold text-slate-900 text-[13px]">Moov Money Bénin</p>
                <p className="text-[12px] text-slate-500 mt-1">Validation sécurisée par code de confirmation OTP.</p>
              </div>
              <div className="bg-slate-50 border border-slate-200/70 p-4 rounded-2xl">
                <p className="font-bold text-slate-900 text-[13px]">Cartes Bancaires Visa &amp; Mastercard</p>
                <p className="text-[12px] text-slate-500 mt-1">Protocole bancaire sécurisé 3D-Secure.</p>
              </div>
            </div>
            <p className="text-[13px]">
              La transaction n&apos;est définitivement enregistrée qu&apos;après débit effectif et validation par l&apos;opérateur financier émetteur.
            </p>
          </section>

          {/* Article 4 : Annulation, Modification et Remboursement */}
          <section className="space-y-3">
            <h2 className="text-[18px] font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 text-[14px] font-black">
                4
              </span>
              Politique d&apos;Annulation, Remboursement et Frais
            </h2>
            <p>
              Soucieux de la flexibilité de vos déplacements, Ticket+ applique une politique d&apos;annulation claire et avantageuse :
            </p>
            <div className="bg-emerald-50/60 border border-emerald-200/60 p-5 rounded-2xl space-y-2 text-[13px]">
              <p className="font-bold text-emerald-900">
                Annulation éligible jusqu&apos;à 48 heures (2 jours) avant le départ :
              </p>
              <p className="text-emerald-800">
                Le voyageur peut annuler son billet directement depuis son espace « Mon Billet ». Des frais de gestion forfaitaires de <strong>300 FCFA</strong> sont appliqués. Le solde restant (prix du billet moins 300 FCFA) fait l&apos;objet d&apos;un remboursement validé sur le compte ou par virement Mobile Money sous 24 à 48 heures ouvrées.
              </p>
              <p className="text-slate-600 text-[12px] mt-2">
                * Moins de 48 heures avant l&apos;heure officielle de départ de l&apos;autocar ou après le départ effectif, les billets ne sont ni annulables ni remboursables, sauf accord exceptionnel de la compagnie de transport.
              </p>
            </div>
          </section>

          {/* Article 5 : Embarquement et Règles de Transport */}
          <section className="space-y-3">
            <h2 className="text-[18px] font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 text-[14px] font-black">
                5
              </span>
              Conditions d&apos;Embarquement et Respect des Horaires
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-[13px]">
              <li>
                <strong>Présentation à la gare :</strong> Le passager doit se présenter à la gare routière au moins <strong>30 minutes avant l&apos;heure de départ indiquée</strong> sur son e-billet afin de procéder à l&apos;enregistrement et à la pesée des bagages.
              </li>
              <li>
                <strong>Documents obligatoires :</strong> Pour embarquer, le voyageur doit obligatoirement présenter son <strong>e-billet avec QR Code</strong> (sur smartphone ou imprimé) ainsi qu&apos;une <strong>pièce d&apos;identité officielle en cours de validité</strong> correspondant au nom inscrit sur le billet.
              </li>
              <li>
                <strong>Billet nominatif :</strong> Tout billet émis est strictement nominatif et personnel. Il ne peut être cédé à un tiers sans modification préalable validée auprès de notre support client.
              </li>
              <li>
                <strong>Non-présentation (No-Show) :</strong> En cas de retard du passager à l&apos;heure de départ de l&apos;autocar, le billet sera considéré comme consommé et ne donnera lieu à aucun remboursement.
              </li>
            </ul>
          </section>

          {/* Article 6 : Bagages et Objets Interdits */}
          <section className="space-y-3">
            <h2 className="text-[18px] font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 text-[14px] font-black">
                6
              </span>
              Franchise Bagages et Marchandises Interdites
            </h2>
            <p>
              Chaque billet standard inclut une franchise d&apos;un bagage en soute (jusqu&apos;à 25 kg) et d&apos;un sac à dos cabine. Des options bagages additionnelles (+20 kg pour 1 000 FCFA) peuvent être souscrites lors de la réservation.
            </p>
            <p className="text-[13px]">
              Sont formellement interdits à bord et en soute : les matières explosives, inflammables, armes, drogues illicites, substances toxiques ou corrosives, et toute marchandise prohibée par la législation douanière et pénale de la République du Bénin.
            </p>
          </section>

          {/* Article 7 : Responsabilité */}
          <section className="space-y-3">
            <h2 className="text-[18px] font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 text-[14px] font-black">
                7
              </span>
              Responsabilité et Force Majeure
            </h2>
            <p>
              Ticket+ agit en qualité de mandataire technique et répond de la délivrance des billets électroniques et de la sécurité des transactions en ligne. La réalisation du trajet, la ponctualité, l&apos;état des véhicules et la sécurité matérielle pendant le transport incombent exclusivement à la compagnie de transport effectuant le voyage.
            </p>
            <p className="text-[13px]">
              Ni Ticket+ ni la compagnie de transport ne sauraient être tenus pour responsables en cas de retard ou d&apos;inexécution résultant d&apos;un cas de force majeure (intempéries exceptionnelles, barrages routiers imprévus, pannes majeures indépendantes, décisions des autorités gouvernementales).
            </p>
          </section>

          {/* Article 8 : Réclamations et Service Client */}
          <section className="space-y-3">
            <h2 className="text-[18px] font-bold text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 text-[14px] font-black">
                8
              </span>
              Service Client, Réclamations et Médiation
            </h2>
            <p>
              Pour toute question ou réclamation relative à une commande ou à un trajet, le Client peut joindre notre service client :
            </p>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 text-[13px] space-y-1">
              <p>• <strong>Assistance WhatsApp &amp; Téléphonique :</strong> +229 01 54 65 89 07</p>
              <p>• <strong>Email Support Billetterie :</strong> <a href="mailto:support@ticketplus.bj" className="text-emerald-600 font-semibold hover:underline">support@ticketplus.bj</a></p>
              <p>• <strong>Formulaire en ligne :</strong> Rubrique Contact du site</p>
            </div>
            <p className="text-[13px]">
              Toute réclamation doit être transmise sous un délai de 7 jours ouvrés suivant la date initiale du voyage avec la référence du billet concerné.
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
