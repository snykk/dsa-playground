import { describe, expect, it } from 'vitest';
import { InputError, type AnyVizSpec, type Frame } from '../core/types';
import type { StringOpsState } from '../renderers/StringOpsView';
import { stringCountReplace, stringReverse, stringSplitJoin } from '../specs/stringManipulation';
import fixtures from './__fixtures__/stringStructures.json';
import { formatManipOp, parseManip, stringManipulationTrace, VOWELS, type ManipGroup, type ManipOp } from './stringManipulation';
import { randomWord, seeded } from './stringOps';

interface Case {
  fn: string;
  args: Array<string | number | string[]>;
  result?: unknown;
  error?: string;
}

const GROUP: Record<ManipOp['kind'], ManipGroup> = {
  reverse: 'reverse',
  palindrome: 'reverse',
  vowels: 'count',
  replace: 'count',
  upper: 'count',
  lower: 'count',
  split: 'split',
  join: 'split',
};

function toCall(fn: string, args: Case['args']): { s: string; op: ManipOp } {
  const s = typeof args[0] === 'string' ? args[0] : '';
  switch (fn) {
    case 'reverse_string':
      return { s, op: { kind: 'reverse' } };
    case 'is_palindrome':
      return { s, op: { kind: 'palindrome' } };
    case 'count_vowels':
      return { s, op: { kind: 'vowels' } };
    case 'replace_char':
      return { s, op: { kind: 'replace', old: args[1] as string, new: args[2] as string } };
    case 'to_upper':
      return { s, op: { kind: 'upper' } };
    case 'to_lower':
      return { s, op: { kind: 'lower' } };
    case 'split_string':
      return { s, op: { kind: 'split', sep: args[1] as string } };
    default:
      return { s: '', op: { kind: 'join', list: args[0] as string[], sep: args[1] as string } };
  }
}

function run(s: string, ops: ManipOp[]) {
  return stringManipulationTrace({ s, ops }, GROUP[ops[0].kind]);
}

/** What Python returns, from plain JavaScript (ASCII text, so the case maps agree). */
function reference(s: string, op: ManipOp, parts: string[] | null): unknown {
  switch (op.kind) {
    case 'reverse':
      return [...s].reverse().join('');
    case 'palindrome':
      return s === [...s].reverse().join('');
    case 'vowels':
      return [...s].filter((c) => VOWELS.includes(c)).length;
    case 'replace':
      return s.replaceAll(op.old, () => op.new);
    case 'upper':
      return s.toUpperCase();
    case 'lower':
      return s.toLowerCase();
    case 'split':
      return op.sep === '' ? { error: 'ValueError' } : s.split(op.sep);
    default:
      return (op.list ?? parts ?? []).join(op.sep);
  }
}

function expectWellFormed(frames: Array<Frame<StringOpsState>>, lines: number) {
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(10);
    if (f.line !== undefined) expect(f.line).toBeLessThan(lines);
    const { cells, rows, ticks = [], markers = [], extent } = f.state;
    const ids = cells.map((c) => c.id);
    expect(new Set(ids).size, f.caption).toBe(ids.length);
    expect(new Set(markers.map((m) => m.name)).size).toBe(markers.length);
    expect(extent).toBeDefined();
    const known = new Set(extent!.rows.map((r) => r.row));
    for (const x of [...rows, ...cells, ...ticks, ...markers]) expect(known.has(x.row)).toBe(true);
    for (const c of cells) if (c.from) expect(known.has(c.from.row)).toBe(true);
    const spots = cells.map((c) => `${c.row}|${c.col}`);
    expect(new Set(spots).size, f.caption).toBe(spots.length);
  }
}

