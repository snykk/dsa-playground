/**
 * One-dimensional DP tracers: Fibonacci, Climbing Stairs, Coin Change (min coins),
 * Longest Increasing Subsequence (O(n^2) table and O(n log n) tails) and Kadane.
 * Each mirrors the repository's Python implementation of the same topic.
 */
import { InputError, parseIntList, type Frame, type Role } from '../core/types';
import type { ArraySceneState, SceneCell } from '../renderers/ArrayScene';
import type { StripData } from '../ui/molecules/Strip';

type Vars = Array<[string, string | number]>;
const INF_TEXT = 'inf';

function scene(
  values: number[],
  roles: Role[],
  opts: {
    pointers?: Record<number, string>;
    range?: { lo: number; hi: number; label?: string };
    rows?: Array<{ label: string; cells: SceneCell[] }>;
    strips?: StripData[];
  } = {},
): ArraySceneState {
  return {
    array: {
      items: values.map((value, id) => ({ id, value })),
      roles: [...roles],
      pointers: opts.pointers,
      range: opts.range,
    },
    rows: opts.rows,
    rowIndices: opts.rows ? Math.max(...opts.rows.map((r) => r.cells.length)) : undefined,
    strips: opts.strips,
  };
}

const token = (text: string, role?: Role) => ({ text, role });

// ---------------------------------------------------------------- Fibonacci

export const FIB_MAX = 20;

export function parseFibonacci(text: string): number {
  const t = text.trim();
  if (!/^-?\d+$/.test(t)) throw new InputError('Enter a single whole number n, e.g. 10.');
  const n = Number(t);
  if (n < 0) throw new InputError('n must be 0 or more (the repository code rejects negative n).');
  if (n > FIB_MAX) throw new InputError(`Keep n at ${FIB_MAX} or less so the table stays readable.`);
  return n;
}

export function fibonacciTrace(n: number): Array<Frame<ArraySceneState>> {
  const dp: Array<number | null> = Array.from({ length: n + 1 }, () => null);
  const frames: Array<Frame<ArraySceneState>> = [];
  // Calls made by naive recursion: calls(n) = 2*F(n+1) - 1.
  let a = 0;
  let b = 1;
  for (let k = 0; k <= n; k++) [a, b] = [b, a + b];
  const naiveCalls = 2 * a - 1;
  const push = (line: number | undefined, caption: string, roles: Record<number, Role>, vars: Vars, pointers: Record<number, string> = {}) => {
    const rl: Role[] = dp.map((_, i) => roles[i] ?? (dp[i] === null ? 'idle' : 'done'));
    frames.push({
      line,
      caption,
      vars,
      state: scene(
        dp.map((v) => v ?? 0),
        rl,
        {
          pointers,
          rows: [{ label: 'F(i)', cells: dp.map((v, i) => ({ value: v, role: roles[i] ?? (v === null ? undefined : 'done') })) }],
          strips: [{ label: 'Naive recursion would make', items: [token(`${naiveCalls} calls`, 'muted')] }],
        },
      ),
    });
  };

  if (n === 0) {
    dp[0] = 0;
    push(1, 'n = 0: F(0) = 0 is a base case, so the table has a single entry and no loop runs.', { 0: 'active' }, [['n', 0], ['answer', 0]]);
    return frames;
  }
  push(0, `Allocate a table of ${n + 1} entries. F(i) depends only on the two entries before it, so we can fill it left to right.`, {}, [['n', n]]);
  dp[0] = 0;
  dp[1] = 1;
  push(1, 'Base cases: F(0) = 0 and F(1) = 1. Every later entry is built from these two.', { 0: 'active', 1: 'active' }, [['F(0)', 0], ['F(1)', 1]], { 0: 'base', 1: 'base' });
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1]! + dp[i - 2]!;
    push(
      3,
      `F(${i}) = F(${i - 1}) + F(${i - 2}) = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}. Both inputs are already in the table, so nothing is recomputed.`,
      { [i - 2]: 'compare', [i - 1]: 'compare', [i]: 'active' },
      [['i', i], ['F(i-1)', dp[i - 1]!], ['F(i-2)', dp[i - 2]!], ['F(i)', dp[i]!]],
      { [i]: 'i' },
    );
  }
  push(4, `Done: F(${n}) = ${dp[n]}. The table took ${n - 1} additions; naive recursion would have made ${naiveCalls} calls.`, { [n]: 'done' }, [['n', n], ['answer', dp[n]!]]);
  return frames;
}

