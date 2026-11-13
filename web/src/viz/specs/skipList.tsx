import type { VizSpec } from '../core/types';
import { parseSkipList, traceSkipList, type SkipInput } from '../algorithms/skipList';
import { ChainView, stabilizeChain, type ChainState } from '../renderers/ChainView';

/** The six keys of the article's figures, with their towers fixed: 3 on levels 0-1, 6 on 0-2, ... */
const ARTICLE_LIST = 'insert 3^1 6^2 9^0 12^1 19^0 25^3';

function randomInput(): string {
  const keys = new Set<number>();
  const count = 5 + Math.floor(Math.random() * 3);
  while (keys.size < count) keys.add(1 + Math.floor(Math.random() * 40));
  const list = [...keys];
  const hit = list[Math.floor(Math.random() * list.length)];
  const miss = 41 + Math.floor(Math.random() * 9);
  const gone = list[Math.floor(Math.random() * list.length)];
  return `seed ${Math.floor(Math.random() * 1000)}; max 4; insert ${list.join(' ')}, search ${Math.random() < 0.6 ? hit : miss}, delete ${gone}`;
}

export const skipList: VizSpec<SkipInput, ChainState> = {
  id: 'skip-list',
  title: 'Skip List',
  inputKind: 'skip-list-ops',
  inputLabel: 'Settings and operations',
  inputHelp:
    'Operations separated by commas: "insert 6", "search 6", "delete 6" (i, s, d for short; "insert 3 6 9" inserts three). Coin flips come from a seeded generator: "seed 7" replays the same towers. "insert 6 level 2" or "insert 6^2" fixes the tower instead. Optional "p 0.5" and "max 16" set the coin and the cap, as in SkipList(max_level, p). Up to 24 operations and 10 keys.',
  examples: [
    { label: 'Search 19', value: `${ARTICLE_LIST}, search 19` },
    { label: 'Coin flips (seed 7)', value: 'seed 7; insert 3, insert 6, search 6, insert 9, insert 12, search 10' },
    { label: 'Insert 15, delete 6 and 25', value: `${ARTICLE_LIST}, insert 15^1, delete 6, delete 25` },
    { label: 'Duplicate and missing keys', value: 'seed 3; insert 5, insert 5, search 4, delete 10, delete 5' },
    { label: 'Capped at max_level 1', value: 'seed 1; max 1; insert 1 2 3 4 5 6, search 6' },
  ],
  randomInput,
  parse: (text) => parseSkipList(text),
  trace: (input) => stabilizeChain(traceSkipList(input).frames),
  render: (state) => <ChainView state={state} />,
  pseudocode: [
    'search(key):',
    '  current = self.header',
    '  for i in range(self.level, -1, -1):          # top level down to 0',
    '    while current.forward[i] and current.forward[i].key < key:',
    '      current = current.forward[i]             # move right',
    '  current = current.forward[0]',
    '  return current is not None and current.key == key',
    'insert(key):',
    '  (the same walk, saving update[i] = current before leaving level i)',
    '  current = current.forward[0]',
    '  if current and current.key == key: return    # no duplicates',
    '  new_level = self._random_level()   # lvl += 1 while random() < p and lvl < max_level',
    '  if new_level > self.level: update[i] = self.header above it; self.level = new_level',
    '  new_node = Node(key, new_level)',
    '  for i in range(new_level + 1):',
    '    new_node.forward[i] = update[i].forward[i]',
    '    update[i].forward[i] = new_node',
    'delete(key):',
    '  (the same walk, saving update[i])',
    '  current = current.forward[0]',
    '  if not current or current.key != key: return False',
    '  for i in range(self.level + 1):',
    '    if update[i].forward[i] != current: break',
    '    update[i].forward[i] = current.forward[i]',
    '  while self.level > 0 and self.header.forward[self.level] is None: self.level -= 1',
    '  return True',
  ],
  legend: [
    { role: 'active', label: 'current / the tower being inserted or deleted / a link just written' },
    { role: 'compare', label: 'next key, compared and too big' },
    { role: 'done', label: 'search path / tower in place' },
    { role: 'good', label: 'found' },
    { role: 'bad', label: 'not found / already present' },
  ],
  complexity: { time: 'O(log n) expected for search, insert and delete; O(n) worst case', space: 'O(n) expected: about n / (1 - p) links' },
};
