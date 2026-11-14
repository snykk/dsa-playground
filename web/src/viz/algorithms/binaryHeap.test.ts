import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import type { HeapState } from '../renderers/HeapView';
import fixtures from './__fixtures__/heapsGraphs.json';
import { HEAP_LIMITS, heapPseudocode, heapTrace, parseHeapScript, splitOps, type HeapInput, type HeapMode, type HeapOp } from './binaryHeap';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

type FixtureOp = [string, number?];
interface FixtureCase {
  build: number[] | null;
  ops: FixtureOp[];
  initial: number[];
  steps: Array<{ result: string | null; error: string | null; heap: number[] }>;
}

const toOp = ([kind, value]: FixtureOp): HeapOp => (kind === 'insert' ? { kind: 'insert', value: value! } : ({ kind } as HeapOp));

/** Every frame: a caption, a line in range, unique ids, markers on real slots. */
function expectWellFormed(frames: Array<Frame<HeapState>>, lines: number) {
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(10);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(lines);
    }
    const ids = [...f.state.slots.map((s) => s!.id), ...(f.state.floating ?? []).map((x) => x.node.id)];
    expect(new Set(ids).size, f.caption).toBe(ids.length);
    expect(f.state.slots.every((s) => s !== null)).toBe(true);
    for (const m of f.state.markers ?? []) {
      if (m.name === 'heap[0]') expect(f.state.slots.length).toBe(0);
      else expect(m.index, f.caption).toBeLessThan(f.state.slots.length);
    }
    for (const k of Object.keys(f.state.edgeRoles ?? {})) expect(Number(k)).toBeLessThan(f.state.slots.length);
  }
}

function heapOrdered(heap: number[], mode: HeapMode): boolean {
  return heap.every((v, i) => i === 0 || (mode === 'min' ? heap[(i - 1) >> 1] <= v : heap[(i - 1) >> 1] >= v));
}

function randomInput(rand: () => number): HeapInput {
  const build = rand() < 0.4 ? Array.from({ length: Math.floor(rand() * 12) }, () => Math.floor(rand() * 30) - 5) : null;
  let live = build?.length ?? 0;
  const ops: HeapOp[] = [];
  const count = 1 + Math.floor(rand() * 25);
  for (let i = 0; i < count; i++) {
    const r = rand();
    if (r < 0.55 && live < HEAP_LIMITS.maxSize) {
      ops.push({ kind: 'insert', value: Math.floor(rand() * 20) - 5 });
      live += 1;
    } else if (r < 0.85) {
      ops.push({ kind: 'extract' });
      live = Math.max(0, live - 1);
    } else if (r < 0.92) ops.push({ kind: 'peek' });
    else if (r < 0.96) ops.push({ kind: 'size' });
    else if (r < 0.98) ops.push({ kind: 'is_empty' });
    else {
      ops.push({ kind: 'clear' });
      live = 0;
    }
  }
  return { build, ops };
}

describe.each(['min', 'max'] as const)('heapTrace (%s heap)', (mode) => {
  const cases = (mode === 'min' ? fixtures.minHeap : fixtures.maxHeap) as unknown as FixtureCase[];

  it(`reproduces every ${mode === 'min' ? 'MinHeap' : 'MaxHeap'} array and return value of the Python fixture`, () => {
    expect(cases.length).toBeGreaterThanOrEqual(50);
    for (const c of cases) {
      const run = heapTrace({ build: c.build, ops: c.ops.map(toOp) }, mode);
      expect(run.initial, JSON.stringify(c.build)).toEqual(c.initial);
      expect(run.steps.map((s) => ({ result: s.result, error: s.error, heap: s.heap }))).toEqual(c.steps);
    }
  });

  it('agrees with a sorted-array model on random scripts, and the heap order holds after every operation', () => {
    const rand = rng(mode === 'min' ? 41 : 42);
    for (let t = 0; t < 150; t++) {
      const input = randomInput(rand);
      const run = heapTrace(input, mode);
      const model = [...(input.build ?? [])];
      expect([...run.initial].sort((a, b) => a - b)).toEqual([...model].sort((a, b) => a - b));
      expect(heapOrdered(run.initial, mode)).toBe(true);
      input.ops.forEach((op, i) => {
        const step = run.steps[i];
        model.sort((a, b) => (mode === 'min' ? a - b : b - a));
        if (op.kind === 'insert') model.push(op.value);
        else if (op.kind === 'extract' || op.kind === 'peek') {
          if (model.length === 0) expect(step.error).toBe('IndexError');
          else expect(step.result).toBe(String(op.kind === 'extract' ? model.shift() : model[0]));
        } else if (op.kind === 'size') expect(step.result).toBe(String(model.length));
        else if (op.kind === 'is_empty') expect(step.result).toBe(model.length === 0 ? 'True' : 'False');
        else model.length = 0;
        expect([...step.heap].sort((a, b) => a - b)).toEqual([...model].sort((a, b) => a - b));
        expect(heapOrdered(step.heap, mode)).toBe(true);
      });
      expectWellFormed(run.frames, heapPseudocode(mode).length);
      // The last frame shows the final array.
      const last = run.frames[run.frames.length - 1].state.slots.map((s) => Number(s!.label));
      expect(last).toEqual(run.steps.length ? run.steps[run.steps.length - 1].heap : run.initial);
    }
  });

  it('keeps an entry id while it moves, so a sift glides', () => {
    const run = heapTrace(parseHeapScript('insert 5, insert 3, insert 8, insert 1'), mode);
    const idOf = new Map<string | number, string | number>();
    for (const f of run.frames) {
      for (const s of f.state.slots) {
        const prev = idOf.get(s!.id);
        if (prev !== undefined) expect(s!.label).toBe(prev);
        idOf.set(s!.id, s!.label);
      }
    }
  });
});

