'use client';
import React from 'react';

interface TripCardProps {
  companyName: string;
  companySubtitle: string;
  isPartnerOfficial: boolean;
  seatsLeft: number;
  departureTime: string;
  departureLabel: string;
  departureStation: string;
  arrivalTime: string;
  arrivalStation: string;
  duration: string;
  directLabel: string;
  amenities: string[];
  price: number;
  priceLabel: string;
  variant?: 'default' | 'express' | 'vip-soiree';
  urgentSeats?: boolean;
}

export const TripCard: React.FC<TripCardProps> = ({
  companyName,
  companySubtitle,
  isPartnerOfficial,
  seatsLeft,
  departureTime,
  departureLabel,
  departureStation,
  arrivalTime,
  arrivalStation,
  duration,
  directLabel,
  amenities,
  price,
  priceLabel,
  variant = 'default',
  urgentSeats = false,
}) => {
  const amenityIcons: Record<string, string> = {
    'Climatisation': 'ac_unit',
    'Wi-Fi HD 4G': 'wifi',
    'Prises USB / 220V': 'power',
    'Sièges Inclinables': 'airline_seat_recline_extra',
    'Climatisation intégrale': 'ac_unit',
    'Collation offerte': 'restaurant',
    'Bagage 25kg inclus': 'luggage',
    'Écran Vidéo HD': 'smart_display',
    'Sièges Cuir VIP': 'airline_seat_recline_extra',
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[16px] font-bold text-[#0F172A]">{companyName}</h3>
            {isPartnerOfficial && (
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#0284C7] font-semibold border border-[#0284C7]/20">
                PARTENAIRE OFFICIEL
              </span>
            )}
          </div>
          <p className="text-[12px] text-[#64748B] mt-0.5">{companySubtitle}</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] text-[#64748B] text-[12px] font-medium shrink-0">
          <span className="material-symbols-outlined text-[14px]">event_seat</span>
          {urgentSeats ? (
            <span className="text-[#EF4444] font-semibold">Plus que {seatsLeft} places !</span>
          ) : (
            <span>{seatsLeft} places restantes</span>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="px-5 py-4 border-t border-[#F1F5F9]">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Departure */}
          <div className="text-center sm:text-left shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[22px] font-bold text-[#0F172A]">{departureTime}</span>
              {departureLabel && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#ECFDF5] text-[#059669]">
                  {departureLabel}
                </span>
              )}
            </div>
            <p className="text-[12px] text-[#64748B] font-medium">{departureStation}</p>
          </div>

          {/* Duration line */}
          <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <span className="text-[11px] text-[#94A3B8] font-medium whitespace-nowrap">{duration}</span>
            <div className="w-full flex items-center gap-1">
              <div className="w-2 h-2 rounded-full border-2 border-[#10B981] shrink-0"></div>
              <div className="flex-1 h-[2px] bg-[#E2E8F0] relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#10B981] to-[#E2E8F0]"></div>
              </div>
              <div className="w-2 h-2 rounded-full bg-[#0F172A] shrink-0"></div>
            </div>
            <span className="text-[11px] text-[#64748B] font-medium whitespace-nowrap">{directLabel}</span>
          </div>

          {/* Arrival */}
          <div className="text-center sm:text-right shrink-0">
            <span className="text-[22px] font-bold text-[#0F172A]">{arrivalTime}</span>
            <p className="text-[12px] text-[#64748B] font-medium">{arrivalStation}</p>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="px-5 py-3 border-t border-[#F1F5F9] flex flex-wrap items-center gap-x-4 gap-y-2">
        {amenities.map((a, i) => (
          <div key={i} className="flex items-center gap-1 text-[12px] text-[#64748B]">
            <span className="material-symbols-outlined text-[16px] text-[#10B981]">
              {amenityIcons[a] || 'check_circle'}
            </span>
            <span>{a}</span>
          </div>
        ))}
      </div>

      {/* Footer: Price + CTA */}
      <div className="px-5 py-4 border-t border-[#E2E8F0] bg-[#FAFBFC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-[22px] font-bold text-[#0F172A]">
              {price.toLocaleString('fr-FR')}
            </span>
            <span className="text-[14px] text-[#64748B] font-medium">FCFA</span>
          </div>
          <p className="text-[11px] text-[#64748B]">{priceLabel}</p>
        </div>

        <button className="w-full sm:w-auto px-6 py-3 bg-[#0F172A] text-white text-[14px] font-semibold rounded-xl hover:bg-[#1E293B] transition-colors flex items-center justify-center gap-2 shadow-sm">
          Choisir mon siège
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
