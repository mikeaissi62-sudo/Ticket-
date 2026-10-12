'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex items-center justify-center bg-[#F8FAFC] font-sans">
        <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-[#E2E8F0] max-w-md mx-auto">
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">Une erreur inattendue est survenue</h2>
          <p className="text-sm text-[#64748B] mb-4">Veuillez rafraîchir la page ou réessayer.</p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-[#0F172A] text-white text-sm font-semibold rounded-xl hover:bg-[#1E293B] transition-colors"
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
