# Fleet Booking Guard

Rental operators lose money in two quiet ways. Two customers get booked onto the same car for overlapping dates. Or a car gets booked back-to-back with no time to clean and inspect it. **Fleet Booking Guard** checks every new booking request against the fleet's calendar. It applies a configurable turnaround buffer (default 4 hours) and blocks any request that would collide. It doesn't stop at "no": it suggests **Smart Alternatives** right away. These are the other cars free for the same window, cheapest first, plus the next free slot on the car the customer asked for. Each time a blocked request is recovered through an alternative, the **Revenue Protected** counter in the header goes up by the days saved × that car's daily rate.

It is a single-page Next.js app that runs end to end on in-memory mock data. It has no login, no payments and no database.

## Run, test, build

```bash
npm install
npm run dev            # http://localhost:3000
npm test               # all unit, component and integration tests
npm run test:coverage  # coverage for src/domain and src/application (90% threshold enforced)
npm run lint           # ESLint (next/core-web-vitals + typescript, no-explicit-any, no-non-null-assertion)
npm run build          # production build (type-checks too)
npm run format         # Prettier
```

Requires Node 18.18+ (developed on Node 22).

**Try it:** the form starts with a Toyota Corolla request for tomorrow. That overlaps a seeded booking, so pressing **Check & book** shows the conflict panel straight away. Pick an alternative and watch the counter in the header go up.

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│ app/              Next.js routes only (layout.tsx, page.tsx)         │
└──────────────┬───────────────────────────────────────────────────────┘
               ▼
┌──────────────────────────────────────────────────────────────────────┐
│ presentation/     React                                              │
│   context/FleetProvider.tsx  ← composition root (wires infra → UCs)  │
│   containers/                ← Dashboard, AppHeader: hooks → props   │
│   hooks/                     ← thin: call a use case, hold UI state  │
│   components/                ← presentational, props + callbacks     │
└──────────────┬───────────────────────────────────────────────────────┘
               ▼
┌──────────────────────────────────────────────────────────────────────┐
│ application/      Use cases + ports (interfaces) + DTOs + Result     │
│   CreateBooking · AcceptAlternative · FindAlternatives               │
│   GetFleetCalendar · GetFleetSummary · GetRevenueProtected           │
│   ports: FleetRepository · BookingRepository · RevenueLedger         │
└──────────────┬───────────────────────────────────▲───────────────────┘
               ▼                                   │ implements
┌──────────────────────────────────┐  ┌────────────┴───────────────────┐
│ domain/   Pure TypeScript        │  │ infrastructure/                │
│   DateRange · Money              │  │   InMemory*Repository          │
│   ConflictDetector               │  │   InMemoryRevenueLedger        │
│   AlternativeFinder              │  │   seed/ (7 cars, 26 bookings)  │
│   RevenueCalculator · FleetMetrics│ └────────────────────────────────┘
└──────────────────────────────────┘
```

Dependencies only point inward. **Why separate the layers?**

- **The rules that cost money live in `domain/`.** They are plain functions over plain objects, with no React, no I/O and no clock. That makes them trivial to test exhaustively and safe to reuse on a server later.
- **Use cases depend on ports, not implementations.** `CreateBooking` doesn't know the data is in memory. Swapping in Postgres or a calendar API means writing a new adapter and changing one file (`FleetProvider.tsx`). The tests for the use cases run against small hand-written fakes.
- **Components are dumb.** `BookingForm`, `ConflictPanel` and `CalendarGrid` receive data and callbacks as props. They can be tested without any business setup and restyled without touching the rules. The two containers (`Dashboard`, `AppHeader`) are the only React code that calls hooks to reach use cases.

I added two small things to the suggested structure:

- `application/ports/RevenueLedger.ts`, because blocked and protected requests need somewhere to live behind an interface.
- `presentation/containers/`, which keeps hooks out of presentational components and keeps `page.tsx` thin.

## UI

The look follows 1Now's site: their coral (`#FE7743`), navy headings, pill buttons with an orange glow, and white cards with soft shadows. The 1NOW logo is the official SVG path, inlined (`presentation/components/LogoMark.tsx`), and the favicon is `app/icon.svg`. Under the hero, a "Fleet · next 14 days" card shows revenue protected, utilization, bookings in view and conflicts blocked. Utilization is computed in the domain (`FleetMetrics`), not in the component.