describe('heapTrace details', () => {
  it('builds the article example bottom-up: [9, 5, 7, 1, 3, 8, 2] becomes [1, 3, 2, 5, 9, 8, 7]', () => {
    const run = heapTrace(parseHeapScript('build 9 5 7 1 3 8 2'), 'min');
    expect(run.initial).toEqual([1, 3, 2, 5, 9, 8, 7]);
    // _heapify visits i = 2, 1, 0
    const visits = run.frames.filter((f) => f.line === 20 && f.caption.startsWith('_heapify: i =')).map((f) => f.caption.slice(14, 15));
    expect(visits).toEqual(['2', '1', '0']);
  });

  it('lets the left child win a tie in _heapify_down and never swaps equal keys', () => {
    expect(heapTrace(parseHeapScript('build 2 1 1'), 'min').initial).toEqual([1, 2, 1]);
    expect(heapTrace(parseHeapScript('build 1 2 2'), 'max').initial).toEqual([2, 1, 2]);
    const run = heapTrace(parseHeapScript('insert 4, insert 4, insert 4'), 'min');
    expect(run.frames.some((f) => f.caption.includes('Equal keys never swap'))).toBe(true);
    expect(run.steps[2].heap).toEqual([4, 4, 4]);
  });

  it('raises IndexError on an empty heap and goes on', () => {
    const run = heapTrace(parseHeapScript('extract, peek, insert 1, extract'), 'max');
    expect(run.steps.map((s) => s.error)).toEqual(['IndexError', 'IndexError', null, null]);
    expect(run.steps[3].result).toBe('1');
    expect(run.frames.some((f) => f.caption.includes('extract_max raises IndexError("Heap is empty")'))).toBe(true);
  });
});

describe('parseHeapScript', () => {
  it('reads builds, calls, short forms and lists', () => {
    expect(parseHeapScript('build [9, 5, 7]; insert(4), 3, extract_min, peek, size, is_empty, clear')).toEqual({
      build: [9, 5, 7],
      ops: [{ kind: 'insert', value: 4 }, { kind: 'insert', value: 3 }, { kind: 'extract' }, { kind: 'peek' }, { kind: 'size' }, { kind: 'is_empty' }, { kind: 'clear' }],
    });
    expect(splitOps('build(1, 2), insert 3')).toEqual(['build(1, 2)', 'insert 3']);
    expect(parseHeapScript('build').build).toEqual([]);
  });

  it('rejects what the picture or the constructor cannot take', () => {
    expect(() => parseHeapScript('insert 1, build 2 3')).toThrow(InputError);
    expect(() => parseHeapScript('insert 1000')).toThrow(/out of range/);
    expect(() => parseHeapScript('insert x')).toThrow(InputError);
    expect(() => parseHeapScript('frobnicate')).toThrow(/Cannot read/);
    expect(() => parseHeapScript('peek 3')).toThrow(/takes no value/);
    expect(() => parseHeapScript(Array.from({ length: 16 }, (_, i) => `insert ${i}`).join(', '))).toThrow(/At most 15/);
    expect(() => parseHeapScript(`build ${Array.from({ length: 16 }, (_, i) => i).join(' ')}`)).toThrow(/at most 15/);
    expect(() => parseHeapScript('')).toThrow(InputError);
  });
});
