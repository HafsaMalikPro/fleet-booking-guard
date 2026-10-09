# Architecture Decision Records

## ADR-001: Half-open intervals `[start, end)`

**Context.** A car returned at 10:00 can, with no buffer, be picked up again at 10:00. With closed intervals, those two bookings share the instant 10:00 and would count as a conflict.

**Decision.** Every `DateRange` is half-open. `overlaps(a, b)` is `a.start < b.end && b.start < a.end`.

**Consequences.** Adjacent bookings never conflict, and the buffer becomes the only way to require a gap. Durations are simply `end - start`, and joining ranges never double-counts an instant.

## ADR-002: Money as integer cents

**Context.** Revenue accumulates across many requests. Binary floating point can't represent values like 0.1 exactly, and the errors compound over sums.

**Decision.** The `Money` value object stores a safe integer number of cents. `money()` rejects non-integers, and `multiplyMoney` only accepts integer factors (days are already rounded up). Conversion to dollars happens only at the display edge in `formatCurrency`.

**Consequences.** Totals are exact and tests can assert equality. Supporting several currencies would need a currency field. That is out of scope.

## ADR-003: Result types for expected outcomes, exceptions for broken invariants

**Context.** A conflicting booking request is a normal business outcome, not an error. Throwing for it would force `try/catch` into the UI and hide the outcome from the type system.

**Decision.** Use cases return `Result<T, E> = { ok: true, value } | { ok: false, error }`. `CreateBooking` returns `ok({ status: 'created' | 'conflict', ... })` and uses `err(ValidationError)` for bad input. The domain still throws `DomainError` when an invariant is violated (for example `end <= start`). The use case validates input before building a `DateRange`, so a `DomainError` reaching the UI would mean a bug.

**Consequences.** Callers must handle every case, and TypeScript narrows on `ok` and `status`. Validation errors carry a `field`, so the form can show them next to the right input.

## ADR-004: The buffer applies to whichever rental comes first

**Context.** The brief extends an existing booking's range by `bufferHours` after its end. Applied only to existing bookings, a _new_ request could return 10 minutes before an existing pickup and still pass. That is exactly the back-to-back problem the feature exists to prevent.

**Decision.** `ConflictDetector` extends both the request and each existing booking by the buffer after their ends, then checks the half-open overlap. Since the buffer comes after each range's end, this is the same as requiring a gap of at least `bufferHours` between any two rentals on the same car, in either order.

**Consequences.** Every scenario stated in the brief behaves as specified, for example a pickup 2h after a return conflicts with a 4h buffer and is fine with 0h. In addition, a request ending inside an existing booking's buffer window is now also blocked, which has its own test. `AlternativeFinder` reuses the same detector, so suggested slots always honour the buffer on both sides.

## ADR-005: Synchronous ports and a single client-side composition root

**Context.** Data is in memory and has to survive client navigation but not reloads. There is no server state to fetch.

**Decision.** The repository ports are synchronous. `FleetProvider` builds the repositories, seed and use cases once per mount (`useState` initializer). It exposes them through context with a `version` counter that is bumped after each mutation, and the hooks re-query when it changes. It is the only file that imports from `infrastructure/`.

**Consequences.** There are no loading races and no state library. The trade-off is that moving to a real backend means changing the port signatures to return `Promise`s and adding loading states to the hooks. That change is contained to `application/ports`, the adapters and two hooks.
