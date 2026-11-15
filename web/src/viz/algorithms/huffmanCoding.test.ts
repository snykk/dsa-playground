import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import type { HuffmanState } from '../renderers/HuffmanForest';
import { HUFFMAN_CODE, huffmanTrace, parseHuffman, reprChar, type HeapEvent, type HuffNode } from './huffmanCoding';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/greedyAndField.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/**
 * Reference model: CPython's Lib/heapq.py written out as plainly as possible (heappush,
 * heappop, _siftdown, _siftup), used on [freq, number] pairs compared by freq only, the way
 * HuffmanNode.__lt__ compares. The tracer must make exactly the same moves.
 */
type Item = { freq: number; n: number };
function siftdown(heap: Item[], startpos: number, pos: number) {
  const newitem = heap[pos];
  while (pos > startpos) {
    const parentpos = (pos - 1) >> 1;
    const parent = heap[parentpos];
    if (newitem.freq < parent.freq) {
      heap[pos] = parent;
      pos = parentpos;
      continue;
    }
    break;
  }
  heap[pos] = newitem;
}
function siftup(heap: Item[], pos: number) {
  const endpos = heap.length;
  const startpos = pos;
  const newitem = heap[pos];
  let childpos = 2 * pos + 1;
  while (childpos < endpos) {
    const rightpos = childpos + 1;
    if (rightpos < endpos && !(heap[childpos].freq < heap[rightpos].freq)) childpos = rightpos;
    heap[pos] = heap[childpos];
    pos = childpos;
    childpos = 2 * pos + 1;
  }
  heap[pos] = newitem;
  siftdown(heap, startpos, pos);
}
function modelLog(text: string): HeapEvent[] {
  const log: HeapEvent[] = [];
  const heap: Item[] = [];
  const counts = new Map<string, number>();
  for (const c of text) counts.set(c, (counts.get(c) ?? 0) + 1);
  let next = 0;
  const push = (item: Item) => {
    heap.push(item);
    siftdown(heap, 0, heap.length - 1);
    log.push(['push', item.n, heap.map((h) => h.n)]);
  };
  const pop = (): Item => {
    const last = heap.pop()!;
    let out = last;
    if (heap.length) {
      out = heap[0];
      heap[0] = last;
      siftup(heap, 0);
    }
    log.push(['pop', out.n, heap.map((h) => h.n)]);
    return out;
  };
  for (const f of counts.values()) push({ freq: f, n: next++ });
  while (heap.length > 1) {
    const a = pop();
    const b = pop();
    push({ freq: a.freq + b.freq, n: next++ });
  }
  return log;
}

/** The optimal total length, found independently: re-sort and merge the two smallest weights (no heap, no ties to break). */
function optimalBits(text: string): number {
  const w = [...new Map([...text].map((c) => [c, [...text].filter((d) => d === c).length])).values()];
  if (w.length === 1) return text.length;
  let cost = 0;
  while (w.length > 1) {
    w.sort((a, b) => a - b);
    const s = w.shift()! + w.shift()!;
    cost += s;
    w.push(s);
  }
  return cost;
}

/** huffman_decode: follow 0 left / 1 right from the root, emit at a leaf; a lone leaf repeats its symbol. */
function decode(bits: string, root: HuffNode | null): string {
  if (!root) return '';
  if (root.char !== null) return bits ? root.char.repeat(bits.length) : '';
  let out = '';
  let cur: HuffNode = root;
  for (const b of bits) {
    cur = (b === '0' ? cur.left : cur.right)!;
    if (cur.char !== null) {
      out += cur.char;
      cur = root;
    }
  }
  return out;
}

function expectWellFormed(frames: Array<Frame<HuffmanState>>) {
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(20);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(HUFFMAN_CODE.length);
    }
    const ids = f.state.nodes.map((n) => n.id);
    expect(new Set(ids).size, f.caption).toBe(ids.length);
    const drawn = new Set(ids);
    for (const n of f.state.nodes) {
      if (n.left !== null) expect(drawn.has(n.left)).toBe(true);
      if (n.right !== null) expect(drawn.has(n.right)).toBe(true);
    }
    for (const id of [...f.state.heap, ...f.state.loose.map((l) => l.id)]) expect(drawn.has(id), f.caption).toBe(true);
    // A tree is either in the heap or loose, never both.
    expect(new Set([...f.state.heap, ...f.state.loose.map((l) => l.id)]).size).toBe(f.state.heap.length + f.state.loose.length);
  }
}

function randomText(rand: () => number): string {
  const alphabet = 'abcdefghijkl .!';
  const k = 1 + Math.floor(rand() * 12);
  const symbols = [...alphabet].sort(() => rand() - 0.5).slice(0, k);
  const n = 1 + Math.floor(rand() * 64);
  return Array.from({ length: n }, () => symbols[Math.floor(rand() * rand() * symbols.length)]).join('');
}

describe('huffmanTrace matches build_huffman_tree / build_codes / huffman_encode (golden fixtures)', () => {
  const cases = fixtures.huffman as Array<{ text: string; log: HeapEvent[]; codes: Array<[string, string]>; encoded: string; ratio: number; savings: number }>;
  it('reproduces every heappush / heappop, the code table in dict order, the bits and the ratio', () => {
    expect(cases.length).toBeGreaterThanOrEqual(100);
    for (const c of cases) {
      const run = huffmanTrace({ text: c.text });
      expect(run.log, c.text).toEqual(c.log);
      expect(run.codes, c.text).toEqual(c.codes);
      expect(run.encoded).toBe(c.encoded);
      expect(run.ratio).toBe(c.ratio);
      expect(run.savings).toBe(c.savings);
    }
  });
});

