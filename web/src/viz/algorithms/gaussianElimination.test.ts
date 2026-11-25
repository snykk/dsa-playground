import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import {
  EPS,
  fmtNum,
  formatGaussInput,
  GAUSS_CODE,
  gaussTrace,
  parseGaussFloat,
  parseGaussMod,
  pmod,
  powMod,
  type GaussFloatInput,
  type GaussInput,
  type GaussModInput,
  type GaussRun,
} from './gaussianElimination';
import { pyFloat } from './pointLineCircle';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/mathAndProblemTypes.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const TIMES = String.fromCodePoint(0xd7);

/* ---------- golden fixtures ---------- */

interface FloatCase {
  A: number[][];
  b: number[];
  eps: number;
  pivoting: boolean;
  choices: Array<[number, number, number]>;
  ops: Array<[number, number, number, number, number[]]>;
  result: { kind: string; x: number[] | null; rank: number; pivotCols: number[]; swaps: number; updates: number };
  det: number | null;
}

interface ModCase {
  A: string[][];
  b: string[];
  p: string;
  inverses: Array<[string, string]>;
  ops: Array<[number, number, number, string, string[]]>;
  result: { kind: string; x: string[] | null; rank: number; pivotCols: number[]; swaps: number; updates: number } | null;
  error: string | null;
  det: string | null;
}

describe('golden fixtures from gaussian_elimination.py', () => {
  it('reproduces every pivot choice, row operation, result and determinant of solve', () => {
    const cases: FloatCase[] = fixtures.gaussian;
    expect(cases.length).toBeGreaterThanOrEqual(40);
    for (const c of cases) {
      const run = gaussTrace({ mode: 'float', A: c.A, b: c.b, eps: c.eps, pivoting: c.pivoting }, false);
      expect(run.choices, JSON.stringify(c.A)).toEqual(c.choices);
      expect(run.ops.map((o) => [o.target, o.source, o.col, o.factor, o.row])).toEqual(c.ops);
      expect(run.result).toEqual(c.result);
      expect(run.det).toEqual(c.det);
    }
  });

  it('reproduces every inverse, row operation, result, error and determinant of solve_mod', () => {
    const cases: ModCase[] = fixtures.gaussianMod;
    expect(cases.length).toBeGreaterThanOrEqual(40);
    for (const c of cases) {
      const input: GaussModInput = { mode: 'mod', A: c.A.map((r) => r.map(BigInt)), b: c.b.map(BigInt), p: BigInt(c.p) };
      const run = gaussTrace(input, false);
      const label = `${JSON.stringify(c.A)} mod ${c.p}`;
      expect(run.inverses.map(([a, i]) => [a.toString(), i.toString()]), label).toEqual(c.inverses);
      expect(run.ops.map((o) => [o.target, o.source, o.col, o.factor.toString(), o.row.map(String)]), label).toEqual(c.ops);
      expect(run.error, label).toBe(c.error);
      if (c.result === null) expect(run.result).toBeNull();
      else expect({ ...run.result!, x: run.result!.x && run.result!.x.map(String) }, label).toEqual(c.result);
      const square = c.A.length === c.A[0].length;
      expect(run.det === null ? null : run.det.toString(), label).toBe(c.det === 'ValueError' ? null : square ? c.det : null);
    }
  });

  it('covers every kind, both pivot rules, a composite p and p < 2', () => {
    const kinds = new Set([...fixtures.gaussian, ...fixtures.gaussianMod].flatMap((c: FloatCase | ModCase) => (c.result ? [c.result.kind] : [])));
    expect([...kinds].sort()).toEqual(['infinite', 'no solution', 'unique']);
    expect(fixtures.gaussian.some((c: FloatCase) => !c.pivoting)).toBe(true);
    const errors = fixtures.gaussianMod.flatMap((c: ModCase) => (c.error ? [c.error] : []));
    expect(errors.some((e: string) => e.includes('p must be prime'))).toBe(true);
    expect(errors.some((e: string) => e.includes('at least 2'))).toBe(true);
  });
});

/* ---------- against the definition ---------- */

