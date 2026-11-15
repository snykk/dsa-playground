import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import {
  digest,
  matrixMultiplyNaive,
  parseStrassen,
  PYTHON_CUTOFF,
  schoolbook,
  stabilizeStrassen,
  STRASSEN_CODE,
  strassenTrace,
  type Mat,
  type StrassenInput,
  type StrassenState,
} from './strassen';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/divideAndRandomized.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const randMat = (rand: () => number, r: number, c: number): Mat => Array.from({ length: r }, () => Array.from({ length: c }, () => Math.floor(rand() * 19) - 9));

/** Captions, line indices, unique panel keys, rectangular panels, a stack with one open call on top. */
function expectWellFormed(frames: Array<Frame<StrassenState>>) {
  const problems: string[] = [];
  for (const f of frames) {
    if (f.caption.length <= 20) problems.push(`short caption: ${f.caption}`);
    if (f.line !== undefined && (f.line < 0 || f.line >= STRASSEN_CODE.length)) problems.push(`line ${f.line}`);
    const panels = [...f.state.call, ...f.state.factors, ...f.state.products].filter((p) => p !== null);
    const keys = panels.map((p) => p!.key);
    if (new Set(keys).size !== keys.length) problems.push(`duplicate keys ${keys.join(' ')}: ${f.caption}`);
    for (const p of panels) {
      const rows = p!.cells.length;
      const cols = rows ? p!.cells[0].length : 0;
      if (!rows || !cols || p!.cells.some((r) => r.length !== cols)) problems.push(`ragged ${p!.key}`);
      for (const key of Object.keys(p!.roles ?? {})) {
        const [r, c] = key.split(',').map(Number);
        if (r >= rows || c >= cols) problems.push(`role outside ${p!.key}: ${key}`);
      }
    }
    if (f.state.products.length !== 0 && f.state.products.length !== 7) problems.push('products');
    if (f.state.stack.length && f.state.stack[f.state.stack.length - 1].role !== 'active') problems.push('stack top');
  }
  expect(problems).toEqual([]);
}

describe('strassenTrace agrees with the schoolbook product', () => {
  it('on random square and rectangular inputs, for every cutoff', () => {
    const rand = rng(17);
    for (let t = 0; t < 160; t++) {
      const general = t % 4 === 3;
      const n = 1 + Math.floor(rand() * 8);
      const [m, inner, p] = general ? [1 + Math.floor(rand() * 6), 1 + Math.floor(rand() * 6), 1 + Math.floor(rand() * 6)] : [n, n, n];
      const cutoff = [1, 2, 3, 4, PYTHON_CUTOFF][Math.floor(rand() * 5)];
      // Cutoff 1 on a side of 5 or more makes about 1500 frames: keep those for the size test below.
      const big = Math.max(m, inner, p) >= 5;
      const input: StrassenInput = { A: randMat(rand, m, inner), B: randMat(rand, inner, p), cutoff: big && cutoff === 1 ? 2 : cutoff, general };
      const run = strassenTrace(input);
      expect(run.error).toBeNull();
      expect(run.result).toEqual(schoolbook(input.A, input.B));
      expectWellFormed(run.frames);
      expect(run.frames.length).toBeLessThan(2000);
      // Invariant: every C panel that is complete equals the schoolbook product of its A and B.
      for (const f of run.frames) {
        const [a, b, c] = f.state.call;
        if (!a || !b || !c || a.keep || c.cells.some((r) => r.some((v) => v === null))) continue;
        expect(c.cells, f.caption).toEqual(schoolbook(a.cells as Mat, b.cells as Mat));
      }
      const last = run.frames[run.frames.length - 1];
      expect(last.state.call[2]!.cells).toEqual(run.result);
      expect(last.state.call[2]!.role).toBe('good');
    }
  });

  it('every returned product Pi equals the product of its two factors', () => {
    const run = strassenTrace({ A: randMat(rng(3), 8, 8), B: randMat(rng(4), 8, 8), cutoff: 2, general: false });
    let checked = 0;
    for (const f of run.frames) {
      const [l, r, prod] = f.state.factors;
      if (l && r && prod) {
        expect(prod.cells).toEqual(matrixMultiplyNaive(l.cells as Mat, r.cells as Mat));
        checked++;
      }
    }
    expect(checked).toBe(7 + 49);
  });

  it('makes 7 products per split: 7^k leaf multiplications at cutoff 1', () => {
    const run = strassenTrace({ A: randMat(rng(5), 4, 4), B: randMat(rng(6), 4, 4), cutoff: 1, general: false });
    expect(run.calls).toBe(1 + 7 + 49);
    expect(run.multiplications).toBe(49); // against 64 for the schoolbook loop
    const r8 = strassenTrace({ A: randMat(rng(5), 8, 8), B: randMat(rng(6), 8, 8), cutoff: 2, general: false });
    expect(r8.multiplications).toBe(49 * 8); // 49 naive 2 x 2 products of 8 multiplications each
  });
});

