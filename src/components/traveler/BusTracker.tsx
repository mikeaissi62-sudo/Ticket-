'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface RouteStop {
  name: string;
  city: string;
  lat: number;
  lng: number;
  time?: string;
  isPassed?: boolean;
}

export interface BusTrackerProps {
  tripId?: string;
  bookingRef?: string;
  companyName?: string;
  from?: string;
  to?: string;
  departureTime?: string;
  arrivalTime?: string;
  busPlateNumber?: string;
  driverName?: string;
}

// Coordonnées GPS réelles de l'axe routier national RNIE 2 (Bénin)
const DEFAULT_ROUTE_STOPS: RouteStop[] = [
  { name: 'Gare Étoile Rouge', city: 'Cotonou', lat: 6.3656, lng: 2.4374, time: '07:00' },
  { name: 'Station Allada', city: 'Allada', lat: 6.6654, lng: 2.1514, time: '07:45' },
  { name: 'Gare Bohicon', city: 'Bohicon', lat: 7.1774, lng: 2.0685, time: '09:15' },
  { name: 'Station Dassa', city: 'Dassa-Zoumè', lat: 7.7500, lng: 2.1833, time: '10:30' },
  { name: 'Station Savè', city: 'Savè', lat: 8.0333, lng: 2.4833, time: '11:15' },
  { name: 'Terminus Confort Lines', city: 'Parakou', lat: 9.3371, lng: 2.6312, time: '13:30' },
];

