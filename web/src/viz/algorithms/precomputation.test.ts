import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import {
  exactBinomialMod,
  FACT_CODE,
  factorialTrace,
  LCA_CODE,
  lcaTrace,
  MOD,
  parseLca,
  parseFactorials,
  parsePrefix2D,
  parseSpf,
  powerCount,
  PREFIX2D_CODE,
  prefix2DTrace,
  SPF_CODE,
  spfTrace,
  type FactQuery,
} from './precomputation';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/optimizationTechniques.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function expectFrames<S>(frames: Array<Frame<S>>, codeLines: number) {
  expect(frames.length).toBeGreaterThan(0);
  expect(frames.length).toBeLessThan(2000);
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(10);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(codeLines);
    }
  }
}

const isPrime = (p: number) => {
  if (p < 2) return false;
  for (let d = 2; d * d <= p; d++) if (p % d === 0) return false;
  return true;
};

describe('Factorials (precomputation.py and modular_tricks.py)', () => {
  const toQueries = (qs: Array<[string, number, number]>): FactQuery[] => qs.map(([kind, a, b]) => ({ kind: kind as 'nCr' | 'nPr', a, b }));

  it.each(['factorials', 'modularFactorials'])('%s: every table entry, the power() counts and every answer', (section) => {
    const cases = fixtures[section] as Array<Record<string, unknown>>;
    expect(cases.length).toBeGreaterThanOrEqual(40);
    for (const c of cases) {
      const n = c.n as number;
      if (c.error) {
        // Factorials(-1): the parser refuses it with the same exception named.
        expect(() => parseFactorials(`n ${n}`)).toThrow(/IndexError/);
        continue;
      }
      const run = factorialTrace({ n, mod: c.mod as number, queries: toQueries(c.queries as Array<[string, number, number]>) });
      expect(run.fact, JSON.stringify(c)).toEqual(c.fact);
      expect(run.invFact).toEqual(c.invFact);
      expect(run.power).toEqual(c.power);
      expect(run.answers).toEqual(c.answers);
    }
  });

  it('builds correct tables for a prime modulus above n, checked by definition', () => {
    const rand = rng(7);
    for (let t = 0; t < 150; t++) {
      const n = Math.floor(rand() * 13);
      const primes = [13, 17, 19, 101, 998244353, MOD, 2147483647];
      const mod = primes[Math.floor(rand() * primes.length)];
      const queries: FactQuery[] = Array.from({ length: Math.floor(rand() * 7) }, () => ({
        kind: rand() < 0.6 ? 'nCr' : 'nPr',
        a: Math.floor(rand() * 16) - 2,
        b: Math.floor(rand() * 16) - 2,
      }));
      const run = factorialTrace({ n, mod, queries });
      expectFrames(run.frames, FACT_CODE.length);
      let f = 1n;
      for (let i = 0; i <= n; i++) {
        if (i > 0) f *= BigInt(i);
        expect(run.fact[i]).toBe(Number(f % BigInt(mod)));
        expect(Number((BigInt(run.fact[i]) * BigInt(run.invFact[i])) % BigInt(mod))).toBe(1);
      }
      queries.forEach((q, k) => {
        const got = run.answers[k];
        if (q.b < 0 || q.b > q.a) expect(got).toBe(0);
        else if (q.a > n) expect(got).toEqual(['IndexError', 'list index out of range']);
        else if (q.kind === 'nCr') expect(got).toBe(exactBinomialMod(q.a, q.b, mod));
        else {
          let v = 1n;
          for (let j = 0; j < q.b; j++) v *= BigInt(q.a - j);
          expect(got).toBe(Number(v % BigInt(mod)));
        }
      });
    }
  });

  it('power() matches BigInt modular exponentiation and counts one step per bit', () => {
    const rand = rng(3);
    for (let t = 0; t < 200; t++) {
      const mod = 2 + Math.floor(rand() * 2_000_000_000);
      const base = Math.floor(rand() * mod);
      const exp = Math.floor(rand() * 2_000_000_000);
      const [value, steps, mults] = powerCount(base, exp, mod);
      let want = 1n;
      let b = BigInt(base);
      let e = BigInt(exp);
      while (e > 0n) {
        if (e & 1n) want = (want * b) % BigInt(mod);
        b = (b * b) % BigInt(mod);
        e >>= 1n;
      }
      expect(value).toBe(Number(want));
      expect(steps).toBe(exp === 0 ? 0 : exp.toString(2).length);
      expect(mults).toBe([...exp.toString(2)].filter((d) => d === '1').length);
    }
  });

  it('fills fact downwards, one inverse, inv_fact upwards; a table that reaches the modulus is all zeros', () => {
    const run = factorialTrace(parseFactorials('n 7; mod 5; nCr 4 2'));
    expect(run.fact).toEqual([1, 1, 2, 1, 4, 0, 0, 0]);
    expect(run.invFact).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
    expect(run.answers).toEqual([0]);
    const fermat = run.frames.find((f) => f.line === 2)!;
    expect(fermat.state.inv[7].role).toBe('bad');
    // The answer frame is marked wrong against the exact binomial, C(4, 2) mod 5 = 1.
    expect(run.frames[run.frames.length - 2].state.answers[0].role).toBe('bad');
    const order = run.frames.filter((f) => f.line === 1 || f.line === 4).map((f) => (f.line === 1 ? 'f' : 'v'));
    expect(order.join('')).toBe('fffffffvvvvvvv');
  });

  it('keeps one picture size for the whole run', () => {
    const run = factorialTrace(parseFactorials('n 10; nCr 10 3, nPr 10 3, nCr 5 7, nCr 12 2'));
    const sizes = new Set(run.frames.map((f) => `${f.state.valueChars},${f.state.workChars},${f.state.answerRows}`));
    expect(sizes.size).toBe(1);
  });

  it('parses the size, the modulus and the queries, with friendly errors', () => {
    expect(parseFactorials('n 10; nCr 10 3, nPr(10, 3), C 5 2')).toEqual({
      n: 10,
      mod: MOD,
      queries: [
        { kind: 'nCr', a: 10, b: 3 },
        { kind: 'nPr', a: 10, b: 3 },
        { kind: 'nCr', a: 5, b: 2 },
      ],
    });
    expect(parseFactorials('Factorials(6, 13); nCr 6 2').mod).toBe(13);
    expect(parseFactorials('n 4, mod 7').mod).toBe(7);
    expect(() => parseFactorials('nCr 1 1')).toThrow(InputError);
    expect(() => parseFactorials('n 13')).toThrow(/up to 12/);
    expect(() => parseFactorials('n -1')).toThrow(/IndexError/);
    expect(() => parseFactorials('n 5; mod 1')).toThrow(/2 to/);
    expect(() => parseFactorials('n 5; nCr 5')).toThrow(/n and r/);
    expect(() => parseFactorials('n 5; foo 1 2')).toThrow(/Cannot read/);
  });
});

