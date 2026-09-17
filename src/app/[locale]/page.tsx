import { SearchForm } from '../../components/traveler/SearchForm';
import { LineCard } from '../../components/traveler/LineCard';
import { ReassuranceSection } from '../../components/traveler/ReassuranceSection';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      {/* Announcement Bar */}
      <div className="w-full flex justify-center pt-4 px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm border border-[#E2E8F0] text-[12px] text-[#64748B]">
          <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0"></span>
          <span>
            Phase de lancement : <strong className="text-[#0F172A]">Confort Lines</strong> en exclusivité • Nouvelles compagnies intégrées progressivement
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="w-full pb-8 pt-6 px-4 sm:px-6">
        <div className="max-w-[1140px] mx-auto flex flex-col items-center text-center">
          <h1 className="text-[28px] sm:text-[36px] md:text-[44px] font-extrabold text-[#0F172A] tracking-tight max-w-3xl leading-tight">
            Comparez et réservez vos trajets en bus au Bénin.
          </h1>

          <p className="text-[14px] sm:text-[16px] text-[#64748B] max-w-2xl mt-4 mb-8 leading-relaxed">
            Trouvez les meilleurs départs, comparez les tarifs officiels et recevez votre billet garanti par SMS et WhatsApp en toute sérénité.
          </p>

          <SearchForm />

          {/* Active company info */}
          <div className="mt-5 inline-flex items-center gap-2 text-[12px] text-[#64748B] bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-[#E2E8F0]">
            <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
            <span>
              Compagnie active actuellement : <strong className="text-[#0F172A]">Confort Lines</strong> flotte climatisée VIP • Autres transporteurs en cours d&apos;intégration
            </span>
          </div>
        </div>
      </section>

      {/* Bus Banner Image */}
      <section className="px-4 sm:px-6 pb-8">
        <div className="max-w-[1140px] mx-auto">
          <div className="relative rounded-2xl overflow-hidden bg-[#0F172A] h-[200px] sm:h-[260px] md:h-[300px] flex items-end shadow-md border border-[#E2E8F0]">
            {/* Bus image background */}
            <div className="absolute inset-0 bg-[url('/images/bus-banner.jpg')] bg-cover bg-center opacity-90"></div>
            
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/95 via-[#0F172A]/30 to-transparent"></div>
            
            <div className="relative z-10 p-5 sm:p-8">
              <span className="text-[10px] uppercase tracking-widest text-[#10B981] font-bold mb-2 block drop-shadow-sm">
                Partenaire Exclusif de Lancement • Bénin
              </span>
              <h2 className="text-white text-[18px] sm:text-[22px] font-bold max-w-lg leading-snug drop-shadow-md">
                Voyagez à bord de la flotte Confort Lines certifiée : sécurité, ponctualité et confort climatisé garanti.
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* Routes Section */}
      <section className="px-4 sm:px-6 pb-8">
        <div className="max-w-[1140px] mx-auto">
          <div className="mb-6">
            <span className="text-[11px] uppercase tracking-widest text-[#10B981] font-bold">Réseau Express</span>
            <h2 className="text-[24px] sm:text-[28px] font-extrabold text-[#0F172A] tracking-tight mt-1">
              Départs & Lignes disponibles sur Ticket+
            </h2>
            <p className="text-[13px] text-[#64748B] mt-1">
              Actuellement opéré avec l&apos;excellence de notre premier transporteur partenaire officiel <strong className="text-[#0F172A]">Confort Lines</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <LineCard
              from="Cotonou"
              to="Parakou"
              price="6 500"
              details="Bus Climatisé & WiFi Haute Vitesse"
              duration="6h30"
              tag="4 départs/jour"
            />
            <LineCard
              from="Cotonou"
              to="Natitingou"
              price="9 000"
              details="Confort VIP & Collation Offerte"
              duration="9h45"
              tag="9h45 direct"
            />
            <LineCard
              from="Cotonou"
              to="Bohicon"
              price="3 500"
              details="Navette Express Directe"
              duration="2h15"
              tag="Toutes les 2h"
            />
          </div>
        </div>
      </section>

      {/* Coming Soon Partners */}
      <section className="px-4 sm:px-6 pb-8">
        <div className="max-w-[1140px] mx-auto">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px] text-[#0F172A]">directions_bus</span>
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#0F172A] flex items-center gap-2">
                    Bientôt disponibles sur Ticket+
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] font-semibold border border-[#10B981]/20">En intégration</span>
                  </h3>
                  <p className="text-[12px] text-[#64748B]">
                    Intégration progressive des autres compagnies majeures du Bénin et de la sous-région.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {['Baobab Express', 'CSTN Voyageurs', 'ATT Transports'].map((name) => (
                <span key={name} className="px-3 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[12px] text-[#94A3B8] font-medium">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reassurance + CTA */}
      <ReassuranceSection />
    </div>
  );
}
