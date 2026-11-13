/**
 * Step tracers for the comparison sorts. Each returns the full list of frames;
 * the final frame always holds the sorted array with every bar marked done.
 */
import type { Frame, Role } from '../core/types';
import type { ArrayState, BarItem } from '../renderers/ArrayBars';

interface SnapOptions {
  roles?: Record<number, Role>;
  pointers?: Record<number, string>;
  range?: ArrayState['range'];
  outlined?: number[];
  vars?: Array<[string, string | number]>;
}

class Recorder {
  items: BarItem[];
  frames: Array<Frame<ArrayState>> = [];
  done = new Set<number>();
  comparisons = 0;
  moves = 0;

  constructor(values: number[]) {
    this.items = values.map((value, id) => ({ id, value }));
  }

  v(i: number): number {
    return this.items[i].value;
  }

  less(i: number, j: number): boolean {
    this.comparisons++;
    return this.v(i) < this.v(j);
  }

  swap(i: number, j: number) {
    if (i === j) return;
    [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
    this.moves++;
  }

  /** Move the item at `from` to index `to`, shifting the ones in between. */
  move(from: number, to: number) {
    if (from === to) return;
    const [item] = this.items.splice(from, 1);
    this.items.splice(to, 0, item);
    this.moves++;
  }

  snap(line: number | undefined, caption: string, o: SnapOptions = {}) {
    const roles = this.items.map((_, i) => o.roles?.[i] ?? (this.done.has(i) ? 'done' : 'idle'));
    this.frames.push({
      line,
      caption,
      state: {
        items: this.items.map((it) => ({ ...it })),
        roles,
        pointers: o.pointers,
        range: o.range,
        outlined: o.outlined,
      },
      vars: [...(o.vars ?? []), ['comparisons', this.comparisons], ['swaps / moves', this.moves]],
    });
  }

  finish(name: string) {
    this.items.forEach((_, i) => this.done.add(i));
    this.snap(
      undefined,
      `${name} finished: sorted with ${this.comparisons} comparisons and ${this.moves} swaps/moves.`,
    );
    return this.frames;
  }
}

const join = (...labels: Array<[number, string]>): Record<number, string> => {
  const out: Record<number, string> = {};
  for (const [i, l] of labels) out[i] = out[i] ? `${out[i]},${l}` : l;
  return out;
};

export function bubbleSort(values: number[]): Array<Frame<ArrayState>> {
  const r = new Recorder(values);
  const n = values.length;
  r.snap(undefined, `Start with ${n} values. Each pass carries the largest unsorted value to the end.`);
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    r.snap(0, `Pass ${i + 1}: positions 0..${n - 1 - i} are still unsorted.`, {
      range: { lo: 0, hi: n - 1 - i, label: 'unsorted' },
      vars: [['i', i]],
    });
    for (let j = 0; j < n - 1 - i; j++) {
      const outOfOrder = r.less(j + 1, j);
      r.snap(3, `Compare ${r.v(j)} and ${r.v(j + 1)}: ${outOfOrder ? 'out of order' : 'already in order'}.`, {
        roles: { [j]: 'compare', [j + 1]: 'compare' },
        pointers: join([j, 'j'], [j + 1, 'j+1']),
        vars: [['i', i], ['j', j], ['swapped', String(swapped)]],
      });
      if (outOfOrder) {
        r.swap(j, j + 1);
        swapped = true;
        r.snap(4, `Swap them: ${r.v(j + 1)} moves right, ${r.v(j)} moves left.`, {
          roles: { [j]: 'active', [j + 1]: 'active' },
          pointers: join([j, 'j'], [j + 1, 'j+1']),
          vars: [['i', i], ['j', j], ['swapped', 'true']],
        });
      }
    }
    r.done.add(n - 1 - i);
    r.snap(5, `End of pass ${i + 1}: ${r.v(n - 1 - i)} has reached its final position ${n - 1 - i}.`, {
      vars: [['i', i], ['swapped', String(swapped)]],
    });
    if (!swapped) {
      for (let k = 0; k < n; k++) r.done.add(k);
      r.snap(6, 'No swaps in this pass, so the array is already sorted: stop early.', { vars: [['i', i]] });
      break;
    }
  }
  return r.finish('Bubble sort');
}

