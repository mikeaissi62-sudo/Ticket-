import re
import os

path = r'C:\Users\HP\Desktop\SOCIO ANIMER\Document\TICKET+\Ticket-\src\app\[locale]\resultats\page.tsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add import for TripCard
if 'TripCard' not in content:
    content = content.replace("import { useBookingStore } from '@/stores/bookingStore';", 
                              "import { useBookingStore } from '@/stores/bookingStore';\nimport { TripCard } from '@/components/traveler/results/TripCard';")

# 2. Replace the old dummy results check
old_no_results = '''            {!showD1 && !showD2 && !showD3 && !showD4 && !showD5 && !showD6 && (
              <div className="bg-surface-container-lowest rounded-xl p-space-lg text-center shadow-sm">
                <span className="material-symbols-outlined text-outline text-[48px] mb-4">search_off</span>
                <h3 className="font-title-lg text-title-lg font-bold text-on-surface mb-2">Aucun départ ne correspond</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">Essayez de modifier vos filtres de recherche.</p>
                <button onClick={() => { setFilterConfort(false); setFilterBaobab(false); setFilterATT(false); setFilterSTM(false); setFilterVIP(false); setFilterDirect(false); }} className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold">Réinitialiser les filtres</button>
              </div>
            )}'''
new_results = '''            {trips.length === 0 && (
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
                      router.push(`/${locale}/reservation/${trip.id}`);
                    }}
                  />
                </div>
              );
            })}'''

# Find the start of the big chunk
start_idx = content.find('{!showD1 && !showD2 && !showD3')
if start_idx == -1:
    print('Could not find {!showD1 ...')
    exit(1)

# Find the end of showD6
end_pattern = '{/* ======== Right Column: Sidebar Widgets (4 columns) ======== */}'
end_idx = content.find(end_pattern, start_idx)
if end_idx == -1:
    print('Could not find end pattern')
    exit(1)

# we want to replace from start_idx up to the </div> just before end_pattern.
# actually, let's find the closing tag of showD6
# The end of showD6 looks like:
#             </div>
#             )}
# 
#           </div>
# 
#           {/* ======== Right Column: Sidebar Widgets (4 columns) ======== */}
# so we can just use regex to replace everything between start_idx and <div className="lg:col-span-4...

content = content[:start_idx] + new_results + "\n\n          </div>\n\n          " + end_pattern + content[end_idx + len(end_pattern):]

# Remove the unused showD1..showD6 variables and hooks from the file?
# It doesn't hurt to leave them or I can regex them out if they cause lint warnings.
# But Wait, where are showD1..showD6 defined? I didn't see them in my view_file! They must be higher up.

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Success')