describe('strassenTrace matches the Python code (golden fixtures)', () => {
  it('the calls, pads, splits, combines and every returned matrix, in order', () => {
    const list = fixtures.strassen as Array<{ A: Mat; B: Mat; cutoff: number; general: boolean; events: unknown[]; result: Mat | null; error: string | null }>;
    expect(list.length).toBeGreaterThanOrEqual(60);
    for (const c of list) {
      const run = strassenTrace({ A: c.A, B: c.B, cutoff: c.cutoff, general: c.general }, false);
      expect(run.events, JSON.stringify([c.A, c.B, c.cutoff, c.general])).toEqual(c.events);
      expect(run.result).toEqual(c.result);
      expect(run.error).toEqual(c.error);
      // Drawing does not change what is computed.
      expect(strassenTrace({ A: c.A, B: c.B, cutoff: c.cutoff, general: c.general }).events).toEqual(c.events);
    }
  });

  it("at the code's own cutoff of 64: 65 x 65, 128 x 128 and 130 x 130 (digests)", () => {
    const formula = (n: number, seed: number): Mat => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => ((i * 7 + j * 13 + seed) % 19) - 9));
    for (const c of fixtures.strassenBig as Array<{ n: number; seedA: number; seedB: number; events: unknown[] }>) {
      const A = formula(c.n, c.seedA);
      const B = formula(c.n, c.seedB);
      const run = strassenTrace({ A, B, cutoff: PYTHON_CUTOFF, general: false }, false);
      expect(run.events).toEqual(c.events);
      expect(digest(run.result!)).toEqual(digest(matrixMultiplyNaive(A, B)));
    }
    // 128 splits once into seven naive 64 x 64 products.
    const big = (fixtures.strassenBig as Array<{ n: number; events: unknown[][] }>).find((c) => c.n === 128)!;
    expect(big.events.filter((e) => e[0] === 'naive')).toEqual(Array(7).fill(['naive', 64]));
  });
});

