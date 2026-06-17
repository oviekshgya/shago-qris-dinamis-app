import { isCrcValid } from './crc16';
import { extractMerchantInfo, parseQrisPayload } from './qrisParser';
import { findTag } from './tlv';
import type { ValidationResult } from './types';

export function validateQrisStatic(payload: string): ValidationResult {
  const errors: string[] = [];
  const normalized = payload.trim();

  if (!normalized) {
    return { valid: false, errors: ['Payload QRIS wajib diisi.'] };
  }

  if (!/^[\x20-\x7E]+$/.test(normalized)) {
    errors.push('Payload hanya boleh berisi karakter ASCII printable.');
  }

  try {
    const nodes = parseQrisPayload(normalized);
    const payloadFormat = findTag(nodes, '00')?.value;
    const pointOfInitiationMethod = findTag(nodes, '01')?.value;
    const crc = findTag(nodes, '63')?.value;

    if (payloadFormat !== '01') {
      errors.push('Payload format indicator tag 00 harus bernilai 01.');
    }

    if (pointOfInitiationMethod === '12') {
      errors.push('Payload setup harus QRIS static, bukan QRIS dynamic/nominal.');
    }

    if (!crc || crc.length !== 4) {
      errors.push('Tag CRC 63 dengan panjang 04 wajib ada di akhir payload.');
    } else if (!isCrcValid(normalized)) {
      errors.push('CRC QRIS tidak valid.');
    }

    if (!findTag(nodes, '59')?.value) {
      errors.push('Merchant name tag 59 tidak ditemukan.');
    }

    if (!findTag(nodes, '60')?.value) {
      errors.push('Merchant city tag 60 tidak ditemukan.');
    }

    if (!findTag(nodes, '58')?.value) {
      errors.push('Country code tag 58 tidak ditemukan.');
    }

    return {
      valid: errors.length === 0,
      errors,
      merchantInfo: extractMerchantInfo(nodes),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Payload QRIS tidak dapat dibaca.';
    return { valid: false, errors: [...errors, message] };
  }
}

export function validateAmount(amount: number, maxAmount: number): string | null {
  if (!Number.isFinite(amount)) {
    return 'Nominal tidak valid.';
  }

  if (amount < 1000) {
    return 'Nominal minimal Rp1.000.';
  }

  if (amount > maxAmount) {
    return `Nominal maksimal Rp${maxAmount.toLocaleString('id-ID')}.`;
  }

  return null;
}
