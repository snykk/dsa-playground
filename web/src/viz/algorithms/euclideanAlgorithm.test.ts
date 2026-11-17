import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import { EUCLID_CODE, euclidTrace, parseEuclid, tiling, type EuclidCall, type EuclidKind, type EuclidState } from './euclideanAlgorithm';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/numberTheory.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** Reference gcd by trial: the largest d dividing both (0 for gcd(0, 0)). */
function bruteGcd(a: number, b: number): number {
  const A = Math.abs(a);
  const B = Math.abs(b);
  if (A === 0) return B;
  if (B === 0) return A;
  for (let d = Math.min(A, B); d >= 1; d--) if (A % d === 0 && B % d === 0) return d;
  return 1;
}

function expectWellFormed(frames: Array<Frame<EuclidState>>) {
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(10);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(EUCLID_CODE.length);
    }
    const ids = f.state.panel.runs.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const row of f.state.table.rows) expect(row.length).toBe(f.state.table.columns.length);
    const cam = f.state.panel.camera;
    expect(cam.w).toBeGreaterThanOrEqual(0);
    expect(cam.h).toBeGreaterThanOrEqual(0);
    // The camera stays inside the rectangle.
    expect(cam.x).toBeGreaterThanOrEqual(0);
    expect(cam.y).toBeGreaterThanOrEqual(0);
    expect(cam.x + cam.w).toBeLessThanOrEqual(f.state.panel.width);
    expect(cam.y + cam.h).toBeLessThanOrEqual(f.state.panel.height);
  }
}

const KINDS: EuclidKind[] = ['gcd', 'gcd_iterative', 'lcm', 'extended_gcd'];

describe('tiling: the squares Euclid cuts', () => {
  it('cover the rectangle exactly, and the last square side is the gcd', () => {
    const rand = rng(3);
    for (let t = 0; t < 300; t++) {
      const A = Math.floor(rand() * 400) + 1;
      const B = Math.floor(rand() * 400) + 1;
      const levels = tiling(A, B, 0);
      let area = 0;
      for (const lv of levels) if (lv.run) area += lv.run.count * lv.run.side * lv.run.side;
      expect(area).toBe(A * B);
      expect(levels[levels.length - 1].a).toBe(bruteGcd(A, B));
      // Each run stays inside its level's rectangle, and the leftover is the next rectangle.
      for (let k = 0; k + 1 < levels.length; k++) {
        const lv = levels[k];
        if (lv.run) {
          const len = lv.run.count * lv.run.side;
          if (lv.run.dir === 'x') expect(lv.run.x + len).toBeLessThanOrEqual(lv.rect.x + lv.rect.w);
          else expect(lv.run.y + len).toBeLessThanOrEqual(lv.rect.y + lv.rect.h);
        }
        expect(levels[k + 1].rect).toEqual(lv.rest);
      }
    }
  });
});

describe('euclidTrace', () => {
  it('agrees with a brute-force gcd and checks Bezout on random calls', () => {
    const rand = rng(11);
    for (let t = 0; t < 150; t++) {
      const calls: EuclidCall[] = Array.from({ length: 1 + Math.floor(rand() * 4) }, () => {
        const size = [12, 300, 9999][Math.floor(rand() * 3)];
        const pickV = () => (rand() < 0.08 ? 0 : Math.floor(rand() * (2 * size + 1)) - size);
        return { kind: KINDS[Math.floor(rand() * 4)], a: pickV(), b: pickV() };
      });
      const run = euclidTrace({ calls });
      expect(run.steps.length).toBe(calls.length);
      calls.forEach((c, i) => {
        const step = run.steps[i];
        const g = bruteGcd(c.a, c.b);
        if (c.kind === 'extended_gcd') {
          const [rg, x, y] = step.result as [number, number, number];
          expect(rg).toBe(g);
          expect(c.a * x + c.b * y).toBe(g);
          for (const [a, b, lg, lx, ly] of step.levels!) {
            expect(lg).toBe(g);
            expect(a * lx + b * ly).toBe(g);
          }
        } else if (c.kind === 'lcm') {
          const want = c.a === 0 || c.b === 0 ? 0 : Math.abs(c.a * c.b) / g;
          expect(step.result).toBe(want);
          if (want) expect(want % Math.abs(c.a)).toBe(0);
        } else {
          expect(step.result).toBe(g);
        }
      });
      expectWellFormed(run.frames);
      expect(run.frames.length).toBeLessThan(2000);
    }
  });

  it('the remainder table holds every level, and the extended form fills x and y bottom-up', () => {
    const run = euclidTrace(parseEuclid('ext 240 46'));
    const last = run.frames[run.frames.length - 1].state.table;
    expect(last.columns).toEqual(['a', 'b', 'a//b', 'a%b', 'x', 'y', 'a*x+b*y']);
    expect(last.rows.map((r) => r.map((c) => c.text))).toEqual([
      ['240', '46', '5', '10', '-9', '47', '2'],
      ['46', '10', '4', '6', '2', '-9', '2'],
      ['10', '6', '1', '4', '-1', '2', '2'],
      ['6', '4', '1', '2', '1', '-1', '2'],
      ['4', '2', '2', '0', '0', '1', '2'],
      ['2', '0', '', '', '1', '0', '2'],
    ]);
    // The first frame of the way back up fills only the row above the base.
    const up = run.frames.findIndex((f) => f.caption.startsWith('Back in _extended_gcd_nonneg(4, 2)'));
    expect(run.frames[up].state.table.rows.map((r) => r[4].text)).toEqual(['', '', '', '', '0', '1']);
    expect(run.steps[0].result).toEqual([2, -9, 47]);
  });

  it('flips the signs of x and y for negative inputs (extended_gcd(-240, 46) = (2, 9, 47))', () => {
    const run = euclidTrace(parseEuclid('ext -240 46, ext 240 -46, ext -7 0, ext 0 0'));
    expect(run.steps.map((s) => s.result)).toEqual([
      [2, 9, 47],
      [2, -9, -47],
      [7, -1, 0],
      [0, 1, 0],
    ]);
    // The answer's frame shows the call's own signs in the top row, so the check column holds g.
    const answer = run.frames.filter((f) => f.caption.includes('extended_gcd returns (2, -9, -47)'));
    expect(answer).toHaveLength(1);
    const top = answer[0].state.table.rows[0];
    expect(top.map((c) => c.text)).toEqual(['240', '-46', '5', '10', '-9', '-47', '2']);
    expect([top[1].role, top[5].role]).toEqual(['active', 'active']);
  });

  it('cuts no square when a < b, and handles zero sides', () => {
    const run = euclidTrace(parseEuclid('gcd 18 48, gcd 0 5, gcd 5 0, gcd 0 0, lcm 0 7'));
    expect(run.steps.map((s) => s.result)).toEqual([6, 5, 5, 0, 0]);
    expect(run.steps[0].pairs).toEqual([
      [18, 48],
      [48, 18],
      [18, 12],
      [12, 6],
      [6, 0],
    ]);
    expect(run.frames.some((f) => f.caption.includes('the arguments just swap'))).toBe(true);
  });

  it('the camera zooms into the strip that is left, and back out on the way up', () => {
    const run = euclidTrace(parseEuclid('ext 89 55'));
    const areas = run.frames.map((f) => f.state.panel.camera.w * f.state.panel.camera.h);
    const deepest = areas.indexOf(Math.min(...areas));
    expect(deepest).toBeGreaterThan(2);
    expect(areas[0]).toBe(89 * 55);
    expect(areas[areas.length - 1]).toBe(89 * 55);
    // A long thin rectangle shows the leftover and the last squares instead of a hairline.
    const thin = euclidTrace(parseEuclid('gcd 9999 2'));
    const cam = thin.frames[1].state.panel.camera;
    expect(cam.w / cam.h).toBeLessThanOrEqual(4);
  });

  it('stays well under 2000 frames on the largest input', () => {
    const text = Array.from({ length: 8 }, () => 'ext 6765 4181').join(', ');
    expect(euclidTrace(parseEuclid(text)).frames.length).toBeLessThan(2000);
  });
});

