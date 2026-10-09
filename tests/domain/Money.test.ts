import { describe, expect, it } from 'vitest';
import { InvalidMoneyError } from '@/domain/errors/DomainError';
import { addMoney, money, multiplyMoney, toDecimal } from '@/domain/value-objects/Money';

describe('Money', () => {
  it('only accepts integer cents', () => {
    expect(() => money(10.5)).toThrow(InvalidMoneyError);
    expect(money(1050).cents).toBe(1050);
  });

  it('adds without floating-point drift', () => {
    // 0.1 + 0.2 !== 0.3 in floats; in cents it is exact.
    expect(toDecimal(addMoney(money(10), money(20)))).toBe(0.3);
  });

  it('multiplies only by whole factors', () => {
    expect(multiplyMoney(money(4599), 3).cents).toBe(13797);
    expect(() => multiplyMoney(money(100), 1.5)).toThrow(InvalidMoneyError);
  });
});
