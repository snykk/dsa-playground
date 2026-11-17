import {
  GRAPH_CODE,
  graphTrace,
  parseDegrees,
  parsePerm,
  parseSums,
  PERM_CODE,
  permTrace,
  SUMS_CODE,
  sumsTrace,
  type MatrixSumsInput,
  type PermInput,
  type ZigzagState,
} from '../algorithms/constructive';
import {
  GAME_GRAPH_CODE,
  gameGraphTrace,
  GRUNDY_CODE,
  grundyTrace,
  NIM_CODE,
  nimTrace,
  parseGameGraph,
  parseGrundy,
  parseNim,
  type GameGraphInput,
  type GrundyInput,
} from '../algorithms/gameTheory';
import { JUDGE_CODE, judgeTrace, parseJudge, type JudgeInput, type JudgeMode } from '../algorithms/interactive';
import type { Example, VizSpec } from '../core/types';
import { GameGraphView, type GameGraphState } from '../renderers/GameGraphView';
import { Grid, type GridState } from '../renderers/Grid';
import { HavelHakimiView, type HavelHakimiState } from '../renderers/HavelHakimiView';
import { GrundyView, type GrundyState } from '../renderers/GrundyView';
import { JudgeView, type JudgeState } from '../renderers/JudgeView';
import { NimView, type NimState } from '../renderers/NimView';
import { withStripGhosts } from '../renderers/StableStrips';
import { ZigzagView } from '../renderers/ZigzagView';
import { SYM } from '../ui/symbols';

const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];
const rint = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));

/* ---------- Constructive algorithms ---------- */

export const permutationSpec: VizSpec<PermInput, ZigzagState> = {
  id: 'constructive-permutation',
  title: 'Permutation with k distinct differences',
  inputKind: 'constructive-permutation',
  inputLabel: 'n and k',
  inputHelp:
    'Two numbers: "n 7, k 3" asks construct_permutation(7, 3) for a permutation of 1..7 whose adjacent differences take exactly 3 distinct values. ' +
    'n goes up to 16; a k outside 1..n-1 (or anything but 0 when n = 1) returns None, as in the code.',
  examples: [
    { label: 'n 7, k 3 (the article)', value: 'n 7, k 3' },
    { label: 'k = n - 1: every difference', value: 'n 9, k 8' },
    { label: 'k = 1: sorted', value: 'n 6, k 1' },
    { label: 'k = n: impossible', value: 'n 5, k 5' },
    { label: 'n = 1, k = 0', value: 'n 1, k 0' },
  ],
  randomInput: () => {
    const n = rint(2, 14);
    return `n ${n}, k ${Math.random() < 0.85 ? rint(1, n - 1) : pick([0, n, n + 1])}`;
  },
  parse: parsePerm,
  trace: (input) => {
    // The strip of distinct differences reserves room for the run's longest list.
    const frames = permTrace(input).frames;
    const ghostDistinct = frames.reduce<number[]>((best, f) => (f.state.distinct.length > best.length ? f.state.distinct : best), []);
    return frames.map((f) => ({ ...f, state: { ...f.state, ghostDistinct } }));
  },
  render: (state) => <ZigzagView state={state} />,
  pseudocode: PERM_CODE,
  legend: [
    { role: 'compare', label: 'zig-zag range lo..hi still to place' },
    { role: 'active', label: 'number just placed, its difference' },
    { role: 'done', label: 'a difference seen for the first time' },
    { role: 'muted', label: 'numbers already placed' },
    { role: 'good', label: `the permutation (${SYM.check})` },
    { role: 'bad', label: `None: k is out of range (${SYM.cross})` },
  ],
  complexity: { time: 'O(n)', space: 'O(n) for the output' },
};

