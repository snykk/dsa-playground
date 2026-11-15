import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import type { IntervalTimelineState } from '../renderers/IntervalTimeline';
import type { JobSlotsState } from '../renderers/JobSlots';
import { deadlineTrace, JOB_CODE, orderTrace, parseJobs, type Job, type JobId } from './jobScheduling';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/greedyAndField.json', import.meta.url), 'utf8'));
const toJobs = (rows: Array<[JobId, number, number]>): Job[] => rows.map(([id, a, b]) => ({ id, a, b }));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}
const rint = (rand: () => number, lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));

function permutations<T>(xs: T[]): T[][] {
  if (xs.length <= 1) return [xs];
  return xs.flatMap((x, i) => permutations([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p]));
}

/** Best total profit over every subset that can run one job per slot by its deadline (checked slot by slot, as the Python test does). */
function bestProfit(jobs: Job[]): number {
  let best = 0;
  for (let mask = 0; mask < 1 << jobs.length; mask++) {
    const chosen = jobs.filter((_, i) => (mask >> i) & 1).sort((x, y) => x.a - y.a);
    if (chosen.every((j, k) => k + 1 <= j.a)) best = Math.max(best, chosen.reduce((s, j) => s + j.b, 0));
  }
  return best;
}

/** Reference model of job_scheduling_deadline: a stable insertion sort by profit, then a dict of taken slots. */
function modelDeadline(jobs: Job[]): { profit: number; scheduled: JobId[] } {
  const order: Job[] = [];
  for (const j of jobs) {
    let k = order.length;
    while (k > 0 && order[k - 1].b < j.b) k--;
    order.splice(k, 0, j);
  }
  const taken = new Set<number>();
  const scheduled: JobId[] = [];
  let profit = 0;
  for (const j of order) {
    for (let s = j.a; s >= 1; s--) {
      if (!taken.has(s)) {
        taken.add(s);
        scheduled.push(j.id);
        profit += j.b;
        break;
      }
    }
  }
  return { profit, scheduled };
}

function slotsWellFormed(frames: Array<Frame<JobSlotsState>>) {
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(20);
    if (f.line !== undefined) expect(f.line).toBeLessThan(JOB_CODE.deadline.length);
    const keys = f.state.cards.map((c) => c.key);
    expect(new Set(keys).size).toBe(keys.length);
    const inSlots = f.state.cards.flatMap((c) => (c.at.row === 'slot' ? [c.at.slot] : []));
    expect(new Set(inSlots).size, f.caption).toBe(inSlots.length);
    for (const s of inSlots) expect(s >= 1 && s <= f.state.slots).toBe(true);
    if (f.state.probe !== undefined) expect(f.state.probe >= 1 && f.state.probe <= f.state.slots).toBe(true);
  }
}

function timelineWellFormed(frames: Array<Frame<IntervalTimelineState>>, lines: number) {
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(20);
    if (f.line !== undefined) expect(f.line).toBeLessThan(lines);
    const ids = f.state.intervals.map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
    const lanes = f.state.intervals.map((v) => v.lane).sort((a, b) => a - b);
    expect(lanes).toEqual(ids.map((_, i) => i));
  }
}

describe('job scheduling matches job_scheduling.py (golden fixtures)', () => {
  it('job_scheduling_deadline: total profit and the accepted ids in order', () => {
    const cases = fixtures.deadline as Array<{ jobs: Array<[JobId, number, number]>; profit: number; scheduled: JobId[] }>;
    expect(cases.length).toBeGreaterThanOrEqual(100);
    for (const c of cases) {
      const run = deadlineTrace(toJobs(c.jobs));
      expect([run.profit, run.scheduled], JSON.stringify(c.jobs)).toEqual([c.profit, c.scheduled]);
    }
  });

  it('job_scheduling_earliest_deadline: the ids in deadline order', () => {
    const cases = fixtures.edf as Array<{ jobs: Array<[JobId, number, number]>; order: JobId[] }>;
    expect(cases.length).toBeGreaterThanOrEqual(50);
    for (const c of cases) expect(orderTrace('edf', toJobs(c.jobs)).order, JSON.stringify(c.jobs)).toEqual(c.order);
  });

  it('job_scheduling_weighted_completion_time: the order and the total, or ZeroDivisionError', () => {
    const cases = fixtures.smith as Array<{ jobs: Array<[JobId, number, number]>; order?: JobId[]; total?: number; error?: string }>;
    expect(cases.length).toBeGreaterThanOrEqual(50);
    expect(cases.some((c) => c.error)).toBe(true);
    for (const c of cases) {
      const run = orderTrace('smith', toJobs(c.jobs));
      if (c.error) expect(run.error).toBe(c.error);
      else expect([run.order, run.total], JSON.stringify(c.jobs)).toEqual([c.order, c.total]);
    }
  });
});

