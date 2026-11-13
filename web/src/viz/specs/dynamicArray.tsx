import type { VizSpec } from '../core/types';
import { parseArrayOps, traceDynamicArray, type ArrayOp } from '../algorithms/dynamicArray';
import { DynamicArrayView, stabilizeArray, type DynamicArrayState } from '../renderers/DynamicArrayView';

function randomOps(): string {
  const appends = 3 + Math.floor(Math.random() * 7);
  const values = Array.from({ length: appends }, () => 1 + Math.floor(Math.random() * 99));
  const ops = [`append ${values.join(' ')}`];
  const pops = Math.floor(Math.random() * (appends + 1));
  if (pops > 0) ops.push(pops === 1 ? 'pop' : `pop x${pops}`);
  const left = appends - pops;
  ops.push(`get ${Math.floor(Math.random() * (left + 2))}`);
  if (Math.random() < 0.5) ops.push(`append ${1 + Math.floor(Math.random() * 99)}`);
  return ops.join(', ');
}

export const dynamicArray: VizSpec<ArrayOp[], DynamicArrayState> = {
  id: 'dynamic-array',
  title: 'Dynamic Array',
  inputKind: 'dynamic-array-ops',
  inputLabel: 'Operations',
  inputHelp:
    'Operations separated by commas: "append 10 20 30" appends each value, "pop" removes the last one ("pop x3" three times), "get 2" (or "a[2]") reads index 2. Up to 40 operations and 16 elements.',
  examples: [
    { label: 'Nine appends, seven pops', value: 'append 10 20 30 40 50 60 70 80 90, pop x7' },
    { label: 'Grow 1, 2, 4, 8', value: 'append 1 2 3 4 5, get 4' },
    { label: 'Sixteen in, twelve out', value: 'append 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16, pop x12, get 3' },
    { label: 'IndexError cases', value: 'pop, append 7 8 9, get 2, get 3, get -1, pop x4' },
    { label: 'Boundary: no thrashing', value: 'append 1 2 3 4, append 5, pop, append 5, pop' },
  ],
  randomInput: randomOps,
  parse: (text) => parseArrayOps(text),
  trace: (ops) => stabilizeArray(traceDynamicArray(ops).frames),
  render: (state) => <DynamicArrayView state={state} />,
  pseudocode: [
    'append(value):',
    '  if self._n == self._capacity:                # full?',
    '    self._resize(2 * self._capacity)           # double',
    '  self._A[self._n] = value; self._n += 1',
    'pop():',
    "  if self._n == 0: raise IndexError('Pop from empty array')",
    '  val = self._A[self._n - 1]',
    '  self._A[self._n - 1] = None                  # drop the reference',
    '  self._n -= 1',
    '  if 0 < self._n <= self._capacity // 4:       # a quarter full?',
    '    self._resize(self._capacity // 2)          # halve',
    '  return val',
    '_resize(new_capacity):',
    '  B = [None] * new_capacity',
    '  for i in range(self._n): B[i] = self._A[i]',
    '  self._A = B; self._capacity = new_capacity',
    '__getitem__(k):',
    "  if not 0 <= k < self._n: raise IndexError('Index out of range')",
    '  return self._A[k]',
  ],
  legend: [
    { role: 'active', label: 'value being written or copied / the new block' },
    { role: 'compare', label: 'value being read or removed' },
    { role: 'good', label: 'value returned' },
    { role: 'bad', label: 'IndexError' },
    { role: 'muted', label: 'stale copy left in the old block' },
  ],
  complexity: { time: 'append O(1) amortized (O(n) when it resizes); pop O(1) amortized; a[k] O(1)', space: 'O(n): at most 4n slots after a shrink' },
};
