import { LFU_CODE, lfuTrace, LRU_CODE, lruTrace, parseCache, type CacheInput } from '../algorithms/cache';
import type { Example, VizSpec } from '../core/types';
import { ChainView, stabilizeChain, type ChainState } from '../renderers/ChainView';
import { SYM } from '../ui/symbols';

/** LRU and LFU share one script, so switching tabs replays the same operations under the other policy. */
const HELP =
  'Start with the capacity ("cap 2", 0 to 4), then operations separated by commas: "put 1 10" stores value 10 under key 1, "get 1" reads it (p and g for short). ' +
  'Keys and values are integers. Up to 30 operations. The same script runs in the LRU and LFU tabs.';

const BOTH: Example = { label: 'LRU vs LFU', value: 'cap 2; put 1 1, put 2 2, get 1, put 3 3, get 1, get 2, get 3, put 4 4, get 1, get 3, get 4' };

function randomCacheScript(): string {
  const cap = 2 + Math.floor(Math.random() * 3); // 2 to 4
  const keys = cap + 2;
  const ops: string[] = [];
  for (let i = 0; i < 9 + Math.floor(Math.random() * 4); i++) {
    const k = 1 + Math.floor(Math.random() * keys);
    ops.push(Math.random() < 0.55 || i < 2 ? `put ${k} ${k * 10 + (i % 10)}` : `get ${k}`);
  }
  return `cap ${cap}; ${ops.join(', ')}`;
}

export const lruCacheSpec: VizSpec<CacheInput, ChainState> = {
  id: 'lru-cache',
  title: 'LRU Cache',
  inputKind: 'cache',
  inputLabel: 'Capacity and operations',
  inputHelp: HELP,
  examples: [
    { label: 'LeetCode 146', value: 'cap 2; put 1 1, put 2 2, get 1, put 3 3, get 2, put 4 4, get 1, get 3, get 4' },
    { label: 'A get saves a key', value: 'cap 3; put 1 10, put 2 20, put 3 30, get 1, put 4 40, get 2, get 3' },
    { label: 'Update moves to front', value: 'cap 2; put 1 10, put 2 20, put 1 15, put 3 30, get 2, get 1' },
    BOTH,
    { label: 'Capacity 0', value: 'cap 0; put 1 10, get 1' },
  ],
  randomInput: randomCacheScript,
  parse: (text) => parseCache(text, 'lru'),
  trace: (input) => stabilizeChain(lruTrace(input).frames),
  render: (state) => <ChainView state={state} />,
  pseudocode: LRU_CODE,
  legend: [
    { role: 'compare', label: 'node found through the dict' },
    { role: 'active', label: 'node being moved or inserted' },
    { role: 'bad', label: `least recently used node, evicted (${SYM.cross})` },
    { role: 'idle', label: 'cached node (dashed: head and tail sentinels)' },
  ],
  complexity: { time: 'O(1) per get and put', space: 'O(capacity)' },
};

export const lfuCacheSpec: VizSpec<CacheInput, ChainState> = {
  id: 'lfu-cache',
  title: 'LFU Cache',
  inputKind: 'cache',
  inputLabel: 'Capacity and operations',
  inputHelp: HELP,
  examples: [
    { label: 'LeetCode 460', value: 'cap 2; put 1 1, put 2 2, get 1, put 3 3, get 2, get 3, put 4 4, get 1, get 3, get 4' },
    { label: 'Tie: least recent goes', value: 'cap 2; put 1 10, put 2 20, put 3 30, get 1, get 2, get 3' },
    { label: 'Hot key survives a scan', value: 'cap 3; put 1 10, get 1, get 1, put 2 20, put 3 30, put 4 40, put 5 50, get 1' },
    { label: 'min_freq climbs', value: 'cap 1; put 1 10, get 1, get 1, put 2 20, get 1, get 2' },
    BOTH,
  ],
  randomInput: randomCacheScript,
  parse: (text) => parseCache(text, 'lfu'),
  trace: (input) => stabilizeChain(lfuTrace(input).frames),
  render: (state) => <ChainView state={state} />,
  pseudocode: LFU_CODE,
  legend: [
    { role: 'compare', label: 'key found in key_to_val' },
    { role: 'active', label: 'key being promoted, updated or inserted' },
    { role: 'bad', label: `evicted: least recently used of the lowest count (${SYM.cross})` },
    { role: 'done', label: 'the min_freq bucket (lane marked min)' },
  ],
  complexity: { time: 'O(1) per get and put', space: 'O(capacity)' },
};
