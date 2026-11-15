import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { ARROW, buildResidual, checkFrameBudget, FLOW_LIMITS, flowLayout, formatFlow, parseFlow, pythonGraph, residualPairs } from './flowNetwork';
import { asNumbers, expectMaxFlow, expectWellFormedFlow, fixtureText, flowFixtures, randomNetworks } from './flowTestKit';
import { FORD_FULKERSON_CODE, fordFulkersonTrace, parseFordFulkerson } from './fordFulkerson';

const CLASSIC = '0->1 16, 0->2 13, 1->2 10, 1->3 12, 2->1 4, 2->4 14, 3->2 9, 3->5 20, 4->3 7, 4->5 4; source 0, sink 5';

describe('parseFlow', () => {
  it('keeps the edges in the order written, with the first and last vertex as defaults', () => {
    const g = parseFlow('a->b 3, a->c, c->b 0');
    expect(g.edges).toEqual([
      { from: 'a', to: 'b', cap: 3 },
      { from: 'a', to: 'c', cap: 1 },
      { from: 'c', to: 'b', cap: 0 },
    ]);
    expect([g.nodes, g.source, g.sink]).toEqual([['a', 'b', 'c'], 'a', 'c']);
    expect(parseFlow('0->1 5; s=1, t 0')).toMatchObject({ source: '1', sink: '0' });
    expect(parseFlow(formatFlow(parseFlow(CLASSIC)))).toEqual(parseFlow(CLASSIC));
  });

  it('rejects what the picture or the dict cannot hold, with a friendly message', () => {
    const bad = [
      ['0-1 5', 'directed'],
      ['0->0 5', 'self-loop'],
      ['0->1 5, 0->1 3', 'twice'],
      ['0->1 100', '0 to 99'],
      ['0->1 -2', '0 to 99'],
      ['0->1 5; sink 7', 'not a vertex'],
      ['0->1 5; source 0, source 1', 'only once'],
      ['', 'at least one edge'],
      ['0=>1', 'Cannot read'],
      ['abcd->1 3', '1 to 3'],
      [Array.from({ length: 17 }, (_, i) => `${i % 8}->${(i + 1 + Math.floor(i / 8)) % 8} 1`).join(', '), 'At most 16 edges'],
      [Array.from({ length: 8 }, (_, i) => `${i}->${i + 1} 1`).join(', '), 'At most 8 vertices'],
    ];
    for (const [text, msg] of bad) {
      expect(() => parseFlow(text), text).toThrow(InputError);
      expect(() => parseFlow(text), text).toThrow(msg);
    }
  });

  it('refuses a run longer than the player shows', () => {
    const input = parseFlow('0->1 5');
    expect(checkFrameBudget(input, FLOW_LIMITS.maxFrames, 3)).toBe(input);
    expect(() => checkFrameBudget(input, FLOW_LIMITS.maxFrames + 1, 300)).toThrow(/300 augmenting paths/);
  });
});

describe('residual dict', () => {
  it('copies the rows, then adds a 0 reverse entry per edge in dict order, sharing anti-parallel entries', () => {
    const res = buildResidual(pythonGraph(parseFlow('0->1 4, 1->0 6, 1->2 5, 3->1 2')));
    expect(residualPairs(res)).toEqual([
      ['0', [['1', 4]]],
      ['1', [['0', 6], ['2', 5], ['3', 0]]],
      ['3', [['1', 2]]],
      ['2', [['1', 0]]],
    ]);
  });

  it('lays the source out on the left and the sink alone on the right', () => {
    const { pos, width, height } = flowLayout(parseFlow(CLASSIC));
    expect([width, height]).toEqual([482, 280]);
    const x = (v: string) => pos.get(v)!.x;
    expect(x('0')).toBeLessThan(x('1'));
    expect(x('1')).toBe(x('2'));
    expect(x('3')).toBe(x('4'));
    expect(x('4')).toBeLessThan(x('5'));
    const unreachable = flowLayout(parseFlow('0->1 5, 2->3 5; source 0, sink 3')).pos;
    expect(unreachable.get('2')!.x).toBeLessThan(unreachable.get('3')!.x);
  });
});

