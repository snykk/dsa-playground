import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { layoutRope } from '../renderers/RopeView';
import { rope as ropeSpec } from '../specs/rope';
import fixtures from './__fixtures__/stringStructures.json';
import { formatRopeOp, leafCount, parseRope, ropeRun, ropeTrace, shapeOf, textOf, type RNode, type RopeInput, type RopeOp, type Shape } from './rope';
import { randomWord, seeded } from './stringOps';

interface RopeCase {
  text: string;
  ops: Array<[string, ...Array<string | number>]>;
  steps: Array<{ text: string; len: number; height: number; shape: Shape; result: unknown }>;
}

function toOp(raw: RopeCase['ops'][number]): RopeOp {
  const [kind, a, b] = raw;
  if (kind === 'index' || kind === 'split') return { kind, i: a as number };
  if (kind === 'insert') return { kind, i: a as number, text: b as string };
  if (kind === 'delete') return { kind, i: a as number, n: b as number };
  return { kind: 'concat', text: a as string };
}

/** The tree invariants rope_test.py checks: cached fields right, siblings within 1, leaves of 1..10 characters. */
function checkTree(node: RNode | null) {
  if (node === null) return;
  if (node.data !== null) {
    expect(node.data.length).toBeGreaterThan(0);
    expect(node.data.length).toBeLessThanOrEqual(10);
    expect([node.length, node.height, node.weight]).toEqual([node.data.length, 0, node.data.length]);
    return;
  }
  const { left, right } = node;
  expect(left).not.toBeNull();
  expect(right).not.toBeNull();
  checkTree(left);
  checkTree(right);
  expect(node.weight).toBe(left!.length);
  expect(node.length).toBe(left!.length + right!.length);
  expect(node.height).toBe(1 + Math.max(left!.height, right!.height));
  expect(Math.abs(left!.height - right!.height)).toBeLessThanOrEqual(1);
}

function randomInput(rand: () => number): RopeInput {
  const text = randomWord('abcdefgh ', 0, 30, rand);
  let length = text.length;
  const ops: RopeOp[] = [];
  for (let k = 0, count = 1 + Math.floor(rand() * 8); k < count; k++) {
    const pos = Math.floor(rand() * (length + 7)) - 3;
    const r = rand();
    if (r < 0.2) ops.push({ kind: 'index', i: pos });
    else if (r < 0.35) ops.push({ kind: 'split', i: pos });
    else if (r < 0.65) {
      const add = randomWord('XYZ', 0, 14, rand);
      ops.push({ kind: 'insert', i: rand() < 0.2 ? 'end' : pos, text: add });
      length += add.length;
    } else if (r < 0.85) {
      const n = Math.floor(rand() * 10);
      ops.push({ kind: 'delete', i: pos, n });
      length -= Math.min(n, length - Math.min(Math.max(pos, 0), length));
    } else {
      const add = randomWord('XYZ', 0, 20, rand);
      ops.push({ kind: 'concat', text: add });
      length += add.length;
    }
  }
  return { text, ops };
}

