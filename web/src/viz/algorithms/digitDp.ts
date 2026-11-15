/**
 * Digit DP tracer: count the numbers in 0..n whose digit sum is a target, drawn with DpTableView.
 *
 * Mirrors Algorithms/Dynamic_Programming/Advanced_DP/Digit_DP/Python/digit_dp.py:
 * count_numbers_with_digit_sum(n, target_sum). The inner dp(pos, tight, current_sum) first
 * checks the base case (pos == len(digits): 1 if the sum is the target, never memoized), then the
 * memo, then tries d = 0..limit in order (limit = digits[pos] while tight, else 9) and calls
 * itself only when new_sum <= target_sum. A negative bound returns 0 before any call.
 * Golden fixtures (__fixtures__/advancedDp.json) pin every call in call order with its return
 * value, the memo in insertion order and the count.
 *
 * Input: "n 25, target 5" (or just "25 5").
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { DpTableState, DtCell, DtChip } from '../renderers/DpTableView';
import type { StripItem } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';

export interface DigitInput {
  n: number;
  target: number;
}

export const DIGIT_LIMITS = { nLo: -99, nHi: 99999, targetHi: 20, maxFrames: 2000 };

/** One call of dp(pos, tight, current_sum) and what it returned, in call order. */
export interface DigitCall {
  pos: number;
  tight: boolean;
  sum: number;
  value: number;
  kind: 'base' | 'memo' | 'computed';
}

export interface DigitRun {
  frames: Array<Frame<DpTableState>>;
  calls: DigitCall[];
  /** memo entries in insertion order: [pos, tight, sum, value]. */
  memo: Array<[number, boolean, number, number]>;
  count: number;
}

export const DIGIT_CODE = [
  'count_numbers_with_digit_sum(n, target_sum):',
  '  if n < 0: return 0',
  '  digits = list(map(int, str(n))); memo = {}',
  '  def dp(pos, tight, current_sum):',
  '    if pos == len(digits): return 1 if current_sum == target_sum else 0',
  '    key = (pos, tight, current_sum)',
  '    if key in memo: return memo[key]',
  '    limit = digits[pos] if tight else 9; count = 0',
  '    for d in range(limit + 1):',
  '      new_tight = tight and (d == limit); new_sum = current_sum + d',
  '      if new_sum <= target_sum: count += dp(pos + 1, new_tight, new_sum)',
  '    memo[key] = count',
  '    return count',
  '  return dp(0, True, 0)',
];

const T = (b: boolean) => (b ? 'True' : 'False');
const call = (pos: number, tight: boolean, sum: number) => `dp(${pos}, ${T(tight)}, ${sum})`;
const short = (pos: number, tight: boolean, sum: number) => `dp(${pos},${tight ? 'T' : 'F'},${sum})`;

/** "n 25, target 5", "25 5", "n=100 target=10". */
export function parseDigit(text: string): DigitInput {
  const t = text.trim();
  let n: string | undefined;
  let target: string | undefined;
  const named = [...t.matchAll(/(n|target|target_sum|sum|t)\s*[:=]?\s*(-?\d+)/gi)];
  if (named.length > 0) {
    for (const m of named) {
      if (m[1].toLowerCase() === 'n') n = m[2];
      else target = m[2];
    }
  } else {
    const nums = t.split(/[\s,;]+/).filter(Boolean);
    if (nums.length === 2 && nums.every((x) => /^-?\d+$/.test(x))) [n, target] = nums;
  }
  if (n === undefined || target === undefined) throw new InputError('Write the bound and the digit sum, for example "n 25, target 5".');
  const N = Number(n) || 0;
  const S = Number(target) || 0;
  if (N < DIGIT_LIMITS.nLo || N > DIGIT_LIMITS.nHi)
    throw new InputError(`n goes from ${DIGIT_LIMITS.nLo} to ${DIGIT_LIMITS.nHi} here, so the memo of five digit positions fits on screen (got ${n}).`);
  if (S < 0 || S > DIGIT_LIMITS.targetHi)
    throw new InputError(`The target digit sum goes from 0 to ${DIGIT_LIMITS.targetHi} here: the memo has one column per sum (got ${target}).`);
  const frames = digitFrameCount({ n: N, target: S });
  if (frames > DIGIT_LIMITS.maxFrames) {
    throw new InputError(`count(${N}, ${S}) makes ${frames} steps, more than the ${DIGIT_LIMITS.maxFrames} this player shows: use a smaller n or target.`);
  }
  return { n: N, target: S };
}

/**
 * The recursion of the Python code, reporting what happens through `on`. Used twice: to count
 * the frames a run will have (the parser's limit), and to record the frames.
 */