export function insertionSort(values: number[]): Array<Frame<ArrayState>> {
  const r = new Recorder(values);
  const n = values.length;
  r.snap(undefined, 'Start: a single value is a sorted prefix by itself.', { range: { lo: 0, hi: 0, label: 'sorted prefix' } });
  for (let i = 1; i < n; i++) {
    const key = r.v(i);
    r.snap(1, `Take key = ${key} (index ${i}) and insert it into the sorted prefix 0..${i - 1}.`, {
      roles: { [i]: 'active' },
      pointers: { [i]: 'key' },
      range: { lo: 0, hi: i - 1, label: 'sorted prefix' },
      vars: [['i', i], ['key', key]],
    });
    let j = i - 1;
    while (j >= 0) {
      const bigger = r.less(j + 1, j);
      r.snap(3, `Compare ${r.v(j)} with key ${key}: ${bigger ? `${r.v(j)} > ${key}, so it must shift right` : `${r.v(j)} <= ${key}, so the key stops here`}.`, {
        roles: { [j]: 'compare', [j + 1]: 'active' },
        pointers: join([j, 'j'], [j + 1, 'key']),
        range: { lo: 0, hi: i, label: 'sorted prefix' },
        vars: [['i', i], ['j', j], ['key', key]],
      });
      if (!bigger) break;
      r.swap(j, j + 1);
      r.snap(4, `Shift ${r.v(j + 1)} one slot right; the key moves to index ${j}.`, {
        roles: { [j]: 'active', [j + 1]: 'compare' },
        pointers: { [j]: 'key' },
        range: { lo: 0, hi: i, label: 'sorted prefix' },
        vars: [['i', i], ['j', j - 1], ['key', key]],
      });
      j--;
    }
    r.snap(6, `Place ${key} at index ${j + 1}. The prefix 0..${i} is sorted.`, {
      roles: { [j + 1]: 'active' },
      range: { lo: 0, hi: i, label: 'sorted prefix' },
      vars: [['i', i], ['key', key]],
    });
  }
  return r.finish('Insertion sort');
}

export function selectionSort(values: number[]): Array<Frame<ArrayState>> {
  const r = new Recorder(values);
  const n = values.length;
  r.snap(undefined, `Start with ${n} values. Each round selects the minimum of the unsorted part.`);
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    r.snap(1, `Round ${i + 1}: assume the minimum of ${i}..${n - 1} is a[${i}] = ${r.v(i)}.`, {
      roles: { [i]: 'active' },
      pointers: { [i]: 'min' },
      range: { lo: i, hi: n - 1, label: 'unsorted' },
      vars: [['i', i], ['min', `${min} (${r.v(min)})`]],
    });
    for (let j = i + 1; j < n; j++) {
      const smaller = r.less(j, min);
      r.snap(3, `Compare a[${j}] = ${r.v(j)} with the current minimum ${r.v(min)}${smaller ? ': new minimum' : ''}.`, {
        roles: { [j]: 'compare', [min]: 'active' },
        pointers: join([min, 'min'], [j, 'j']),
        range: { lo: i, hi: n - 1, label: 'unsorted' },
        vars: [['i', i], ['j', j], ['min', `${min} (${r.v(min)})`]],
      });
      if (smaller) {
        min = j;
        r.snap(4, `Remember index ${j} as the minimum (${r.v(j)}).`, {
          roles: { [min]: 'active' },
          pointers: { [min]: 'min' },
          range: { lo: i, hi: n - 1, label: 'unsorted' },
          vars: [['i', i], ['j', j], ['min', `${min} (${r.v(min)})`]],
        });
      }
    }
    const moved = min !== i;
    r.swap(i, min);
    r.done.add(i);
    r.snap(5, moved ? `Swap the minimum ${r.v(i)} into index ${i}: its final position.` : `${r.v(i)} is already the minimum: it stays at index ${i}.`, {
      roles: { [i]: 'done', ...(moved ? { [min]: 'active' as Role } : {}) },
      vars: [['i', i]],
    });
  }
  return r.finish('Selection sort');
}

