/**
 * Space complexity tracers, drawn with MemoryView: the call stack on the left, every list a live
 * frame can reach as a row of cells next to the frame that owns it, and a timeline of the memory
 * in use after every step with its peak.
 *
 * Mirrors Complexity_Analysis/Space_Complexity/Python/space_complexity.py:
 *   'stack'  recursive_fibonacci_naive(n) and logarithmic_space_example(n): frames only
 *   'merge'  merge_sort_space(arr): the slices arr[:mid] / arr[mid:], left, right and result
 *   'loops'  constant_space_example(n), linear_space_example(n), quadratic_space_example(n),
 *            in_place_reverse(arr)
 * Memory is counted in units: one per frame of the example on the stack (its few scalar
 * variables are a fixed size) plus one per cell of every list that the locals of a live frame
 * reach, nested lists included and each list once. The input list is not counted (auxiliary
 * space). A base case of merge_sort_space returns arr itself, so that slice lives on as the
 * caller's left or right; any other slice dies with the call it was made for.
 * Golden fixtures (__fixtures__/complexity.json) pin, for each run, every call (its argument and
 * depth), the frames and cells alive at every return, the peaks and the result. The generator
 * measures them on the Python code with sys.settrace, walking the locals of the live frames.
 *
 * Input: "fib 6" / "log 16" (stack), "38 27 43 3 9 82 10" (merge), "quadratic 4" / "reverse 1 2 3" (loops)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { MemCellView, MemListView, MemMarkerView, MemoryState, MemTreeView } from '../renderers/MemoryView';

export type SpaceFamily = 'stack' | 'merge' | 'loops';
export type SpaceExample = 'fib' | 'log' | 'merge' | 'constant' | 'linear' | 'quadratic' | 'reverse';

export interface SpaceInput {
  example: SpaceExample;
  /** n for fib, log, constant, linear, quadratic. */
  n: number;
  /** The list for merge and reverse. */
  arr: number[];
}

export const SPACE_LIMITS = { fib: 10, log: 64, merge: 8, constant: 20, linear: 16, quadratic: 6, reverse: 16 };

export const PYTHON_NAMES: Record<SpaceExample, string> = {
  fib: 'recursive_fibonacci_naive',
  log: 'logarithmic_space_example',
  merge: 'merge_sort_space',
  constant: 'constant_space_example',
  linear: 'linear_space_example',
  quadratic: 'quadratic_space_example',
  reverse: 'in_place_reverse',
};

/* ---------- input ---------- */

const ALIASES: Record<string, SpaceExample> = {
  fib: 'fib',
  fibonacci: 'fib',
  recursive_fibonacci_naive: 'fib',
  log: 'log',
  logarithmic: 'log',
  logarithmic_space_example: 'log',
  half: 'log',
  constant: 'constant',
  constant_space_example: 'constant',
  linear: 'linear',
  linear_space_example: 'linear',
  quadratic: 'quadratic',
  quadratic_space_example: 'quadratic',
  matrix: 'quadratic',
  reverse: 'reverse',
  in_place_reverse: 'reverse',
};

const FAMILY_OF: Record<SpaceExample, SpaceFamily> = { fib: 'stack', log: 'stack', merge: 'merge', constant: 'loops', linear: 'loops', quadratic: 'loops', reverse: 'loops' };
const FAMILY_EXAMPLES: Record<SpaceFamily, string> = {
  stack: '"fib 6" or "log 16"',
  merge: 'a list such as "38 27 43 3 9 82 10"',
  loops: '"constant 10", "linear 8", "quadratic 4" or "reverse 1 2 3 4 5"',
};

function parseInts(tokens: string[], what: string): number[] {
  return tokens.map((t) => {
    if (!/^-?\d+$/.test(t)) throw new InputError(`"${t}" is not a whole number (${what}).`);
    const v = Number(t);
    if (v < -99 || v > 999) throw new InputError(`Values go from -99 to 999 (got ${t}).`);
    return v;
  });
}