interface DigitEvents {
  /** A call starts; it is one of base / memo / computed. `d` is the digit its parent tried. */
  base(pos: number, tight: boolean, sum: number, value: number, d: number | null): void;
  memoHit(pos: number, tight: boolean, sum: number, value: number, d: number | null): void;
  enter(pos: number, tight: boolean, sum: number, limit: number, d: number | null): void;
  /** Back in the call (pos, tight, sum) after a child returned: count is the new count. */
  added(pos: number, tight: boolean, sum: number, d: number, value: number, count: number): void;
  pruned(pos: number, tight: boolean, sum: number, from: number, limit: number, count: number): void;
  leave(pos: number, tight: boolean, sum: number, count: number): void;
}

function runDigit({ n, target }: DigitInput, on: DigitEvents): { count: number; memo: Map<string, number>; order: Array<[number, boolean, number, number]> } {
  const digits = String(n).split('').map(Number);
  const memo = new Map<string, number>();
  const order: Array<[number, boolean, number, number]> = [];
  const dp = (pos: number, tight: boolean, sum: number, d: number | null): number => {
    if (pos === digits.length) {
      const v = sum === target ? 1 : 0;
      on.base(pos, tight, sum, v, d);
      return v;
    }
    const key = `${pos},${tight},${sum}`;
    if (memo.has(key)) {
      const v = memo.get(key)!;
      on.memoHit(pos, tight, sum, v, d);
      return v;
    }
    const limit = tight ? digits[pos] : 9;
    let count = 0;
    on.enter(pos, tight, sum, limit, d);
    for (let dd = 0; dd <= limit; dd++) {
      const newTight = tight && dd === limit;
      const newSum = sum + dd;
      if (newSum <= target) {
        const r = dp(pos + 1, newTight, newSum, dd);
        count += r;
        on.added(pos, tight, sum, dd, r, count);
      } else {
        // new_sum only grows with d, so every later digit fails the test too.
        on.pruned(pos, tight, sum, dd, limit, count);
        break;
      }
    }
    memo.set(key, count);
    order.push([pos, tight, sum, count]);
    on.leave(pos, tight, sum, count);
    return count;
  };
  const count = dp(0, true, 0, null);
  return { count, memo, order };
}

/** How many frames digitTrace makes, without building them. */
export function digitFrameCount(input: DigitInput): number {
  if (input.n < 0) return 1;
  let frames = 2; // the start and the final summary
  const one = () => {
    frames += 1;
  };
  runDigit(input, { base: one, memoHit: one, enter: one, added: () => undefined, pruned: one, leave: one });
  return frames;
}