## Domain rules

- **Intervals are half-open**, `[start, end)`. A booking returning at 10:00 and another picking up at 10:00 touch but don't overlap.
- **Buffer.** Each confirmed booking's effective range is extended by `bufferHours` after its end, and so is the request's. This enforces the turnaround whichever rental comes first ([ADR-004](docs/DECISIONS.md)).
- **Cancelled bookings never conflict.**
- **Alternatives** are the other cars with no conflict for the same window, sorted by daily rate (ascending). Each is priced for the whole window, with days rounded up.
- **Next free slot** is the earliest start at or after the requested start where the requested duration fits, within 30 days, or `null`. The candidates are only the requested start and each blocking booking's buffer end, so the search is exact and cheap.
- **Revenue protected** = Σ ceil(days) × daily rate, in integer cents. A request blocked by `CreateBooking` is recorded in the ledger. It counts as protected once it is recovered with `AcceptAlternative`, either on another car or on the same car at its next free slot. The rate used is the car the customer actually took.

## Scope and what I left out, and why

| Left out                                    | Why                                                                                                                                                                                                               |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Authentication**                          | This is a single-operator demo. Auth adds a provider, sessions and route guards, and none of that shows off the booking logic. Adding it later is a matter of putting middleware in front of the existing routes. |
| **Payments**                                | Revenue here is an estimate (days × rate) used to show value. Real charges, deposits and refunds belong to a payment provider and are a separate project.                                                         |
| **Real calendar sync** (Google, Turo, etc.) | Sync needs OAuth, webhooks and reconciliation. The `BookingRepository` port is the place where a synced source would plug in.                                                                                     |
| **Database / persistence**                  | The spec asks for in-memory data. Repositories are behind interfaces, so persistence is an adapter swap. Data resets on page reload by design.                                                                    |
| **Async ports**                             | In-memory repositories are synchronous, so the ports are too. That keeps hooks free of loading races. A real adapter would make the ports return `Promise`s, and the hooks are already shaped to absorb that.     |
| **Time zones**                              | All times are the browser's local time, which is what `datetime-local` inputs give you. A multi-location operator would need per-branch zones.                                                                    |

## Testing strategy

- **Domain (`tests/domain/`)** covers each rule at its edges: half-open adjacency, containment, a 2-hour gap with 4h vs 0h buffer, the buffer applied _before_ an existing pickup, cancelled bookings, other cars, rounding partial days up, and exact cent arithmetic.
- **Application (`tests/application/`)** runs the use cases against hand-written fakes (`tests/application/fakes.ts`), never the seed. These tests check what gets saved and what gets recorded in the ledger.
- **Presentation (`tests/presentation/`)** uses React Testing Library with user-event and checks behaviour through accessible roles and labels: inline validation tied to the field via `aria-describedby`, price ordering, and callback payloads. One integration test renders the real composition root and goes through blocked → accept cheapest alternative → confirmed → revenue counter changes.
- **Infrastructure (`tests/infrastructure/`)** checks that the seed itself is consistent (no confirmed booking conflicts under a 4h buffer).

Pure logic tests run in the `node` environment. Component tests opt into `jsdom` with a docblock, which keeps the suite fast.

**Results:** 60 tests in 15 files, all passing. Coverage on `src/domain` and `src/application` is **100%** for statements, branches, functions and lines. The 90% threshold is enforced in `vitest.config.mts`.

## Next steps

1. **Persistence and async ports.** A Postgres or Supabase adapter, with the ports returning `Promise`s and an exclusion constraint (`tstzrange` + `EXCLUDE USING gist`) as a database-level backstop against races.
2. **Server-side checks.** Move `CreateBooking` behind a Server Action so two operators can't race each other from the client.
3. **Drag to book on the timeline.** Select a window directly on a car's row to pre-fill the form.
4. **Per-car or per-category buffers** (vans need longer turnarounds than economy cars) and branch time zones.
5. **Revenue analytics.** A breakdown of protected revenue by car and week, and conversion of blocked requests into accepted alternatives.
6. **Calendar sync adapters** for the marketplaces operators already list on.

More context on the design choices is in [`docs/DECISIONS.md`](docs/DECISIONS.md).
