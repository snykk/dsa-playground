/**
 * Amortized analysis tracers, drawn with AmortizedView: the array (or the counter's bits) on
 * top, the cost of every operation as a bar chart below, with the lines of the chosen method.
 *
 * Mirrors Complexity_Analysis/Amortized_Analysis/Python/amortized_analysis.py:
 *   DynamicArray(initial_capacity=4): append() calls _resize() when size >= capacity;
 *     _resize() sets capacity = max(1, capacity * 2), copies the old_capacity elements one by
 *     one into new_data and adds old_capacity to copies; then append writes data[size].
 *   'aggregate'   aggregate_method_example: n appends; the total cost n + copies against 3n.
 *   'accounting'  accounting_method_example: charge = 3, actual_cost = 1 + (copies - copies_before),
 *                 bank += charge - actual_cost. The coins are the bank: an append stores its 2
 *                 spare coins on the cell it writes, and a copy spends one coin, taken from the
 *                 newest savings first (the cells appended since the last resize).
 *   'potential'   potential_method_example: potential = 2 * size - capacity, actual_cost =
 *                 old_capacity + 1 when the capacity grew (else 1), amortized = actual + delta.
 *   BinaryCounter(n_bits=8).increment(): trailing 1s flip to 0, then the first 0 flips to 1
 *     (none when every bit was 1: the counter wraps to 0); flips counts every flip. The coins
 *     on the 1 bits are the article's accounting argument: 2 per increment, 1 pays the 0-to-1
 *     flip and 1 waits on that bit for its 1-to-0 flip.
 * The demos fix their numbers (capacity 4 and 10 appends; capacity 2 and 8 appends; 4 bits
 * and 10 increments); here the reader picks them. Golden fixtures (__fixtures__/complexity.json)
 * pin size, capacity, copies and data after every append, the demos' printed actual cost, bank
 * and amortized cost, and the bits, flips and value after every increment.
 *
 * Input: "cap 2, n 8" (dynamic array), "bits 4, n 10" (counter)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { AmortizedState, ChartLine, CoinCellView } from '../renderers/AmortizedView';

export type AmortizedMethod = 'aggregate' | 'accounting' | 'potential';

export interface ArrayInput {
  capacity: number;
  appends: number;
}

export interface CounterInput {
  bits: number;
  increments: number;
}

export const AMORTIZED_LIMITS = { maxCapacity: 12, maxAppends: 24, maxSlots: 24, maxBits: 10, maxIncrements: 40 };
/** DynamicArray(initial_capacity=4) and BinaryCounter(n_bits=8): the Python defaults. */
export const PYTHON_DEFAULTS = { capacity: 4, bits: 8 };

/* ---------- input ---------- */

function settings(text: string, names: Record<string, string>, example: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const seg of text.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean)) {
    const m = seg.toLowerCase().match(/^([a-z_]+(?:\s+[a-z_]+)?)\s*(?:=|\s)\s*x?(-?\d+)$/) ?? seg.toLowerCase().match(/^([a-z_]+)\s*x(\d+)$/);
    const key = m ? names[m[1].replace(/\s+/g, '_')] : undefined;
    if (!m || !key) throw new InputError(`Cannot read "${seg}". Write settings like ${example}, separated by commas.`);
    if (key in out) throw new InputError(`Give ${key} only once.`);
    out[key] = Number(m[2]);
  }
  return out;
}

/** Final capacity after `appends` appends from `capacity`, by DynamicArray's rule. */
export function finalCapacity(capacity: number, appends: number): number {
  let cap = capacity;
  for (let size = 0; size < appends; size++) if (size >= cap) cap = Math.max(1, cap * 2);
  return cap;
}