export const havelHakimiSpec: VizSpec<number[], HavelHakimiState> = {
  id: 'havel-hakimi',
  title: 'Graph from degrees (Havel-Hakimi)',
  inputKind: 'degree-sequence',
  inputLabel: 'Degree sequence',
  inputHelp:
    'The degree of each node 0, 1, 2, ... separated by spaces: "3 3 2 2 2". Up to 10 nodes with degrees 0 to 9. construct_graph returns a simple graph with exactly these degrees, or None when none exists.',
  examples: [
    { label: '[3, 3, 2, 2, 2] (the article)', value: '3 3 2 2 2' },
    { label: 'Ten nodes of degree 3', value: '3 3 3 3 3 3 3 3 3 3' },
    { label: '[3, 1, 1]: impossible', value: '3 1 1' },
    { label: 'Odd degree sum: impossible', value: '2 2 1' },
    { label: 'Degree-0 nodes stay out', value: '0 2 0 1 1 4 2 0' },
  ],
  randomInput: () => {
    const n = rint(3, 9);
    // Half the time a graphical sequence: the degrees of a random graph.
    if (Math.random() < 0.6) {
      const deg = Array(n).fill(0);
      for (let u = 0; u < n; u++) for (let v = u + 1; v < n; v++) if (Math.random() < 0.4) (deg[u]++, deg[v]++);
      return deg.join(' ');
    }
    return Array.from({ length: n }, () => rint(0, Math.min(5, n - 1))).join(' ');
  },
  parse: parseDegrees,
  trace: (input) => withStripGhosts<HavelHakimiState>(graphTrace(input).frames),
  render: (state) => <HavelHakimiView state={state} />,
  pseudocode: GRAPH_CODE,
  legend: [
    { role: 'active', label: 'node popped from the heap, the edge just added' },
    { role: 'compare', label: 'its neighbors, popped next' },
    { role: 'done', label: 'degree met' },
    { role: 'good', label: `every degree met (${SYM.check})` },
    { role: 'bad', label: `None: the heap ran out (${SYM.cross})` },
  ],
  complexity: { time: 'O(E log n): one heap pop and push per edge end', space: 'O(n + E)' },
};

export const northwestCornerSpec: VizSpec<MatrixSumsInput, GridState> = {
  id: 'northwest-corner',
  title: 'Matrix from row and column sums',
  inputKind: 'row-column-sums',
  inputLabel: 'Row sums and column sums',
  inputHelp:
    'The row sums, then the column sums: "rows 3 2; cols 1 4". Up to 6 of each, from 0 to 99. construct_matrix fills the matrix from the top-left corner, or returns None when the two totals differ.',
  examples: [
    { label: 'rows 3 2, cols 1 4', value: 'rows 3 2; cols 1 4' },
    { label: 'A 3 x 4 transport plan', value: 'rows 7 5 8; cols 4 6 3 7' },
    { label: 'Totals differ: None', value: 'rows 4 2; cols 1 4' },
    { label: 'Zero sums', value: 'rows 0 5 0; cols 2 0 3' },
    { label: 'One row', value: 'rows 6; cols 1 2 3' },
  ],
  randomInput: () => {
    const n = rint(2, 5);
    const m = rint(2, 5);
    const cells = Array.from({ length: n }, () => Array.from({ length: m }, () => (Math.random() < 0.5 ? 0 : rint(1, 9))));
    const rows = cells.map((r) => r.reduce((s, x) => s + x, 0));
    const cols = Array.from({ length: m }, (_, j) => cells.reduce((s, r) => s + r[j], 0));
    if (Math.random() < 0.15) rows[0] += 1;
    return `rows ${rows.join(' ')}; cols ${cols.join(' ')}`;
  },
  parse: parseSums,
  trace: (input) => sumsTrace(input).frames,
  render: (state) => <Grid state={state} />,
  pseudocode: SUMS_CODE,
  legend: [
    { role: 'active', label: 'cell being filled, or the totals that differ' },
    { role: 'compare', label: 'what its row and its column still need' },
    { role: 'done', label: 'a row or column already full, a finished cell' },
  ],
  complexity: { time: 'O(n x m): one visit per cell', space: 'O(n x m) for the output' },
};

/* ---------- Game theory ---------- */

