import type { TlvNode } from './types';

const NESTED_TAGS = new Set(
  Array.from({ length: 26 }, (_, index) => String(index + 26).padStart(2, '0')),
);

export class TlvParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TlvParseError';
  }
}

export function parseTlv(payload: string, parseNested = true): TlvNode[] {
  const normalized = payload.trim();
  const nodes: TlvNode[] = [];
  let cursor = 0;

  while (cursor < normalized.length) {
    if (cursor + 4 > normalized.length) {
      throw new TlvParseError(`Field TLV tidak lengkap pada posisi ${cursor}.`);
    }

    const tag = normalized.slice(cursor, cursor + 2);
    const lengthText = normalized.slice(cursor + 2, cursor + 4);

    if (!/^\d{2}$/.test(tag)) {
      throw new TlvParseError(`Tag tidak valid pada posisi ${cursor}.`);
    }

    if (!/^\d{2}$/.test(lengthText)) {
      throw new TlvParseError(`Length tidak valid untuk tag ${tag}.`);
    }

    const length = Number(lengthText);
    const valueStart = cursor + 4;
    const valueEnd = valueStart + length;

    if (valueEnd > normalized.length) {
      throw new TlvParseError(`Panjang value tag ${tag} melebihi payload.`);
    }

    const value = normalized.slice(valueStart, valueEnd);
    const node: TlvNode = { tag, length, value };

    if (parseNested && NESTED_TAGS.has(tag)) {
      try {
        const children = parseTlv(value, false);
        if (children.length > 0 && serializeTlv(children) === value) {
          node.children = children;
        }
      } catch {
        // Merchant account info can contain opaque provider data, so nested parsing is best-effort.
      }
    }

    nodes.push(node);
    cursor = valueEnd;
  }

  return nodes;
}

export function serializeTlv(nodes: TlvNode[]): string {
  return nodes.map((node) => encodeTlv(node.tag, node.value)).join('');
}

export function encodeTlv(tag: string, value: string): string {
  if (!/^\d{2}$/.test(tag)) {
    throw new TlvParseError(`Tag ${tag} harus 2 digit.`);
  }

  if (value.length > 99) {
    throw new TlvParseError(`Value tag ${tag} melebihi 99 karakter.`);
  }

  return `${tag}${String(value.length).padStart(2, '0')}${value}`;
}

export function findTag(nodes: TlvNode[], tag: string): TlvNode | undefined {
  return nodes.find((node) => node.tag === tag);
}

export function removeTag(nodes: TlvNode[], tag: string): TlvNode[] {
  return nodes.filter((node) => node.tag !== tag);
}

export function upsertTag(nodes: TlvNode[], tag: string, value: string, beforeTags: string[] = []): TlvNode[] {
  const updated = nodes.map((node) => (node.tag === tag ? { ...node, value, length: value.length } : node));

  if (updated.some((node) => node.tag === tag)) {
    return updated;
  }

  const insertAt = updated.findIndex((node) => beforeTags.includes(node.tag));
  const nextNode: TlvNode = { tag, length: value.length, value };

  if (insertAt === -1) {
    return [...updated, nextNode];
  }

  return [...updated.slice(0, insertAt), nextNode, ...updated.slice(insertAt)];
}
