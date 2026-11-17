/**
 * Bitmasking tracers: a set is the bits of one integer, and loops walk only the masks they need.
 *
 * Mirrors Utilities/Optimization_Techniques/Bitmasking/Python/bitmasking.py:
 *   maskTrace 'submasks'  enumerate_subsets(mask): sub starts at mask; yield sub; stop after 0;
 *                         otherwise sub = (sub - 1) & mask (every submask once, largest first).
 *   maskTrace 'ksubsets'  subsets_of_size_k(n, k): k == 0 yields only 0; otherwise Gosper's hack
 *                         from (1 << k) - 1 while mask < (1 << n): c = mask & -mask, r = mask + c,
 *                         mask = (((r ^ mask) >> 2) // c) | r.
 *   sosTrace              sos_dp(a): bits = (len(a) - 1).bit_length(); for each bit i, for each mask
 *                         below len(a) that has bit i, dp[mask] += dp[mask ^ (1 << i)]. Masks at or
 *                         past len(a) are absent.
 * Golden fixtures (__fixtures__/optimizationTechniques.json) pin every submask, every Gosper step
 * with its c and r, and every SOS addition with both operands.
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { MaskBitView, MaskRowsState } from '../renderers/MaskRows';
import type { OkText } from '../renderers/OptimizationKit';
import type { LatticeEdgeView, SubsetLatticeState } from '../renderers/SubsetLattice';
import { parseCall } from './hashTable';

export const popcount = (x: number) => {
  let c = 0;
  for (let v = x; v > 0; v >>= 1) c += v & 1;
  return c;
};
export const bitLength = (x: number) => (x <= 0 ? 0 : Math.floor(Math.log2(x)) + 1);
export const bin = (x: number, width: number) => x.toString(2).padStart(width, '0');
const setText = (x: number) => {
  const items: number[] = [];
  for (let i = 0; i < 31; i++) if ((x >> i) & 1) items.push(i);
  return `{${items.join(', ')}}`;
};

/* ======================================================================================
 * enumerate_subsets(mask) and subsets_of_size_k(n, k).
 * ====================================================================================== */

export type MaskInput = { mode: 'submasks'; mask: number } | { mode: 'ksubsets'; n: number; k: number };

export const MASK_LIMITS = { maxMaskBits: 8, maxPopcount: 6, maxN: 8, maxK: 9 };

function readInt(token: string, what: string): number {
  const t = token.trim();
  if (/^0b[01]+$/i.test(t)) return parseInt(t.slice(2), 2);
  if (/^\d+$/.test(t)) return Number(t);
  throw new InputError(`"${token}" is not ${what}: write a whole number such as 11, or binary such as 0b1011.`);
}

/** "submasks 0b1011" or "ksubsets 4 2" (also "enumerate_subsets(11)", "gosper 4 2", "subsets_of_size_k(4, 2)"). */
export function parseMasks(text: string): MaskInput {
  const t = text.trim().replace(/[;,]\s*$/, '');
  const call = parseCall(t.replace(/-/g, '_'));
  if (!call) throw new InputError('Write "submasks 0b1011" for the submasks of a mask, or "ksubsets 4 2" for the masks with 2 bits among 4.');
  const name = call.name;
  if (['submasks', 'subs', 'enumerate_subsets', 'submask'].includes(name)) {
    if (call.args.length !== 1) throw new InputError(`"${t}": write one mask, as in "submasks 0b1011".`);
    const mask = readInt(call.args[0], 'a mask');
    if (mask >= 1 << MASK_LIMITS.maxMaskBits) throw new InputError(`Masks go up to ${MASK_LIMITS.maxMaskBits} bits here (below ${1 << MASK_LIMITS.maxMaskBits}), so every bit fits on screen (got ${mask}).`);
    if (popcount(mask) > MASK_LIMITS.maxPopcount) {
      throw new InputError(`A mask with ${popcount(mask)} bits has ${2 ** popcount(mask)} submasks; up to ${MASK_LIMITS.maxPopcount} set bits (${2 ** MASK_LIMITS.maxPopcount} submasks) fit on screen.`);
    }
    return { mode: 'submasks', mask };
  }
  if (['ksubsets', 'k_subsets', 'gosper', 'subsets_of_size_k', 'ksubset'].includes(name)) {
    if (call.args.length !== 2) throw new InputError(`"${t}": write n and k, as in "ksubsets 4 2" (the masks with 2 bits among 4).`);
    const n = readInt(call.args[0], 'n');
    const k = readInt(call.args[1], 'k');
    if (n > MASK_LIMITS.maxN) throw new InputError(`n goes up to ${MASK_LIMITS.maxN} here, so every bit fits on screen (got ${n}).`);
    if (k > MASK_LIMITS.maxK) throw new InputError(`k goes up to ${MASK_LIMITS.maxK} here (got ${k}).`);
    return { mode: 'ksubsets', n, k };
  }
  throw new InputError(`Cannot read "${t}". Write "submasks 0b1011" or "ksubsets 4 2".`);
}

