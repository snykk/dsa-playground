import { useId } from 'react';
import type { Frame, Role } from '../core/types';
import { NodeGlyph } from '../ui/atoms/NodeGlyph';
import { useTween, type Pt } from '../ui/hooks/useTween';
import { Strips, type StripData } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';
import '../ui/roles.css';
import './KdTreeView.css';

export interface KdRect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface KdPointView {
  /** Stable identity: the point's position in the input (inserts after the build). */
  id: number;
  x: number;
  y: number;
  role?: Role;
}

/** The splitting line of a node, clipped to the node's region: x = at (axis 0) or y = at (axis 1). */
export interface KdSplitView {
  id: number;
  axis: number;
  at: number;
  from: number;
  to: number;
  role?: Role;
}

export interface KdNodeView {
  id: number;
  label: string;
  axis: number;
  left: number | null;
  right: number | null;
  role?: Role;
}

/** Space a run keeps for its whole length, so the tree does not resize between steps. */
export interface KdExtent {
  nodes: number;
  depth: number;
}

export interface KdTreeState {
  /** What the picture shows, for screen readers. */
  label: string;
  /** The plane shows coordinates 0..bounds on both axes. */
  bounds: number;
  points: KdPointView[];
  splits: KdSplitView[];
  /** A shaded region: the subset being split, or the region of the node being visited. */
  region?: KdRect & { role?: Role };
  /** Regions a search skipped (hatched). */
  pruned?: KdRect[];
  query?: { x: number; y: number };
  /** The best-so-far circle around the query: squared radius. */
  circle?: { r2: number; role?: Role };
  /** The range-search box (lo and hi corners as given, so it may be empty). */
  box?: KdRect & { empty?: boolean };
  /** The plane test: the gap from the query to a split line, with its squared length. */
  gap?: { axis: number; at: number; label: string; role?: Role };
  nodes: KdNodeView[];
  root: number | null;
  note?: string;
  strips?: StripData[];
  /** Set by stabilizeKd; never needed by a tracer. */
  extent?: KdExtent;
}

const UNIT = 26;
const PL = 22; // room for the y labels
const PT = 8;
const PB = 20; // room for the x labels
const R = 17;
const DX = 46;
const DY = 54;
const TPAD = 14;

function extentOf(state: KdTreeState): KdExtent {
  const byId = new Map(state.nodes.map((n) => [n.id, n]));
  const depth = (id: number | null): number => {
    if (id === null || !byId.has(id)) return -1;
    const n = byId.get(id)!;
    return 1 + Math.max(depth(n.left), depth(n.right));
  };
  return { nodes: state.nodes.length, depth: Math.max(0, depth(state.root)) };
}

/** Give every frame the tree extent of the whole run, so the tree picture keeps its size. Call it from trace(). */
export function stabilizeKd<S extends KdTreeState>(frames: Array<Frame<S>>): Array<Frame<S>> {
  let all: KdExtent = { nodes: 1, depth: 0 };
  for (const f of frames) {
    const e = extentOf(f.state);
    all = { nodes: Math.max(all.nodes, e.nodes), depth: Math.max(all.depth, e.depth) };
  }
  return frames.map((f) => ({ ...f, state: { ...f.state, extent: all } }));
}

/**
 * Organism for a 2D K-D tree: the plane (points, the split line of every node clipped to its
 * region, the query, the best-so-far circle, the range box and the regions a search pruned)
 * next to the tree itself (NodeGlyph atoms laid out by in-order position, each with its split
 * axis). Tree nodes glide when an insert reshapes the layout; the circle and the region tween.
 */
