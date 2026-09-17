import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { MapPin, Calendar, Users } from 'lucide-react';
import Link from 'next/link';

export default function SearchPage() {
  const t = useTranslations('Search');
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Hero Header Section */}
      <div className="bg-brand-blue pt-12 pb-32 px-6 md:px-12 rounded-b-[40px] md:rounded-b-[60px]">
        <h1 className="text-3xl md:text-4xl font-bold text-white text-center max-w-lg mx-auto leading-tight">
          {t('title')}
        </h1>
      </div>

      {/* Search Form Card */}
      <div className="px-4 md:px-12 -mt-20">
        <Card className="max-w-4xl mx-auto shadow-lg border-none" noPadding>
          <div className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label={t('from')} 
                placeholder="Ex: Cotonou" 
                icon={<MapPin className="w-5 h-5 text-gray-400" />}
              />
              <Input 
                label={t('to')} 
                placeholder="Ex: Parakou" 
                icon={<MapPin className="w-5 h-5 text-gray-400" />}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label={t('date')} 
                type="date" 
                icon={<Calendar className="w-5 h-5 text-gray-400" />}
              />
              <Input 
                label={t('passengers')} 
                type="number" 
                defaultValue={1}
                min={1}
                icon={<Users className="w-5 h-5 text-gray-400" />}
              />
            </div>

            <div className="pt-4">
              <Link href={`/${locale}/results`} className="block w-full">
                <Button size="lg" fullWidth variant="primary" className="text-brand-blue shadow-md hover:shadow-lg">
                  {t('searchButton')}
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Links or Featured Routes (Optional for Phase 1) */}
      <div className="px-4 md:px-12 mt-12 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-brand-darkGray mb-4">Trajets Populaires</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="cursor-pointer hover:shadow-md transition">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-brand-blue">Cotonou</p>
                  <p className="text-sm text-gray-500">Vers Parakou</p>
                </div>
                <div className="bg-brand-yellow/20 p-2 rounded-full">
                  <MapPin className="w-5 h-5 text-brand-yellowHover" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