export function parseArrayRun(text: string): ArrayInput {
  const s = settings(
    text,
    { cap: 'capacity', capacity: 'capacity', initial_capacity: 'capacity', n: 'appends', appends: 'appends', append: 'appends', operations: 'appends', ops: 'appends' },
    '"cap 2, n 8"',
  );
  const capacity = s.capacity ?? PYTHON_DEFAULTS.capacity;
  const appends = s.appends ?? 10;
  if (capacity < 0) throw new InputError(`initial_capacity ${capacity} is negative: [None] * ${capacity} would be an empty list, but the size test would never let an append in. Use 0 or more.`);
  if (capacity > AMORTIZED_LIMITS.maxCapacity) throw new InputError(`initial_capacity goes up to ${AMORTIZED_LIMITS.maxCapacity} here (got ${capacity}).`);
  if (appends < 1 || appends > AMORTIZED_LIMITS.maxAppends) throw new InputError(`Between 1 and ${AMORTIZED_LIMITS.maxAppends} appends, please (got ${appends}).`);
  const last = finalCapacity(capacity, appends);
  if (last > AMORTIZED_LIMITS.maxSlots) {
    throw new InputError(`${appends} appends from capacity ${capacity} grow the array to ${last} slots, more than the ${AMORTIZED_LIMITS.maxSlots} that fit on screen: use fewer appends or another capacity.`);
  }
  return { capacity, appends };
}

export function parseCounterRun(text: string): CounterInput {
  const s = settings(text, { bits: 'bits', n_bits: 'bits', n: 'increments', increments: 'increments', increment: 'increments', ops: 'increments' }, '"bits 4, n 10"');
  const bits = s.bits ?? PYTHON_DEFAULTS.bits;
  const increments = s.increments ?? 10;
  if (bits < 1 || bits > AMORTIZED_LIMITS.maxBits) throw new InputError(`n_bits goes from 1 to ${AMORTIZED_LIMITS.maxBits} here (got ${bits}).`);
  if (increments < 1 || increments > AMORTIZED_LIMITS.maxIncrements) throw new InputError(`Between 1 and ${AMORTIZED_LIMITS.maxIncrements} increments, please (got ${increments}).`);
  return { bits, increments };
}

/* ---------- pseudocode ---------- */

export const AMORTIZED_CODE: Record<AmortizedMethod | 'counter', string[]> = {
  aggregate: [
    'arr = DynamicArray(initial_capacity)        # 4 when not given',
    'for i in range(operations): arr.append(i)',
    '  append: if self.size >= self.capacity: self._resize()',
    '  _resize: self.capacity = max(1, self.capacity * 2); new_data = [None] * self.capacity',
    '  _resize: for i in range(old_capacity): new_data[i] = self.data[i]   # 1 per copy',
    '  _resize: self.copies += old_capacity; self.data = new_data',
    '  append: self.data[self.size] = value; self.size += 1                # 1 per write',
    'total cost = operations + arr.copies: at most 3 per append',
  ],
  accounting: [
    'arr = DynamicArray(initial_capacity); charge = 3; bank = 0',
    'for i in range(n): copies_before = arr.copies; arr.append(i)',
    '  append: if self.size >= self.capacity: self._resize()     # full: double',
    '  _resize: new_data[i] = self.data[i] for every old element  # each copy costs 1 coin',
    '  _resize: self.data = new_data',
    '  append: self.data[self.size] = value; self.size += 1',
    '  actual_cost = 1 + (arr.copies - copies_before)            # own write + copies',
    '  bank += charge - actual_cost                              # never below 0',
  ],
  potential: [
    'arr = DynamicArray(initial_capacity); potential(arr) = 2 * arr.size - arr.capacity',
    'prev_potential = potential(arr)',
    'for i in range(n): old_capacity = arr.capacity; arr.append(i)',
    '  _resize: capacity = max(1, capacity * 2); copy the old_capacity elements',
    '  append: self.data[self.size] = value; self.size += 1',
    '  delta_potential = potential(arr) - prev_potential',
    '  actual_cost = old_capacity + 1 if arr.capacity > old_capacity else 1',
    '  amortized_cost = actual_cost + delta_potential; prev_potential = potential(arr)',
  ],
  counter: [
    'counter = BinaryCounter(n_bits)              # 8 when not given',
    'for _ in range(n): counter.increment()',
    '  increment: i = 0',
    '  while i < self.n_bits and self.bits[i] == 1:',
    '    self.bits[i] = 0; self.flips += 1; i += 1     # a trailing 1 becomes 0',
    '  if i < self.n_bits: self.bits[i] = 1; self.flips += 1   # the first 0 becomes 1',
    'total flips after n increments <= 2n',
  ],
};