describe('job scheduling against brute force', () => {
  it('deadline: the model on every input, the best feasible subset when profits are not negative', () => {
    const rand = rng(17);
    for (let t = 0; t < 200; t++) {
      const n = rint(rand, 1, 9);
      const negative = t % 4 === 0;
      const jobs: Job[] = Array.from({ length: n }, (_, i) => ({ id: i % 5 === 4 ? -i : i, a: rint(rand, -1, 6), b: negative ? rint(rand, -9, 30) : rint(rand, 1, 4) * 5 }));
      const run = deadlineTrace(jobs);
      expect({ profit: run.profit, scheduled: run.scheduled }).toEqual(modelDeadline(jobs));
      if (!negative) expect(run.profit, JSON.stringify(jobs)).toBe(bestProfit(jobs));
      // Every placed job sits at or before its deadline.
      run.slots.forEach((i, k) => {
        if (i !== null) expect(k + 1).toBeLessThanOrEqual(jobs[i].a);
      });
      slotsWellFormed(run.frames);
    }
  });

  it('EDF: a stable sort by deadline whose maximum lateness no order beats', () => {
    const rand = rng(23);
    for (let t = 0; t < 150; t++) {
      const n = rint(rand, 1, 6);
      const jobs: Job[] = Array.from({ length: n }, (_, i) => ({ id: i, a: rint(rand, -2, 12), b: rint(rand, 0, 6) }));
      const run = orderTrace('edf', jobs);
      const stable = jobs.map((j, i) => ({ j, i })).sort((x, y) => x.j.a - y.j.a || x.i - y.i);
      expect(run.order).toEqual(stable.map((x) => x.j.id));
      const lateness = (order: Job[]) => {
        let c = 0;
        let worst = 0;
        for (const j of order) {
          c += j.b;
          worst = Math.max(worst, c - j.a);
        }
        return Math.max(0, worst);
      };
      const best = Math.min(...permutations(jobs).map(lateness));
      const last = run.frames[run.frames.length - 1];
      expect(last.vars?.find(([k]) => k === 'max lateness')?.[1]).toBe(best);
      timelineWellFormed(run.frames, JOB_CODE.edf.length);
    }
  });

  it("Smith's rule: ties kept stable, and the total equals the best of every permutation", () => {
    const rand = rng(29);
    for (let t = 0; t < 150; t++) {
      const n = rint(rand, 1, 6);
      const jobs: Job[] = Array.from({ length: n }, (_, i) => ({ id: i, a: rint(rand, 1, 4), b: rint(rand, 0, 8) }));
      const run = orderTrace('smith', jobs);
      // Exact comparison of the ratios w / p by cross-multiplying, so no float is involved.
      const stable = jobs.map((j, i) => ({ j, i })).sort((x, y) => y.j.b * x.j.a - x.j.b * y.j.a || x.i - y.i);
      expect(run.order).toEqual(stable.map((x) => x.j.id));
      const cost = (order: Job[]) => {
        let c = 0;
        let s = 0;
        for (const j of order) {
          c += j.a;
          s += j.b * c;
        }
        return s;
      };
      expect(run.total).toBe(Math.min(...permutations(jobs).map(cost)));
      timelineWellFormed(run.frames, JOB_CODE.smith.length);
    }
  });
});

