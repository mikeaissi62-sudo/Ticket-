import {useTranslations} from 'next-intl';
import Link from 'next/link';

export default function HomePage() {
  const t = useTranslations('Search');
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-brand-blue mb-8">Ticket+</h1>
      <Link 
        href="/search"
        className="px-6 py-3 bg-brand-yellow text-white font-semibold rounded-full hover:bg-brand-yellowHover transition"
      >
        {t('title')}
      </Link>
    </div>
  );
}
