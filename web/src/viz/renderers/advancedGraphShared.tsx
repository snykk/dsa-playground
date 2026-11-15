/**
 * Shared parts of the two advanced-graph renderers (FlowNetworkView, ImplicationGraphView):
 * curved directed edges that keep parallel, anti-parallel and self-loop edges apart and
 * bend around vertices in their way, arrowhead markers per role, and strips that reserve
 * the room their longest state needs so a run keeps one height.
 */
import type { Frame, Role } from '../core/types';
import { Token } from '../ui/atoms/Token';
import type { StripItem } from '../ui/molecules/Strip';
import '../ui/molecules/Strip.css';
import '../ui/roles.css';

export interface Pt {
  x: number;
  y: number;
}

export interface EdgeEnds {
  id: string;
  from: string;
  to: string;
}

export interface EdgeShape {
  /** SVG path from the tail circle to just before the head circle (the arrowhead fills the gap). */
  d: string;
  /** Where a label goes: beside the middle of the curve, on its outer side. */
  label: Pt;
  /** Signed bend that was used (0 = straight); a self-loop reports 0. */
  bend: number;
}

/** Gap between two edges joining the same pair of vertices. */
const SPREAD = 26;
const MAX_BEND = 130;

function sub(a: Pt, b: Pt): Pt {
  return { x: a.x - b.x, y: a.y - b.y };
}

function unit(v: Pt): Pt {
  const len = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / len, y: v.y / len };
}

const f1 = (v: number) => Math.round(v * 10) / 10;

/**
 * Bend of an edge that must avoid other vertices: positive bends to the left of the
 * direction a -> b (the side of the perpendicular (-uy, ux)), as GraphView does.
 * `center` breaks a tie for a vertex lying exactly on the line: bend away from it.
 */
function avoidBend(a: Pt, b: Pt, others: Pt[], r: number, center: Pt): number {
  const d = sub(b, a);
  const len = Math.hypot(d.x, d.y) || 1;
  const u = { x: d.x / len, y: d.y / len };
  const perp = { x: -u.y, y: u.x };
  let best = 0;
  for (const p of others) {
    const rel = sub(p, a);
    const t = (rel.x * u.x + rel.y * u.y) / len;
    if (t <= 0.05 || t >= 0.95) continue;
    const side = rel.x * perp.x + rel.y * perp.y;
    const clearance = r + 12;
    if (Math.abs(side) >= clearance) continue;
    // The curve's offset at parameter t is 2 t (1 - t) * bend: push it past the vertex, on the far side.
    let dir = side > 0.5 ? -1 : side < -0.5 ? 1 : 0;
    if (dir === 0) {
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const away = sub(mid, center);
      dir = away.x * perp.x + away.y * perp.y >= 0 ? 1 : -1;
    }
    const need = (clearance - Math.abs(side)) / (2 * t * (1 - t));
    const want = dir * Math.min(MAX_BEND, need);
    if (Math.abs(want) > Math.abs(best)) best = want;
  }
  return best;
}

/**
 * Geometry for every edge. Edges joining the same two vertices (in either direction) fan out
 * around the straight line; a lone edge that would cross another vertex bends around it;
 * an edge from a vertex to itself becomes a loop pointing along `loopAngle(vertex)` (radians,
 * 0 = right, PI / 2 = down). Hidden edges should be passed too, so nothing moves when they appear.
 */
