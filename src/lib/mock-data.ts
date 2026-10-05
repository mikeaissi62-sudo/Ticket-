export interface Station {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
}

export interface Company {
  id: string;
  name: string;
  subtitle: string;
  isOfficialPartner: boolean;
  logoUrl?: string;
  rating: number;
  priceModifier: number; // e.g. 1 for standard, 1.1 for 10% more
}

export interface Trip {
  id: string;
  companyId: string;
  departureStationId: string;
  arrivalStationId: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  date: string;
  features: string[];
  availableSeats: number;
  totalSeats: number;
  disabledSeats: number[];
}

export const STATIONS: Station[] = [
  { id: 'st-1', name: 'Gare Étoile Rouge', city: 'Cotonou', lat: 6.3683, lng: 2.4253 },
  { id: 'st-2', name: 'Gare Principale', city: 'Parakou', lat: 9.3372, lng: 2.6303 },
  { id: 'st-3', name: 'Gare Routière', city: 'Bohicon', lat: 7.1783, lng: 2.0667 },
  { id: 'st-4', name: 'Agence Principale', city: 'Natitingou', lat: 10.3042, lng: 1.3796 },
  { id: 'st-5', name: 'Gare Centrale', city: 'Djougou', lat: 9.7085, lng: 1.6660 },
  { id: 'st-6', name: 'Agence Partenaires', city: 'Tanguiéta', lat: 10.6206, lng: 1.2665 },
  { id: 'st-7', name: 'Gare Routière', city: 'Porto-Novo', lat: 6.4973, lng: 2.6051 }
];

export const COMPANIES: Company[] = [
  { id: 'c-1', name: 'Confort Lines', subtitle: 'Ligne VIP climatisée', isOfficialPartner: true, rating: 4.8, priceModifier: 1.0 },
  { id: 'c-2', name: 'Baobab Express', subtitle: 'Flotte premium moderne', isOfficialPartner: true, rating: 4.5, priceModifier: 0.9 },
  { id: 'c-3', name: 'ATT Transports', subtitle: 'Transport rapide et sécurisé', isOfficialPartner: true, rating: 4.2, priceModifier: 1.1 },
  { id: 'c-4', name: 'STM Voyageurs', subtitle: 'Spécialiste du Nord', isOfficialPartner: true, rating: 4.0, priceModifier: 0.8 }
];

// Helper to generate dynamic mock trips based on search parameters
export const generateMockTrips = (fromCity: string, toCity: string, date: string): Trip[] => {
  const depStation = STATIONS.find(s => s.city.toLowerCase() === fromCity.toLowerCase()) || STATIONS[0];
  const arrStation = STATIONS.find(s => s.city.toLowerCase() === toCity.toLowerCase()) || STATIONS[1];

  const basePrice = 5000 + Math.floor(Math.random() * 5000); // Random base price between 5000 and 10000

  const trips: Trip[] = [];

  // Generate 1-3 trips per company
  COMPANIES.forEach(company => {
    const numTrips = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numTrips; i++) {
      const hour = 6 + Math.floor(Math.random() * 12); // Between 6:00 and 17:00
      const minute = Math.random() > 0.5 ? '30' : '00';
      const durationHours = 2 + Math.floor(Math.random() * 5); // 2 to 6 hours
      const arrHour = hour + durationHours;

      const totalSeats = 50;
      const numDisabled = Math.floor(Math.random() * 20);
      const disabledSeats = Array.from({ length: numDisabled }, () => Math.floor(Math.random() * totalSeats) + 1);

      const featuresList = [
        ['Climatisation', 'Wi-Fi HD 4G'],
        ['Climatisation', 'Prises USB / 220V', 'Sièges Inclinables'],
        ['Wi-Fi HD 4G', 'Collation offerte'],
        ['Climatisation', 'Écran Vidéo HD', 'Bagage 25kg inclus'],
        ['Climatisation', 'Sièges Cuir VIP', 'Prises USB / 220V']
      ];
      const randomFeatures = featuresList[Math.floor(Math.random() * featuresList.length)];

      trips.push({
        id: `trip-${company.id}-${date}-${hour}${minute}-${i}`,
        companyId: company.id,
        departureStationId: depStation.id,
        arrivalStationId: arrStation.id,
        departureTime: `${hour.toString().padStart(2, '0')}:${minute}`,
        arrivalTime: `${arrHour.toString().padStart(2, '0')}:${minute}`,
        duration: `${durationHours}h${minute === '30' ? '30' : '00'}`,
        price: Math.round((basePrice * company.priceModifier) / 100) * 100, // Round to nearest 100
        date,
        features: randomFeatures,
        availableSeats: totalSeats - new Set(disabledSeats).size,
        totalSeats,
        disabledSeats: Array.from(new Set(disabledSeats))
      });
    }
  });

  // Sort by departure time
  return trips.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
};
