import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import {
  GAME_GRAPH_CODE,
  gameGraphTrace,
  GRUNDY_CODE,
  grundyTrace,
  NIM_CODE,
  nimTrace,
  parseGameGraph,
  parseGrundy,
  parseNim,
  type GameGraphState,
  type Outcome,
} from './gameTheory';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/mathAndProblemTypes.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function expectFrames<S>(frames: Array<Frame<S>>, lines: number) {
  expect(frames.length).toBeGreaterThan(0);
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(10);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(lines);
    }
  }
}

/** Brute force: does the player to move win Nim from these piles? (game-tree search, no theory) */
const nimMemo = new Map<string, boolean>();
function bruteNim(piles: number[]): boolean {
  const key = [...piles].sort((a, b) => a - b).join(',');
  if (nimMemo.has(key)) return nimMemo.get(key)!;
  let win = false;
  for (let i = 0; i < piles.length && !win; i++) {
    for (let t = 1; t <= piles[i] && !win; t++) {
      const next = [...piles];
      next[i] -= t;
      if (!bruteNim(next)) win = true;
    }
  }
  nimMemo.set(key, win);
  return win;
}

/** Brute force for a sum of subtraction games: the player to move wins from `state`? */
function bruteSum(state: number[], moves: number[], memo = new Map<string, boolean>()): boolean {
  const key = state.join(',');
  if (memo.has(key)) return memo.get(key)!;
  let win = false;
  for (let i = 0; i < state.length && !win; i++) {
    for (const m of moves) {
      if (state[i] >= m) {
        const next = [...state];
        next[i] -= m;
        if (!bruteSum(next, moves, memo)) {
          win = true;
          break;
        }
      }
    }
  }
  memo.set(key, win);
  return win;
}

function forEachPiles(count: number, max: number, fn: (p: number[]) => void) {
  const p = Array(count).fill(0);
  for (;;) {
    fn([...p]);
    let i = 0;
    while (i < count) {
      p[i] += 1;
      if (p[i] <= max) break;
      p[i] = 0;
      i += 1;
    }
    if (i === count) return;
  }
}

describe('Nim', () => {
  it('agrees with a game-tree search, and the winning move leaves a lost position', () => {
    for (let count = 1; count <= 3; count++) {
      forEachPiles(count, 5, (piles) => {
        const run = nimTrace(piles);
        expectFrames(run.frames, NIM_CODE.length);
        expect(run.winner, piles.join(' ')).toBe(bruteNim(piles));
        if (run.winner) {
          const [i, take] = run.move;
          expect(take).toBeGreaterThan(0);
          const next = [...piles];
          next[i] -= take;
          expect(next[i]).toBeGreaterThanOrEqual(0);
          expect(bruteNim(next)).toBe(false);
          expect(run.frames[run.frames.length - 1].state.xor.value).toBe(0);
        } else {
          expect(run.move).toEqual([-1, -1]);
        }
      });
    }
  });

  it('takes 2 from pile 0 of [3, 4, 5], drawing the taken stones hollow', () => {
    const run = nimTrace(parseNim('3 4 5'));
    expect(run.move).toEqual([0, 2]);
    const take = run.frames.find((f) => f.line === 11)!.state.rows[0];
    expect([take.size, take.removed, take.role]).toEqual([1, 2, 'good']);
  });

  it('matches the Python functions (golden fixtures)', () => {
    const list = fixtures.nim as Array<{ piles: number[]; winner: boolean; move: [number, number] }>;
    expect(list.length).toBeGreaterThanOrEqual(40);
    for (const c of list) {
      const run = nimTrace(c.piles);
      expect(run.winner).toBe(c.winner);
      expect(run.move).toEqual(c.move);
    }
  });
});

describe('Sprague-Grundy', () => {
  it('g(n) > 0 exactly when the player to move wins, and the XOR of a sum decides the sum', () => {
    const rand = rng(61);
    for (let t = 0; t < 120; t++) {
      const moves = [...new Set(Array.from({ length: 1 + Math.floor(rand() * 3) }, () => 1 + Math.floor(rand() * 6)))];
      const n = Math.floor(rand() * 25);
      const piles = Array.from({ length: Math.floor(rand() * 3) }, () => Math.floor(rand() * (n + 1)));
      const run = grundyTrace({ n, moves, piles });
      expectFrames(run.frames, GRUNDY_CODE.length);
      for (let i = 0; i <= n; i++) expect(run.table[i] > 0, `${moves} ${i}`).toBe(bruteSum([i], moves));
      // mex: the value is missing from the reachable set and everything below it is present
      run.reachable.forEach((set, k) => {
        const g = run.table[k + 1];
        expect(set.includes(g)).toBe(false);
        for (let v = 0; v < g; v++) expect(set.includes(v)).toBe(true);
      });
      if (piles.length) expect(run.combined !== 0, `${moves} ${piles}`).toBe(bruteSum(piles, moves));
      else expect(run.combined).toBeNull();
    }
  });

  it('subtraction_grundy(12, [1, 3, 4]) as in the article, and piles 5 and 6 XOR to 1', () => {
    const run = grundyTrace(parseGrundy('n 12; moves 1 3 4; piles 5 6'));
    expect(run.table).toEqual([0, 1, 0, 1, 2, 3, 2, 0, 1, 0, 1, 2, 3]);
    expect(run.reachable[5]).toEqual([0, 1, 3]);
    expect(run.combined).toBe(1);
    const mexFrame = run.frames.find((f) => f.line === 10 && f.state.cells[6].role === 'active' && f.state.mex.length)!;
    expect(mexFrame.state.mex.map((m) => [m.value, m.taken])).toEqual([
      [0, true],
      [1, true],
      [2, false],
    ]);
    expect(mexFrame.state.arcs.map((a) => a.to)).toEqual([5, 3, 2]);
  });

  it('matches the Python functions, every reachable set (golden fixtures)', () => {
    const list = fixtures.spragueGrundy as Array<{ n: number; moves: number[]; piles: number[]; table: number[]; reachable: number[][]; combined: number | null }>;
    expect(list.length).toBeGreaterThanOrEqual(30);
    for (const c of list) {
      const run = grundyTrace({ n: c.n, moves: c.moves, piles: c.piles });
      expect(run.table).toEqual(c.table);
      expect(run.reachable).toEqual(c.reachable);
      expect(run.combined).toBe(c.combined);
    }
  });
});