export function edgeShapes(
  edges: EdgeEnds[],
  pos: Map<string, Pt>,
  r: number,
  { center = { x: 300, y: 190 }, loopAngle = () => -Math.PI / 2 }: { center?: Pt; loopAngle?: (id: string) => number } = {},
): Map<string, EdgeShape> {
  const groups = new Map<string, EdgeEnds[]>();
  for (const e of edges) {
    const key = e.from < e.to ? `${e.from}|${e.to}` : `${e.to}|${e.from}`;
    groups.set(key, [...(groups.get(key) ?? []), e]);
  }
  const out = new Map<string, EdgeShape>();
  for (const group of groups.values()) {
    const first = group[0];
    if (first.from === first.to) {
      group.forEach((e, k) => out.set(e.id, loopShape(pos.get(e.from)!, r, loopAngle(e.from) + k * 0.7)));
      continue;
    }
    const lo = first.from < first.to ? first.from : first.to;
    const hi = lo === first.from ? first.to : first.from;
    const a = pos.get(lo)!;
    const b = pos.get(hi)!;
    const others = [...pos].filter(([id]) => id !== lo && id !== hi).map(([, p]) => p);
    // Offsets are measured in the lo -> hi frame; an edge running hi -> lo flips the sign.
    const base = avoidBend(a, b, others, r, center);
    group.forEach((e, j) => {
      const offset = base + (j - (group.length - 1) / 2) * SPREAD;
      const bend = e.from === lo ? offset : -offset;
      out.set(e.id, curveShape(pos.get(e.from)!, pos.get(e.to)!, r, bend));
    });
  }
  return out;
}

function curveShape(a: Pt, b: Pt, r: number, bend: number): EdgeShape {
  const u = unit(sub(b, a));
  const perp = { x: -u.y, y: u.x };
  const c = { x: (a.x + b.x) / 2 + perp.x * bend, y: (a.y + b.y) / 2 + perp.y * bend };
  const s = unit(sub(c, a));
  const t = unit(sub(c, b));
  const p1 = { x: a.x + s.x * r, y: a.y + s.y * r };
  const p2 = { x: b.x + t.x * (r + 4), y: b.y + t.y * (r + 4) };
  const mid = { x: 0.25 * p1.x + 0.5 * c.x + 0.25 * p2.x, y: 0.25 * p1.y + 0.5 * c.y + 0.25 * p2.y };
  const side = bend >= 0 ? 1 : -1;
  const label = { x: mid.x + perp.x * side * 11, y: mid.y + perp.y * side * 11 };
  const d = bend === 0 ? `M${f1(p1.x)},${f1(p1.y)} L${f1(p2.x)},${f1(p2.y)}` : `M${f1(p1.x)},${f1(p1.y)} Q${f1(c.x)},${f1(c.y)} ${f1(p2.x)},${f1(p2.y)}`;
  return { d, label, bend };
}

function loopShape(p: Pt, r: number, angle: number): EdgeShape {
  const spread = 0.55;
  const reach = r + 44;
  const at = (ang: number, dist: number) => ({ x: p.x + Math.cos(ang) * dist, y: p.y + Math.sin(ang) * dist });
  const p1 = at(angle - spread, r);
  const p2 = at(angle + spread, r + 4);
  const c1 = at(angle - spread * 1.6, reach);
  const c2 = at(angle + spread * 1.6, reach);
  const label = at(angle, reach + 4);
  return { d: `M${f1(p1.x)},${f1(p1.y)} C${f1(c1.x)},${f1(c1.y)} ${f1(c2.x)},${f1(c2.y)} ${f1(p2.x)},${f1(p2.y)}`, label, bend: 0 };
}

export const MARKER_ROLES: Role[] = ['idle', 'compare', 'active', 'done', 'good', 'bad', 'muted'];