describe('compute_spf and factorize', () => {
  it('matches the Python loops event by event (golden fixtures)', () => {
    const cases = fixtures.spf as Array<{ n: number; queries: number[]; spf: number[]; events: unknown[]; answers: unknown[] }>;
    expect(cases.length).toBeGreaterThanOrEqual(40);
    for (const c of cases) {
      const run = spfTrace({ n: c.n, queries: c.queries });
      expect(run.spf).toEqual(c.spf);
      expect(run.events).toEqual(c.events);
      expect(run.answers).toEqual(c.answers);
    }
  });

  it('agrees with trial division for every n up to 99', () => {
    for (let n = 0; n <= 99; n++) {
      const queries = [n, Math.floor(n / 2), n + 1].filter((x, k, all) => all.indexOf(x) === k).slice(0, 3);
      const run = spfTrace({ n, queries });
      expectFrames(run.frames, SPF_CODE.length);
      run.spf.forEach((p, x) => {
        if (x < 2) expect(p).toBe(x);
        else {
          let d = 2;
          while (x % d !== 0) d++;
          expect(p).toBe(d);
        }
      });
      queries.forEach((x, k) => {
        const got = run.answers[k];
        if (x <= 1) expect(got).toEqual([]);
        else if (x > n) expect(got).toEqual(['IndexError', 'list index out of range']);
        else {
          const pairs = got as Array<[number, number]>;
          expect(pairs.reduce((s, [p, c]) => s * p ** c, 1)).toBe(x);
          for (let i = 0; i < pairs.length; i++) {
            expect(isPrime(pairs[i][0])).toBe(true);
            if (i > 0) expect(pairs[i][0]).toBeGreaterThan(pairs[i - 1][0]);
          }
        }
      });
    }
  });

  it('draws every number once, and hops only between drawn numbers', () => {
    const run = spfTrace(parseSpf('n 99; factorize 84, 97, 64'));
    for (const f of run.frames) {
      expect(f.state.cells.map((c) => c.x)).toEqual(Array.from({ length: 100 }, (_, x) => x));
      for (const h of f.state.hops) {
        expect(h.from).toBeLessThanOrEqual(99);
        expect(h.to).toBeGreaterThanOrEqual(1);
      }
    }
    const last = run.frames[run.frames.length - 1].state;
    expect(last.hops.map((h) => [h.from, h.to])).toEqual([
      [64, 32],
      [32, 16],
      [16, 8],
      [8, 4],
      [4, 2],
      [2, 1],
    ]);
  });

  it('parses the size and the numbers, with friendly errors', () => {
    expect(parseSpf('n 60; factorize 60, 45, 97')).toEqual({ n: 60, queries: [60, 45, 97] });
    expect(parseSpf('spf 30; f 12 29; 16')).toEqual({ n: 30, queries: [12, 29, 16] });
    expect(() => parseSpf('factorize 12')).toThrow(/table size/);
    expect(() => parseSpf('n 100')).toThrow(/0 to 99/);
    expect(() => parseSpf('n 10; factorize 1, 2, 3, 4, 5, 6, 7')).toThrow(/At most 6/);
    expect(() => parseSpf('n 10; hello')).toThrow(/Cannot read/);
  });
});