describe('game_graph_outcomes', () => {
  /** Reference: iterate "win if some move reaches lose; lose if every move reaches win" to a fixpoint. */
  function valueIteration(n: number, edges: Array<[number, number]>): Outcome[] {
    const state: Array<Outcome | null> = Array(n).fill(null);
    let changed = true;
    while (changed) {
      changed = false;
      for (let u = 0; u < n; u++) {
        if (state[u] !== null) continue;
        const outs = edges.filter(([a]) => a === u).map(([, v]) => v);
        if (outs.some((v) => state[v] === 'lose')) {
          state[u] = 'win';
          changed = true;
        } else if (outs.every((v) => state[v] === 'win')) {
          state[u] = 'lose';
          changed = true;
        }
      }
    }
    return state.map((s) => s ?? 'draw');
  }

  function expectGraphFrames(frames: Array<Frame<GameGraphState>>) {
    expectFrames(frames, GAME_GRAPH_CODE.length);
    for (const f of frames) {
      const ids = new Set(f.state.nodes.map((x) => x.id));
      expect(ids.size).toBe(f.state.nodes.length);
      for (const e of f.state.edges) expect(ids.has(e.from) && ids.has(e.to)).toBe(true);
    }
  }

  it('agrees with value iteration on random graphs with cycles, loops and repeated moves', () => {
    const rand = rng(62);
    for (let t = 0; t < 300; t++) {
      const n = 1 + Math.floor(rand() * 10);
      const edges: Array<[number, number]> = Array.from({ length: Math.floor(rand() * Math.min(24, 3 * n + 1)) }, () => [Math.floor(rand() * n), Math.floor(rand() * n)]);
      const run = gameGraphTrace({ n, edges });
      expect(run.outcomes, JSON.stringify(edges)).toEqual(valueIteration(n, edges));
      expectGraphFrames(run.frames);
      const last = run.frames[run.frames.length - 1].state;
      expect(last.nodes.map((x) => x.badge.toLowerCase())).toEqual(run.outcomes);
    }
  });

  it('the article graph: 2 has no move, 1 can reach it, 0 must move to 1', () => {
    const run = gameGraphTrace(parseGameGraph('0>1, 1>0, 1>2'));
    expect(run.outcomes).toEqual(['lose', 'win', 'lose']);
    expect(run.order).toEqual([2, 1, 0]);
    expect(gameGraphTrace(parseGameGraph('0>1, 1>0')).outcomes).toEqual(['draw', 'draw']);
    expect(gameGraphTrace(parseGameGraph('0>0')).outcomes).toEqual(['draw']);
  });

  it('matches the Python function, and the order its queue settles the nodes (golden fixtures)', () => {
    const list = fixtures.gameGraph as Array<{ n: number; edges: Array<[number, number]>; outcomes: Outcome[]; queue: number[] }>;
    expect(list.length).toBeGreaterThanOrEqual(40);
    for (const c of list) {
      const run = gameGraphTrace({ n: c.n, edges: c.edges });
      expect(run.outcomes).toEqual(c.outcomes);
      expect(run.order).toEqual(c.queue);
    }
  });
});

describe('game theory parsers', () => {
  it('read their inputs', () => {
    expect(parseNim('[3, 4, 5]')).toEqual([3, 4, 5]);
    expect(parseGrundy('n 12; moves 1 3 4; piles 5 6')).toEqual({ n: 12, moves: [1, 3, 4], piles: [5, 6] });
    expect(parseGrundy('moves 2; piles 9')).toEqual({ n: 9, moves: [2], piles: [9] });
    expect(parseGameGraph('n 4, 0>1, 1->2')).toEqual({ n: 4, edges: [[0, 1], [1, 2]] });
  });

  it('give friendly errors', () => {
    expect(() => parseNim('')).toThrow(InputError);
    expect(() => parseNim('32')).toThrow(/0 to 31/);
    expect(() => parseGrundy('n 12')).toThrow(/moves/);
    expect(() => parseGrundy('n 25; moves 1')).toThrow(/up to|0 to 24/);
    expect(() => parseGrundy('n 5; moves 0')).toThrow(/1 to 30/);
    expect(() => parseGrundy('n 5; moves 1; piles 6')).toThrow(/raise n/);
    expect(() => parseGameGraph('0-1')).toThrow(/Cannot read/);
    expect(() => parseGameGraph('n 2, 0>3')).toThrow(/does not exist/);
    expect(() => parseGameGraph('0>10')).toThrow(/10 nodes/);
  });
});
