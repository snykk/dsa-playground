/**
 * Step tracer for Shell Sort (Algorithms/Sorting/Shell_Sort/Python/shell_sort.py): for every gap
 * of the chosen sequence, largest first, one insertion-sort pass with that stride (h_sort). The
 * frames follow the Python loops exactly, so the comparisons, the shifts and the array after
 * every pass match the golden fixtures generated from the Python code.
 */
import type { Frame, Role } from '../core/types';
import type { BarItem } from '../renderers/ArrayBars';

export type GapSequenceName = 'shell' | 'knuth' | 'ciura';

export const SEQUENCE_NAMES: GapSequenceName[] = ['shell', 'knuth', 'ciura'];

export const SEQUENCE_LABEL: Record<GapSequenceName, string> = {
  shell: "Shell's",
  knuth: "Knuth's",
  ciura: "Ciura's",
};

export interface ShellSortInput {
  values: number[];
  sequence: GapSequenceName;
}

export interface ShellSortState {
  items: BarItem[];
  roles: Role[];
  sequence: GapSequenceName;
  /** Every gap of the run, largest first. */
  gaps: number[];
  /** The gap of the current pass; null before the first pass and after the last. */
  gap: number | null;
  /** How many passes are complete (gaps[0..done-1]). */
  done: number;
  /** The group (index mod gap) of the element being inserted; null between insertions. */
  group: number | null;
  /** Index -> label drawn under the bar (key, j - gap). */
  pointers: Record<number, string>;
}

const CIURA_BASE = [1, 4, 10, 23, 57, 132, 301, 701];

/** shell_gaps: n / 2, n / 4, ..., 1. */
export function shellGaps(n: number): number[] {
  const gaps: number[] = [];
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) gaps.push(gap);
  return gaps;
}

/** knuth_gaps: (3^k - 1) / 2 below n, largest first. */
export function knuthGaps(n: number): number[] {
  const gaps: number[] = [];
  for (let h = 1; h < n; h = 3 * h + 1) {
    gaps.push(h);
    if (h > Math.floor((n - 2) / 3)) break;
  }
  return gaps.reverse();
}

/** ciura_gaps: Ciura's gaps below n, extended past 701 by 2h + floor(h / 4). */
export function ciuraGaps(n: number): number[] {
  const gaps = CIURA_BASE.filter((g) => g < n);
  let h = CIURA_BASE[CIURA_BASE.length - 1];
  while (h < n) {
    if (h > Math.floor((n - 1) / 2) || Math.floor(h / 4) >= n - 2 * h) break;
    h = 2 * h + Math.floor(h / 4);
    gaps.push(h);
  }
  return gaps.reverse();
}

export function gapSequence(n: number, sequence: GapSequenceName): number[] {
  if (sequence === 'shell') return shellGaps(n);
  if (sequence === 'knuth') return knuthGaps(n);
  return ciuraGaps(n);
}

/** Group letter for index mod gap: A, B, C, ... (a gap below 24 never needs more than 23). */
export const groupLetter = (g: number): string => String.fromCharCode(65 + g);

const plural = (k: number, one: string, many: string) => `${k} ${k === 1 ? one : many}`;

/** 2nd, 3rd, 4th, 11th, 21st, ... */
export function ordinal(k: number): string {
  const teen = k % 100 >= 11 && k % 100 <= 13;
  const suffix = teen ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[k % 10] ?? 'th';
  return `${k}${suffix}`;
}

/** The indices of one group, as "0, 4 and 8" (at most five listed, then "...") */
function members(group: number, gap: number, upTo: number): string {
  const idx: number[] = [];
  for (let k = group; k <= upTo; k += gap) idx.push(k);
  if (idx.length > 5) return `${idx.slice(0, 2).join(', ')}, ..., ${idx[idx.length - 1]}`;
  if (idx.length === 1) return String(idx[0]);
  return `${idx.slice(0, -1).join(', ')} and ${idx[idx.length - 1]}`;
}

