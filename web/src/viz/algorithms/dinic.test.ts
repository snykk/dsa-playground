import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DINIC_CODE, dinicTrace, parseDinic, vertexOrder, type DinicRun } from './dinic';
import { edmondsKarpTrace } from './edmondsKarp';
import { ARROW, FLOW_LIMITS, parseFlow } from './flowNetwork';
import { expectMaxFlow, expectWellFormedFlow, randomNetworks } from './flowTestKit';

interface DinicFixture {
  edges: Array<[number, number, number]>;
  source: number;
  sink: number;
  max_flow: number;
  phases: Array<{ level: Array<[number, number]>; searches: Array<{ path: number[] | null; visits: number; pushed: number | null }> }>;
  residual: Array<[number, Array<[number, number]>]>;
  flows: Array<[number, Array<[number, number]>]>;
  source_side: number[];
  phase_count: number;
  edge_visits: number;
}

const fixtures: DinicFixture[] = JSON.parse(readFileSync(new URL('./__fixtures__/advancedGraph.json', import.meta.url), 'utf8')).dinic;

const fixtureText = (c: DinicFixture) => `${c.edges.map(([u, v, w]) => `${u}->${v} ${w}`).join(', ')}; source ${c.source}, sink ${c.sink}`;

const CLASSIC = '0->1 16, 0->2 13, 1->2 10, 1->3 12, 2->1 4, 2->4 14, 3->2 9, 3->5 20, 4->3 7, 4->5 4; source 0, sink 5';
const COMB = '0->1 2, 1->2 1, 1->3 1, 1->4 1, 1->5 1, 4->6 1, 5->6 1; source 0, sink 6';
const MATCHING = '0->1 1, 0->2 1, 0->3 1, 1->4 1, 1->5 1, 2->4 1, 3->5 1, 3->6 1, 4->7 1, 5->7 1, 6->7 1; source 0, sink 7';

/** The run's values as numbers, shaped like the fixture. */
function asFixture(run: DinicRun) {
  const num = (xs: string[]) => xs.map(Number);
  const rowsOf = (rows: Array<[string, Array<[string, number]>]>) => rows.map(([u, row]) => [Number(u), row.map(([v, c]) => [Number(v), c])]);
  return {
    max_flow: run.maxFlow,
    phases: run.phases.map((p) => ({
      level: p.level.map(([v, d]) => [Number(v), d]),
      searches: p.searches.map((s) => ({ path: s.path && num(s.path), visits: s.visits, pushed: s.pushed })),
    })),
    residual: rowsOf(run.residual),
    flows: rowsOf(run.flows),
    source_side: num(run.sourceSide),
    phase_count: run.phases.length,
    edge_visits: run.edgeVisits,
  };
}

