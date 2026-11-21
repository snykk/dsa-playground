import { useMemo } from 'react';
import type { Role } from '../core/types';
import { NodeGlyph, type TextSpot } from '../ui/atoms/NodeGlyph';
import { Strips, type StripData } from '../ui/molecules/Strip';
import '../ui/roles.css';
import './GraphView.css';

export interface GraphNodeView {
  id: string;
  x: number;
  y: number;
  role: Role;
  badge?: string;
}

export interface GraphEdgeView {
  id: number;
  from: string;
  to: string;
  directed: boolean;
  weight: number;
  role: Role;
}

export interface GraphState {
  nodes: GraphNodeView[];
  edges: GraphEdgeView[];
  showWeights: boolean;
  /** Labelled token lists under the graph: queue, stack, priority queue, visit order. */
  strips?: StripData[];
}

const R = 20;
const WIDTH = 600;
const HEIGHT = 380;
const MARKER_ROLES: Role[] = ['idle', 'compare', 'active', 'done', 'muted'];

type XY = [number, number];

/** Where one edge is drawn: a segment, or a quadratic curve when two opposite directed edges bend apart. */
interface EdgeShape {
  edge: GraphEdgeView;
  from: XY;
  to: XY;
  /** The control point of the curve; the midpoint for a straight edge. */
  control: XY;
  bent: boolean;
}

/** The drawn ends of every edge, exactly as GraphView strokes them. */
function edgeShapes(state: GraphState): EdgeShape[] {
  const pos = new Map(state.nodes.map((n) => [n.id, n]));
  const pairs = new Set(state.edges.filter((e) => e.directed).map((e) => `${e.from}>${e.to}`));
  return state.edges.map((e) => {
    const a = pos.get(e.from)!;
    const b = pos.get(e.to)!;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    // Opposite directed edges bend apart so both stay visible.
    const bend = e.directed && pairs.has(`${e.to}>${e.from}`) ? 22 : 0;
    const end = R + (e.directed ? 4 : 0);
    return {
      edge: e,
      from: [a.x + ux * R, a.y + uy * R],
      to: [b.x - ux * end, b.y - uy * end],
      control: [(a.x + b.x) / 2 - uy * bend, (a.y + b.y) / 2 + ux * bend],
      bent: bend !== 0,
    };
  });
}

// ---------------------------------------------------------------------------------------------
// Label placement. Badges, status glyphs and edge weights try a short list of spots, the usual
// one first, and take the first that keeps clear of every edge, arrowhead, vertex and label
// placed before it; when none does, the spot with the most room. Sizes are estimates of the
// 12px label text with its 2px halo, on the high side.

/** An axis-aligned box: the room a label takes. */
interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

const CHAR_W = 7;
const GLYPH_W = 9;
const HALO = 2;
/** 12px text: ascent above the baseline, descent below it. */
const ASCENT = 9;
const DESCENT = 3;
const HALF_H = (ASCENT + DESCENT) / 2 + HALO;
/** The baseline sits this far below the middle of the text. */
const BASELINE = (ASCENT - DESCENT) / 2;
/** Room wanted between a label and anything else. */
const CLEAR = 3;
/** The widest stroke an edge gets (an active role), so a label does not jump when roles change. */
const STROKE = 3.5;
/** The arrowhead marker: 7 stroke widths long for a 10-unit path, tip 1 unit past the end. */
const ARROW_UNIT = (7 * STROKE) / 10;

function textWidth(text: string) {
  return text.length * CHAR_W;
}

/** The box of a text drawn at spot (x, baseline y) with the given anchor. */
function boxOf(spot: TextSpot, width: number): Box {
  const anchor = spot.anchor ?? 'middle';
  const left = anchor === 'start' ? spot.x : anchor === 'end' ? spot.x - width : spot.x - width / 2;
  return { x0: left - HALO, x1: left + width + HALO, y0: spot.y - ASCENT - HALO, y1: spot.y + DESCENT + HALO };
}

/** A centered text whose box is centered on (cx, cy). */
function centered(cx: number, cy: number): TextSpot {
  return { x: cx, y: cy + BASELINE, anchor: 'middle' };
}

