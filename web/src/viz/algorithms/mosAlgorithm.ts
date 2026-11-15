/**
 * Mo's algorithm tracer, drawn with MosView: the array with its blocks, the window that slides one
 * element at a time, and the queries in the order they are answered.
 *
 * Mirrors Algorithms/Advanced_Algorithms/Specialized_Techniques/Mos_Algorithm/Python/mos_algorithm.py:
 * MoSAlgorithm.__init__ / get_block / process_queries / add / remove.
 * block_size = max(1, int(sqrt(n))) (the floor of the square root). process_queries sorts the
 * (index, (l, r)) pairs by (l // block_size, r) with Python's stable sorted(), so equal keys keep
 * their input order; it starts with the empty window current_l = 0, current_r = -1 and moves it
 * to each query in four loops, always in this order: extend left, extend right, shrink left,
 * shrink right. add counts a value in freq and returns current_ans + 1 when it is the first copy;
 * remove uncounts it, deletes the key at 0 and returns current_ans - 1. The answer is stored at
 * the query's input index, so the result follows the input order.
 * Golden fixtures (__fixtures__/specializedTechniques.json) pin the block size, the order the
 * queries are answered, every add and remove (with the index read and the answer returned) and
 * the answers.
 *
 * Input: "[1, 1, 2, 1, 3, 4, 3, 3, 4]; (0, 4) (6, 8) (1, 3)"   (queries as l r pairs, inclusive)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { MoQueryView, MosViewState } from '../renderers/MosView';
import type { StripData, StripItem } from '../ui/molecules/Strip';
import { floorDiv, parseArrayScript } from './segmentTree';

export interface MoInput {
  arr: number[];
  queries: Array<[number, number]>;
}

export const MO_LIMITS = { maxLen: 16, maxQueries: 8, lo: -99, hi: 99 };

/** "[1, 1, 2]; (0, 2) (1, 1)": the array, then the queries as pairs of inclusive indices. */
export function parseMo(text: string): MoInput {
  const cut = text.search(/[;\n]/);
  if (cut < 0) throw new InputError('Write the array, a semicolon, then the queries as l r pairs, for example "[1, 1, 2, 1, 3]; (0, 4) (1, 3)".');
  const { values } = parseArrayScript(text.slice(0, cut), { ...MO_LIMITS, example: '"[1, 1, 2, 1, 3]; (0, 4) (1, 3)"' });
  const n = values.length;
  const body = text
    .slice(cut + 1)
    .replace(/^\s*(?:queries|q)\s*[:=]?/i, '')
    .replace(/[()[\]]/g, ' ');
  const tokens = body.split(/[\s,;]+/).filter(Boolean);
  for (const t of tokens) if (!/^-?\d+$/.test(t)) throw new InputError(`"${t}" is not an index. Write each query as two indices l r, as in (0, 4).`);
  if (tokens.length === 0) throw new InputError('Add at least one query after the semicolon, as in (0, 4).');
  if (tokens.length % 2) throw new InputError(`Each query needs two indices, l and r (got ${tokens.length} numbers).`);
  const queries: Array<[number, number]> = [];
  for (let i = 0; i < tokens.length; i += 2) {
    const l = Number(tokens[i]);
    const r = Number(tokens[i + 1]);
    const q = `(${tokens[i]}, ${tokens[i + 1]})`;
    if (l < 0 || r < 0) throw new InputError(`${q}: indices start at 0. A negative index would make Python read from the end of the list.`);
    if (r >= n) throw new InputError(`${q}: the array has ${n} element${n === 1 ? '' : 's'} (indices 0 to ${n - 1}); reading arr[${r}] would raise IndexError.`);
    if (l > r) throw new InputError(`${q}: l must not be greater than r. The code does not check it, but the window would be inverted and that answer meaningless.`);
    queries.push([l, r]);
  }
  if (queries.length > MO_LIMITS.maxQueries) throw new InputError(`At most ${MO_LIMITS.maxQueries} queries, so every one keeps its own lane (got ${queries.length}).`);
  return { arr: values, queries };
}

