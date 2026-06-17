import { appendCrc } from './crc16';
import { parseTlv, removeTag, serializeTlv, upsertTag } from './tlv';

export function formatAmountForQris(amount: number): string {
  if (!Number.isInteger(amount)) {
    return amount.toFixed(2);
  }

  return String(amount);
}

export function convertStaticToDynamicPayload(staticPayload: string, amount: number): string {
  const amountText = formatAmountForQris(amount);
  const nodesWithoutCrc = removeTag(parseTlv(staticPayload.trim()), '63');
  const withDynamicPoi = upsertTag(nodesWithoutCrc, '01', '12', ['26', '27', '28', '29', '30', '31']);
  const withAmount = upsertTag(withDynamicPoi, '54', amountText, ['58', '59', '60']);
  const payloadWithoutCrc = serializeTlv(withAmount);

  return appendCrc(payloadWithoutCrc);
}