function pointBox(p: XY, b: Box) {
  const dx = Math.max(b.x0 - p[0], 0, p[0] - b.x1);
  const dy = Math.max(b.y0 - p[1], 0, p[1] - b.y1);
  return Math.hypot(dx, dy);
}

function pointSegment(p: XY, a: XY, b: XY) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2));
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}

function inside(p: XY, b: Box) {
  return p[0] >= b.x0 && p[0] <= b.x1 && p[1] >= b.y0 && p[1] <= b.y1;
}

/** Does segment a-b cross the box? Clip it to the box's slabs (Liang-Barsky). */
function segmentHitsBox(a: XY, b: XY, box: Box) {
  let t0 = 0;
  let t1 = 1;
  const d = [b[0] - a[0], b[1] - a[1]];
  const lo = [box.x0, box.y0];
  const hi = [box.x1, box.y1];
  for (let k = 0; k < 2; k++) {
    if (d[k] === 0) {
      if (a[k] < lo[k] || a[k] > hi[k]) return false;
      continue;
    }
    let ta = (lo[k] - a[k]) / d[k];
    let tb = (hi[k] - a[k]) / d[k];
    if (ta > tb) [ta, tb] = [tb, ta];
    t0 = Math.max(t0, ta);
    t1 = Math.min(t1, tb);
    if (t0 > t1) return false;
  }
  return true;
}

/** Distance from a segment to a box: 0 when they meet; otherwise attained at a corner or an end. */
function segmentBox(a: XY, b: XY, box: Box) {
  if (segmentHitsBox(a, b, box)) return 0;
  const corners: XY[] = [
    [box.x0, box.y0],
    [box.x1, box.y0],
    [box.x0, box.y1],
    [box.x1, box.y1],
  ];
  return Math.min(pointBox(a, box), pointBox(b, box), ...corners.map((c) => pointSegment(c, a, b)));
}

function boxBox(a: Box, b: Box) {
  const dx = Math.max(a.x0 - b.x1, b.x0 - a.x1, 0);
  const dy = Math.max(a.y0 - b.y1, b.y0 - a.y1, 0);
  return Math.hypot(dx, dy);
}

function inTriangle(p: XY, [a, b, c]: [XY, XY, XY]) {
  const side = (u: XY, v: XY) => (v[0] - u[0]) * (p[1] - u[1]) - (v[1] - u[1]) * (p[0] - u[0]);
  const s = [side(a, b), side(b, c), side(c, a)];
  return !(s.some((x) => x < 0) && s.some((x) => x > 0));
}

/** What a label must keep clear of. */
interface Obstacles {
  /** Edge strokes (curves as short pieces) with half their width. */
  segments: Array<{ a: XY; b: XY; pad: number }>;
  arrows: Array<[XY, XY, XY]>;
  circles: Array<{ c: XY; r: number }>;
  boxes: Box[];
}

/** The room around a box: the least distance to any obstacle or to the picture's edge (negative when it overlaps). */
function clearance(box: Box, obs: Obstacles) {
  let room = Math.min(box.x0, box.y0, WIDTH - box.x1, HEIGHT - box.y1);
  for (const s of obs.segments) room = Math.min(room, segmentBox(s.a, s.b, box) - s.pad);
  for (const t of obs.arrows) {
    const center: XY = [(box.x0 + box.x1) / 2, (box.y0 + box.y1) / 2];
    if (inTriangle(center, t) || t.some((p) => inside(p, box))) room = Math.min(room, -1);
    else room = Math.min(room, segmentBox(t[0], t[1], box), segmentBox(t[1], t[2], box), segmentBox(t[2], t[0], box));
  }
  for (const c of obs.circles) room = Math.min(room, pointBox(c.c, box) - c.r);
  for (const b of obs.boxes) room = Math.min(room, boxBox(box, b));
  return room;
}