describe('huffmanTrace against reference models', () => {
  it('makes heapq\'s moves, builds an optimal prefix-free code and round-trips, on random texts', () => {
    const rand = rng(42);
    for (let t = 0; t < 300; t++) {
      const text = randomText(rand);
      const run = huffmanTrace({ text });
      expect(run.log, text).toEqual(modelLog(text));
      const words = run.codes.map(([, w]) => w);
      for (const a of words) for (const b of words) if (a !== b) expect(b.startsWith(a), `${text}: ${a} prefixes ${b}`).toBe(false);
      expect(run.encoded.length, text).toBe(optimalBits(text));
      if (words.length > 1) expect(words.reduce((s, w) => s + 2 ** -w.length, 0)).toBeCloseTo(1, 12);
      expect(decode(run.encoded, run.root)).toBe(text);
      expect(run.ratio).toBe(run.encoded.length / (text.length * 8));
      expectWellFormed(run.frames);
      // The heap drawn in every frame is a valid min-heap on frequency once a push or pop has finished.
      const last = run.frames[run.frames.length - 1].state;
      expect(last.heap.length).toBe(1);
      expect(last.loose).toEqual([]);
    }
  });
});

describe('huffmanTrace scenarios', () => {
  it('the textbook frequencies 45, 13, 12, 16, 9, 5 give the unique table of the Python test', () => {
    const run = huffmanTrace(parseHuffman('freq a:45, b:13, c:12, d:16, e:9, f:5'));
    expect(Object.fromEntries(run.codes)).toEqual({ a: '0', c: '100', b: '101', f: '1100', e: '1101', d: '111' });
    expect(run.encoded.length).toBe(224);
    // The encode phase takes one step per run, not one per character.
    expect(run.frames.filter((f) => f.caption.startsWith('Encode the run')).length).toBe(6);
  });

  it('one symbol gets the code "0"; the empty text builds nothing', () => {
    const one = huffmanTrace(parseHuffman('aaaa'));
    expect(one.codes).toEqual([['a', '0']]);
    expect(one.encoded).toBe('0000');
    expect(one.frames.some((f) => f.caption.includes('stores "0" instead'))).toBe(true);
    const empty = huffmanTrace(parseHuffman('""'));
    expect([empty.root, empty.encoded, empty.ratio, empty.savings]).toEqual([null, '', 0, 100]);
    expect(empty.frames.length).toBe(1);
  });

  it('breaks ties the way heapq does: on "abracadabra" the merged [2] pops before the leaf c 1', () => {
    const run = huffmanTrace({ text: 'abracadabra' });
    // a 5, b 2, r 2, c 1, d 1: after the pushes the heap is [c, d, r, a, b] by node number [3, 4, 2, 0, 1].
    expect(run.log[4]).toEqual(['push', 4, [3, 4, 2, 0, 1]]);
    expect(run.codes).toEqual([
      ['a', '0'],
      ['c', '100'],
      ['d', '101'],
      ['r', '110'],
      ['b', '111'],
    ]);
    // A tie on the way down takes the right child, and the caption says why.
    expect(run.frames.some((f) => f.caption.includes('the right one'))).toBe(true);
  });

  it('a merged tree carries the first pop on edge 0 and the second on edge 1, and trees glide (same ids)', () => {
    const run = huffmanTrace({ text: 'aaaaabbbcc' });
    const merge = run.frames.find((f) => f.caption.startsWith('merged = HuffmanNode(freq = 2 + 3'))!;
    const root = merge.state.nodes.find((n) => n.symbol === null && n.freq === 5)!;
    const left = merge.state.nodes.find((n) => n.id === root.left)!;
    const right = merge.state.nodes.find((n) => n.id === root.right)!;
    expect([left.symbol, right.symbol]).toEqual(['c', 'b']);
    expect(merge.state.loose).toEqual([{ id: root.id, tag: 'merged' }]);
  });

  it('stays well under 2000 frames on the largest inputs', () => {
    const longest = 'abcdefghijkl'.repeat(6).slice(0, 64);
    expect(huffmanTrace(parseHuffman(longest)).frames.length).toBeLessThan(2000);
    const runs = huffmanTrace(parseHuffman('freq a:1, b:1, c:2, d:3, e:5, f:8, g:13, h:21, i:1, j:1, k:2, l:42'));
    expect(runs.frames.length).toBeLessThan(2000);
  });
});

describe('parseHuffman', () => {
  it('reads plain text, quoted text and counts', () => {
    expect(parseHuffman('  abracadabra ')).toEqual({ text: 'abracadabra' });
    expect(parseHuffman('"to be "')).toEqual({ text: 'to be ' });
    expect(parseHuffman('""')).toEqual({ text: '' });
    expect(parseHuffman('freq a:3, b=2 c:1')).toEqual({
      text: 'aaabbc',
      runs: [
        ['a', 3],
        ['b', 2],
        ['c', 1],
      ],
    });
    expect(reprChar("'")).toBe(`"'"`);
  });

  it('gives friendly errors', () => {
    expect(() => parseHuffman('')).toThrow(InputError);
    expect(() => parseHuffman('x'.repeat(65))).toThrow(/64 characters/);
    expect(() => parseHuffman('abcdefghijklm')).toThrow(/12 different symbols/);
    expect(() => parseHuffman('freq a:0')).toThrow(/1 to 99/);
    expect(() => parseHuffman('freq a:60 b:60')).toThrow(/100 or less/);
    expect(() => parseHuffman('freq a:3, a:2')).toThrow(/twice/);
    expect(() => parseHuffman('freq a3')).toThrow(/a:45/);
    expect(() => parseHuffman(`caf${String.fromCodePoint(0xe9)}`)).toThrow(/ASCII/);
  });
});