// ---------------------------------------------------------------- Climbing stairs

export interface StairsInput {
  n: number;
  steps: number[];
}

export function parseStairs(text: string): StairsInput {
  const parts = text.split('|');
  if (parts.length > 2) throw new InputError('Write "n | steps", e.g. "7 | 1, 2". The steps part is optional (default 1, 2).');
  const nText = parts[0].trim();
  if (!/^\d+$/.test(nText)) throw new InputError('n must be a whole number of 0 or more, e.g. "7 | 1, 2".');
  const n = Number(nText);
  if (n > 20) throw new InputError('Keep n at 20 or less.');
  let steps = [1, 2];
  if (parts.length === 2 && parts[1].trim()) {
    steps = parseIntList(parts[1], { min: 1, max: 4, lo: 1, hi: 6, what: 'step sizes' });
    if (new Set(steps).size !== steps.length) throw new InputError('Each step size can be listed only once.');
  }
  return { n, steps };
}

export function stairsTrace({ n, steps }: StairsInput): Array<Frame<ArraySceneState>> {
  const ways: Array<number | null> = Array.from({ length: n + 1 }, () => null);
  const frames: Array<Frame<ArraySceneState>> = [];
  const stepStrip: StripData = { label: 'Allowed steps', items: steps.map((s) => token(String(s), 'compare')) };
  const push = (line: number | undefined, caption: string, roles: Record<number, Role>, vars: Vars, pointers: Record<number, string> = {}) => {
    frames.push({
      line,
      caption,
      vars,
      state: scene(
        ways.map((v) => v ?? 0),
        ways.map((v, i) => roles[i] ?? (v === null ? 'idle' : 'done')),
        {
          pointers,
          rows: [{ label: 'ways[i]', cells: ways.map((v, i) => ({ value: v, role: roles[i] ?? (v === null ? undefined : 'done') })) }],
          strips: [stepStrip],
        },
      ),
    });
  };

  ways[0] = 1;
  push(0, 'ways[0] = 1: there is exactly one way to stand on the ground, which is to take no step. Every other count builds on it.', { 0: 'active' }, [['n', n], ['steps', steps.join(',')]], { 0: 'base' });
  for (let i = 1; i <= n; i++) {
    let total = 0;
    ways[i] = 0;
    const sources: Record<number, Role> = {};
    for (const s of steps) {
      if (i < s) {
        push(2, `Step size ${s} would go below the ground from stair ${i}, so it adds nothing.`, { ...sources, [i]: 'active' }, [['i', i], ['step', s], ['ways[i]', total]], { [i]: 'i' });
        continue;
      }
      total += ways[i - s]!;
      ways[i] = total;
      sources[i - s] = 'compare';
      push(
        3,
        `A last hop of ${s} comes from stair ${i - s}, which has ${ways[i - s]} way${ways[i - s] === 1 ? '' : 's'}: ways[${i}] is now ${total}.`,
        { ...sources, [i]: 'active' },
        [['i', i], ['step', s], ['ways[i-step]', ways[i - s]!], ['ways[i]', total]],
        { [i]: 'i' },
      );
    }
    push(1, `Stair ${i} can be reached in ${total} way${total === 1 ? '' : 's'}: the sum over every allowed last hop.`, { [i]: 'done' }, [['i', i], ['ways[i]', total]]);
  }
  push(4, `Done: ${ways[n]} distinct way${ways[n] === 1 ? '' : 's'} to climb ${n} stair${n === 1 ? '' : 's'} with steps {${steps.join(', ')}}.`, { [n]: 'done' }, [['n', n], ['answer', ways[n]!]]);
  return frames;
}