describe('job scheduling scenarios', () => {
  it('the README example: (142, [1, 3, 5]); by slot c, a, e; jobs 4 and 2 skipped', () => {
    const run = deadlineTrace(parseJobs('1 2 100, 2 1 19, 3 2 27, 4 1 25, 5 3 15', 'deadline').jobs);
    expect([run.profit, run.scheduled]).toEqual([142, [1, 3, 5]]);
    expect(run.slots).toEqual([2, 0, 4]);
    const last = run.frames[run.frames.length - 1].state;
    expect(last.cards.filter((c) => c.at.row === 'tray').map((c) => [c.id, c.note])).toEqual([
      ['2', '1 full'],
      ['4', '1 full'],
    ]);
    // Cards keep their key, so a card glides from the queue to its slot.
    const before = run.frames[2].state.cards.find((c) => c.key === 0)!;
    expect(before.at).toEqual({ row: 'queue', index: 0 });
    expect(last.cards.find((c) => c.key === 0)!.at).toEqual({ row: 'slot', slot: 2 });
  });

  it('a job with id -1 keeps its slot; a deadline of 0 or less is never scheduled', () => {
    expect(deadlineTrace(parseJobs('-1 1 100, 2 1 50', 'deadline').jobs).scheduled).toEqual([-1]);
    const run = deadlineTrace(parseJobs('1 0 50, 2 1 5', 'deadline').jobs);
    expect([run.profit, run.scheduled]).toEqual([5, [2]]);
    expect(run.frames.some((f) => f.caption.includes('range(0, 0, -1) is empty'))).toBe(true);
    const none = deadlineTrace(parseJobs('1 -2 30, 2 0 20', 'deadline').jobs);
    expect([none.profit, none.scheduled, none.slots]).toEqual([0, [], []]);
  });

  it('equal profits keep their input order (stable sort with reverse=True)', () => {
    const run = deadlineTrace(parseJobs('1 1 10, 2 1 10, 3 1 10', 'deadline').jobs);
    expect(run.scheduled).toEqual([1]);
    expect(run.frames[1].caption).toContain('job 1, job 2, job 3');
  });

  it("EDF and Smith's rule on the article's examples; a processing time of 0 raises", () => {
    expect(orderTrace('edf', parseJobs('1 4 5, 2 2 3, 3 6 4', 'edf').jobs).order).toEqual([2, 1, 3]);
    const smith = orderTrace('smith', parseJobs('J1 3 1, J2 1 2, J3 2 3', 'smith').jobs);
    expect([smith.order, smith.total]).toEqual([['J2', 'J3', 'J1'], 17]);
    expect(smith.frames[0].caption).toContain('cost 29');
    const zero = orderTrace('smith', parseJobs('1 2 3, 2 0 5', 'smith').jobs);
    expect(zero.error).toBe('ZeroDivisionError');
    const last = zero.frames[zero.frames.length - 1];
    expect(last.caption).toContain('ZeroDivisionError');
    expect(last.state.intervals.find((v) => v.id === 1)!.role).toBe('bad');
  });

  it('EDF hatches the late part of a bar', () => {
    const run = orderTrace('edf', parseJobs('a 1 3, b 2 2', 'edf').jobs);
    const last = run.frames[run.frames.length - 1].state.intervals;
    expect(last.map((v) => [v.start, v.end, v.conflict])).toEqual([
      [0, 3, { from: 1, to: 3 }],
      [3, 5, { from: 3, to: 5 }],
    ]);
  });

  it('stays well under 2000 frames on the largest inputs', () => {
    const many = Array.from({ length: 12 }, (_, i) => `${i + 1} 12 ${10 + i}`).join(', ');
    expect(deadlineTrace(parseJobs(many, 'deadline').jobs).frames.length).toBeLessThan(2000);
  });
});

describe('parseJobs', () => {
  it('reads triples and tuples, int and word ids', () => {
    expect(parseJobs('1 2 100, J2 1 19', 'deadline').jobs).toEqual([
      { id: 1, a: 2, b: 100 },
      { id: 'J2', a: 1, b: 19 },
    ]);
    expect(parseJobs("[(1, 2, 100), ('a', 1, 19)]", 'deadline').jobs).toEqual([
      { id: 1, a: 2, b: 100 },
      { id: 'a', a: 1, b: 19 },
    ]);
  });

  it('gives friendly errors', () => {
    expect(() => parseJobs('', 'deadline')).toThrow(InputError);
    expect(() => parseJobs('1 2', 'deadline')).toThrow(/three values/);
    expect(() => parseJobs('1 13 5', 'deadline')).toThrow(/-9 to 12/);
    expect(() => parseJobs('1 2 -5', 'smith')).toThrow(/0 to 99/);
    expect(() => parseJobs('long 1 1', 'edf')).toThrow(/job id/);
    expect(() => parseJobs(Array.from({ length: 13 }, (_, i) => `${i} 1 1`).join(', '), 'deadline')).toThrow(/12 jobs/);
    expect(() => parseJobs('(1, 2, 3) x', 'deadline')).toThrow(/tuple/);
  });
});
