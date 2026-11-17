import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import type { MaskRowsState } from '../renderers/MaskRows';
import { MASK_CODE, maskTrace, parseMasks, parseSos, popcount, SOS_CODE, sosTrace } from './bitmasking';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/optimizationTechniques.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** Every frame well-formed; problems are collected in plain JS so a long run stays fast. */
function expectMaskFrames(frames: Array<Frame<MaskRowsState>>) {
  expect(frames.length).toBeLessThan(2000);
  const rows = frames[0].state.rows.length;
  const problems: string[] = [];
  for (const f of frames) {
    if (f.caption.length <= 10) problems.push(`short caption: ${f.caption}`);
    if (f.line === undefined || f.line < 0 || f.line >= MASK_CODE.length) problems.push(`line ${f.line}`);
    if (f.state.rows.length !== rows) problems.push('row count changed');
    const ids = f.state.bits.map((b) => b.id);
    if (new Set(ids).size !== ids.length) problems.push('duplicate bit ids');
    for (const b of f.state.bits) {
      if (b.pos >= f.state.width || b.pos < -2) problems.push(`bit ${b.id} at ${b.pos}`);
      if (f.state.rows[b.row].empty) problems.push(`bit ${b.id} in an empty row`);
    }
    if (f.state.found.items.length > f.state.foundCap) problems.push('more masks than the cap');
    if (f.state.foundCap !== frames[0].state.foundCap) problems.push('cap changed');
  }
  expect(problems).toEqual([]);
}

describe('enumerate_subsets and subsets_of_size_k', () => {
  it('match the Python generators (golden fixtures)', () => {
    for (const c of fixtures.submasks as Array<{ mask: number; subs: number[] }>) {
      if (popcount(c.mask) > 6) continue; // more submasks than the picture allows; checked by definition below
      expect(maskTrace({ mode: 'submasks', mask: c.mask }).masks).toEqual(c.subs);
    }
    for (const c of fixtures.ksubsets as Array<{ n: number; k: number; masks: number[]; steps: unknown[] }>) {
      const run = maskTrace({ mode: 'ksubsets', n: c.n, k: c.k });
      expect(run.masks, `${c.n} ${c.k}`).toEqual(c.masks);
      expect(run.steps).toEqual(c.steps);
    }
  });

  it('yields every submask once, largest first, for every mask the parser accepts', () => {
    for (let mask = 0; mask < 256; mask++) {
      if (popcount(mask) > 6) continue;
      const run = maskTrace({ mode: 'submasks', mask });
      const want: number[] = [];
      for (let s = mask; s >= 0; s--) if ((s & mask) === s) want.push(s);
      expect(run.masks).toEqual(want);
      expectMaskFrames(run.frames);
      const last = run.frames[run.frames.length - 1].state;
      expect(last.found.items.map((i) => parseInt(i.text, 2))).toEqual(want);
    }
  });

  it("Gosper's hack yields exactly the masks with k bits below 2^n, in increasing order", () => {
    for (let n = 0; n <= 8; n++) {
      for (let k = 0; k <= 9; k++) {
        const run = maskTrace({ mode: 'ksubsets', n, k });
        const want = k === 0 ? [0] : Array.from({ length: 1 << n }, (_, m) => m).filter((m) => popcount(m) === k);
        expect(run.masks, `${n} ${k}`).toEqual(want);
        expectMaskFrames(run.frames);
      }
    }
  });

  it('a shifted row keeps its bit ids, so the bits glide right', () => {
    const run = maskTrace(parseMasks('ksubsets 4 2'));
    const before = run.frames.findIndex((f) => f.caption.startsWith('>> 2'));
    const a = run.frames[before].state.bits.filter((b) => b.row === 4);
    const b = run.frames[before + 1].state.bits.filter((x) => x.row === 4);
    for (const bit of a) {
      const moved = b.find((x) => x.id === bit.id);
      expect(moved?.pos).toBe(bit.pos - 2);
    }
  });

  it('parses both commands, with friendly errors', () => {
    expect(parseMasks('submasks 0b1011')).toEqual({ mode: 'submasks', mask: 11 });
    expect(parseMasks('enumerate_subsets(11)')).toEqual({ mode: 'submasks', mask: 11 });
    expect(parseMasks('ksubsets 4 2')).toEqual({ mode: 'ksubsets', n: 4, k: 2 });
    expect(parseMasks('k-subsets 5, 3')).toEqual({ mode: 'ksubsets', n: 5, k: 3 });
    expect(parseMasks('subsets_of_size_k(6, 0)')).toEqual({ mode: 'ksubsets', n: 6, k: 0 });
    expect(() => parseMasks('submasks 256')).toThrow(/8 bits/);
    expect(() => parseMasks('submasks 0b1111111')).toThrow(/up to 6 set bits/);
    expect(() => parseMasks('ksubsets 9 2')).toThrow(/up to 8/);
    expect(() => parseMasks('ksubsets 4')).toThrow(/n and k/);
    expect(() => parseMasks('submasks x')).toThrow(InputError);
    expect(() => parseMasks('hello')).toThrow(/Cannot read/);
  });
});