// ---------------------------------------------------------------- Coin change (minimum coins)

export interface CoinInput {
  amount: number;
  coins: number[];
}

export function parseCoinChange(text: string): CoinInput {
  const parts = text.split('|');
  if (parts.length !== 2) throw new InputError('Write "amount | coins", e.g. "11 | 1, 2, 5".');
  const aText = parts[0].trim();
  if (!/^\d+$/.test(aText)) throw new InputError('The amount must be a whole number of 0 or more.');
  const amount = Number(aText);
  if (amount > 30) throw new InputError('Keep the amount at 30 or less.');
  const coins = parseIntList(parts[1], { min: 1, max: 5, lo: 1, hi: 30, what: 'coin values' });
  if (new Set(coins).size !== coins.length) throw new InputError('Each coin value can be listed only once.');
  return { amount, coins };
}

export function coinChangeTrace({ amount, coins }: CoinInput): Array<Frame<ArraySceneState>> {
  const dp: number[] = Array.from({ length: amount + 1 }, (_, a) => (a === 0 ? 0 : Infinity));
  const frames: Array<Frame<ArraySceneState>> = [];
  const used: string[] = [];
  const coinStrip = (): StripData[] => [
    { label: 'Coins', items: coins.map((c) => token(String(c), 'compare')) },
    ...(used.length ? [{ label: 'Chosen', items: used.map((c) => token(c, 'done')) }] : []),
  ];
  const push = (line: number | undefined, caption: string, roles: Record<number, Role>, vars: Vars, pointers: Record<number, string> = {}) => {
    frames.push({
      line,
      caption,
      vars,
      state: scene(
        dp.map((v) => (Number.isFinite(v) ? v : 0)),
        dp.map((v, i) => roles[i] ?? (Number.isFinite(v) ? 'idle' : 'muted')),
        {
          pointers,
          rows: [{ label: 'min coins', cells: dp.map((v, i) => ({ value: Number.isFinite(v) ? v : INF_TEXT, role: roles[i] })) }],
          strips: coinStrip(),
        },
      ),
    });
  };

  push(0, 'dp[a] = fewest coins that sum to a. dp[0] = 0 (no coins make zero); every other amount starts as unreachable (inf).', { 0: 'active' }, [['amount', amount]], { 0: 'base' });
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c > a) {
        push(2, `Coin ${c} is larger than ${a}, so it cannot be the last coin.`, { [a]: 'active' }, [['a', a], ['coin', c], ['dp[a]', Number.isFinite(dp[a]) ? dp[a] : INF_TEXT]], { [a]: 'a' });
        continue;
      }
      const prev = dp[a - c];
      if (!Number.isFinite(prev)) {
        push(3, `Using coin ${c} would need amount ${a - c} first, and that amount cannot be made, so skip it.`, { [a - c]: 'muted', [a]: 'active' }, [['a', a], ['coin', c], ['dp[a-c]', INF_TEXT]], { [a]: 'a' });
        continue;
      }
      const cand = prev + 1;
      const better = cand < dp[a];
      if (better) dp[a] = cand;
      push(
        3,
        `Last coin ${c}: dp[${a - c}] + 1 = ${cand}. ${better ? `That beats the best so far, so dp[${a}] = ${cand}.` : `Not better than dp[${a}] = ${dp[a]}, so keep it.`}`,
        { [a - c]: 'compare', [a]: 'active' },
        [['a', a], ['coin', c], ['dp[a-c]+1', cand], ['dp[a]', dp[a]]],
        { [a]: 'a', [a - c]: 'a-c' },
      );
    }
  }
  if (!Number.isFinite(dp[amount])) {
    push(undefined, `Done: amount ${amount} cannot be made from these coins (the answer is -1).`, { [amount]: 'bad' }, [['answer', -1]]);
    return frames;
  }
  push(4, `The table is full: dp[${amount}] = ${dp[amount]}. Walk back from ${amount}: a coin c was used whenever dp[a - c] + 1 = dp[a].`, { [amount]: 'done' }, [['answer', dp[amount]]]);
  let a = amount;
  const path: Record<number, Role> = { [amount]: 'done' };
  while (a > 0) {
    const c = coins.find((x) => x <= a && Number.isFinite(dp[a - x]) && dp[a - x] + 1 === dp[a])!;
    used.push(String(c));
    path[a - c] = 'done';
    push(5, `dp[${a}] = ${dp[a]} = dp[${a - c}] + 1, so one coin of ${c} is used; continue from ${a - c}.`, { ...path }, [['a', a], ['coin', c]]);
    a -= c;
  }
  push(undefined, `Done: ${dp[amount]} coin${dp[amount] === 1 ? '' : 's'} (${used.join(' + ')}) make ${amount}.`, { ...path }, [['answer', dp[amount]]]);
  return frames;
}

