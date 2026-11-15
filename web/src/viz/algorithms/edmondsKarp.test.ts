import { describe, expect, it } from 'vitest';
import { EDMONDS_KARP_CODE, edmondsKarpTrace, parseEdmondsKarp } from './edmondsKarp';
import { FLOW_LIMITS, parseFlow } from './flowNetwork';
import { asNumbers, expectMaxFlow, expectWellFormedFlow, fixtureText, flowFixtures, randomNetworks } from './flowTestKit';
import { fordFulkersonTrace } from './fordFulkerson';

const CLASSIC = '0->1 16, 0->2 13, 1->2 10, 1->3 12, 2->1 4, 2->4 14, 3->2 9, 3->5 20, 4->3 7, 4->5 4; source 0, sink 5';

describe('Edmonds-Karp tracer', () => {
  it('takes the three shortest paths of the classic network and ends on the same cut as Ford-Fulkerson', () => {
    const run = edmondsKarpTrace(parseFlow(CLASSIC));
    expect(run.paths).toEqual([
      [['0', '1', '3', '5'], 12],
      [['0', '2', '4', '5'], 4],
      [['0', '2', '4', '3', '5'], 7],
    ]);
    expect(run.cut).toEqual({ value: 23, source: ['0', '1', '2', '4'], sink: ['3', '5'] });
    // The BFS of round 1 dequeues 4 after it has already queued the sink: the sink only counts when it is dequeued.
    const scans = run.frames.filter((f) => f.caption.startsWith('Dequeue')).slice(0, 6).map((f) => f.caption.slice(0, 9));
    expect(scans).toEqual(['Dequeue 0', 'Dequeue 1', 'Dequeue 2', 'Dequeue 3', 'Dequeue 4', 'Dequeue 5']);
  });

  it('labels every reached vertex with its BFS layer', () => {
    const run = edmondsKarpTrace(parseFlow(CLASSIC));
    const atSink = run.frames.find((f) => f.caption.startsWith('Dequeue 5'))!;
    const badge = (v: string) => atSink.state.nodes.find((n) => n.id === v)!.badge;
    expect(['0', '1', '2', '3', '4', '5'].map(badge)).toEqual(['d=0', 'd=1', 'd=1', 'd=2', 'd=2', 'd=3']);
  });

  it('never uses the cross edge of the diamond, whatever order it is written in', () => {
    for (const text of ['0->1 10, 0->2 10, 1->2 1, 1->3 10, 2->3 10; source 0, sink 3', '0->1 10, 0->2 10, 1->3 10, 1->2 1, 2->3 10; source 0, sink 3']) {
      const run = edmondsKarpTrace(parseFlow(text));
      expect(run.paths.map(([p]) => p.join(''))).toEqual(['013', '023']);
    }
  });

  it('returns 0 when the source is the sink or the sink is unreachable, and ignores zero-capacity edges', () => {
    expect(edmondsKarpTrace(parseFlow('0->1 10; source 0, sink 0')).frames.length).toBe(1);
    expect(edmondsKarpTrace(parseFlow('0->1 5, 2->3 5; source 0, sink 3')).maxFlow).toBe(0);
    expect(edmondsKarpTrace(parseFlow('0->1 0, 0->2 3, 1->3 9, 2->3 9; source 0, sink 3')).maxFlow).toBe(3);
    expect(edmondsKarpTrace(parseFlow('0->1 4, 1->0 6, 1->2 5; source 0, sink 2')).maxFlow).toBe(4);
  });

  it('reproduces the golden fixture from the Python code: paths, BFS parents, residual dict', () => {
    expect(flowFixtures.length).toBeGreaterThan(100);
    for (const c of flowFixtures) {
      const { max_flow, paths, searches, residual } = asNumbers(edmondsKarpTrace(parseFlow(fixtureText(c))));
      // bfs_find_path's parent dict never holds the source.
      expect({ max_flow, paths, searches: searches.map((s) => s.filter((v) => v !== c.source)), residual }, fixtureText(c)).toEqual(c.ek);
      expect(searches.every((s) => !s.includes(c.source))).toBe(true);
    }
  });

  it('computes a maximum flow equal to the brute-force minimum cut and to Ford-Fulkerson on random networks', () => {
    for (const input of randomNetworks(150, 11)) {
      const run = edmondsKarpTrace(input);
      expectMaxFlow(input, run);
      expect(run.maxFlow).toBe(fordFulkersonTrace(input).maxFlow);
      expectWellFormedFlow(run.frames, EDMONDS_KARP_CODE.length);
      // Shortest augmenting paths never get shorter.
      const lengths = run.paths.map(([p]) => p.length);
      for (let k = 1; k < lengths.length; k++) expect(lengths[k]).toBeGreaterThanOrEqual(lengths[k - 1]);
    }
  });

  it('accepts the examples within the frame budget', () => {
    for (const text of [CLASSIC, '0->1 5, 2->3 5; source 0, sink 3']) {
      expect(edmondsKarpTrace(parseEdmondsKarp(text)).frames.length).toBeLessThanOrEqual(FLOW_LIMITS.maxFrames);
    }
  });
});
