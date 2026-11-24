/** Visualization registry: String matching and the advanced string algorithms. */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

const ADV = 'Algorithms/String_Algorithms/Advanced_String';

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
    topics: [`${ADV}/Z_Algorithm`, ADV],
  },
  {
    id: 'string-hashing',
    title: 'String Hashing',
    group: 'Strings',
    blurb: 'Build the prefix hashes and the powers of the base, then hash any substring in O(1) and find the common prefix of two suffixes by binary search on the length.',
    topics: [`${ADV}/String_Hashing`, ADV],
  },
  {
    id: 'aho-corasick',
    title: 'Aho-Corasick',
    group: 'Strings',
    blurb: 'Insert the patterns into a trie, link every node to its longest suffix in BFS order, then read the text once and report every match.',
    topics: [`${ADV}/Aho_Corasick`, ADV],
  },
  {
    id: 'suffix-array',
    title: 'Suffix Array',
    group: 'Strings',
    blurb: 'Sort every suffix, then find all occurrences of a pattern as one block of ranks with two binary searches.',
    topics: [`${ADV}/Suffix_Array`, ADV],
  },
  {
    id: 'manacher',
    title: "Manacher's Algorithm",
    group: 'Strings',
    blurb: 'Radius of the longest palindrome at every center of #a#b#a#, copied from the mirror inside the rightmost palindrome.',
    topics: [`${ADV}/Longest_Palindromic_Substring_Manachers`, ADV],
  },
  {
    id: 'longest-common-substring',
    title: 'Longest Common Substring',
    group: 'Strings',
    blurb: 'A table of matching-run lengths: equal characters extend the diagonal, a mismatch resets to 0, and the largest cell wins.',
    topics: [`${ADV}/Longest_Common_Substring`, ADV],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  kmp: () => import('../specs/strings').then((m) => m.kmp),
  'naive-search': () => import('../specs/stringSearch').then((m) => m.naiveSearch),
  'rabin-karp': () => import('../specs/stringSearch').then((m) => m.rabinKarp),
  'boyer-moore': () => import('../specs/stringSearch').then((m) => m.boyerMoore),
  'z-algorithm': () => import('../specs/stringSearch').then((m) => m.zAlgorithm),
  'string-hashing': () => import('../specs/advancedStrings').then((m) => m.stringHashingSpec),
  'aho-corasick': () => import('../specs/advancedStrings').then((m) => m.ahoCorasickSpec),
  'suffix-array': () => import('../specs/advancedStrings').then((m) => m.suffixArraySpec),
  manacher: () => import('../specs/advancedStrings').then((m) => m.manacherSpec),
  'longest-common-substring': () => import('../specs/advancedStrings').then((m) => m.longestCommonSubstringSpec),
};