// ---------------------------------------------------------------- LIS

export function parseSequence(text: string): number[] {
  return parseIntList(text, { min: 1, max: 14, lo: -999, hi: 999, what: 'numbers' });
}

/** Cell rows for LIS: dp length and predecessor index per element. */
function lisRows(dp: number[], prev: number[], roles: Record<number, Role>) {
  return [
    { label: 'length', cells: dp.map((v, i) => ({ value: v, role: roles[i] })) },
    { label: 'prev', cells: prev.map((p, i) => ({ value: p < 0 ? '-' : p, role: roles[i] })) },
  ];
}

export function lisTrace(arr: number[]): Array<Frame<ArraySceneState>> {
  const n = arr.length;
  const dp = Array.from({ length: n }, () => 1);
  const prev = Array.from({ length: n }, () => -1);
  const frames: Array<Frame<ArraySceneState>> = [];
  const push = (line: number | undefined, caption: string, roles: Role[], cellRoles: Record<number, Role>, vars: Vars, pointers: Record<number, string> = {}, strips?: StripData[]) => {
    frames.push({ line, caption, vars, state: scene(arr, roles, { pointers, rows: lisRows(dp, prev, cellRoles), strips }) });
  };
  const idle = () => arr.map((): Role => 'idle');

  push(0, 'length[i] = length of the longest strictly increasing subsequence that ENDS at index i. Every element alone is such a subsequence, so start at 1.', idle(), {}, [['n', n]]);
  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      const roles = idle();
      roles[i] = 'active';
      roles[j] = 'compare';
      const cellRoles: Record<number, Role> = { [i]: 'active', [j]: 'compare' };
      let caption: string;
      let improved = false;
      if (arr[j] < arr[i]) {
        if (dp[j] + 1 > dp[i]) {
          dp[i] = dp[j] + 1;
          prev[i] = j;
          improved = true;
          caption = `${arr[j]} < ${arr[i]}, so ${arr[i]} can extend the best run ending at index ${j} (length ${dp[j]}): length[${i}] becomes ${dp[i]}, remembering predecessor ${j}.`;
        } else {
          caption = `${arr[j]} < ${arr[i]}, but extending index ${j} gives ${dp[j] + 1}, which is not better than length[${i}] = ${dp[i]}.`;
        }
      } else {
        caption = `${arr[j]} >= ${arr[i]}: the run ending at index ${j} cannot be extended by ${arr[i]} (strictly increasing needs a smaller value).`;
      }
      push(improved ? 4 : 3, caption, roles, cellRoles, [['i', i], ['j', j], ['length[i]', dp[i]]], { [i]: 'i', [j]: 'j' });
    }
  }
  const best = Math.max(...dp);
  const endIdx = dp.indexOf(best);
  const roles = idle();
  roles[endIdx] = 'done';
  push(5, `The longest run overall ends at index ${endIdx} with length ${best}. Follow the prev pointers backwards to list its elements.`, roles, { [endIdx]: 'done' }, [['answer', best]]);
  const chain: number[] = [];
  for (let k = endIdx; k !== -1; k = prev[k]) chain.unshift(k);
  const seen: number[] = [];
  const cellRoles: Record<number, Role> = {};
  for (let c = chain.length - 1; c >= 0; c--) {
    const k = chain[c];
    seen.unshift(k);
    cellRoles[k] = 'done';
    const r = idle();
    seen.forEach((s) => (r[s] = 'done'));
    push(6, c === chain.length - 1 ? `Start at index ${k} (${arr[k]}).` : `Its predecessor is index ${k} (${arr[k]}).`, r, { ...cellRoles }, [['answer', best]], { [k]: 'k' }, [
      { label: 'LIS so far', items: seen.map((s) => token(String(arr[s]), 'done')) },
    ]);
  }
  const r = idle();
  chain.forEach((s) => (r[s] = 'done'));
  push(undefined, `Done: one longest increasing subsequence is ${chain.map((s) => arr[s]).join(', ')} (length ${best}).`, r, { ...cellRoles }, [['answer', best]], {}, [
    { label: 'LIS', items: chain.map((s) => token(String(arr[s]), 'done')) },
  ]);
  return frames;
}

