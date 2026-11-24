import { HEAP_LIMITS, heapPseudocode, heapTrace, parseHeapScript, type HeapInput, type HeapMode } from '../algorithms/binaryHeap';
import { FIB_CODE, FIB_LIMITS, fibTrace, parseFibScript, type FibOp } from '../algorithms/fibonacciHeap';
import type { Example, VizSpec } from '../core/types';
import { FibonacciHeapView, stabilizeFib, type FibHeapState } from '../renderers/FibonacciHeapView';
import { HeapView, stabilizeHeap, type HeapState } from '../renderers/HeapView';

const rint = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));

/** A random heap script: a few inserts, then a mix that keeps the heap within the limits. */
function randomHeapScript(withBuild: boolean): string {
  const parts: string[] = [];
  let live = 0;
  if (withBuild && Math.random() < 0.4) {
    const n = rint(4, 10);
    parts.push(`build ${Array.from({ length: n }, () => rint(1, 40)).join(' ')}`);
    live = n;
  }
  const count = rint(6, 14);
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    if ((r < 0.6 && live < HEAP_LIMITS.maxSize - 1) || live === 0) {
      parts.push(`insert ${rint(1, 40)}`);
      live += 1;
    } else if (r < 0.92) {
      parts.push('extract');
      live -= 1;
    } else parts.push('peek');
  }
  return parts.join(', ');
}

const HEAP_HELP =
  'Operations separated by commas: "insert 5" (or just "5"), "extract" (extract_min / extract_max), "peek", "size", "is_empty", "clear". ' +
  'Start with "build 9 5 7 1" to call the constructor with a list, which heapifies it bottom-up. Values are integers from -99 to 999; ' +
  `at most ${HEAP_LIMITS.maxSize} values at once and ${HEAP_LIMITS.maxOps} operations. The three heap tabs share the script.`;

function binaryHeapSpec(mode: HeapMode, examples: Example[]): VizSpec<HeapInput, HeapState> {
  const max = mode === 'max';
  return {
    id: max ? 'max-heap' : 'min-heap',
    title: max ? 'Max Heap' : 'Min Heap',
    inputKind: 'heap-ops',
    inputLabel: 'Operations',
    inputHelp: HEAP_HELP,
    examples,
    randomInput: () => randomHeapScript(true),
    parse: parseHeapScript,
    trace: (input) => stabilizeHeap(heapTrace(input, mode).frames),
    render: (state) => <HeapView state={state} />,
    pseudocode: heapPseudocode(mode),
    legend: [
      { role: 'active', label: 'element being sifted up or down' },
      { role: 'compare', label: 'parent or children it is compared with' },
      { role: 'done', label: max ? 'the root (the maximum), settled or returned' : 'the root (the minimum), settled or returned' },
    ],
    complexity: { time: 'O(log n) insert and extract, O(1) peek, O(n) build from a list', space: 'O(n), the list itself' },
  };
}

export const minHeapSpec = binaryHeapSpec('min', [
  { label: 'Insert: sift up', value: 'insert 5, insert 3, insert 8, insert 1, insert 9, insert 2' },
  { label: 'Build bottom-up (heapify)', value: 'build 9 5 7 1 3 8 2' },
  { label: 'Extract: sift down', value: 'build 1 3 2 5 9 8 7; extract, extract, extract' },
  { label: 'Ties and duplicates', value: 'build 2 1 1; insert 1, insert 1, extract, extract' },
  { label: 'Empty heap and one element', value: 'extract, peek, insert 7, extract, is_empty' },
]);

export const maxHeapSpec = binaryHeapSpec('max', [
  { label: 'Insert: sift up', value: 'insert 3, insert 5, insert 1, insert 8, insert 9, insert 2' },
  { label: 'Build bottom-up (heapify)', value: 'build 1 3 2 5 9 8 7' },
  { label: 'Extract: largest first', value: 'build 9 5 7 1 3 8 2; extract, extract, extract, extract' },
  { label: 'Ties and duplicates', value: 'build 1 2 2; insert 2, insert 2, extract, extract' },
  { label: 'Empty heap and one element', value: 'extract, peek, insert 7, extract, is_empty' },
]);

/**
 * A random Fibonacci heap script: inserts and one extract to build trees, then decrease_key,
 * delete, extract, insert and merge. A model of the keys keeps track of the live handles, so
 * decrease_key and delete always name a node in the heap, and most decrease_key calls really cut.
 * The live keys stay distinct, so the model knows which node extract_min removes and the count
 * never passes the limit.
 */