function residual(A: number[][], x: number[], b: number[]): number {
  return Math.max(...A.map((row, i) => Math.abs(row.reduce((s, a, j) => s + a * x[j], 0) - b[i])));
}

function randomFloat(rand: () => number): GaussFloatInput {
  const n = 1 + Math.floor(rand() * 5);
  const m = 1 + Math.floor(rand() * 5);
  const A = Array.from({ length: n }, () => Array.from({ length: m }, () => Math.floor(rand() * 19) - 9));
  if (n > 1 && rand() < 0.3) A[n - 1] = A[0].map((v) => 2 * v);
  const b = Array.from({ length: n }, () => Math.floor(rand() * 19) - 9);
  return { mode: 'float', A, b, eps: EPS, pivoting: rand() < 0.8 };
}

const PRIMES = [2n, 3n, 5n, 7n, 13n, 97n, 1000000007n, 2147483647n];

function randomMod(rand: () => number): GaussModInput {
  const n = 1 + Math.floor(rand() * 5);
  const m = 1 + Math.floor(rand() * 5);
  const A = Array.from({ length: n }, () => Array.from({ length: m }, () => BigInt(Math.floor(rand() * 41) - 20)));
  if (n > 1 && rand() < 0.3) A[n - 1] = A[0].map((v) => 3n * v);
  const b = Array.from({ length: n }, () => BigInt(Math.floor(rand() * 41) - 20));
  return { mode: 'mod', A, b, p: PRIMES[Math.floor(rand() * PRIMES.length)] };
}

describe('the answers are right', () => {
  it('solve returns an x that solves the system, and rank and kind agree', () => {
    const rand = rng(1);
    for (let t = 0; t < 400; t++) {
      const input = randomFloat(rand);
      const run = gaussTrace({ ...input, pivoting: true }, false);
      const r = run.result!;
      expect(r.rank).toBeLessThanOrEqual(Math.min(input.A.length, input.A[0].length));
      if (r.kind !== 'no solution') {
        expect(residual(input.A, r.x as number[], input.b)).toBeLessThanOrEqual(1e-7);
        expect(r.kind).toBe(r.rank === input.A[0].length ? 'unique' : 'infinite');
      }
    }
  });

  it('solve_mod returns an x that solves the system modulo p', () => {
    const rand = rng(2);
    for (let t = 0; t < 400; t++) {
      const input = randomMod(rand);
      const r = gaussTrace(input, false).result!;
      if (r.kind === 'no solution') continue;
      const x = r.x as bigint[];
      input.A.forEach((row, i) => {
        const lhs = row.reduce((s, a, j) => s + a * x[j], 0n);
        expect(pmod(lhs - input.b[i], input.p)).toBe(0n);
      });
      for (const v of x) expect(v >= 0n && v < input.p).toBe(true);
    }
  });

  it('shows the pivoting example: 4.47 without pivoting, 3 with it', () => {
    const naive = gaussTrace(parseGaussFloat('A = [[1e-8, 0, 1], [1, 1e-8, 0], [0, 1, 0]]; b = [1, 2, 3]; no pivoting'), false).result!;
    const good = gaussTrace(parseGaussFloat('A = [[1e-8, 0, 1], [1, 1e-8, 0], [0, 1, 0]]; b = [1, 2, 3]'), false).result!;
    expect(naive.x).toEqual([1.9999999545383673, 4.470348358154297, 0.9999999800000005]);
    expect(good.x).toEqual([1.99999997, 3.0, 0.9999999800000003]);
  });

  it('matches the modular helpers', () => {
    expect(pmod(-11n, 7n)).toBe(3n);
    expect(powMod(2n, 5n, 7n)).toBe(4n);
    expect(powMod(5n, 0n, 1n)).toBe(0n);
  });
});

/* ---------- frames and captions ---------- */