export const nimSpec: VizSpec<number[], NimState> = {
  id: 'nim',
  title: 'Nim: XOR and the winning move',
  inputKind: 'nim-piles',
  inputLabel: 'Pile sizes',
  inputHelp: 'Up to 8 pile sizes from 0 to 31, separated by spaces: "3 4 5". nim_winning_move XORs them and, when the XOR is not 0, takes stones from the first pile that can make it 0.',
  examples: [
    { label: '[3, 4, 5] (the article)', value: '3 4 5' },
    { label: 'XOR 0: a lost position', value: '1 2 3' },
    { label: 'Only the last pile works', value: '1 2 4 8 16' },
    { label: 'Every pile empty', value: '0 0 0' },
    { label: 'Big piles', value: '29 17 11 24' },
  ],
  randomInput: () => Array.from({ length: rint(2, 5) }, () => rint(0, 20)).join(' '),
  parse: parseNim,
  trace: (input) => nimTrace(input).frames,
  render: (state) => <NimView state={state} />,
  pseudocode: NIM_CODE,
  legend: [
    { role: 'active', label: 'pile being XORed in, the highest bit of the XOR' },
    { role: 'compare', label: 'pile tried for the winning move' },
    { role: 'good', label: `the winning move: hollow stones are taken (${SYM.check})` },
    { role: 'bad', label: `XOR 0: no winning move (${SYM.cross})` },
  ],
  complexity: { time: 'O(k) for k piles: one XOR pass and one scan', space: 'O(1)' },
};

export const spragueGrundySpec: VizSpec<GrundyInput, GrundyState> = {
  id: 'sprague-grundy',
  title: 'Grundy numbers of a subtraction game',
  inputKind: 'grundy',
  inputLabel: 'Table size, moves and piles',
  inputHelp:
    '"n 12; moves 1 3 4" computes subtraction_grundy(12, [1, 3, 4]): from a pile you may remove 1, 3 or 4 stones. n goes up to 24, up to 6 moves from 1 to 30. ' +
    'Add "; piles 5 6" to combine several piles of the game with combined_grundy.',
  examples: [
    { label: 'Moves 1, 3, 4 with piles 5 and 6', value: 'n 12; moves 1 3 4; piles 5 6' },
    { label: 'Moves 1, 2, 3: period 4', value: 'n 12; moves 1 2 3' },
    { label: 'Moves 2 and 5', value: 'n 16; moves 2 5; piles 7 9 11' },
    { label: 'Only 1: plain parity', value: 'n 8; moves 1; piles 3 5' },
    { label: 'A losing sum', value: 'n 10; moves 1 3 4; piles 2 7' },
  ],
  randomInput: () => {
    const moves = [...new Set(Array.from({ length: rint(1, 3) }, () => rint(1, 6)))].sort((a, b) => a - b);
    const n = rint(8, 20);
    return `n ${n}; moves ${moves.join(' ')}${Math.random() < 0.5 ? `; piles ${rint(1, n)} ${rint(1, n)}` : ''}`;
  },
  parse: parseGrundy,
  trace: (input) => withStripGhosts(grundyTrace(input).frames),
  render: (state) => <GrundyView state={state} />,
  pseudocode: GRUNDY_CODE,
  legend: [
    { role: 'active', label: 'position being computed, the mex' },
    { role: 'compare', label: 'positions its moves reach, values in the reachable set' },
    { role: 'done', label: 'Grundy number 0 (P: the player to move loses)' },
    { role: 'good', label: `combined XOR not 0: first player wins (${SYM.check})` },
    { role: 'bad', label: `combined XOR 0: first player loses (${SYM.cross})` },
  ],
  complexity: { time: 'O(n x m) for n positions and m moves', space: 'O(n)' },
};

