import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import type { AmortizedState } from '../renderers/AmortizedView';
import {
  AMORTIZED_CODE,
  AMORTIZED_LIMITS,
  finalCapacity,
  parseArrayRun,
  parseCounterRun,
  traceBinaryCounter,
  traceDynamicArray,
  type AmortizedMethod,
} from './amortizedAnalysis';
import { complexityFixtures, rng } from './growthBoundsTestKit';

const METHODS: AmortizedMethod[] = ['aggregate', 'accounting', 'potential'];

interface ArrayFixture {
  capacity: number;
  appends: number;
  phi0: number;
  steps: Array<{ size: number; capacity: number; copies: number; data: Array<number | null>; actual: number; bank: number; phi: number; amortized: number }>;
}

interface CounterFixture {
  bits: number;
  increments: number;
  steps: Array<{ bits: number[]; flips: number; value: number }>;
}

/** Captions, lines in range, unique cell keys, one block per row. */
function expectWellFormed(frames: Array<Frame<AmortizedState>>, codeLines: number) {
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(20);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(codeLines);
    }
    const keys = f.state.blocks.flatMap((b) => b.cells.map((c) => c.key));
    expect(new Set(keys).size, f.caption).toBe(keys.length);
    expect(new Set(f.state.blocks.map((b) => b.row)).size).toBe(f.state.blocks.length);
    for (const b of f.state.chart.bars) expect(b.value).toBeGreaterThanOrEqual(0);
  }
}

const readout = (f: Frame<AmortizedState>, label: string) => Number(f.state.readouts?.find((r) => r.label === label)?.value);
const coinsOn = (f: Frame<AmortizedState>) => f.state.blocks.flatMap((b) => b.cells).reduce((s, c) => s + (c.role === 'muted' ? 0 : (c.coins ?? 0)), 0);

describe('amortized_analysis.py: the tracers match the Python code (golden fixture)', () => {
  it('DynamicArray: size, capacity, copies and data after every append, with the demos\' actual cost, bank, potential and amortized cost', () => {
    const list = complexityFixtures.dynamicArray as ArrayFixture[];
    expect(list.length).toBeGreaterThanOrEqual(60);
    for (const c of list) {
      for (const method of METHODS) {
        const run = traceDynamicArray({ capacity: c.capacity, appends: c.appends }, method);
        expect(run.phi0).toBe(c.phi0);
        expect(run.steps, `${method} cap ${c.capacity}, n ${c.appends}`).toEqual(c.steps);
      }
    }
  });

  it('BinaryCounter: bits, flips and value after every increment', () => {
    const list = complexityFixtures.counter as CounterFixture[];
    for (const c of list) {
      const run = traceBinaryCounter({ bits: c.bits, increments: c.increments });
      expect(run.steps.map(({ bits, flips, value }) => ({ bits, flips, value })), `bits ${c.bits}, n ${c.increments}`).toEqual(c.steps);
    }
  });

  it('reproduces what the four demo functions print', () => {
    const demos = complexityFixtures.demos;
    const aggregate = traceDynamicArray({ capacity: 4, appends: 10 }, 'aggregate').steps;
    expect(aggregate.map((s, i) => [i, s.size, s.capacity])).toEqual(demos.aggregate);
    const accounting = traceDynamicArray({ capacity: 2, appends: 8 }, 'accounting').steps;
    expect(accounting.map((s, i) => [i, s.actual > 1 ? 'RESIZE' : 'normal', s.actual, 3, s.bank])).toEqual(demos.accounting);
    const copies = accounting[accounting.length - 1].copies;
    expect(demos.accountingTotal).toEqual([`Total actual cost: ${8 + copies} (n writes + ${copies} copies)`]);
    const potential = traceDynamicArray({ capacity: 2, appends: 8 }, 'potential').steps;
    expect(potential.map((s, i) => [i, s.actual > 1 ? 'RESIZE' : 'normal', s.actual, s.amortized.toFixed(2)])).toEqual(demos.potential);
    const counter = traceBinaryCounter({ bits: 4, increments: 10 }).steps;
    expect(counter.map((s, k) => [k + 1, k === 0 ? 0 : counter[k - 1].value, s.value, [...s.bits].reverse().join('')])).toEqual(demos.counter);
  });
});