describe('strassenTrace scenarios', () => {
  it('the article example: P1..P7 = -2, 24, 35, 8, 65, -30, -22 and C = [[19, 22], [43, 50]]', () => {
    const run = strassenTrace(parseStrassen('A = [[1, 2], [3, 4]]; B = [[5, 6], [7, 8]]; cutoff 1'));
    const rets = run.events.filter((e) => e[0] === 'ret' && e[1] === 1).map((e) => (e[2] as Mat)[0][0]);
    expect(rets).toEqual([-2, 24, 35, 8, 65, -30, -22]);
    expect(run.result).toEqual([
      [19, 22],
      [43, 50],
    ]);
    const c11 = run.frames.find((f) => f.caption.startsWith('C11 = P5 + P4 - P2 + P6'))!;
    expect(c11.caption).toContain('65 + 8 - 24 + (-30) = 19');
    expect(c11.line).toBe(15);
  });

  it('with the default cutoff of 64, a small product is the naive loop: no split at all', () => {
    const run = strassenTrace(parseStrassen('A = 1 2 / 3 4; B = 5 6 / 7 8'));
    expect(run.events).toEqual([['call', 2], ['naive', 2], ['ret', 2, [[19, 22], [43, 50]]]]);
    expect(run.frames.filter((f) => f.line === 3).length).toBe(4); // one frame per entry of C
    expect(run.frames[1].caption).toContain('64');
  });

  it('pads an odd size by one zero row and column, and a general product to a power of two', () => {
    const odd = strassenTrace(parseStrassen('A = 1 2 3 / 4 5 6 / 7 8 9; B = 1 0 0 / 0 1 0 / 0 0 1; cutoff 1'));
    expect(odd.events.slice(0, 4)).toEqual([['call', 3], ['pad', 3, 3, 4], ['pad', 3, 3, 4], ['call', 4]]);
    const pad = odd.frames.find((f) => f.line === 5)!;
    expect(pad.state.call[0]!.keep).toEqual({ rows: 3, cols: 3 });
    expect(pad.state.call[0]!.cells[3]).toEqual([0, 0, 0, 0]);
    const five = strassenTrace(parseStrassen('A = 1 1 1 1 1 / 1 1 1 1 1 / 1 1 1 1 1 / 1 1 1 1 1 / 1 1 1 1 1; B = 1 1 1 1 1 / 1 1 1 1 1 / 1 1 1 1 1 / 1 1 1 1 1 / 1 1 1 1 1; cutoff 2; general'));
    expect(five.events.slice(0, 4)).toEqual([['general', 5, 5, 5, 5], ['pad', 5, 5, 8], ['pad', 5, 5, 8], ['call', 8]]);
    expect(five.result).toEqual(Array(5).fill([5, 5, 5, 5, 5]));
  });

  it('raises ValueError when the inner sizes differ', () => {
    const run = strassenTrace(parseStrassen('A = 1 2 3 / 4 5 6; B = 1 2 / 3 4'));
    expect(run.error).toBe('ValueError: Matrix dimensions incompatible for multiplication');
    expect(run.result).toBeNull();
    const last = run.frames[run.frames.length - 1];
    expect(last.line).toBe(22);
    expect(last.state.call[0]!.role).toBe('bad');
  });

  it('a cutoff below 1 raises ValueError in both functions, before anything is multiplied', () => {
    const square = strassenTrace(parseStrassen('A = 1 2 / 3 4; B = 5 6 / 7 8; cutoff 0'));
    expect([square.result, square.error]).toEqual([null, 'ValueError: cutoff must be at least 1']);
    expect(square.events).toEqual([['call', 2], ['error', 'ValueError: cutoff must be at least 1']]);
    const last = square.frames[square.frames.length - 1];
    expect([last.line, last.state.call[0]!.role]).toEqual([1, 'bad']);
    const general = strassenTrace(parseStrassen('A = 1 2 3; B = 1 / 2 / 3; cutoff -1'));
    expect(general.events).toEqual([['general', 1, 3, 3, 1], ['error', 'ValueError: cutoff must be at least 1']]);
    expect(general.frames[general.frames.length - 1].line).toBe(21);
    // A cutoff above every size is just the naive loop, as in the code.
    expect(strassenTrace(parseStrassen('A = 1 2 / 3 4; B = 5 6 / 7 8; cutoff 500')).events).toEqual([['call', 2], ['naive', 2], ['ret', 2, [[19, 22], [43, 50]]]]);
  });

  it('the factors of a product glide: the child call draws them with the same keys', () => {
    const frames = strassenTrace(parseStrassen('A = 1 2 / 3 4; B = 5 6 / 7 8; cutoff 1')).frames;
    const form = frames.findIndex((f) => f.state.factorsLabel?.startsWith('P5') && f.state.factors[2] === null);
    const child = frames[form + 1];
    expect(child.state.call[0]!.key).toBe(frames[form].state.factors[0]!.key);
    const back = frames[form + 2];
    expect(back.state.factors[2]!.key).toBe(child.state.call[2]!.key);
  });

  it('frames are snapshots: C fills in quadrant by quadrant', () => {
    const frames = strassenTrace(parseStrassen('A = [[1, 2], [3, 4]]; B = [[5, 6], [7, 8]]; cutoff 1')).frames;
    const finished = (f: (typeof frames)[number]) => Object.values(f.state.call[2]?.roles ?? {}).filter((r) => r === 'done').length;
    const at = (start: string) => frames.find((f) => f.caption.startsWith(start))!;
    expect([at('n = 2 is above'), at('C11 ='), at('C12 ='), at('C21 ='), at('C22 =')].map(finished)).toEqual([0, 0, 1, 2, 3]);
    expect(at('C11 =').state.call[2]!.cells).toEqual([
      [19, null],
      [null, null],
    ]);
  });

  it('stabilizes one picture size per run', () => {
    const frames = stabilizeStrassen(strassenTrace(parseStrassen('A = 9 9 9 / 9 9 9 / 9 9 9; B = -9 -9 -9 / -9 -9 -9 / -9 -9 -9; cutoff 1')).frames);
    const layouts = new Set(frames.map((f) => JSON.stringify(f.state.layout)));
    expect(layouts.size).toBe(1);
    expect(frames[0].state.layout!.side).toBe(4); // the padded size
  });

  it('stays under 2000 frames on the largest inputs the parser accepts', () => {
    const eight = Array(8).fill('9 9 9 9 9 9 9 9').join(' / ');
    expect(strassenTrace(parseStrassen(`A = ${eight}; B = ${eight}; cutoff 1`)).frames.length).toBeLessThan(2000);
    // 5 pads to 6, whose 3 x 3 halves pad to 4: three levels of seven products, the most steps.
    const five = Array(5).fill('9 9 9 9 9').join(' / ');
    const run = strassenTrace(parseStrassen(`A = ${five}; B = ${five}; cutoff 1`));
    expect(run.frames.length).toBeLessThan(2000);
    expectWellFormed(run.frames);
    expect(run.result).toEqual(Array(5).fill(Array(5).fill(405)));
  });
});

