import { ShieldCheck } from 'lucide-react';
import { AppHeader } from '@/src/containers/home/AppHeader';
import { Dashboard } from '@/src/containers/home/Dashboard';
import { HIGHLIGHTS } from '@/src/constants/home';

export default function Home() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <section className="pb-10 pt-12 sm:pb-14 sm:pt-16">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-500 sm:text-sm">
            Built for car rental operators
          </p>
          <h1 className="mt-4 max-w-4xl text-[2.6rem] font-bold leading-[1.04] tracking-[-0.03em] text-ink sm:text-[3.5rem]">
            Prevent double bookings.
            <br />
            <span className="text-brand-500">Protect every rental.</span>
          </h1>
          <p className="mt-6 max-w-[660px] text-lg leading-normal text-muted sm:text-xl">
            Every request is checked against your whole fleet, including the time you need to clean
            and inspect between rentals. If a car is taken, we suggest the best-priced alternative
            instantly.
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-brand-500" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </section>
        <Dashboard />
      </main>
    </>
  );
}
