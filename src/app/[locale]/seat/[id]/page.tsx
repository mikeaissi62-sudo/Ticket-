'use client';
import React, { useState } from 'react';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function SeatSelectionPage() {
  const params = useParams();
  const locale = useLocale();
  const tripId = params.id;
  
  // Mock seats data (1 = window, 2 = aisle left, aisle, 3 = aisle right, 4 = window right)
  // Status: 'free', 'occupied', 'selected'
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

  const generateSeats = () => {
    let rows = [];
    let seatNum = 1;
    for (let i = 0; i < 10; i++) {
      rows.push([
        { id: `${seatNum++}`, status: Math.random() > 0.7 ? 'occupied' : 'free' },
        { id: `${seatNum++}`, status: Math.random() > 0.7 ? 'occupied' : 'free' },
        null, // Aisle
        { id: `${seatNum++}`, status: Math.random() > 0.7 ? 'occupied' : 'free' },
        { id: `${seatNum++}`, status: Math.random() > 0.7 ? 'occupied' : 'free' },
      ]);
    }
    // Back row (5 seats)
    rows.push([
      { id: `${seatNum++}`, status: 'free' },
      { id: `${seatNum++}`, status: 'free' },
      { id: `${seatNum++}`, status: 'occupied' },
      { id: `${seatNum++}`, status: 'free' },
      { id: `${seatNum++}`, status: 'free' },
    ]);
    return rows;
  };

  const [seats] = useState(generateSeats());

  const handleSeatClick = (id: string, status: string) => {
    if (status === 'occupied') return;
    setSelectedSeat(id === selectedSeat ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-brand-blue pt-12 pb-6 px-4 md:px-12 text-white sticky top-0 z-40">
        <div className="flex items-center mb-2 max-w-lg mx-auto">
          <Link href={`/${locale}/results`} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold ml-2">Sélectionnez votre siège</h1>
        </div>
        <div className="max-w-lg mx-auto flex justify-between text-sm mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-white rounded"></div>
            <span>Libre</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span>Occupé</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-brand-yellow rounded"></div>
            <span>Sélectionné</span>
          </div>
        </div>
      </div>

      {/* Bus Layout */}
      <div className="max-w-lg mx-auto px-4 pt-8">
        <Card className="bg-gray-200 border-4 border-gray-300 rounded-[3rem] p-6 mx-auto relative overflow-hidden shadow-inner">
          {/* Driver section area */}
          <div className="w-full flex justify-end mb-8 border-b-2 border-gray-300 pb-4">
            <div className="w-12 h-12 bg-gray-400 rounded-lg flex items-center justify-center text-white text-xs font-bold">
              Volant
            </div>
          </div>

          <div className="space-y-4">
            {seats.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-between items-center">
                {row.map((seat, seatIndex) => {
                  if (!seat) {
                    return <div key={`aisle-${seatIndex}`} className="w-8 h-12"></div>;
                  }

                  const isSelected = selectedSeat === seat.id;
                  
                  let seatClass = 'bg-white border-2 border-gray-300 text-gray-500 cursor-pointer hover:border-brand-blue';
                  if (seat.status === 'occupied') {
                    seatClass = 'bg-gray-400 border-gray-500 text-white cursor-not-allowed opacity-50';
                  } else if (isSelected) {
                    seatClass = 'bg-brand-yellow border-brand-yellowHover text-white shadow-md';
                  }

                  return (
                    <div 
                      key={seat.id}
                      onClick={() => handleSeatClick(seat.id, seat.status)}
                      className={`w-12 h-14 rounded-t-xl rounded-b-md flex flex-col items-center justify-center transition-all ${seatClass}`}
                    >
                      <span className="font-bold text-sm">{seat.id}</span>
                      <div className={`w-8 h-1 mt-1 rounded-full ${isSelected ? 'bg-white/50' : 'bg-gray-200'}`}></div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Action Bar */}
      {selectedSeat && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg md:pl-64 z-50 transition-transform transform translate-y-0">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Siège sélectionné</p>
              <p className="text-xl font-bold text-brand-blue">N° {selectedSeat}</p>
            </div>
            <Link href={`/${locale}/booking/${tripId}`}>
              <Button size="lg" className="px-8 bg-brand-yellow text-white hover:bg-brand-yellowHover font-bold">
                Continuer
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