/** The first spot with room to spare, else the roomiest (the earlier one on a tie). */
function pick(spots: TextSpot[], width: number, obs: Obstacles): TextSpot {
  let best = spots[0];
  let bestRoom = -Infinity;
  for (const spot of spots) {
    const room = clearance(boxOf(spot, width), obs);
    if (room >= CLEAR) return spot;
    if (room > bestRoom) {
      best = spot;
      bestRoom = room;
    }
  }
  return best;
}

/** How far a box of this size reaches from its center in direction (dx, dy). */
function reach(dx: number, dy: number, width: number) {
  return (Math.abs(dx) * (width + 2 * HALO)) / 2 + Math.abs(dy) * HALF_H;
}

/** Sixteen directions around a vertex, nearest to `start` (radians, y down) first; clockwise first on a tie. */
function directions(start: number): XY[] {
  const steps = [0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6, 7, -7, 8];
  return steps.map((k) => {
    const a = start + (k * Math.PI) / 8;
    return [Math.cos(a), Math.sin(a)];
  });
}

/** Spots around a vertex: a box `gap` away from the circle in each direction, then a wider ring. */
function around(n: GraphNodeView, width: number, start: number, gap: number): TextSpot[] {
  return [gap, gap + 12].flatMap((g) =>
    directions(start).map(([dx, dy]) => {
      const d = R + g + reach(dx, dy, width);
      return centered(n.x + dx * d, n.y + dy * d);
    }),
  );
}

function curvePoint(s: EdgeShape, t: number): { p: XY; tangent: XY } {
  const [ax, ay] = s.from;
  const [cx, cy] = s.control;
  const [bx, by] = s.to;
  if (!s.bent) {
    const len = Math.hypot(bx - ax, by - ay) || 1;
    return { p: [ax + (bx - ax) * t, ay + (by - ay) * t], tangent: [(bx - ax) / len, (by - ay) / len] };
  }
  const u = 1 - t;
  const p: XY = [u * u * ax + 2 * u * t * cx + t * t * bx, u * u * ay + 2 * u * t * cy + t * t * by];
  const tx = 2 * u * (cx - ax) + 2 * t * (bx - cx);
  const ty = 2 * u * (cy - ay) + 2 * t * (by - cy);
  const len = Math.hypot(tx, ty) || 1;
  return { p, tangent: [tx / len, ty / len] };
}

export interface GraphLabels {
  badges: Map<string, TextSpot>;
  glyphs: Map<string, TextSpot>;
  weights: Map<number, TextSpot>;
}

/**
 * Where every node badge, status glyph (check or cross) and edge weight goes. Weights first (the
 * edges stay put for a whole run, so they do not move), then badges, then glyphs, each keeping
 * clear of what is already placed. A badge prefers the spot above its vertex, a glyph the
 * top-left corner and a weight the middle of its edge on the side it always had.
 */