export const MO_CODE = [
  'MoSAlgorithm(arr): block_size = max(1, int(sqrt(n)))      # get_block(i) = i // block_size',
  'process_queries(queries):',
  '  sorted_queries = sorted(enumerate(queries), key=lambda x: (get_block(x[1][0]), x[1][1]))',
  '  answers = [0] * len(queries); current_l = 0; current_r = -1; current_ans = 0; freq = {}',
  '  for query_idx, (l, r) in sorted_queries:',
  '    while current_l > l: current_l -= 1; current_ans = add(current_ans, arr[current_l], freq)',
  '    while current_r < r: current_r += 1; current_ans = add(current_ans, arr[current_r], freq)',
  '    while current_l < l: current_ans = remove(current_ans, arr[current_l], freq); current_l += 1',
  '    while current_r > r: current_ans = remove(current_ans, arr[current_r], freq); current_r -= 1',
  '    answers[query_idx] = current_ans',
  '  return answers',
  'add(current_ans, value, freq): freq[value] = freq.get(value, 0) + 1',
  '  return current_ans + 1 if freq[value] == 1 else current_ans   # a new distinct value',
  'remove(current_ans, value, freq): freq[value] = freq.get(value, 0) - 1',
  '  if freq[value] == 0: del freq[value]; return current_ans - 1; else return current_ans',
];

export type MoMove = ['add' | 'remove', number, number];

export interface MoRun {
  frames: Array<Frame<MosViewState>>;
  blockSize: number;
  /** Input indices of the queries, in the order they are answered. */
  order: number[];
  /** Every add / remove: the index of arr it reads and the answer it returns. */
  moves: MoMove[];
  answers: number[];
}

/** The pointer moves of the same four loops when the queries are taken in a given order: each end moves |old - new| steps. */
export function countMoves(queries: Array<[number, number]>): number {
  let l = 0;
  let r = -1;
  let moves = 0;
  for (const [ql, qr] of queries) {
    moves += Math.abs(l - ql) + Math.abs(r - qr);
    l = ql;
    r = qr;
  }
  return moves;
}

/** Python's sorted(): stable, so pairs with equal keys keep their input order. */
function moOrder(queries: Array<[number, number]>, blockSize: number): number[] {
  return queries
    .map((q, i) => ({ i, block: floorDiv(q[0], blockSize), r: q[1] }))
    .sort((a, b) => a.block - b.block || a.r - b.r)
    .map((x) => x.i);
}

