import { useId } from 'react';
import type { Role } from '../core/types';
import { NodeGlyph } from '../ui/atoms/NodeGlyph';
import { ArrowDefs, monoW, SvgArrow, SvgBox, SvgFrame, TextLines, type OkText } from './OptimizationKit';
import { layoutRooted, type RtTree } from './RootedTreeView';
import './LcaLifting.css';

export interface LcaState {
  /** What the picture shows, for screen readers. */
  label: string;
  n: number;
  log: number;
  root: number;
  /** Children of each node, in adjacency order (the tree the DFS finds). */
  children: number[][];
  visited: boolean[];
  nodeRoles: Record<number, Role>;
  /** depth[u], or null before the DFS reaches u. */
  depth: Array<number | null>;
  /** parent[i][j], with whether the code has written or examined it yet ('' draws an empty cell). */
  table: Array<Array<{ value: number | string; written: boolean }>>;
  /** Roles keyed by "i,j". */
  cellRoles: Record<string, Role>;
  /** Jumps drawn on the tree: from a node to an ancestor. */
  jumps: Array<{ from: number; to: number; label: string; role?: Role }>;
  /** The query's u and v, pinned beside their nodes. */
  pills: Array<{ name: string; at: number; role?: Role }>;
  /** The DFS stack, bottom first (or the queue of a breadth-first walk, front first). */
  stack: string[];
  /** What the stack line is called; "DFS stack" when left out. */
  stackLabel?: string;
  /** Header over the node numbers of the table; "i" when left out. */
  rowHeader?: string;
  work: OkText[];
  answers: OkText[];
  answerRows: number;
  /** Widest text line of the run in characters, so the picture keeps one width. */
  workChars: number;
}

const R = 14;
const CW = 36;
const CH = 20;
const LINE_H = 17;
const PILL_W = 14;
const PILL_H = 16;

interface Pt {
  x: number;
  y: number;
}

interface JumpRoute {
  d: string;
  lx: number;
  ly: number;
  anchor: 'start' | 'end';
}

/**
 * A jump from a node to its ancestor as a quadratic arc that keeps clear of every other node and
 * whose label does too: the arc leaves the node's upper side and reaches the ancestor's lower
 * side, bowing right or left, wider and wider until nothing is in the way, without leaving the
 * tree's strip (0 to xMax). Ancestors several levels up often sit on the straight line between
 * the two ends, so a fixed bow would cross them.
 */
function routeJump(from: number, to: number, label: string, centers: Pt[], xMax: number): JumpRoute {
  const a = centers[from];
  const b = centers[to];
  const labelW = label.length * 10.5 * 0.61 + 2;
  let first: JumpRoute | null = null;
  for (const bow of [16, 28, 42, 58, 76, 96, 120]) {
    for (const side of [1, -1]) {
      const sx = a.x + side * R * 0.7;
      const sy = a.y - R * 0.7;
      const ex = b.x + side * R * 0.9;
      const ey = b.y + R * 0.5;
      const cx = (sx + ex) / 2 + side * bow;
      const cy = (sy + ey) / 2;
      // The curve's midpoint, and the label just outside it.
      const mx = 0.25 * sx + 0.5 * cx + 0.25 * ex;
      const my = 0.25 * sy + 0.5 * cy + 0.25 * ey;
      const route: JumpRoute = { d: `M${sx.toFixed(1)},${sy.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`, lx: mx + side * 4, ly: my, anchor: side > 0 ? 'start' : 'end' };
      first ??= route;
      const lx0 = side > 0 ? mx + 4 : mx - 4 - labelW;
      let ok = lx0 >= 2 && lx0 + labelW <= xMax && Math.min(sx, ex, mx) >= 4 && Math.max(sx, ex, mx) <= xMax;
      for (let k = 0; k < centers.length && ok; k++) {
        if (k === from || k === to) continue;
        const c = centers[k];
        for (let t = 0.04; t < 1 && ok; t += 0.04) {
          const x = (1 - t) * (1 - t) * sx + 2 * t * (1 - t) * cx + t * t * ex;
          const y = (1 - t) * (1 - t) * sy + 2 * t * (1 - t) * cy + t * t * ey;
          if (Math.hypot(c.x - x, c.y - y) < R + 6) ok = false;
        }
        if (label) {
          const nx = Math.max(lx0, Math.min(c.x, lx0 + labelW));
          const ny = Math.max(my - 7, Math.min(c.y, my + 7));
          if (Math.hypot(c.x - nx, c.y - ny) < R + 2) ok = false;
        }
      }
      if (ok) return route;
    }
  }
  return first!;
}

/**
 * Where each pill goes: u to the left of its node and v to the right, unless that spot touches
 * another node (two nodes of one level can sit one leaf apart) or the other pill; then the other
 * side, and last above the node. Returns the top-left corner of each pill.
 */
function placePills(pills: LcaState['pills'], centers: Pt[]): Pt[] {
  const placed: Array<{ x: number; y: number }> = [];
  const clear = (x: number, y: number, own: number) => {
    for (let k = 0; k < centers.length; k++) {
      if (k === own) continue;
      const c = centers[k];
      const nx = Math.max(x, Math.min(c.x, x + PILL_W));
      const ny = Math.max(y, Math.min(c.y, y + PILL_H));
      if (Math.hypot(c.x - nx, c.y - ny) < R + 4) return false;
    }
    return placed.every((q) => x + PILL_W + 2 <= q.x || q.x + PILL_W + 2 <= x || y + PILL_H + 2 <= q.y || q.y + PILL_H + 2 <= y);
  };
  return pills.map((pl) => {
    const p = centers[pl.at];
    const leftX = p.x - R - 4 - PILL_W;
    const rightX = p.x + R + 4;
    const sides = pl.name === 'u' ? [leftX, rightX] : [rightX, leftX];
    const above = [p.x - PILL_W / 2, p.x - PILL_W - 1, p.x + 1].map((x) => ({ x, y: p.y - R - 4 - PILL_H }));
    const candidates = [...sides.map((x) => ({ x, y: p.y - PILL_H / 2 })), ...above];
    const spot = candidates.find((c) => clear(c.x, c.y, pl.at)) ?? candidates[0];
    placed.push(spot);
    return spot;
  });
}

