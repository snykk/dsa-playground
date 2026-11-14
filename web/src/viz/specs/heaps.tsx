import { HEAP_LIMITS, heapPseudocode, heapTrace, parseHeapScript, type HeapInput, type HeapMode } from '../algorithms/binaryHeap';
import { FIB_CODE, fibTrace, parseFibScript, type FibOp } from '../algorithms/fibonacciHeap';
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

export const fibonacciHeapSpec: VizSpec<FibOp[], FibHeapState> = {
  id: 'fibonacci-heap',
  title: 'Fibonacci Heap',
  inputKind: 'heap-ops',
  inputLabel: 'Operations',
  inputHelp:
    'Operations separated by commas: "insert 5" (or just "5"), "extract" (extract_min), "peek", "size", "is_empty", "clear". Keys are integers from -99 to 999; ' +
    'at most 15 keys at once and 30 operations. The class has no decrease_key, merge or build-from-array, so "build" shows the TypeError its constructor raises.',
  examples: [
    { label: 'Seven inserts, then consolidate', value: 'insert 5, insert 3, insert 7, insert 1, insert 9, insert 2, insert 8, extract, extract' },
    { label: 'Insert is lazy', value: 'insert 4, insert 9, insert 2, insert 7, insert 1, peek, size' },
    { label: 'Binomial trees from 1 to 9', value: '1, 2, 3, 4, 5, 6, 7, 8, 9, extract, extract' },
    { label: 'Equal keys', value: 'insert 4, insert 4, insert 4, insert 4, insert 4, extract, extract' },
    { label: 'Empty heap, no build', value: 'build 3 1 2, extract, insert 2, extract, is_empty' },
  ],
  randomInput: () => randomHeapScript(false),
  parse: parseFibScript,
  trace: (ops) => stabilizeFib(fibTrace(ops).frames),
  render: (state) => <FibonacciHeapView state={state} />,
  pseudocode: FIB_CODE,
  legend: [
    { role: 'active', label: 'node being inserted, promoted or placed' },
    { role: 'compare', label: 'tree of the same degree, about to be linked' },
    { role: 'done', label: 'min_node, or the key returned' },
    { role: 'muted', label: 'degree_table slot just emptied by a link' },
  ],
  complexity: { time: 'O(1) insert and peek, O(log n) amortized extract_min', space: 'O(n), four pointers per node' },
};
