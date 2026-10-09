import { AppHeader } from '@/presentation/containers/AppHeader';
import { Dashboard } from '@/presentation/containers/Dashboard';

export default function HomePage() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            Booking guard
          </p>
          <h1 className="mt-2 text-3xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-5xl">
            Book without the <span className="text-brand-500">double-booking.</span>
          </h1>
          <p className="mt-3 text-base text-ink/60">
            Every request is checked against your fleet with a turnaround buffer. If a car is taken,
            we suggest the best-priced alternative instantly.
          </p>
        </div>
        <Dashboard />
      </main>
    </>
  );
}