describe('PrefixSum2D', () => {
  it('matches the Python table and every rect_sum (golden fixtures)', () => {
    const cases = fixtures.prefix2d as Array<{ grid: number[][]; queries: Array<[number, number, number, number]>; prefix: number[][]; answers: unknown[] }>;
    expect(cases.length).toBeGreaterThanOrEqual(40);
    for (const c of cases) {
      const run = prefix2DTrace({ grid: c.grid, queries: c.queries });
      expect(run.prefix).toEqual(c.prefix);
      expect(run.answers).toEqual(c.answers);
    }
  });

  it('answers every rectangle like a direct sum (random grids)', () => {
    const rand = rng(11);
    for (let t = 0; t < 150; t++) {
      const n = 1 + Math.floor(rand() * 6);
      const m = 1 + Math.floor(rand() * 6);
      const grid = Array.from({ length: n }, () => Array.from({ length: m }, () => Math.floor(rand() * 199) - 99));
      const queries: Array<[number, number, number, number]> = [];
      for (let q = 0; q < 4; q++) {
        const [r1, r2] = [Math.floor(rand() * (n + 1)), Math.floor(rand() * (n + 1))].sort((a, b) => a - b);
        const [c1, c2] = [Math.floor(rand() * (m + 1)), Math.floor(rand() * (m + 1))].sort((a, b) => a - b);
        queries.push([r1, c1, r2, c2]);
      }
      const run = prefix2DTrace({ grid, queries });
      expectFrames(run.frames, PREFIX2D_CODE.length);
      for (let i = 0; i <= n; i++) {
        for (let j = 0; j <= m; j++) {
          let s = 0;
          for (let r = 0; r < i; r++) for (let c = 0; c < j; c++) s += grid[r][c];
          expect(run.prefix[i][j]).toBe(s);
        }
      }
      queries.forEach(([r1, c1, r2, c2], k) => {
        if (r2 >= n || c2 >= m) expect(run.answers[k]).toEqual(['IndexError', 'list index out of range']);
        else {
          let s = 0;
          for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) s += grid[r][c];
          expect(run.answers[k]).toBe(s);
        }
      });
      for (const f of run.frames) {
        for (const o of f.state.overlays) {
          expect(o.r1).toBeLessThanOrEqual(o.r2);
          expect(o.c1).toBeLessThanOrEqual(o.c2);
          expect(o.r2).toBeLessThan(n);
          expect(o.c2).toBeLessThan(m);
        }
        expect(new Set(f.state.overlays.map((o) => o.id)).size).toBe(f.state.overlays.length);
      }
    }
  });

  it('shows the four corners of a query with their signs', () => {
    const run = prefix2DTrace(parsePrefix2D('1 2 3 / 4 5 6 / 7 8 9; rect 1 1 2 2'));
    const corners = run.frames.find((f) => f.caption.startsWith('+ P[1][1]'))!;
    const signs = corners.state.prefix.flatMap((row, i) => row.map((c, j) => (c.sign ? `${i}${j}${c.sign}` : ''))).filter(Boolean);
    expect(signs.sort()).toEqual(['11+', '13-', '31-', '33+']);
    expect(corners.state.overlays.map((o) => o.id)).toEqual(['region', 'top', 'left', 'corner', 'target']);
    expect(run.answers).toEqual([28]);
  });

  it('parses the grid and the queries, with friendly errors', () => {
    expect(parsePrefix2D('1 2 / 3 4; rect 0 0 1 1, sum(0, 1, 1, 1)')).toEqual({
      grid: [
        [1, 2],
        [3, 4],
      ],
      queries: [
        [0, 0, 1, 1],
        [0, 1, 1, 1],
      ],
    });
    expect(() => parsePrefix2D('1 2 / 3')).toThrow(/Row 1 has 1/);
    expect(() => parsePrefix2D('1 2 / 3 4; rect 1 1 0 0')).toThrow(/top-left/);
    expect(() => parsePrefix2D('1 2 / 3 4; rect -1 0 0 0')).toThrow(/negative index wraps/);
    expect(() => parsePrefix2D('1 2 3 4 5 6 7')).toThrow(/At most 6 columns/);
    expect(() => parsePrefix2D(';rect 0 0 0 0')).toThrow(/Start with the grid/);
    expect(() => parsePrefix2D('1 2; rect 0 0 0')).toThrow(/four numbers/);
  });
});