export const gameGraphSpec: VizSpec<GameGraphInput, GameGraphState> = {
  id: 'game-graph',
  title: 'Win, lose or draw on a game graph',
  inputKind: 'game-graph',
  inputLabel: 'Moves',
  inputHelp:
    'The moves of the token as "0>1" (from node 0 to node 1), separated by commas; "n 5" adds nodes without moves up to 0..4. Up to 10 nodes and 24 moves; a loop such as "2>2" is allowed. ' +
    'game_graph_outcomes labels every node WIN, LOSE or DRAW for the player to move.',
  examples: [
    { label: 'A cycle with an exit (the article)', value: '0>1, 1>0, 1>2' },
    { label: 'Two-cycle: a draw', value: '0>1, 1>0' },
    { label: 'A DAG', value: '0>1, 1>2, 0>2, 3>2' },
    { label: 'Loop and chain', value: '0>0, 0>1, 1>2, 2>3, 4>3, 4>4' },
    { label: 'Mixed', value: '0>1, 0>2, 1>3, 2>3, 3>4, 4>5, 5>3, 2>6, 6>7' },
  ],
  randomInput: () => {
    const n = rint(4, 8);
    const edges = new Set<string>();
    for (let t = 0; t < rint(n, n + 5); t++) {
      const u = rint(0, n - 1);
      const v = rint(0, n - 1);
      if (u !== v || Math.random() < 0.15) edges.add(`${u}>${v}`);
    }
    return `n ${n}, ${[...edges].join(', ')}`;
  },
  parse: parseGameGraph,
  trace: (input) => withStripGhosts(gameGraphTrace(input).frames),
  render: (state) => <GameGraphView state={state} />,
  pseudocode: GAME_GRAPH_CODE,
  legend: [
    { role: 'active', label: 'node taken from the queue, the move just used' },
    { role: 'compare', label: 'a move into it being looked at' },
    { role: 'good', label: `WIN for the player to move (${SYM.check})` },
    { role: 'bad', label: `LOSE for the player to move (${SYM.cross})` },
    { role: 'muted', label: 'DRAW: never settled' },
  ],
  complexity: { time: 'O(V + E): every move is looked at once', space: 'O(V + E)' },
};

/* ---------- Interactive problems ---------- */

const ARRAY_HELP =
  'The hidden values a[1..n] the judge holds, "values 3 9 2 9 5" (up to 16, from -99 to 99). The judge answers "? i j" with 1 if a[i] > a[j], 0 for a tie and -1 if smaller. ' +
  'Add "; limit 3" to give the judge a smaller query budget than the n - 1 comparisons needed: past it the judge replies -1 and stops reading. The two tabs share the input.';

interface JudgeMeta {
  id: string;
  title: string;
  inputKind: string;
  help: string;
  examples: Example[];
  random: () => string;
  legend: VizSpec<JudgeInput, JudgeState>['legend'];
  complexity: { time: string; space: string };
}

function judgeSpec(mode: JudgeMode, meta: JudgeMeta): VizSpec<JudgeInput, JudgeState> {
  return {
    id: meta.id,
    title: meta.title,
    inputKind: meta.inputKind,
    inputLabel: 'Hidden input and query limit',
    inputHelp: meta.help,
    examples: meta.examples,
    randomInput: meta.random,
    parse: (text) => parseJudge(text, mode),
    trace: (input) => judgeTrace(input, mode).frames,
    render: (state) => <JudgeView state={state} />,
    pseudocode: JUDGE_CODE[mode],
    legend: meta.legend,
    complexity: meta.complexity,
  };
}

const randomValues = () => `values ${Array.from({ length: rint(3, 10) }, () => rint(1, 30)).join(' ')}`;
const VERDICT = [
  { role: 'good' as const, label: `accepted (${SYM.check})` },
  { role: 'bad' as const, label: `wrong answer: the limit was exceeded (${SYM.cross})` },
];

export const guessNumberSpec = judgeSpec('guess', {
  id: 'interactive-guess-number',
  title: 'Guess the number (binary search)',
  inputKind: 'judge-number',
  help:
    '"n 10; secret 7": the judge holds a secret in 1..n (n up to 10^9) and answers each "? x" with higher, lower or correct. ' +
    'The limit defaults to floor(log2 n), the most this binary search ever needs; add "; limit 3" to set your own, and past it the judge replies -1 and stops reading.',
  examples: [
    { label: 'Secret 7 in 1..10 (the article)', value: 'n 10; secret 7' },
    { label: 'Secret 10: all 3 queries', value: 'n 10; secret 10' },
    { label: 'A billion values', value: 'n 1000000000; secret 123456789' },
    { label: 'First guess correct', value: 'n 100; secret 50' },
    { label: 'Limit too low: -1, then EOFError', value: 'n 100; secret 1; limit 4' },
  ],
  random: () => {
    const n = pick([10, 16, 100, 1000, 1000000]);
    return `n ${n}; secret ${rint(1, n)}`;
  },
  legend: [
    { role: 'compare', label: 'values the secret can still be' },
    { role: 'active', label: 'the midpoint asked, the newest line' },
    { role: 'muted', label: 'ruled out by a reply' },
    ...VERDICT,
  ],
  complexity: { time: 'at most floor(log2 n) queries', space: 'O(1)' },
});

