import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { skipList } from '../specs/skipList';
import fixtures from './__fixtures__/lists.json';
import { formatSkipOp, mulberry32, parseSkipList, traceSkipList, type SkipInput, type SkipOp, type SkipStep } from './skipList';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function randomInput(rand: () => number): SkipInput {
  const maxLevel = [16, 16, 4, 2, 1, 0][Math.floor(rand() * 6)];
  const ops: SkipOp[] = [];
  const present = new Set<number>();
  for (let k = 0, n = 1 + Math.floor(rand() * 24); k < n; k++) {
    const key = Math.floor(rand() * 21) - 5;
    const r = rand();
    if (r < 0.5 && (present.size < 10 || present.has(key))) {
      ops.push(rand() < 0.15 ? { kind: 'insert', key, level: Math.floor(rand() * (Math.min(maxLevel, 3) + 1)) } : { kind: 'insert', key });
      present.add(key);
    } else if (r < 0.75) ops.push({ kind: 'search', key });
    else {
      ops.push({ kind: 'delete', key });
      present.delete(key);
    }
  }
  return { seed: Math.floor(rand() * 2 ** 32), p: [0.5, 0.25, 0.75][Math.floor(rand() * 3)], maxLevel, ops };
}

describe('mulberry32', () => {
  it('is the seeded generator the fixture script uses (values from Python)', () => {
    const r = mulberry32(7);
    expect([r(), r(), r()]).toEqual([0.011704753153026104, 0.06195825757458806, 0.97690763277933]);
  });
});

