import React from 'react';
import { SearchForm } from '../../../components/traveler/SearchForm';
import { ReassuranceSection } from '../../../components/traveler/ReassuranceSection';

export default function SearchPage() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-surface pt-20">
      
      {/* Header section with map background or color */}
      <section className="w-full pb-8 pt-6 px-4 sm:px-6 bg-surface-container-lowest">
        <div className="max-w-[1140px] mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-container/30 text-[12px] font-semibold text-secondary mb-4 border border-secondary-container">
            <span className="material-symbols-outlined text-[16px]">location_searching</span>
            <span>Recherche avec géolocalisation</span>
          </div>
          <h1 className="text-[28px] sm:text-[36px] font-extrabold text-on-surface tracking-tight max-w-2xl leading-tight">
            Trouvez les départs les plus proches de vous
          </h1>
          <p className="text-[14px] sm:text-[16px] text-on-surface-variant max-w-xl mt-4 mb-8 leading-relaxed">
            Activez la géolocalisation pour afficher les gares à proximité et trouver rapidement le trajet idéal avec nos partenaires.
          </p>

          <div className="w-full flex justify-center mb-8">
            <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-secondary text-on-secondary font-label-lg text-label-lg font-bold shadow-md hover:bg-on-secondary-container transition-colors">
              <span className="material-symbols-outlined text-[20px]">my_location</span>
              <span>Me localiser</span>
            </button>
          </div>

          <SearchForm />
        </div>
      </section>

      {/* Info Section */}
      <section className="px-4 sm:px-6 py-12 bg-surface">
        <div className="max-w-[1140px] mx-auto">
          <div className="bg-surface-container-low rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[32px] text-on-surface">directions_bus</span>
            </div>
            <div>
              <h2 className="font-title-lg text-title-lg font-bold text-on-surface mb-2">Comment ça marche ?</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                En activant la localisation, nous calculons automatiquement la distance entre votre position et toutes les gares de nos compagnies partenaires (Confort Lines, etc.). Les résultats de recherche seront triés pour vous proposer d'abord les départs depuis la gare la plus proche de chez vous.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ReassuranceSection />
    </div>
  );
}
