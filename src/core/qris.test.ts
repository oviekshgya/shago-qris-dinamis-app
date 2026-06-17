import { describe, expect, it } from 'vitest';
import { appendCrc, crc16CcittFalse, getPayloadCrc, isCrcValid, stripCrc } from './crc16';
import { extractMerchantInfo } from './qrisParser';
import { convertStaticToDynamicPayload } from './qrisConverter';
import { encodeTlv, parseTlv } from './tlv';

const STATIC_WITHOUT_CRC =
  encodeTlv('00', '01') +
  encodeTlv('01', '11') +
  encodeTlv(
    '26',
    encodeTlv('00', 'COM.EXAMPLE.QRIS') +
      encodeTlv('01', '936009000000000000') +
      encodeTlv('02', 'ID1020304050607'),
  ) +
  encodeTlv('52', '5999') +
  encodeTlv('53', '360') +
  encodeTlv('58', 'ID') +
  encodeTlv('59', 'TOKO CONTOH 1') +
  encodeTlv('60', 'JAKARTA');
const STATIC_QRIS = appendCrc(STATIC_WITHOUT_CRC);

describe('TLV parser', () => {
  it('parses flat and nested TLV fields', () => {
    const nodes = parseTlv(STATIC_QRIS);
    const merchantAccount = nodes.find((node) => node.tag === '26');

    expect(nodes[0]).toMatchObject({ tag: '00', length: 2, value: '01' });
    expect(merchantAccount?.children?.[0]).toMatchObject({ tag: '00', value: 'COM.EXAMPLE.QRIS' });
  });

  it('extracts merchant account provider metadata', () => {
    const merchantInfo = extractMerchantInfo(parseTlv(STATIC_QRIS));

    expect(merchantInfo.merchantAccountTag).toBe('26');
    expect(merchantInfo.merchantAccountProvider).toBe('COM.EXAMPLE.QRIS');
    expect(merchantInfo.merchantAccountGui).toBe('COM.EXAMPLE.QRIS');
  });
});

describe('CRC16 CCITT-FALSE', () => {
  it('matches the standard check value', () => {
    expect(crc16CcittFalse('123456789')).toBe('29B1');
  });

  it('removes old CRC and appends a new valid CRC', () => {
    const withCrc = appendCrc(STATIC_WITHOUT_CRC);

    expect(stripCrc(withCrc)).toBe(STATIC_WITHOUT_CRC);
    expect(getPayloadCrc(withCrc)).toMatch(/^[0-9A-F]{4}$/);
    expect(isCrcValid(withCrc)).toBe(true);
  });
});

describe('QRIS converter', () => {
  it('updates tag 01 to dynamic value 12', () => {
    const output = convertStaticToDynamicPayload(STATIC_QRIS, 15000);
    const nodes = parseTlv(output);

    expect(nodes.find((node) => node.tag === '01')?.value).toBe('12');
  });

  it('inserts amount tag 54 when it is missing', () => {
    const output = convertStaticToDynamicPayload(STATIC_QRIS, 15000);
    const nodes = parseTlv(output);

    expect(nodes.find((node) => node.tag === '54')?.value).toBe('15000');
    expect(isCrcValid(output)).toBe(true);
  });

  it('updates amount tag 54 when it already exists', () => {
    const dynamicOnce = convertStaticToDynamicPayload(STATIC_QRIS, 15000);
    const dynamicTwice = convertStaticToDynamicPayload(dynamicOnce, 27500);
    const nodes = parseTlv(dynamicTwice);

    expect(nodes.filter((node) => node.tag === '54')).toHaveLength(1);
    expect(nodes.find((node) => node.tag === '54')?.value).toBe('27500');
    expect(isCrcValid(dynamicTwice)).toBe(true);
  });

  it('removes old CRC and appends a new CRC', () => {
    const output = convertStaticToDynamicPayload(STATIC_QRIS, 15000);

    expect(output).not.toContain(getPayloadCrc(STATIC_QRIS) ?? '');
    expect(getPayloadCrc(output)).toMatch(/^[0-9A-F]{4}$/);
    expect(isCrcValid(output)).toBe(true);
  });
});