function expectWellFormed(run: GaussRun, input: GaussInput) {
  const code = input.mode === 'mod' ? GAUSS_CODE.mod : GAUSS_CODE.float;
  const n = input.A.length;
  const m = input.A[0].length;
  expect(run.frames.length).toBeGreaterThan(0);
  for (const f of run.frames) {
    expect(f.caption.length).toBeGreaterThan(10);
    expect(f.caption).not.toMatch(/undefined|NaN|null|\[object/);
    expect(f.caption, f.caption).not.toMatch(/\b1 (pivots|swaps|updates|equations|unknowns|entries)\b/);
    expect(f.caption, f.caption).not.toMatch(/\b(0|[2-9]|\d\d+) (pivot|swap|update|equation|unknown)\b(?!s)/);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(code.length);
    }
    const g = f.state.grid;
    expect(g.cells.length).toBe(n);
    for (const row of g.cells) expect(row.length).toBe(m + 1);
    expect(g.colHeaders).toEqual([...Array.from({ length: m }, (_, c) => `x${c}`), 'b']);
    expect([...g.rowHeaders].sort()).toEqual(Array.from({ length: n }, (_, i) => `E${i}`).sort());
    expect(g.corner).toBe('eq');
    const labels = f.state.strips.map((s) => s.label);
    expect(new Set(labels).size).toBe(labels.length);
  }
}

/** Recompute every piece of arithmetic a caption states. */
function checkCaptions(run: GaussRun, input: GaussInput) {
  const caps = run.frames.map((f) => f.caption);
  let op = 0;
  let dets = 0;
  let solved = 0;
  for (const c of caps) {
    if (input.mode === 'mod') {
      const p = input.p;
      let m: RegExpMatchArray | null;
      if ((m = c.match(/^inv = (\d+)\^\(p - 2\) mod (\d+) = (\d+) \(Fermat/))) {
        const [a, q, inv] = [BigInt(m[1]), BigInt(m[2]), BigInt(m[3])];
        expect(q).toBe(p);
        expect(powMod(a, p - 2n, p)).toBe(inv);
        expect((a * inv) % p).toBe(1n);
      }
      if ((m = c.match(/^factor = (\d+) \u00d7 (\d+) mod (\d+) = (\d+)\. Row (\d+) .* row (\d+), modulo/))) {
        expect((BigInt(m[1]) * BigInt(m[2])) % p).toBe(BigInt(m[4]));
        expect(run.ops[op].factor).toBe(BigInt(m[4]));
        expect([run.ops[op].target, run.ops[op].source]).toEqual([Number(m[5]), Number(m[6])]);
        op++;
      }
      if ((m = c.match(/^Row \d+ solves for x\d+: x\d+ = (.*) \u00d7 (\d+) mod (\d+) = (\d+), using/))) {
        const inner = m[1];
        const inv = BigInt(m[2]);
        let v: bigint;
        const t = inner.match(/^\((\d+) - \[(.*)\]\)$/);
        if (t) {
          const sum = t[2].split(' + ').reduce((s, term) => {
            const [a, x] = term.split(` ${TIMES} `).map(BigInt);
            return s + a * x;
          }, 0n);
          v = pmod(BigInt(t[1]) - sum, p);
        } else v = BigInt(inner);
        expect(pmod(v * inv, p)).toBe(BigInt(m[4]));
      }
      if (c.includes('det(A) = ') && !c.includes('det(A) = 0:')) {
        m = c.match(/det\(A\) = (\d+)(?: \([^)]*\))? \u00d7 (.*) mod (\d+) = (\d+)\.$/);
        expect(m, c).not.toBeNull();
        const prod = m![2].split(` ${TIMES} `).reduce((s, v) => (s * BigInt(v)) % p, BigInt(m![1]));
        expect(BigInt(m![1])).toBe(run.result!.swaps % 2 ? p - 1n : 1n);
        expect(prod).toBe(BigInt(m![4]));
        expect(run.det).toBe(BigInt(m![4]));
        dets++;
      }
    } else {
      let m: RegExpMatchArray | null;
      if ((m = c.match(/^factor = (\S+) \/ (\S+) = (\S+)\. Row (\d+) \(E\d+\) -= (\S+) \u00d7 row (\d+):/))) {
        const o = run.ops[op];
        expect(m[3]).toBe(fmtNum(o.factor as number));
        expect(m[5]).toBe(m[3]);
        expect([o.target, o.source]).toEqual([Number(m[4]), Number(m[6])]);
        op++;
      }
      if ((m = c.match(/det\(A\) = ([-+]1)(?: \([^)]*\))? \u00d7 (.*) = (\S+)\.$/))) {
        expect(m[1]).toBe(run.result!.swaps % 2 ? '-1' : '+1');
        expect(m[3]).toBe(pyFloat(run.det as number));
        dets++;
      }
      if ((m = c.match(/^Row (\d+) solves for x(\d+): .* = (\S+)\.(?: The|$)/))) {
        expect(m[3]).toBe(fmtNum((run.result!.x as number[])[Number(m[2])]));
        solved++;
      }
    }
    if (c.startsWith('Row ') && c.includes('solves for x')) {
      const m = c.match(/solves for x(\d+): .* = (\S+?)[.,]?(?: The| using|$)/);
      expect(m, c).not.toBeNull();
    }
  }
  expect(op, 'every row operation has its caption').toBe(run.ops.length);
  if (run.det !== null && run.det !== 0 && run.det !== 0n) expect(dets, caps.join('\n')).toBe(1);
  if (input.mode === 'float' && run.result && run.result.kind !== 'no solution') expect(solved).toBe(run.result.rank);
  const last = caps[caps.length - 1];
  if (run.error) expect(last).toContain('ValueError');
  else {
    const r = run.result!;
    if (r.kind === 'unique') expect(last).toMatch(/^Unique solution: rank \d+ =/);
    if (r.kind === 'infinite') expect(last).toMatch(/^Infinitely many solutions: rank \d+ </);
    if (r.kind === 'no solution') expect(last).toContain('NO_SOLUTION');
    expect(last).toContain(`rank ${r.rank}`);
  }
}

