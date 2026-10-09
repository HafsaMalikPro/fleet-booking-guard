import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import { FleetProvider } from '@/presentation/context/FleetProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'Fleet Booking Guard · 1Now',
  description: 'Block double-bookings and back-to-back rentals before they cost you money.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased">
        <FleetProvider>{children}</FleetProvider>
      </body>
    </html>
  );
}
