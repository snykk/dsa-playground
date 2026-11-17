/** Visualization registry: Contest problem types (constructive algorithms, game theory, interactive problems). */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

const P = 'Utilities/Problem_Types';

export const entries: VizInfo[] = [
  {
    id: 'constructive-permutation',
    title: 'Permutation with k distinct differences',
    group: 'Competitive Programming',
    blurb: 'Zig-zag 1, k+1, 2, k, ... so the differences shrink k, k-1, ..., 1, then climb by 1: exactly k distinct values.',
    topics: [`${P}/Constructive_Algorithms`, P],
  },
  {
    id: 'havel-hakimi',
    title: 'Graph from degrees (Havel-Hakimi)',
    group: 'Competitive Programming',
    blurb: 'Pop the node that needs the most edges, join it to the next largest from a heap, repeat; an empty heap too early means no graph exists.',
    topics: [`${P}/Constructive_Algorithms`],
  },
  {
    id: 'northwest-corner',
    title: 'Matrix from row and column sums',
    group: 'Competitive Programming',
    blurb: 'Fill from the top-left corner, each cell the most its row and column both still need: equal totals always work out.',
    topics: [`${P}/Constructive_Algorithms`],
  },
  {
    id: 'nim',
    title: 'Nim: XOR and the winning move',
    group: 'Competitive Programming',
    blurb: 'XOR the pile sizes column by column: non-zero means the player to move wins, by shrinking a pile to pile XOR total.',
    topics: [`${P}/Game_Theory`, P],
  },
  {
    id: 'sprague-grundy',
    title: 'Grundy numbers of a subtraction game',
    group: 'Competitive Programming',
    blurb: 'Each position gets the mex of the Grundy numbers its moves reach; several piles combine by XOR, like Nim.',
    topics: [`${P}/Game_Theory`],
  },
  {
    id: 'game-graph',
    title: 'Win, lose or draw on a game graph',
    group: 'Competitive Programming',
    blurb: 'Retrograde analysis: from the nodes with no move, a predecessor of a loss wins, a node whose moves all reach wins loses; the rest are draws.',
    topics: [`${P}/Game_Theory`],
  },
  {
    id: 'interactive-guess-number',
    title: 'Guess the number (binary search)',
    group: 'Competitive Programming',
    blurb: 'A judge holds a secret and answers higher or lower: each query halves the interval, within a query budget.',
    topics: [`${P}/Interactive_Problems`, P],
  },
  {
    id: 'interactive-find-maximum',
    title: 'Maximum by comparisons',
    group: 'Competitive Programming',
    blurb: 'Only "is a[i] > a[j]?" may be asked: keep the best index so far and compare every other index with it, n - 1 queries.',
    topics: [`${P}/Interactive_Problems`],
  },
  {
    id: 'interactive-tournament',
    title: 'Maximum by a tournament',
    group: 'Competitive Programming',
    blurb: 'Pair the candidates up round by round and send the larger on: the same n - 1 queries, in about log2 n batchable rounds.',
    topics: [`${P}/Interactive_Problems`],
  },
  {
    id: 'interactive-bit-by-bit',
    title: 'Hidden number bit by bit',
    group: 'Competitive Programming',
    blurb: 'Ask one mask per bit, "does the hidden number have bit b?", and assemble the answer from the replies.',
    topics: [`${P}/Interactive_Problems`],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  'constructive-permutation': () => import('../specs/problemTypes').then((m) => m.permutationSpec),
  'havel-hakimi': () => import('../specs/problemTypes').then((m) => m.havelHakimiSpec),
  'northwest-corner': () => import('../specs/problemTypes').then((m) => m.northwestCornerSpec),
  nim: () => import('../specs/problemTypes').then((m) => m.nimSpec),
  'sprague-grundy': () => import('../specs/problemTypes').then((m) => m.spragueGrundySpec),
  'game-graph': () => import('../specs/problemTypes').then((m) => m.gameGraphSpec),
  'interactive-guess-number': () => import('../specs/problemTypes').then((m) => m.guessNumberSpec),
  'interactive-find-maximum': () => import('../specs/problemTypes').then((m) => m.findMaximumSpec),
  'interactive-tournament': () => import('../specs/problemTypes').then((m) => m.tournamentSpec),
  'interactive-bit-by-bit': () => import('../specs/problemTypes').then((m) => m.bitByBitSpec),
};
