const POLYNOMIAL = 0x1021;
const INITIAL_VALUE = 0xffff;

export function crc16CcittFalse(input: string): string {
  let crc = INITIAL_VALUE;

  for (let index = 0; index < input.length; index += 1) {
    crc ^= input.charCodeAt(index) << 8;

    for (let bit = 0; bit < 8; bit += 1) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ POLYNOMIAL;
      } else {
        crc <<= 1;
      }

      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function stripCrc(payload: string): string {
  const normalized = payload.trim();
  const crcIndex = normalized.lastIndexOf('6304');

  if (crcIndex === -1) {
    return normalized;
  }

  return normalized.slice(0, crcIndex);
}

export function appendCrc(payloadWithoutCrc: string): string {
  const base = stripCrc(payloadWithoutCrc);
  const crc = crc16CcittFalse(`${base}6304`);
  return `${base}6304${crc}`;
}

export function getPayloadCrc(payload: string): string | null {
  const normalized = payload.trim();
  const crcIndex = normalized.lastIndexOf('6304');

  if (crcIndex === -1 || crcIndex + 8 !== normalized.length) {
    return null;
  }

  return normalized.slice(crcIndex + 4);
}

export function isCrcValid(payload: string): boolean {
  const currentCrc = getPayloadCrc(payload);
  if (!currentCrc) {
    return false;
  }

  const calculated = crc16CcittFalse(`${stripCrc(payload)}6304`);
  return currentCrc.toUpperCase() === calculated;
}
