const fs = require('fs');
const path = require('path');

const filePath = path.resolve('C:/Users/HP/Desktop/SOCIO ANIMER/Document/TICKET+/Ticket-/src/app/[locale]/resultats/page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add import for TripCard
if (!content.includes('TripCard')) {
    content = content.replace("import { useBookingStore } from '@/stores/bookingStore';", 
                              "import { useBookingStore } from '@/stores/bookingStore';\nimport { TripCard } from '@/components/traveler/results/TripCard';");
}

// 2. Replace the old dummy results check
const new_results = `            {trips.length === 0 && (
              <div className="bg-surface-container-lowest rounded-xl p-space-lg text-center shadow-sm">
                <span className="material-symbols-outlined text-outline text-[48px] mb-4">search_off</span>
                <h3 className="font-title-lg text-title-lg font-bold text-on-surface mb-2">Aucun départ ne correspond</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Essayez de modifier vos filtres de recherche.</p>
                <button onClick={() => { setFilterConfort(false); setFilterBaobab(false); setFilterATT(false); setFilterSTM(false); setFilterVIP(false); setFilterDirect(false); }} className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold">Réinitialiser les filtres</button>
              </div>
            )}

            {trips.map((trip) => {
              const company = COMPANIES.find((c) => c.id === trip.companyId) || COMPANIES[0];
              return (
                <div key={trip.id} className="relative">
                  <TripCard
                    companyName={company.name}
                    companySubtitle={company.subtitle}
                    isPartnerOfficial={company.isOfficialPartner}
                    seatsLeft={trip.availableSeats}
                    departureTime={trip.departureTime}
                    departureLabel=""
                    departureStation={trip.departureStation}
                    arrivalTime={trip.arrivalTime}
                    arrivalStation={trip.arrivalStation}
                    duration={trip.duration}
                    directLabel={trip.features.includes("direct") ? "Trajet Direct" : "Avec arrêts"}
                    amenities={trip.features}
                    price={trip.price}
                    priceLabel=""
                    onSelect={() => {
                      selectTrip(trip);
                      router.push(\`/\${locale}/reservation/\${trip.id}\`);
                    }}
                  />
                </div>
              );
            })}`;

const start_pattern = '{!showD1 && !showD2 && !showD3';
const start_idx = content.indexOf(start_pattern);
if (start_idx === -1) {
    console.error('Could not find start pattern');
    process.exit(1);
}

const end_pattern = '{/* ======== Right Column: Sidebar Widgets (4 columns) ======== */}';
const end_idx = content.indexOf(end_pattern, start_idx);
if (end_idx === -1) {
    console.error('Could not find end pattern');
    process.exit(1);
}

content = content.substring(0, start_idx) + new_results + "\n\n          </div>\n\n          " + end_pattern + content.substring(end_idx + end_pattern.length);

// Let's also remove the unused d1_price.. d6_price and showD1.. showD6 variables if they exist
content = content.replace(/const d[1-6]_price = [^\n]+\n/g, '');
content = content.replace(/const d[1-6]_seats = [^\n]+\n/g, '');
content = content.replace(/const showD[1-6] = [^\n]+\n/g, '');
content = content.replace(/const getOrder = [^\n]+\n/g, '');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Success');
