import { InvalidMoneyError } from '../errors/DomainError';

/** Money in integer cents (single currency, USD) to avoid floating-point drift. */
export interface Money {
  readonly cents: number;
}

export function money(cents: number): Money {
  if (!Number.isSafeInteger(cents)) {
    throw new InvalidMoneyError(cents);
  }
  return { cents };
}

export const ZERO: Money = money(0);

export function addMoney(a: Money, b: Money): Money {
  return money(a.cents + b.cents);
}

export function multiplyMoney(amount: Money, factor: number): Money {
  if (!Number.isInteger(factor)) {
    throw new InvalidMoneyError(amount.cents * factor);
  }
  return money(amount.cents * factor);
}

export function toDecimal(amount: Money): number {
  return amount.cents / 100;
}
