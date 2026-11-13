/**
 * Bloom filter tracer: a bit array and k hash positions per item.
 *
 * Mirrors Data_Structures/Hashing/Bloom_Filter/Python/bloom_filter.py:
 *   num_bits = ceil(-capacity * ln(error_rate) / (ln 2)^2); num_hashes = max(1, round(num_bits * ln 2 / capacity))
 *   _hash_functions(item): [int(md5(str(item) + str(i)).hexdigest(), 16) % num_bits for i in range(num_hashes)]
 *   add(item): set every one of those bits; contains(item): False at the first 0 bit, else True
 * Python's round() rounds a half to the even neighbour, and the 128-bit digest is reduced with
 * BigInt, so the positions are exactly Python's. Golden fixtures (__fixtures__/hashing.json) pin
 * m, k, the digests and the positions of every item.
 *
 * Input: "n 5, p 0.1; add cat, add dog, contains owl, contains aoo"
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { BloomState } from '../renderers/BloomBitArray';
import type { StripItem } from '../ui/molecules/Strip';
import { scriptSegments } from './hashTable';
import { md5Hex } from './md5';

export type BloomOp = { kind: 'add'; item: string } | { kind: 'contains'; item: string };

export interface BloomInput {
  capacity: number;
  errorRate: number;
  ops: BloomOp[];
}

/** Python's round(x) for a float: a tie goes to the even integer (round(2.5) == 2). */
export function pyRound(x: number): number {
  const f = Math.floor(x);
  const diff = x - f;
  if (diff > 0.5) return f + 1;
  if (diff < 0.5) return f;
  return f % 2 === 0 ? f : f + 1;
}

/** The filter's size: m bits and k hashes, exactly as BloomFilter.__init__ computes them. */
export function bloomSize(capacity: number, errorRate: number): { m: number; k: number } {
  const m = Math.ceil((-capacity * Math.log(errorRate)) / Math.log(2) ** 2);
  const k = Math.max(1, pyRound((m * Math.log(2)) / capacity));
  return { m, k };
}

/** _hash_functions(item): the k bit positions, with the md5 digests they came from. */
export function bloomHashes(item: string, k: number, m: number): Array<{ digest: string; pos: number }> {
  return Array.from({ length: k }, (_, i) => {
    const digest = md5Hex(item + String(i));
    return { digest, pos: Number(BigInt(`0x${digest}`) % BigInt(m)) };
  });
}

export const BLOOM_LIMITS = { maxBits: 64, maxOps: 20, maxCapacity: 100 };

const ITEM = /^[A-Za-z0-9_-]{1,8}$/;

export function parseBloom(text: string): BloomInput {
  let capacity: number | undefined;
  let errorRate: number | undefined;
  const ops: BloomOp[] = [];
  for (const segment of scriptSegments(text)) {
    // "n 5", "capacity 5", "p 0.1", "error 1%" (a segment may hold both settings: "n 5 p 0.1")
    const settings = [...segment.matchAll(/(?:^|\s)(n|cap(?:acity)?|p|err(?:or)?(?:_rate)?|rate)\s*[:=]?\s*(-?[\d.]+)(%?)(?=\s|$)/gi)];
    if (settings.length > 0 && settings.map((m) => m[0]).join('').replace(/\s+/g, '') === segment.replace(/\s+/g, '')) {
      for (const m of settings) {
        const name = m[1].toLowerCase();
        const value = Number(m[2]) / (m[3] ? 100 : 1);
        if (Number.isNaN(value)) throw new InputError(`"${m[2]}" is not a number.`);
        if (name === 'n' || name.startsWith('cap')) {
          if (!Number.isInteger(value) || value <= 0) throw new InputError(`The constructor raises ValueError for capacity ${m[2]}: it must be a positive integer.`);
          if (value > BLOOM_LIMITS.maxCapacity) throw new InputError(`Capacity goes up to ${BLOOM_LIMITS.maxCapacity} here (got ${value}).`);
          capacity = value;
        } else {
          if (!(value > 0 && value < 1)) throw new InputError(`The constructor raises ValueError for error_rate ${m[2]}${m[3]}: it must be strictly between 0 and 1.`);
          errorRate = value;
        }
      }
      continue;
    }
    const m = segment.match(/^(add|a|contains|check|has|in|c)\s*(?:\(\s*['"]?([^'"()]*?)['"]?\s*\)|\s+['"]?([^'"\s]+?)['"]?)$/i);
    if (!m) throw new InputError(`Cannot read "${segment}". Write "n 5, p 0.1" for the size, then operations like "add cat" or "contains dog".`);
    const item = m[2] ?? m[3];
    if (!ITEM.test(item)) throw new InputError(`Items are 1 to 8 letters, digits, "_" or "-" (got "${item}").`);
    ops.push({ kind: m[1].toLowerCase() === 'add' || m[1].toLowerCase() === 'a' ? 'add' : 'contains', item });
  }
  if (ops.length === 0) throw new InputError('Add at least one operation, for example "n 5, p 0.1; add cat, contains dog".');
  if (ops.length > BLOOM_LIMITS.maxOps) throw new InputError(`At most ${BLOOM_LIMITS.maxOps} operations, please (got ${ops.length}).`);
  const input = { capacity: capacity ?? 5, errorRate: errorRate ?? 0.01, ops };
  const { m } = bloomSize(input.capacity, input.errorRate);
  if (m > BLOOM_LIMITS.maxBits) {
    throw new InputError(`n ${input.capacity} at p ${input.errorRate} needs m = ${m} bits; keep m at ${BLOOM_LIMITS.maxBits} or fewer so every bit fits (a smaller n or a larger p).`);
  }
  return input;
}