export function KdTreeView({ state }: { state: KdTreeState }) {
  const { bounds, points, splits, region, pruned = [], query, circle, box, gap, nodes, root, note, strips } = state;
  const ext = state.extent ?? extentOf(state);
  const lo = -0.5;
  const hi = bounds + 0.5;
  const side = (hi - lo) * UNIT;
  const pw = PL + side + 8;
  const ph = PT + side + PB;
  const px = (x: number) => PL + (x - lo) * UNIT;
  const py = (y: number) => PT + (hi - y) * UNIT;

  // Tree layout by in-order position.
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const target = new Map<string, Pt>();
  let order = 0;
  const place = (id: number | null, depth: number) => {
    if (id === null) return;
    const n = byId.get(id);
    if (!n) return;
    place(n.left, depth + 1);
    target.set(`t${id}`, { x: TPAD + R + order * DX + 4, y: TPAD + R + depth * DY });
    order++;
    place(n.right, depth + 1);
  };
  place(root, 0);
  const treeW = TPAD * 2 + Math.max(ext.nodes, 1) * DX;
  const treeH = TPAD * 2 + 2 * R + ext.depth * DY;
  // Shift the tree so it is centered in its fixed-width picture.
  const shift = (treeW - (TPAD * 2 + Math.max(order, 1) * DX)) / 2;
  for (const [k, p] of target) target.set(k, { x: p.x + shift, y: p.y });
  if (region) {
    target.set('region0', { x: px(region.x0), y: py(region.y1) });
    target.set('region1', { x: px(region.x1), y: py(region.y0) });
  }
  if (circle) target.set('circle', { x: Math.sqrt(circle.r2) * UNIT, y: 0 });
  const pos = useTween(target);
  const at = (key: string): Pt => pos.get(key) ?? target.get(key)!;

  const ticks = Array.from({ length: bounds + 1 }, (_, i) => i);
  const uid = useId().replace(/:/g, '');

  return (
    <div className="kd-wrap">
      <div className="kd-panels">
        <svg className="kd-plane" viewBox={`0 0 ${pw} ${ph}`} style={{ width: pw, maxWidth: '100%' }} role="img" aria-label={`Plane: ${state.label}`}>
          <defs>
            <clipPath id={`kd-clip-${uid}`}>
              <rect x={px(lo)} y={py(hi)} width={side} height={side} />
            </clipPath>
            <pattern id={`kd-hatch-${uid}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" className="kd-hatch-line" />
            </pattern>
          </defs>
          <rect className="kd-frame" x={px(lo)} y={py(hi)} width={side} height={side} />
          {ticks.map((t) => (
            <g key={`g${t}`}>
              <line className="kd-grid" x1={px(t)} y1={py(lo)} x2={px(t)} y2={py(hi)} />
              <line className="kd-grid" x1={px(lo)} y1={py(t)} x2={px(hi)} y2={py(t)} />
              <text className="kd-tick" x={px(t)} y={py(lo) + 12}>
                {t}
              </text>
              <text className="kd-tick" x={PL - 9} y={py(t)}>
                {t}
              </text>
            </g>
          ))}
          <g clipPath={`url(#kd-clip-${uid})`}>
            {pruned.map((r, i) => (
              <rect key={`p${i}`} className="kd-pruned" fill={`url(#kd-hatch-${uid})`} x={px(Math.min(r.x0, r.x1))} y={py(Math.max(r.y0, r.y1))} width={Math.abs(r.x1 - r.x0) * UNIT} height={Math.abs(r.y1 - r.y0) * UNIT} />
            ))}
            {region &&
              (() => {
                const a = at('region0');
                const b = at('region1');
                return <rect className={`kd-region role-${region.role ?? 'compare'}`} x={a.x} y={a.y} width={Math.max(0, b.x - a.x)} height={Math.max(0, b.y - a.y)} />;
              })()}
            {box && (
              <rect
                className={`kd-box${box.empty ? ' empty' : ''}`}
                x={px(Math.min(box.x0, box.x1))}
                y={py(Math.max(box.y0, box.y1))}
                width={Math.abs(box.x1 - box.x0) * UNIT}
                height={Math.abs(box.y1 - box.y0) * UNIT}
              />
            )}
            {splits.map((s) => (
              <line
                key={`s${s.id}`}
                className={`kd-split axis-${s.axis} role-${s.role ?? 'idle'}`}
                x1={s.axis === 0 ? px(s.at) : px(s.from)}
                y1={s.axis === 0 ? py(s.from) : py(s.at)}
                x2={s.axis === 0 ? px(s.at) : px(s.to)}
                y2={s.axis === 0 ? py(s.to) : py(s.at)}
              />
            ))}
            {query && circle && <circle className={`kd-circle role-${circle.role ?? 'done'}`} cx={px(query.x)} cy={py(query.y)} r={at('circle').x} />}
            {query && gap && (
              <g className={`kd-gap role-${gap.role ?? 'active'}`}>
                <line x1={px(query.x)} y1={py(query.y)} x2={gap.axis === 0 ? px(gap.at) : px(query.x)} y2={gap.axis === 0 ? py(query.y) : py(gap.at)} />
                <text
                  x={gap.axis === 0 ? (px(query.x) + px(gap.at)) / 2 : px(query.x) + 6}
                  y={gap.axis === 0 ? py(query.y) - 9 : (py(query.y) + py(gap.at)) / 2}
                  style={gap.axis === 0 ? undefined : { textAnchor: 'start' }}
                >
                  {gap.label}
                </text>
              </g>
            )}
          </g>
          {points.map((p) => {
            const role = p.role ?? 'idle';
            const glyph = role === 'good' ? SYM.check : role === 'bad' ? SYM.cross : null;
            return (
              <g key={`pt${p.id}`} className={`kd-point role-${role}`}>
                <circle cx={px(p.x)} cy={py(p.y)} r={5.5} />
                <text x={p.x >= bounds - 1 ? px(p.x) - 7 : px(p.x) + 7} y={py(p.y) - 8} style={p.x >= bounds - 1 ? { textAnchor: 'end' } : undefined}>
                  {`${p.x},${p.y}`}
                  {glyph ? ` ${glyph}` : ''}
                </text>
              </g>
            );
          })}
          {query && (
            <g className="kd-query">
              <line x1={px(query.x) - 6} y1={py(query.y) - 6} x2={px(query.x) + 6} y2={py(query.y) + 6} />
              <line x1={px(query.x) - 6} y1={py(query.y) + 6} x2={px(query.x) + 6} y2={py(query.y) - 6} />
              <text x={px(query.x)} y={py(query.y) + 15}>
                q
              </text>
            </g>
          )}
        </svg>
        <svg className="kd-tree" viewBox={`0 0 ${treeW} ${treeH}`} style={{ width: treeW, maxWidth: '100%' }} role="img" aria-label={`Tree: ${state.label}`}>
          {root === null && (
            <text className="kd-empty" x={treeW / 2} y={treeH / 2}>
              (empty tree)
            </text>
          )}
          {nodes.flatMap((n) =>
            [n.left, n.right]
              .filter((c): c is number => c !== null && target.has(`t${c}`))
              .map((c) => {
                const a = at(`t${n.id}`);
                const b = at(`t${c}`);
                const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
                const ux = (b.x - a.x) / len;
                const uy = (b.y - a.y) / len;
                return <line key={`e${n.id}-${c}`} className="kd-edge" x1={a.x + ux * R} y1={a.y + uy * R} x2={b.x - ux * R} y2={b.y - uy * R} />;
              }),
          )}
          {nodes
            .filter((n) => target.has(`t${n.id}`))
            .map((n) => {
              const p = at(`t${n.id}`);
              return <NodeGlyph key={`t${n.id}`} x={p.x} y={p.y} r={R} label={n.label} role={n.role ?? 'idle'} badge={n.axis === 0 ? 'x' : 'y'} badgePlacement="corner" />;
            })}
        </svg>
      </div>
      {note && <p className="kd-note">{note}</p>}
      <Strips strips={strips} />
    </div>
  );
}