export function shellSort({ values, sequence }: ShellSortInput): Array<Frame<ShellSortState>> {
  const n = values.length;
  const items: BarItem[] = values.map((value, id) => ({ id, value }));
  const gaps = gapSequence(n, sequence);
  const frames: Array<Frame<ShellSortState>> = [];
  let comparisons = 0;
  let shifts = 0;
  let sorted = false;
  let completed = 0;

  const snap = (
    line: number | undefined,
    caption: string,
    o: { gap?: number | null; group?: number | null; roles?: Record<number, Role>; pointers?: Record<number, string>; vars?: Array<[string, string | number]> } = {},
  ) => {
    frames.push({
      line,
      caption,
      state: {
        items: items.map((it) => ({ ...it })),
        roles: items.map((_, i) => o.roles?.[i] ?? (sorted ? 'done' : 'idle')),
        sequence,
        gaps,
        gap: o.gap ?? null,
        done: completed,
        group: o.group ?? null,
        pointers: o.pointers ?? {},
      },
      vars: [...(o.vars ?? []), ['comparisons', comparisons], ['shifts', shifts]],
    });
  };

  const gapList = gaps.join(', ');
  snap(
    0,
    `${SEQUENCE_LABEL[sequence]} gaps below n = ${n} are ${gapList}. Each pass insertion-sorts every gap-th element; the last pass, gap 1, is a plain insertion sort.`,
    { vars: [['gaps', gapList]] },
  );

  gaps.forEach((gap, p) => {
    const groups = Math.min(gap, n);
    snap(
      1,
      gap === 1
        ? `Pass ${p + 1}, gap 1: one group, the whole array. This is plain insertion sort, but the earlier passes left little to fix.`
        : `Pass ${p + 1}, gap ${gap}: the array splits into ${groups} groups, each holding every ${ordinal(gap)} element, lettered ${groupLetter(0)} to ${groupLetter(groups - 1)} under the bars. Each element is inserted among the earlier members of its own group.`,
      { gap, vars: [['gap', gap]] },
    );
    for (let i = gap; i < n; i++) {
      const group = i % gap;
      const key = items[i].value;
      const where = gap === 1 ? '' : ` of group ${groupLetter(group)} (indices ${members(group, gap, n - 1)})`;
      snap(3, `i = ${i}: take key = ${key} and insert it among the earlier members${where}.`, {
        gap,
        group,
        roles: { [i]: 'active' },
        pointers: { [i]: 'key' },
        vars: [['gap', gap], ['i', i], ['key', key], ['group', groupLetter(group)]],
      });
      let j = i;
      for (;;) {
        if (j < gap) {
          snap(4, `j = ${j} < gap: index ${j} is the first member of ${gap === 1 ? 'the array' : `group ${groupLetter(group)}`}, so nothing is left to compare.`, {
            gap,
            group,
            roles: { [j]: 'active' },
            pointers: { [j]: 'key' },
            vars: [['gap', gap], ['i', i], ['j', j], ['key', key], ['group', groupLetter(group)]],
          });
          break;
        }
        comparisons++;
        const other = items[j - gap].value;
        const bigger = other > key;
        if (bigger) shifts++;
        snap(
          4,
          bigger
            ? `Compare a[${j - gap}] = ${other} with key ${key}: ${other} > ${key}, so ${other} moves ${plural(gap, 'place', 'places')} right.`
            : `Compare a[${j - gap}] = ${other} with key ${key}: ${other} <= ${key}, so the key stops at index ${j}.`,
          {
            gap,
            group,
            roles: { [j - gap]: 'compare', [j]: 'active' },
            pointers: { [j - gap]: 'j - gap', [j]: 'key' },
            vars: [['gap', gap], ['i', i], ['j', j], ['key', key], ['group', groupLetter(group)]],
          },
        );
        if (!bigger) break;
        [items[j - gap], items[j]] = [items[j], items[j - gap]];
        snap(5, `Shift ${other} from index ${j - gap} to index ${j}; the key's slot moves to index ${j - gap}.`, {
          gap,
          group,
          roles: { [j]: 'compare', [j - gap]: 'active' },
          pointers: { [j - gap]: 'key' },
          vars: [['gap', gap], ['i', i], ['j', j - gap], ['key', key], ['group', groupLetter(group)]],
        });
        j -= gap;
      }
      const run: number[] = [];
      for (let k = group; k <= i; k += gap) run.push(items[k].value);
      snap(
        7,
        `Place key ${key} at index ${j}${j === i ? ' (it does not move)' : ''}. ${gap === 1 ? `The prefix 0..${i}` : `Group ${groupLetter(group)} up to index ${i}`} reads ${run.length > 8 ? `${run.slice(0, 3).join(', ')}, ..., ${run[run.length - 1]}` : run.join(', ')}: in order.`,
        {
          gap,
          group,
          roles: { [j]: 'active' },
          vars: [['gap', gap], ['i', i], ['key', key], ['group', groupLetter(group)]],
        },
      );
    }
    completed++;
    if (gap > 1) {
      snap(1, `Gap ${gap} done: the array is ${gap}-sorted, a[k] <= a[k + ${gap}] for every k. Every later pass keeps it that way.`, {
        gap,
        vars: [['gap', gap]],
      });
    }
  });

  sorted = true;
  snap(
    undefined,
    n < 2
      ? 'Fewer than 2 values: already sorted, no pass needed.'
      : `Shell sort finished: sorted with ${plural(comparisons, 'comparison', 'comparisons')} and ${plural(shifts, 'shift', 'shifts')} over the gaps ${gapList}.`,
  );
  return frames;
}

/** The gaps, the array after every pass and the counts, as the golden fixtures record them. */
export function shellSortSummary(input: ShellSortInput): { gaps: number[]; passes: number[][]; comparisons: number; shifts: number } {
  const frames = shellSort(input);
  const passes: number[][] = [];
  let done = 0;
  for (const f of frames) {
    if (f.state.done > done) passes.push(f.state.items.map((it) => it.value));
    done = f.state.done;
  }
  const last = Object.fromEntries(frames[frames.length - 1].vars ?? []);
  return { gaps: frames[0].state.gaps, passes, comparisons: Number(last.comparisons), shifts: Number(last.shifts) };
}
