import { SearchForm } from '../../components/traveler/SearchForm';
import { LineCard } from '../../components/traveler/LineCard';
import { ReassuranceSection } from '../../components/traveler/ReassuranceSection';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="w-full pb-space-lg pt-space-md px-gutter">
        <div className="max-w-[1140px] mx-auto flex flex-col items-center text-center">
          <h1 className="font-display-md text-display-md md:font-display-lg md:text-display-lg font-extrabold text-on-surface tracking-tight max-w-3xl leading-tight">
            Comparez et réservez vos trajets en bus au Bénin.
          </h1>

          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-4 mb-8 leading-relaxed">
            Trouvez les meilleurs départs, comparez les tarifs officiels et recevez votre billet garanti par SMS et WhatsApp en toute sérénité.
          </p>

          <SearchForm />


        </div>
      </section>

      {/* Bus Banner Image */}
      <section className="px-gutter pb-space-xl">
        <div className="max-w-[1140px] mx-auto">
          <div className="relative rounded-2xl overflow-hidden bg-primary h-[200px] sm:h-[260px] md:h-[300px] flex items-end shadow-md border border-outline-variant">
            {/* Bus image background */}
            <div className="absolute inset-0 bg-[url('/images/bus-banner.jpg')] bg-cover bg-center opacity-90"></div>
            
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/30 to-transparent"></div>
            
            <div className="relative z-10 p-space-md sm:p-space-lg">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold mb-2 block drop-shadow-sm">
                Partenaires Officiels • Bénin
              </span>
              <h2 className="text-on-primary font-title-lg text-title-lg sm:text-[22px] font-bold max-w-lg leading-snug drop-shadow-md">
                Voyagez avec l'excellence de nos compagnies (Confort Lines, Baobab Express, ATT, STM) : sécurité et confort garantis.
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* Routes Section */}
      <section className="px-gutter pb-space-xl">
        <div className="max-w-[1140px] mx-auto">
          <div className="mb-space-lg">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">Réseau Express</span>
            <h2 className="font-display-sm text-display-sm sm:font-display-md sm:text-display-md font-extrabold text-on-surface tracking-tight mt-1">
              Départs & Lignes disponibles sur Ticket+
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Actuellement opéré par <strong className="text-on-surface">Confort Lines, Baobab Express, ATT Transports et STM Voyageurs</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-md">
            <LineCard
              from="Cotonou"
              to="Parakou"
              price="dès 5 200"
              details="4 compagnies • Bus Climatisé & WiFi"
              duration="6h30"
              tag="11 départs/jour"
            />
            <LineCard
              from="Cotonou"
              to="Natitingou"
              price="dès 7 200"
              details="Confort VIP & Collation Offerte"
              duration="9h45"
              tag="5 départs/jour"
            />
            <LineCard
              from="Cotonou"
              to="Bohicon"
              price="dès 2 800"
              details="Navette Express Directe"
              duration="2h15"
              tag="18 départs/jour"
            />
          </div>
        </div>
      </section>



      {/* Reassurance + CTA */}
      <ReassuranceSection />
    </div>
  );
}