describe('the three methods on random runs', () => {
  it('aggregate: total cost <= 3n; accounting: the coins on the cells are the bank, never negative; potential: amortized <= 3', () => {
    const rand = rng(41);
    let runs = 0;
    while (runs < 120) {
      const capacity = Math.floor(rand() * (AMORTIZED_LIMITS.maxCapacity + 1));
      const appends = 1 + Math.floor(rand() * AMORTIZED_LIMITS.maxAppends);
      if (finalCapacity(capacity, appends) > AMORTIZED_LIMITS.maxSlots) continue;
      runs += 1;
      for (const method of METHODS) {
        const run = traceDynamicArray({ capacity, appends }, method);
        expectWellFormed(run.frames, AMORTIZED_CODE[method].length);
        const last = run.steps[run.steps.length - 1];
        expect(last.copies).toBeLessThan(2 * appends);
        expect(appends + last.copies).toBeLessThanOrEqual(3 * appends);
        run.steps.forEach((s, i) => {
          expect(s.bank).toBeGreaterThanOrEqual(0);
          expect(s.amortized).toBeLessThanOrEqual(3);
          expect(s.phi).toBeGreaterThanOrEqual(run.phi0);
          expect(s.data.slice(0, s.size)).toEqual(Array.from({ length: i + 1 }, (_, k) => k));
        });
        if (method === 'accounting') {
          for (const f of run.frames) {
            expect(readout(f, 'bank')).toBeGreaterThanOrEqual(0);
            expect(coinsOn(f), f.caption).toBe(readout(f, 'bank'));
          }
        }
        if (method === 'aggregate') {
          const done = run.frames[run.frames.length - 1];
          expect(readout(done, 'total cost')).toBe(appends + last.copies);
        }
      }
    }
  });

  it('a resize copies one element per step into the new block, which then replaces the old one', () => {
    const run = traceDynamicArray({ capacity: 2, appends: 3 }, 'aggregate');
    const resize = run.frames.findIndex((f) => f.caption.startsWith('append(2)'));
    expect(run.frames[resize].state.blocks.map((b) => [b.label, b.cells.length])).toEqual([
      ['data', 2],
      ['new_data', 4],
    ]);
    const copy1 = run.frames[resize + 2].state;
    expect(copy1.blocks[0].cells.map((c) => c.role)).toEqual(['muted', 'muted']);
    expect(copy1.blocks[1].cells.map((c) => c.value)).toEqual(['0', '1', null, null]);
    // The copied element keeps its key, so it glides from the old block into the new one.
    expect(copy1.blocks[1].cells[0].key).toBe(run.frames[resize].state.blocks[0].cells[0].key);
    expect(copy1.chart.bars[2].value).toBe(2);
    const swapped = run.frames[resize + 3].state;
    expect(swapped.blocks.map((b) => [b.label, b.cells.length])).toEqual([['data', 4]]);
  });

  it('capacity 0 grows to 1 on the first append (the v0.2.0 fix): no copies, and amortized cost 2', () => {
    const run = traceDynamicArray({ capacity: 0, appends: 3 }, 'potential');
    expect(run.steps.map((s) => [s.capacity, s.copies, s.actual, s.amortized])).toEqual([
      [1, 0, 1, 2],
      [2, 1, 2, 3],
      [4, 3, 3, 3],
    ]);
  });
});

describe('binary counter', () => {
  it('n increments flip at most 2n bits; the coins on the 1 bits equal the 1 bits', () => {
    for (let bits = 1; bits <= AMORTIZED_LIMITS.maxBits; bits++) {
      for (const n of [1, 7, 16, AMORTIZED_LIMITS.maxIncrements]) {
        const run = traceBinaryCounter({ bits, increments: n });
        expectWellFormed(run.frames, AMORTIZED_CODE.counter.length);
        expect(run.steps[run.steps.length - 1].flips).toBeLessThanOrEqual(2 * n);
        run.steps.forEach((s, k) => expect(s.value).toBe((k + 1) % 2 ** bits));
        for (const f of run.frames) expect(coinsOn(f)).toBe(f.state.blocks[0].cells.filter((c) => c.value === '1').length);
      }
    }
  });

  it('wraps around past all ones: every bit flips and none is set', () => {
    const run = traceBinaryCounter({ bits: 2, increments: 4 });
    expect(run.steps.map((s) => [s.value, s.cost])).toEqual([
      [1, 1],
      [2, 2],
      [3, 1],
      [0, 2],
    ]);
    expect(run.frames.some((f) => f.caption.includes('wraps from 3 to 0'))).toBe(true);
  });
});

describe('parsing', () => {
  it('reads the settings, with the Python defaults when one is missing', () => {
    expect(parseArrayRun('cap 2, n 8')).toEqual({ capacity: 2, appends: 8 });
    expect(parseArrayRun('initial_capacity = 3; appends 12')).toEqual({ capacity: 3, appends: 12 });
    expect(parseArrayRun('append x5')).toEqual({ capacity: 4, appends: 5 });
    expect(parseCounterRun('bits 4, n 10')).toEqual({ bits: 4, increments: 10 });
    expect(parseCounterRun('n 3')).toEqual({ bits: 8, increments: 3 });
  });

  it('gives friendly errors', () => {
    expect(() => parseArrayRun('cap 2, n 0')).toThrow(/Between 1 and 24/);
    expect(() => parseArrayRun('cap 13')).toThrow(/up to 12/);
    expect(() => parseArrayRun('cap 2, n 17')).toThrow(/32 slots/);
    expect(() => parseArrayRun('cap -1')).toThrow(InputError);
    expect(() => parseArrayRun('size 3')).toThrow(/Cannot read/);
    expect(() => parseArrayRun('cap 2, cap 3')).toThrow(/only once/);
    expect(() => parseCounterRun('bits 11')).toThrow(/1 to 10/);
    expect(() => parseCounterRun('bits 4, n 41')).toThrow(/Between 1 and 40/);
  });
});
