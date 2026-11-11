import { ForestView, type ForestState } from '../renderers/ForestView';
import type { VizSpec } from '../core/types';
import { parseDsu, unionFind as unionFindTrace, type DsuInput } from '../algorithms/unionFind';

function randomOps(): string {
  const n = 6 + Math.floor(Math.random() * 5);
  const el = () => Math.floor(Math.random() * n);
  const ops: string[] = [];
  const count = 7 + Math.floor(Math.random() * 4);
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    ops.push(r < 0.6 ? `union ${el()} ${el()}` : r < 0.8 ? `find ${el()}` : `connected ${el()} ${el()}`);
  }
  return `n ${n}; ${ops.join(', ')}`;
}

export const unionFind: VizSpec<DsuInput, ForestState> = {
  id: 'union-find',
  title: 'Union-Find (Disjoint Sets)',
  inputKind: 'dsu',
  inputLabel: 'Elements and operations',
  inputHelp:
    'Start with the number of elements ("n 8"), then operations separated by commas: "union 0 1", "find 3" or "connected 0 3" (u, f, c for short). Up to 16 elements and 30 operations.',
  examples: [
    { label: 'Merge pairs, then halves', value: 'n 8; union 0 1, union 2 3, union 0 2, union 4 5, union 6 7, union 4 6, union 0 4, connected 3 7' },
    { label: 'Path compression', value: 'n 6; union 0 1, union 2 3, union 4 5, union 0 2, union 0 4, find 5, find 3' },
    { label: 'Redundant union (cycle)', value: 'n 4; union 0 1, union 1 2, union 0 2, connected 0 2' },
    { label: 'Singletons', value: 'n 5; find 3, connected 0 1, union 0 1, connected 0 1' },
    { label: 'Chain of unions', value: 'n 7; union 0 1, union 1 2, union 2 3, union 3 4, union 4 5, union 5 6, find 6' },
  ],
  randomInput: randomOps,
  parse: (text) => parseDsu(text),
  trace: (input) => unionFindTrace(input).frames,
  render: (state) => <ForestView state={state} />,
  pseudocode: [
    'find(x): follow parent pointers up to the root',
    '  if parent[x] != x:                 // x is not a root, climb',
    '    parent[x] = find(parent[x])      // path compression',
    '  return parent[x]                   // the root',
    'union(x, y): rx = find(x); ry = find(y)',
    '  if rx == ry: return False          // already one set',
    '  // two different roots: hang the lower-rank tree under the other',
    '  if rank[rx] < rank[ry]: parent[rx] = ry',
    '  elif rank[rx] > rank[ry]: parent[ry] = rx',
    '  else: parent[ry] = rx; rank[rx] += 1   // only a tie makes a tree taller',
    '  count -= 1; return True',
    'connected(x, y): return find(x) == find(y)',
  ],
  legend: [
    { role: 'active', label: 'element being looked at or re-pointed' },
    { role: 'compare', label: 'on the path to the root' },
    { role: 'done', label: 'root (set representative)' },
    { role: 'good', label: 'connected' },
    { role: 'bad', label: 'not connected / redundant union' },
    { role: 'idle', label: 'untouched' },
  ],
  complexity: { time: 'O(alpha(n)) amortized per operation', space: 'O(n)' },
};
