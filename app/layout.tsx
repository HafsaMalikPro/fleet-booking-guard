import type { Metadata } from 'next';
import { Geist, Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import { FleetProvider } from '@/src/context/FleetProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' });

export const metadata: Metadata = {
  title: 'Fleet Booking Guard · 1Now',
  description: 'Block double-bookings and back-to-back rentals before they cost you money.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${geist.variable}`}>
      {/* Browser extensions (e.g. ColorZilla) add attributes to <body> before hydration. */}
      <body className="min-h-screen font-sans antialiased" suppressHydrationWarning>
        <FleetProvider>{children}</FleetProvider>
      </body>
    </html>
  );
}
