'use client';

import { Header } from '../components/Header';
import { useRevenueProtected } from '../hooks/useFleetCalendar';

export function AppHeader() {
  return <Header revenueCents={useRevenueProtected()} />;
}
