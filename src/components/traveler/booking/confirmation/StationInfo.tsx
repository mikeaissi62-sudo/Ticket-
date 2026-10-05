import React from 'react';

const getStationDetails = (city: string) => {
  const stations: Record<string, { name: string; address: string }> = {
    'Cotonou': { name: 'Gare Étoile Rouge', address: "Carrefour de l'Étoile Rouge, Agontinkon, Cotonou, Bénin" },
    'Parakou': { name: 'Terminus Confort Lines', address: 'Boulevard Principal, Parakou, Bénin' },
    'Bohicon': { name: 'Gare Routière', address: 'Centre-ville, Bohicon, Bénin' },
    'Natitingou': { name: 'Agence Principale', address: 'Route Nationale, Natitingou, Bénin' },
    'Djougou': { name: 'Gare Centrale', address: 'Centre, Djougou, Bénin' },
    'Tanguiéta': { name: 'Agence Confort Lines', address: 'Route Principale, Tanguiéta, Bénin' },
    'Porto-Novo': { name: 'Gare Routière', address: 'Centre-ville, Porto-Novo, Bénin' },
    'Abomey': { name: 'Gare Routière', address: 'Centre, Abomey, Bénin' },
  };
  return stations[city] || { name: `Gare de ${city}`, address: `${city}, Bénin` };
};

export const StationInfo = ({ from }: { from: string }) => {
  const station = getStationDetails(from);

  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-lg">
      <div className="flex items-center gap-space-xs text-secondary mb-space-sm">
        <span className="material-symbols-outlined text-[20px]">pin_drop</span>
        <div className="font-title-md text-title-md font-bold text-on-surface">Gare d&apos;Embarquement</div>
      </div>
      
      <div className="mb-space-md">
        <div className="font-headline-sm text-headline-sm font-bold text-on-surface">{station.name}</div>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {station.address}
        </p>
      </div>
      
      <div 
        className="w-full h-36 rounded-lg mb-space-md overflow-hidden relative bg-surface-container-low flex items-center justify-center"
      >
        <div className="flex flex-col items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-[36px] text-secondary">map</span>
          <span className="font-label-sm text-label-sm font-semibold">{station.name} • {from}</span>
        </div>
        <div className="absolute bottom-2 right-2">
          <div className="bg-surface-container-lowest/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
            <span className="material-symbols-outlined text-error text-[18px]">location_on</span>
            <span className="font-label-sm text-label-sm font-bold text-on-surface">Guichet Confort Lines #3</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-space-sm font-body-md text-body-md">
        <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[18px]">phone_in_talk</span>
            <span className="text-on-surface">Chef de Gare {from}</span>
          </div>
          <a className="font-semibold text-secondary hover:underline" href="tel:+2290154658907">+229 01 54 65 89 07</a>
        </div>
        
        <div className="flex items-start gap-2 text-on-surface-variant text-label-sm font-label-sm">
          <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5">info</span>
          <span>L&apos;enregistrement des bagages en soute débute dès 06:15. Présentation obligatoire d&apos;une pièce d&apos;identité valide (CIP, CNI ou Passeport).</span>
        </div>
      </div>
    </div>
  );
};
