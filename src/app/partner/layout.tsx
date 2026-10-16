'use client';

import React from 'react';
import '../globals.css';
import { AuthProvider, RoleGuard } from '@/lib/auth';
import { PartnerSidebar } from '@/components/partner/PartnerSidebar';

import { usePathname } from 'next/navigation';

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/partner/login';

  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block" rel="stylesheet" />
      </head>
      <body className="bg-[#0B1929] text-slate-100 font-sans antialiased min-h-screen">
        <AuthProvider>
          {isLoginPage ? (
            children
          ) : (
            <RoleGuard
              allowedRoles={['partner', 'admin']}
              fallback={
                <div className="min-h-screen flex items-center justify-center bg-[#0B1929] text-white p-6">
                  <div className="max-w-md w-full bg-[#122236] rounded-2xl p-8 border border-slate-700/50 text-center shadow-xl">
                    <div className="w-14 h-14 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="material-symbols-outlined text-[28px]">lock</span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Accès Partenaire Restreint</h2>
                    <p className="text-sm text-slate-400 mb-6">
                      Cette interface est réservée aux compagnies de transport partenaires. 
                      Connectez-vous avec votre compte <strong>partenaire</strong>.
                    </p>
                    <a
                      href="/partner/login"
                      className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs transition-all shadow-md"
                    >
                      Aller à la connexion Compagnie
                    </a>
                  </div>
                </div>
              }
            >
              <div className="flex min-h-screen bg-[#F0F4F8] text-slate-900">
                <PartnerSidebar />
                <div className="flex-1 flex flex-col min-w-0">
                  {children}
                </div>
              </div>
            </RoleGuard>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}
