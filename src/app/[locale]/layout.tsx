import type { Metadata } from "next";
import localFont from "next/font/local";
import "../globals.css";
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import { AppLayout } from "../../components/layout/AppLayout";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Ticket+ | Book your bus tickets",
  description: "SaaS de réservation de bus pour les voyageurs africains",
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-brand-darkGray`}>
        <NextIntlClientProvider messages={messages}>
          <AppLayout>
            {children}
          </AppLayout>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
