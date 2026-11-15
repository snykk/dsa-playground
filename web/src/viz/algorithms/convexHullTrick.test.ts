import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { stabilizeEnvelope } from '../renderers/LineEnvelopeView';
import { CHT_CODE, chtTrace, chtWindow, lowerEnvelope, parseCht, type ChtOp, type ChtRun } from './convexHullTrick';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/advancedDp.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const toOp = (op: [string, number, number?]): ChtOp => (op[0] === 'add' ? { kind: 'add', m: op[1], b: op[2]! } : { kind: 'query', x: op[1] });

function expectWellFormed(run: ChtRun) {
  const frames = stabilizeEnvelope(run.frames);
  const win = JSON.stringify(frames[0].state.window);
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(20);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(CHT_CODE.length);
    }
    expect(JSON.stringify(f.state.window), 'one window per run').toBe(win);
    expect(f.state.dequeSlots).toBe(frames[0].state.dequeSlots);
    const ids = f.state.lines.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    const marks = (f.state.marks ?? []).map((m) => m.id);
    expect(new Set(marks).size).toBe(marks.length);
    for (const m of f.state.marks ?? []) expect(Number.isFinite(m.x) && Number.isFinite(m.y)).toBe(true);
  }
}

/** A script that keeps the class's promises: slopes non-increasing (ties allowed), x non-decreasing. */
function randomScript(rand: () => number): ChtOp[] {
  const ops: ChtOp[] = [];
  let m = Math.floor(rand() * 10) - 2;
  let x = Math.floor(rand() * 12) - 10;
  const count = 1 + Math.floor(rand() * 16);
  let lines = 0;
  for (let i = 0; i < count; i++) {
    if (rand() < 0.5 && lines < 8) {
      ops.push({ kind: 'add', m: Math.max(-9, m), b: Math.floor(rand() * 41) - 20 });
      m -= Math.floor(rand() * 3);
      lines++;
    } else {
      ops.push({ kind: 'query', x });
      x = Math.min(30, x + Math.floor(rand() * 4));
    }
  }
  return ops;
}

describe('chtTrace matches MonotonicCHT (golden fixtures)', () => {
  it('leaves the same deque after every operation and gives the same answers and errors', () => {
    const cases = fixtures.cht as Array<{ ops: Array<[string, number, number?]>; steps: Array<{ lines: Array<[number, number]>; result?: number; error?: string }> }>;
    expect(cases.length).toBeGreaterThanOrEqual(50);
    for (const c of cases) {
      const run = chtTrace({ ops: c.ops.map(toOp) });
      expect(run.steps).toHaveLength(c.steps.length);
      c.steps.forEach((want, i) => {
        const got = run.steps[i];
        const label = JSON.stringify(c.ops.slice(0, i + 1));
        expect(got.lines, label).toEqual(want.lines);
        expect(got.result, label).toBe(want.result);
        expect(got.error, label).toBe(want.error);
      });
    }
  });
});

describe('chtTrace against brute force', () => {
  it('answers every query with the minimum over all lines added, when the promises hold', () => {
    const rand = rng(23);
    for (let t = 0; t < 200; t++) {
      const ops = randomScript(rand);
      const run = chtTrace({ ops });
      const added: Array<{ m: number; b: number }> = [];
      ops.forEach((op, i) => {
        const step = run.steps[i];
        if (op.kind === 'add') added.push(op);
        else if (added.length === 0) expect(step.error).toBe('no lines in CHT');
        else expect(step.result, JSON.stringify(ops.slice(0, i + 1))).toBe(Math.min(...added.map((l) => l.m * op.x + l.b)));
        // the deque: strictly decreasing slopes
        for (let k = 1; k < step.lines.length; k++) expect(step.lines[k][0]).toBeLessThan(step.lines[k - 1][0]);
      });
      expectWellFormed(run);
    }
  });

  it('draws the true lower envelope of the deque', () => {
    const lines = [
      { m: 3, b: 0 },
      { m: 1, b: 3 },
      { m: 0, b: 7 },
    ];
    expect(lowerEnvelope(lines, 0, 6)).toEqual([
      [0, 0],
      [1.5, 4.5],
      [4, 7],
      [6, 7],
    ]);
  });
});

describe('chtTrace scenarios', () => {
  it('the article run: (2, 4) is popped by the back test, then the queries sweep the front', () => {
    const run = chtTrace(parseCht('add 3 0, add 2 4, add 1 3, add 0 7, query 0, query 1, query 2, query 3, query 4, query 5, query 6'));
    expect(run.steps.map((s) => s.lines.length)).toEqual([1, 2, 2, 3, 3, 3, 2, 2, 1, 1, 1]);
    expect(run.steps.slice(4).map((s) => s.result)).toEqual([0, 3, 5, 6, 7, 7, 7]);
    const test = run.frames.find((f) => f.line === 8)!;
    expect(test.caption).toContain('(3 - 0) * (3 - 2) = 3');
    expect(test.caption).toContain('(4 - 0) * (3 - 1) = 8');
    expect(test.caption).toMatch(/Pop L2/);
  });

  it('three equal slopes keep the lowest intercept (the audit bug)', () => {
    const run = chtTrace(parseCht('add 2 5, add 2 1, add 2 3, query 0'));
    expect(run.steps.map((s) => s.lines)).toEqual([[[2, 5]], [[2, 1]], [[2, 1]], [[2, 1]]]);
    expect(run.steps[3].result).toBe(1);
  });

  it('a query on an empty deque raises ValueError and the run goes on', () => {
    const run = chtTrace(parseCht('query 0, add 1 2, query 3'));
    expect(run.steps[0].error).toBe('no lines in CHT');
    expect(run.steps[2].result).toBe(5);
  });

  it('a query with a smaller x gives what Python gives, and says it is wrong', () => {
    const run = chtTrace(parseCht('add 2 0, add 0 3, query 4, query 0'));
    expect(run.steps[3].result).toBe(3);
    const last = run.frames.filter((f) => f.line === 14).pop()!;
    expect(last.caption).toMatch(/true minimum over every line added is 0/);
  });

  it('keeps one window around the queries and the envelope', () => {
    const w = chtWindow(parseCht('add 3 0, add 2 4, add 1 3, add 0 7, query 0, query 6').ops);
    expect(w.x0).toBeLessThanOrEqual(-1);
    expect(w.x1).toBeGreaterThanOrEqual(7);
    expect(w.y0).toBeLessThan(0);
    expect(w.y1).toBeGreaterThan(7);
  });
});

describe('parseCht', () => {
  it('reads operations and short forms', () => {
    expect(parseCht('add 2 4, a(1, -3); q 5, query(-2)').ops).toEqual([
      { kind: 'add', m: 2, b: 4 },
      { kind: 'add', m: 1, b: -3 },
      { kind: 'query', x: 5 },
      { kind: 'query', x: -2 },
    ]);
  });

  it('gives friendly errors', () => {
    expect(() => parseCht('')).toThrow(InputError);
    expect(() => parseCht('add 2')).toThrow(/slope and an intercept/);
    expect(() => parseCht('query')).toThrow(/one x/);
    expect(() => parseCht('add 2.5 1')).toThrow(/integers/);
    expect(() => parseCht('add 20 1')).toThrow(/-9 to 9/);
    expect(() => parseCht('pop')).toThrow(/Cannot read/);
    expect(() => parseCht(Array.from({ length: 9 }, (_, i) => `add ${-i} 0`).join(', '))).toThrow(/8 add/);
  });
});
