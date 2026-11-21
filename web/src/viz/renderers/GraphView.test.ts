import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { AnyVizSpec } from '../core/types';
import { graphColoringSpec } from '../specs/backtracking';
import { dagLongestPathSpec } from '../specs/advancedDp';
import { bfs, dfs, dijkstra } from '../specs/graph';
import { bridgesSpec, kosarajuSpec, tarjanSccSpec, topologicalSortSpec } from '../specs/graphStructure';
import { kruskal, prim } from '../specs/mst';
import { bfsShortestPathSpec, dfsExplicitStackSpec, topologicalSortEdgesSpec } from '../specs/patternsMore';
import { havelHakimiSpec } from '../specs/problemTypes';
import { NodeGlyph, type TextSpot } from '../ui/atoms/NodeGlyph';
import { placeGraphLabels, type GraphState } from './GraphView';

const R = 20;
type XY = [number, number];
interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** The room a 12px label takes (7px a character, a 2px halo), estimated on its own, not with the renderer's code. */
function labelBox(spot: TextSpot, width: number): Box {
  const anchor = spot.anchor ?? 'middle';
  const left = anchor === 'start' ? spot.x : anchor === 'end' ? spot.x - width : spot.x - width / 2;
  return { x0: left - 2, x1: left + width + 2, y0: spot.y - 11, y1: spot.y + 5 };
}

/** Points on everything GraphView strokes: each edge every half percent, and each arrowhead filled in. */
function ink(s: GraphState): XY[] {
  const pos = new Map(s.nodes.map((n) => [n.id, n]));
  const pairs = new Set(s.edges.filter((e) => e.directed).map((e) => `${e.from}>${e.to}`));
  const out: XY[] = [];
  for (const e of s.edges) {
    const a = pos.get(e.from)!;
    const b = pos.get(e.to)!;
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const [ux, uy] = [(b.x - a.x) / len, (b.y - a.y) / len];
    const bend = e.directed && pairs.has(`${e.to}>${e.from}`) ? 22 : 0;
    const end = R + (e.directed ? 4 : 0);
    const p: XY = [a.x + ux * R, a.y + uy * R];
    const q: XY = [b.x - ux * end, b.y - uy * end];
    const c: XY = [(a.x + b.x) / 2 - uy * bend, (a.y + b.y) / 2 + ux * bend];
    const at = (t: number): XY => [(1 - t) ** 2 * p[0] + 2 * (1 - t) * t * c[0] + t * t * q[0], (1 - t) ** 2 * p[1] + 2 * (1 - t) * t * c[1] + t * t * q[1]];
    for (let k = 0; k <= 200; k++) out.push(at(k / 200));
    if (e.directed) {
      // The marker: a 10 x 10 triangle, 7 stroke widths across, its point 1 unit past the end.
      const r = at(0.98);
      const l = Math.hypot(q[0] - r[0], q[1] - r[1]) || 1;
      const [tx, ty] = [(q[0] - r[0]) / l, (q[1] - r[1]) / l];
      const unit = (7 * (e.role === 'idle' || e.role === 'muted' ? 2 : 3.5)) / 10;
      for (let i = 0; i <= 20; i++) {
        const along = -9 + i / 2;
        const half = 5 * (1 - i / 20);
        for (let j = -half; j <= half; j += 0.5) out.push([q[0] + (tx * along - ty * j) * unit, q[1] + (ty * along + tx * j) * unit]);
      }
    }
  }
  return out;
}

