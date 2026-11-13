/** Visualization registry: String matching. */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

export const entries: VizInfo[] = [
  {
    id: 'kmp',
    title: 'Knuth-Morris-Pratt',
    group: 'Strings',
    blurb: 'Build the failure (LPS) table, then reuse it so the text pointer never moves backwards.',
    topics: ['Algorithms/String_Algorithms/Pattern_Matching/KMP_Algorithm', 'Algorithms/String_Algorithms/Pattern_Matching'],
  },
  {
    id: 'naive-search',
    title: 'Naive Pattern Search',
    group: 'Strings',
    blurb: 'Slide the pattern one step at a time and compare from the left: simple, but O(n*m) in the worst case.',
    topics: ['Algorithms/String_Algorithms/Pattern_Matching/Naive_Pattern_Search', 'Algorithms/String_Algorithms/Pattern_Matching'],
  },
  {
    id: 'rabin-karp',
    title: 'Rabin-Karp',
    group: 'Strings',
    blurb: 'Roll a hash along the text and verify character by character only when the hashes agree.',
    topics: ['Algorithms/String_Algorithms/Pattern_Matching/Rabin_Karp_Algorithm', 'Algorithms/String_Algorithms/Pattern_Matching'],
  },
  {
    id: 'boyer-moore',
    title: 'Boyer-Moore (bad character)',
    group: 'Strings',
    blurb: 'Compare right to left and jump by the bad-character table, skipping most of the text.',
    topics: ['Algorithms/String_Algorithms/Pattern_Matching/Boyer_Moore_Algorithm', 'Algorithms/String_Algorithms/Pattern_Matching'],
  },
  {
    id: 'z-algorithm',
    title: 'Z-Algorithm',
    group: 'Strings',
    blurb: 'Build the Z-array of pattern$text, reusing the Z-box so every character is compared O(1) times.',
    topics: ['Algorithms/String_Algorithms/Advanced_String/Z_Algorithm', 'Algorithms/String_Algorithms/Advanced_String'],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  kmp: () => import('../specs/strings').then((m) => m.kmp),
  'naive-search': () => import('../specs/stringSearch').then((m) => m.naiveSearch),
  'rabin-karp': () => import('../specs/stringSearch').then((m) => m.rabinKarp),
  'boyer-moore': () => import('../specs/stringSearch').then((m) => m.boyerMoore),
  'z-algorithm': () => import('../specs/stringSearch').then((m) => m.zAlgorithm),
};