// Distance Haversine en km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const BusTracker: React.FC<BusTrackerProps> = ({
  tripId = 'demo-trip-1',
  bookingRef = 'TK-78B451',
  companyName = 'Confort Lines VIP',
  from = 'Cotonou',
  to = 'Parakou',
  departureTime = '07:00',
  arrivalTime = '13:30',
  busPlateNumber = 'AA 1234 RB',
  driverName = 'Dossou Marcel',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapInstance = useRef<any>(null);
  const busMarkerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);

  // Position du bus le long de la RNIE 2
  const [stops] = useState<RouteStop[]>(DEFAULT_ROUTE_STOPS);
  const [progressIndex, setProgressIndex] = useState<number>(2.4); // Entre Bohicon et Dassa
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(78); // km/h
  const [lastUpdate, setLastUpdate] = useState<string>('À l’instant');
  const [isGoogleMapsReady, setIsGoogleMapsReady] = useState<boolean>(false);
  const [mapsError, setMapsError] = useState<string | null>(null);

  // Calcul position interpolée
  const getCurrentPosition = useCallback(() => {
    const totalSegments = stops.length - 1;
    const clampedIndex = Math.min(Math.max(progressIndex, 0), totalSegments);
    const lowerIdx = Math.floor(clampedIndex);
    const upperIdx = Math.min(lowerIdx + 1, totalSegments);
    const ratio = clampedIndex - lowerIdx;

    const stopA = stops[lowerIdx];
    const stopB = stops[upperIdx];

    const currentLat = stopA.lat + (stopB.lat - stopA.lat) * ratio;
    const currentLng = stopA.lng + (stopB.lng - stopA.lng) * ratio;

    return { lat: currentLat, lng: currentLng, stopA, stopB, ratio };
  }, [progressIndex, stops]);

  const currentPos = getCurrentPosition();
  const destination = stops[stops.length - 1];
  const origin = stops[0];

  // Calcul distance restante et ETA
  const remainingKm = Math.round(calculateDistance(currentPos.lat, currentPos.lng, destination.lat, destination.lng));
  const totalKm = Math.round(calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng));
  const percentDone = Math.min(100, Math.round(((totalKm - remainingKm) / totalKm) * 100));

  const remainingMinutes = speed > 0 ? Math.round((remainingKm / speed) * 60) : 0;
  const etaHours = Math.floor(remainingMinutes / 60);
  const etaMins = remainingMinutes % 60;
  const etaString = `${etaHours}h ${etaMins.toString().padStart(2, '0')}m`;

  // Écoute Supabase Realtime pour les coordonnées du voyage
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`trip-tracking-${tripId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trips',
          filter: `id=eq.${tripId}`,
        },
        (payload: any) => {
          if (payload.new?.current_lat && payload.new?.current_lng) {
            setLastUpdate(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId]);

  // Simulation en direct du mouvement du bus le long de la RNIE 2
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setProgressIndex((prev) => {
        if (prev >= stops.length - 1) {
          return 0.1; // Recommencer la boucle pour démo
        }
        return prev + 0.035;
      });
      setSpeed(Math.floor(72 + Math.random() * 14));
      setLastUpdate('À l’instant');
    }, 2500);

    return () => clearInterval(interval);
  }, [isSimulating, stops.length]);

  // Initialisation Google Maps JS API si la clé API est fournie
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey || !mapRef.current) {
      setIsGoogleMapsReady(false);
      return;
    }

    let isMounted = true;

    async function initGoogleMaps() {
      try {
        // Chargement dynamique du script Google Maps avec AdvancedMarkerElement
        if (!(window as any).google?.maps) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=routes,marker`;
          script.async = true;
          script.defer = true;
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        if (!isMounted || !mapRef.current) return;

        const google = (window as any).google;
        const center = { lat: currentPos.lat, lng: currentPos.lng };

        // Création de la carte avec Map ID pour AdvancedMarkerElement
        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom: 8,
          mapId: 'DEMO_MAP_ID', // Conforme CF9
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          internalUsageAttributionIds: ['gmp_git_agentskills_v1'], // Requis par les règles Google Maps
        });

        googleMapInstance.current = map;

        // Tracé du trajet (Polyline)
        const pathCoordinates = stops.map((s) => ({ lat: s.lat, lng: s.lng }));
        const polyline = new google.maps.Polyline({
          path: pathCoordinates,
          geodesic: true,
          strokeColor: '#10B981',
          strokeOpacity: 0.9,
          strokeWeight: 5,
        });
        polyline.setMap(map);
        polylineRef.current = polyline;

        // Marqueurs des stations
        stops.forEach((stop, index) => {
          const isTerminus = index === 0 || index === stops.length - 1;
          const pin = document.createElement('div');
          pin.className = `w-4 h-4 rounded-full border-2 border-white shadow-md ${
            isTerminus ? 'bg-[#0F172A]' : 'bg-[#64748B]'
          }`;
          
          if (google.maps.marker?.AdvancedMarkerElement) {
            new google.maps.marker.AdvancedMarkerElement({
              map,
              position: { lat: stop.lat, lng: stop.lng },
              title: `${stop.name} (${stop.city})`,
              content: pin,
            });
          }
        });

        // Marqueur du bus animé
        const busEl = document.createElement('div');
        busEl.className = 'w-9 h-9 rounded-2xl bg-[#0F172A] text-white flex items-center justify-center shadow-2xl border-2 border-[#10B981] animate-pulse';
        busEl.innerHTML = '<span class="material-symbols-outlined" style="font-size:20px;color:#10B981;">directions_bus</span>';

        if (google.maps.marker?.AdvancedMarkerElement) {
          busMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
            map,
            position: center,
            title: `Autocar ${companyName} (${busPlateNumber})`,
            content: busEl,
          });
        }

        setIsGoogleMapsReady(true);
      } catch (err: any) {
        console.warn('Google Maps loader fallback:', err);
        setMapsError(err.message || 'Clé Google Maps inactive');
        setIsGoogleMapsReady(false);
      }
    }

    initGoogleMaps();

    return () => {
      isMounted = false;
    };
  }, [apiKey, stops]);

  // Mise à jour de la position du marqueur sur Google Maps
  useEffect(() => {
    if (googleMapInstance.current && busMarkerRef.current) {
      busMarkerRef.current.position = { lat: currentPos.lat, lng: currentPos.lng };
    }
  }, [currentPos]);

  return (
    <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-xl overflow-hidden flex flex-col w-full">
      {/* Top Bar: Trip Status & Stats */}
      <div className="p-5 sm:p-6 bg-[#0F172A] text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping"></span>
            <span className="text-[12px] font-bold text-[#10B981] uppercase tracking-wider">
              En route • Suivi GPS Temps Réel
            </span>
            <span className="text-slate-400 text-[12px]">• {companyName}</span>
          </div>
          <h2 className="text-[22px] sm:text-[26px] font-extrabold tracking-tight">
            {from} ➔ {to}
          </h2>
          <p className="text-[13px] text-slate-300 mt-0.5">
            Réf. <strong>{bookingRef}</strong> • Bus : <strong>{busPlateNumber}</strong> • Chauffeur : {driverName}
          </p>
        </div>

        {/* Live Gauges */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-slate-800/80 p-3 sm:p-4 rounded-2xl border border-slate-700/60 text-center">
          <div>
            <span className="text-[11px] text-slate-400 block uppercase font-medium">Vitesse</span>
            <span className="text-[18px] sm:text-[20px] font-extrabold text-[#10B981]">{speed} <span className="text-[12px]">km/h</span></span>
          </div>
          <div className="border-x border-slate-700 px-2 sm:px-4">
            <span className="text-[11px] text-slate-400 block uppercase font-medium">Restant</span>
            <span className="text-[18px] sm:text-[20px] font-extrabold text-white">{remainingKm} <span className="text-[12px]">km</span></span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 block uppercase font-medium">Arrivée estimée</span>
            <span className="text-[18px] sm:text-[20px] font-extrabold text-emerald-400">{etaString}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar Along Route */}
      <div className="px-5 sm:px-6 py-4 bg-slate-50 border-b border-[#E2E8F0]">
        <div className="flex items-center justify-between text-[12px] font-bold text-[#0F172A] mb-2">
          <span>Départ {from} ({departureTime})</span>
          <span className="text-emerald-700 font-extrabold bg-emerald-100 px-2.5 py-0.5 rounded-full">
            {percentDone}% du trajet effectué
          </span>
          <span>Arrivée {to} ({arrivalTime})</span>
        </div>
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-[#10B981] rounded-full transition-all duration-700 relative"
            style={{ width: `${percentDone}%` }}
          >
            <span className="absolute right-0 top-0 bottom-0 w-3 bg-white/40 animate-pulse"></span>
          </div>
        </div>
      </div>

      {/* Interactive Map Area (Google Maps or High-Precision Vector Geo-Renderer) */}
      <div className="relative w-full h-[460px] sm:h-[500px] bg-slate-100 overflow-hidden">
        {/* Google Maps Canvas */}
        <div
          ref={mapRef}
          className={`w-full h-full ${isGoogleMapsReady ? 'block' : 'hidden'}`}
          style={{ minHeight: '460px' }}
        />

        {/* Fallback Vector Interactive Map (Si pas de clé API ou rendu hors-ligne) */}
        {!isGoogleMapsReady && (
          <div className="w-full h-full relative bg-[#0b1326] flex items-center justify-center p-4">
            {/* SVG Interactive Benin Route Visualizer */}
            <svg viewBox="0 0 400 480" className="w-full h-full max-w-[500px] max-h-[460px] filter drop-shadow-xl">
              {/* Benin Country Outline (stylized schematic) */}
              <path
                d="M 120 450 C 130 440, 260 440, 280 450 C 290 400, 310 320, 300 240 C 290 160, 270 80, 230 40 C 190 50, 140 100, 130 180 C 110 240, 100 320, 100 400 Z"
                fill="#131e3a"
                stroke="#25355a"
                strokeWidth="2"
              />

              {/* RNIE 2 Highway Polyline */}
              <path
                d="M 230 430 L 210 370 L 190 300 L 200 210 L 220 150 L 240 80"
                fill="none"
                stroke="#1e293b"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 230 430 L 210 370 L 190 300 L 200 210 L 220 150 L 240 80"
                fill="none"
                stroke="#334155"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Trajet complété en Vert Émeraude */}
              <path
                d="M 230 430 L 210 370 L 190 300 L 195 255"
                fill="none"
                stroke="#10B981"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-pulse"
              />

              {/* Stations Markers */}
              {stops.map((stop, i) => {
                // Mapping des coordonnées vers le canvas SVG
                const y = 430 - (i / (stops.length - 1)) * 350;
                const x = 230 - Math.sin((i / (stops.length - 1)) * Math.PI) * 40;
                const isOrigin = i === 0;
                const isDest = i === stops.length - 1;

                return (
                  <g key={stop.city} transform={`translate(${x}, ${y})`}>
                    <circle
                      r={isOrigin || isDest ? "8" : "5"}
                      fill={isOrigin || isDest ? "#10B981" : "#94A3B8"}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <text
                      x={i % 2 === 0 ? "14" : "-14"}
                      y="4"
                      textAnchor={i % 2 === 0 ? "start" : "end"}
                      fill="#e2e8f0"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      {stop.city} ({stop.time})
                    </text>
                  </g>
                );
              })}

              {/* Moving Bus Marker */}
              {(() => {
                const busY = 430 - (progressIndex / (stops.length - 1)) * 350;
                const busX = 230 - Math.sin((progressIndex / (stops.length - 1)) * Math.PI) * 40;

                return (
                  <g transform={`translate(${busX}, ${busY})`}>
                    <circle r="18" fill="#10B981" opacity="0.3" className="animate-ping" />
                    <rect x="-14" y="-14" width="28" height="28" rx="8" fill="#0F172A" stroke="#10B981" strokeWidth="2.5" />
                    <text x="0" y="5" textAnchor="middle" fill="#10B981" fontSize="14" fontWeight="bold">
                      🚌
                    </text>
                    {/* Tooltip */}
                    <rect x="-45" y="-36" width="90" height="18" rx="6" fill="#0F172A" stroke="#334155" />
                    <text x="0" y="-23" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                      {speed} km/h • RNIE 2
                    </text>
                  </g>
                );
              })()}
            </svg>

            {/* Note d'information pour Google Maps API */}
            <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-3.5 rounded-2xl max-w-xs text-white shadow-xl">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-[18px] text-[#10B981]">satellite_alt</span>
                <span className="text-[12px] font-bold">Réseau Cartographique Bénin</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Suivi GPS satellite actif le long du corridor national Cotonou-Parakou.
              </p>
              {!apiKey && (
                <div className="mt-2 text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-800">
                  Mode démo GPS actif. Ajoutez <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> pour activer Google Maps Satellite.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Floating Bottom Card: Prochain arrêt & simulation controls */}
        <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-[#E2E8F0] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
              <span className="material-symbols-outlined text-[24px]">signpost</span>
            </div>
            <div>
              <span className="text-[11px] text-[#64748B] block font-semibold uppercase">Prochaine étape</span>
              <div className="text-[15px] font-bold text-[#0F172A]">
                {currentPos.stopB ? `${currentPos.stopB.name} (${currentPos.stopB.city})` : destination.city}
              </div>
              <span className="text-[12px] text-[#10B981] font-semibold">
                Passage estimé dans ~25 min
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                isSimulating
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isSimulating ? 'pause' : 'play_arrow'}
              </span>
              <span>{isSimulating ? 'Pause Déplacement' : 'Reprendre Déplacement'}</span>
            </button>

            <a
              href="https://wa.me/2290154658907"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#25D366] text-white text-[12px] font-bold hover:bg-[#20ba59] transition-all flex items-center gap-1.5 shadow-sm"
              title="Alerter la régulation"
            >
              <span className="material-symbols-outlined text-[16px]">support_agent</span>
              <span className="hidden sm:inline">Régulateur</span>
            </a>
          </div>
        </div>
      </div>

      {/* Route Stops Accordion / Timeline */}
      <div className="p-5 sm:p-6 bg-white border-t border-[#E2E8F0]">
        <h3 className="text-[16px] font-bold text-[#0F172A] mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#10B981]">route</span>
          Itinéraire officiel &amp; Heures de passage
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {stops.map((stop, i) => {
            const isPassed = progressIndex >= i;
            const isCurrent = Math.floor(progressIndex) === i;

            return (
              <div
                key={stop.city}
                className={`p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? 'border-[#10B981] bg-emerald-50/40 ring-2 ring-[#10B981]/20'
                    : isPassed
                    ? 'border-slate-200 bg-slate-50 opacity-80'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                    isPassed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isCurrent ? 'EN COURS' : isPassed ? 'PASSÉ' : 'À VENIR'}
                  </span>
                  <span className="text-[11px] font-bold text-[#0F172A]">{stop.time}</span>
                </div>
                <div className="text-[13px] font-bold text-[#0F172A]">{stop.city}</div>
                <div className="text-[11px] text-[#64748B] truncate">{stop.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