export function formatBloomOp(op: BloomOp): string {
  return `${op.kind}('${op.item}')`;
}

export const BLOOM_CODE = [
  '__init__(capacity, error_rate):',
  '  num_bits = ceil(-capacity * ln(error_rate) / ln(2)**2)',
  '  num_hashes = max(1, round(num_bits * ln(2) / capacity))',
  '_hash_functions(item):',
  '  return [int(md5(str(item) + str(i)).hexdigest(), 16) % num_bits',
  '          for i in range(num_hashes)]',
  'add(item):',
  '  for h in _hash_functions(item): bits[h] = 1',
  'contains(item):',
  '  for h in _hash_functions(item):',
  '    if not bits[h]: return False     # definitely never added',
  '  return True                        # maybe: all k bits are 1',
];

const L = { init: 2, hashes: 4, set: 7, check: 10, maybe: 11 };

export interface BloomStep {
  op: BloomOp;
  /** add: null; contains: the boolean. */
  result: boolean | null;
  positions: number[];
  /** Indices of the 1 bits after the operation. */
  set: number[];
}

export interface BloomRun {
  frames: Array<Frame<BloomState>>;
  steps: BloomStep[];
  m: number;
  k: number;
}

const short = (digest: string) => `0x${digest.slice(0, 6)}...${digest.slice(-4)}`;

