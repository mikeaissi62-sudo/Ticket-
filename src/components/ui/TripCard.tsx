import React from 'react';
import { Card } from './Card';
import { Bus, Star, Snowflake, Wifi, BatteryCharging, AlertCircle, ArrowRight, ShieldCheck, BaggageClaim, Zap } from 'lucide-react';

interface TripCardProps {
  id: string;
  companyName: string;
  rating: number;
  reviews: number;
  departureTime: string;
  departureStation: string;
  arrivalTime: string;
  arrivalStation: string;
  duration: string;
  stops: string;
  price: number;
  seatsLeft: number;
  features: string[];
  badgeType?: 'VIP' | 'Confort' | 'Standard' | 'Express';
  buttonDisabled?: boolean;
}

export const TripCard: React.FC<TripCardProps> = ({
  companyName,
  rating,
  reviews,
  departureTime,
  departureStation,
  arrivalTime,
  arrivalStation,
  duration,
  stops,
  price,
  seatsLeft,
  features,
  badgeType = 'Standard',
  buttonDisabled = false,
}) => {
  return (
    <Card className="mb-4 shadow-sm border border-gray-100 p-4">
      {/* Header: Company & Price */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue shrink-0">
            {badgeType === 'Express' ? <Zap className="w-5 h-5" /> : <Bus className="w-5 h-5" />}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-bold text-brand-darkGray text-lg leading-tight">{companyName}</span>
              {badgeType && (
                <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {badgeType}
                </span>
              )}
            </div>
            <div className="flex items-center text-xs text-gray-500 mt-0.5">
              <Star className="w-3.5 h-3.5 text-brand-yellow fill-brand-yellow mr-1" />
              <span className="font-medium text-brand-darkGray mr-1">{rating}</span>
              <span>({reviews} avis)</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-start text-brand-blue">
            <span className="text-xl font-bold leading-none">{price.toLocaleString()}</span>
            <span className="text-sm font-semibold ml-1">F</span>
          </div>
          <span className="text-[10px] text-gray-400 mt-1">par passager</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex items-center justify-between my-6">
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-brand-darkGray">{departureTime}</span>
          <span className="text-[11px] text-gray-500 mt-1">{departureStation}</span>
        </div>
        
        <div className="flex-1 px-4 flex flex-col items-center justify-center relative">
          <span className="text-[10px] text-gray-400 mb-1">{duration} de trajet</span>
          <div className="w-full h-[1px] bg-gray-300 relative flex items-center justify-center">
            <div className="w-2 h-2 rounded-full border border-brand-blue bg-white"></div>
          </div>
          <span className="text-[10px] text-brand-lightBlue mt-1 font-medium">{stops}</span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-brand-darkGray">{arrivalTime}</span>
          <span className="text-[11px] text-gray-500 mt-1">{arrivalStation}</span>
        </div>
      </div>

      {/* Features & Seats Warning */}
      <div className="flex flex-col gap-3 mb-5">
        <div className="flex flex-wrap gap-2">
          {features.includes('ac') && (
            <div className="flex items-center gap-1 bg-blue-50 text-blue-500 px-2.5 py-1.5 rounded-md text-[10px] font-semibold">
              <Snowflake className="w-3 h-3" /> Climatisé
            </div>
          )}
          {features.includes('wifi') && (
            <div className="flex items-center gap-1 bg-orange-50 text-orange-500 px-2.5 py-1.5 rounded-md text-[10px] font-semibold">
              <Wifi className="w-3 h-3" /> WIFI
            </div>
          )}
          {features.includes('usb') && (
            <div className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2.5 py-1.5 rounded-md text-[10px] font-semibold">
              <BatteryCharging className="w-3 h-3" /> Prise USB
            </div>
          )}
          {features.includes('baggage') && (
            <div className="flex items-center gap-1 bg-brand-blue/5 text-brand-blue px-2.5 py-1.5 rounded-md text-[10px] font-semibold">
              <BaggageClaim className="w-3 h-3" /> Bagage 20kg inclus
            </div>
          )}
          {features.includes('direct') && (
            <div className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-2.5 py-1.5 rounded-md text-[10px] font-semibold">
              <Zap className="w-3 h-3" /> Direct sans escale
            </div>
          )}
          {features.includes('ventilated') && (
            <div className="flex items-center gap-1 bg-green-50 text-green-600 px-2.5 py-1.5 rounded-md text-[10px] font-semibold">
              <ShieldCheck className="w-3 h-3" /> Ventilé
            </div>
          )}
        </div>
        
        {seatsLeft > 0 && seatsLeft <= 10 && (
          <div className="flex items-center gap-1 bg-red-50 text-red-500 px-2.5 py-1.5 rounded-md text-[10px] font-semibold w-max">
            <AlertCircle className="w-3 h-3" />
            {seatsLeft === 1 ? '1 place restante !' : `${seatsLeft} places restantes !`}
          </div>
        )}
      </div>

      {/* Button */}
      <button 
        disabled={buttonDisabled}
        className={`w-full py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 transition ${
          buttonDisabled 
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
            : 'bg-brand-yellow text-brand-darkBlue hover:bg-brand-yellowHover'
        }`}
      >
        <span>Choisir le siège</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </Card>
  );
};