describe('euclidTrace matches euclidean_algorithm.py (golden fixtures)', () => {
  const cases = fixtures.euclid as Array<{
    a: number;
    b: number;
    gcd: { calls: number[][]; result: number };
    iter: { loop: number[][]; result: number };
    lcm: { calls: number[][]; result: number };
    ext: { levels: number[][]; result: number[] };
  }>;

  it('has the cases', () => expect(cases.length).toBeGreaterThanOrEqual(60));

  it('gcd: every recursive call; gcd_iterative: every iteration; lcm; extended_gcd: every level', () => {
    for (const c of cases) {
      const run = euclidTrace({
        calls: [
          { kind: 'gcd', a: c.a, b: c.b },
          { kind: 'gcd_iterative', a: c.a, b: c.b },
          { kind: 'lcm', a: c.a, b: c.b },
          { kind: 'extended_gcd', a: c.a, b: c.b },
        ],
      });
      const [g, it, lc, ext] = run.steps;
      const label = `(${c.a}, ${c.b})`;
      expect(g.result, label).toBe(c.gcd.result);
      expect(g.pairs, label).toEqual(c.gcd.calls.map(([a, b]) => [Math.abs(a), Math.abs(b)]));
      expect(it.result, label).toBe(c.iter.result);
      // The loop body runs once per pair with b != 0.
      expect(it.pairs.slice(0, -1), label).toEqual(c.iter.loop);
      expect(lc.result, label).toBe(c.lcm.result);
      if (c.lcm.calls.length) expect(lc.pairs, label).toEqual(c.lcm.calls.map(([a, b]) => [Math.abs(a), Math.abs(b)]));
      expect(ext.result, label).toEqual(c.ext.result);
      expect(ext.levels, label).toEqual(c.ext.levels);
    }
  });
});

describe('parseEuclid', () => {
  it('reads calls and their short forms', () => {
    expect(parseEuclid('ext 240 46, gcd(48, 18); gcdi -5 0\nlcm: 4 6').calls).toEqual([
      { kind: 'extended_gcd', a: 240, b: 46 },
      { kind: 'gcd', a: 48, b: 18 },
      { kind: 'gcd_iterative', a: -5, b: 0 },
      { kind: 'lcm', a: 4, b: 6 },
    ]);
  });

  it('gives friendly errors', () => {
    expect(() => parseEuclid('')).toThrow(InputError);
    expect(() => parseEuclid('gcd 1')).toThrow(/two integers/);
    expect(() => parseEuclid('max 1 2')).toThrow(/Cannot read/);
    expect(() => parseEuclid('gcd 1 x')).toThrow(/whole number/);
    expect(() => parseEuclid('gcd 10000 1')).toThrow(/9999/);
    expect(() => parseEuclid(Array.from({ length: 9 }, () => 'gcd 1 1').join(', '))).toThrow(/At most 8/);
  });
});
