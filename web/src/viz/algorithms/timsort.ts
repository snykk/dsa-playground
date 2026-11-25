/**
 * Step tracer for Timsort (Algorithms/Sorting/Timsort/Python/timsort.py): natural runs, binary
 * insertion up to minrun, the stack of pending runs and its invariants, merge_lo and merge_hi
 * with a temporary copy of the smaller run, and galloping. Each helper mirrors the Python
 * function of the same name, so the comparisons, the runs, the stack after every collapse and
 * every merge match the golden fixtures generated from the Python code.
 *
 * While a merge runs, the array holds stale copies of the values that sit in the temporary
 * copy; the frames show the logical contents instead (merged output, the rest of the copied run,
 * the rest of the other run), which is always a permutation of the input.
 */
import type { Frame, Role } from '../core/types';
import type { BarItem } from '../renderers/ArrayBars';

export const MIN_GALLOP = 7;
/** The visualization's default minrun: CPython would use n itself below 64 values. */
export const VIZ_MINRUN = 4;

export interface TimsortInput {
  values: number[];
  /** 0 computes minrun from n as CPython does; a positive value replaces it. */
  minrun: number;
}

/** A bracket under the bars: a run on the stack, the run being found, or the two runs being merged. */
export interface RunMark {
  lo: number;
  /** Exclusive. */
  hi: number;
  name: string;
  kind: 'stack' | 'new' | 'merge';
}

/** One run of the stack strip, bottom of the stack first. */
export interface StackChip {
  length: number;
  name: string;
  /** W, A, B or C while the invariants are being checked. */
  letter: string | null;
  merging: boolean;
}

export interface TimsortState {
  items: BarItem[];
  roles: Role[];
  marks: RunMark[];
  stack: StackChip[];
  /** The test made on the top of the stack, e.g. "A <= B + C: 6 <= 11". */
  check: string | null;
  minrun: number;
  minGallop: number;
  galloping: boolean;
  /** Positions of the bars whose values live in the temporary copy. */
  tmp: number[];
  /** Index -> label drawn under the bar. */
  pointers: Record<number, string>;
}

/** What the golden fixtures record, collected while tracing. */
export interface TimsortLog {
  runs: Array<[number, number, boolean]>;
  stacks: number[][];
  merges: Array<[number, number, number, 'lo' | 'hi' | 'none', number]>;
  gallops: number;
  comparisons: number;
  order: number[];
}

/** compute_minrun: the six most significant bits of n, plus 1 if any other bit is set. */
export function computeMinrun(n: number): number {
  let r = 0;
  while (n >= 64) {
    r |= n & 1;
    n = Math.floor(n / 2);
  }
  return n + r;
}

type Less = (x: BarItem, y: BarItem) => boolean;

/** gallop_left: the k in 0..n with a[base + k - 1] < key <= a[base + k], from a[base + hint] outwards. */
export function gallopLeft(key: BarItem, a: BarItem[], base: number, n: number, hint: number, lt: Less): number {
  const p = base + hint;
  let lo: number;
  let hi: number;
  if (lt(a[p], key)) {
    const maxOfs = n - hint;
    let last = 0;
    let ofs = 1;
    while (ofs < maxOfs && lt(a[p + ofs], key)) [last, ofs] = [ofs, 2 * ofs + 1];
    ofs = Math.min(ofs, maxOfs);
    [lo, hi] = [hint + last + 1, hint + ofs];
  } else {
    const maxOfs = hint + 1;
    let last = 0;
    let ofs = 1;
    while (ofs < maxOfs && !lt(a[p - ofs], key)) [last, ofs] = [ofs, 2 * ofs + 1];
    ofs = Math.min(ofs, maxOfs);
    [lo, hi] = [hint + 1 - ofs, hint - last];
  }
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (lt(a[base + mid], key)) lo = mid + 1;
    else hi = mid;
  }
  return hi;
}

/** gallop_right: the k with a[base + k - 1] <= key < a[base + k]. */
export function gallopRight(key: BarItem, a: BarItem[], base: number, n: number, hint: number, lt: Less): number {
  const p = base + hint;
  let lo: number;
  let hi: number;
  if (lt(key, a[p])) {
    const maxOfs = hint + 1;
    let last = 0;
    let ofs = 1;
    while (ofs < maxOfs && lt(key, a[p - ofs])) [last, ofs] = [ofs, 2 * ofs + 1];
    ofs = Math.min(ofs, maxOfs);
    [lo, hi] = [hint + 1 - ofs, hint - last];
  } else {
    const maxOfs = n - hint;
    let last = 0;
    let ofs = 1;
    while (ofs < maxOfs && !lt(key, a[p + ofs])) [last, ofs] = [ofs, 2 * ofs + 1];
    ofs = Math.min(ofs, maxOfs);
    [lo, hi] = [hint + last + 1, hint + ofs];
  }
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (lt(key, a[base + mid])) hi = mid;
    else lo = mid + 1;
  }
  return hi;
}