describe('Ford-Fulkerson tracer', () => {
  it('finds the classic network\'s six DFS paths and its minimum cut', () => {
    const run = fordFulkersonTrace(parseFlow(CLASSIC));
    expect(run.maxFlow).toBe(23);
    expect(run.paths.map(([p, b]) => `${p.join('')}:${b}`)).toEqual(['012435:7', '01245:3', '013245:1', '0135:5', '02135:6', '0235:1']);
    expect(run.cut).toEqual({ value: 23, source: ['0', '1', '2', '4'], sink: ['3', '5'] });
    const last = run.frames[run.frames.length - 1];
    expect(last.line).toBe(14);
    expect(last.caption).toContain('12 + 7 + 4 = 23');
  });

  it('takes the cross edge first when it is written first, and later cancels it through the reverse edge', () => {
    const run = fordFulkersonTrace(parseFlow('0->1 10, 0->2 10, 1->2 1, 1->3 10, 2->3 10; source 0, sink 3'));
    expect(run.paths).toEqual([
      [['0', '1', '2', '3'], 1],
      [['0', '1', '3'], 9],
      [['0', '2', '3'], 9],
      [['0', '2', '1', '3'], 1],
    ]);
    const cancel = run.frames.find((f) => f.caption.startsWith(`Push 1 along 2${ARROW}1`));
    expect(cancel?.caption).toContain(`cancels 1 of 1${ARROW}2's flow`);
    const written = fordFulkersonTrace(parseFlow('0->1 10, 0->2 10, 1->3 10, 1->2 1, 2->3 10; source 0, sink 3'));
    expect(written.paths.length).toBe(2);
  });

  it('shows a reverse edge only while it holds flow, and fills each pipe to flow / capacity', () => {
    const run = fordFulkersonTrace(parseFlow('0->1 4, 1->2 2; source 0, sink 2'));
    const first = run.frames[0].state.edges;
    expect(first.filter((e) => e.kind === 'residual').every((e) => e.hidden)).toBe(true);
    const last = run.frames[run.frames.length - 1].state.edges;
    expect(last.find((e) => e.id === 'e0')).toMatchObject({ label: '2/4', fill: 0.5 });
    expect(last.find((e) => e.id === 'r0')).toMatchObject({ label: '2', hidden: false });
    expect(last.find((e) => e.id === 'e1')).toMatchObject({ label: '2/2', fill: 1 });
  });

  it('returns at once when the source is the sink, and stops at 0 when the sink is unreachable', () => {
    const same = fordFulkersonTrace(parseFlow('0->1 5; source 1, sink 1'));
    expect([same.maxFlow, same.frames.length, same.frames[0].line]).toEqual([0, 1, 0]);
    expect(same.cut).toEqual({ value: 0, source: ['1'], sink: [] });
    const apart = fordFulkersonTrace(parseFlow('0->1 5, 2->3 5; source 0, sink 3'));
    expect(apart.maxFlow).toBe(0);
    expect(apart.cut.source).toEqual(['0', '1']);
  });

  it('reproduces the golden fixture from the Python code: paths, DFS order, residual dict and cut', () => {
    expect(flowFixtures.length).toBeGreaterThan(100);
    for (const c of flowFixtures) {
      const got = asNumbers(fordFulkersonTrace(parseFlow(fixtureText(c))));
      expect(got, fixtureText(c)).toEqual(c.ff);
    }
  });

  it('computes a maximum flow equal to the brute-force minimum cut on random networks', () => {
    for (const input of randomNetworks(150, 7)) {
      const run = fordFulkersonTrace(input);
      expectMaxFlow(input, run);
      expectWellFormedFlow(run.frames, FORD_FULKERSON_CODE.length);
    }
  });

  it('accepts every example of the visualization within the frame budget', () => {
    for (const text of [CLASSIC, '0->1 4, 1->0 6, 1->2 5; source 0, sink 2', '0->1 0, 0->2 3, 1->3 9, 2->3 9; source 0, sink 3']) {
      const frames = fordFulkersonTrace(parseFordFulkerson(text)).frames;
      expect(frames.length).toBeLessThanOrEqual(FLOW_LIMITS.maxFrames);
      expectWellFormedFlow(frames, FORD_FULKERSON_CODE.length);
    }
  });
});