/** Every label that touches ink, a vertex or another label, or leaves the picture, as a readable line. */
function labelProblems(s: GraphState): string[] {
  const labels = placeGraphLabels(s);
  const boxes: Array<{ what: string; box: Box }> = [];
  for (const e of s.edges) {
    const spot = labels.weights.get(e.id);
    if (s.showWeights) boxes.push({ what: `weight of ${e.from}-${e.to}`, box: labelBox(spot!, String(e.weight).length * 7) });
  }
  for (const n of s.nodes) {
    if (n.badge) boxes.push({ what: `badge "${n.badge}" of ${n.id}`, box: labelBox(labels.badges.get(n.id)!, n.badge.length * 7) });
    if (n.role === 'good' || n.role === 'bad') boxes.push({ what: `status glyph of ${n.id}`, box: labelBox(labels.glyphs.get(n.id)!, 9) });
  }
  const points = ink(s);
  const out: string[] = [];
  boxes.forEach(({ what, box }, i) => {
    const inBox = ([x, y]: XY) => x >= box.x0 && x <= box.x1 && y >= box.y0 && y <= box.y1;
    if (points.some(inBox)) out.push(`${what} is drawn over an edge or an arrowhead`);
    for (const n of s.nodes) if (Math.hypot(Math.max(box.x0 - n.x, 0, n.x - box.x1), Math.max(box.y0 - n.y, 0, n.y - box.y1)) < R) out.push(`${what} covers vertex ${n.id}`);
    boxes.forEach((o, j) => {
      if (j > i && box.x0 < o.box.x1 && o.box.x0 < box.x1 && box.y0 < o.box.y1 && o.box.y0 < box.y1) out.push(`${what} overlaps ${o.what}`);
    });
    if (box.x0 < 0 || box.y0 < 0 || box.x1 > 600 || box.y1 > 380) out.push(`${what} leaves the picture`);
  });
  return out;
}

const node = (id: string, x: number, y: number, badge?: string) => ({ id, x, y, role: 'idle' as const, badge });
const edge = (id: number, from: string, to: string, directed = true) => ({ id, from, to, directed, weight: 7, role: 'idle' as const });

describe('GraphView label placement', () => {
  it('keeps the usual spots when nothing is in the way: badge above, glyph top-left, weight beside the middle', () => {
    const labels = placeGraphLabels({
      nodes: [node('a', 100, 200, 'd=1'), { ...node('b', 400, 200, 'd=2'), role: 'good' }],
      edges: [edge(0, 'a', 'b', false)],
      showWeights: true,
    });
    expect(labels.badges.get('a')).toEqual({ x: 100, y: 200 - R - 8, anchor: 'middle' });
    expect(labels.glyphs.get('b')).toEqual({ x: 400 - R - 4, y: 200 - R + 2, anchor: 'end' });
    const w = labels.weights.get(0)!;
    expect(w.x).toBe(250);
    expect(w.y).toBeGreaterThan(200 + 10);
  });

  it('moves a badge off an edge that comes in from above, and off its arrowhead', () => {
    const s: GraphState = { nodes: [node('a', 300, 40), node('b', 300, 200, 'dp 3')], edges: [edge(0, 'a', 'b')], showWeights: false };
    const spot = placeGraphLabels(s).badges.get('b')!;
    expect(spot.y).not.toBe(200 - R - 8);
    expect(labelProblems(s)).toEqual([]);
  });

  it('NodeGlyph without spots draws what it always drew', () => {
    const html = renderToStaticMarkup(NodeGlyph({ x: 50, y: 60, r: R, label: 'A', role: 'good', badge: 'd=4' }));
    expect(html).toContain('<text class="node-badge" x="50" y="32">d=4</text>');
    expect(html).toContain('x="26" y="42" style="text-anchor:end"');
  });

  const SPECS: AnyVizSpec[] = [
    bfsShortestPathSpec,
    dfsExplicitStackSpec,
    topologicalSortEdgesSpec,
    dagLongestPathSpec,
    bfs,
    dfs,
    dijkstra,
    topologicalSortSpec,
    kosarajuSpec,
    tarjanSccSpec,
    bridgesSpec,
    kruskal,
    prim,
    graphColoringSpec,
    havelHakimiSpec,
  ];
  it.each(SPECS.map((s) => [s.id, s] as const))('%s: no badge, glyph or weight touches an edge, an arrowhead, a vertex or another label', (_, spec) => {
    const problems: string[] = [];
    for (const { value } of spec.examples) {
      spec.trace(spec.parse(value)).forEach((f, i) => {
        for (const p of labelProblems(f.state as GraphState)) problems.push(`${value}, step ${i}: ${p}`);
      });
    }
    expect(problems).toEqual([]);
  });
});
