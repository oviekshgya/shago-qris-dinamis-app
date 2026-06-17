import { findTag, parseTlv } from './tlv';
import type { MerchantInfo, TlvNode } from './types';

const PROVIDER_LABELS: Record<string, string> = {
  'ID.CO.QRIS.WWW': 'QRIS',
  'COM.GO-JEK.WWW': 'GoPay',
  'ID.CO.OVO.WWW': 'OVO',
  'ID.CO.DANA.WWW': 'DANA',
  'ID.CO.LINKAJA.WWW': 'LinkAja',
  'ID.CO.SHOPEE.WWW': 'ShopeePay',
  'ID.CO.BCA.WWW': 'BCA',
  'ID.CO.BRI.WWW': 'BRI',
  'ID.CO.BNI.WWW': 'BNI',
  'ID.CO.MANDIRI.WWW': 'Mandiri',
};

export function parseQrisPayload(payload: string): TlvNode[] {
  return parseTlv(payload.trim());
}

export function extractMerchantInfo(nodes: TlvNode[]): MerchantInfo {
  const merchantAccountInfo = findMerchantAccountInfo(nodes);
  const merchantAccountGui = merchantAccountInfo?.children?.find((node) => node.tag === '00')?.value;
  const merchantAccountProvider = merchantAccountGui
    ? (PROVIDER_LABELS[merchantAccountGui.toUpperCase()] ?? merchantAccountGui)
    : undefined;

  return {
    pointOfInitiationMethod: findTag(nodes, '01')?.value,
    merchantCategoryCode: findTag(nodes, '52')?.value,
    countryCode: findTag(nodes, '58')?.value,
    merchantName: findTag(nodes, '59')?.value,
    merchantCity: findTag(nodes, '60')?.value,
    merchantAccountTag: merchantAccountInfo?.tag,
    merchantAccountProvider,
    merchantAccountGui,
  };
}

function findMerchantAccountInfo(nodes: TlvNode[]): TlvNode | undefined {
  return nodes.find((node) => {
    const tagNumber = Number(node.tag);
    return tagNumber >= 26 && tagNumber <= 51;
  });
}
