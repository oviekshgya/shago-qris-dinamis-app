import { describe, expect, it } from 'vitest';
import { generateUniqueCode } from './uniqueCode';
import type { LocalTransaction } from './types';

function transaction(baseAmount: number, uniqueCode: number, status: 'UNVERIFIED' | 'CHECKED' = 'UNVERIFIED'): LocalTransaction {
  return {
    id: `${baseAmount}-${uniqueCode}`,
    baseAmount,
    uniqueCode,
    amount: baseAmount + uniqueCode,
    qrisPayload: '',
    createdAt: new Date().toISOString(),
    status,
  };
}

describe('unique code generator', () => {
  it('uses a random available code for the same active base amount', () => {
    const code = generateUniqueCode(15000, 10_000_000, [transaction(15000, 1), transaction(15000, 2)], 5, () => 0.5);

    expect(code).toBe(4);
  });

  it('ignores checked transactions and other base amounts', () => {
    const code = generateUniqueCode(15000, 10_000_000, [
      transaction(15000, 1, 'CHECKED'),
      transaction(20000, 1),
    ], 99, () => 0);

    expect(code).toBe(1);
  });

  it('caps default random code at 99', () => {
    const code = generateUniqueCode(15000, 10_000_000, [], undefined, () => 0.999);

    expect(code).toBe(99);
  });

  it('throws when max amount leaves no room for a code', () => {
    expect(() => generateUniqueCode(10_000_000, 10_000_000, [])).toThrow('Nominal maksimal');
  });
});