describe('LCA with binary lifting', () => {
  it('matches the DFS, the jump table and every lifting step of the Python class (golden fixtures)', () => {
    const cases = fixtures.lca as Array<Record<string, unknown>>;
    expect(cases.length).toBeGreaterThanOrEqual(40);
    for (const c of cases) {
      const run = lcaTrace({ n: c.n as number, edges: c.edges as Array<[number, number]>, root: c.root as number, queries: c.queries as Array<[number, number]> });
      const where = JSON.stringify([c.edges, c.root]);
      expect(run.log, where).toBe(c.log);
      expect(run.pops, where).toEqual(c.pops);
      expect(run.depth, where).toEqual(c.depth);
      expect(run.parent, where).toEqual(c.parent);
      expect(run.answers, where).toEqual(c.answers);
    }
  });

  it('agrees with walking up one parent at a time on random trees', () => {
    const rand = rng(21);
    for (let t = 0; t < 150; t++) {
      const n = 1 + Math.floor(rand() * 12);
      const edges: Array<[number, number]> = [];
      for (let v = 1; v < n; v++) edges.push([Math.floor(rand() * v), v]);
      const root = Math.floor(rand() * n);
      const queries: Array<[number, number]> = Array.from({ length: 4 }, () => [Math.floor(rand() * n), Math.floor(rand() * n)]);
      const run = lcaTrace({ n, edges, root, queries });
      expectFrames(run.frames, LCA_CODE.length);
      // Parents by a plain BFS from the root.
      const adj: number[][] = Array.from({ length: n }, () => []);
      for (const [a, b] of edges) adj[a].push(b), adj[b].push(a);
      const par = Array<number>(n).fill(-1);
      const dep = Array<number>(n).fill(0);
      const order = [root];
      const seen = new Set([root]);
      for (let k = 0; k < order.length; k++) {
        for (const w of adj[order[k]]) {
          if (seen.has(w)) continue;
          seen.add(w);
          par[w] = order[k];
          dep[w] = dep[order[k]] + 1;
          order.push(w);
        }
      }
      expect(run.depth).toEqual(dep);
      // parent[i][j] is the 2^j-th ancestor of i, or -1 when the tree is not that deep.
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < run.log; j++) {
          let a = i;
          for (let s = 0; s < 2 ** j && a !== -1; s++) a = par[a];
          expect(run.parent[i][j]).toBe(a);
        }
      }
      queries.forEach(([u, v], k) => {
        const up = new Set<number>();
        for (let w = u; w !== -1; w = par[w]) up.add(w);
        let x = v;
        while (!up.has(x)) x = par[x];
        expect(run.answers[k][0]).toBe(x);
      });
      for (const f of run.frames) {
        for (const p of f.state.pills) expect(f.state.visited[p.at]).toBe(true);
        for (const j of f.state.jumps) if (j.to >= 0) expect(f.state.depth[j.to]).not.toBeNull();
      }
    }
  });

  it('parses edges, a root and queries, with friendly errors', () => {
    expect(parseLca('edges 0-1 0-2 1-3; lca 3 2, root 0')).toEqual({
      n: 4,
      edges: [
        [0, 1],
        [0, 2],
        [1, 3],
      ],
      root: 0,
      queries: [[3, 2]],
    });
    expect(parseLca('0-1, 1-2; root 2; query(0, 1)').root).toBe(2);
    expect(parseLca('n 1; lca 0 0')).toEqual({ n: 1, edges: [], root: 0, queries: [[0, 0]] });
    expect(() => parseLca('edges 0-1 1-2 2-0')).toThrow(/2 edges/);
    expect(() => parseLca('edges 0-1 1-2 2-0 3-4')).toThrow(/do not connect/);
    expect(() => parseLca('edges 0-0')).toThrow(/loop/);
    expect(() => parseLca('edges 0-13')).toThrow(/Up to 12/);
    expect(() => parseLca('edges 0-1; lca -1 0')).toThrow(/wraps/);
    expect(() => parseLca('edges 0-1; root 5')).toThrow(/root/);
    expect(() => parseLca('edges 0-1; hello')).toThrow(/Cannot read/);
  });
});
