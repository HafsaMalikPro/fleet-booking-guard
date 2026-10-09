import { ShieldCheck } from 'lucide-react';
import { AppHeader } from '@/presentation/containers/AppHeader';
import { Dashboard } from '@/presentation/containers/Dashboard';

const HIGHLIGHTS = ['Overlap detection', '4h turnaround buffer', 'Cheapest alternative first'];

export default function HomePage() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <section className="pb-10 pt-12 sm:pb-14 sm:pt-16">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-500 sm:text-sm">
            Built for car rental operators
          </p>
          <h1 className="mt-4 max-w-3xl text-[2.6rem] font-extrabold leading-[1.02] tracking-[-0.035em] text-ink sm:text-6xl lg:text-7xl">
            Book without the
            <br />
            <span className="text-brand-500">double-booking.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink/60 sm:text-lg">
            Every request is checked against your whole fleet, including the time you need to clean
            and inspect between rentals. If a car is taken, we suggest the best-priced alternative
            instantly.
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink/55">
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
