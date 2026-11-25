import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { intervalDpTrace, type MergeStep, type SplitCall } from './intervalDp';
import { KNUTH_CODE, knuthTrace, parseKnuth, type KnuthRun, type WindowCall } from './knuthOptimization';
import { rng } from './patternsMoreTestKit';

interface Case {
  piles: number[];
  windows: WindowCall[];
  calls: Array<[number, number, number, number | string, number]>;
  dp: number[][];
  split: number[][];
  cost: number;
  merges: MergeStep[];
  tries: number;
}

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/advancedDp.json', import.meta.url), 'utf8')) as { knuth: Case[] };
const num = (v: number | string) => (v === 'inf' ? Infinity : (v as number));

function randomPiles(r: ReturnType<typeof rng>): number[] {
  return Array.from({ length: r.int(1, 8) }, () => r.int(0, r.pick([2, 9, 99])));
}

/** The splits the windows hold, from the final split table, one diagonal at a time. */
function telescoped(split: number[][], n: number): number {
  let total = Math.max(0, n - 1);
  for (let length = 3; length <= n; length++) total += n - length + 1 + split[n - length + 1][n - 1] - split[0][length - 2];
  return total;
}

/** Every frame: a caption, a line in range, tables that keep one shape, and the count strip. */
function expectWellFormed(run: KnuthRun, n: number) {
  for (const f of run.frames) {
    expect(f.caption.length).toBeGreaterThan(20);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(KNUTH_CODE.length);
    }
    for (const t of [f.state.dp.tables[0], f.state.split.tables[0]]) {
      expect(t.cells.length).toBe(n);
      for (const row of t.cells) expect(row.length).toBe(n);
    }
    expect(f.state.strips.at(-1)?.label).toBe('Splits tried so far');
  }
}