export function parseSpace(text: string, family: SpaceFamily): SpaceInput {
  const tokens = text
    .replace(/[[\](),;]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (family === 'merge') {
    const rest = tokens[0] && /^[a-z_]/i.test(tokens[0]) ? (/^(merge|merge_sort_space|sort)$/i.test(tokens[0]) ? tokens.slice(1) : null) : tokens;
    if (rest === null) throw new InputError(`Cannot read "${tokens[0]}". Enter ${FAMILY_EXAMPLES.merge}.`);
    const arr = parseInts(rest, 'the list to sort');
    if (arr.length > SPACE_LIMITS.merge) {
      throw new InputError(`At most ${SPACE_LIMITS.merge} elements (got ${arr.length}): the top call already shows its input, left, right and result side by side.`);
    }
    return { example: 'merge', n: arr.length, arr };
  }
  if (tokens.length === 0) throw new InputError(`Name an example and its size, as in ${FAMILY_EXAMPLES[family]}.`);
  const example = ALIASES[tokens[0].toLowerCase()];
  if (!example || FAMILY_OF[example] !== family) throw new InputError(`Cannot read "${tokens[0]}". Enter ${FAMILY_EXAMPLES[family]}.`);
  const python = PYTHON_NAMES[example];
  if (example === 'reverse') {
    const arr = parseInts(tokens.slice(1), 'the list to reverse');
    if (arr.length > SPACE_LIMITS.reverse) throw new InputError(`At most ${SPACE_LIMITS.reverse} elements to reverse (got ${arr.length}).`);
    return { example, n: arr.length, arr };
  }
  if (tokens.length !== 2 || !/^\d+$/.test(tokens[1])) throw new InputError(`${python} takes one size n >= 0, as in "${tokens[0]} 6".`);
  const n = Number(tokens[1]);
  const cap = SPACE_LIMITS[example];
  if (n > cap) {
    const why: Record<string, string> = {
      fib: `${python}(${cap + 1}) makes ${2 * fibNumber(cap + 2) - 1} calls`,
      log: `${python}(${cap + 1}) makes over ${2 * cap} calls`,
      constant: `the loop would take more than ${cap} steps`,
      linear: `the list would have more than ${cap} cells`,
      quadratic: `the matrix would have more than ${cap} x ${cap} cells`,
    };
    throw new InputError(`n goes up to ${cap} for ${python} here: ${why[example]}, more than the picture shows step by step (got ${n}).`);
  }
  return { example, n, arr: [] };
}

function fibNumber(k: number): number {
  let a = 0;
  let b = 1;
  for (let i = 0; i < k; i++) [a, b] = [b, a + b];
  return a;
}

/* ---------- pseudocode ---------- */

export const SPACE_CODE: Record<SpaceFamily, string[]> = {
  stack: [
    'recursive_fibonacci_naive(n):',
    '  if n <= 1: return n',
    '  return recursive_fibonacci_naive(n - 1) + recursive_fibonacci_naive(n - 2)',
    'logarithmic_space_example(n):',
    '  if n <= 1: return n',
    '  return logarithmic_space_example(n // 2) + logarithmic_space_example(n // 2)',
  ],
  merge: [
    'merge_sort_space(arr):',
    '  if len(arr) <= 1: return arr',
    '  mid = len(arr) // 2',
    '  left = merge_sort_space(arr[:mid])        # arr[:mid] copies mid cells',
    '  right = merge_sort_space(arr[mid:])       # arr[mid:] copies the rest',
    '  result = []; i = j = 0',
    '  while i < len(left) and j < len(right):',
    '    if left[i] < right[j]: result.append(left[i]); i += 1',
    '    else: result.append(right[j]); j += 1',
    '  result.extend(left[i:])',
    '  result.extend(right[j:])',
    '  return result',
  ],
  loops: [
    'constant_space_example(n):',
    '  total = 0; for i in range(1, n + 1): total += i',
    '  return total',
    'linear_space_example(n):',
    '  result = []; for i in range(1, n + 1): result.append(i)',
    '  return result',
    'quadratic_space_example(n):',
    '  matrix = []',
    '  for i in range(n): row = []; for j in range(n): row.append(i * n + j)',
    '    matrix.append(row)',
    '  return matrix',
    'in_place_reverse(arr):',
    '  left, right = 0, len(arr) - 1',
    '  while left < right: arr[left], arr[right] = arr[right], arr[left]; left += 1; right -= 1',
    '  return arr',
  ],
};

/* ---------- the machine: frames, lists, units, timeline ---------- */

interface LiveFrame {
  id: string;
  label: string;
  role: Role;
  note?: string;
  locals?: string;
}

interface LiveList {
  id: string;
  name: string;
  row: number;
  col: number;
  values: Array<number | string>;
  /** Stable cell identities, so a swapped value glides. */
  keys: string[];
  input?: boolean;
  role?: Role;
  cellRoles?: Record<number, Role>;
  /** Width to reserve (in cells), so a list that grows does not shift its neighbours. */
  slots?: number;
}

export interface SpacePeak {
  depth: number;
  cells: number;
  total: number;
}

export interface SpaceRun {
  frames: Array<Frame<MemoryState>>;
  /** [argument, depth] of every call: n, or len(arr) for the list examples. */
  calls: Array<[number, number]>;
  /** [frames, cells] alive at every return (the returning frame still on the stack). */
  returns: Array<[number, number]>;
  peak: SpacePeak;
  result: unknown;
}

class Machine {
  stack: LiveFrame[] = [];
  lists: LiveList[] = [];
  markers: MemMarkerView[] = [];
  timeline: number[] = [];
  calls: Array<[number, number]> = [];
  returns: Array<[number, number]> = [];
  peak: SpacePeak = { depth: 0, cells: 0, total: 0 };
  peakAt = { units: 0, step: 0, frames: 0, cells: 0 };
  allocated = 0;
  callCount = 0;
  frames: Array<Frame<MemoryState>> = [];
  /** The call tree of a recursion, drawn beside the stack. */
  tree?: () => MemTreeView;
  private nextId = 0;

  constructor(
    private title: string,
    private stackLabel: string,
  ) {}

  id(prefix: string) {
    this.nextId += 1;
    return `${prefix}${this.nextId}`;
  }

  cells(): number {
    return this.lists.reduce((s, l) => s + (l.input ? 0 : l.values.length), 0);
  }

  push(label: string, arg: number, locals?: string): LiveFrame {
    const f: LiveFrame = { id: this.id('f'), label, role: 'active', locals };
    this.stack.forEach((g) => {
      if (g.role === 'active') g.role = 'compare';
    });
    this.stack.push(f);
    this.callCount += 1;
    this.calls.push([arg, this.stack.length]);
    return f;
  }

  /** Record the return event (the frame is still on the stack); pop it with pop(). */
  returning(f: LiveFrame, note: string) {
    f.role = 'done';
    f.note = note;
    this.returns.push([this.stack.length, this.cells()]);
  }

  pop() {
    this.stack.pop();
    const top = this.stack[this.stack.length - 1];
    if (top) top.role = 'active';
  }

  list(name: string, row: number, col: number, values: Array<number | string>, o: { input?: boolean; slots?: number } = {}): LiveList {
    const id = this.id('l');
    const l: LiveList = { id, name, row, col, values: [...values], keys: values.map((_, k) => `${id}:${k}`), input: o.input, slots: o.slots };
    if (!o.input) this.allocated += values.length;
    this.lists.push(l);
    return l;
  }

  append(l: LiveList, v: number | string) {
    l.values.push(v);
    l.keys.push(`${l.id}:${l.keys.length}`);
    if (!l.input) this.allocated += 1;
  }

  free(l: LiveList) {
    this.lists = this.lists.filter((x) => x !== l);
  }

  snap(line: number | undefined, caption: string, vars: Array<[string, string | number]> = []) {
    const depth = this.stack.length;
    const cells = this.cells();
    const units = depth + cells;
    this.peak = { depth: Math.max(this.peak.depth, depth), cells: Math.max(this.peak.cells, cells), total: Math.max(this.peak.total, units) };
    this.timeline.push(units);
    const step = this.timeline.length - 1;
    const isPeak = units > this.peakAt.units || step === 0;
    if (isPeak) this.peakAt = { units, step, frames: depth, cells };
    const lists: MemListView[] = this.lists.map((l) => ({
      id: l.id,
      name: l.name,
      row: l.row,
      col: l.col,
      slots: l.slots,
      input: l.input,
      role: l.role,
      cells: l.values.map((v, k): MemCellView => ({ key: l.keys[k], value: String(v), role: l.cellRoles?.[k] })),
    }));
    this.frames.push({
      line,
      caption,
      vars: [
        ...vars,
        ['frames on the stack', depth],
        ['list cells alive', cells],
        ['units now', units],
        ['peak so far', `${this.peakAt.units} (${this.peakAt.frames} frame${this.peakAt.frames === 1 ? '' : 's'} + ${this.peakAt.cells} cell${this.peakAt.cells === 1 ? '' : 's'})`],
        ['calls so far', this.callCount],
        ['cells allocated in all', this.allocated],
      ],
      state: {
        title: this.title,
        stackLabel: this.stackLabel,
        frames: this.stack.map((f, row) => ({ id: f.id, label: f.label, row, role: f.role, note: f.note, locals: f.locals })),
        lists,
        markers: this.markers.map((m) => ({ ...m })),
        timeline: [...this.timeline],
        peak: { ...this.peakAt },
        now: { frames: depth, cells },
        tree: this.tree?.(),
      },
    });
  }

  run(result: unknown): SpaceRun {
    return { frames: this.frames, calls: this.calls, returns: this.returns, peak: this.peak, result };
  }
}

const unitText = (frames: number, cells: number) => `${frames} frame${frames === 1 ? '' : 's'} + ${cells} cell${cells === 1 ? '' : 's'} = ${frames + cells} unit${frames + cells === 1 ? '' : 's'}`;

/* ---------- 'stack': recursion depth ---------- */

interface CallNode {
  id: string;
  parent?: string;
  n: number;
  depth: number;
  x: number;
  children: CallNode[];
  state: 'pending' | 'stack' | 'returned';
}

/** The whole call tree, laid out before the run: leaves left to right, a parent over its children. */
function callTree(n: number, sub: (n: number) => [number, number]): { root: CallNode; nodes: CallNode[]; leaves: number } {
  const nodes: CallNode[] = [];
  let leaves = 0;
  const build = (v: number, depth: number, parent?: string): CallNode => {
    const node: CallNode = { id: `t${nodes.length}`, parent, n: v, depth, x: 0, children: [], state: 'pending' };
    nodes.push(node);
    if (v > 1) node.children = sub(v).map((c) => build(c, depth + 1, node.id));
    node.x = node.children.length ? (node.children[0].x + node.children[node.children.length - 1].x) / 2 : leaves++;
    return node;
  };
  const root = build(n, 0);
  return { root, nodes, leaves };
}

function traceStack(input: SpaceInput): SpaceRun {
  const fib = input.example === 'fib';
  const python = PYTHON_NAMES[input.example];
  const m = new Machine(`${python}(${input.n})`, `call stack: ${python}`);
  const base = fib ? 1 : 4;
  const body = fib ? 2 : 5;
  const sub = (n: number): [number, number] => (fib ? [n - 1, n - 2] : [Math.floor(n / 2), Math.floor(n / 2)]);
  const subText = fib ? ['n - 1', 'n - 2'] : ['n // 2', 'n // 2'];
  const tree = callTree(input.n, sub);
  let running: CallNode | null = null;
  m.tree = () => ({
    leaves: tree.leaves,
    nodes: tree.nodes.map((t) => ({
      id: t.id,
      parent: t.parent,
      label: String(t.n),
      x: t.x,
      depth: t.depth,
      role: t.state === 'pending' ? undefined : t.state === 'returned' ? 'done' : t === running ? 'active' : 'compare',
    })),
  });

  const call = (node: CallNode, caller: CallNode | null): number => {
    const n = node.n;
    const f = m.push(`n = ${n}`, n);
    node.state = 'stack';
    running = node;
    const d = m.stack.length;
    if (n <= 1) {
      m.returning(f, `returns ${n}`);
      node.state = 'returned';
      m.snap(base, `The call on n = ${n} gets a new frame, ${d} deep. n <= 1 is a base case, so it returns ${n} at once and its frame is popped.`, [['n', n]]);
      m.pop();
      running = caller;
      return n;
    }
    const [a, b] = sub(n);
    m.snap(
      body,
      `The call on n = ${n} gets a new frame, ${d} deep. n > 1, so it first calls itself on ${subText[0]} = ${a}; this frame waits on the stack until that call returns.`,
      [['n', n]],
    );
    const ra = call(node.children[0], node);
    m.snap(body, `The call on ${a} returned ${ra} and its frame is gone: the stack is back to ${d} frame${d === 1 ? '' : 's'}. Only now does the call on ${n} make its second call, on ${subText[1]} = ${b}.`, [
      ['n', n],
      ['first call returned', ra],
    ]);
    const rb = call(node.children[1], node);
    m.returning(f, `returns ${ra + rb}`);
    node.state = 'returned';
    running = node;
    m.snap(body, `The call on ${b} returned ${rb}: the call on ${n} returns ${ra} + ${rb} = ${ra + rb}. Its two calls ran one after the other, so they were never on the stack together.`, [
      ['n', n],
      ['returns', ra + rb],
    ]);
    m.pop();
    running = caller;
    return ra + rb;
  };

  m.snap(
    undefined,
    `${python}(${input.n}) uses no lists, so its memory is its call stack: one frame per call that has started and not yet returned. ` +
      `Its ${tree.nodes.length} call${tree.nodes.length === 1 ? '' : 's'} form the tree on the right; the timeline counts the frames alive after every step.`,
  );
  const result = call(tree.root, null);
  const calls = m.callCount;
  m.snap(
    undefined,
    `Done: ${python}(${input.n}) = ${result}. It made ${calls} call${calls === 1 ? '' : 's'}, but at most ${m.peak.depth} frame${m.peak.depth === 1 ? ' was' : 's were'} alive at once (the peak), ` +
      (fib ? `one root-to-leaf path n, n - 1, ..., 1 of the call tree: O(n) space although the time is O(2^n).` : `one chain n, n // 2, ..., 1: O(log n) space although the calls take O(n) time.`),
    [['result', result]],
  );
  return m.run(result);
}

/* ---------- 'merge': merge sort's buffers ---------- */

/** Columns of a frame's lists: arr, left, right, result side by side. */
function mergeColumns(len: number) {
  const half = Math.floor(len / 2);
  const left = len + 1;
  const right = left + Math.max(half, 1) + 1;
  const result = right + Math.max(len - half, 1) + 1;
  return { arr: 0, left, right, result };
}

function traceMerge(args: SpaceInput): SpaceRun {
  const m = new Machine(`merge_sort_space([${args.arr.join(', ')}])`, 'call stack: merge_sort_space');

  /** One call: arr is the list bound to the callee's arr (the input or a slice). Returns the list it returns. */
  const sort = (arr: LiveList): LiveList => {
    const len = arr.values.length;
    const f = m.push(`len ${len}`, len);
    const row = m.stack.length - 1;
    arr.row = row;
    arr.col = 0;
    arr.name = row === 0 ? 'arr (input)' : 'arr';
    const d = m.stack.length;
    if (len <= 1) {
      m.returning(f, 'returns arr');
      arr.role = 'done';
      m.snap(
        1,
        `${row === 0 ? 'merge_sort_space is called' : `A call ${d} deep starts`} on [${arr.values.join(', ')}]: len(arr) = ${len} <= 1, so it returns arr itself. No new list is made, and this ${row === 0 ? 'input' : 'slice'} lives on in the caller.`,
        [['len(arr)', len]],
      );
      arr.role = undefined;
      m.pop();
      return arr;
    }
    const cols = mergeColumns(len);
    const mid = Math.floor(len / 2);
    f.locals = `mid = ${mid}`;
    m.snap(
      2,
      `${row === 0 ? 'merge_sort_space is called' : `A call ${d} deep starts`} on [${arr.values.join(', ')}]${row === 0 ? ' (the input: not counted)' : `, the slice its caller copied (${len} cells)`}. ` +
        `len(arr) = ${len} > 1, so mid = ${len} // 2 = ${mid}.`,
      [['mid', mid]],
    );
    // left = merge_sort_space(arr[:mid])
    const leftSlice = m.list('arr', row + 1, 0, arr.values.slice(0, mid));
    leftSlice.role = 'active';
    m.snap(3, `arr[:${mid}] copies the first ${mid} element${mid === 1 ? '' : 's'} into a new list, ${mid} more cell${mid === 1 ? '' : 's'}, and the call on it begins.`, [['mid', mid]]);
    leftSlice.role = undefined;
    const left = sort(leftSlice);
    if (left !== leftSlice) m.free(leftSlice);
    left.name = 'left';
    left.row = row;
    left.col = cols.left;
    left.role = 'done';
    m.snap(
      4,
      `left = [${left.values.join(', ')}], sorted. ${left === leftSlice ? 'The call returned the slice itself, so it stays.' : 'The slice it was given died with that call; only its result is kept.'} Now arr[${mid}:] is copied for the second call.`,
      [['mid', mid]],
    );
    left.role = undefined;
    const rightSlice = m.list('arr', row + 1, 0, arr.values.slice(mid));
    const right = sort(rightSlice);
    if (right !== rightSlice) m.free(rightSlice);
    right.name = 'right';
    right.row = row;
    right.col = cols.right;
    const result = m.list('result', row, cols.result, [], { slots: len });
    let i = 0;
    let j = 0;
    f.locals = `i = 0, j = 0`;
    right.role = 'done';
    m.snap(5, `right = [${right.values.join(', ')}], sorted. result = [] starts the merge buffer: it will grow to ${len} cells while left and right are still alive.`, [
      ['i', 0],
      ['j', 0],
    ]);
    right.role = undefined;
    while (i < left.values.length && j < right.values.length) {
      const a = left.values[i] as number;
      const b = right.values[j] as number;
      left.cellRoles = { [i]: 'compare' };
      right.cellRoles = { [j]: 'compare' };
      if (a < b) {
        m.append(result, a);
        i += 1;
      } else {
        m.append(result, b);
        j += 1;
      }
      result.cellRoles = { [result.values.length - 1]: 'active' };
      f.locals = `i = ${i}, j = ${j}`;
      m.snap(
        a < b ? 7 : 8,
        a < b ? `left[${i - 1}] = ${a} < right[${j}] = ${b}, so result.append(${a}): one more cell.` : `left[${i}] = ${a} < right[${j - 1}] = ${b} is false${a === b ? ' (equal keys go to the right)' : ''}, so result.append(${b}): one more cell.`,
        [
          ['i', i],
          ['j', j],
        ],
      );
    }
    left.cellRoles = undefined;
    right.cellRoles = undefined;
    for (const [src, from, line, name] of [
      [left, i, 9, 'left'],
      [right, j, 10, 'right'],
    ] as Array<[LiveList, number, number, string]>) {
      const rest = src.values.slice(from) as number[];
      if (rest.length === 0) continue;
      const before = result.values.length;
      rest.forEach((v) => m.append(result, v));
      const roles: Record<number, Role> = {};
      for (let k = before; k < result.values.length; k++) roles[k] = 'active';
      result.cellRoles = roles;
      m.snap(line, `${name} has ${rest.length} element${rest.length === 1 ? '' : 's'} left over: result.extend(${name}[${from}:]) copies ${rest.length === 1 ? 'it' : 'them'} to the end.`, [
        ['i', i],
        ['j', j],
      ]);
    }
    result.cellRoles = undefined;
    m.returning(f, 'returns result');
    result.role = 'done';
    const own = arr.input ? 0 : len;
    m.snap(
      11,
      `return result: ${len} sorted cells. Right now this call holds ${own ? `its slice (${own}) + ` : ''}left (${left.values.length}) + right (${right.values.length}) + result (${len}) cells. When it returns, all but result are freed.`,
      [
        ['i', i],
        ['j', j],
      ],
    );
    result.role = undefined;
    m.pop();
    m.free(left);
    m.free(right);
    return result;
  };

  const input = m.list('arr (input)', 0, 0, args.arr, { input: true });
  m.snap(
    undefined,
    `merge_sort_space sorts a copy: every call slices its arr into two new lists and merges them into a new result. The input (dashed) is not counted; every other cell is. Watch the timeline: the peak is not the total ever allocated.`,
  );
  const out = sort(input);
  if (out !== input) {
    out.name = 'returned';
    out.row = 0;
    out.col = mergeColumns(input.values.length).result;
  }
  const allocated = m.allocated;
  m.snap(
    undefined,
    `Done: [${out.values.join(', ')}]. The calls allocated ${allocated} cell${allocated === 1 ? '' : 's'} in all, but at most ${m.peak.cells} were alive at once (peak ${m.peakAt.units} units with the frames): ` +
      `a finished merge frees its buffers before the next one starts, so the space is O(n), not O(n log n).`,
    [['result', `[${out.values.join(', ')}]`]],
  );
  return m.run(out.values);
}

/* ---------- 'loops': lists built in a loop, and an in-place reverse ---------- */

function traceLoops(input: SpaceInput): SpaceRun {
  const python = PYTHON_NAMES[input.example];
  const { n } = input;
  const m = new Machine(`${python}(${input.example === 'reverse' ? `[${input.arr.join(', ')}]` : n})`, `call stack: ${python}`);
  let result: unknown;
  if (input.example === 'constant') {
    m.snap(undefined, `${python}(${n}) adds 1 + 2 + ... + n into one variable. Its memory is one frame with total, i and n, whatever n is.`);
    const f = m.push(`n = ${n}`, n, 'total = 0');
    let total = 0;
    m.snap(1, `The call starts: one frame. total = 0.`, [['total', 0]]);
    for (let i = 1; i <= n; i++) {
      total += i;
      f.locals = `total = ${total}, i = ${i}`;
      m.snap(1, `i = ${i}: total += ${i} gives ${total}. The same two variables are reused, so the memory stays 1 frame and 0 cells.`, [
        ['i', i],
        ['total', total],
      ]);
    }
    m.returning(f, `returns ${total}`);
    m.snap(2, `return total = ${total}: n = ${n} additions in O(1) space.`, [['total', total]]);
    m.pop();
    result = total;
  } else if (input.example === 'linear') {
    m.snap(undefined, `${python}(${n}) builds the list [1, ..., ${n}]: its memory grows by one cell per iteration.`);
    const f = m.push(`n = ${n}`, n);
    const list = m.list('result', 0, 0, [], { slots: Math.max(n, 1) });
    m.snap(4, `result = []: an empty list, 0 cells so far.`, []);
    for (let i = 1; i <= n; i++) {
      m.append(list, i);
      list.cellRoles = { [i - 1]: 'active' };
      f.locals = `i = ${i}`;
      m.snap(4, `result.append(${i}): ${i} cell${i === 1 ? '' : 's'} now. The list never shrinks while the function runs.`, [['i', i]]);
    }
    list.cellRoles = undefined;
    m.returning(f, 'returns result');
    m.snap(5, `return result: ${n} cell${n === 1 ? '' : 's'} plus the frame, so O(n) space.`, []);
    m.pop();
    result = [...list.values];
  } else if (input.example === 'quadratic') {
    m.snap(undefined, `${python}(${n}) builds an ${n} x ${n} matrix: a list of ${n} rows (the outer list holds one cell per row) and ${n * n} cells inside the rows.`);
    const f = m.push(`n = ${n}`, n);
    const matrix = m.list('matrix', 0, 0, [], { slots: Math.max(n, 1) });
    const rows: LiveList[] = [];
    m.snap(7, `matrix = []: the outer list, empty for now.`, []);
    for (let i = 0; i < n; i++) {
      const row = m.list('row', i + 1, 0, [], { slots: Math.max(n, 1) });
      rows.push(row);
      f.locals = `i = ${i}`;
      m.snap(8, `i = ${i}: row = [], a new list for row ${i}.`, [['i', i]]);
      for (let j = 0; j < n; j++) {
        m.append(row, i * n + j);
        row.cellRoles = { [j]: 'active' };
        f.locals = `i = ${i}, j = ${j}`;
        m.snap(8, `row.append(${i} * ${n} + ${j} = ${i * n + j}).`, [
          ['i', i],
          ['j', j],
        ]);
      }
      row.cellRoles = undefined;
      row.name = `matrix[${i}]`;
      m.append(matrix, `r${i}`);
      matrix.cellRoles = { [i]: 'active' };
      m.snap(9, `matrix.append(row): the outer list gets a cell that refers to row ${i}, which stays alive as matrix[${i}].`, [['i', i]]);
      matrix.cellRoles = undefined;
    }
    m.returning(f, 'returns matrix');
    m.snap(10, `return matrix: ${n} + ${n * n} = ${n + n * n} cells plus the frame, so O(n^2) space.`, []);
    m.pop();
    result = rows.map((r) => [...r.values]);
  } else {
    const arr = input.arr;
    m.snap(undefined, `${python} swaps the two ends and walks inward. The list is the input (dashed), so it is not counted: only the frame with left and right is.`);
    const list = m.list('arr (input)', 0, 0, arr, { input: true });
    const f = m.push(`len ${arr.length}`, arr.length);
    let left = 0;
    let right = arr.length - 1;
    f.locals = `left = ${left}, right = ${right}`;
    m.markers = arr.length ? [
      { name: 'left', row: 0, col: left, role: 'compare' },
      { name: 'right', row: 0, col: right, role: 'compare' },
    ] : [];
    m.snap(12, `left, right = 0, ${arr.length - 1}: two indices, no new list.`, [
      ['left', left],
      ['right', right],
    ]);
    while (left < right) {
      const vs = list.values;
      [vs[left], vs[right]] = [vs[right], vs[left]];
      [list.keys[left], list.keys[right]] = [list.keys[right], list.keys[left]];
      list.cellRoles = { [left]: 'active', [right]: 'active' };
      m.snap(13, `Swap arr[${left}] and arr[${right}]: ${vs[right]} and ${vs[left]} change places inside the input. Nothing is allocated.`, [
        ['left', left],
        ['right', right],
      ]);
      left += 1;
      right -= 1;
      f.locals = `left = ${left}, right = ${right}`;
      list.cellRoles = undefined;
      m.markers = [
        { name: 'left', row: 0, col: Math.min(left, arr.length - 1), role: 'compare' },
        { name: 'right', row: 0, col: Math.max(right, 0), role: 'compare' },
      ];
    }
    m.markers = [];
    m.returning(f, 'returns arr');
    m.snap(14, `left >= right: done. return arr, the same list, reversed in place: O(1) extra space.`, []);
    m.pop();
    result = [...list.values];
  }
  m.snap(
    undefined,
    `Done: the peak was ${unitText(m.peakAt.frames, m.peakAt.cells)}. ` +
      (input.example === 'constant' || input.example === 'reverse'
        ? `It does not depend on ${input.example === 'reverse' ? 'the length of the list' : 'n'}: O(1) space.`
        : input.example === 'linear'
          ? `It grows with n: O(n) space.`
          : `It grows with n^2: O(n^2) space.`),
  );
  return m.run(result);
}

export function spaceFamily(example: SpaceExample): SpaceFamily {
  return FAMILY_OF[example];
}

export function traceSpace(input: SpaceInput): SpaceRun {
  const family = FAMILY_OF[input.example];
  if (family === 'stack') return traceStack(input);
  if (family === 'merge') return traceMerge(input);
  return traceLoops(input);
}
