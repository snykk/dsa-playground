/**
 * Job scheduling tracers for the three rules of
 * Algorithms/Greedy/Job_Scheduling/Python/job_scheduling.py:
 *
 *   'deadline' job_scheduling_deadline(jobs), jobs = (job_id, deadline, profit): sorted by profit
 *     with reverse=True (a stable sort, so equal profits keep their input order), time_slots =
 *     [None] * (max_deadline + 1), and each job takes the first free slot of
 *     range(deadline, 0, -1). Returns (total_profit, scheduled) with scheduled in acceptance
 *     order. Drawn with JobSlots: the jobs drop from the queue into the slots or the skipped tray.
 *   'edf' job_scheduling_earliest_deadline(jobs), jobs = (job_id, deadline, processing_time):
 *     sorted by deadline (stable) and returns the ids. The code ignores processing_time; the
 *     timeline only shows what the returned order means.
 *   'smith' job_scheduling_weighted_completion_time(jobs), jobs = (job_id, processing_time,
 *     weight): sorted by weight / processing_time with reverse=True (stable), then
 *     completion_time += processing_time and total_weighted += weight * completion_time.
 *     A processing_time of 0 raises ZeroDivisionError while the sort keys are computed.
 *   EDF and Smith are drawn with IntervalTimeline (one lane per job).
 * Golden fixtures (__fixtures__/greedyAndField.json) pin the return value of each rule.
 *
 * Input: "1 2 100, 2 1 19, 3 2 27" (id, then the two numbers of the rule), or tuples "(1, 2, 100)".
 * An id is an integer or a short word (a word is a Python str).
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { IntervalTimelineState, IntervalView } from '../renderers/IntervalTimeline';
import type { JobCardView, JobSlotsState } from '../renderers/JobSlots';
import type { StripItem } from '../ui/molecules/Strip';

/** The slots a job with deadline d tries, latest first, in words. */
const scanText = (d: number) => (d === 1 ? 'only slot 1' : d === 2 ? 'scan 2, then 1' : `scan ${d}, ${d - 1}, ... down to 1`);

export type JobId = number | string;
export type JobRule = 'deadline' | 'edf' | 'smith';

/** One input tuple: (id, a, b) = (id, deadline, profit) | (id, deadline, processing_time) | (id, processing_time, weight). */
export interface Job {
  id: JobId;
  a: number;
  b: number;
}

export interface JobInput {
  rule: JobRule;
  jobs: Job[];
}

/* ---------- input ---------- */

interface RuleSpec {
  names: [string, string];
  a: [number, number];
  b: [number, number];
  maxJobs: number;
  example: string;
}

export const JOB_RULES: Record<JobRule, RuleSpec> = {
  deadline: { names: ['deadline', 'profit'], a: [-9, 12], b: [-99, 999], maxJobs: 12, example: '"1 2 100, 2 1 19"' },
  edf: { names: ['deadline', 'processing_time'], a: [-9, 99], b: [0, 20], maxJobs: 10, example: '"1 4 5, 2 2 3"' },
  smith: { names: ['processing_time', 'weight'], a: [0, 20], b: [0, 99], maxJobs: 10, example: '"1 3 10, 2 1 20"' },
};