describe('parseStrassen', () => {
  it('reads both matrix forms, the cutoff and general', () => {
    const a = parseStrassen('A = [[1, 2], [3, 4]]; B = [[5, 6], [7, 8]]');
    expect(a).toEqual({ A: [[1, 2], [3, 4]], B: [[5, 6], [7, 8]], cutoff: 64, general: false });
    const b = parseStrassen('a: 1 2 / 3 4\nb: 5 6 / 7 8\ncutoff 2\ngeneral');
    expect(b).toEqual({ A: [[1, 2], [3, 4]], B: [[5, 6], [7, 8]], cutoff: 2, general: true });
    expect(parseStrassen('A = [[-3]]; B = [[4]]').A).toEqual([[-3]]);
  });

  it('gives friendly errors', () => {
    expect(() => parseStrassen('')).toThrow(InputError);
    expect(() => parseStrassen('A = [[1, 2], [3, 4]]')).toThrow(/both matrices/);
    expect(() => parseStrassen('A = 1 2 / 3; B = 1')).toThrow(/same length/);
    expect(() => parseStrassen('A = 10; B = 1')).toThrow(/-9 to 9/);
    expect(() => parseStrassen('A = 1 x; B = 1')).toThrow(/whole number/);
    expect(() => parseStrassen('A = 1; B = 1; cutoff -10')).toThrow(/-9 to 999/);
    expect(() => parseStrassen('A = 1; B = 1; cutoff 1000')).toThrow(/-9 to 999/);
    expect(() => parseStrassen('A = 1; B = 1; hello')).toThrow(/Cannot read/);
    const nine = Array(9).fill('1 1 1 1 1 1 1 1 1').join(' / ');
    expect(() => parseStrassen(`A = ${nine}; B = ${nine}`)).toThrow(/up to 8/);
  });
});
