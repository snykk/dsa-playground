/**
 * Reservoir sampling (Algorithm R), drawn with ReservoirView: the stream, the draw
 * j = randrange(i) as a row of i cells whose first k are reservoir slots, and the reservoir.
 *
 * Mirrors Algorithms/Randomized_Algorithms/Reservoir_Sampling/Python/reservoir_sampling.py:
 *   reservoir_sample(stream, k, rng=None): ValueError for k < 0; [] for k == 0 (the stream is
 *   never read); otherwise for i, item in enumerate(stream, start=1): i <= k appends, else
 *   j = rng.randrange(i) and j < k overwrites reservoir[j]. ReservoirSampler.offer runs the same
 *   step per item (it differs only for k == 0, where offer still draws).
 * The draws are Python's: random.Random(seed) ported bit for bit (randomizedDraws.ts), so
 * "seed 8" is rng = random.Random(8) and reproduces the article's worked example; "draws 0 2"
 * fixes the first draws. The last frame repeats the call `runs` times on one fresh
 * random.Random(seed) (run 1 is the run animated) and counts how often each item was kept.
 * The golden fixture runs the Python function with its module's random replaced by the same
 * draws and pins every draw, the reservoir after every item and those counts.
 *
 * Input: "seed 8; k 2; a b c d e f"   (also "stream range 10", "draws 0 2 3 1", "runs 6000")
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { StripData } from '../ui/molecules/Strip';
import { Draws, MAX_SEED, parseSeed, PyRandom } from './randomizedDraws';

export type Item = number | string;

export interface ResInput {
  stream: Item[];
  k: number;
  seed: number;
  /** Fixed results of the first rng.randrange calls. */
  draws: number[];
  /** How many runs the closing tally makes (0 = none). */
  runs: number;
}

export interface ResToken {
  /** The item's position in the stream: its identity. */
  id: number;
  text: string;
  role: Role;
}

export interface ReservoirState {
  /** The whole stream; items not yet read are idle. */
  stream: ResToken[];
  /** Index of the item being read (0-based), or null. */
  current: number | null;
  /** Where the current item is drawn: on its stream cell, or already in a slot. */
  k: number;
  slots: Array<ResToken | null>;
  /** The current item while it waits on its stream cell. */
  floating: ResToken | null;
  /** The item just pushed out of the reservoir, and the slot it left. */
  evicted: { token: ResToken; slot: number } | null;
  /** j = rng.randrange(i): i cells, the first k of them reservoir slots. */
  draw: { i: number; j: number | null } | null;
  /** Under each item read so far: its chance of being in the reservoir right now. */
  chance: Array<string | null>;
  /** The closing tally: how often each item was kept over many runs. */
  tally: { runs: number; counts: number[]; expected: number } | null;
  strips: StripData[];
  /** Fixed for a whole run (stabilizeReservoir): reserve the tally's height in every frame. */
  layout?: { tally: boolean };
}

export interface ResRun {
  frames: Array<Frame<ReservoirState>>;
  /** The reservoir after every item (empty when k <= 0). */
  after: Item[][];
  /** j for every item (null while filling). */
  js: Array<number | null>;
  result: Item[] | null;
  error: string | null;
  tally: number[] | null;
}

export const RES_LIMITS = { maxItems: 16, maxK: 8, maxRuns: 10000, tokenLength: 3 };
export const DEFAULT_RUNS = 1000;

export const RES_CODE: string[] = [
  'def reservoir_sample(stream, k, rng=None):',
  '    if k < 0: raise ValueError("k must be non-negative")',
  '    if k == 0: return []',
  '    reservoir = []',
  '    for i, item in enumerate(stream, start=1):',
  '        if i <= k:',
  '            reservoir.append(item)',
  '        else:',
  '            j = rng.randrange(i)          # uniform in [0, i)',
  '            if j < k:',
  '                reservoir[j] = item',
  '    return reservoir',
];

/* ---------- input ---------- */

