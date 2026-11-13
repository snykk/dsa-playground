import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { keyId, pyHash, type HKey, type HVal } from './hashTable';
import { openPseudocode, openTrace, parseOpen, stepOf, type OpenOp, type OpenStep, type ProbeMode } from './openAddressing';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/hashing.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function randomOps(rand: () => number, capacity: number, count: number): OpenOp[] {
  const pool: HKey[] = [];
  for (let i = 0; i < 5; i++) pool.push(capacity * Math.floor(rand() * 5) + Math.floor(rand() * 2));
  for (let i = 0; i < 3; i++) pool.push(Math.floor(rand() * 41) - 10);
  pool.push(['cat', 'dog', 'ab', 'ba'][Math.floor(rand() * 4)]);
  return Array.from({ length: count }, (): OpenOp => {
    const key = pool[Math.floor(rand() * pool.length)];
    const r = rand();
    return r < 0.5 ? { kind: 'put', key, value: Math.floor(rand() * 100) } : r < 0.75 ? { kind: 'get', key } : { kind: 'remove', key };
  });
}

/** The slots a probe for key visits, in order (computed independently of the tracer). */
function sequence(mode: ProbeMode, key: HKey, capacity: number): number[] {
  const start = pyHash(key, capacity);
  return Array.from({ length: capacity }, (_, i) => (start + (mode === 'linear' ? i : (i * (i + 1)) / 2)) % capacity);
}

describe.each(['linear', 'quadratic'] as const)('openTrace (%s probing)', (mode) => {
  it('agrees with a Map reference and keeps the open-addressing invariant on random scripts', () => {
    const rand = rng(mode === 'linear' ? 21 : 22);
    for (let t = 0; t < 150; t++) {
      const capacity = [1, 2, 3, 4, 5, 6, 8, 8, 16][Math.floor(rand() * 9)];
      const ops = randomOps(rand, capacity, 1 + Math.floor(rand() * 24));
      const run = openTrace({ mode, capacity, ops });
      const model = new Map<string, HVal>();
      ops.forEach((op, i) => {
        const step = run.steps[i];
        const id = keyId(op.key);
        const seq = sequence(mode, op.key, capacity);
        if (op.kind === 'put') {
          if (step.result === 'full') {
            // Only a new key can fail, and only when its whole sequence is taken by other keys.
            expect(model.has(id)).toBe(false);
            expect(seq.every((s) => step.slots[s] !== null && step.slots[s] !== 'DEL')).toBe(true);
          } else {
            expect(step.result).toBeNull();
            model.set(id, op.value);
          }
        } else if (op.kind === 'get') {
          expect(step.result).toBe(model.has(id) ? model.get(id)! : null);
        } else {
          expect(step.result).toBe(model.delete(id));
        }
        expect(step.size).toBe(model.size);
        // The probes are a prefix of the key's sequence.
        expect(step.probes).toEqual(seq.slice(0, step.probes.length));
        // Every stored key is on its own sequence, after only occupied slots or tombstones, and stored once.
        const stored = new Map<string, HVal>();
        step.slots.forEach((slot, s) => {
          if (slot === null || slot === 'DEL') return;
          const [key, value] = slot;
          expect(stored.has(keyId(key))).toBe(false);
          stored.set(keyId(key), value);
          const own = sequence(mode, key, capacity);
          const at = own.indexOf(s);
          expect(at).toBeGreaterThanOrEqual(0);
          for (const before of own.slice(0, at)) expect(step.slots[before]).not.toBeNull();
        });
        expect(stored).toEqual(model);
      });
      expect(run.frames.length).toBeLessThan(2000);
      for (const f of run.frames) {
        expect(f.caption.length).toBeGreaterThan(10);
        if (f.line !== undefined) expect(f.line).toBeLessThan(openPseudocode(mode).length);
        expect(f.state.slots.length).toBe(capacity);
        if (f.state.probe !== undefined) expect(f.state.probe).toBeLessThan(capacity);
      }
    }
  });

  it('matches the Python class (golden fixtures): probes, result, size and slots after every operation', () => {
    const list = fixtures[mode] as Array<{ capacity: number; ops: Array<[string, HKey, HVal?]>; steps: Array<OpenStep> }>;
    expect(list.length).toBeGreaterThanOrEqual(40);
    for (const c of list) {
      const ops = c.ops.map((op): OpenOp => (op[0] === 'put' ? { kind: 'put', key: op[1], value: op[2]! } : ({ kind: op[0], key: op[1] } as OpenOp)));
      const run = openTrace({ mode, capacity: c.capacity, ops });
      c.steps.forEach((want, i) => {
        const got = run.steps[i];
        const where = `${mode} cap ${c.capacity} ${JSON.stringify(c.ops.slice(0, i + 1))}`;
        expect(got.probes, where).toEqual(want.probes);
        expect(got.result, where).toEqual(want.result);
        expect(got.size).toBe(want.size);
        expect(got.slots, where).toEqual(want.slots);
      });
    }
  });
});