export const SUBMASK_CODE = [
  'enumerate_subsets(mask):',
  '  sub = mask',
  '  while True:',
  '    yield sub',
  '    if sub == 0: break',
  '    sub = (sub - 1) & mask         # next smaller submask',
];

export const KSUBSET_CODE = [
  'subsets_of_size_k(n, k):',
  '  if k == 0: yield 0; return       # no lowest bit to divide by',
  '  mask = (1 << k) - 1',
  '  while mask < (1 << n):',
  '    yield mask',
  '    c = mask & -mask                 # lowest set bit',
  '    r = mask + c                     # carry through the lowest block',
  '    mask = (((r ^ mask) >> 2) // c) | r',
];

export const MASK_CODE = [...SUBMASK_CODE, ...KSUBSET_CODE];
const K0 = SUBMASK_CODE.length;

export interface MaskRun {
  frames: Array<Frame<MaskRowsState>>;
  /** Every yielded mask, in order. */
  masks: number[];
  /** Gosper only: [mask, c, r] each time the loop test runs (c and r from the step before). */
  steps: Array<[number, number | null, number | null]>;
}

interface RowSpec {
  /** The bits drawn, before any shift; null leaves the row empty. */
  value: number | null;
  /** Drawn shifted right by this much: the bits keep their ids, so they glide there. */
  shift?: number;
  /** The value written beside the row (default: value >> shift). */
  display?: number;
  /** Roles by original bit position. */
  roles?: Record<number, Role>;
  role?: Role;
  /** Draw the bits pushed below bit 0, faded, while they fall off. */
  showFallen?: boolean;
}

const EMPTY: RowSpec = { value: null };