function parseItem(token: string): Item {
  if (/^-?\d+$/.test(token)) {
    const v = Number(token) || 0;
    if (v < -99 || v > 999) throw new InputError(`Number items go from -99 to 999 (got ${token}).`);
    return v;
  }
  const word = token.replace(/^(['"])(.*)\1$/, '$2');
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(word) || word.length > RES_LIMITS.tokenLength) {
    throw new InputError(`"${token}" is not an item: use a number or a word of up to ${RES_LIMITS.tokenLength} letters.`);
  }
  return word;
}

const int = (text: string, what: string): number => {
  if (!/^-?\d+$/.test(text)) throw new InputError(`${what}: "${text}" is not a whole number.`);
  return Number(text) || 0;
};

/** Parse "seed 8; k 2; a b c d e f" (or "stream [a, b, c]", "stream range 10", "draws 0 2", "runs 6000"). */
export function parseReservoir(text: string): ResInput {
  let seed: number | undefined;
  let k: number | undefined;
  let stream: Item[] | undefined;
  let draws: number[] | undefined;
  let runs: number | undefined;
  for (const seg of text
    .split(/[;\n]/)
    .map((s) => s.trim())
    .filter(Boolean)) {
    const s = parseSeed(seg);
    if (s !== undefined) {
      if (seed !== undefined) throw new InputError('Give the seed ("seed 8") only once.');
      if (s > MAX_SEED) throw new InputError(`The seed goes up to ${MAX_SEED}.`);
      seed = s;
      continue;
    }
    let m = seg.match(/^k\s*[:=]?\s*(\S+)$/i);
    if (m) {
      if (k !== undefined) throw new InputError('Give k only once.');
      k = int(m[1], 'k');
      if (k > RES_LIMITS.maxK) throw new InputError(`k goes up to ${RES_LIMITS.maxK} here, so every slot fits (got ${k}).`);
      if (k < -9) throw new InputError(`k must be at least -9 here (a negative k shows the ValueError); got ${k}.`);
      continue;
    }
    m = seg.match(/^draws?\s*[:=]?\s*(.*)$/i);
    if (m) {
      if (draws !== undefined) throw new InputError('Give the fixed draws ("draws 0 2") only once.');
      draws = m[1].split(/[\s,]+/).filter(Boolean).map((t) => int(t, 'draws'));
      if (draws.length === 0) throw new InputError('"draws" needs at least one value, e.g. "draws 0 2".');
      continue;
    }
    m = seg.match(/^runs?\s*[:=]?\s*(\S+)$/i);
    if (m) {
      if (runs !== undefined) throw new InputError('Give the number of runs only once.');
      runs = int(m[1], 'runs');
      if (runs < 0 || runs > RES_LIMITS.maxRuns) throw new InputError(`runs goes from 0 to ${RES_LIMITS.maxRuns} (got ${runs}).`);
      continue;
    }
    const body = seg.replace(/^stream\s*[:=]?\s*/i, '');
    if (stream !== undefined) throw new InputError(`Cannot read "${seg}": the stream is already given. Write "k 2", "seed 8", "draws 0 2" or "runs 1000", separated by semicolons.`);
    const range = body.match(/^range\s*\(?\s*(\d+)\s*\)?$/i);
    if (range) {
      const n = Number(range[1]);
      if (n > RES_LIMITS.maxItems) throw new InputError(`The stream may have up to ${RES_LIMITS.maxItems} items (got range ${n}).`);
      stream = Array.from({ length: n }, (_, i) => i);
    } else {
      stream = body
        .replace(/^\[|\]$/g, '')
        .split(/[\s,]+/)
        .filter(Boolean)
        .map(parseItem);
    }
  }
  if (stream === undefined) throw new InputError('Give a stream, e.g. "k 2; a b c d e f".');
  if (stream.length > RES_LIMITS.maxItems) throw new InputError(`The stream may have up to ${RES_LIMITS.maxItems} items (got ${stream.length}).`);
  if (k === undefined) throw new InputError('Give the sample size, e.g. "k 2".');
  const input: ResInput = { stream, k, seed: seed ?? 1, draws: draws ?? [], runs: runs ?? DEFAULT_RUNS };
  const needed = k > 0 ? Math.max(0, stream.length - k) : 0;
  if (input.draws.length > needed) {
    throw new InputError(`This run makes ${needed} draw${needed === 1 ? '' : 's'} (one per item after the first k), but ${input.draws.length} were fixed.`);
  }
  input.draws.forEach((j, t) => {
    const i = k + 1 + t;
    if (j < 0 || j >= i) throw new InputError(`Draw ${t + 1} is randrange(${i}) for item ${i}, so it lies in 0..${i - 1} (got ${j}).`);
  });
  return input;
}

/* ---------- tracer ---------- */

/** Python's repr of an item: 'a' or 5. */
export const reprItem = (x: Item) => (typeof x === 'string' ? `'${x}'` : String(x));
const pyList = (xs: Item[]) => `[${xs.map(reprItem).join(', ')}]`;

/** reservoir_sample(stream, k, rng) without frames, on a shared generator (the tally). */
export function sampleOnce(stream: Item[], k: number, rng: PyRandom): number[] {
  if (k === 0) return [];
  const reservoir: number[] = [];
  stream.forEach((_, idx) => {
    const i = idx + 1;
    if (i <= k) reservoir.push(idx);
    else {
      const j = rng.randrange(i);
      if (j < k) reservoir[j] = idx;
    }
  });
  return reservoir;
}

/** How many of `runs` calls on one random.Random(seed) keep each stream position. */
export function tallyRuns(stream: Item[], k: number, seed: number, runs: number): number[] {
  const rng = new PyRandom(seed);
  const counts = stream.map(() => 0);
  for (let r = 0; r < runs; r++) for (const idx of sampleOnce(stream, k, rng)) counts[idx]++;
  return counts;
}

/** The chance an item read so far is in the reservoir after i items: 1 while filling, then k / i. */
const chanceText = (k: number, i: number) => (i <= k ? '1' : `${k}/${i}`);

export function reservoirTrace(input: ResInput): ResRun {
  const { stream, k, seed } = input;
  const draws = new Draws(seed, input.draws);
  const frames: Array<Frame<ReservoirState>> = [];
  const after: Item[][] = [];
  const js: Array<number | null> = [];
  const slots: Array<ResToken | null> = Array.from({ length: Math.max(0, k) }, () => null);
  /** Per stream position: in the reservoir, dropped, or pushed out later. */
  const fate: Array<'unread' | 'in' | 'rejected' | 'evicted'> = stream.map(() => 'unread');
  const drawLog: string[] = [];
  const text = (x: Item) => String(x);

  interface View {
    current?: number | null;
    floating?: ResToken | null;
    evicted?: { token: ResToken; slot: number } | null;
    draw?: { i: number; j: number | null } | null;
    seen?: number;
    slotRoles?: Record<number, Role>;
    tally?: ReservoirState['tally'];
  }

  const snap = (line: number | undefined, caption: string, v: View, vars: Array<[string, string | number]> = []) => {
    const seen = v.seen ?? 0;
    const tokens: ResToken[] = stream.map((x, idx) => {
      let role: Role = 'idle';
      if (idx === v.current) role = 'active';
      else if (fate[idx] === 'in') role = 'done';
      else if (fate[idx] === 'rejected' || fate[idx] === 'evicted') role = 'muted';
      return { id: idx, text: text(x), role };
    });
    const strips: StripData[] = [];
    if (drawLog.length) strips.push({ label: 'draws', items: drawLog.map((t, n) => ({ text: t, role: n === drawLog.length - 1 && v.draw ? 'active' : 'idle' })) });
    frames.push({
      line,
      caption,
      state: {
        stream: tokens,
        current: v.current ?? null,
        k: Math.max(0, k),
        slots: slots.map((s, n) => (s ? { ...s, role: v.slotRoles?.[n] ?? 'done' } : null)),
        floating: v.floating ?? null,
        evicted: v.evicted ?? null,
        draw: v.draw ?? null,
        chance: stream.map((_, idx) => (idx < seen && k > 0 ? chanceText(k, seen) : null)),
        tally: v.tally ?? null,
        strips,
      },
      vars: [...vars, ['k', k], ['seed', seed], ['draws', draws.log.length]],
    });
  };

  snap(
    undefined,
    `reservoir_sample(stream, k=${k}) with rng = random.Random(${seed})${input.draws.length ? `, the first ${input.draws.length === 1 ? 'draw' : `${input.draws.length} draws`} fixed to ${input.draws.join(', ')}` : ''}. The items arrive one at a time; the code never looks ahead and never learns the stream's length until it ends.`,
    {},
  );
  if (k < 0) {
    snap(1, `k = ${k} is negative, and there is no sample of negative size: raise ValueError("k must be non-negative"). The stream is never read.`, {}, [['k', k]]);
    return { frames, after, js, result: null, error: 'ValueError: k must be non-negative', tally: null };
  }
  if (k === 0) {
    snap(2, 'k == 0: the sample is empty, so reservoir_sample returns [] at once, without reading the stream or drawing anything.', {});
    return { frames, after, js, result: [], error: null, tally: null };
  }
  snap(3, `reservoir = []: ${k} empty slot${k === 1 ? '' : 's'}. Invariant to watch: after i items, each of them is in the reservoir with the same chance, min(1, k / i).`, {});

  stream.forEach((x, idx) => {
    const i = idx + 1;
    const token: ResToken = { id: idx, text: text(x), role: 'active' };
    const vars: Array<[string, string | number]> = [['i', i], ['item', reprItem(x)]];
    if (i <= k) {
      snap(5, `Item i = ${i}, ${reprItem(x)}, arrives. i <= k = ${k}: the reservoir still has a free slot, so it goes in unconditionally.`, { current: idx, floating: token, seen: i - 1 }, vars);
      slots[i - 1] = { ...token };
      fate[idx] = 'in';
      js.push(null);
      snap(
        6,
        `reservoir.append(${reprItem(x)}): slot ${i - 1}. ${i === k ? `The reservoir is full; from now on an item must win its place.` : `All ${i} item${i === 1 ? '' : 's'} read so far are kept (chance 1).`}`,
        { current: idx, seen: i, slotRoles: { [i - 1]: 'active' } },
        vars,
      );
    } else {
      const d = draws.randrange(i);
      const j = d.value;
      js.push(j);
      drawLog.push(`randrange(${i}) = ${j}`);
      snap(
        8,
        `Item i = ${i}, ${reprItem(x)}: j = rng.randrange(${i}) = ${j} (${draws.source(d)}), uniform over 0..${i - 1}. ${k} of those ${i} values are slots, so the item gets in with chance ${k}/${i}.`,
        { current: idx, floating: token, draw: { i, j }, seen: i - 1, slotRoles: j < k ? { [j]: 'compare' } : {} },
        [...vars, ['j', j]],
      );
      if (j < k) {
        const out = slots[j]!;
        fate[out.id] = 'evicted';
        slots[j] = { ...token };
        fate[idx] = 'in';
        snap(
          10,
          `j = ${j} < k = ${k}: reservoir[${j}] = ${reprItem(x)}, and ${reprItem(stream[out.id])} leaves the sample. Each of the ${i} items read is now kept with chance ${k}/${i}: the new one by its draw, an old one by surviving it (chance ${i - 1}/${i} times its old ${chanceText(k, i - 1)}).`,
          { current: idx, draw: { i, j }, seen: i, evicted: { token: { ...out, role: 'muted' }, slot: j }, slotRoles: { [j]: 'active' } },
          [...vars, ['j', j]],
        );
      } else {
        fate[idx] = 'rejected';
        snap(
          9,
          `j = ${j} >= k = ${k}: no slot, so ${reprItem(x)} is dropped and the reservoir is unchanged. Each of the ${i} items read is kept with chance ${k}/${i}.`,
          { current: idx, draw: { i, j }, seen: i },
          [...vars, ['j', j]],
        );
      }
    }
    after.push(slots.filter((s): s is ResToken => s !== null).map((s) => stream[s.id]));
  });

  const result = slots.filter((s): s is ResToken => s !== null).map((s) => stream[s.id]);
  const n = stream.length;
  snap(
    11,
    n <= k
      ? `The stream ended after ${n} item${n === 1 ? '' : 's'}, no more than k: return all of them, ${pyList(result)}.`
      : `The stream ended after n = ${n} items: return ${pyList(result)}. Every item had the same chance, ${k}/${n}, early or late.`,
    { seen: n },
    [['n', n]],
  );

  let tally: number[] | null = null;
  if (input.runs > 0 && n > 0) {
    tally = tallyRuns(stream, k, seed, input.runs);
    const expected = (input.runs * Math.min(k, n)) / n;
    const fixedNote = input.draws.length ? ' (without the fixed draws, so run 1 can differ from the run above)' : ' (run 1 is the run above)';
    snap(
      undefined,
      `One run proves little, so repeat it: rng = random.Random(${seed}), then reservoir_sample(stream, ${k}, rng) ${input.runs} times${fixedNote}. Each item should be kept about ${input.runs} * ${Math.min(k, n)}/${n} = ${Math.round(expected)} times; the counts are ${tally.join(', ')}.`,
      { seen: n, tally: { runs: input.runs, counts: tally, expected } },
      [['runs', input.runs]],
    );
  }
  return { frames, after, js, result, error: null, tally };
}

/** Keep one picture size for a run: if the last frame shows a tally, every frame leaves room for it. */
export function stabilizeReservoir(frames: Array<Frame<ReservoirState>>): Array<Frame<ReservoirState>> {
  const tally = frames.some((f) => f.state.tally !== null);
  return frames.map((f) => ({ ...f, state: { ...f.state, layout: { tally } } }));
}