export function lisTailsTrace(arr: number[]): Array<Frame<ArraySceneState>> {
  const n = arr.length;
  const tails: number[] = []; // values
  const tailIdx: number[] = []; // index into arr of each tail
  const prev = Array.from({ length: n }, () => -1);
  const frames: Array<Frame<ArraySceneState>> = [];
  const push = (line: number | undefined, caption: string, roles: Role[], cellRoles: Record<number, Role>, vars: Vars, pointers: Record<number, string> = {}, strips?: StripData[]) => {
    frames.push({
      line,
      caption,
      vars,
      state: scene(arr, roles, {
        pointers,
        rows: tails.length ? [{ label: 'tails', cells: tails.map((v, i) => ({ value: v, role: cellRoles[i] })) }] : [{ label: 'tails', cells: [{ value: '-' }] }],
        strips,
      }),
    });
  };
  const rolesFor = (i: number): Role[] => arr.map((_, k) => (k < i ? 'muted' : k === i ? 'active' : 'idle'));

  push(0, 'tails[k] holds the smallest possible last value of any increasing subsequence of length k + 1. It stays sorted, so each new value can be placed by binary search.', arr.map((): Role => 'idle'), {}, [['n', n]]);
  for (let i = 0; i < n; i++) {
    const x = arr[i];
    let lo = 0;
    let hi = tails.length;
    if (hi === 0) {
      push(2, `${x}: tails is empty, so ${x} starts the first subsequence.`, rolesFor(i), {}, [['x', x]], { [i]: 'x' });
    }
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      const cellRoles: Record<number, Role> = {};
      tails.forEach((_, k) => (cellRoles[k] = k < lo || k >= hi ? 'muted' : 'idle'));
      cellRoles[mid] = 'compare';
      const goRight = tails[mid] < x;
      push(
        3,
        `${x}: probe tails[${mid}] = ${tails[mid]}. ${goRight ? `${tails[mid]} < ${x}, so ${x} must go to the right of position ${mid}.` : `${tails[mid]} >= ${x}, so position ${mid} or something left of it can hold ${x}.`}`,
        rolesFor(i),
        cellRoles,
        [['x', x], ['lo', lo], ['hi', hi], ['mid', mid]],
        { [i]: 'x' },
      );
      if (goRight) lo = mid + 1;
      else hi = mid;
    }
    const pos = lo;
    prev[i] = pos > 0 ? tailIdx[pos - 1] : -1;
    if (pos === tails.length) {
      tails.push(x);
      tailIdx.push(i);
      push(4, `Search ends past the last tail: ${x} is larger than every tail, so it extends the longest subsequence to length ${tails.length}.`, rolesFor(i), { [pos]: 'active' }, [['x', x], ['pos', pos], ['length', tails.length]], { [i]: 'x' });
    } else {
      const old = tails[pos];
      tails[pos] = x;
      tailIdx[pos] = i;
      push(5, `Search ends at position ${pos}: replace tails[${pos}] = ${old} with ${x}. The length stays ${tails.length}, but a smaller tail leaves more room to grow later.`, rolesFor(i), { [pos]: 'active' }, [['x', x], ['pos', pos], ['length', tails.length]], { [i]: 'x' });
    }
  }
  const chain: number[] = [];
  for (let k = tailIdx[tails.length - 1]; k !== -1; k = prev[k]) chain.unshift(k);
  const done = arr.map((_, k): Role => (chain.includes(k) ? 'done' : 'muted'));
  const cellRoles: Record<number, Role> = {};
  tails.forEach((_, k) => (cellRoles[k] = 'done'));
  push(undefined, `Done: the longest increasing subsequence has length ${tails.length}. The tails array is NOT the subsequence itself; following the stored predecessors gives ${chain.map((k) => arr[k]).join(', ')}.`, done, cellRoles, [['answer', tails.length]], {}, [
    { label: 'LIS (via predecessors)', items: chain.map((k) => token(String(arr[k]), 'done')) },
  ]);
  return frames;
}