export const findMaximumSpec = judgeSpec('maximum', {
  id: 'interactive-find-maximum',
  title: 'Maximum by comparisons',
  inputKind: 'judge-array',
  help: ARRAY_HELP,
  examples: [
    { label: 'A tie keeps the first 9', value: 'values 3 9 2 9 5' },
    { label: 'Increasing: the best moves every time', value: 'values 1 2 3 4 5 6 7 8' },
    { label: 'Decreasing: the first one stays', value: 'values 8 7 6 5 4 3 2 1' },
    { label: 'Limit one too low', value: 'values 4 1 7 3; limit 2' },
    { label: 'One value: no query', value: 'values 42' },
  ],
  random: randomValues,
  legend: [
    { role: 'active', label: 'the best index so far (max_idx)' },
    { role: 'compare', label: 'the index being compared with it' },
    { role: 'muted', label: 'beaten, or tied: not larger' },
    ...VERDICT,
  ],
  complexity: { time: 'n - 1 comparisons, the minimum possible', space: 'O(1)' },
});

export const tournamentSpec = judgeSpec('tournament', {
  id: 'interactive-tournament',
  title: 'Maximum by a tournament',
  inputKind: 'judge-array',
  help: ARRAY_HELP,
  examples: [
    { label: 'A tie sends the right-hand 9 on', value: 'values 3 9 2 9 5' },
    { label: 'Seven values: byes', value: 'values 5 1 8 3 9 2 7' },
    { label: 'Eight values: three rounds', value: 'values 1 2 3 4 5 6 7 8' },
    { label: 'Limit one too low', value: 'values 4 1 7 3; limit 2' },
    { label: 'One value: no query', value: 'values 42' },
  ],
  random: randomValues,
  legend: [
    { role: 'compare', label: 'the pair being compared' },
    { role: 'active', label: 'the candidate that goes on' },
    { role: 'done', label: 'through to the next round' },
    { role: 'muted', label: 'knocked out' },
    ...VERDICT,
  ],
  complexity: { time: 'n - 1 comparisons in about log2(n) rounds', space: 'O(n) candidates' },
});

export const bitByBitSpec = judgeSpec('bits', {
  id: 'interactive-bit-by-bit',
  title: 'Hidden number bit by bit',
  inputKind: 'judge-bits',
  help:
    '"n 20; secret 13": the judge holds a number in 0..n (n up to 10^9) and answers "? mask" with 1 when the number has a bit of the mask. ' +
    'The limit defaults to n.bit_length(), one query per bit; add "; limit 2" to set your own, and past it the judge replies -1 and stops reading.',
  examples: [
    { label: 'Secret 13 in 0..20', value: 'n 20; secret 13' },
    { label: 'Up to a billion: 30 queries', value: 'n 1000000000; secret 987654321' },
    { label: 'Every bit set', value: 'n 31; secret 31' },
    { label: 'n = 0: no query at all', value: 'n 0; secret 0' },
    { label: 'Limit too low: -1 counts as a 1', value: 'n 20; secret 4; limit 2' },
  ],
  random: () => {
    const n = pick([7, 20, 100, 1000, 65535]);
    return `n ${n}; secret ${rint(0, n)}`;
  },
  legend: [
    { role: 'active', label: 'the bit being asked (the mask)' },
    { role: 'compare', label: 'the bit just answered' },
    { role: 'done', label: 'a bit already known' },
    { role: 'muted', label: "the judge's hidden bits" },
    ...VERDICT,
  ],
  complexity: { time: 'n.bit_length() queries, about log2(n)', space: 'O(1)' },
});
