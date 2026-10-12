import Link from 'next/link';

export default function RootNotFound() {
  return (
    <html lang="fr">
      <body className="min-h-screen flex items-center justify-center bg-[#F8FAFC] font-sans">
        <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-[#E2E8F0] max-w-md mx-auto">
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">Page non trouvée (404)</h2>
          <p className="text-sm text-[#64748B] mb-4">La page demandée n&apos;existe pas ou a été déplacée.</p>
          <Link
            href="/fr"
            className="inline-block px-4 py-2 bg-[#0F172A] text-white text-sm font-semibold rounded-xl hover:bg-[#1E293B] transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </body>
    </html>
  );
}