export const plural = (k: number, one: string, many: string) => `${k} ${k === 1 ? one : many}`;

/** The invariants on run lengths, bottom first: X > Y + Z for three neighbours, Y > Z for two. */
export function invariantsHold(lengths: number[]): boolean {
  for (let i = 0; i + 1 < lengths.length; i++) {
    if (lengths[i] <= lengths[i + 1]) return false;
    if (i + 2 < lengths.length && lengths[i] <= lengths[i + 1] + lengths[i + 2]) return false;
  }
  return true;
}

interface Snap {
  roles?: Record<number, Role>;
  pointers?: Record<number, string>;
  /** The run being found or extended, not yet on the stack. */
  forming?: { lo: number; hi: number } | null;
  letters?: Record<number, string>;
  check?: string | null;
  vars?: Array<[string, string | number]>;
}

export function timsort(input: TimsortInput, log?: TimsortLog): Array<Frame<TimsortState>> {
  const n = input.values.length;
  const arr: BarItem[] = input.values.map((value, id) => ({ id, value }));
  const frames: Array<Frame<TimsortState>> = [];
  let comparisons = 0;
  const lt: Less = (x, y) => {
    comparisons++;
    return x.value < y.value;
  };
  const minrun = input.minrun > 0 ? input.minrun : computeMinrun(n);
  const pending: Array<{ base: number; length: number }> = [];
  let minGallop = MIN_GALLOP;
  let galloping = false;
  let sorted = false;
  // While a merge runs: the stack as it was, which pair is merging, and the logical view.
  let merge: { before: Array<{ base: number; length: number }>; i: number; lo: number; view: () => BarItem[]; tmp: () => number[] } | null = null;

  const runName = (k: number) => `R${k + 1}`;

  const snap = (line: number | undefined, caption: string, o: Snap = {}) => {
    const items = arr.map((it) => ({ ...it }));
    let tmp: number[] = [];
    if (merge) {
      const view = merge.view();
      for (let k = 0; k < view.length; k++) items[merge.lo + k] = { ...view[k] };
      tmp = merge.tmp();
    }
    const shown = merge ? merge.before : pending;
    const marks: RunMark[] = [];
    shown.forEach((r, k) => {
      if (merge && (k === merge.i || k === merge.i + 1)) return;
      marks.push({ lo: r.base, hi: r.base + r.length, name: o.letters?.[k] ?? runName(k), kind: 'stack' });
    });
    if (merge) {
      const a = merge.before[merge.i];
      const b = merge.before[merge.i + 1];
      marks.push({ lo: a.base, hi: b.base + b.length, name: `${runName(merge.i)} + ${runName(merge.i + 1)}`, kind: 'merge' });
    }
    if (o.forming) marks.push({ lo: o.forming.lo, hi: o.forming.hi, name: 'new run', kind: 'new' });
    marks.sort((x, y) => x.lo - y.lo);
    frames.push({
      line,
      caption,
      state: {
        items,
        roles: items.map((_, i) => o.roles?.[i] ?? (sorted ? 'done' : 'idle')),
        marks,
        stack: shown.map((r, k) => ({
          length: r.length,
          name: runName(k),
          letter: o.letters?.[k] ?? null,
          merging: merge !== null && (k === merge.i || k === merge.i + 1),
        })),
        check: o.check ?? null,
        minrun,
        minGallop,
        galloping,
        tmp,
        pointers: o.pointers ?? {},
      },
      vars: [
        ...(o.vars ?? []),
        ['stack', shown.map((r) => r.length).join(', ') || 'empty'],
        ['min_gallop', minGallop],
        ['comparisons', comparisons],
      ],
    });
  };

  // ---------------------------------------------------------------- runs

  /** count_run: one frame per comparison. */
  const countRun = (lo: number): [number, boolean] => {
    if (lo + 1 === n) {
      snap(2, `Only a[${lo}] = ${arr[lo].value} is left: a run of length 1.`, { forming: { lo, hi: lo + 1 }, roles: { [lo]: 'active' } });
      return [1, false];
    }
    let len = 2;
    const descending = lt(arr[lo + 1], arr[lo]);
    const [x, y] = [arr[lo + 1].value, arr[lo].value];
    const toEnd = lo + 2 === n ? ' It reaches the end of the array: length 2.' : '';
    snap(
      2,
      descending
        ? `New run at index ${lo}: a[${lo + 1}] = ${x} < a[${lo}] = ${y}, so the run is strictly descending.${toEnd}`
        : `New run at index ${lo}: a[${lo + 1}] = ${x} >= a[${lo}] = ${y}, so the run is ascending (equal values may repeat).${toEnd}`,
      { forming: { lo, hi: lo + 2 }, roles: { [lo]: 'compare', [lo + 1]: 'compare' }, vars: [['lo', lo]] },
    );
    while (lo + len < n) {
      const k = lo + len;
      const smaller = lt(arr[k], arr[k - 1]);
      const goesOn = descending ? smaller : !smaller;
      const [u, w] = [arr[k].value, arr[k - 1].value];
      const op = smaller ? '<' : '>=';
      snap(
        2,
        goesOn
          ? `a[${k}] = ${u} ${op} a[${k - 1}] = ${w}: the run goes on${k + 1 === n ? ` to the end of the array, length ${len + 1}` : ''}.`
          : `a[${k}] = ${u} ${op} a[${k - 1}] = ${w}: ${descending ? 'not strictly smaller' : 'smaller'}, so the run ends with length ${len}.`,
        { forming: { lo, hi: goesOn ? k + 1 : k }, roles: { [k - 1]: 'compare', [k]: 'compare' }, vars: [['lo', lo]] },
      );
      if (!goesOn) break;
      len++;
    }
    return [len, descending];
  };

  /** binary_insertion_sort: one frame per comparison and one per insertion. */
  const binaryInsertionSort = (lo: number, hi: number, start: number) => {
    if (start === lo) start++;
    for (let i = start; i < hi; i++) {
      const pivot = arr[i];
      let left = lo;
      let right = i;
      while (left < right) {
        const mid = left + Math.floor((right - left) / 2);
        const goLeft = lt(pivot, arr[mid]);
        snap(
          4,
          goLeft
            ? `Binary search for ${pivot.value} in a[${lo}..${i - 1}]: ${pivot.value} < a[${mid}] = ${arr[mid].value}, so it goes left of index ${mid}.`
            : `Binary search for ${pivot.value} in a[${lo}..${i - 1}]: ${pivot.value} >= a[${mid}] = ${arr[mid].value}, so it goes right of index ${mid}.`,
          { forming: { lo, hi: i }, roles: { [i]: 'active', [mid]: 'compare' }, pointers: { [i]: 'pivot', [mid]: 'mid' }, vars: [['pivot', pivot.value]] },
        );
        if (goLeft) right = mid;
        else left = mid + 1;
      }
      arr.splice(i, 1);
      arr.splice(left, 0, pivot);
      snap(
        4,
        left === i
          ? `${pivot.value} stays at index ${i}: it is not smaller than anything before it.`
          : `Insert ${pivot.value} at index ${left}: ${plural(i - left, 'larger value shifts', 'larger values shift')} one place right. An equal value would have stayed on the left, so this is stable.`,
        { forming: { lo, hi: i + 1 }, roles: { [left]: 'active' }, vars: [['pivot', pivot.value]] },
      );
    }
  };

  // ---------------------------------------------------------------- merging

  const headRoles = (positions: number[], placed: number | null): Record<number, Role> => {
    const roles: Record<number, Role> = {};
    for (const p of positions) roles[p] = 'compare';
    if (placed !== null) roles[placed] = 'active';
    return roles;
  };

  /** merge_lo: A (na <= nb) is copied to tmp and the output fills the array from base_a. */
  const mergeLo = (baseA: number, na: number, baseB: number, nb: number) => {
    const tmp = arr.slice(baseA, baseA + na);
    let a = 0;
    let b = baseB;
    let dest = baseA;
    merge!.lo = baseA;
    merge!.view = () => [...arr.slice(baseA, dest), ...tmp.slice(a, a + na), ...arr.slice(b, b + nb)];
    merge!.tmp = () => Array.from({ length: na }, (_, k) => dest + k);
    const counts = (ac: number, bc: number): Array<[string, number]> => [['A wins in a row', ac], ['B wins in a row', bc]];
    snap(9, `merge_lo: A (${plural(na, 'value', 'values')}) is the smaller run, so it is copied to the temporary array (dashed outline) and the merge fills the array from the left, from index ${baseA}.`, {
      roles: headRoles([dest, dest + na], null),
      pointers: { [dest]: 'A', [dest + na]: 'B' },
    });
    const first = arr[b];
    arr[dest] = arr[b];
    [dest, b, nb] = [dest + 1, b + 1, nb - 1];
    snap(9, `B's first value ${first.value} is smaller than every value of A (the trimming made sure), so it goes first without a comparison.`, {
      roles: headRoles([], dest - 1),
    });
    let mg = minGallop;
    while (nb > 0 && na > 1) {
      let aCount = 0;
      let bCount = 0;
      while (nb > 0 && na > 1) {
        const [x, y] = [arr[b], tmp[a]];
        if (lt(x, y)) {
          arr[dest] = arr[b];
          [dest, b, nb] = [dest + 1, b + 1, nb - 1];
          [bCount, aCount] = [bCount + 1, 0];
          const start = bCount >= mg && nb > 0;
          snap(9, `B's ${x.value} < A's ${y.value}: ${x.value} goes to index ${dest - 1}. B has won ${plural(bCount, 'time', 'times')} in a row${start ? `, which reaches min_gallop = ${mg}: switch to galloping` : ''}.`, {
            roles: headRoles(nb > 0 ? [dest, dest + na] : [], dest - 1),
            pointers: nb > 0 ? { [dest]: 'A', [dest + na]: 'B' } : {},
            vars: counts(aCount, bCount),
          });
          if (bCount >= mg) break;
        } else {
          arr[dest] = tmp[a];
          [dest, a, na] = [dest + 1, a + 1, na - 1];
          [aCount, bCount] = [aCount + 1, 0];
          const start = aCount >= mg && na > 1;
          const tie = x.value === y.value ? ' On a tie A goes first, which keeps the sort stable.' : '';
          snap(9, `A's ${y.value} <= B's ${x.value}: ${y.value} goes to index ${dest - 1}.${tie} A has won ${plural(aCount, 'time', 'times')} in a row${start ? `, which reaches min_gallop = ${mg}: switch to galloping` : ''}.`, {
            roles: headRoles(na > 1 ? [dest, dest + na] : [], dest - 1),
            pointers: na > 1 ? { [dest]: 'A', [dest + na]: 'B' } : {},
            vars: counts(aCount, bCount),
          });
          if (aCount >= mg) break;
        }
      }
      if (nb === 0 || na <= 1) break;
      mg++;
      galloping = true;
      for (;;) {
        if (mg > 1) mg--;
        minGallop = mg;
        const key = arr[b];
        const before = comparisons;
        aCount = gallopRight(key, tmp, a, na, 0, lt);
        if (log) log.gallops++;
        const cost = comparisons - before;
        if (aCount) {
          for (let k = 0; k < aCount; k++) arr[dest + k] = tmp[a + k];
          [dest, a, na] = [dest + aCount, a + aCount, na - aCount];
        }
        snap(10, `Galloping (min_gallop = ${mg}): gallop_right finds how many of A's next values are <= B's ${key.value}, probing 1, 3, 7, ... places ahead: ${aCount} (${plural(cost, 'comparison', 'comparisons')}).${aCount ? ` They move as one block.` : ''}`, {
          roles: headRoles([], null),
          pointers: { [dest + na]: 'B' },
          vars: counts(aCount, bCount),
        });
        if (na <= 1) break;
        arr[dest] = arr[b];
        [dest, b, nb] = [dest + 1, b + 1, nb - 1];
        snap(10, `B's ${key.value} goes next, to index ${dest - 1}: A's next value is larger.`, { roles: headRoles([], dest - 1), vars: counts(aCount, bCount) });
        if (nb === 0) break;
        const keyA = tmp[a];
        const before2 = comparisons;
        bCount = gallopLeft(keyA, arr, b, nb, 0, lt);
        if (log) log.gallops++;
        const cost2 = comparisons - before2;
        if (bCount) {
          for (let k = 0; k < bCount; k++) arr[dest + k] = arr[b + k];
          [dest, b, nb] = [dest + bCount, b + bCount, nb - bCount];
        }
        snap(10, `Galloping: gallop_left finds how many of B's next values are < A's ${keyA.value}: ${bCount} (${plural(cost2, 'comparison', 'comparisons')}).${bCount ? ' They move as one block.' : ''}`, {
          roles: headRoles([], null),
          pointers: { [dest]: 'A' },
          vars: counts(aCount, bCount),
        });
        if (nb === 0) break;
        arr[dest] = tmp[a];
        [dest, a, na] = [dest + 1, a + 1, na - 1];
        const leave = na !== 1 && aCount < MIN_GALLOP && bCount < MIN_GALLOP;
        snap(
          10,
          `A's ${keyA.value} goes next, to index ${dest - 1}.${leave ? ` Both blocks were shorter than MIN_GALLOP = ${MIN_GALLOP} (${aCount} and ${bCount}): leave galloping, and min_gallop goes up to ${mg + 1}.` : ''}`,
          { roles: headRoles([], dest - 1), vars: counts(aCount, bCount) },
        );
        if (na === 1) break;
        if (aCount < MIN_GALLOP && bCount < MIN_GALLOP) break;
      }
      if (nb === 0 || na <= 1) {
        galloping = false;
        break;
      }
      mg++;
      minGallop = mg;
      galloping = false;
    }
    const restA = na;
    const restB = nb;
    for (let k = 0; k < nb; k++) arr[dest + k] = arr[b + k];
    for (let k = 0; k < na; k++) arr[dest + nb + k] = tmp[a + k];
    b += nb;
    dest += nb + na;
    [na, nb] = [0, 0];
    snap(
      9,
      restB === 0
        ? `B is used up: the last ${plural(restA, 'value', 'values')} of A ${restA === 1 ? 'comes' : 'come'} back from the temporary array.`
        : `Only A's last value is left, and it is larger than all of B: the rest of B (${plural(restB, 'value', 'values')}) slides left and it goes last.`,
      { roles: {} },
    );
  };

  /** merge_hi: B (nb < na) is copied to tmp and the output fills the array from the right end of B. */
  const mergeHi = (baseA: number, na: number, baseB: number, nb: number) => {
    const tmp = arr.slice(baseB, baseB + nb);
    let a = baseA + na - 1;
    let b = nb - 1;
    let dest = baseB + nb - 1;
    const end = baseB + nb;
    merge!.lo = baseA;
    merge!.view = () => [...arr.slice(baseA, baseA + na), ...tmp.slice(0, nb), ...arr.slice(dest + 1, end)];
    merge!.tmp = () => Array.from({ length: nb }, (_, k) => baseA + na + k);
    const counts = (ac: number, bc: number): Array<[string, number]> => [['A wins in a row', ac], ['B wins in a row', bc]];
    const headA = () => baseA + na - 1;
    const headB = () => baseA + na + nb - 1;
    snap(9, `merge_hi: B (${plural(nb, 'value', 'values')}) is the smaller run, so it is copied to the temporary array (dashed outline) and the merge fills the array from the right, from index ${end - 1}.`, {
      roles: headRoles([headA(), headB()], null),
      pointers: { [headA()]: 'A', [headB()]: 'B' },
    });
    const last = arr[a];
    arr[dest] = arr[a];
    [dest, a, na] = [dest - 1, a - 1, na - 1];
    snap(9, `A's last value ${last.value} is larger than every value of B (the trimming made sure), so it goes last without a comparison.`, {
      roles: headRoles([], dest + 1),
    });
    let mg = minGallop;
    while (na > 0 && nb > 1) {
      let aCount = 0;
      let bCount = 0;
      while (na > 0 && nb > 1) {
        const [x, y] = [tmp[b], arr[a]];
        if (lt(x, y)) {
          arr[dest] = arr[a];
          [dest, a, na] = [dest - 1, a - 1, na - 1];
          [aCount, bCount] = [aCount + 1, 0];
          const start = aCount >= mg && na > 0;
          snap(9, `B's ${x.value} < A's ${y.value}: A's ${y.value} goes to index ${dest + 1}. A has won ${plural(aCount, 'time', 'times')} in a row${start ? `, which reaches min_gallop = ${mg}: switch to galloping` : ''}.`, {
            roles: headRoles(na > 0 ? [headA(), headB()] : [], dest + 1),
            pointers: na > 0 ? { [headA()]: 'A', [headB()]: 'B' } : {},
            vars: counts(aCount, bCount),
          });
          if (aCount >= mg) break;
        } else {
          arr[dest] = tmp[b];
          [dest, b, nb] = [dest - 1, b - 1, nb - 1];
          [bCount, aCount] = [bCount + 1, 0];
          const start = bCount >= mg && nb > 1;
          const tie = x.value === y.value ? " On a tie B's value takes the right-hand slot, which keeps the sort stable." : '';
          snap(9, `A's ${y.value} <= B's ${x.value}: B's ${x.value} goes to index ${dest + 1}.${tie} B has won ${plural(bCount, 'time', 'times')} in a row${start ? `, which reaches min_gallop = ${mg}: switch to galloping` : ''}.`, {
            roles: headRoles(nb > 1 ? [headA(), headB()] : [], dest + 1),
            pointers: nb > 1 ? { [headA()]: 'A', [headB()]: 'B' } : {},
            vars: counts(aCount, bCount),
          });
          if (bCount >= mg) break;
        }
      }
      if (na === 0 || nb <= 1) break;
      mg++;
      galloping = true;
      for (;;) {
        if (mg > 1) mg--;
        minGallop = mg;
        const key = tmp[b];
        const before = comparisons;
        aCount = na - gallopRight(key, arr, baseA, na, na - 1, lt);
        if (log) log.gallops++;
        const cost = comparisons - before;
        if (aCount) {
          [dest, a, na] = [dest - aCount, a - aCount, na - aCount];
          for (let k = aCount; k >= 1; k--) arr[dest + k] = arr[a + k];
        }
        snap(10, `Galloping (min_gallop = ${mg}): gallop_right finds how many of A's last values are > B's ${key.value}, probing 1, 3, 7, ... places back: ${aCount} (${plural(cost, 'comparison', 'comparisons')}).${aCount ? ' They move right as one block.' : ''}`, {
          roles: headRoles([], null),
          pointers: { [headB()]: 'B' },
          vars: counts(aCount, bCount),
        });
        if (na === 0) break;
        arr[dest] = tmp[b];
        [dest, b, nb] = [dest - 1, b - 1, nb - 1];
        snap(10, `B's ${key.value} goes next, to index ${dest + 1}: A's last value left is not larger.`, { roles: headRoles([], dest + 1), vars: counts(aCount, bCount) });
        if (nb === 1) break;
        const keyA = arr[a];
        const before2 = comparisons;
        bCount = nb - gallopLeft(keyA, tmp, 0, nb, nb - 1, lt);
        if (log) log.gallops++;
        const cost2 = comparisons - before2;
        if (bCount) {
          [dest, b, nb] = [dest - bCount, b - bCount, nb - bCount];
          for (let k = 1; k <= bCount; k++) arr[dest + k] = tmp[b + k];
        }
        snap(10, `Galloping: gallop_left finds how many of B's last values are >= A's ${keyA.value}: ${bCount} (${plural(cost2, 'comparison', 'comparisons')}).${bCount ? ' They move as one block.' : ''}`, {
          roles: headRoles([], null),
          pointers: { [headA()]: 'A' },
          vars: counts(aCount, bCount),
        });
        if (nb <= 1) break;
        arr[dest] = arr[a];
        [dest, a, na] = [dest - 1, a - 1, na - 1];
        const leave = na !== 0 && aCount < MIN_GALLOP && bCount < MIN_GALLOP;
        snap(
          10,
          `A's ${keyA.value} goes next, to index ${dest + 1}.${leave ? ` Both blocks were shorter than MIN_GALLOP = ${MIN_GALLOP} (${aCount} and ${bCount}): leave galloping, and min_gallop goes up to ${mg + 1}.` : ''}`,
          { roles: headRoles([], dest + 1), vars: counts(aCount, bCount) },
        );
        if (na === 0) break;
        if (aCount < MIN_GALLOP && bCount < MIN_GALLOP) break;
      }
      if (na === 0 || nb <= 1) {
        galloping = false;
        break;
      }
      mg++;
      minGallop = mg;
      galloping = false;
    }
    const restA = na;
    const restB = nb;
    for (let k = na - 1; k >= 0; k--) arr[dest - na + 1 + k] = arr[baseA + k];
    for (let k = 0; k < nb; k++) arr[baseA + k] = tmp[k];
    dest = baseA - 1;
    [na, nb] = [0, 0];
    snap(
      9,
      restA === 0
        ? `A is used up: the first ${plural(restB, 'value', 'values')} of B ${restB === 1 ? 'comes' : 'come'} back from the temporary array.`
        : `Only B's first value is left, and it is smaller than all of A: the rest of A (${plural(restA, 'value', 'values')}) slides right and it goes first.`,
      { roles: {} },
    );
  };

  /** merge_at: trim what is already in place, then merge_lo or merge_hi. */
  const mergeAt = (i: number) => {
    const before = pending.map((r) => ({ ...r }));
    let baseA = pending[i].base;
    let na = pending[i].length;
    const baseB = pending[i + 1].base;
    let nb = pending[i + 1].length;
    pending[i] = { base: baseA, length: na + nb };
    pending.splice(i + 1, 1);
    const entry: [number, number, number, 'lo' | 'hi' | 'none', number] = [i, 0, 0, 'none', 0];
    merge = { before, i, lo: 0, view: () => [], tmp: () => [] };
    const names = `${runName(i)} and ${runName(i + 1)}`;

    const keyB = arr[baseB];
    let before1 = comparisons;
    const k = gallopRight(keyB, arr, baseA, na, 0, lt);
    let cost = comparisons - before1;
    baseA += k;
    na -= k;
    snap(
      8,
      na === 0
        ? `Merge ${names}. All of ${runName(i)} is <= ${runName(i + 1)}'s first value ${keyB.value} (gallop_right, ${plural(cost, 'comparison', 'comparisons')}): the two runs are already in order, nothing moves.`
        : k === 0
          ? `Merge ${names}. Trim: ${runName(i + 1)}'s first value ${keyB.value} is smaller than ${runName(i)}'s first value, so no value of ${runName(i)} is in place yet (gallop_right, ${plural(cost, 'comparison', 'comparisons')}).`
          : `Merge ${names}. Trim: gallop_right finds that ${plural(k, 'value', 'values')} at the start of ${runName(i)} ${k === 1 ? 'is' : 'are'} <= ${runName(i + 1)}'s first value ${keyB.value} and already in place (${plural(cost, 'comparison', 'comparisons')}).`,
      { roles: { [baseB]: 'compare' }, pointers: { [baseB]: 'B[0]' } },
    );
    if (na > 0) {
      const keyA = arr[baseA + na - 1];
      before1 = comparisons;
      const nb2 = gallopLeft(keyA, arr, baseB, nb, nb - 1, lt);
      cost = comparisons - before1;
      const kept = nb - nb2;
      nb = nb2;
      snap(
        8,
        nb === 0
          ? `All of what is left of ${runName(i + 1)} is >= ${runName(i)}'s last value ${keyA.value} (gallop_left, ${plural(cost, 'comparison', 'comparisons')}): nothing moves.`
          : kept === 0
            ? `Trim: ${runName(i)}'s last value ${keyA.value} is larger than ${runName(i + 1)}'s last value, so no value of ${runName(i + 1)} is in place yet (gallop_left, ${plural(cost, 'comparison', 'comparisons')}). Left to merge: ${na} and ${nb}.`
            : `Trim: gallop_left finds that ${plural(kept, 'value', 'values')} at the end of ${runName(i + 1)} ${kept === 1 ? 'is' : 'are'} >= ${runName(i)}'s last value ${keyA.value} and already in place (${plural(cost, 'comparison', 'comparisons')}). Left to merge: ${na} and ${nb}.`,
        { roles: { [baseA + na - 1]: 'compare' }, pointers: { [baseA + na - 1]: 'A[-1]' } },
      );
      if (nb > 0) {
        entry[1] = na;
        entry[2] = nb;
        entry[3] = na <= nb ? 'lo' : 'hi';
        if (na <= nb) mergeLo(baseA, na, baseB, nb);
        else mergeHi(baseA, na, baseB, nb);
      }
    }
    merge = null;
    entry[4] = minGallop;
    if (log) log.merges.push(entry);
    snap(8, `${names} are now one sorted run of length ${pending[i].length}, ${runName(i)} on the stack.`, {});
  };

  /** merge_collapse, with a frame for every test made on the top of the stack. */
  const mergeCollapse = () => {
    while (pending.length > 1) {
      let k = pending.length - 2;
      const len = (j: number) => pending[j].length;
      const letters: Record<number, string> = { [k + 1]: 'C', [k]: 'B' };
      if (k > 0) letters[k - 1] = 'A';
      if (k > 1) letters[k - 2] = 'W';
      const [b, c] = [len(k), len(k + 1)];
      const a = k > 0 ? len(k - 1) : 0;
      const w = k > 1 ? len(k - 2) : 0;
      const ruleA = k > 0 && a <= b + c;
      const ruleW = !ruleA && k > 1 && w <= a + b;
      if (ruleA || ruleW) {
        const aSmaller = a < c;
        const which = aSmaller ? `A, since A = ${a} < C = ${c}` : `C, since C = ${c} <= A = ${a}`;
        const caption = ruleA
          ? `Check the top of the stack: A = ${a} <= B + C = ${b} + ${c} = ${b + c}. Merge B with the smaller of A and C: ${which}.`
          : `A = ${a} > B + C = ${b + c}, but W = ${w} <= A + B = ${a} + ${b} = ${a + b}: the run below A breaks the invariant (the check added in 2015). Merge B with the smaller of A and C: ${which}.`;
        snap(6, caption, { letters, check: ruleA ? `A <= B + C: ${a} <= ${b + c}` : `W <= A + B: ${w} <= ${a + b}` });
        if (aSmaller) k--;
        mergeAt(k);
      } else if (b <= c) {
        const caption =
          k > 0
            ? `A = ${a} > B + C = ${b + c}${k > 1 ? ` and W = ${w} > A + B = ${a + b}` : ''}, but B = ${b} <= C = ${c}: merge B and C.`
            : `Two runs on the stack: B = ${b} <= C = ${c}, so merge them.`;
        snap(7, caption, { letters, check: `B <= C: ${b} <= ${c}` });
        mergeAt(k);
      } else {
        const caption =
          k > 0
            ? `A = ${a} > B + C = ${b + c}${k > 1 ? `, W = ${w} > A + B = ${a + b}` : ''} and B = ${b} > C = ${c}: the invariants hold, so stop merging and find the next run.`
            : `B = ${b} > C = ${c}: the invariant holds, so stop merging and find the next run.`;
        snap(7, caption, { letters, check: 'invariants hold' });
        break;
      }
    }
  };

  // ---------------------------------------------------------------- the sort

  snap(
    0,
    input.minrun > 0
      ? `n = ${n}, minrun = ${minrun} (given). CPython computes minrun from n: n itself below 64 values, so this short array would be one binary insertion sort; a small minrun shows the runs and merges.`
      : `n = ${n}, minrun = ${minrun}: computed from n as CPython does (n itself below 64, else 32 to 64).`,
    { vars: [['minrun', minrun]] },
  );
  let lo = 0;
  if (n < 2) {
    sorted = true;
    snap(undefined, 'Fewer than 2 values: already sorted, no comparison needed.');
  } else {
    while (lo < n) {
      const found = countRun(lo);
      let run = found[0];
      const descending = found[1];
      if (log) log.runs.push([lo, run, descending]);
      if (descending) {
        const part = arr.slice(lo, lo + run).reverse();
        for (let k = 0; k < run; k++) arr[lo + k] = part[k];
        snap(3, `Reverse the descending run a[${lo}..${lo + run - 1}] in place: now it ascends. It was strictly descending, so no two equal values change order.`, {
          forming: { lo, hi: lo + run },
          roles: Object.fromEntries(Array.from({ length: run }, (_, k) => [lo + k, 'active' as Role])),
        });
      }
      if (run < minrun) {
        const force = Math.min(minrun, n - lo);
        snap(
          4,
          force === run
            ? `The run has length ${run}, below minrun = ${minrun}, but it ends the array: nothing to add.`
            : `The run has length ${run}, below minrun = ${minrun}: extend it to ${force} values with binary insertion sort.`,
          { forming: { lo, hi: lo + run } },
        );
        binaryInsertionSort(lo, lo + force, lo + run);
        run = force;
      }
      pending.push({ base: lo, length: run });
      snap(5, `Push the run a[${lo}..${lo + run - 1}] on the stack as ${runName(pending.length - 1)} (length ${run}), then check the invariants.`, {});
      mergeCollapse();
      if (log) log.stacks.push(pending.map((r) => r.length));
      lo += run;
    }
    if (pending.length > 1) snap(11, `No values left. Merge the runs left on the stack, from the top down, until one remains.`);
    while (pending.length > 1) {
      let k = pending.length - 2;
      const letters: Record<number, string> = { [k + 1]: 'C', [k]: 'B' };
      if (k > 0) letters[k - 1] = 'A';
      const toA = k > 0 && pending[k - 1].length < pending[k + 1].length;
      snap(
        11,
        toA
          ? `Final merges: A = ${pending[k - 1].length} < C = ${pending[k + 1].length}, so merge B with A.`
          : `Final merges: merge the top two runs, B = ${pending[k].length} and C = ${pending[k + 1].length}.`,
        { letters },
      );
      if (toA) k--;
      mergeAt(k);
    }
    sorted = true;
    const repeats = new Set(input.values).size < input.values.length;
    snap(undefined, `Sorted with ${plural(comparisons, 'comparison', 'comparisons')}.${repeats ? ' Equal values kept their input order: Timsort is stable.' : ''}`);
  }
  if (log) {
    log.comparisons = comparisons;
    log.order = arr.map((it) => it.id);
  }
  return frames;
}

/** The record the golden fixtures hold, from one traced run. */
export function timsortSummary(input: TimsortInput): TimsortLog {
  const log: TimsortLog = { runs: [], stacks: [], merges: [], gallops: 0, comparisons: 0, order: [] };
  timsort(input, log);
  return log;
}
