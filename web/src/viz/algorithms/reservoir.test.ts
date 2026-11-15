import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import { PyRandom } from './randomizedDraws';
import { parseReservoir, RES_CODE, reservoirTrace, tallyRuns, type Item, type ReservoirState, type ResInput } from './reservoir';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/divideAndRandomized.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function expectWellFormed(frames: Array<Frame<ReservoirState>>) {
  const problems: string[] = [];
  for (const f of frames) {
    const st = f.state;
    if (f.caption.length <= 20) problems.push(`short caption: ${f.caption}`);
    if (f.line !== undefined && (f.line < 0 || f.line >= RES_CODE.length)) problems.push(`line ${f.line}`);
    if (st.slots.length !== st.k) problems.push('slots');
    // Every item token is drawn once: on the stream, floating, in a slot or just evicted.
    const placed = [...st.slots.filter((s) => s !== null).map((s) => s!.id), ...(st.floating ? [st.floating.id] : []), ...(st.evicted ? [st.evicted.token.id] : [])];
    if (new Set(placed).size !== placed.length) problems.push(`token twice: ${f.caption}`);
    for (const id of placed) if (id < 0 || id >= st.stream.length) problems.push(`token ${id}`);
    if (st.draw && (st.draw.j === null || st.draw.j < 0 || st.draw.j >= st.draw.i)) problems.push('draw');
  }
  expect(problems).toEqual([]);
}

function randomInput(rand: () => number): ResInput {
  const n = Math.floor(rand() * 17);
  const stream: Item[] = Array.from({ length: n }, (_, i) => (rand() < 0.5 ? 'abcdefghijklmnop'[i] : i));
  const k = rand() < 0.1 ? 0 : 1 + Math.floor(rand() * 8);
  return { stream, k, seed: Math.floor(rand() * 2 ** 32), draws: [], runs: rand() < 0.3 ? 200 : 0 };
}