/**
 * Organism for binary lifting: the tree on the left (a node appears when the DFS visits it) with
 * the query's u and v pinned beside their nodes and each jump drawn as an arc to the ancestor it
 * reaches; on the right the jump table parent[i][j] (the 2^j-th ancestor, -1 for none) next to
 * the depths. The DFS stack, the worked step and the answers sit underneath.
 */
export function LcaLifting({ state }: { state: LcaState }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const tree: RtTree = {
    id: 't',
    root: String(state.root),
    nodes: state.children.map((kids, i) => ({ id: String(i), label: String(i), children: kids.map(String) })),
  };
  const lay = layoutRooted(tree);
  const pos = (i: number) => lay.pos.get(String(i))!;
  const treeW = Math.max(lay.width, 140);
  const tx = treeW + 20;
  const idxW = 26;
  const tableTop = 30;
  const tableW = idxW + (state.log + 1) * (CW + 3);
  const width0 = tx + tableW + 10;
  const tableH = tableTop + state.n * (CH + 3);
  const bodyH = Math.max(lay.height, tableH) + 8;
  const width = Math.max(width0, monoW('x'.repeat(state.workChars)) + 20);
  const panelRows = 3 + state.answerRows;
  const height = bodyH + LINE_H * (1 + panelRows) + 10;
  const centers = state.children.map((_, i) => pos(i));
  const pillSpots = placePills(state.pills, centers);

  return (
    <SvgFrame width={width} height={height} label={state.label} minWidth={520}>
      <ArrowDefs uid={uid} />
      {state.children.flatMap((kids, u) =>
        kids.map((c) => {
          const a = pos(u);
          const b = pos(c);
          const shown = state.visited[c];
          return <line key={`e${c}`} className={`lca-edge${shown ? '' : ' hidden'}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
        }),
      )}
      {state.jumps.map((j, k) => {
        if (j.to < 0) return null;
        const route = routeJump(j.from, j.to, j.label, centers, tx - 6);
        return <SvgArrow key={`j${k}`} uid={uid} d={route.d} role={j.role ?? 'active'} label={j.label || undefined} lx={route.lx} ly={route.ly} anchor={route.anchor} />;
      })}
      {state.children.map((_, i) => {
        const p = pos(i);
        if (!state.visited[i]) {
          return <circle key={`n${i}`} className="lca-ghost" cx={p.x} cy={p.y} r={R} />;
        }
        return <NodeGlyph key={`n${i}`} x={p.x} y={p.y} r={R} label={i} role={state.nodeRoles[i] ?? 'idle'} />;
      })}
      {state.pills.map((pl, k) => {
        const spot = pillSpots[k];
        return (
          <g key={`p${pl.name}`} className={`lca-pill role-${pl.role ?? 'active'}`} style={{ transform: `translate(${spot.x}px, ${spot.y}px)` }}>
            <rect width={PILL_W} height={PILL_H} rx={4} />
            <text x={PILL_W / 2} y={PILL_H / 2}>
              {pl.name}
            </text>
          </g>
        );
      })}

      <text className="ok-head" x={tx + idxW - 6} y={tableTop - 10} style={{ textAnchor: 'end' }}>
        {state.rowHeader ?? 'i'}
      </text>
      <text className="ok-head" x={tx + idxW + CW / 2} y={tableTop - 10}>
        depth
      </text>
      {Array.from({ length: state.log }, (_, j) => (
        <text key={`h${j}`} className="ok-head" x={tx + idxW + (j + 1) * (CW + 3) + CW / 2} y={tableTop - 10}>
          {`up ${2 ** j}`}
        </text>
      ))}
      {state.table.map((row, i) => {
        const y = tableTop + i * (CH + 3);
        return (
          <g key={`r${i}`}>
            <text className={`ok-head${state.nodeRoles[i] ? ' role-active' : ''}`} x={tx + idxW - 6} y={y + CH / 2} style={{ textAnchor: 'end' }}>
              {i}
            </text>
            <SvgBox x={tx + idxW} y={y} w={CW} h={CH} text={state.depth[i] ?? '0'} ghost={state.depth[i] === null} size={11} className="lca-depth" />
            {row.map((c, j) => (
              <SvgBox
                key={j}
                x={tx + idxW + (j + 1) * (CW + 3)}
                y={y}
                w={CW}
                h={CH}
                text={c.value}
                role={state.cellRoles[`${i},${j}`]}
                ghost={!c.written && !state.cellRoles[`${i},${j}`]}
                size={11}
              />
            ))}
          </g>
        );
      })}
      <text className="lca-stack" x={10} y={bodyH + 4}>
        {`${state.stackLabel ?? 'DFS stack'}: [${state.stack.join(', ')}]`}
      </text>
      <TextLines x={10} y={bodyH + 4 + LINE_H} lines={[...state.work, ...state.answers]} lineH={LINE_H} />
    </SvgFrame>
  );
}
