/** Base class for violations of domain invariants. */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

function describe(date: Date): string {
  return Number.isNaN(date.getTime()) ? 'invalid date' : date.toISOString();
}

export class InvalidDateRangeError extends DomainError {
  constructor(start: Date, end: Date) {
    super(`Invalid date range: end (${describe(end)}) must be after start (${describe(start)}).`);
  }
}

export class InvalidMoneyError extends DomainError {
  constructor(cents: number) {
    super(`Money must be an integer number of cents, received ${cents}.`);
  }
}
