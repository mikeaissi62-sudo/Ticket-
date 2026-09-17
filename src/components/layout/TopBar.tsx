'use client';
import React from 'react';
import { Bell, User, Zap, CreditCard } from 'lucide-react';
import Link from 'next/link';

export const TopBar = () => {
  return (
    <div className="md:hidden bg-brand-darkBlue text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      {/* Left: Logo */}
      <div className="flex items-center space-x-2">
        <div className="bg-brand-yellow p-1.5 rounded flex items-center justify-center">
          <Zap className="w-5 h-5 text-brand-darkBlue" fill="currentColor" />
        </div>
        <div className="flex flex-col leading-none">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg leading-none">Tripflash</span>
            <span className="bg-brand-blue text-[10px] px-1.5 py-0.5 rounded-full font-semibold border border-brand-lightBlue">CEDEAO</span>
          </div>
          <span className="text-[10px] text-gray-300 mt-0.5">Accueil</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-3">
        <button className="bg-brand-yellow text-brand-darkBlue text-xs font-bold px-3 py-1.5 rounded-full flex items-center space-x-1 shadow-sm">
          <CreditCard className="w-3 h-3" />
          <span>MoMo Pay</span>
        </button>
        <button className="text-white hover:text-gray-200">
          <Bell className="w-5 h-5" />
        </button>
        <button className="w-7 h-7 bg-brand-blue rounded-full flex items-center justify-center border border-brand-lightBlue text-white hover:bg-brand-lightBlue transition">
          <User className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
