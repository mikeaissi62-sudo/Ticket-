'use client';

import React from 'react';
import { AuthProvider, RoleGuard } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block" rel="stylesheet" />
      </head>
      <body className="bg-slate-50 text-slate-900 font-sans antialiased min-h-screen">
        <AuthProvider>
          <RoleGuard
            allowedRoles={['admin']}
            redirectTo="/login"
            fallback={
              <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
                <div className="max-w-md w-full bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center shadow-xl">
                  <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-[28px]">lock</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Accès Administrateur Restreint</h2>
                  <p className="text-sm text-slate-400 mb-6">
                    Cette interface nécessite des privilèges de rôle <strong>admin</strong>. Veuillez vous connecter avec un compte autorisé.
                  </p>
                  <a
                    href="/fr/login"
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all shadow-md"
                  >
                    Aller à la connexion
                  </a>
                </div>
              </div>
            }
          >
            <div className="flex min-h-screen">
              <AdminSidebar />
              <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
                {children}
              </div>
            </div>
          </RoleGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