export function moTrace(input: MoInput): MoRun {
  const { arr, queries } = input;
  const n = arr.length;
  const blockSize = Math.max(1, Math.floor(Math.sqrt(n)));
  const order = moOrder(queries, blockSize);
  const rank = new Map(order.map((idx, k) => [idx, k]));
  const answers = new Array(queries.length).fill(0);
  const answered = new Set<number>();
  const moves: MoMove[] = [];
  const freq = new Map<number, number>();
  let curL = 0;
  let curR = -1;
  let ans = 0;
  let sorted = false;
  let currentQuery = -1;
  const frames: Array<Frame<MosViewState>> = [];
  const inputOrderMoves = countMoves(queries);
  const key = (i: number) => `(${floorDiv(queries[i][0], blockSize)}, ${queries[i][1]})`;

  const snap = (line: number | undefined, caption: string, o: { cells?: Record<number, Role>; freqKey?: number; window?: boolean; vars?: Array<[string, string | number]> } = {}) => {
    const qs: MoQueryView[] = queries.map(([l, r], i) => ({
      id: i,
      l,
      r,
      lane: sorted ? rank.get(i)! : i,
      role: i === currentQuery ? 'active' : answered.has(i) ? 'done' : 'idle',
      tag: answered.has(i) ? `ans ${answers[i]}` : sorted ? `key ${key(i)}` : `[${l}, ${r}]`,
    }));
    const strips: StripData[] = [];
    if (o.window !== false) {
      const entries = [...freq.entries()];
      strips.push({ label: 'freq', items: entries.length ? entries.map(([v, c]): StripItem => ({ text: `${v}: ${c}`, role: v === o.freqKey ? 'active' : undefined })) : [{ text: '{}' }] });
    }
    strips.push({ label: 'answers', items: answers.map((a, i): StripItem => ({ text: answered.has(i) ? `q${i} = ${a}` : `q${i} = ?`, role: i === currentQuery && answered.has(i) ? 'done' : undefined })) });
    frames.push({
      line,
      caption,
      vars: [
        ...(o.vars ?? []),
        ['current_l', curL],
        ['current_r', curR],
        ['current_ans', ans],
        ['pointer moves', moves.length],
        ['moves in input order', inputOrderMoves],
      ],
      state: {
        label: `Array of ${n}, window [${curL}, ${curR}], ${queries.length} queries`,
        cells: arr.map((v, i) => ({ value: v, role: o.cells?.[i] ?? 'idle' })),
        blockSize,
        window: o.window === false ? undefined : { l: curL, r: curR },
        queries: qs,
        strips,
      },
    });
  };

  snap(
    0,
    `MoSAlgorithm(arr): n = ${n}, block_size = max(1, int(sqrt(${n}))) = ${blockSize}. Index i lies in block i // ${blockSize}. ` +
      `${queries.length} quer${queries.length === 1 ? 'y' : 'ies'} arrive in input order; answering them in that order would move the window ${inputOrderMoves} times.`,
    { window: false },
  );
  sorted = true;
  const ties = order.some((idx, k) => k > 0 && key(idx) === key(order[k - 1]));
  snap(
    2,
    `Sort by the key (block of l, r): queries whose left ends share a block are answered together, with r only growing. ` +
      `Order: ${order.map((i) => `q${i}`).join(', ')}.` +
      (ties ? ' Some keys are equal: sorted() is stable, so those queries keep their input order.' : ''),
    { window: false },
  );
  snap(3, 'answers = [0] * q. The window starts empty: current_l = 0, current_r = -1 (R sits just before L), current_ans = 0, freq = {}.');

  const moveFrame = (line: number, kind: 'add' | 'remove', i: number, side: 'L' | 'R') => {
    const value = arr[i];
    const before = ans;
    let count: number;
    if (kind === 'add') {
      count = (freq.get(value) ?? 0) + 1;
      freq.set(value, count);
      if (count === 1) ans += 1;
    } else {
      count = (freq.get(value) ?? 0) - 1;
      freq.set(value, count);
      if (count === 0) {
        freq.delete(value);
        ans -= 1;
      }
    }
    moves.push([kind, i, ans]);
    const pointer = side === 'L' ? 'current_l' : 'current_r';
    const step =
      kind === 'add'
        ? side === 'L'
          ? `current_l > ${queries[currentQuery][0]}: extend left, current_l = ${curL}`
          : `current_r < ${queries[currentQuery][1]}: extend right, current_r = ${curR}`
        : side === 'L'
          ? `current_l < ${queries[currentQuery][0]}: shrink left past ${i}`
          : `current_r > ${queries[currentQuery][1]}: shrink right past ${i}`;
    const effect =
      kind === 'add'
        ? count === 1
          ? `add(arr[${i}] = ${value}): freq[${value}] = 1, a value the window did not have, so current_ans = ${before} + 1 = ${ans}.`
          : `add(arr[${i}] = ${value}): freq[${value}] = ${count}, already in the window, so current_ans stays ${ans}.`
        : count === 0
          ? `remove(arr[${i}] = ${value}): freq[${value}] drops to 0 and the key is deleted: its last copy left, so current_ans = ${before} - 1 = ${ans}.`
          : `remove(arr[${i}] = ${value}): freq[${value}] = ${count}, another copy stays, so current_ans stays ${ans}.`;
    snap(line, `${step}. ${effect}`, { cells: { [i]: kind === 'add' ? 'active' : 'muted' }, freqKey: value, vars: [[pointer, side === 'L' ? curL : curR]] });
  };

  order.forEach((idx) => {
    const [l, r] = queries[idx];
    currentQuery = idx;
    const plan = [curL > l ? `extend L to ${l}` : '', curR < r ? `extend R to ${r}` : '', curL < l ? `shrink L to ${l}` : '', curR > r ? `shrink R to ${r}` : ''].filter(Boolean);
    snap(
      4,
      `Next: q${idx} = [${l}, ${r}], key ${key(idx)}. The window is [${curL}, ${curR}]` + (plan.length ? `: ${plan.join(', ')}, one element per step (extend before shrinking, so the window never turns inside out).` : ' already: nothing to move.'),
      { vars: [['query_idx', idx], ['l', l], ['r', r]] },
    );
    while (curL > l) {
      curL -= 1;
      moveFrame(5, 'add', curL, 'L');
    }
    while (curR < r) {
      curR += 1;
      moveFrame(6, 'add', curR, 'R');
    }
    while (curL < l) {
      const i = curL;
      curL += 1;
      moveFrame(7, 'remove', i, 'L');
    }
    while (curR > r) {
      const i = curR;
      curR -= 1;
      moveFrame(8, 'remove', i, 'R');
    }
    answers[idx] = ans;
    answered.add(idx);
    snap(9, `The window is exactly [${l}, ${r}]: it holds ${ans} distinct value${ans === 1 ? '' : 's'}. answers[${idx}] = ${ans}, stored at the input index so the output keeps the input order.`, {
      vars: [['query_idx', idx]],
    });
  });

  currentQuery = -1;
  snap(
    10,
    `return answers = [${answers.join(', ')}], in input order. The window moved ${moves.length} time${moves.length === 1 ? '' : 's'} in sorted order, against ${inputOrderMoves} in input order` +
      (moves.length < inputOrderMoves ? `: the sort saved ${inputOrderMoves - moves.length} moves.` : moves.length === inputOrderMoves ? '.' : ': on so few queries the sort does not always pay off; the bound O((N + Q) sqrt N) is about the worst case.'),
  );
  return { frames, blockSize, order, moves, answers };
}
