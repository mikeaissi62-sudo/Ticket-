const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', '[locale]', 'resultats', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add imports
if (!content.includes("import { generateMockTrips, COMPANIES } from '@/lib/mock-data'")) {
  content = content.replace("import { useLocale } from 'next-intl';", "import { useLocale } from 'next-intl';\nimport { generateMockTrips, COMPANIES } from '@/lib/mock-data';\nimport { useBookingStore } from '@/stores/bookingStore';");
}

// Add hook
if (!content.includes("const { selectTrip } = useBookingStore();")) {
  content = content.replace("const dateParam = searchParams.get('date') || defaultDate;", "const dateParam = searchParams.get('date') || defaultDate;\n  const { selectTrip } = useBookingStore();");
}

// Replace sorting logic
const filterRegex = /\/\/ Departure data for sorting\/filtering[\s\S]*?getOrder \= \(id: number\) \=\> \{[\s\S]*?return data.findIndex\(d \=\> d\.id \=\=\= id\);\n  \};/;

const newSortingLogic = `const allTrips = generateMockTrips(from, to, dateParam);
  let trips = allTrips;
  const isCompanySelected = filterConfort || filterBaobab || filterATT || filterSTM;
  if (isCompanySelected) {
    trips = trips.filter(t => 
      (filterConfort && t.companyId === 'c-1') ||
      (filterBaobab && t.companyId === 'c-2') ||
      (filterATT && t.companyId === 'c-3') ||
      (filterSTM && t.companyId === 'c-4')
    );
  }
  if (filterVIP) trips = trips.filter(t => t.features.includes('ac'));
  if (filterDirect) trips = trips.filter(t => t.duration.startsWith('2h') || t.duration.startsWith('3h')); // dummy direct

  trips.sort((a, b) => {
    if (sortBy === 'timeAsc') return a.departureTime.localeCompare(b.departureTime);
    if (sortBy === 'priceAsc') return a.price - b.price;
    if (sortBy === 'seatsDesc') return b.availableSeats - a.availableSeats;
    return 0;
  });`;

content = content.replace(filterRegex, newSortingLogic);

// Replace departures list
const departuresRegex = /\{\/\* ======== List of Departures \(8 columns\) ========\*\/\}[\s\S]*?(?=\{\/\* ======== Right Column: Sidebar Widgets \(4 columns\) ========\*\/\})/;

const newDeparturesList = `{/* ======== List of Departures (8 columns) ======== */}
          <div className="lg:col-span-8 flex flex-col gap-space-md">
            
            {trips.length === 0 && (
              <div className="bg-surface-container-lowest rounded-xl p-space-lg text-center shadow-sm">
                <span className="material-symbols-outlined text-outline text-[48px] mb-4">search_off</span>
                <h3 className="font-title-lg text-title-lg font-bold text-on-surface mb-2">Aucun départ ne correspond</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Essayez de modifier vos filtres de recherche.</p>
                <button onClick={() => { setFilterConfort(false); setFilterBaobab(false); setFilterATT(false); setFilterSTM(false); setFilterVIP(false); setFilterDirect(false); }} className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold">Réinitialiser les filtres</button>
              </div>
            )}

            {trips.map(trip => {
              const company = COMPANIES.find(c => c.id === trip.companyId);
              let companyColor = 'bg-primary';
              if (trip.companyId === 'c-2') companyColor = 'bg-[#f59e0b]';
              if (trip.companyId === 'c-3') companyColor = 'bg-[#3b82f6]';
              if (trip.companyId === 'c-4') companyColor = 'bg-[#8b5cf6]';

              return (
              <div key={trip.id} className="bg-surface-container-lowest rounded-xl p-space-md md:p-space-lg shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="flex items-center justify-between pb-space-sm mb-space-sm">
                <div className="flex items-center gap-2">
                  <div className={\`w-8 h-8 rounded-lg \${companyColor} flex items-center justify-center text-white\`}>
                    <span className="material-symbols-outlined text-[18px]">directions_bus</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-title-md text-title-md font-bold text-on-surface">{company?.name}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-label-sm text-[10px] font-bold uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[12px]">verified</span> Partenaire Officiel
                      </span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Autocar • Évaluation {company?.rating}/5</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/10 text-secondary">
                  <span className="material-symbols-outlined text-[16px]">airline_seat_recline_normal</span>
                  <span className="font-label-md text-label-md font-bold">{trip.availableSeats} places restantes</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md items-center my-space-md py-space-sm bg-surface-container-low/40 px-space-md rounded-xl">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-md text-headline-md font-bold text-on-surface">{trip.departureTime}</span>
                  </div>
                  <span className="font-body-md text-body-md font-semibold text-on-surface mt-1">{from}</span>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium mb-1">{trip.duration} de trajet</span>
                  <div className="w-full flex items-center gap-1 text-outline">
                    <span className={\`w-2 h-2 rounded-full \${companyColor}\`}></span>
                    <div className="flex-1 h-[2px] bg-outline-variant relative">
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-secondary">
                        <span className="material-symbols-outlined text-[16px]">directions_bus</span>
                      </span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  </div>
                  <span className="font-label-sm text-[10px] text-secondary font-semibold mt-1">Garantie Départ</span>
                </div>
                <div className="flex flex-col md:text-right">
                  <div className="flex items-center md:justify-end gap-2">
                    <span className="font-headline-md text-headline-md font-bold text-on-surface">{trip.arrivalTime}</span>
                  </div>
                  <span className="font-body-md text-body-md font-semibold text-on-surface mt-1">{to}</span>
                </div>
              </div>

              <div className="flex items-center gap-space-sm flex-wrap py-2">
                {trip.features.includes('ac') && (
                  <span className="inline-flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-[16px] text-secondary">ac_unit</span> Climatisation
                  </span>
                )}
                {trip.features.includes('wifi') && (
                  <span className="inline-flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-[16px] text-secondary">wifi</span> Wi-Fi
                  </span>
                )}
              </div>

              <div className="pt-space-md mt-space-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[28px] leading-8 font-bold text-on-surface">{formatPrice(trip.price)}</span>
                    <span className="font-body-md text-body-md font-semibold text-on-surface-variant">FCFA</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    selectTrip(trip);
                    router.push(\`/\${locale}/reservation/\${trip.id}?\${bookingParams}\`);
                  }} 
                  className="px-space-md py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-md text-body-md font-semibold transition-all shadow-md flex items-center justify-center gap-2 group-hover:scale-[1.01]"
                >
                  <span>Choisir mon siège</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
            );
            })}
          </div>\n\n          `;

content = content.replace(departuresRegex, newDeparturesList);
fs.writeFileSync(filePath, content);
console.log("Updated resultats/page.tsx");
