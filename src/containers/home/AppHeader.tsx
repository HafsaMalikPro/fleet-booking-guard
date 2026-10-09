'use client';

import { Header } from '@/src/components/navigation/Header';
import { useRevenueProtected } from '@/src/hooks/useFleetCalendar';

export function AppHeader() {
  return <Header revenueCents={useRevenueProtected()} />;
}