export function bloomTrace({ capacity, errorRate, ops }: BloomInput): BloomRun {
  const { m, k } = bloomSize(capacity, errorRate);
  const bits = new Array<0 | 1>(m).fill(0);
  /** Which added items set each bit (in add order), to explain a false positive. */
  const setters: string[][] = Array.from({ length: m }, () => []);
  const added: string[] = [];
  let current = -1;
  const frames: Array<Frame<BloomState>> = [];
  const steps: BloomStep[] = [];
  const ones = () => bits.reduce<number>((s, b) => s + b, 0);

  const opStrip = () => ({
    label: 'Operations',
    items: ops.map((op, i): StripItem => ({ text: formatBloomOp(op), role: i === current ? 'active' : i < current ? 'muted' : undefined })),
  });

  const snap = (line: number | undefined, caption: string, o: { roles?: Record<number, Role>; hashes?: StripItem[]; vars?: Array<[string, string | number]> } = {}) => {
    frames.push({
      line,
      caption,
      vars: [...(o.vars ?? []), ['m (bits)', m], ['k (hashes)', k], ['bits set', `${ones()} of ${m}`]],
      state: {
        label: `Bloom filter, ${m} bits, ${ones()} set: ${bits.flatMap((b, i) => (b ? [i] : [])).join(', ') || 'none'}`,
        bits: bits.map((value, i) => ({ value, role: o.roles?.[i] ?? (value ? 'done' : undefined) })),
        strips: [
          ...(o.hashes ? [{ label: 'Positions', items: o.hashes }] : []),
          { label: 'Added', items: added.length ? added.map((text) => ({ text })) : [{ text: 'nothing yet', role: 'muted' as Role }] },
          opStrip(),
        ],
      },
    });
  };

  const mRaw = (-capacity * Math.log(errorRate)) / Math.log(2) ** 2;
  const kRaw = (m * Math.log(2)) / capacity;
  snap(
    L.init,
    `BloomFilter(${capacity}, ${errorRate}): m = ceil(${mRaw.toFixed(2)}) = ${m} bits and k = max(1, round(${kRaw.toFixed(2)})) = ${k} hash${k === 1 ? '' : 'es'}, ` +
      `the sizes that keep the false positive rate near ${errorRate} for ${capacity} items. Every bit starts at 0.`,
  );

  ops.forEach((op, n) => {
    current = n;
    const name = formatBloomOp(op);
    const hs = bloomHashes(op.item, k, m);
    const positions = hs.map((h) => h.pos);
    const tokens = (role: (i: number) => Role | undefined): StripItem[] =>
      hs.map((h, i) => {
        const r = role(i);
        return { text: `h${i} = ${h.pos}${r === 'good' ? ': 1' : r === 'bad' ? ': 0' : ''}`, role: r };
      });
    const all: Record<number, Role> = Object.fromEntries(positions.map((p) => [p, 'compare' as Role]));
    const first = `md5('${op.item}0') = ${short(hs[0].digest)}, and that 128-bit number % ${m} = ${hs[0].pos}`;
    snap(
      L.hashes,
      `${name}: _hash_functions computes ${k === 1 ? 'its one position' : `all ${k} positions first`}, one md5 per i of the string '${op.item}' + str(i). ` +
        `For i = 0: ${first}. Positions: ${positions.join(', ')}.` +
        (new Set(positions).size < positions.length ? ' Two hashes landed on the same bit, which is allowed.' : ''),
      { roles: all, hashes: tokens(() => 'compare'), vars: [['op', name], ['positions', positions.join(', ')]] },
    );

    if (op.kind === 'add') {
      hs.forEach((h, i) => {
        const was = bits[h.pos];
        bits[h.pos] = 1;
        if (!setters[h.pos].includes(op.item)) setters[h.pos].push(op.item);
        const roles: Record<number, Role> = { ...all };
        for (let j = 0; j < i; j++) roles[positions[j]] = 'done';
        roles[h.pos] = 'active';
        const others = setters[h.pos].filter((s) => s !== op.item);
        const isLast = i === k - 1;
        snap(
          L.set,
          `bits[${h.pos}] = 1 (h${i}, from md5 ${short(h.digest)})` +
            (was ? `: it was already 1${others.length ? `, set by ${others.map((s) => `'${s}'`).join(' and ')}` : ''}, so nothing changes. Shared bits are what cause false positives.` : ': it was 0.') +
            (isLast ? ` '${op.item}' is in: ${ones()} of ${m} bits ${ones() === 1 ? 'is' : 'are'} now 1.` : ''),
          { roles, hashes: tokens((j) => (j < i ? 'done' : j === i ? 'active' : 'compare')), vars: [['op', name], ['i', i], ['position', h.pos]] },
        );
      });
      added.push(op.item);
      steps.push({ op, result: null, positions, set: bits.flatMap((b, i) => (b ? [i] : [])) });
      return;
    }

    let result = true;
    for (let i = 0; i < k; i++) {
      const p = positions[i];
      const roles: Record<number, Role> = { ...all };
      for (let j = 0; j < i; j++) roles[positions[j]] = 'good';
      if (!bits[p]) {
        roles[p] = 'bad';
        result = false;
        snap(
          L.check,
          `bits[${p}] = 0 (h${i}). Adding '${op.item}' would have set this bit, and no bit is ever cleared, so '${op.item}' was definitely never added: contains returns False without looking at the rest.`,
          { roles, hashes: tokens((j) => (j < i ? 'good' : j === i ? 'bad' : 'compare')), vars: [['op', name], ['i', i], ['position', p]] },
        );
        break;
      }
      roles[p] = 'good';
      snap(
        L.check,
        `bits[${p}] = 1 (h${i}), set by ${setters[p].map((s) => `'${s}'`).join(' and ')}. One 1 proves nothing: keep checking.`,
        { roles, hashes: tokens((j) => (j <= i ? 'good' : 'compare')), vars: [['op', name], ['i', i], ['position', p]] },
      );
    }
    if (result) {
      const roles: Record<number, Role> = Object.fromEntries(positions.map((p) => [p, 'good' as Role]));
      const truly = added.includes(op.item);
      const credit = [...new Set(positions)].map((p) => `bit ${p} from ${setters[p].map((s) => `'${s}'`).join(' and ')}`).join(', ');
      snap(
        L.maybe,
        truly
          ? `All ${k} bits are 1: contains returns True. '${op.item}' was added, so this "maybe" is right: an added item always finds its bits set.`
          : `All ${k} bits are 1: contains returns True, but '${op.item}' was never added. A false positive: ${credit}. Each bit was set by some other item.`,
        { roles, hashes: tokens(() => (truly ? 'good' : 'active')), vars: [['op', name], ['result', truly ? 'True (added)' : 'True (false positive)']] },
      );
    }
    steps.push({ op, result, positions, set: bits.flatMap((b, i) => (b ? [i] : [])) });
  });

  current = ops.length;
  const fill = ones() / m;
  snap(
    undefined,
    `Done: ${added.length} item${added.length === 1 ? '' : 's'} added, ${ones()} of ${m} bits set (${Math.round(fill * 100)}%). ` +
      `A never-added item now passes with probability about fill^k = ${fill.toFixed(2)}^${k} = ${(fill ** k).toFixed(3)}.`,
  );
  return { frames, steps, m, k };
}