export function digitTrace(input: DigitInput): DigitRun {
  const { n, target } = input;
  const frames: Array<Frame<DpTableState>> = [];
  const calls: DigitCall[] = [];
  if (n < 0) {
    frames.push({
      line: 1,
      caption: `n = ${n} is negative, so no number lies in 0..n: return 0 before converting n to digits. This keeps count(R) - count(L - 1) right when L = 0.`,
      vars: [
        ['n', n],
        ['target_sum', target],
        ['result', 0],
      ],
      state: { label: 'Digit DP: negative bound', tables: [], chips: [], note: `count_numbers_with_digit_sum(${n}, ${target}) = 0` },
    });
    return { frames, calls, memo: [], count: 0 };
  }
  const digits = String(n).split('').map(Number);
  const len = digits.length;
  /** Memo table rows: (pos, tight) for every reachable pair, then the base case row. */
  const rowKeys: Array<{ pos: number; tight: boolean | null }> = [];
  for (let p = 0; p < len; p++) {
    rowKeys.push({ pos: p, tight: true });
    if (p > 0) rowKeys.push({ pos: p, tight: false });
  }
  rowKeys.push({ pos: len, tight: null });
  const rowIndex = (pos: number, tight: boolean) => (pos === len ? rowKeys.length - 1 : rowKeys.findIndex((r) => r.pos === pos && r.tight === tight));

  const memo = new Map<string, number>();
  /** Index in `calls` of each open computed call (calls are listed in call order, as Python makes them). */
  const openCalls: number[] = [];
  /** Open calls, outermost first: their state, running count and the digit their parent tried. */
  const stack: Array<{ pos: number; tight: boolean; sum: number; count: number; d: number | null }> = [];

  interface Look {
    cells?: Record<string, Role>; // "row,col"
    extra?: Record<string, string>; // text overrides "row,col"
    tryDigit?: { pos: number; d: number; role: Role };
    /** A call that returns at once (base case or memo hit), shown on top of the stack for this frame. */
    transient?: { text: string; role: Role };
  }

  const snap = (line: number, caption: string, look: Look = {}, vars: Array<[string, string | number]> = []) => {
    const cells: Array<Array<DtCell | null>> = rowKeys.map((rk, r) =>
      Array.from({ length: target + 1 }, (_, s) => {
        const key = `${r},${s}`;
        let text: string | undefined;
        let role: Role | undefined = look.cells?.[key];
        if (rk.tight === null) {
          // Base case row: drawn for reference, never stored in the memo.
          text = s === target ? '1' : '0';
          role = role ?? 'muted';
        } else {
          const m = memo.get(`${rk.pos},${rk.tight},${s}`);
          if (m !== undefined) text = String(m);
        }
        const open = stack.find((f) => f.pos === rk.pos && f.tight === rk.tight && f.sum === s);
        if (open && text === undefined) {
          text = String(open.count);
          role = role ?? 'compare';
        }
        if (look.extra?.[key] !== undefined) text = look.extra[key];
        return text === undefined ? null : { text, role };
      }),
    );
    const top = stack[stack.length - 1];
    const prefix: DtChip[] = digits.map((_, p) => {
      const frame = stack.find((f) => f.pos === p + 1);
      if (look.tryDigit && look.tryDigit.pos === p) return { text: String(look.tryDigit.d), sub: String(p), role: look.tryDigit.role };
      return frame && frame.d !== null ? { text: String(frame.d), sub: String(p) } : { text: SYM.middot, sub: String(p), role: 'muted' };
    });
    const strip: StripItem[] = stack.map((f, i) => ({ text: short(f.pos, f.tight, f.sum), role: i === stack.length - 1 && !look.transient ? 'active' : 'compare' }));
    if (look.transient) strip.push(look.transient);
    frames.push({
      line,
      caption,
      vars: [['digits', `[${digits.join(', ')}]`], ['target_sum', target], ...vars, ['memo entries', memo.size]],
      state: {
        label: `Digit DP for n = ${n} and digit sum ${target}`,
        chips: [
          { label: 'n', chips: digits.map((d, p) => ({ text: String(d), sub: String(p), role: top && top.pos === p ? 'compare' : undefined })) },
          { label: 'digits tried', chips: prefix },
        ],
        tables: [
          {
            id: 'memo',
            title: 'memo[(pos, tight, current_sum)]',
            corner: 'pos, tight \\ sum',
            rowHeaders: rowKeys.map((rk) => (rk.tight === null ? `${rk.pos} = len (base)` : `${rk.pos}, ${rk.tight ? 'tight' : 'free'}`)),
            colHeaders: Array.from({ length: target + 1 }, (_, s) => String(s)),
            cells,
            rowRoles: top && !look.cells ? { [rowIndex(top.pos, top.tight)]: 'active' } : undefined,
            cellW: 30,
          },
        ],
        strips: [{ label: 'Call stack', items: strip.length ? strip : [{ text: SYM.emptySet, role: 'muted' }] }],
      },
    });
  };

  const cellKey = (pos: number, tight: boolean, sum: number) => `${rowIndex(pos, tight)},${sum}`;
  const via = (d: number | null, pos: number, tight: boolean, sum: number) => {
    if (d === null) return '';
    const parent = stack[stack.length - 1];
    return (
      `Back in ${short(parent.pos, parent.tight, parent.sum)}, try d = ${d}: new_sum = ${parent.sum} + ${d} = ${sum} <= ${target}` +
      (parent.tight ? `, new_tight = ${T(tight)}${tight ? ` (d equals the limit ${d})` : ' (d is below the limit, so later digits are free)'}` : '') +
      `, so call ${call(pos, tight, sum)}. `
    );
  };
  /** After a child returned: the parent's running count, for the same frame's caption. */
  const tell = (value: number) => {
    const parent = stack[stack.length - 1];
    if (!parent) return '';
    parent.count += value;
    return ` ${short(parent.pos, parent.tight, parent.sum)} adds it: count = ${parent.count}.`;
  };

  snap(
    2,
    `digits = [${digits.join(', ')}] and memo = {}. Every number in 0..${n} is a string of ${len} digit${len === 1 ? '' : 's'} with leading zeros (7 is ${String(7).padStart(len, '0')}), so dp(0, True, 0) counts the ways to fill the positions left to right ` +
      `without passing ${n}: tight means "equal to the bound so far". Call dp(0, True, 0).`,
    {},
    [['n', n]],
  );

  const result = runDigit(input, {
    base(pos, tight, sum, value, d) {
      const pre = via(d, pos, tight, sum);
      calls.push({ pos, tight, sum, value, kind: 'base' });
      const r = rowIndex(pos, tight);
      const added = tell(value);
      snap(
        4,
        `${pre}${call(pos, tight, sum)}: pos == len(digits), every position is filled. The digit sum is ${sum}, ${sum === target ? `equal to ${target}, so this is one number: return 1` : `not ${target}, so return 0`}.${added}`,
        {
          cells: { [`${r},${sum}`]: value ? 'good' : 'bad' },
          tryDigit: d === null ? undefined : { pos: pos - 1, d, role: 'active' },
          transient: { text: short(pos, tight, sum), role: 'active' },
        },
        [
          ['pos', pos],
          ['current_sum', sum],
          ['returns', value],
        ],
      );
    },
    memoHit(pos, tight, sum, value, d) {
      const pre = via(d, pos, tight, sum);
      calls.push({ pos, tight, sum, value, kind: 'memo' });
      const added = tell(value);
      snap(
        6,
        `${pre}(${pos}, ${T(tight)}, ${sum}) is already in memo: return ${value} at once. A different prefix reached the same state before, and the rest of the number does not care how.${added}`,
        {
          cells: { [cellKey(pos, tight, sum)]: 'good' },
          tryDigit: d === null ? undefined : { pos: pos - 1, d, role: 'active' },
          transient: { text: short(pos, tight, sum), role: 'active' },
        },
        [
          ['pos', pos],
          ['tight', T(tight)],
          ['current_sum', sum],
          ['memo hit', value],
        ],
      );
    },
    enter(pos, tight, sum, limit, d) {
      const pre = via(d, pos, tight, sum);
      openCalls.push(calls.length);
      calls.push({ pos, tight, sum, value: -1, kind: 'computed' });
      stack.push({ pos, tight, sum, count: 0, d });
      snap(
        7,
        `${pre}${call(pos, tight, sum)} is not in memo. ` +
          (tight
            ? `tight is True: the digits so far equal the bound's, so this digit may go up to digits[${pos}] = ${limit}.`
            : 'tight is False: an earlier digit was already smaller than the bound, so this digit may be anything from 0 to 9.') +
          ` count = 0; try d = 0..${limit}.`,
        { cells: { [cellKey(pos, tight, sum)]: 'active' }, extra: { [cellKey(pos, tight, sum)]: '0' } },
        [
          ['pos', pos],
          ['tight', T(tight)],
          ['current_sum', sum],
          ['limit', limit],
        ],
      );
    },
    added() {
      // Already told by the child's last frame.
    },
    pruned(pos, tight, sum, from, limit, count) {
      const top = stack[stack.length - 1];
      snap(
        10,
        `Back in ${short(pos, tight, sum)}: d = ${from}${from < limit ? `..${limit}` : ''} would make the sum ${sum + from}${from < limit ? `..${sum + limit}` : ''} > ${target}. ` +
          'new_sum <= target_sum fails, so no call is made: a sum that is already too big can only grow.',
        { cells: { [cellKey(pos, tight, sum)]: 'active' }, extra: { [cellKey(pos, tight, sum)]: String(top.count) }, tryDigit: { pos, d: from, role: 'bad' } },
        [
          ['pos', pos],
          ['d', from],
          ['new_sum', sum + from],
          ['count', count],
        ],
      );
    },
    leave(pos, tight, sum, count) {
      stack.pop();
      memo.set(`${pos},${tight},${sum}`, count);
      calls[openCalls.pop()!].value = count;
      const added = tell(count);
      snap(
        11,
        `${call(pos, tight, sum)} has tried every allowed digit: memo[(${pos}, ${T(tight)}, ${sum})] = ${count}, return ${count}.` + (stack.length ? added : ''),
        { cells: { [cellKey(pos, tight, sum)]: 'done' } },
        [
          ['pos', pos],
          ['tight', T(tight)],
          ['current_sum', sum],
          ['returns', count],
        ],
      );
    },
  });

  snap(
    13,
    `dp(0, True, 0) = ${result.count}: ${result.count === 0 ? 'no number' : result.count === 1 ? 'one number' : `${result.count} numbers`} in 0..${n} ${result.count > 1 ? 'have' : 'has'} digit sum ${target}. ` +
      `The memo holds ${memo.size} states, while a loop would test ${n + 1} numbers.`,
    { cells: { [cellKey(0, true, 0)]: 'done' } },
    [['result', result.count]],
  );
  return { frames, calls, memo: result.order, count: result.count };
}

/** Brute force: the numbers in 0..n with the digit sum (for the tests). */
export function digitBrute(n: number, target: number): number {
  let c = 0;
  for (let x = 0; x <= n; x++) {
    let s = 0;
    for (const ch of String(x)) s += Number(ch);
    if (s === target) c++;
  }
  return c;
}