describe('sos_dp', () => {
  it('matches every addition of the Python loop (golden fixtures)', () => {
    const cases = fixtures.sos as Array<{ a: number[]; adds: unknown[]; dp: number[] }>;
    expect(cases.length).toBeGreaterThanOrEqual(40);
    for (const c of cases) {
      const run = sosTrace({ a: c.a });
      expect(run.adds).toEqual(c.adds);
      expect(run.dp).toEqual(c.dp);
    }
  });

  it('sums every submask below len(a), for random lengths including non-powers of two', () => {
    const rand = rng(9);
    // The checks run in plain code and each run asserts once: an expect per edge and frame
    // made this test take several seconds.
    for (let t = 0; t < 200; t++) {
      const a = Array.from({ length: Math.floor(rand() * 17) }, () => Math.floor(rand() * 199) - 99);
      const run = sosTrace({ a });
      const problems: string[] = [];
      run.dp.forEach((v, m) => {
        let s = 0;
        for (let sub = 0; sub < a.length; sub++) if ((sub & m) === sub) s += a[sub];
        if (v !== s) problems.push(`dp[${m}] = ${v}, expected ${s}`);
      });
      for (const f of run.frames) {
        if (f.caption.length <= 10) problems.push(`caption too short: "${f.caption}"`);
        if (!(f.line! < SOS_CODE.length)) problems.push(`line ${f.line} out of range: ${f.caption}`);
        const masks = new Set(f.state.nodes.map((n) => n.mask));
        for (const e of f.state.edges) {
          if (!(masks.has(e.from) && masks.has(e.to))) problems.push(`edge ${e.from}-${e.to} to a missing node: ${f.caption}`);
          if ((e.from ^ e.to) !== 1 << e.bit) problems.push(`edge ${e.from}-${e.to} does not differ in bit ${e.bit}: ${f.caption}`);
        }
        if (f.state.edges.filter((e) => e.role === 'active').length > 1) problems.push(`more than one active edge: ${f.caption}`);
        // SubsetLattice sizes its header for 46 characters (WORK_CHARS) beside the lattice.
        for (const w of f.state.work) if (w.text.length > 46) problems.push(`work line over 46 characters: "${w.text}"`);
      }
      expect(problems, `a = [${a.join(', ')}]`).toEqual([]);
    }
  });

  it('parses a list of numbers, including the empty list', () => {
    expect(parseSos('1 2 3 4')).toEqual({ a: [1, 2, 3, 4] });
    expect(parseSos('a = [1, -2, 3]')).toEqual({ a: [1, -2, 3] });
    expect(parseSos('[]')).toEqual({ a: [] });
    expect(() => parseSos(Array.from({ length: 17 }, () => '1').join(' '))).toThrow(/Up to 16/);
    expect(() => parseSos('1 x')).toThrow(/not a whole number/);
    expect(() => parseSos('1 500')).toThrow(/-99 to 99/);
  });
});