const LINES = {
  aggregate: { resize: 3, copy: 4, swap: 5, write: 6, check: 2, done: 7 },
  accounting: { resize: 2, copy: 3, swap: 4, write: 7, check: 2, done: 7 },
  potential: { resize: 3, copy: 3, swap: 3, write: 7, check: 2, done: 7 },
};

/* ---------- the dynamic array ---------- */

export interface AppendStep {
  size: number;
  capacity: number;
  copies: number;
  data: Array<number | null>;
  /** 1 + the copies this append made. */
  actual: number;
  /** accounting_method_example's bank after this append. */
  bank: number;
  /** potential_method_example: 2 * size - capacity after this append, and actual + delta. */
  phi: number;
  amortized: number;
}

export interface ArrayRun {
  frames: Array<Frame<AmortizedState>>;
  steps: AppendStep[];
  phi0: number;
}

interface Elem {
  key: string;
  value: number;
  coins: number;
}

export function traceDynamicArray(input: ArrayInput, method: AmortizedMethod): ArrayRun {
  const at = LINES[method];
  const n = input.appends;
  let capacity = input.capacity;
  let size = 0;
  let copies = 0;
  let data: Array<Elem | null> = new Array(capacity).fill(null);
  let fresh: Array<Elem | null> | null = null;
  const copied = new Set<number>();
  let gen = 0;
  /** The coins drawn on the cells (accounting): spent one copy at a time. */
  let bank = 0;
  /** accounting_method_example's bank, updated once per append as the demo does. */
  let ledger = 0;
  const charge = 3;
  const phi0 = 2 * 0 - capacity;
  const steps: AppendStep[] = [];
  const frames: Array<Frame<AmortizedState>> = [];
  /** Per append: its cost so far (a bar), and the line values after it. */
  const bars: Array<{ value: number; role?: Role }> = [];
  const totals: Array<[number, number]> = [[0, 0]];
  const banks: Array<[number, number]> = [[0, 0]];
  const phis: Array<[number, number]> = [[0, phi0]];
  const amortized: Array<[number, number]> = [];
  let spentCoins: Record<string, number> = {};
  let newCoins: Record<string, number> = {};
  const potential = () => 2 * size - capacity;

  const cellsOf = (slots: Array<Elem | null>, row: number, roles: Record<number, Role>): CoinCellView[] =>
    slots.map((e, k) => {
      if (row === 0 && copied.has(k) && e) {
        // A stale copy left in the old block while the new block fills.
        return { key: `s${gen}:${k}`, value: String(e.value), role: 'muted' as Role, coins: 0 };
      }
      return e
        ? { key: e.key, value: String(e.value), role: roles[k], coins: method === 'accounting' ? e.coins : 0, newCoins: newCoins[e.key], spentCoins: spentCoins[e.key] }
        : { key: `e${row}:${gen}:${k}`, value: null };
    });

  const snap = (line: number | undefined, caption: string, o: { roles?: Record<number, Role>; freshRoles?: Record<number, Role>; vars?: Array<[string, string | number]> } = {}) => {
    const lines: ChartLine[] = [];
    let yMin = 0;
    let yMax = 1;
    const maxBar = Math.max(1, ...bars.map((b) => b.value));
    if (method === 'aggregate') {
      lines.push({ id: 'total', label: 'total cost', points: [...totals], role: 'active', dots: true });
      lines.push({ id: 'bound', label: '3n', points: [[0, 0], [n, 3 * n]], role: 'compare', dashed: true });
      yMax = Math.max(3 * n, ...totals.map((p) => p[1]));
    } else if (method === 'accounting') {
      lines.push({ id: 'charge', label: 'charged 3', points: [[0.5, charge], [n + 0.5, charge]], role: 'compare', dashed: true });
      lines.push({ id: 'bank', label: 'bank', points: [...banks], role: 'done', dots: true });
      yMax = Math.max(charge, maxBar, ...banks.map((p) => p[1]));
    } else {
      lines.push({ id: 'phi', label: 'potential', points: [...phis], role: 'done', dots: true });
      lines.push({ id: 'amortized', label: 'amortized', points: [...amortized], role: 'compare', dots: true, noLine: true });
      yMin = Math.min(0, ...phis.map((p) => p[1]));
      yMax = Math.max(3, maxBar, ...phis.map((p) => p[1]));
    }
    const blocks: AmortizedState['blocks'] = [
      { id: `blk${gen}`, label: 'data', sub: `capacity ${data.length}`, row: 0, cells: cellsOf(data, 0, o.roles ?? {}) },
    ];
    if (fresh) blocks.push({ id: `blk${gen + 1}`, label: 'new_data', sub: `capacity ${fresh.length}`, row: 1, role: 'active', cells: cellsOf(fresh, 1, o.freshRoles ?? {}) });
    const readouts: AmortizedState['readouts'] = [
      { label: 'size', value: String(size) },
      { label: 'capacity', value: String(capacity) },
      { label: 'copies', value: String(copies) },
    ];
    if (method === 'aggregate') readouts.push({ label: 'total cost', value: String(size + copies), role: 'active' });
    if (method === 'accounting') readouts.push({ label: 'bank', value: String(bank), role: 'done' });
    if (method === 'potential') readouts.push({ label: 'potential', value: String(potential()), role: 'done' });
    frames.push({
      line,
      caption,
      vars: [...(o.vars ?? []), ['size', size], ['capacity', capacity], ['copies', copies], ...(method === 'accounting' ? [['bank', bank] as [string, number]] : []), ...(method === 'potential' ? [['potential', potential()] as [string, number]] : [])],
      state: {
        blocks,
        chart: {
          title: method === 'aggregate' ? 'cost of each append, and the running total' : method === 'accounting' ? 'actual cost of each append, and the bank' : 'actual cost of each append, and the potential',
          barLabel: 'cost of one append',
          xLabel: 'append',
          xMax: n,
          yMin,
          yMax,
          bars: bars.map((b, k) => ({ x: k + 1, value: b.value, role: b.role })),
          lines,
        },
        readouts,
        coins: method === 'accounting',
      },
    });
  };

  const intro: Record<AmortizedMethod, string> = {
    aggregate: `DynamicArray(${input.capacity}) and ${n} appends. Aggregate method: add up the real cost of all of them (1 per write, 1 per element a resize copies) and compare the total with 3n.`,
    accounting: `DynamicArray(${input.capacity}) and ${n} appends. Accounting method: charge every append 3 coins. A write costs 1 and a copy costs 1; the spare coins wait on the array as savings, and the bank must never go below 0.`,
    potential: `DynamicArray(${input.capacity}) and ${n} appends. Potential method: potential = 2 * size - capacity starts at ${phi0}. Each append costs its actual cost plus the change in potential, and that sum stays at most 3.`,
  };
  snap(undefined, intro[method]);

  for (let i = 0; i < n; i++) {
    const copiesBefore = copies;
    const oldCapacity = capacity;
    const prevPhi = potential();
    bars.push({ value: 0, role: 'active' });
    if (size >= capacity) {
      // _resize(): capacity = max(1, capacity * 2); copy the old_capacity elements one by one.
      capacity = Math.max(1, capacity * 2);
      fresh = new Array(capacity).fill(null);
      snap(
        at.resize,
        `append(${i}): size = ${size} >= capacity = ${oldCapacity}, so the array is full and _resize() runs first: capacity = max(1, ${oldCapacity} * 2) = ${capacity}, and new_data has ${capacity} empty slots.` +
          (method === 'potential' ? ` The potential drops to 2 * ${size} - ${capacity} = ${potential()}.` : ''),
        { vars: [['i', i]] },
      );
      for (let k = 0; k < oldCapacity; k++) {
        const e = data[k] as Elem;
        fresh[k] = e;
        copied.add(k);
        copies += 1;
        bars[i].value += 1;
        totals.push([i + (k + 1) / (oldCapacity + 1), totals[totals.length - 1][1] + 1]);
        let payer = '';
        spentCoins = {};
        newCoins = {};
        if (method === 'accounting') {
          // A copy spends one coin: from the newest savings (the rightmost cell that has one).
          const rich = data.filter((x): x is Elem => x !== null && x.coins > 0);
          const from = rich[rich.length - 1];
          if (from) {
            from.coins -= 1;
            spentCoins[from.key] = 1;
            payer = ` One coin from the savings on ${from.value} pays for it: bank ${bank} -> ${bank - 1}.`;
          }
          bank -= 1;
          banks.push([i + (k + 1) / (oldCapacity + 1), bank]);
        }
        snap(at.copy, `new_data[${k}] = self.data[${k}]: copy ${e.value} (copy ${k + 1} of ${oldCapacity}). This append now costs ${bars[i].value} so far.${payer}`, {
          freshRoles: { [k]: 'active' },
          vars: [['i', i]],
        });
      }
      spentCoins = {};
      data = fresh;
      fresh = null;
      copied.clear();
      gen += 1;
      snap(at.swap, `self.copies += ${oldCapacity} (now ${copies}) and self.data = new_data: the old block is dropped. The resize copied ${oldCapacity} element${oldCapacity === 1 ? '' : 's'}.`, {
        vars: [['i', i]],
      });
    }
    const e: Elem = { key: `v${i}`, value: i, coins: 0 };
    data[size] = e;
    size += 1;
    bars[i].value += 1;
    bars[i].role = undefined;
    const actual = 1 + (copies - copiesBefore);
    const phi = potential();
    const amort = actual + phi - prevPhi;
    ledger += charge - actual;
    totals.push([i + 1, i + 1 + copies]);
    let caption = `self.data[${size - 1}] = ${i}; size = ${size}. `;
    newCoins = {};
    spentCoins = {};
    if (method === 'aggregate') {
      caption += `This append cost ${actual} (${actual > 1 ? `${actual - 1} copies + ` : ''}1 write). Total so far: ${i + 1} writes + ${copies} copies = ${i + 1 + copies} <= 3 * ${i + 1} = ${3 * (i + 1)}.`;
    } else if (method === 'accounting') {
      e.coins = charge - 1;
      newCoins[e.key] = charge - 1;
      bank += charge - 1;
      caption += `actual_cost = 1 + ${copies - copiesBefore} = ${actual}; it was charged 3: 1 pays the write and the other 2 wait on the new cell. bank += 3 - ${actual}, so bank = ${bank}.`;
      banks.push([i + 1, bank]);
    } else {
      phis.push([i + 1, phi]);
      amortized.push([i + 1, amort]);
      caption += `potential = 2 * ${size} - ${capacity} = ${phi} (it was ${prevPhi}). actual_cost = ${actual}${actual > 1 ? ` (${oldCapacity} copies + 1)` : ''}, so amortized_cost = ${actual} + (${phi - prevPhi}) = ${amort}.`;
    }
    snap(at.write, caption, { roles: { [size - 1]: 'active' }, vars: [['i', i], ['actual_cost', actual]] });
    newCoins = {};
    steps.push({ size, capacity, copies, data: data.map((x) => (x ? x.value : null)), actual, bank: ledger, phi, amortized: amort });
  }
  const total = n + copies;
  const done: Record<AmortizedMethod, string> = {
    aggregate: `Done: ${n} writes + ${copies} copies = ${total} for ${n} appends, ${(total / n).toFixed(2)} per append, within 3n = ${3 * n}. Doubling makes the copies add up to less than 2n, so an append is O(1) amortized, even though one append cost ${Math.max(...steps.map((s) => s.actual))}.`,
    accounting: `Done: ${n} appends were charged ${3 * n} coins and really cost ${total}; the bank ends at ${bank} and never went below 0. So 3 per append always pays: O(1) amortized.`,
    potential: `Done: the potential went from ${phi0} to ${potential()}, never below where it started, and every amortized cost was at most 3. The amortized costs add up to ${steps.reduce((s, x) => s + x.amortized, 0)} >= the actual total ${total}: O(1) per append.`,
  };
  snap(at.done, done[method]);
  return { frames, steps, phi0 };
}

