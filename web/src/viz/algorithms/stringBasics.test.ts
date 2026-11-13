import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import type { StringOpsState } from '../renderers/StringOpsView';
import { stringBasics as spec } from '../specs/stringBasics';
import fixtures from './__fixtures__/stringStructures.json';
import { formatBasicsOp, parseBasics, sliceBound, stringBasicsTrace, type BasicsOp } from './stringBasics';
import { randomWord, seeded } from './stringOps';

interface Case {
  fn: string;
  args: Array<string | number>;
  result?: unknown;
  error?: string;
}

/** Run one call of main.py through the tracer: the string, then a single operation. */
function call(fn: string, args: Array<string | number>) {
  const s = args[0] as string;
  const op: BasicsOp =
    fn === 'access_char'
      ? { kind: 'access', i: args[1] as number }
      : fn === 'string_length'
        ? { kind: 'length' }
        : fn === 'traverse_string'
          ? { kind: 'traverse' }
          : fn === 'concatenate'
            ? { kind: 'concat', text: args[1] as string }
            : { kind: 'substring', start: args[1] as number, end: args[2] as number };
  const run = stringBasicsTrace({ s, ops: [op] });
  expect(run.steps).toHaveLength(1);
  return { run, result: run.steps[0].result };
}

/** Frame rules every string visualization keeps. */
function expectWellFormed(frames: Array<Frame<StringOpsState>>, lines: number) {
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(10);
    if (f.line !== undefined) expect(f.line).toBeLessThan(lines);
    const { cells, rows, ticks = [], markers = [], extent } = f.state;
    const ids = cells.map((c) => c.id);
    expect(new Set(ids).size, f.caption).toBe(ids.length);
    const names = markers.map((m) => m.name);
    expect(new Set(names).size).toBe(names.length);
    expect(extent).toBeDefined();
    const known = new Set(extent!.rows.map((r) => r.row));
    for (const r of rows) expect(known.has(r.row)).toBe(true);
    for (const c of cells) {
      expect(known.has(c.row)).toBe(true);
      expect(c.ch.length).toBeLessThanOrEqual(2);
      if (c.from) expect(known.has(c.from.row)).toBe(true);
    }
    for (const t of ticks) expect(known.has(t.row)).toBe(true);
    for (const m of markers) expect(known.has(m.row)).toBe(true);
    // Two cells never share a position.
    const spots = cells.map((c) => `${c.row}|${c.col}`);
    expect(new Set(spots).size, f.caption).toBe(spots.length);
  }
}

describe('stringBasics', () => {
  it('matches the Python functions of main.py (golden fixtures): every result and every IndexError', () => {
    const cases = fixtures.basics as unknown as Case[];
    expect(cases.length).toBeGreaterThanOrEqual(100);
    for (const c of cases) {
      const { result } = call(c.fn, c.args);
      const where = `${c.fn}(${c.args.map((a) => JSON.stringify(a)).join(', ')})`;
      if (c.error) expect(result, where).toEqual({ error: c.error });
      else expect(result, where).toEqual(c.result);
    }
  });

  it('agrees with a reference model on random calls, and keeps s as the script says', () => {
    const rand = seeded(11);
    for (let t = 0; t < 200; t++) {
      let s = randomWord('ab c-D', 0, 10, rand);
      const s0 = s;
      const ops: BasicsOp[] = [];
      for (let k = 0, count = 1 + Math.floor(rand() * 6); k < count; k++) {
        const r = rand();
        const pos = () => Math.floor(rand() * 31) - 15;
        if (r < 0.3) ops.push({ kind: 'access', i: pos() });
        else if (r < 0.6) ops.push({ kind: 'substring', start: pos(), end: pos() });
        else if (r < 0.75) ops.push({ kind: 'concat', text: randomWord('xy', 0, 3, rand) });
        else ops.push(r < 0.9 ? { kind: 'traverse' } : { kind: 'length' });
      }
      const run = stringBasicsTrace({ s, ops });
      ops.forEach((op, k) => {
        const n = s.length;
        let want: unknown;
        if (op.kind === 'access') want = op.i >= -n && op.i < n ? s.at(op.i) : { error: 'IndexError' };
        else if (op.kind === 'substring') want = s.slice(op.start, op.end);
        else if (op.kind === 'concat') want = s = s + op.text;
        else if (op.kind === 'traverse') want = [...s];
        else want = n;
        expect(run.steps[k].result, formatBasicsOp(op)).toEqual(want);
        expect(run.steps[k].s).toBe(s);
      });
      expectWellFormed(spec.trace({ s: s0, ops }), spec.pseudocode.length);
    }
  });

  it('adjusts slice bounds like Python', () => {
    expect([sliceBound(-3, 5), sliceBound(-9, 5), sliceBound(99, 5), sliceBound(5, 5), sliceBound(2, 5)]).toEqual([2, 0, 5, 5, 2]);
  });

  it('produces well-formed frames for every example and random input', () => {
    const inputs = [...spec.examples.map((e) => e.value), ...Array.from({ length: 40 }, () => spec.randomInput())];
    for (const text of inputs) expectWellFormed(spec.trace(spec.parse(text)), spec.pseudocode.length);
  });

  it('shows both copies of a concatenation and an IndexError frame', () => {
    const frames = spec.trace(spec.parse('"ab"; concat "cd", access 9'));
    const copies = frames.filter((f) => f.state.cells.some((c) => c.from && c.row === 2));
    expect(copies.length).toBeGreaterThanOrEqual(2);
    const raise = frames.find((f) => f.caption.includes('IndexError'))!;
    expect(raise.state.cells.some((c) => c.role === 'bad')).toBe(true);
    expect(frames[frames.length - 1].caption).toContain("'abcd'");
  });
});

describe('parseBasics', () => {
  it('reads every operation and its short forms', () => {
    const input = parseBasics('"hello"; access 1, s[-1], length, len(s), traverse, substring 1 4, s[-3:99], concat " w"');
    expect(input.s).toBe('hello');
    expect(input.ops.map(formatBasicsOp)).toEqual([
      'access_char(s, 1)',
      'access_char(s, -1)',
      'string_length(s)',
      'string_length(s)',
      'traverse_string(s)',
      'substring(s, 1, 4)',
      'substring(s, -3, 99)',
      "concatenate(s, ' w')",
    ]);
    expect(parseBasics('"hi"; s + "!", get 0, slice 0 1, for').ops.map(formatBasicsOp)).toEqual([
      "concatenate(s, '!')",
      'access_char(s, 0)',
      'substring(s, 0, 1)',
      'traverse_string(s)',
    ]);
    expect(parseBasics('hello').ops).toEqual([]);
    expect(parseBasics("s = 'a b'; length").s).toBe('a b');
  });

  it('gives friendly errors', () => {
    expect(() => parseBasics('')).toThrow(InputError);
    expect(() => parseBasics('"hello"; reverse')).toThrow(/Cannot read/);
    expect(() => parseBasics('"hello"; access')).toThrow(/an index/);
    expect(() => parseBasics('"hello"; access 100')).toThrow(/between -99 and 99/);
    expect(() => parseBasics('"hello"; substring 1')).toThrow(/an end/);
    expect(() => parseBasics('"hello"; concat world')).toThrow(/in quotes/);
    expect(() => parseBasics('"hello world!!"')).toThrow(/at most 12/);
    expect(() => parseBasics('"hello world"; concat "123456"')).toThrow(/at most 16/);
  });
});