describe('frames', () => {
  it('are well formed, and every caption states correct arithmetic, over many random inputs', () => {
    const rand = rng(3);
    for (let t = 0; t < 3000; t++) {
      const input: GaussInput = t % 2 ? randomFloat(rand) : randomMod(rand);
      const run = gaussTrace(input);
      expectWellFormed(run, input);
      checkCaptions(run, input);
    }
  });

  it('end with the result: kind, rank and the determinant of a square system', () => {
    const run = gaussTrace(parseGaussFloat('A = [[2, 1, -1], [-3, -1, 2], [-2, 1, 2]]; b = [8, -11, -3]'));
    const last = run.frames[run.frames.length - 1];
    expect(last.line).toBe(16);
    expect(last.caption).toContain('Unique solution: rank 3 = 3 unknowns');
    expect(last.caption).toContain('det(A) = +1 (2 swaps) ' + TIMES + ' -3 ' + TIMES + ' 1.667 ' + TIMES + ' 0.2 = -0.9999999999999993.');
    const result = last.state.strips.find((s) => s.label === 'Result')!;
    expect(result.items.map((i) => i.text)).toEqual([`unique ${String.fromCodePoint(0x2713)}`, 'rank 3', 'det -0.9999999999999993']);
    expect(last.state.strips.find((s) => s.label === 'x')!.items.map((i) => i.text)).toEqual(['x0 = 2.0', 'x1 = 3.0000000000000004', 'x2 = -0.9999999999999999']);
    const swap = run.frames.find((f) => f.line === 6)!;
    expect(swap.state.grid.rowHeaders).toEqual(['E1', 'E0', 'E2']);
  });

  it('mark the inconsistent row and a composite modulus as bad', () => {
    const none = gaussTrace(parseGaussFloat('A = [[1, 1], [1, 2], [2, 3]]; b = [3, 5, 9]'));
    const last = none.frames[none.frames.length - 1];
    expect(last.caption).toContain('reads 0 = ');
    expect(Object.values(last.state.grid.roles)).toContain('bad');
    const four = gaussTrace(parseGaussMod('A = [[2, 1], [1, 1]]; b = [1, 1]; p = 4'));
    expect(four.error).toBe("ValueError: 2 has no inverse modulo 4 by Fermat's little theorem: p must be prime");
    expect(four.frames[four.frames.length - 1].caption).toContain('4 is not one');
    const one = gaussTrace(parseGaussMod('A = [[1]]; b = [1]; p = 1'));
    expect(one.error).toBe('ValueError: p = 1: the modulus must be a prime, so at least 2');
  });

  it('say when a column has no pivot and when the loop stops early', () => {
    const free = gaussTrace(parseGaussMod('A = [[0, 1, 2], [0, 2, 5], [0, 3, 7]]; b = [1, 2, 3]; p = 13'));
    expect(free.frames.some((f) => f.line === 5 && f.caption.startsWith('Column x0: every entry'))).toBe(true);
    const wide = gaussTrace(parseGaussFloat('A = [[1, 2, 3]]; b = [4]'));
    expect(wide.frames.some((f) => f.line === 3 && f.caption.includes('Columns x1, x2 get no pivot'))).toBe(true);
    expect(wide.result!.kind).toBe('infinite');
  });
});