/* ---------- the binary counter ---------- */

export interface IncrementStep {
  /** self.bits, least significant first (as Python stores it). */
  bits: number[];
  flips: number;
  value: number;
  /** Flips made by this increment. */
  cost: number;
}

export interface CounterRun {
  frames: Array<Frame<AmortizedState>>;
  steps: IncrementStep[];
}

export function traceBinaryCounter(input: CounterInput): CounterRun {
  const nBits = input.bits;
  const n = input.increments;
  const bits = new Array<number>(nBits).fill(0);
  let flips = 0;
  const steps: IncrementStep[] = [];
  const frames: Array<Frame<AmortizedState>> = [];
  const bars: Array<{ value: number; role?: Role }> = [];
  const totals: Array<[number, number]> = [[0, 0]];
  let spent: number | null = null;
  let placed: number | null = null;
  const value = () => bits.reduce((s, b, i) => s + b * 2 ** i, 0);
  const text = () => [...bits].reverse().join('');

  const snap = (line: number | undefined, caption: string, roles: Record<number, Role> = {}, vars: Array<[string, string | number]> = []) => {
    // Most significant bit on the left, as the demo prints it.
    const cells: CoinCellView[] = [];
    for (let i = nBits - 1; i >= 0; i--) {
      cells.push({ key: `b${i}`, value: String(bits[i]), role: roles[i] ?? (bits[i] === 1 ? 'done' : undefined), coins: bits[i], newCoins: placed === i ? 1 : undefined, spentCoins: spent === i ? 1 : undefined });
    }
    frames.push({
      line,
      caption,
      vars: [...vars, ['bits', text()], ['value', value()], ['flips', flips]],
      state: {
        blocks: [{ id: 'bits', label: 'bits', sub: `${nBits} bits`, row: 0, cells, indexLabels: Array.from({ length: nBits }, (_, k) => String(nBits - 1 - k)) }],
        chart: {
          title: 'flips of each increment, and the total',
          barLabel: 'flips of one increment',
          xLabel: 'increment',
          xMax: n,
          yMin: 0,
          yMax: Math.max(2 * n, flips),
          bars: bars.map((b, k) => ({ x: k + 1, value: b.value, role: b.role })),
          lines: [
            { id: 'total', label: 'total flips', points: [...totals], role: 'active', dots: true },
            { id: 'bound', label: '2n', points: [[0, 0], [n, 2 * n]], role: 'compare', dashed: true },
          ],
        },
        readouts: [
          { label: 'value', value: String(value()) },
          { label: 'flips', value: String(flips) },
          { label: 'coins', value: String(bits.reduce((s, b) => s + b, 0)), role: 'done' },
        ],
        coins: true,
      },
    });
  };

  snap(undefined, `BinaryCounter(${nBits}): ${nBits} bits, all 0. An increment flips the trailing 1s to 0 and then the first 0 to 1. The coins show the accounting argument: each 1 bit keeps 1 coin to pay for flipping back.`);
  for (let k = 0; k < n; k++) {
    const before = value();
    bars.push({ value: 0, role: 'active' });
    let i = 0;
    while (i < nBits && bits[i] === 1) {
      bits[i] = 0;
      flips += 1;
      bars[k].value += 1;
      totals.push([k + (bars[k].value / (nBits + 1)), flips]);
      spent = i;
      snap(4, `Increment ${k + 1}: bits[${i}] is 1, so it flips to 0 (flips = ${flips}) and the carry moves on to bit ${i + 1}. The coin waiting on this bit pays for the flip.`, { [i]: 'active' }, [['i', i]]);
      spent = null;
      i += 1;
    }
    if (i < nBits) {
      bits[i] = 1;
      flips += 1;
      bars[k].value += 1;
      placed = i;
      totals.push([k + 1, flips]);
      snap(
        5,
        `Increment ${k + 1}: bits[${i}] is 0, so it flips to 1 (flips = ${flips}). ${before} -> ${value()} (${text()}): this increment flipped ${bars[k].value} bit${bars[k].value === 1 ? '' : 's'}. Of its 2 coins, 1 pays this flip and 1 stays on bit ${i}.`,
        { [i]: 'active' },
        [['i', i]],
      );
      placed = null;
    } else {
      totals.push([k + 1, flips]);
      snap(
        3,
        `Increment ${k + 1}: every bit was 1, so i reached n_bits = ${nBits} and no bit is set: the counter wraps from ${before} to 0. This increment flipped ${bars[k].value} bits, all paid by their own coins.`,
        {},
        [['i', i]],
      );
    }
    bars[k].role = undefined;
    steps.push({ bits: [...bits], flips, value: value(), cost: bars[k].value });
  }
  const most = Math.max(...steps.map((s) => s.cost));
  snap(6, `Done: ${n} increments made ${flips} flips, at most 2n = ${2 * n}, although one increment flipped ${most} bit${most === 1 ? '' : 's'}. Bit i flips every 2^i increments, so the flips add up to less than n + n/2 + n/4 + ... < 2n: O(1) amortized.`);
  return { frames, steps };
}
