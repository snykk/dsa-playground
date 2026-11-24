import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { INTERVAL_CODE, intervalDpTrace, parseIntervalDp, type IntervalRun, type MergeStep, type SplitCall } from './intervalDp';
import { rng } from './patternsMoreTestKit';

interface Case {
  piles: number[];
  calls: Array<[number, number, number, number | string, number]>;
  dp: number[][];
  split: number[][];
  cost: number;
  merges: MergeStep[];
}

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/advancedDp.json', import.meta.url), 'utf8')) as { intervalDp: Case[] };
const num = (v: number | string) => (v === 'inf' ? Infinity : (v as number));

/** Every order of merges: merge any two neighbours, then go on with the shorter row. */
function bruteMerge(piles: number[]): number {
  if (piles.length <= 1) return 0;
  let best = Infinity;
  for (let t = 0; t + 1 < piles.length; t++) {
    const size = piles[t] + piles[t + 1];
    best = Math.min(best, size + bruteMerge([...piles.slice(0, t), size, ...piles.slice(t + 2)]));
  }
  return best;
}

/** Play the merges out: each joins two neighbouring piles that are exactly i..k and k+1..j. */
function replay(piles: number[], merges: MergeStep[]): number {
  let built = piles.map((_, t) => [t, t]);
  let total = 0;
  for (const [i, k, j] of merges) {
    const p = built.findIndex(([a, b]) => a === i && b === k);
    expect(p).toBeGreaterThanOrEqual(0);
    expect(built[p + 1]).toEqual([k + 1, j]);
    built = [...built.slice(0, p), [i, j], ...built.slice(p + 2)];
    total += piles.slice(i, j + 1).reduce((s, x) => s + x, 0);
  }
  expect(built).toEqual([[0, piles.length - 1]]);
  return total;
}

function randomPiles(r: ReturnType<typeof rng>): number[] {
  return Array.from({ length: r.int(1, 8) }, () => r.int(0, r.pick([2, 9, 99])));
}

/** Every frame: a caption, a line in range, and tables that keep one shape. */
function expectWellFormed(run: IntervalRun, n: number) {
  for (const f of run.frames) {
    expect(f.caption.length).toBeGreaterThan(20);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(INTERVAL_CODE.length);
    }
    for (const t of [f.state.dp.tables[0], f.state.split.tables[0]]) {
      expect(t.cells.length).toBe(n);
      for (const row of t.cells) expect(row.length).toBe(n);
    }
    expect(f.state.dp.chips?.[0].chips.length).toBe(n);
  }
}