describe('rope', () => {
  it('matches the Python Rope (golden fixtures): the whole tree after every operation, and every result', () => {
    const cases = fixtures.rope as unknown as RopeCase[];
    expect(cases.length).toBeGreaterThanOrEqual(100);
    for (const c of cases) {
      const run = ropeTrace({ text: c.text, ops: c.ops.map(toOp) });
      expect(run.steps.length).toBe(c.steps.length);
      c.steps.forEach((want, i) => {
        const got = run.steps[i];
        const where = `${JSON.stringify(c.text)} op ${i}: ${formatRopeOp(got.op)}`;
        expect(got.shape, where).toEqual(want.shape);
        expect(got.text, where).toBe(want.text);
        expect(got.len, where).toBe(want.len);
        expect(got.height, where).toBe(want.height);
        expect(got.result, where).toEqual(want.result);
      });
    }
  });

  it('agrees with a plain string on random edit scripts, and keeps the tree balanced', () => {
    const rand = seeded(2026);
    for (let t = 0; t < 150; t++) {
      const input = randomInput(rand);
      const run = ropeTrace(input);
      let model = input.text;
      const clamp = (p: number) => Math.min(Math.max(p, 0), model.length);
      expect(run.steps.length).toBe(input.ops.length);
      input.ops.forEach((op, i) => {
        const step = run.steps[i];
        if (op.kind === 'index') {
          expect(step.result).toEqual(op.i >= 0 && op.i < model.length ? model[op.i] : { error: 'IndexError' });
        } else if (op.kind === 'split') {
          const [a, b] = step.result as [Shape, Shape];
          const flat = (s: Shape): string => (s === null ? '' : typeof s === 'string' ? s : flat(s[0]) + flat(s[1]));
          expect([flat(a), flat(b)]).toEqual([model.slice(0, clamp(op.i)), model.slice(clamp(op.i))]);
        } else if (op.kind === 'insert') {
          const p = op.i === 'end' ? model.length : clamp(op.i);
          model = model.slice(0, p) + op.text + model.slice(p);
        } else if (op.kind === 'delete') {
          const p = clamp(op.i);
          model = model.slice(0, p) + model.slice(p + op.n);
        } else {
          model += op.text;
        }
        expect(step.text).toBe(model);
        expect(step.len).toBe(model.length);
      });
      checkTree(run.root);
      expect(textOf(run.root)).toBe(model);
      expect(run.frames.length).toBeLessThan(2000);
    }
  });

  it('stays logarithmic when typing at the end (the v0.2.0 regression), with rotations along the way', () => {
    const ops: RopeOp[] = Array.from({ length: 300 }, (_, k) => ({ kind: 'insert', i: 'end', text: String.fromCharCode(97 + (k % 26)) }));
    const run = ropeRun({ text: '', ops });
    checkTree(run.root);
    expect(run.root!.length).toBe(300);
    expect(run.root!.height).toBeLessThanOrEqual(2 * Math.log2(300));
    expect(run.rotations.single).toBeGreaterThan(0);
  });

  it('shows the rotations its examples promise', () => {
    const typing = ropeTrace(parseRope(ropeSpec.examples[2].value));
    expect(typing.rotations).toEqual({ single: 1, double: 0 });
    expect(typing.frames.some((f) => f.caption.startsWith('Single rotation'))).toBe(true);
    const long = ropeTrace(parseRope(ropeSpec.examples[3].value));
    expect(long.rotations).toEqual({ single: 0, double: 1 });
    expect(textOf(long.root)).toBe('[hello world]');
  });

  it('produces well-formed frames', () => {
    const rand = seeded(7);
    const inputs = [...ropeSpec.examples.map((e) => parseRope(e.value)), ...Array.from({ length: 60 }, () => randomInput(rand))];
    for (const input of inputs) {
      const frames = ropeSpec.trace(input);
      for (const f of frames) {
        expect(f.caption.length).toBeGreaterThan(10);
        if (f.line !== undefined) expect(f.line).toBeLessThan(ropeSpec.pseudocode.length);
        const { nodes, pieces, mark, slice, pointer, edges } = f.state;
        const ids = nodes.map((n) => n.id);
        expect(new Set(ids).size).toBe(ids.length);
        const byId = new Map(nodes.map((n) => [n.id, n]));
        for (const n of nodes) {
          for (const c of [n.left, n.right]) if (c !== null) expect(byId.has(c)).toBe(true);
          if (n.text === null) expect(n.left !== null && n.right !== null).toBe(true);
        }
        for (const p of pieces) if (p.root !== null) expect(byId.has(p.root)).toBe(true);
        if (mark) expect(byId.get(mark.leaf)!.text!.length).toBeGreaterThan(mark.at);
        if (slice) expect(byId.get(slice.leaf)!.text!.length).toBeGreaterThanOrEqual(slice.at);
        if (pointer) expect(byId.has(pointer.node)).toBe(true);
        for (const child of Object.keys(edges ?? {})) expect(byId.has(Number(child))).toBe(true);
        // Every node is drawn exactly once: reachable from exactly one piece.
        const layout = layoutRope(f.state);
        expect(layout.pos.size).toBe(nodes.length);
        expect(f.state.extent).toBeDefined();
      }
    }
  });

  it('builds leaves of at most 10 characters by halving, like _build', () => {
    const run = ropeRun({ text: 'Hello, World! Nice to meet you!', ops: [] });
    expect(shapeOf(run.root)).toEqual([
      ['Hello, ', 'World! N'],
      ['ice to m', 'eet you!'],
    ]);
    expect(leafCount(run.root)).toBe(4);
    expect(ropeRun({ text: '', ops: [] }).root).toBeNull();
  });
});

describe('parseRope', () => {
  it('reads the text and every operation, with short forms', () => {
    const input = parseRope('"Hello World!"; insert 5 ",", ins end "!", index 6, at 2, delete 5 2, del 0 1, split 4, concat " Bye"');
    expect(input.text).toBe('Hello World!');
    expect(input.ops.map(formatRopeOp)).toEqual([
      "insert(5, ',')",
      "insert(len(r), '!')",
      'index(6)',
      'index(2)',
      'delete(5, 2)',
      'delete(0, 1)',
      'split(4)',
      "concat(Rope(' Bye'))",
    ]);
    expect(parseRope("'it is'; + 'x'").ops).toEqual([{ kind: 'concat', text: 'x' }]);
    expect(parseRope('""; insert 0 "abc"').text).toBe('');
  });

  it('gives friendly errors', () => {
    expect(() => parseRope('')).toThrow(InputError);
    expect(() => parseRope('"abc"; reverse')).toThrow(/Cannot read/);
    expect(() => parseRope('"abc"; insert 1')).toThrow(/in quotes/);
    expect(() => parseRope('"abc"; index')).toThrow(/a position/);
    expect(() => parseRope('"abc"; index 1 2')).toThrow(/Too many/);
    expect(() => parseRope('"abc')).toThrow(/never closed/);
    expect(() => parseRope(`"${'x'.repeat(41)}"`)).toThrow(/at most 40/);
    expect(() => parseRope('"abcdefghijklmnopqrstuvwxyz0123456789"; concat "abcdefghij"')).toThrow(/at most 40 fit/);
    expect(() => parseRope('"abcdefghijklmnopqrstuvwxyz0123"; insert 2 "x", insert 7 "x", insert 12 "x", insert 17 "x", insert 22 "x", insert 27 "x"')).toThrow(
      /leaves/,
    );
    expect(() => parseRope(`"caf${String.fromCodePoint(0xe9)}"`)).toThrow(/printable ASCII/);
  });
});