export function mergeSort(values: number[]): Array<Frame<ArrayState>> {
  const r = new Recorder(values);
  r.snap(
    undefined,
    'Start: merge sort splits the array in halves until each piece has one value. (Real implementations merge through an O(n) buffer; here each merge step is drawn in place so you can follow the values.)',
  );

  const sort = (lo: number, hi: number, depth: number) => {
    if (hi <= lo) {
      r.snap(1, `a[${lo}] = ${r.v(lo)} is a single value: already sorted.`, {
        range: { lo, hi: lo },
        roles: { [lo]: 'active' },
        vars: [['lo', lo], ['hi', hi], ['depth', depth]],
      });
      return;
    }
    const mid = Math.floor((lo + hi) / 2);
    r.snap(2, `Split ${lo}..${hi} into ${lo}..${mid} and ${mid + 1}..${hi}.`, {
      range: { lo, hi, label: `depth ${depth}` },
      pointers: join([lo, 'lo'], [mid, 'mid'], [hi, 'hi']),
      vars: [['lo', lo], ['mid', mid], ['hi', hi], ['depth', depth]],
    });
    sort(lo, mid, depth + 1);
    sort(mid + 1, hi, depth + 1);

    // Merge two sorted runs in place: a right head that is smaller rotates in front.
    let i = lo;
    let m = mid;
    let j = mid + 1;
    r.snap(5, `Merge the sorted runs ${lo}..${mid} and ${mid + 1}..${hi}.`, {
      range: { lo, hi, label: 'merging' },
      vars: [['lo', lo], ['mid', mid], ['hi', hi], ['depth', depth]],
    });
    while (i <= m && j <= hi) {
      const rightSmaller = r.less(j, i);
      r.snap(6, `Compare the heads ${r.v(i)} (left) and ${r.v(j)} (right): take ${rightSmaller ? `${r.v(j)} from the right` : `${r.v(i)} from the left${r.v(i) === r.v(j) ? ' (ties take the left head: stable)' : ''}`}.`, {
        range: { lo, hi, label: 'merging' },
        roles: { [i]: 'compare', [j]: 'compare' },
        pointers: join([i, 'L'], [j, 'R']),
        vars: [['lo', lo], ['hi', hi], ['left head', r.v(i)], ['right head', r.v(j)]],
      });
      if (rightSmaller) {
        r.move(j, i);
        r.snap(6, `${r.v(i)} moves in front of the remaining left run.`, {
          range: { lo, hi, label: 'merging' },
          roles: { [i]: 'active' },
          vars: [['lo', lo], ['hi', hi]],
        });
        m++;
        j++;
      }
      i++;
    }
    r.snap(5, `Run ${lo}..${hi} is now sorted.`, {
      range: { lo, hi, label: 'sorted run' },
      vars: [['lo', lo], ['hi', hi], ['depth', depth]],
    });
  };

  sort(0, values.length - 1, 0);
  return r.finish('Merge sort');
}