describe('reservoirTrace', () => {
  it('agrees with a direct Algorithm R on the same generator, after every item', () => {
    const rand = rng(41);
    for (let t = 0; t < 200; t++) {
      const input = randomInput(rand);
      const run = reservoirTrace(input);
      expectWellFormed(run.frames);
      // Reference: Algorithm R written out, drawing from random.Random(seed).
      const ref = new PyRandom(input.seed);
      const reservoir: Item[] = [];
      input.stream.forEach((x, idx) => {
        if (input.k === 0) return;
        const i = idx + 1;
        if (i <= input.k) reservoir.push(x);
        else {
          const j = ref.randrange(i);
          expect(run.js[idx]).toBe(j);
          if (j < input.k) reservoir[j] = x;
        }
        expect(run.after[idx]).toEqual(reservoir);
      });
      expect(run.result).toEqual(input.k === 0 ? [] : reservoir);
      expect(run.result!.length).toBe(Math.min(input.k, input.stream.length));
      // The sample is a subset of the stream, with no position twice.
      const last = run.frames[run.frames.length - 1].state;
      const ids = last.slots.filter((s) => s !== null).map((s) => s!.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('keeps every item with chance k / n: the tally is close to runs * k / n', () => {
    const counts = tallyRuns(['a', 'b', 'c', 'd', 'e', 'f'], 2, 1, 6000);
    // The category overview's table: random.Random(1), 6000 runs of reservoir_sample('abcdef', 2, rng).
    expect(counts).toEqual([2038, 2007, 1972, 2002, 1992, 1989]);
    const many = tallyRuns(Array.from({ length: 10 }, (_, i) => i), 3, 99, 10000);
    for (const c of many) expect(Math.abs(c - 3000)).toBeLessThan(200);
  });

  it('matches the Python function (golden fixtures): draws, the reservoir after every item, the result and the tally', () => {
    const list = fixtures.reservoir as Array<{
      stream: Item[];
      k: number;
      seed: number;
      draws: number[];
      error: string | null;
      result: Item[] | null;
      after: Item[][];
      log: Array<[number, number]>;
      tally: { runs: number; counts: number[] } | null;
    }>;
    expect(list.length).toBeGreaterThanOrEqual(60);
    for (const c of list) {
      const label = JSON.stringify([c.stream, c.k, c.seed, c.draws]);
      const run = reservoirTrace({ stream: c.stream, k: c.k, seed: c.seed, draws: c.draws, runs: c.tally?.runs ?? 0 });
      expect(run.error, label).toEqual(c.error);
      expect(run.result, label).toEqual(c.result);
      expect(run.after, label).toEqual(c.after);
      const drawn = run.js.map((j, idx) => [idx + 1, j]).filter(([, j]) => j !== null);
      expect(drawn, label).toEqual(c.log);
      expect(run.tally, label).toEqual(c.tally ? c.tally.counts : null);
    }
  });

  it('the article example: seed 8 draws 0, 2, 3, 1 and returns [c, f]', () => {
    const run = reservoirTrace(parseReservoir('seed 8; k 2; a b c d e f'));
    expect(run.js).toEqual([null, null, 0, 2, 3, 1]);
    expect(run.result).toEqual(['c', 'f']);
    expect(run.frames.some((f) => f.caption.includes('j = rng.randrange(3) = 0 (random.Random(8), draw 1)'))).toBe(true);
  });

  it('the item glides from its stream cell into its slot, and the evicted item leaves', () => {
    const frames = reservoirTrace(parseReservoir('seed 8; k 2; a b c d e f; runs 0')).frames;
    const draw = frames.findIndex((f) => f.line === 8);
    expect(frames[draw].state.floating!.id).toBe(2);
    const replace = frames[draw + 1];
    expect(replace.line).toBe(10);
    expect(replace.state.slots[0]!.id).toBe(2);
    expect(replace.state.evicted).toMatchObject({ slot: 0, token: { id: 0 } });
    expect(replace.state.chance.slice(0, 3)).toEqual(['2/3', '2/3', '2/3']);
    const reject = frames.find((f) => f.line === 9)!;
    expect(reject.state.stream[3].role).toBe('active');
  });

  it('k == 0 returns [] without reading the stream; a negative k raises ValueError', () => {
    const zero = reservoirTrace(parseReservoir('k 0; a b c'));
    expect([zero.result, zero.js]).toEqual([[], []]);
    expect(zero.frames[zero.frames.length - 1].line).toBe(2);
    const neg = reservoirTrace(parseReservoir('k -1; a b c'));
    expect(neg.error).toBe('ValueError: k must be non-negative');
    expect(neg.frames[neg.frames.length - 1].line).toBe(1);
    const short = reservoirTrace(parseReservoir('k 5; a b c'));
    expect(short.result).toEqual(['a', 'b', 'c']);
  });

  it('fixed draws replace the first draws', () => {
    const run = reservoirTrace(parseReservoir('k 2; a b c d e f; draws 0 2 3 1'));
    expect(run.js).toEqual([null, null, 0, 2, 3, 1]);
    expect(run.result).toEqual(['c', 'f']);
  });
});

describe('parseReservoir', () => {
  it('reads the stream, k, the seed, fixed draws and runs', () => {
    expect(parseReservoir('seed 8; k 2; a b c 5')).toEqual({ stream: ['a', 'b', 'c', 5], k: 2, seed: 8, draws: [], runs: 1000 });
    expect(parseReservoir('k=3\nstream range(5)\ndraws 1\nruns 0')).toEqual({ stream: [0, 1, 2, 3, 4], k: 3, seed: 1, draws: [1], runs: 0 });
    expect(parseReservoir("k 1; stream [a, 'b', 7]").stream).toEqual(['a', 'b', 7]);
  });

  it('gives friendly errors', () => {
    expect(() => parseReservoir('')).toThrow(InputError);
    expect(() => parseReservoir('a b c')).toThrow(/sample size/);
    expect(() => parseReservoir('k 2')).toThrow(/stream/);
    expect(() => parseReservoir('k 9; a b')).toThrow(/up to 8/);
    expect(() => parseReservoir(`k 2; ${Array(17).fill('a').join(' ')}`)).toThrow(/16 items/);
    expect(() => parseReservoir('k 2; abcd')).toThrow(/up to 3 letters/);
    expect(() => parseReservoir('k 2; a b c; draws 3')).toThrow(/0\.\.2/);
    expect(() => parseReservoir('k 2; a b c; draws 0 1')).toThrow(/1 draw/);
    expect(() => parseReservoir('k 2; a b c; runs 20000')).toThrow(/0 to 10000/);
    expect(() => parseReservoir('k 2; a b; c d')).toThrow(/already given/);
  });
});
