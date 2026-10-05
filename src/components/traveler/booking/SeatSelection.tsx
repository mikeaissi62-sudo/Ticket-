import React from 'react';

interface SeatSelectionProps {
  selectedSeat: string | null;
  setSelectedSeat: (seat: string | null) => void;
}

export const SeatSelection = ({ selectedSeat, setSelectedSeat }: SeatSelectionProps) => {
  
  const handleSeatClick = (seat: string) => {
    setSelectedSeat(seat);
  };

  const renderSeat = (seat: string, status: 'free' | 'locked') => {
    if (status === 'locked') {
      return (
        <button className="w-9 h-9 rounded-lg bg-surface-container-high text-outline flex items-center justify-center cursor-not-allowed" disabled type="button">
          <span className="material-symbols-outlined text-[14px]">lock</span>
        </button>
      );
    }
    
    const isSelected = selectedSeat === seat;
    return (
      <button 
        onClick={() => handleSeatClick(seat)}
        className={`w-9 h-9 rounded-lg shadow-sm flex items-center justify-center transition-all ${
          isSelected 
            ? 'bg-secondary text-on-secondary shadow-md font-bold' 
            : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface font-semibold'
        }`} 
        type="button"
      >
        {seat}
      </button>
    );
  };

  const getRowDetails = (seat: string | null) => {
    if (!seat) return null;
    const seatNum = parseInt(seat, 10);
    const rowNum = Math.ceil(seatNum / 4);
    const isWindow = (seatNum % 4 === 1 || seatNum % 4 === 0);
    const side = (seatNum % 4 === 1 || seatNum % 4 === 2) ? 'gauche' : 'droite';
    return { rowNum, isWindow, side };
  };

  const details = getRowDetails(selectedSeat);

  return (
    <>
      <div className="flex items-start justify-between mb-space-sm pb-space-sm">
        <div>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm font-semibold mb-1">
            <span>Autocar Scania Touring VIP</span>
          </div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">Configuration Sièges</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Sélectionnez votre emplacement à bord</p>
        </div>
        <div className="text-right">
          <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider font-semibold">Choisi</span>
          <span className="inline-flex items-center justify-center font-headline-sm text-headline-sm font-bold text-secondary bg-secondary-container/40 px-2.5 py-0.5 rounded-lg">
            {selectedSeat ? `#${selectedSeat}` : '-'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 bg-surface-container-low p-space-sm rounded-lg mb-space-md font-label-sm text-label-sm">
        <div className="flex items-center gap-1.5 justify-center">
          <span className="w-3.5 h-3.5 rounded bg-surface-container-lowest shadow-sm"></span>
          <span className="text-on-surface-variant">Libre</span>
        </div>
        <div className="flex items-center gap-1.5 justify-center">
          <span className="w-3.5 h-3.5 rounded bg-secondary text-on-secondary flex items-center justify-center text-[9px] font-bold">✓</span>
          <span className="text-on-surface font-semibold">Sélectionné</span>
        </div>
        <div className="flex items-center gap-1.5 justify-center">
          <span className="w-3.5 h-3.5 rounded bg-surface-container-high text-outline flex items-center justify-center text-[10px]">
            <span className="material-symbols-outlined text-[10px]">lock</span>
          </span>
          <span className="text-outline">Occupé</span>
        </div>
      </div>

      <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col items-center">
        <div className="w-full max-w-[310px] bg-surface-container-lowest rounded-t-[36px] rounded-b-2xl p-space-md shadow-sm relative">
          <div className="w-full pb-space-md mb-space-md flex items-center justify-between px-2">
            <div className="flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm bg-surface-container-low px-2 py-1 rounded-md">
              <span className="material-symbols-outlined text-[18px] text-secondary">sensor_door</span>
              <span>Entrée passagers</span>
            </div>
            <div className="flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm bg-surface-container-low px-2 py-1 rounded-md">
              <span className="material-symbols-outlined text-[18px]">sports_motorsports</span>
              <span>Poste Chauffeur</span>
            </div>
          </div>
          <div className="text-center font-label-sm text-label-sm text-outline uppercase tracking-wider mb-2">
            Avant de l'autocar
          </div>
          
          <div className="space-y-2.5 font-label-md text-label-md">
            {/* Rangée 1 */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {renderSeat('01', 'locked')}
                {renderSeat('02', 'free')}
              </div>
              <div className="w-6 text-center text-outline-variant font-label-sm text-label-sm">R1</div>
              <div className="flex gap-2">
                {renderSeat('03', 'locked')}
                {renderSeat('04', 'free')}
              </div>
            </div>
            {/* Rangée 2 */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {renderSeat('05', 'locked')}
                {renderSeat('06', 'free')}
              </div>
              <div className="w-6 text-center text-outline-variant font-label-sm text-label-sm">R2</div>
              <div className="flex gap-2">
                {renderSeat('07', 'free')}
                {renderSeat('08', 'locked')}
              </div>
            </div>
            {/* Rangée 3 */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {renderSeat('09', 'free')}
                {renderSeat('10', 'locked')}
              </div>
              <div className="w-6 text-center text-secondary font-label-sm text-label-sm font-bold">R3</div>
              <div className="flex gap-2">
                {renderSeat('11', 'free')}
                {renderSeat('12', 'free')}
              </div>
            </div>
            {/* Rangée 4 */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {renderSeat('13', 'free')}
                {renderSeat('14', 'free')}
              </div>
              <div className="w-6 text-center text-outline-variant font-label-sm text-label-sm">R4</div>
              <div className="flex gap-2">
                {renderSeat('15', 'locked')}
                {renderSeat('16', 'free')}
              </div>
            </div>
            {/* Rangée 5 */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {renderSeat('17', 'locked')}
                {renderSeat('18', 'free')}
              </div>
              <div className="w-6 text-center text-outline-variant font-label-sm text-label-sm">R5</div>
              <div className="flex gap-2">
                {renderSeat('19', 'free')}
                {renderSeat('20', 'free')}
              </div>
            </div>
            {/* Rangée 6 */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {renderSeat('21', 'free')}
                {renderSeat('22', 'locked')}
              </div>
              <div className="w-6 text-center text-outline-variant font-label-sm text-label-sm">R6</div>
              <div className="flex gap-2">
                {renderSeat('23', 'free')}
                {renderSeat('24', 'free')}
              </div>
            </div>
            {/* Rangée 7 */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {renderSeat('25', 'free')}
                {renderSeat('26', 'free')}
              </div>
              <div className="w-6 text-center text-outline-variant font-label-sm text-label-sm">R7</div>
              <div className="flex gap-2">
                {renderSeat('27', 'locked')}
                {renderSeat('28', 'free')}
              </div>
            </div>
            {/* Rangée 8 */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex gap-2">
                {renderSeat('29', 'free')}
                {renderSeat('30', 'free')}
              </div>
              <div className="w-6 text-center text-outline-variant font-label-sm text-label-sm">R8</div>
              <div className="flex gap-2">
                {renderSeat('31', 'free')}
                {renderSeat('32', 'free')}
              </div>
            </div>
          </div>
          
          <div className="text-center font-label-sm text-label-sm text-outline uppercase tracking-wider mt-3">
            Arrière de l'autocar
          </div>
        </div>
      </div>

      {details && (
        <div className="mt-space-md p-space-sm bg-surface-container-low rounded-lg flex items-center gap-space-sm">
          <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
            <span className="material-symbols-outlined text-[18px]">airline_seat_recline_extra</span>
          </div>
          <div className="flex-1">
            <div className="font-label-md text-label-md font-semibold text-on-surface">
              Siège N° {selectedSeat} ({details.isWindow ? 'Fenêtre' : 'Couloir'} {details.side}, Rangée {details.rowNum})
            </div>
            <div className="font-label-sm text-label-sm text-on-surface-variant">Prise USB dédiée • Climatisation individuelle • Repose-pieds</div>
          </div>
        </div>
      )}

      <div className="mt-space-md overflow-hidden rounded-xl relative shadow-sm">
        <img 
          alt="A modern luxury Scania touring bus driving on the scenic highway from Cotonou to Parakou under soft morning daylight, sleek green and gold Confort Lines livery, cinematic professional photography" 
          className="w-full h-32 object-cover" 
          src="/images/bus-banner.jpg" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-transparent flex items-end p-3">
          <div className="text-on-primary">
            <span className="font-label-sm text-label-sm block opacity-80">Véhicule assigné</span>
            <span className="font-label-md text-label-md font-semibold">Confort Lines VIP • Wi-Fi 4G à bord</span>
          </div>
        </div>
      </div>
    </>
  );
};
