import type { LocalTransaction } from './types';

const DEFAULT_MAX_UNIQUE_CODE = 99;

export function generateUniqueCode(
  baseAmount: number,
  maxAmount: number,
  transactions: LocalTransaction[],
  maxUniqueCode = DEFAULT_MAX_UNIQUE_CODE,
  random = Math.random,
): number {
  const upperBound = Math.min(maxUniqueCode, Math.max(0, maxAmount - baseAmount));

  if (upperBound < 1) {
    throw new Error('Nominal maksimal tidak cukup untuk menambahkan kode unik.');
  }

  const activeCodes = new Set(
    transactions
      .filter((transaction) => transaction.status === 'UNVERIFIED')
      .filter((transaction) => (transaction.baseAmount ?? transaction.amount) === baseAmount)
      .map((transaction) => transaction.uniqueCode)
      .filter((code): code is number => typeof code === 'number' && code >= 1),
  );

  const availableCodes: number[] = [];

  for (let code = 1; code <= upperBound; code += 1) {
    if (!activeCodes.has(code)) availableCodes.push(code);
  }

  if (availableCodes.length === 0) {
    throw new Error('Kode unik untuk nominal ini sedang penuh. Tandai transaksi lama sebagai sudah dicek atau hapus dulu.');
  }

  const randomIndex = Math.floor(random() * availableCodes.length);
  return availableCodes[Math.min(randomIndex, availableCodes.length - 1)];
}