/** One arrowhead per role, ids `${prefix}-${role}`; idle and muted heads use the axis color. */
export function ArrowMarkers({ prefix }: { prefix: string }) {
  return (
    <defs>
      {MARKER_ROLES.map((role) => (
        <marker
          key={role}
          id={`${prefix}-${role}`}
          className={`role-${role}`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" style={{ fill: role === 'idle' || role === 'muted' ? 'var(--viz-neutral)' : 'var(--role)' }} />
        </marker>
      ))}
    </defs>
  );
}

/** A labelled token list (queue, stack, paths...) that can keep room for tokens it does not show yet. */
export interface ReservedStrip {
  label: string;
  items: StripItem[];
  /** Shown when there are no items. */
  empty?: string;
  /** Set by stabilizeStrips: invisible tokens that keep the room the strip needs later in the run. */
  reserve?: string[];
  /** Set by stabilizeStrips for a list that changes freely: every token is laid out at least as wide as this text. */
  slot?: string;
}

interface Cell {
  visible?: StripItem;
  ghosts: string[];
}

/** One cell per token place: the visible token (if any) stacked on invisible copies that fix the cell's width. */
export function stripCells(s: ReservedStrip): Cell[] {
  const shown: StripItem[] = s.items.length ? s.items : s.empty ? [{ text: s.empty }] : [];
  const reserve = s.reserve ?? [];
  const slots = Math.max(shown.length, s.items.length + reserve.length);
  return Array.from({ length: slots }, (_, k) => {
    const ghosts: string[] = [];
    const later = reserve[k - s.items.length];
    if (k >= s.items.length && later !== undefined) ghosts.push(later);
    if (s.slot !== undefined) ghosts.push(s.slot);
    if (k === 0 && s.empty) ghosts.push(s.empty);
    return { visible: shown[k], ghosts };
  });
}

export function ReservedStrips({ strips }: { strips: ReservedStrip[] }) {
  return (
    <>
      {strips.map((s) => (
        <div className="viz-strip" key={s.label}>
          <strong>{s.label}:</strong>
          {stripCells(s).map((cell, k) =>
            cell.ghosts.length === 0 ? (
              <Token key={k} text={cell.visible!.text} role={cell.visible!.role} />
            ) : (
              // Every layer is a flex box in the same grid cell, so a token keeps its padding in the line height.
              <span key={k} style={{ display: 'inline-grid' }}>
                {cell.visible && (
                  <span style={{ gridArea: '1 / 1', display: 'flex' }}>
                    <Token text={cell.visible.text} role={cell.visible.role} />
                  </span>
                )}
                {cell.ghosts.map((text, g) => (
                  <span key={g} aria-hidden="true" style={{ gridArea: '1 / 1', display: 'flex', visibility: 'hidden' }}>
                    <Token text={text} />
                  </span>
                ))}
              </span>
            ),
          )}
        </div>
      ))}
    </>
  );
}

/**
 * Give every strip the room its fullest state needs, so the stage keeps one height. A list that
 * only grows (every frame's items are a prefix of the last frame's) reserves the items still to
 * come; any other list gets as many places as it ever fills, each as wide as its longest token.
 */
export function stabilizeStrips<S extends { strips: ReservedStrip[] }>(frames: Array<Frame<S>>): Array<Frame<S>> {
  if (frames.length === 0) return frames;
  const last = new Map(frames[frames.length - 1].state.strips.map((s) => [s.label, s.items.map((it) => it.text)]));
  const most = new Map<string, number>();
  const longest = new Map<string, string>();
  const growing = new Map<string, boolean>();
  for (const f of frames) {
    for (const s of f.state.strips) {
      const texts = s.items.map((it) => it.text);
      most.set(s.label, Math.max(most.get(s.label) ?? 0, texts.length));
      for (const t of texts) if (t.length > (longest.get(s.label) ?? '').length) longest.set(s.label, t);
      const final = last.get(s.label) ?? [];
      const prefix = texts.length <= final.length && texts.every((t, i) => t === final[i]);
      growing.set(s.label, (growing.get(s.label) ?? true) && prefix);
    }
  }
  return frames.map((f) => ({
    ...f,
    state: {
      ...f.state,
      strips: f.state.strips.map((s) => {
        const have = s.items.length;
        if (growing.get(s.label)) return { ...s, reserve: (last.get(s.label) ?? []).slice(have) };
        const slot = longest.get(s.label) ?? '';
        return { ...s, slot, reserve: Array.from({ length: Math.max(0, (most.get(s.label) ?? 0) - have) }, () => slot) };
      }),
    },
  }));
}