describe('stringManipulation', () => {
  it('matches the Python functions of string_manipulation.py (golden fixtures)', () => {
    const cases = fixtures.manipulation as unknown as Case[];
    expect(cases.length).toBeGreaterThanOrEqual(100);
    for (const c of cases) {
      const { s, op } = toCall(c.fn, c.args);
      const got = run(s, [op]).steps[0].result;
      const where = `${c.fn}(${c.args.map((a) => JSON.stringify(a)).join(', ')})`;
      expect(got, where).toEqual(c.error ? { error: c.error } : c.result);
    }
  });

  it('agrees with a reference model on random scripts', () => {
    const rand = seeded(5);
    const kinds: Array<ManipOp['kind']> = ['reverse', 'palindrome', 'vowels', 'replace', 'upper', 'lower', 'split', 'join'];
    for (let t = 0; t < 300; t++) {
      const s = randomWord(rand() < 0.3 ? 'ab' : 'aEb c,-', 0, 12, rand);
      const kind = kinds[Math.floor(rand() * kinds.length)];
      const group = GROUP[kind];
      const ops: ManipOp[] = [];
      for (let k = 0, count = 1 + Math.floor(rand() * 3); k < count; k++) {
        const pickKind = kinds.filter((x) => GROUP[x] === group)[Math.floor(rand() * 4) % kinds.filter((x) => GROUP[x] === group).length];
        if (pickKind === 'replace') ops.push({ kind: 'replace', old: randomWord('ab ', 0, 2, rand), new: randomWord('XY', 0, 2, rand) });
        else if (pickKind === 'split') ops.push({ kind: 'split', sep: randomWord(' ,a', 0, 2, rand) });
        else if (pickKind === 'join') ops.push({ kind: 'join', sep: randomWord('-+', 0, 2, rand), list: rand() < 0.5 ? undefined : Array.from({ length: Math.floor(rand() * 4) }, () => randomWord('xy', 0, 2, rand)) });
        else ops.push({ kind: pickKind } as ManipOp);
      }
      const result = stringManipulationTrace({ s, ops }, group);
      let parts: string[] | null = null;
      ops.forEach((op, k) => {
        expect(result.steps[k].result, `${JSON.stringify(s)} ${formatManipOp(op)}`).toEqual(reference(s, op, parts));
        if (op.kind === 'split' && op.sep !== '') parts = s.split(op.sep);
      });
      expect(result.frames.length).toBeLessThan(2000);
    }
  });

  const specs: AnyVizSpec[] = [stringReverse, stringCountReplace, stringSplitJoin];
  it.each(specs.map((s) => [s.id, s] as const))('%s produces well-formed frames for every example and random input', (_, spec) => {
    const inputs = [...spec.examples.map((e) => e.value), ...Array.from({ length: 30 }, () => spec.randomInput())];
    for (const text of inputs) expectWellFormed(spec.trace(spec.parse(text)) as Array<Frame<StringOpsState>>, spec.pseudocode.length);
  });

  it('builds the whole reversed copy before the palindrome comparison stops', () => {
    const frames = stringReverse.trace(stringReverse.parse('"abca"; palindrome'));
    const copy = frames.findIndex((f) => f.state.cells.filter((c) => c.row === 1 && c.from).length === 4);
    const mismatch = frames.findIndex((f) => f.caption.includes('returns False'));
    expect(copy).toBeGreaterThan(0);
    expect(mismatch).toBeGreaterThan(copy);
  });

  it('keeps empty fields and raises on an empty separator', () => {
    const r = run('a  b ', [{ kind: 'split', sep: ' ' }, { kind: 'join', sep: '-' }, { kind: 'split', sep: '' }]);
    expect(r.steps.map((x) => x.result)).toEqual([['a', '', 'b', ''], 'a--b-', { error: 'ValueError' }]);
  });
});

describe('parseManip', () => {
  it('reads each group and its defaults', () => {
    expect(parseManip('racecar', 'reverse').ops.map(formatManipOp)).toEqual(['reverse_string(s)', 'is_palindrome(s)']);
    expect(parseManip('"Hello"; vowels, replace "l" "L", upper, lower', 'count').ops.map(formatManipOp)).toEqual([
      'count_vowels(s)',
      "replace_char(s, 'l', 'L')",
      'to_upper(s)',
      'to_lower(s)',
    ]);
    expect(parseManip('"a b"', 'split').ops.map(formatManipOp)).toEqual(["split_string(s, ' ')", "join_string(parts, ' ')"]);
    expect(parseManip('""; join ["a", "b"] ", "', 'split').ops).toEqual([{ kind: 'join', sep: ', ', list: ['a', 'b'] }]);
  });

  it('gives friendly errors', () => {
    expect(() => parseManip('', 'reverse')).toThrow(InputError);
    expect(() => parseManip('"abc"; upper', 'reverse')).toThrow(/another tab/);
    expect(() => parseManip('"abc"; shout', 'count')).toThrow(/Cannot read/);
    expect(() => parseManip('"abc"; replace "a"', 'count')).toThrow(/new text/);
    expect(() => parseManip('"abc"; join "-"', 'split')).toThrow(/needs a list/);
    expect(() => parseManip('"abcdefghijklmnopq"', 'reverse')).toThrow(/at most 16/);
    expect(() => parseManip('"abcdefghijklmnop"; replace "" "--"', 'count')).toThrow(/at most 24/);
  });
});