export function maskTrace(input: MaskInput): MaskRun {
  const frames: Array<Frame<MaskRowsState>> = [];
  const masks: number[] = [];
  const steps: Array<[number, number | null, number | null]> = [];
  const width = input.mode === 'submasks' ? Math.max(4, bitLength(input.mask)) : Math.max(4, input.n + 1, input.k);
  const labels =
    input.mode === 'submasks'
      ? ['mask', 'sub', 'sub - 1', '(sub - 1) & mask']
      : ['mask', 'c = mask & -mask', 'r = mask + c', 'r ^ mask', '(r ^ mask) >> 2', '... // c', 'next = ... | r'];
  const total = input.mode === 'submasks' ? 2 ** popcount(input.mask) : input.k === 0 ? 1 : input.k > input.n ? 0 : Math.round(binom(input.n, input.k));
  const foundTitle = input.mode === 'submasks' ? `yielded (2^${popcount(input.mask)} = ${total} submasks in all)` : `yielded (C(${input.n}, ${input.k}) = ${total} masks in all)`;
  let checks = 0;

  const snap = (line: number, caption: string, rows: RowSpec[], vars: Array<[string, string | number]> = [], newest = -1) => {
    const bits: MaskBitView[] = [];
    const rowViews = labels.map((label, k) => {
      const r = rows[k] ?? EMPTY;
      if (r.value === null) return { label, value: '', empty: true };
      const shift = r.shift ?? 0;
      for (let p = 0; p < width; p++) {
        const pos = p - shift;
        if (pos < 0 && !(r.showFallen && pos >= -2)) continue;
        bits.push({ id: `r${k}b${p}`, row: k, pos, v: ((r.value >> p) & 1) as 0 | 1, role: pos < 0 ? 'muted' : r.roles?.[p] });
      }
      const shown = r.display ?? Math.floor(r.value / 2 ** shift);
      return { label, value: `${bin(shown, width)} = ${shown}`, role: r.role };
    });
    frames.push({
      line,
      caption,
      vars: [...vars, ['masks yielded', masks.length], ['loop tests', checks]],
      state: {
        label: `${rowViews.map((r) => `${r.label}: ${r.value || 'empty'}`).join('; ')}. Yielded: ${masks.map((m) => bin(m, width)).join(', ') || 'none'}.`,
        width,
        rows: rowViews,
        bits,
        found: {
          title: foundTitle,
          items: masks.map((m, i) => ({ text: bin(m, width), role: i === newest ? 'active' : undefined })),
        },
        foundCap: total,
      },
    });
  };

  if (input.mode === 'submasks') {
    const { mask } = input;
    const outside = Array.from({ length: width }, (_, p) => p).filter((p) => !((mask >> p) & 1));
    const maskRow: RowSpec = { value: mask, roles: Object.fromEntries(outside.map((p) => [p, 'muted' as Role])) };
    let sub = mask;
    snap(
      1,
      `enumerate_subsets(${bin(mask, width)}): start with sub = mask, the largest submask. ` +
        (outside.length
          ? `Bit${outside.length > 1 ? 's' : ''} ${outside.join(', ')} ${outside.length > 1 ? 'are' : 'is'} 0 in the mask, so ${outside.length > 1 ? 'they' : 'it'} can never appear in a submask.`
          : 'Every bit is in the mask.'),
      [maskRow, { value: sub, role: 'active' }],
      [['mask', mask], ['sub', sub]],
    );
    for (;;) {
      masks.push(sub);
      checks += 1;
      snap(3, `yield sub = ${bin(sub, width)} = ${sub}, the set ${setText(sub)}: submask ${masks.length} of ${total}.`, [maskRow, { value: sub, role: 'done' }], [['sub', sub]], masks.length - 1);
      if (sub === 0) {
        snap(
          4,
          `sub == 0: the empty set was the last submask, so the loop breaks. ${masks.length} submasks in ${masks.length} steps, ` +
            `while testing every number from 0 to ${mask} for "is it inside the mask?" would take ${mask + 1} tests.`,
          [maskRow, { value: sub, role: 'good' }],
          [['sub', sub]],
        );
        break;
      }
      const minus = sub - 1;
      const low = bitLength(sub & -sub) - 1;
      const flipped: Record<number, Role> = {};
      for (let p = 0; p <= low; p++) flipped[p] = 'active';
      snap(
        5,
        `sub - 1 = ${bin(minus, width)}: subtracting 1 turns the lowest 1 of sub (bit ${low}) into 0 and every bit below it into 1.`,
        [maskRow, { value: sub }, { value: minus, roles: flipped }],
        [['sub', sub], ['sub - 1', minus]],
      );
      const next = minus & mask;
      const cleared = Array.from({ length: width }, (_, p) => p).filter((p) => (minus >> p) & 1 && !((mask >> p) & 1));
      const roles: Record<number, Role> = {};
      for (const p of cleared) roles[p] = 'bad';
      snap(
        5,
        `(sub - 1) & mask = ${bin(minus, width)} & ${bin(mask, width)} = ${bin(next, width)}: ` +
          (cleared.length
            ? `bit${cleared.length > 1 ? 's' : ''} ${cleared.join(', ')} ${cleared.length > 1 ? 'are' : 'is'} not in the mask and ${cleared.length > 1 ? 'are' : 'is'} cleared. `
            : 'nothing outside the mask was set. ') +
          `That is the next smaller submask, ${next}: no number between ${next} and ${sub} is a submask.`,
        [maskRow, { value: sub, role: 'muted' }, { value: minus }, { value: next, roles, role: 'active' }],
        [['sub', next], ['sub - 1', minus]],
      );
      sub = next;
    }
    return { frames, masks, steps };
  }

  // subsets_of_size_k(n, k): Gosper's hack.
  const { n, k } = input;
  const limit = 1 << n;
  if (k === 0) {
    masks.push(0);
    checks += 1;
    snap(
      K0 + 1,
      `subsets_of_size_k(${n}, 0): the only subset of size 0 is the empty set, so the code yields 0 and returns. Gosper's hack cannot start from 0: it divides by the lowest set bit, and 0 has none.`,
      [{ value: 0, role: 'good' }],
      [['n', n], ['k', k]],
      0,
    );
    return { frames, masks, steps };
  }
  let mask = (1 << k) - 1;
  snap(K0 + 2, `subsets_of_size_k(${n}, ${k}): start with the ${k} lowest bits set, mask = (1 << ${k}) - 1 = ${bin(mask, width)}, the smallest number with ${k} bits.`, [{ value: mask, role: 'active' }], [
    ['n', n],
    ['k', k],
    ['mask', mask],
  ]);
  let c: number | null = null;
  let r: number | null = null;
  for (;;) {
    steps.push([mask, c, r]);
    checks += 1;
    if (mask >= limit) {
      const roles: Record<number, Role> = {};
      for (let p = n; p < width; p++) if ((mask >> p) & 1) roles[p] = 'bad';
      snap(
        K0 + 3,
        masks.length === 0
          ? `mask = ${bin(mask, width)} = ${mask} is not below 1 << ${n} = ${limit}: there is no way to pick ${k} of ${n} items, so nothing is yielded.`
          : `mask = ${bin(mask, width)} = ${mask} is not below 1 << ${n} = ${limit}: a bit left the ${n} items, so the loop stops. ${masks.length} masks, C(${n}, ${k}) = ${total}, each found in O(1); scanning all ${limit} masks and counting bits would test ${limit}.`,
        [{ value: mask, roles, role: 'bad' }],
        [['mask', mask]],
      );
      break;
    }
    masks.push(mask);
    snap(K0 + 4, `mask = ${bin(mask, width)} = ${mask} < ${limit}: yield it, the set ${setText(mask)} (${masks.length} of ${total}).`, [{ value: mask, role: 'done' }], [['mask', mask]], masks.length - 1);
    c = mask & -mask;
    const t = bitLength(c) - 1;
    const maskRow: RowSpec = { value: mask };
    snap(
      K0 + 5,
      `c = mask & -mask = ${bin(c, width)}: -mask flips every bit above the lowest 1 of mask, so only that bit (bit ${t}) survives the AND.`,
      [maskRow, { value: c, roles: { [t]: 'active' } }],
      [['mask', mask], ['c', c]],
    );
    r = mask + c;
    let block = 0;
    while ((mask >> (t + block)) & 1) block++;
    const carry: Record<number, Role> = {};
    for (let p = t; p <= t + block; p++) carry[p] = 'active';
    snap(
      K0 + 6,
      `r = mask + c = ${bin(r, width)}: adding bit ${t} carries through the lowest block of ${block} one${block === 1 ? '' : 's'} (bits ${t}..${t + block - 1}) and sets bit ${t + block}, the first 0 above it.`,
      [maskRow, { value: c }, { value: r, roles: carry }],
      [['mask', mask], ['c', c], ['r', r]],
    );
    const x = r ^ mask;
    const xRow: RowSpec = { value: x };
    snap(
      K0 + 7,
      `r ^ mask = ${bin(x, width)}: the bits that changed, the cleared block plus the new bit: ${block + 1} ones from bit ${t}.`,
      [maskRow, { value: c }, { value: r }, { value: x, role: 'active' }],
      [['mask', mask], ['c', c], ['r', r], ['r ^ mask', x]],
    );
    const s2 = x >> 2;
    snap(
      K0 + 7,
      `>> 2: shift those ${block + 1} ones down two places. Together with the division by c that follows, the shifts push exactly two of them off the end and keep ${block - 1}: ` +
        `one fewer than the block had, because r already gained a 1.`,
      [maskRow, { value: c }, { value: r }, xRow, { value: x, shift: 0, display: x, role: 'active' }],
      [['r ^ mask', x]],
    );
    const sRow: RowSpec = { value: x, shift: 2 };
    snap(K0 + 7, `(r ^ mask) >> 2 = ${bin(s2, width)} = ${s2}.`, [maskRow, { value: c }, { value: r }, xRow, { ...sRow, role: 'active', showFallen: true }], [['(r ^ mask) >> 2', s2]]);
    const d = Math.floor(s2 / c);
    snap(
      K0 + 7,
      t === 0
        ? '// c divides by c = 1 (2^0): nothing moves, the remaining ones are already at the bottom.'
        : `// c divides by c = 2^${t}, a shift down by ${t} more place${t === 1 ? '' : 's'}: the remaining ones move to the bottom.`,
      [maskRow, { value: c }, { value: r }, xRow, sRow, { value: s2, shift: 0, role: 'active' }],
      [['c', c]],
    );
    const dRow: RowSpec = { value: s2, shift: t };
    snap(K0 + 7, `((r ^ mask) >> 2) // c = ${bin(d, width)} = ${d}.`, [maskRow, { value: c }, { value: r }, xRow, sRow, { ...dRow, role: 'active', showFallen: true }], [['// c', d]]);
    const next = d | r;
    const fill: Record<number, Role> = {};
    for (let p = 0; p < width; p++) if ((d >> p) & 1) fill[p] = 'active';
    snap(
      K0 + 7,
      `| r = ${bin(next, width)} = ${next}: the ones go back at the bottom of r, so there are ${k} ones again. That is the next larger number with ${k} bits.`,
      [{ value: mask, role: 'muted' }, { value: c }, { value: r }, xRow, sRow, dRow, { value: next, roles: fill, role: 'active' }],
      [['mask', next]],
    );
    mask = next;
  }
  return { frames, masks, steps };
}