describe('intervalDpTrace (interval_dp.py, merge_piles_plan)', () => {
  it('reproduces every golden _try_split call, table, cost and merge', () => {
    expect(fixtures.intervalDp.length).toBeGreaterThanOrEqual(60);
    for (const c of fixtures.intervalDp) {
      const run = intervalDpTrace({ piles: c.piles });
      const want: SplitCall[] = c.calls.map(([i, k, j, old, cost]) => [i, k, j, num(old), cost]);
      expect(run.calls, JSON.stringify(c.piles)).toEqual(want);
      expect([run.dp, run.split]).toEqual([c.dp, c.split]);
      expect([run.cost, run.merges]).toEqual([c.cost, c.merges]);
    }
  });

  it('agrees with every merge order, and its merges replay to the cost', () => {
    const r = rng(1000);
    for (let t = 0; t < 400; t++) {
      const piles = randomPiles(r);
      if (piles.length > 7) continue;
      const run = intervalDpTrace({ piles });
      expect(run.cost, piles.join(',')).toBe(bruteMerge(piles));
      expect(replay(piles, run.merges)).toBe(run.cost);
      expectWellFormed(run, piles.length);
    }
  });

  it('keeps the smallest k that reaches the minimum', () => {
    const r = rng(1039);
    for (let t = 0; t < 150; t++) {
      const piles = Array.from({ length: r.int(2, 6) }, () => r.int(0, r.pick([1, 2, 5])));
      const { split } = intervalDpTrace({ piles });
      const sum = (i: number, j: number) => piles.slice(i, j + 1).reduce((s, x) => s + x, 0);
      for (let i = 0; i < piles.length; i++) {
        for (let j = i + 1; j < piles.length; j++) {
          const best = bruteMerge(piles.slice(i, j + 1));
          let want = -1;
          for (let k = i; k < j && want < 0; k++) {
            if (bruteMerge(piles.slice(i, k + 1)) + bruteMerge(piles.slice(k + 1, j + 1)) + sum(i, j) === best) want = k;
          }
          expect(split[i][j], `${piles} ${i} ${j}`).toBe(want);
        }
      }
    }
    expect(intervalDpTrace(parseIntervalDp('1, 1, 1')).merges).toEqual([[1, 1, 2], [0, 0, 2]]);
  });

  it('fills one diagonal at a time, each split reading two finished cells', () => {
    const run = intervalDpTrace(parseIntervalDp('5, 1, 4, 2, 8, 3, 7, 6'));
    expect(run.calls.length).toBe((8 ** 3 - 8) / 6);
    const lengths = run.calls.map(([i, , j]) => j - i);
    expect(lengths).toEqual([...lengths].sort((a, b) => a - b));
    const tries = run.frames.filter((f) => f.line === 4 || f.line === 5);
    expect(tries.length).toBe(run.calls.length);
    tries.forEach((f, t) => {
      const [i, k, j] = run.calls[t];
      const cells = f.state.dp.tables[0].cells;
      expect(cells[i][k]?.role).toBe('compare');
      expect(cells[k + 1][j]?.role).toBe('compare');
      expect(cells[i][j]?.role).toBe('active');
      expect(cells[i][k]?.text).not.toBe('');
      expect(cells[k + 1][j]?.text).not.toBe('');
    });
    const lengthFrames = run.frames.filter((f) => f.line === 1).map((f) => f.caption.match(/^Length (\d+):/)?.[1]);
    expect(lengthFrames).toEqual(['2', '3', '4', '5', '6', '7', '8']);
  });

  it('writes captions whose numbers match the code, over 2000 random inputs', () => {
    const r = rng(1547);
    const tryRe = /^dp\[(\d+)\]\[(\d+)\], last merge after pile (\d+): dp\[(\d+)\]\[(\d+)\] \+ dp\[(\d+)\]\[(\d+)\] \+ sum\((\d+)\.\.(\d+)\) = (\d+) \+ (\d+) \+ (\d+) = (\d+)\. /;
    for (let t = 0; t < 2000; t++) {
      const piles = randomPiles(r);
      const run = intervalDpTrace({ piles });
      const P = [0];
      piles.forEach((p, x) => P.push(P[x] + p));
      const captions = run.frames.map((f) => f.caption);
      const tries = captions.filter((c) => tryRe.test(c));
      expect(tries.length).toBe(run.calls.length);
      tries.forEach((c, x) => {
        const [i, k, j, before, cost] = run.calls[x];
        const m = c.match(tryRe)!.slice(1).map(Number);
        expect(m).toEqual([i, j, k, i, k, k + 1, j, i, j, run.dp[i][k], run.dp[k + 1][j], P[j + 1] - P[i], cost]);
        if (before === Infinity) expect(c).toContain('The first split tried');
        else if (cost < before) expect(c).toContain(`Less than ${before}, so it is kept: split[${i}][${j}] = ${k}.`);
        else if (cost === before) expect(c).toContain(`Equal to ${before}: a tie keeps the smaller split`);
        else expect(c).toContain(`More than ${before}: split[${i}][${j}] stays`);
      });
      for (const c of captions) {
        expect(c).not.toMatch(/undefined|NaN|null|Infinity|\binf\b/);
        expect(c).not.toMatch(/\s{2}|\s[.,:]/);
        expect(c).not.toMatch(/\b1 (ranges|merges|piles)\b|\b(?:[02-9]|\d\d+) (range|merge)\b/);
        expect(c).not.toMatch(/piles (\d+)\.\.\1\b/);
      }
      const done = captions.at(-1)!;
      if (piles.length === 1) expect(done).toContain('merge_piles returns 0 with no merges');
      else {
        expect(done).toContain(`dp[0][${piles.length - 1}] = ${run.cost}`);
        const costs = run.merges.map(([i, , j]) => P[j + 1] - P[i]);
        expect(done).toContain(`cost ${costs.join(' + ')} = ${run.cost}.`);
        expect(costs.reduce((s, x) => s + x, 0)).toBe(run.cost);
      }
      const merged = captions.filter((c) => c.startsWith('Merge '));
      expect(merged.length).toBe(Math.max(0, piles.length - 1));
    }
  });

  it('reads the merge tree back with the post-order of the stack', () => {
    const run = intervalDpTrace(parseIntervalDp('3, 2, 4, 1'));
    expect(run.cost).toBe(20);
    expect(run.merges).toEqual([[0, 0, 1], [2, 2, 3], [0, 1, 3]]);
    const last = run.frames.at(-1)!.state;
    expect(last.tree?.nodes.map((n) => n.label)).toEqual(['10', '5', '3', '2', '5', '4', '1']);
    expect(last.tree?.totals?.[0].value).toBe('20');
    expect(last.tree?.strips?.[0].items.map((i) => i.text)).toEqual(['3 + 2 = 5', '4 + 1 = 5', '5 + 5 = 10']);
    // The tree only appears once the read-back starts.
    expect(run.frames.findIndex((f) => f.state.tree)).toBe(run.frames.findIndex((f) => f.line === 6));
  });

  it('handles one pile and two piles', () => {
    const one = intervalDpTrace(parseIntervalDp('7'));
    expect([one.cost, one.merges, one.calls, one.frames.length]).toEqual([0, [], [], 1]);
    const two = intervalDpTrace(parseIntervalDp('4 9'));
    expect([two.cost, two.merges]).toEqual([13, [[0, 0, 1]]]);
  });

  it('rejects what the Python code rejects, and inputs too large to draw', () => {
    for (const text of ['', '3, -1, 2', '1 2 3 4 5 6 7 8 9', '100', '2.5', 'a, b']) expect(() => parseIntervalDp(text), text).toThrow(InputError);
    expect(() => parseIntervalDp('3, -1')).toThrow(/ValueError/);
    expect(parseIntervalDp(' 3, 2;4 1 ')).toEqual({ piles: [3, 2, 4, 1] });
  });
});