describe('traceSkipList', () => {
  it('agrees with a sorted set on random scripts and keeps the skip list invariants', () => {
    const rand = rng(99);
    for (let t = 0; t < 150; t++) {
      const input = randomInput(rand);
      const run = traceSkipList(input);
      const model = new Set<number>();
      expect(run.steps.length).toBe(input.ops.length);
      input.ops.forEach((op, i) => {
        const step = run.steps[i];
        if (op.kind === 'search') {
          expect(step.result).toBe(model.has(op.key));
          expect(step.draws).toBe(0);
        } else if (op.kind === 'delete') {
          expect(step.result).toBe(model.delete(op.key));
          expect(step.draws).toBe(0);
        } else {
          const fresh = !model.has(op.key);
          model.add(op.key);
          expect(step.result).toBeNull();
          if (!fresh || op.level !== undefined) expect(step.draws).toBe(0);
          // _random_level draws once per level climbed, plus the draw that stops it.
          else expect(step.draws).toBe((step.height as number) + 1);
          if (fresh && op.level !== undefined) expect(step.height).toBe(op.level);
          if (fresh) expect(step.height).toBeLessThanOrEqual(input.maxLevel);
        }
        const sorted = [...model].sort((a, b) => a - b);
        expect(step.levels[0]).toEqual(sorted);
        step.levels.forEach((row, l) => {
          expect(row).toEqual([...new Set(row)].sort((a, b) => a - b));
          if (l > 0) for (const k of row) expect(step.levels[l - 1]).toContain(k);
        });
        // `level` is the highest non-empty level (0 when empty).
        expect(step.levels.length).toBe(step.level + 1);
        if (step.level > 0) expect(step.levels[step.level].length).toBeGreaterThan(0);
      });
      expect(run.frames.length).toBeLessThan(2000);
      // Plain checks first, one assertion per run: thousands of frames make per-item expects slow.
      const problems: string[] = [];
      run.frames.forEach((f, k) => {
        if (f.caption.length <= 10) problems.push(`${k}: short caption`);
        if (f.line !== undefined && (f.line < 0 || f.line >= skipList.pseudocode.length)) problems.push(`${k}: line ${f.line}`);
        const ids = f.state.nodes.map((n) => n.id);
        const has = new Set(ids);
        if (has.size !== ids.length) problems.push(`${k}: duplicate ids`);
        for (const l of f.state.links) if (!has.has(l.from) || (l.to !== null && !has.has(l.to))) problems.push(`${k}: link ${l.from} -> ${l.to}`);
        for (const p of f.state.pointers ?? []) if (p.target !== null && !has.has(p.target)) problems.push(`${k}: pointer ${p.name}`);
      });
      expect(problems).toEqual([]);
      // The last frame draws level 0 in order: one box per key on row 0, plus the header.
      const last = run.frames[run.frames.length - 1].state;
      const bottom = last.nodes.filter((n) => n.row === 0 && !n.sentinel).sort((a, b) => a.col - b.col);
      expect(bottom.map((n) => n.label)).toEqual([...model].sort((a, b) => a - b));
    }
  });

  it('matches the Python SkipList fed the same draws (golden fixtures): levels, draws and every key compared', () => {
    interface SkipCase {
      seed: number;
      p: number;
      max_level: number;
      ops: Array<[string, number, number?]>;
      steps: Array<Omit<SkipStep, 'op'>>;
    }
    const cases = (fixtures as unknown as { skip_list: SkipCase[] }).skip_list;
    expect(cases.length).toBeGreaterThanOrEqual(50);
    for (const c of cases) {
      const ops = c.ops.map(([kind, key, level]): SkipOp => (kind === 'insert' ? (level === undefined ? { kind, key } : { kind, key, level }) : { kind: kind as 'search' | 'delete', key }));
      const run = traceSkipList({ seed: c.seed, p: c.p, maxLevel: c.max_level, ops });
      expect(run.steps.map(({ op: _op, ...rest }) => rest)).toEqual(c.steps);
    }
  });

  it('replays the article: search 19 moves right twice and drops three times', () => {
    const run = traceSkipList(parseSkipList('insert 3^1 6^2 9^0 12^1 19^0 25^3, search 19'));
    const search = run.steps[6];
    expect(search.result).toBe(true);
    expect(search.levels).toEqual([[3, 6, 9, 12, 19, 25], [3, 6, 12, 25], [6, 25], [25]]);
    expect(search.lt).toEqual([25, 6, 25, 12, 25, 19]);
    const done = run.frames.find((f) => f.line === 6);
    expect(done?.vars).toEqual(expect.arrayContaining([['moves right', 2], ['drops', 3]]));
  });

  it('is reproducible: the same seed builds the same towers, another seed may not', () => {
    const a = traceSkipList(parseSkipList('seed 7; insert 3, insert 6, search 6'));
    const b = traceSkipList(parseSkipList('seed 7; insert 3, insert 6, search 6'));
    expect(a.steps).toEqual(b.steps);
    expect(a.steps[0].height).toBe(2); // 0.011 heads, 0.061 heads, 0.976 tails
    const heights = new Set(Array.from({ length: 20 }, (_, s) => traceSkipList(parseSkipList(`seed ${s}; insert 1 2 3 4`)).steps.map((x) => x.height).join()));
    expect(heights.size).toBeGreaterThan(5);
  });

  it('caps towers at max_level, drawing before the cap is checked as Python does', () => {
    const run = traceSkipList(parseSkipList('seed 7; max 1; insert 3'));
    // 0.011 < p: lvl = 1; 0.061 < p but lvl == max_level: stop. Two draws.
    expect(run.steps[0]).toMatchObject({ height: 1, draws: 2 });
  });

  it('lowers level after deleting the top tower and lets the tower leave as a ghost', () => {
    const run = traceSkipList(parseSkipList('insert 3^1 6^2 25^3, delete 25'));
    expect(run.steps[3]).toMatchObject({ result: true, level: 2, levels: [[3, 6], [3, 6], [6]] });
    const ghost = run.frames.filter((f) => f.state.nodes.some((n) => n.ghost));
    expect(ghost.length).toBe(1);
    expect(ghost[0].state.nodes.filter((n) => n.ghost).length).toBe(4);
  });

  it('runs every example and keeps one extent per run', () => {
    for (const ex of skipList.examples) {
      const frames = skipList.trace(skipList.parse(ex.value));
      expect(frames.length).toBeGreaterThan(5);
      expect(new Set(frames.map((f) => JSON.stringify(f.state.extent))).size).toBe(1);
    }
  });
});

describe('parseSkipList', () => {
  it('reads settings, short forms, several keys and fixed levels', () => {
    const input = parseSkipList('seed 42; p 0.25; max 3; i 5 7^2, insert 9 level 1, s 7, d 5');
    expect(input).toMatchObject({ seed: 42, p: 0.25, maxLevel: 3 });
    expect(input.ops.map(formatSkipOp)).toEqual(['insert(5)', 'insert(7) level 2', 'insert(9) level 1', 'search(7)', 'delete(5)']);
    expect(parseSkipList('insert 1')).toMatchObject({ seed: 1, p: 0.5, maxLevel: 16 });
  });

  it('gives friendly errors', () => {
    expect(() => parseSkipList('')).toThrow(InputError);
    expect(() => parseSkipList('push 3')).toThrow(/Cannot read/);
    expect(() => parseSkipList('insert')).toThrow(/needs a key/);
    expect(() => parseSkipList('p 1.5; insert 1')).toThrow(/probability/);
    expect(() => parseSkipList('max 20; insert 1')).toThrow(/up to 16/);
    expect(() => parseSkipList('max 2; insert 1^3')).toThrow(/above max_level/);
    expect(() => parseSkipList('search 4^2')).toThrow(/only insert/);
    expect(() => parseSkipList('seed 1; seed 2; insert 1')).toThrow(/only once/);
    expect(() => parseSkipList('insert 1 2 3 4 5 6 7 8 9 10 11')).toThrow(/At most 10 keys/);
  });
});