// ---------------------------------------------------------------- Kadane

export function parseKadane(text: string): number[] {
  return parseIntList(text, { min: 1, max: 16, lo: -99, hi: 99, what: 'numbers' });
}

export function kadaneTrace(arr: number[]): Array<Frame<ArraySceneState>> {
  const n = arr.length;
  const ending: number[] = [];
  const frames: Array<Frame<ArraySceneState>> = [];
  let best = arr[0];
  let bestLo = 0;
  let bestHi = 0;
  let curLo = 0;
  const push = (line: number | undefined, caption: string, i: number, curSum: number, final = false) => {
    const roles: Role[] = arr.map((_, k) => (k >= bestLo && k <= bestHi ? 'done' : k >= curLo && k <= i ? 'active' : k > i ? 'idle' : 'muted'));
    frames.push({
      line,
      caption,
      vars: [['i', i], ['cur', curSum], ['best', best]],
      state: scene(arr, roles, {
        pointers: final ? {} : { [i]: 'i' },
        range: final ? { lo: bestLo, hi: bestHi, label: 'best window' } : { lo: curLo, hi: i, label: 'current run' },
        rows: [{ label: 'best ending here', cells: arr.map((_, k) => ({ value: k < ending.length ? ending[k] : null, role: k === i && !final ? 'active' : undefined })) }],
        strips: [{ label: 'Best so far', items: [token(`${best} (indices ${bestLo}..${bestHi})`, 'done')] }],
      }),
    });
  };

  let cur = arr[0];
  ending.push(cur);
  push(0, `Start with the first element: the best run ending at index 0 is just ${cur}, and it is also the best overall so far.`, 0, cur);
  for (let i = 1; i < n; i++) {
    const x = arr[i];
    let caption: string;
    if (cur < 0) {
      caption = `The run so far sums to ${cur}, which is negative: carrying it forward would only lower ${x}. Restart the run at index ${i}.`;
      cur = x;
      curLo = i;
    } else {
      caption = `The run so far sums to ${cur} (not negative), so extending it is at least as good: ${cur} + ${x} = ${cur + x}.`;
      cur += x;
    }
    ending.push(cur);
    if (cur > best) {
      best = cur;
      bestLo = curLo;
      bestHi = i;
      caption += ` ${cur} beats the old best, so the best window is now indices ${bestLo}..${bestHi}.`;
    } else {
      caption += ` The best stays ${best}.`;
    }
    push(cur === x && curLo === i ? 3 : 4, caption, i, cur);
  }
  const sum = arr.slice(bestLo, bestHi + 1);
  push(6, `Done: the maximum subarray is [${sum.join(', ')}] at indices ${bestLo}..${bestHi} with sum ${best}.`, n - 1, cur, true);
  frames[frames.length - 1].vars = [['answer', best], ['start', bestLo], ['end', bestHi]];
  return frames;
}