describe('Dinic tracer', () => {
  it('pushes two paths in phase 1 and one in phase 2 on the classic network, and ends on its minimum cut', () => {
    const run = dinicTrace(parseFlow(CLASSIC));
    expect(run.paths).toEqual([
      [['0', '1', '3', '5'], 12],
      [['0', '2', '4', '5'], 4],
      [['0', '2', '4', '3', '5'], 7],
    ]);
    expect(run.phases.map((p) => p.searches.map((s) => s.visits))).toEqual([[8, 10, 3], [15, 4], []]);
    expect(run.phases.length).toBe(3);
    expect(run.edgeVisits).toBe(40);
    expect(run.sourceSide).toEqual(['0', '1', '2', '4']);
    expect(run.cut).toEqual({ value: 23, source: ['0', '1', '2', '4'], sink: ['3', '5'] });
    expect(run.flows).toEqual([
      ['0', [['1', 12], ['2', 11]]],
      ['1', [['2', 0], ['3', 12]]],
      ['2', [['1', 0], ['4', 11]]],
      ['3', [['2', 0], ['5', 19]]],
      ['4', [['3', 7], ['5', 4]]],
    ]);
  });

  it('labels every vertex with its level and shows the level graph before the searches', () => {
    const run = dinicTrace(parseFlow(CLASSIC));
    const levelGraph = run.frames.filter((f) => f.line === 5);
    expect(levelGraph.length).toBe(2);
    const badge = (k: number, v: string) => levelGraph[k].state.nodes.find((n) => n.id === v)!.badge;
    expect(['0', '1', '2', '3', '4', '5'].map((v) => badge(0, v))).toEqual(['lv 0', 'lv 1', 'lv 1', 'lv 2', 'lv 2', 'lv 3']);
    expect(['0', '1', '2', '3', '4', '5'].map((v) => badge(1, v))).toEqual(['lv 0', 'lv 1', 'lv 1', 'lv 3', 'lv 2', 'lv 4']);
    expect(levelGraph[0].caption).toContain(['01', '02', '13', '24', '35', '45'].map(([u, v]) => `${u}${ARROW}${v}`).join(', '));
  });

  it('passes the dead ends once: the second search resumes vertex 1 at its current arc', () => {
    const run = dinicTrace(parseFlow(COMB));
    expect(run.phases[0].searches).toEqual([
      { path: ['0', '1', '4', '6'], visits: 9, pushed: 1 },
      { path: ['0', '1', '5', '6'], visits: 5, pushed: 1 },
      { path: null, visits: 1, pushed: null },
    ]);
    const secondStart = run.frames.find((f) => f.caption.startsWith('Search 2 of phase 1'))!;
    const arcs = secondStart.state.strips.find((s) => s.label === 'Current arcs')!.items.map((it) => it.text);
    expect(arcs).toContain(`1${ARROW}4`);
    // 2 and 3 were found dead ends in search 1 and are not entered again.
    const deadEnds = run.frames.filter((f) => f.line === 9).map((f) => f.caption.match(/so (\w+) is a dead end/)?.[1]);
    expect(deadEnds).toEqual(['2', '3', '0']);
  });

  it('cancels flow through reverse entries on the matching network in its second phase', () => {
    const run = dinicTrace(parseFlow(MATCHING));
    expect(run.maxFlow).toBe(3);
    expect(run.paths.map(([p]) => p.join(''))).toEqual(['0147', '0357', '02415367']);
    expect(run.phases.length).toBe(3);
  });

  it('returns 0 when the source is the sink or the sink is unreachable, and ignores zero-capacity edges', () => {
    const same = dinicTrace(parseFlow('0->1 10; source 0, sink 0'));
    expect(same.frames.length).toBe(1);
    expect(same.sourceSide).toEqual(['0']);
    const unreachable = dinicTrace(parseFlow('0->1 5, 2->3 5; source 0, sink 3'));
    expect([unreachable.maxFlow, unreachable.phases.length, unreachable.edgeVisits]).toEqual([0, 1, 0]);
    expect(dinicTrace(parseFlow('0->1 0, 0->2 3, 1->3 9, 2->3 9; source 0, sink 3')).maxFlow).toBe(3);
    expect(dinicTrace(parseFlow('0->1 4, 1->0 6, 1->2 5; source 0, sink 2')).maxFlow).toBe(4);
  });

  it('orders entries as Python sorts the keys: ints by value, otherwise strings by code point', () => {
    expect(['10', '9', '2'].sort(vertexOrder(['10', '9', '2']))).toEqual(['2', '9', '10']);
    expect(['t', 'a', 'S', '10', '9'].sort(vertexOrder(['t', 'a', 'S', '10', '9']))).toEqual(['10', '9', 'S', 'a', 't']);
    // With letters, a written later than b is still tried first.
    const run = dinicTrace(parseFlow('s->b 1, s->a 1, a->t 1, b->t 1; source s, sink t'));
    expect(run.paths.map(([p]) => p.join(''))).toEqual(['sat', 'sbt']);
  });

  it('reproduces the golden fixture from the Python code: levels, searches, residual dict, flows, cut, counts', () => {
    expect(fixtures.length).toBeGreaterThan(100);
    for (const c of fixtures) {
      expect(asFixture(dinicTrace(parseFlow(fixtureText(c)))), fixtureText(c)).toEqual({
        max_flow: c.max_flow,
        phases: c.phases,
        residual: c.residual,
        flows: c.flows,
        source_side: c.source_side,
        phase_count: c.phase_count,
        edge_visits: c.edge_visits,
      });
    }
  });

  it('computes a maximum flow equal to the brute-force minimum cut and to Edmonds-Karp on random networks', () => {
    for (const input of randomNetworks(150, 24)) {
      const run = dinicTrace(input);
      expectMaxFlow(input, run);
      expect(run.maxFlow).toBe(edmondsKarpTrace(input).maxFlow);
      expectWellFormedFlow(run.frames, DINIC_CODE.length);
      // The sink's level grows every phase, every path is a shortest one, and a phase looks at
      // no more entries than it has plus (paths x the sink's level): the current arc at work.
      const entries = run.residual.reduce((s, [, row]) => s + row.length, 0);
      let previous = 0;
      for (const p of run.phases) {
        const sinkLevel = new Map(p.level).get(input.sink);
        if (sinkLevel === undefined) continue;
        expect(sinkLevel).toBeGreaterThan(previous);
        previous = sinkLevel;
        const found = p.searches.filter((s) => s.path !== null);
        for (const s of found) expect(s.path!.length).toBe(sinkLevel + 1);
        expect(p.searches.reduce((sum, s) => sum + s.visits, 0)).toBeLessThanOrEqual(entries + found.length * sinkLevel);
      }
    }
  });

  it('accepts the examples within the frame budget', () => {
    for (const text of [CLASSIC, COMB, MATCHING, '0->1 5, 2->3 5; source 0, sink 3']) {
      expect(dinicTrace(parseDinic(text)).frames.length).toBeLessThanOrEqual(FLOW_LIMITS.maxFrames);
    }
  });
});