export function quickSort(values: number[]): Array<Frame<ArrayState>> {
  const r = new Recorder(values);
  r.snap(undefined, 'Start: quick sort partitions around a pivot (Lomuto scheme: the last element).');

  const sort = (lo: number, hi: number) => {
    if (lo > hi) return;
    if (lo === hi) {
      r.done.add(lo);
      r.snap(1, `A single value (${r.v(lo)}) is in its final place.`, { vars: [['lo', lo], ['hi', hi]] });
      return;
    }
    const pivot = r.v(hi);
    r.snap(2, `Partition ${lo}..${hi} around pivot ${pivot} (the last element).`, {
      range: { lo, hi, label: 'partition' },
      roles: { [hi]: 'active' },
      outlined: [hi],
      pointers: { [hi]: 'pivot' },
      vars: [['lo', lo], ['hi', hi], ['pivot', pivot]],
    });
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      r.comparisons++;
      const goesLeft = r.v(j) <= pivot;
      r.snap(5, `${r.v(j)} ${goesLeft ? '<=' : '>'} ${pivot}: ${goesLeft ? 'it belongs in the left part' : 'it stays in the right part'}.`, {
        range: { lo, hi, label: 'partition' },
        roles: { [j]: 'compare', [hi]: 'active' },
        outlined: [hi],
        pointers: join(...(i >= lo ? [[i, 'i'] as [number, string]] : []), [j, 'j'], [hi, 'pivot']),
        vars: [['lo', lo], ['hi', hi], ['pivot', pivot], ['i', i], ['j', j]],
      });
      if (goesLeft) {
        i++;
        r.swap(i, j);
        r.snap(6, i === j ? `Grow the left part to include index ${i}.` : `Swap ${r.v(i)} into the left part at index ${i}.`, {
          range: { lo, hi, label: 'partition' },
          roles: { [i]: 'active', [hi]: 'active' },
          outlined: [hi],
          pointers: join([i, 'i'], [hi, 'pivot']),
          vars: [['lo', lo], ['hi', hi], ['pivot', pivot], ['i', i], ['j', j]],
        });
      }
    }
    r.swap(i + 1, hi);
    r.done.add(i + 1);
    r.snap(7, `Move the pivot ${pivot} to index ${i + 1}: everything left is <= ${pivot}, everything right is > ${pivot}.`, {
      range: { lo, hi, label: 'partition' },
      vars: [['lo', lo], ['hi', hi], ['pivot', pivot], ['pivot index', i + 1]],
    });
    sort(lo, i);
    sort(i + 2, hi);
  };

  sort(0, values.length - 1);
  return r.finish('Quick sort');
}

export function heapSort(values: number[]): Array<Frame<ArrayState>> {
  const r = new Recorder(values);
  const n = values.length;
  r.snap(undefined, 'Start: view the array as a binary tree (children of i are 2i+1 and 2i+2) and build a max-heap.');

  const siftDown = (start: number, size: number, phase: string) => {
    let i = start;
    for (;;) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      let largest = i;
      if (left < size && r.less(largest, left)) largest = left;
      if (right < size && r.less(largest, right)) largest = right;
      const pointers = join([i, 'parent'], ...(left < size ? [[left, 'L'] as [number, string]] : []), ...(right < size ? [[right, 'R'] as [number, string]] : []));
      const roles: Record<number, Role> = { [i]: 'active' };
      if (left < size) roles[left] = 'compare';
      if (right < size) roles[right] = 'compare';
      r.snap(5, largest === i ? `${r.v(i)} is not smaller than its children: the heap property holds here.` : `Largest of parent ${r.v(i)} and its children is ${r.v(largest)}.`, {
        roles,
        pointers,
        range: { lo: 0, hi: size - 1, label: phase },
        vars: [['i', i], ['heap size', size]],
      });
      if (largest === i) return;
      r.swap(i, largest);
      r.snap(6, `Swap ${r.v(i)} up; continue sifting ${r.v(largest)} down from index ${largest}.`, {
        roles: { [i]: 'active', [largest]: 'active' },
        range: { lo: 0, hi: size - 1, label: phase },
        vars: [['i', largest], ['heap size', size]],
      });
      i = largest;
    }
  };

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) siftDown(i, n, 'build heap');
  r.snap(0, `Max-heap built: the maximum ${r.v(0)} is at the root (index 0).`, { roles: { 0: 'active' } });
  for (let end = n - 1; end > 0; end--) {
    r.swap(0, end);
    r.done.add(end);
    r.snap(2, `Swap the root ${r.v(end)} with index ${end}: it is now in its final place.`, {
      roles: { [0]: 'active' },
      vars: [['end', end]],
    });
    siftDown(0, end, 'heap');
  }
  return r.finish('Heap sort');
}

export const SORTERS = {
  'bubble-sort': bubbleSort,
  'insertion-sort': insertionSort,
  'selection-sort': selectionSort,
  'merge-sort': mergeSort,
  'quick-sort': quickSort,
  'heap-sort': heapSort,
} as const;