function parseId(token: string): JobId {
  const quoted = token.match(/^(['"])([A-Za-z][A-Za-z0-9_]{0,2})\1$/);
  if (quoted) return quoted[2];
  if (/^[A-Za-z][A-Za-z0-9_]{0,2}$/.test(token)) return token;
  if (/^-?\d+$/.test(token)) {
    const v = Number(token) || 0;
    if (v < -99 || v > 999) throw new InputError(`Integer ids go from -99 to 999 (got ${token}).`);
    return v;
  }
  throw new InputError(`"${token}" is not a job id: use an integer such as 3 or a word of up to 3 characters such as J1.`);
}

function parseNumber(token: string, what: string, [lo, hi]: [number, number]): number {
  if (!/^-?\d+$/.test(token)) throw new InputError(`The ${what} "${token}" is not a whole number.`);
  const v = Number(token) || 0;
  if (v < lo || v > hi) throw new InputError(`A ${what} goes from ${lo} to ${hi} here (got ${token}).`);
  return v;
}

/** "1 2 100, 2 1 19" or "(1, 2, 100), (2, 1, 19)": one tuple (id, a, b) per job. */
export function parseJobs(text: string, rule: JobRule): JobInput {
  const spec = JOB_RULES[rule];
  const groups = /\(/.test(text)
    ? [...text.matchAll(/\(([^()]*)\)/g)].map((m) => m[1])
    : text.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
  const leftover = /\(/.test(text) ? text.replace(/\(([^()]*)\)/g, '').replace(/[\s,;[\]]/g, '') : '';
  if (leftover) throw new InputError(`Cannot read "${leftover}": write every job as a tuple like (1, 2, 100).`);
  const jobs = groups.map((g): Job => {
    const tokens = g.split(/[\s,]+/).filter(Boolean);
    if (tokens.length !== 3) throw new InputError(`"${g.trim()}" should be three values: id, ${spec.names[0]} and ${spec.names[1]}, as in ${spec.example}.`);
    return { id: parseId(tokens[0]), a: parseNumber(tokens[1], spec.names[0], spec.a), b: parseNumber(tokens[2], spec.names[1], spec.b) };
  });
  if (jobs.length === 0) throw new InputError(`Add at least one job, for example ${spec.example}.`);
  if (jobs.length > spec.maxJobs) throw new InputError(`At most ${spec.maxJobs} jobs, so every one fits on screen (got ${jobs.length}).`);
  return { rule, jobs };
}

/** A job id as Python prints it: 3 or 'J1'. */
export function reprId(id: JobId): string {
  return typeof id === 'string' ? `'${id}'` : String(id);
}

export function reprIds(ids: JobId[]): string {
  return `[${ids.map(reprId).join(', ')}]`;
}

/** Python's sorted(xs, key=..., reverse=...): a stable sort, also with reverse=True (equal keys keep their order). */
function stableSort<T>(xs: T[], key: (x: T) => number, reverse: boolean): T[] {
  return xs
    .map((x, i) => ({ x, i, k: key(x) }))
    .sort((p, q) => (p.k === q.k ? p.i - q.i : (reverse ? q.k - p.k : p.k - q.k)))
    .map((e) => e.x);
}

/** Groups of equal keys, for captions about ties (in sorted order). */
function ties<T>(sorted: T[], key: (x: T) => number, name: (x: T) => string): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j + 1 < sorted.length && key(sorted[j + 1]) === key(sorted[i])) j++;
    if (j > i) out.push(sorted.slice(i, j + 1).map(name).join(', '));
    i = j + 1;
  }
  return out;
}

/* ---------- pseudocode ---------- */

export const JOB_CODE: Record<JobRule, string[]> = {
  deadline: [
    'job_scheduling_deadline(jobs):            # jobs: (job_id, deadline, profit)',
    '  if not jobs: return 0, []',
    '  sorted_jobs = sorted(jobs, key=lambda x: x[2], reverse=True)   # stable: ties keep input order',
    '  max_deadline = max(job[1] for job in sorted_jobs)',
    '  time_slots = [None] * (max_deadline + 1)   # None = free; index 0 is never used',
    '  for job_id, deadline, profit in sorted_jobs:',
    '    for slot in range(deadline, 0, -1):     # latest slot first',
    '      if time_slots[slot] is None:',
    '        time_slots[slot] = job_id; scheduled.append(job_id); total_profit += profit; break',
    '  return total_profit, scheduled',
  ],
  edf: [
    'job_scheduling_earliest_deadline(jobs):   # jobs: (job_id, deadline, processing_time)',
    '  if not jobs: return []',
    '  sorted_jobs = sorted(jobs, key=lambda x: x[1])   # stable: ties keep input order',
    '  return [job[0] for job in sorted_jobs]   # processing_time is not used',
  ],
  smith: [
    'job_scheduling_weighted_completion_time(jobs):   # jobs: (job_id, processing_time, weight)',
    '  if not jobs: return [], 0',
    '  sorted_jobs = sorted(jobs, key=lambda x: x[2]/x[1], reverse=True)   # stable',
    '  scheduled = [job[0] for job in sorted_jobs]',
    '  completion_time = 0; total_weighted = 0',
    '  for _, processing_time, weight in sorted_jobs:',
    '    completion_time += processing_time',
    '    total_weighted += weight * completion_time',
    '  return scheduled, total_weighted',
  ],
};

/* ---------- deadline: profit first, latest free slot ---------- */

export interface DeadlineRun {
  frames: Array<Frame<JobSlotsState>>;
  profit: number;
  scheduled: JobId[];
  /** The job (input index) in each slot 1..max_deadline after the run; null = free. */
  slots: Array<number | null>;
}

export function deadlineTrace(jobs: Job[]): DeadlineRun {
  const frames: Array<Frame<JobSlotsState>> = [];
  const n = jobs.length;
  const name = (i: number) => `job ${reprId(jobs[i].id)}`;
  const sorted = stableSort(
    jobs.map((_, i) => i),
    (i) => jobs[i].b,
    true,
  );
  let queue = jobs.map((_, i) => i);
  let slotCount = 0;
  let made = false;
  let slots: Array<number | null> = [];
  const inSlot = new Map<number, number>();
  const tray: number[] = [];
  const notes = new Map<number, string>();
  const scheduled: JobId[] = [];
  let total = 0;

  const snap = (line: number | undefined, caption: string, o: { cards?: Record<number, Role>; slots?: Record<number, Role>; window?: number; probe?: number; vars?: Array<[string, string | number]> } = {}) => {
    const cards: JobCardView[] = jobs.map((j, i) => {
      const slot = inSlot.get(i);
      const t = tray.indexOf(i);
      const role: Role = o.cards?.[i] ?? (slot !== undefined ? 'done' : t >= 0 ? 'muted' : 'idle');
      return {
        key: i,
        id: String(j.id),
        top: `d ${j.a}`,
        bottom: `p ${j.b}`,
        role,
        at: slot !== undefined ? { row: 'slot', slot } : t >= 0 ? { row: 'tray', index: t } : { row: 'queue', index: queue.indexOf(i) },
        note: notes.get(i),
      };
    });
    frames.push({
      line,
      caption,
      vars: [...(o.vars ?? []), ['total_profit', total], ['scheduled', reprIds(scheduled)]],
      state: {
        cards,
        queueLabel: queue === sorted ? 'by profit' : 'as given',
        slots: slotCount,
        slotsLabel: made ? undefined : 'not made yet',
        slotRoles: o.slots,
        window: o.window,
        probe: o.probe,
        total: `total_profit = ${total}`,
      },
    });
  };

  snap(0, `${n} job${n === 1 ? '' : 's'} as given, each written (id, deadline, profit) and taking one unit of time. A job earns its profit only if it runs in a slot numbered at most its deadline.`);
  queue = sorted;
  const tied = ties(sorted, (i) => jobs[i].b, name);
  snap(
    2,
    `sorted(jobs, key=profit, reverse=True): the most profitable job gets the first chance at a slot. ` +
      (tied.length ? `Equal profits keep their input order, because Python's sort is stable even with reverse=True: ${tied.join('; ')}.` : 'No two profits are equal, so the order is unique.'),
    { cards: Object.fromEntries(sorted.map((i) => [i, 'compare' as Role])) },
  );
  const maxDeadline = Math.max(...jobs.map((j) => j.a));
  slotCount = Math.max(0, maxDeadline);
  made = true;
  slots = Array.from({ length: slotCount }, () => null);
  snap(
    4,
    maxDeadline > 0
      ? `max_deadline = ${maxDeadline}, so time_slots = [None] * ${maxDeadline + 1}. Index 0 is never used: the slots are 1 to ${maxDeadline}, all free (None, a marker no job id can look like).`
      : `max_deadline = ${maxDeadline}, so time_slots has no slot numbered 1 or more: range(deadline, 0, -1) is empty for every job, and none can be scheduled.`,
    { slots: Object.fromEntries(slots.map((_, s) => [s + 1, 'compare' as Role])) },
  );

  for (const i of sorted) {
    const j = jobs[i];
    const id = name(i);
    if (j.a <= 0) {
      tray.push(i);
      notes.set(i, 'd <= 0');
      snap(6, `${id} has deadline ${j.a} <= 0: range(${j.a}, 0, -1) is empty, so no slot is even tried and the job is never scheduled (profit ${j.b} lost).`, {
        cards: { [i]: 'bad' },
      });
      continue;
    }
    snap(5, `${id}: deadline ${j.a}, profit ${j.b}. Look for the latest free slot at or before ${j.a}: ${scanText(j.a)}. Taking the latest slot keeps early slots free for tighter deadlines.`, {
      cards: { [i]: 'active' },
      window: j.a,
    });
    let placed = false;
    for (let s = j.a; s > 0; s--) {
      const holder = slots[s - 1];
      if (holder !== null) {
        snap(7, `time_slots[${s}] holds ${name(holder)} (profit ${jobs[holder].b}), which came first in profit order: it is not None, ${s - 1 === 0 ? 'and slot 1 was the last one to try' : `so try slot ${s - 1}`}.`, {
          cards: { [i]: 'active', [holder]: 'compare' },
          slots: { [s]: 'bad' },
          window: j.a,
          probe: s,
        });
        continue;
      }
      slots[s - 1] = i;
      inSlot.set(i, s);
      scheduled.push(j.id);
      total += j.b;
      snap(
        8,
        `time_slots[${s}] is None, so ${id} takes slot ${s}: scheduled.append(${reprId(j.id)}) and total_profit += ${j.b}, now ${total}.` +
          (s < j.a ? (s + 1 === j.a ? ` Slot ${j.a} was taken.` : ` Slots ${s + 1} to ${j.a} were taken.`) : ''),
        { cards: { [i]: 'good' }, slots: { [s]: 'good' }, window: j.a, probe: s },
      );
      placed = true;
      break;
    }
    if (!placed) {
      tray.push(i);
      notes.set(i, j.a === 1 ? '1 full' : `1-${j.a} full`);
      snap(
        6,
        `${j.a === 1 ? 'Slot 1 is' : `Every slot from ${j.a} down to 1 is`} taken by a more profitable job, so ${id} is skipped (profit ${j.b} lost). A later, less profitable job can never push it out: the greedy never undoes a choice.`,
        { cards: { [i]: 'bad' }, window: j.a },
      );
    }
  }
  const order = slots.map((s, k) => (s === null ? `${k + 1}: free` : `${k + 1}: ${reprId(jobs[s].id)}`));
  snap(
    9,
    `return (${total}, ${reprIds(scheduled)}). The list is in the order the jobs were accepted (by profit), not the order they run: by slot it is ${order.length ? order.join(', ') : 'empty'}.`,
    { cards: Object.fromEntries([...inSlot.keys()].map((i) => [i, 'done' as Role])) },
  );
  return { frames, profit: total, scheduled, slots };
}

/* ---------- EDF and Smith's rule: one lane per job on a time axis ---------- */

export interface OrderRun {
  frames: Array<Frame<IntervalTimelineState>>;
  /** The ids in the returned order; empty when the call raised. */
  order: JobId[];
  /** Smith's rule only: total_weighted. */
  total?: number;
  /** The exception the call raised, if any. */
  error?: string;
}

/** Python's float repr is long; captions show a ratio to 3 decimals and as a fraction. */
function ratioText(w: number, p: number): string {
  const r = w / p;
  return Number.isInteger(r) ? `${w}/${p} = ${r}` : `${w}/${p} = ${r.toFixed(3)}`;
}

export function orderTrace(rule: 'edf' | 'smith', jobs: Job[]): OrderRun {
  const frames: Array<Frame<IntervalTimelineState>> = [];
  const name = (i: number) => `job ${reprId(jobs[i].id)}`;
  const time = (i: number) => (rule === 'edf' ? jobs[i].b : jobs[i].a);
  const label = (i: number) => String(jobs[i].id);
  // Before the sort: the jobs back to back in the given order, so the axis never changes scale.
  const given = jobs.map((_, i) => i);
  const start = new Map<number, number>();
  let t0 = 0;
  for (const i of given) {
    start.set(i, t0);
    t0 += time(i);
  }
  let lanes = given;
  /** The sort reorders the lanes and lays the bars back to back in the new order, so the axis keeps its span. */
  const relayout = (order: number[]) => {
    let t = 0;
    for (const i of order) {
      start.set(i, t);
      t += time(i);
    }
  };
  const placed = new Set<number>();
  let clock = 0;
  let marker: { at: number; label: string } | undefined;
  let note = 'bars: processing_time, back to back in the given order';
  const strips: Array<{ label: string; items: StripItem[] }> = [];

  const snap = (line: number | undefined, caption: string, o: { roles?: Record<number, Role>; late?: boolean; vars?: Array<[string, string | number]> } = {}) => {
    const intervals: IntervalView[] = jobs.map((j, i) => {
      const s = start.get(i)!;
      const e = s + time(i);
      const late = rule === 'edf' && placed.has(i) && e > j.a;
      return {
        id: i,
        label: label(i),
        start: s,
        end: e,
        lane: lanes.indexOf(i),
        role: o.roles?.[i] ?? (placed.has(i) ? 'done' : 'idle'),
        conflict: late ? { from: Math.max(s, j.a), to: e } : undefined,
      };
    });
    frames.push({ line, caption, vars: o.vars, state: { intervals, marker, note, strips: strips.map((s) => ({ ...s, items: [...s.items] })) } });
  };

  if (rule === 'edf') {
    snap(0, `${jobs.length} job${jobs.length === 1 ? '' : 's'} as given, each written (id, deadline, processing_time). The bars only show the processing times back to back; the function itself never reads them.`);
    const sorted = stableSort(given, (i) => jobs[i].a, false);
    lanes = sorted;
    relayout(sorted);
    note = 'lanes: earliest deadline first';
    const tied = ties(sorted, (i) => jobs[i].a, name);
    strips.push({ label: 'returned order (deadline)', items: sorted.map((i) => ({ text: `${reprId(jobs[i].id)} d${jobs[i].a}` })) });
    snap(
      2,
      `sorted(jobs, key=deadline): the lanes reorder by deadline, earliest first, and the bars line up in that order. ` +
        (tied.length ? `Equal deadlines keep their input order (a stable sort): ${tied.join('; ')}.` : 'No two deadlines are equal.'),
      { roles: Object.fromEntries(sorted.map((i) => [i, 'compare' as Role])) },
    );
    let worst = 0;
    sorted.forEach((i, k) => {
      const j = jobs[i];
      start.set(i, clock);
      clock += j.b;
      placed.add(i);
      marker = { at: clock, label: `t = ${clock}` };
      const late = Math.max(0, clock - j.a);
      worst = Math.max(worst, late);
      strips[0].items[k] = { text: `${reprId(j.id)} d${j.a}`, role: 'active' };
      if (k > 0) strips[0].items[k - 1] = { ...strips[0].items[k - 1], role: 'done' };
      snap(
        3,
        `Position ${k + 1}: ${name(i)} (deadline ${j.a}). Run in this order it would occupy [${clock - j.b}, ${clock}) and ` +
          (late > 0 ? `finish ${late} late (hatched). ` : 'finish on time. ') +
          'The code only records the id; this timing is what the order means, not something it computes.',
        { roles: { [i]: 'active' }, vars: [['finish', clock], ['lateness', late], ['max lateness so far', worst]] },
      );
    });
    strips[0].items = strips[0].items.map((it) => ({ ...it, role: 'done' }));
    const order = sorted.map((i) => jobs[i].id);
    snap(
      3,
      `return ${reprIds(order)}. In this order the largest lateness is ${worst}, and no other order of these jobs does better: on one machine with every job ready at time 0, earliest deadline first minimizes the maximum lateness.`,
      { vars: [['max lateness', worst]] },
    );
    return { frames, order };
  }

  // Smith's rule.
  const cost = (order: number[]) => {
    let c = 0;
    let sum = 0;
    for (const i of order) {
      c += jobs[i].a;
      sum += jobs[i].b * c;
    }
    return sum;
  };
  snap(
    0,
    `${jobs.length} job${jobs.length === 1 ? '' : 's'} as given, each written (id, processing_time, weight). In this order they would cost ${cost(given)} (the sum of weight x completion time); the code sorts them first.`,
  );
  const zero = given.find((i) => jobs[i].a === 0);
  if (zero !== undefined) {
    snap(
      2,
      `sorted() first computes the key weight / processing_time of every job in list order. ${name(zero)} has processing_time 0, so ${jobs[zero].b}/0 raises ZeroDivisionError: the function stops and returns nothing.`,
      { roles: { [zero]: 'bad', ...Object.fromEntries(given.filter((i) => i < zero).map((i) => [i, 'compare' as Role])) } },
    );
    return { frames, order: [], error: 'ZeroDivisionError' };
  }
  const sorted = stableSort(given, (i) => jobs[i].b / jobs[i].a, true);
  lanes = sorted;
  relayout(sorted);
  note = 'lanes: weight / processing_time, highest first';
  const tied = ties(sorted, (i) => jobs[i].b / jobs[i].a, name);
  strips.push({ label: 'order (weight / time)', items: sorted.map((i) => ({ text: `${reprId(jobs[i].id)} ${ratioText(jobs[i].b, jobs[i].a).split(' = ')[1]}` })) });
  strips.push({ label: 'total_weighted', items: [] });
  snap(
    2,
    `key = weight / processing_time: ${sorted.map((i) => `${reprId(jobs[i].id)} ${ratioText(jobs[i].b, jobs[i].a)}`).join(', ')}. ` +
      'Highest ratio first: a job delays every job behind it by its own time, so short, heavy jobs go first. ' +
      (tied.length ? `Equal ratios keep their input order (stable): ${tied.join('; ')}.` : ''),
    { roles: Object.fromEntries(sorted.map((i) => [i, 'compare' as Role])) },
  );
  let sum = 0;
  sorted.forEach((i, k) => {
    const j = jobs[i];
    start.set(i, clock);
    clock += j.a;
    sum += j.b * clock;
    placed.add(i);
    marker = { at: clock, label: `C = ${clock}` };
    strips[0].items[k] = { ...strips[0].items[k], role: 'active' };
    if (k > 0) strips[0].items[k - 1] = { ...strips[0].items[k - 1], role: 'done' };
    strips[1].items.push({ text: `${j.b} x ${clock}`, role: 'active' });
    if (k > 0) strips[1].items[k - 1] = { ...strips[1].items[k - 1], role: undefined };
    snap(
      7,
      `${name(i)} runs next: completion_time += ${j.a}, so it finishes at ${clock}, and total_weighted += ${j.b} x ${clock} = ${j.b * clock}, now ${sum}.`,
      { roles: { [i]: 'active' }, vars: [['completion_time', clock], ['total_weighted', sum]] },
    );
  });
  strips[0].items = strips[0].items.map((it) => ({ ...it, role: 'done' }));
  strips[1].items = strips[1].items.map((it) => ({ ...it, role: undefined }));
  const order = sorted.map((i) => jobs[i].id);
  const before = cost(given);
  snap(
    8,
    `return (${reprIds(order)}, ${sum}). ` + (before > sum ? `The given order would cost ${before}; Smith's order saves ${before - sum}.` : 'The given order was already optimal.') + ' No order of these jobs costs less.',
    { vars: [['total_weighted', sum]] },
  );
  return { frames, order, total: sum };
}