function randomFibScript(): string {
  const parts: string[] = [];
  /** handle name (the insert key) -> its key now, for the handles that are live */
  const live = new Map<number, number>();
  const taken = (k: number) => [...live.values()].includes(k);
  const add = (k: number) => {
    if (live.has(k) || taken(k)) return false;
    live.set(k, k);
    return true;
  };
  const extract = () => {
    parts.push('extract');
    let best: number | null = null;
    for (const [h, k] of live) if (best === null || k < live.get(best)!) best = h;
    if (best !== null) live.delete(best);
  };
  for (let n = rint(5, 10); n > 0; n--) {
    const k = rint(1, 40);
    if (add(k)) parts.push(`insert ${k}`);
  }
  extract();
  for (let n = rint(4, 9); n > 0; n--) {
    const r = Math.random();
    const names = [...live.keys()];
    if (names.length === 0 || (r < 0.1 && live.size < FIB_LIMITS.maxSize)) {
      const k = rint(1, 40);
      if (add(k)) parts.push(`insert ${k}`);
    } else if (r < 0.65) {
      const h = names[rint(0, names.length - 1)];
      const to = live.get(h)! - rint(1, 15);
      if (to < -99 || taken(to)) continue;
      parts.push(`decrease_key ${h} ${to}`);
      live.set(h, to);
    } else if (r < 0.75) {
      const h = names[rint(0, names.length - 1)];
      parts.push(`delete ${h}`);
      live.delete(h);
    } else if (r < 0.85 && live.size < FIB_LIMITS.maxSize - 3) {
      const more = Array.from({ length: rint(1, 3) }, () => rint(1, 40)).filter(add);
      parts.push(`merge ${more.join(' ')}`);
    } else extract();
  }
  return parts.join(', ');
}

export const fibonacciHeapSpec: VizSpec<FibOp[], FibHeapState> = {
  id: 'fibonacci-heap',
  title: 'Fibonacci Heap',
  inputKind: 'heap-ops',
  inputLabel: 'Operations',
  inputHelp:
    'Operations separated by commas: "insert 5" (or just "5"), "extract" (extract_min), "peek", "size", "is_empty", "clear", ' +
    '"decrease_key 9 2", "delete 9" and "merge 4 8 1" (a second heap holding 4, 8 and 1, merged in). insert returns a handle, named after the key it was inserted with: ' +
    '"decrease_key 9 2" lowers the node inserted as 9 to 2, whatever its key is now. Keys are integers from -99 to 999; at most 15 keys at once and 30 operations. ' +
    'The class has no build-from-array, so "build" shows the TypeError its constructor raises.',
  examples: [
    { label: 'Seven inserts, then consolidate', value: 'insert 5, insert 3, insert 7, insert 1, insert 9, insert 2, insert 8, extract, extract' },
    { label: 'Decrease-key and a cascading cut', value: '0, 1, 2, 3, 4, 5, 6, 7, 8, extract, decrease_key 8 0, decrease_key 6 3, decrease_key 7 1, extract' },
    { label: 'Delete a node', value: '0, 1, 2, 3, 4, 5, 6, 7, 8, extract, decrease_key 6 0, delete 7, delete 4, extract' },
    { label: 'Merge two heaps', value: 'insert 5, insert 3, insert 7, merge 4 1 6, extract' },
    { label: 'Binomial trees from 1 to 9', value: '1, 2, 3, 4, 5, 6, 7, 8, 9, extract, extract' },
    { label: 'Equal keys', value: 'insert 4, insert 4, insert 4, insert 4, insert 4, extract, extract' },
    { label: 'Errors and stale handles', value: 'build 3 1 2, extract, insert 4, insert 9, extract, decrease_key 4 1, decrease_key 9 12, delete 9, delete 9' },
  ],
  randomInput: randomFibScript,
  parse: parseFibScript,
  trace: (ops) => stabilizeFib(fibTrace(ops).frames),
  render: (state) => <FibonacciHeapView state={state} />,
  pseudocode: FIB_CODE,
  legend: [
    { role: 'active', label: 'node being inserted, cut, promoted or placed' },
    { role: 'compare', label: 'tree of the same degree, about to be linked; the parent that loses a child' },
    { role: 'done', label: 'min_node, or the key returned' },
    { role: 'bad', label: 'node being deleted, or a decrease_key that is refused' },
    { role: 'muted', label: 'degree_table slot just emptied by a link' },
    { role: 'idle', label: 'dashed outline and a * at its corner: a marked node, which lost a child since it was linked under its parent' },
  ],
  complexity: {
    time: 'O(1) insert, peek and merge; O(1) amortized decrease_key; O(log n) amortized extract_min and delete',
    space: 'O(n), four pointers per node',
  },
};
