/** Visualization registry: Hashing (hash tables, collision handling, Bloom filter, LRU / LFU caches). */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

const H = 'Data_Structures/Hashing';
const ADV = 'Data_Structures/Advanced_Structures';

export const entries: VizInfo[] = [
  {
    id: 'hash-table',
    title: 'Hash Table (separate chaining)',
    group: 'Hashing',
    blurb: 'Hash a key to its bucket and walk the chain; past a load of 0.75 the table doubles and every pair moves.',
    topics: [`${H}/Hash_Table`, H],
  },
  {
    id: 'separate-chaining',
    title: 'Separate chaining',
    group: 'Hashing',
    blurb: 'Colliding keys share a list in their bucket; the table never resizes, so chains just grow.',
    topics: [`${H}/Collision_Handling`, H],
  },
  {
    id: 'linear-probing',
    title: 'Linear probing',
    group: 'Hashing',
    blurb: 'A taken slot sends the key to the next one; removes leave tombstones that lookups walk past.',
    topics: [`${H}/Collision_Handling`, H],
  },
  {
    id: 'quadratic-probing',
    title: 'Quadratic probing',
    group: 'Hashing',
    blurb: 'Probe 1, 3, 6, 10... slots away (triangular steps), which reach every slot of a power-of-two table.',
    topics: [`${H}/Collision_Handling`, H],
  },
  {
    id: 'hash-set',
    title: 'Hash Set',
    group: 'Hashing',
    blurb: 'A chained table of bare keys: add reports duplicates, and the load factor triggers a doubling rehash.',
    topics: [`${H}/Hash_Set`, H],
  },
  {
    id: 'bloom-filter',
    title: 'Bloom Filter',
    group: 'Hashing',
    blurb: 'k md5 positions per item in a bit array: a 0 bit means definitely absent, all 1s only maybe.',
    topics: [`${H}/Bloom_Filter`, H],
  },
  {
    id: 'lru-cache',
    title: 'LRU Cache',
    group: 'Hashing',
    blurb: 'A dict into a doubly linked list: every use moves a node to the front, a full cache drops the back.',
    topics: [`${ADV}/LRU_Cache`, ADV],
  },
  {
    id: 'lfu-cache',
    title: 'LFU Cache',
    group: 'Hashing',
    blurb: 'One list per use count and min_freq: a use promotes a key, a full cache evicts the least recent of the least used.',
    topics: [`${ADV}/LFU_Cache`, ADV],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  'hash-table': () => import('../specs/hashing').then((m) => m.hashTableSpec),
  'separate-chaining': () => import('../specs/hashing').then((m) => m.separateChainingSpec),
  'linear-probing': () => import('../specs/hashing').then((m) => m.linearProbingSpec),
  'quadratic-probing': () => import('../specs/hashing').then((m) => m.quadraticProbingSpec),
  'hash-set': () => import('../specs/hashing').then((m) => m.hashSetSpec),
  'bloom-filter': () => import('../specs/hashing').then((m) => m.bloomFilterSpec),
  'lru-cache': () => import('../specs/cache').then((m) => m.lruCacheSpec),
  'lfu-cache': () => import('../specs/cache').then((m) => m.lfuCacheSpec),
};