export function placeGraphLabels(state: GraphState): GraphLabels {
  const shapes = edgeShapes(state);
  const obs: Obstacles = { segments: [], arrows: [], circles: state.nodes.map((n) => ({ c: [n.x, n.y], r: R })), boxes: [] };
  for (const s of shapes) {
    const pieces = s.bent ? 10 : 1;
    let prev = s.from;
    for (let k = 1; k <= pieces; k++) {
      const next = curvePoint(s, k / pieces).p;
      obs.segments.push({ a: prev, b: next, pad: STROKE / 2 });
      prev = next;
    }
    if (s.edge.directed) {
      const { tangent: [tx, ty] } = curvePoint(s, 1);
      const [ex, ey] = s.to;
      const base: XY = [ex - tx * 9 * ARROW_UNIT, ey - ty * 9 * ARROW_UNIT];
      const half = 5 * ARROW_UNIT;
      obs.arrows.push([[ex + tx * ARROW_UNIT, ey + ty * ARROW_UNIT], [base[0] - ty * half, base[1] + tx * half], [base[0] + ty * half, base[1] - tx * half]]);
    }
  }

  const weights = new Map<number, TextSpot>();
  if (state.showWeights) {
    for (const s of shapes) {
      const width = textWidth(String(s.edge.weight));
      const spots: TextSpot[] = [];
      for (const t of [0.5, 0.4, 0.6, 0.3, 0.7, 0.22, 0.78]) {
        const { p, tangent } = curvePoint(s, t);
        // The usual side is (-uy, ux), the outside of a bent edge.
        const normal: XY = [-tangent[1], tangent[0]];
        const off = reach(normal[0], normal[1], width) + STROKE / 2 + CLEAR;
        for (const side of [1, -1]) spots.push(centered(p[0] + side * normal[0] * off, p[1] + side * normal[1] * off));
      }
      const spot = pick(spots, width, obs);
      weights.set(s.edge.id, spot);
      obs.boxes.push(boxOf(spot, width));
    }
  }

  const badges = new Map<string, TextSpot>();
  const badgeBoxes = new Map<string, Box>();
  for (const n of state.nodes) {
    if (n.badge === undefined || n.badge === '') continue;
    const width = textWidth(n.badge);
    // Straight up first: the spot NodeGlyph has always used (baseline r + 8 above the center).
    const spot = pick(around(n, width, -Math.PI / 2, CLEAR), width, obs);
    badges.set(n.id, spot);
    badgeBoxes.set(n.id, boxOf(spot, width));
    obs.boxes.push(badgeBoxes.get(n.id)!);
  }

  const glyphs = new Map<string, TextSpot>();
  for (const n of state.nodes) {
    if (n.role !== 'good' && n.role !== 'bad') continue;
    // NodeGlyph's own corner first, then either side of the badge (the mark reads with it), then
    // the ring of directions from the top-left.
    const corner: TextSpot = { x: n.x - R - 4, y: n.y - R + 2, anchor: 'end' };
    const badge = badgeBoxes.get(n.id);
    const beside: TextSpot[] = badge
      ? [
          { x: badge.x0 - CLEAR, y: badge.y1 - DESCENT - HALO, anchor: 'end' },
          { x: badge.x1 + CLEAR, y: badge.y1 - DESCENT - HALO, anchor: 'start' },
        ]
      : [];
    const spot = pick([corner, ...beside, ...around(n, GLYPH_W, (-3 * Math.PI) / 4, 2)], GLYPH_W, obs);
    glyphs.set(n.id, spot);
    obs.boxes.push(boxOf(spot, GLYPH_W));
  }
  return { badges, glyphs, weights };
}

/** Organism: a weighted / directed graph with role-colored vertices and edges. */
export function GraphView({ state }: { state: GraphState }) {
  const shapes = edgeShapes(state);
  const labels = useMemo(() => placeGraphLabels(state), [state]);
  const anyDirected = state.edges.some((e) => e.directed);

  return (
    <div>
      <svg className="graph" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Graph">
        {anyDirected && (
          <defs>
            {MARKER_ROLES.map((role) => (
              <marker
                key={role}
                id={`arrow-${role}`}
                className={`role-${role}`}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M0,0 L10,5 L0,10 z" style={{ fill: role === 'idle' || role === 'muted' ? 'var(--axis)' : 'var(--role)' }} />
              </marker>
            ))}
          </defs>
        )}
        {shapes.map(({ edge: e, from: [x1, y1], to: [x2, y2], control: [mx, my], bent }) => {
          const marker = e.directed ? `url(#arrow-${e.role})` : undefined;
          const weight = labels.weights.get(e.id);
          return (
            <g key={e.id} className={`edge role-${e.role}`}>
              {bent ? <path d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`} markerEnd={marker} /> : <line x1={x1} y1={y1} x2={x2} y2={y2} markerEnd={marker} />}
              {weight && (
                <text className="edge-weight" x={weight.x} y={weight.y} textAnchor="middle">
                  {e.weight}
                </text>
              )}
            </g>
          );
        })}
        {state.nodes.map((n) => (
          <NodeGlyph key={n.id} x={n.x} y={n.y} r={R} label={n.id} role={n.role} badge={n.badge} badgeAt={labels.badges.get(n.id)} glyphAt={labels.glyphs.get(n.id)} />
        ))}
      </svg>
      <Strips strips={state.strips} />
    </div>
  );
}
