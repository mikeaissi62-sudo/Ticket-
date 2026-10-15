import type { Metadata } from "next";
import "../globals.css";
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import { Header } from "../../components/traveler/Header";
import { Footer } from "../../components/traveler/Footer";
import { ChatAssistant } from "../../components/traveler/ChatAssistant";
import { AuthProvider } from "@/lib/auth/client-guards";

export const metadata: Metadata = {
  title: "Ticket+ Bénin | Réservation de bus",
  description: "Comparez les horaires, réservez vos places de bus et recevez votre e-billet instantanément. Cotonou, Parakou, Natitingou, Bohicon.",
};

export default async function RootLayout({
  children,
  params: {locale}
}: Readonly<{
  children: React.ReactNode;
  params: {locale: string};
}>) {
  if (!['fr', 'en'].includes(locale)) {
    notFound();
  }
 
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block" rel="stylesheet" />
      </head>
      <body className="bg-background font-body-md text-on-surface antialiased min-h-screen" style={{ background: 'linear-gradient(135deg, #D4DFEE 0%, #DFE8F4 50%, #D8E3F0 100%)' }}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <Header />
            <main className="w-full pt-20 min-h-screen" style={{ background: 'transparent' }}>
              {children}
            </main>
            <Footer />
            <ChatAssistant />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