function binom(n: number, k: number): number {
  let v = 1;
  for (let i = 1; i <= k; i++) v = (v * (n - k + i)) / i;
  return v;
}

/* ======================================================================================
 * sos_dp(a): one pass per bit; dp[mask] += dp[mask ^ (1 << i)].
 * ====================================================================================== */

export interface SosInput {
  a: number[];
}

export const SOS_LIMITS = { maxLength: 16, lo: -99, hi: 99 };

/** "1 2 3 4 5 6" or "a = [1, 2, 3]"; an empty list is "[]". */
export function parseSos(text: string): SosInput {
  const body = text.replace(/^\s*(?:sos(?:_dp)?|a)\s*[=:(]?/i, '').replace(/[[\]()]/g, ' ');
  const tokens = body.split(/[\s,;]+/).filter(Boolean);
  if (tokens.length > SOS_LIMITS.maxLength) throw new InputError(`Up to ${SOS_LIMITS.maxLength} values (4 bits of masks), so every mask fits on screen (got ${tokens.length}).`);
  const a = tokens.map((t) => {
    if (!/^[+-]?\d+$/.test(t)) throw new InputError(`"${t}" is not a whole number.`);
    const v = Number(t);
    if (v < SOS_LIMITS.lo || v > SOS_LIMITS.hi) throw new InputError(`Values go from ${SOS_LIMITS.lo} to ${SOS_LIMITS.hi} (got ${t}).`);
    return v === 0 ? 0 : v;
  });
  return { a };
}

export const SOS_CODE = [
  'sos_dp(a): size = len(a); bits = max(size - 1, 0).bit_length()',
  '  dp = a.copy()',
  '  for i in range(bits):',
  '    for mask in range(size):',
  '      if mask & (1 << i):',
  '        dp[mask] += dp[mask ^ (1 << i)]   # take in the sums without bit i',
  '  return dp',
];

export interface SosRun {
  frames: Array<Frame<SubsetLatticeState>>;
  /** [bit, mask, dp[mask] before, dp[mask ^ (1 << bit)]], in loop order. */
  adds: Array<[number, number, number, number]>;
  dp: number[];
}

export function sosTrace(input: SosInput): SosRun {
  const { a } = input;
  const size = a.length;
  const bits = bitLength(Math.max(size - 1, 0));
  const full = 1 << bits;
  const dp = [...a];
  const frames: Array<Frame<SubsetLatticeState>> = [];
  const adds: Array<[number, number, number, number]> = [];
  let additions = 0;
  // A direct sum over every submask (below size) of every mask: the terms it reads, and its additions.
  let terms = 0;
  for (let m = 0; m < size; m++) for (let s = 0; s < size; s++) if ((s & m) === s) terms += 1;
  const naive = terms - size; // each mask starts from one term
  const allEdges: LatticeEdgeView[] = [];
  for (let m = 0; m < full; m++) for (let i = 0; i < bits; i++) if ((m >> i) & 1) allEdges.push({ from: m ^ (1 << i), to: m, bit: i });

  const snap = (line: number, caption: string, o: { roles?: Record<number, Role>; layer?: number; edge?: [number, number]; done?: Set<number>; vars?: Array<[string, string | number]>; work?: OkText[] } = {}) => {
    frames.push({
      line,
      caption,
      vars: [...(o.vars ?? []), ['size', size], ['bits', bits], ['additions so far', additions], ['a direct sum over submasks would add', naive]],
      state: {
        label: `SOS DP over ${size} masks: ${dp.map((v, m) => `${bin(m, Math.max(bits, 1))}:${v}`).join(' ')}`,
        bits,
        nodes: Array.from({ length: full }, (_, m) => ({
          mask: m,
          text: bin(m, Math.max(bits, 1)),
          value: m < size ? String(dp[m]) : null,
          role: o.roles?.[m] ?? (o.done?.has(m) ? 'done' : undefined),
        })),
        edges: allEdges.map((e) => ({
          ...e,
          role: o.edge && e.from === o.edge[0] && e.to === o.edge[1] ? 'active' : o.layer === e.bit && e.to < size ? 'compare' : undefined,
        })),
        layer: o.layer ?? null,
        work: o.work ?? [],
      },
    });
  };

  snap(
    0,
    size === 0
      ? 'sos_dp([]): size 0, so bits = 0: there is no mask and nothing to add. The result is [].'
      : `sos_dp: size ${size}, so bits = (${size} - 1).bit_length() = ${bits}. dp starts as a copy of a. ` +
          `Goal: dp[mask] = the sum of a[sub] over every submask sub of mask${size < full ? ` that is below ${size} (masks ${size}..${full - 1} are absent)` : ''}.`,
    // The boxes hold the list; the line names the step (a list of 16 values would not fit above the lattice).
    { work: [{ text: size === 0 ? 'dp = a.copy() = []' : 'dp = a.copy(): every box starts at a[mask]' }] },
  );

  for (let i = 0; i < bits; i++) {
    snap(2, `Bit ${i}: every mask that has bit ${i} takes in dp[mask ^ ${1 << i}], the mask without bit ${i}. The highlighted edges are the pairs that differ only in bit ${i}.`, {
      layer: i,
      vars: [['i', i]],
      work: [{ text: `for mask with bit ${i}: dp[mask] += dp[mask ^ ${1 << i}]`, role: 'active' }],
    });
    const touched = new Set<number>();
    for (let mask = 0; mask < size; mask++) {
      if (!(mask & (1 << i))) continue;
      const from = mask ^ (1 << i);
      const before = dp[mask];
      const add = dp[from];
      adds.push([i, mask, before, add]);
      dp[mask] = before + add;
      additions += 1;
      touched.add(mask);
      snap(
        5,
        `dp[${bin(mask, bits)}] += dp[${bin(from, bits)}]: ${before} + ${add} = ${dp[mask]}. ` +
          (i === 0
            ? `dp[${bin(from, bits)}] is still just a[${from}], so mask now covers itself and the set without bit 0.`
            : `dp[${bin(from, bits)}] already sums the submasks that differ from it in bits 0..${i - 1}, so mask now covers both halves: with and without bit ${i}.`),
        {
          roles: { [from]: 'compare', [mask]: 'active' },
          layer: i,
          edge: [from, mask],
          done: touched,
          vars: [['i', i], ['mask', bin(mask, bits)]],
          work: [{ text: `dp[${bin(mask, bits)}] = ${before} + ${add} = ${dp[mask]}`, role: 'active' }],
        },
      );
    }
    snap(
      2,
      `After bit ${i}: dp[mask] is the sum of a[sub] over the subs that agree with mask outside bits 0..${i}. ` + (i + 1 < bits ? `One more pass per remaining bit.` : 'That was the last bit, so every mask has all of its submasks.'),
      { layer: i, done: touched, vars: [['i', i]], work: [{ text: `after bit ${i}: ${touched.size} masks updated` }] },
    );
  }

  // Check every entry against a direct sum over submasks.
  const ok = dp.every((v, m) => {
    let s = 0;
    for (let sub = 0; sub < size; sub++) if ((sub & m) === sub) s += a[sub];
    return s === v;
  });
  snap(
    6,
    size === 0
      ? 'return []: nothing to do.'
      : `return dp = [${dp.join(', ')}]: ${additions} additions in ${bits} pass${bits === 1 ? '' : 'es'}, O(n 2^n). Summing the submasks of every mask directly reads ${terms} terms ` +
          `(3^${bits} = ${3 ** bits} when the list is full) and makes ${naive} additions. ` +
          (ok ? 'Every entry matches the direct sum.' : 'An entry does not match the direct sum.'),
    {
      roles: Object.fromEntries(Array.from({ length: size }, (_, m) => [m, (ok ? 'good' : 'bad') as Role])),
      work: [{ text: size === 0 ? 'return []' : `return dp: ${additions} additions`, role: ok ? 'good' : 'bad' }],
    },
  );
  return { frames, adds, dp };
}