/* ---------- input ---------- */

describe('parsing', () => {
  it('reads A and b, augmented rows, no pivoting, eps and p', () => {
    const a = parseGaussFloat('A = [[2, 1], [1, 3]]; b = [3, 5]');
    const b = parseGaussFloat('2 1 | 3 / 1 3 | 5');
    expect(a).toEqual(b);
    expect(a).toEqual({ mode: 'float', A: [[2, 1], [1, 3]], b: [3, 5], eps: EPS, pivoting: true });
    expect(parseGaussFloat('A = [[1e-8]]; b = [1]; no pivoting; eps 1e-12')).toMatchObject({ A: [[1e-8]], pivoting: false, eps: 1e-12 });
    expect(parseGaussMod('A = [[-1, 2]]; b = [3]; p = 7')).toEqual({ mode: 'mod', A: [[-1n, 2n]], b: [3n], p: 7n });
    expect(formatGaussInput(parseGaussMod('2 1 | 3 / 1 3 | 5; p = 7'))).toBe('A = [[2, 1], [1, 3]]; b = [3, 5]; p = 7');
    expect(formatGaussInput(a)).toBe('A = [[2.0, 1.0], [1.0, 3.0]]; b = [3.0, 5.0]');
  });

  it('refuses what the code would refuse, and what does not fit on screen', () => {
    const bad = [
      ['A = [[1, 2], [3]]; b = [1, 2]', 'Row 1 of A has 1 entries'],
      ['A = [[1, 2], [3, 4]]; b = [1]', 'b has 1 entries'],
      ['A = [[]]; b = [1]', 'at least one row'],
      ['A = [[1, x]]; b = [1]', 'is not a number'],
      ['A = [[1, 2, 3, 4, 5, 6]]; b = [1]', 'Up to 5 equations in 5 unknowns'],
      ['A = [[1]]; b = [1]; eps 0', 'eps must be above 0'],
      ['A = [[1]]; b = [1]; p = 7', '"Modulo a prime" tab'],
      ['A = [[2e6]]; b = [1]', 'from -10^6 to 10^6'],
      ['A = [[1]]', 'right-hand side'],
    ];
    for (const [text, msg] of bad) {
      expect(() => parseGaussFloat(text), text).toThrow(InputError);
      expect(() => parseGaussFloat(text), text).toThrow(msg);
    }
    expect(() => parseGaussMod('A = [[1.5]]; b = [1]; p = 7')).toThrow('not a whole number');
    expect(() => parseGaussMod('A = [[1]]; b = [1]')).toThrow('Give the prime');
    expect(() => parseGaussMod('A = [[1]]; b = [1]; p = 2147483648')).toThrow('2^31 - 1');
  });

  it('formats cells with 4 significant digits', () => {
    expect([0, -0, 3, -11, 0.3333333333333333, 1.6666666666666665, 0.19999999999999987, 1e-8, -1e16, 9.999999800000004e15, 123456.7].map(fmtNum)).toEqual([
      '0',
      '0',
      '3',
      '-11',
      '0.3333',
      '1.667',
      '0.2',
      '1e-8',
      '-1e16',
      '1e16',
      '123500',
    ]);
  });
});