describe('knuthTrace (knuth_optimization.py, merge_piles_plan)', () => {
  it('reproduces every golden window, _try_split call, table, cost and merge', () => {
    expect(fixtures.knuth.length).toBeGreaterThanOrEqual(60);
    for (const c of fixtures.knuth) {
      const run = knuthTrace({ piles: c.piles });
      const want: SplitCall[] = c.calls.map(([i, k, j, old, cost]) => [i, k, j, num(old), cost]);
      expect(run.windows, JSON.stringify(c.piles)).toEqual(c.windows);
      expect(run.calls, JSON.stringify(c.piles)).toEqual(want);
      expect([run.dp, run.split]).toEqual([c.dp, c.split]);
      expect([run.cost, run.merges, run.tries]).toEqual([c.cost, c.merges, c.tries]);
    }
  });

  it('fills the same tables and merges as Interval DP, with a subset of its splits in the same order', () => {
    const r = rng(1000);
    for (let t = 0; t < 400; t++) {
      const piles = randomPiles(r);
      const run = knuthTrace({ piles });
      const plain = intervalDpTrace({ piles });
      expect([run.dp, run.split, run.cost, run.merges]).toEqual([plain.dp, plain.split, plain.cost, plain.merges]);
      const tried = new Set(run.calls.map(([i, k, j]) => `${i},${k},${j}`));
      const order = plain.calls.filter(([i, k, j]) => tried.has(`${i},${k},${j}`)).map(([i, k, j]) => [i, k, j]);
      expect(run.calls.map(([i, k, j]) => [i, k, j])).toEqual(order);
      expect(run.plain).toBe(plain.calls.length);
      expectWellFormed(run, piles.length);
    }
  });

  it('tries exactly the telescoped number of splits, inside windows bounded by the last diagonal', () => {
    const r = rng(1400);
    for (let t = 0; t < 400; t++) {
      const piles = randomPiles(r);
      const n = piles.length;
      const run = knuthTrace({ piles });
      expect(run.tries).toBe(run.calls.length);
      expect(run.tries).toBe(telescoped(run.split, n));
      expect(run.tries).toBeLessThanOrEqual(run.plain);
      for (const [i, j, lo, hi] of run.windows) {
        if (j - i === 1) expect([lo, hi]).toEqual([i, i]);
        else expect([lo, hi]).toEqual([run.split[i][j - 1], run.split[i + 1][j]]);
        expect(i <= lo && lo <= run.split[i][j] && run.split[i][j] <= hi && hi < j).toBe(true);
      }
    }
    expect(knuthTrace(parseKnuth('3, 2, 4, 1')).tries).toBe(8);
    expect(knuthTrace(parseKnuth('5, 1, 4, 2, 8, 3, 7, 6')).tries).toBe(48);
    expect(knuthTrace(parseKnuth('99, 1, 1, 1, 1, 1, 1, 99')).tries).toBe(64);
  });

  it('marks the ends of the window in split and the two cells read in dp', () => {
    const run = knuthTrace(parseKnuth('5, 1, 4, 2, 8, 3, 7, 6'));
    const windowFrames = run.frames.filter((f) => f.line === 3);
    expect(windowFrames.length).toBe(run.windows.length);
    windowFrames.forEach((f, t) => {
      const [i, j, lo, hi] = run.windows[t];
      const cells = f.state.split.tables[0].cells;
      expect(cells[i][j]?.role).toBe('active');
      if (j - i > 1) {
        expect(cells[i][j - 1]?.role).toBe('compare');
        expect(cells[i + 1][j]?.role).toBe('compare');
        expect([cells[i][j - 1]?.text, cells[i + 1][j]?.text]).toEqual([String(lo), String(hi)]);
      }
      const strip = f.state.strips[0];
      expect(strip.label).toContain(`Window of dp[${i}][${j}]`);
      expect(strip.items.map((x) => x.text)).toEqual(Array.from({ length: hi - lo + 1 }, (_, x) => `k = ${lo + x}`));
    });
    const tries = run.frames.filter((f) => f.line === 5 || f.line === 6);
    expect(tries.length).toBe(run.calls.length);
    tries.forEach((f, t) => {
      const [i, k, j] = run.calls[t];
      const cells = f.state.dp.tables[0].cells;
      expect(cells[i][k]?.role).toBe('compare');
      expect(cells[k + 1][j]?.role).toBe('compare');
      expect(cells[i][j]?.role).toBe('active');
      const current = f.state.strips[0].items.filter((x) => x.role === 'active').map((x) => x.text);
      expect(current).toEqual([`k = ${k}`]);
      const counts = f.state.strips.at(-1)!.items.map((x) => x.text);
      expect(counts).toEqual([`with windows: ${t + 1}`, expect.stringMatching(/^every split: \d+$/)]);
    });
    const last = run.frames.at(-1)!.state.strips;
    expect(last.map((s) => s.items.map((x) => x.text))).toEqual([['with windows: 48', 'every split: 84']]);
  });

  it('writes captions whose numbers match the code, over 2000 random inputs', () => {
    const r = rng(1547);
    const tryRe = /^dp\[(\d+)\]\[(\d+)\], last merge after pile (\d+): dp\[(\d+)\]\[(\d+)\] \+ dp\[(\d+)\]\[(\d+)\] \+ sum\((\d+)\.\.(\d+)\) = (\d+) \+ (\d+) \+ (\d+) = (\d+)\. /;
    const windowRe = /^dp\[(\d+)\]\[(\d+)\]: its window runs from split\[(\d+)\]\[(\d+)\] = (\d+) to split\[(\d+)\]\[(\d+)\] = (\d+), so it tries k = (\d+)(?: to (\d+))?: (\d+) splits? of the (\d+) from (\d+) to (\d+)\.$/;
    for (let t = 0; t < 2000; t++) {
      const piles = randomPiles(r);
      const n = piles.length;
      const run = knuthTrace({ piles });
      const P = [0];
      piles.forEach((p, x) => P.push(P[x] + p));
      const captions = run.frames.map((f) => f.caption);
      const tries = captions.filter((c) => tryRe.test(c));
      expect(tries.length).toBe(run.calls.length);
      tries.forEach((c, x) => {
        const [i, k, j, before, cost] = run.calls[x];
        const m = c.match(tryRe)!.slice(1).map(Number);
        expect(m).toEqual([i, j, k, i, k, k + 1, j, i, j, run.dp[i][k], run.dp[k + 1][j], P[j + 1] - P[i], cost]);
        if (before === Infinity) expect(c).toContain('The first split of the window');
        else if (cost < before) expect(c).toContain(`Less than ${before}, so it is kept: split[${i}][${j}] = ${k}.`);
        else if (cost === before) expect(c).toContain(`Equal to ${before}: a tie keeps the smaller split`);
        else expect(c).toContain(`More than ${before}: split[${i}][${j}] stays`);
      });
      const windowCaptions = captions.filter((c) => windowRe.test(c));
      expect(windowCaptions.length).toBe(run.windows.filter(([i, j]) => j - i > 1).length);
      windowCaptions.forEach((c) => {
        const [i, j, a, b, lo, d, e, hi, k1, k2, width, all, from, to] = c.match(windowRe)!.slice(1).map((v) => (v === undefined ? NaN : Number(v)));
        expect([a, b, d, e]).toEqual([i, j - 1, i + 1, j]);
        expect([lo, hi]).toEqual([run.split[i][j - 1], run.split[i + 1][j]]);
        expect(k1).toBe(lo);
        if (lo === hi) expect(k2).toBeNaN();
        else expect(k2).toBe(hi);
        expect([width, all, from, to]).toEqual([hi - lo + 1, j - i, i, j - 1]);
      });
      // Wrong numbers, plurals and words: one filter per run, so 2000 runs stay quick.
      const stale = [
        /undefined|NaN|null|Infinity|\binf\b/,
        /\s{2}|\s[.,:]/,
        /\b1 (ranges|merges|piles|splits)\b|\b(?:[02-9]|\d\d+) (range|merge|split)\b/,
        /\b1 split were\b|\b(?:[02-9]|\d\d+) splits outside the window was\b/,
        /piles (\d+)\.\.\1\b/,
      ];
      expect(captions.filter((c) => stale.some((re) => re.test(c)))).toEqual([]);
      const done = captions.at(-1)!;
      if (n === 1) expect(done).toContain('merge_piles returns 0 with no merges');
      else {
        expect(done).toContain(`dp[0][${n - 1}] = ${run.cost}`);
        const costs = run.merges.map(([i, , j]) => P[j + 1] - P[i]);
        expect(done).toContain(`cost ${costs.join(' + ')} = ${run.cost}.`);
        expect(done).toContain(`The windows held ${run.tries} split`);
        expect(done).toContain(`trying every split takes ${(n ** 3 - n) / 6}.`);
      }
      const skippedCaptions = captions.filter((c) => / never tried\.$| held every split of this range\.$/.test(c));
      expect(skippedCaptions.length).toBe(n * (n - 1) / 2);
      const labels = run.frames.flatMap((f) => f.state.strips.map((x) => x.label));
      expect(labels.filter((l) => /undefined|NaN|\b1 splits\b|\b(?:[02-9]|\d\d+) split\b/.test(l))).toEqual([]);
    }
  });

  it('reads the merge tree back like Interval DP', () => {
    const run = knuthTrace(parseKnuth('3, 2, 4, 1'));
    expect([run.cost, run.merges]).toEqual([20, [[0, 0, 1], [2, 2, 3], [0, 1, 3]]]);
    expect(run.windows).toEqual([[0, 1, 0, 0], [1, 2, 1, 1], [2, 3, 2, 2], [0, 2, 0, 1], [1, 3, 1, 2], [0, 3, 1, 1]]);
    const last = run.frames.at(-1)!.state;
    expect(last.tree?.nodes.map((x) => x.label)).toEqual(['10', '5', '3', '2', '5', '4', '1']);
    expect(last.tree?.strips?.[0].items.map((x) => x.text)).toEqual(['3 + 2 = 5', '4 + 1 = 5', '5 + 5 = 10']);
    expect(run.frames.findIndex((f) => f.state.tree)).toBe(run.frames.findIndex((f) => f.line === 7));
  });

  it('handles one pile and two piles', () => {
    const one = knuthTrace(parseKnuth('7'));
    expect([one.cost, one.merges, one.calls, one.tries, one.frames.length]).toEqual([0, [], [], 0, 1]);
    const two = knuthTrace(parseKnuth('4 9'));
    expect([two.cost, two.merges, two.tries, two.windows]).toEqual([13, [[0, 0, 1]], 1, [[0, 1, 0, 0]]]);
  });

  it('rejects what the Python code rejects, and inputs too large to draw', () => {
    for (const text of ['', '3, -1, 2', '1 2 3 4 5 6 7 8 9', '100', '2.5', 'a, b']) expect(() => parseKnuth(text), text).toThrow(InputError);
    expect(() => parseKnuth('3, -1')).toThrow(/ValueError/);
  });
});