describe('openTrace scenarios', () => {
  it('re-putting a key walks past the tombstone of an earlier collider instead of storing it twice (v0.2.0 fix)', () => {
    const run = openTrace(parseOpen('cap 8; put 1 a, put 17 b, remove 1, put 17 B, get 17, remove 17, get 17', 'linear'));
    const reput = run.steps[3];
    expect(reput.probes).toEqual([1, 2]);
    expect(reput.size).toBe(1);
    expect(reput.slots[1]).toBe('DEL');
    expect(reput.slots[2]).toEqual([17, 'B']);
    expect(run.steps[4].result).toBe('B');
    expect(run.steps[5].result).toBe(true);
    expect(run.steps[6].result).toBeNull();
    expect(run.steps[6].size).toBe(0);
    expect(run.frames.some((f) => f.line === 5 && /keep walking/.test(f.caption))).toBe(true);
  });

  it('a later insert reuses the first tombstone on its sequence', () => {
    const run = openTrace(parseOpen('cap 8; put 3 a, put 11 b, put 19 c, remove 11, get 19, put 27 d', 'linear'));
    expect(run.steps[4].probes).toEqual([3, 4, 5]);
    expect(run.steps[5].probes).toEqual([3, 4, 5, 6]);
    expect(run.steps[5].slots.slice(3, 6)).toEqual([[3, 'a'], [27, 'd'], [19, 'c']]);
  });

  it('a full table raises and stays unchanged; a tombstone makes room again', () => {
    const run = openTrace(parseOpen('cap 4; put 3 a, put 7 b, put 11 c, put 15 d, put 19 e, remove 7, put 19 e', 'linear'));
    expect(run.steps[4].result).toBe('full');
    expect(run.steps[4].slots).toEqual(run.steps[3].slots);
    expect(run.frames.find((f) => f.line === 10)?.caption).toMatch(/^Exception: Hash table is full/);
    expect(run.steps[6].result).toBeNull();
    expect(run.steps[6].slots[0]).toEqual([19, 'e']);
  });

  it('quadratic steps are triangular numbers and reach every slot of a power-of-two table only', () => {
    expect(Array.from({ length: 6 }, (_, i) => stepOf('quadratic', i))).toEqual([0, 1, 3, 6, 10, 15]);
    const same = openTrace(parseOpen('cap 8; put 0 a, put 8 b, put 16 c, put 24 d, put 32 e', 'quadratic'));
    expect(same.steps[4].probes).toEqual([0, 1, 3, 6, 2]);
    const six = openTrace(parseOpen('cap 6; put 0 a, put 6 b, put 12 c, put 18 d, put 24 e', 'quadratic'));
    expect(six.steps[4].result).toBe('full');
    expect(new Set(six.steps[4].probes)).toEqual(new Set([0, 1, 3, 4]));
    expect(six.steps[4].slots.filter((s) => s === null).length).toBe(2);
  });
});
