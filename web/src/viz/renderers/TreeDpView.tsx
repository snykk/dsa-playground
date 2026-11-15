import type { Role } from '../core/types';
import { NodeGlyph } from '../ui/atoms/NodeGlyph';
import { Strips, type StripData } from '../ui/molecules/Strip';
import '../ui/roles.css';
import { SYM } from '../ui/symbols';
import './TreeDpView.css';

/** One value under a vertex (its include / exclude sum, its chain); null = not computed yet. */
export interface TdCell {
  text: string;
  role?: Role;
}

/** A vertex of a rooted tree with its DP values drawn as cells underneath. */
export interface TdNode {
  id: string;
  /** What the vertex holds (node.val). */
  label: string;
  /** A short name at the top-right corner, so equal values stay apart. */
  tag?: string;
  /** Child ids, left to right. */
  children: string[];
  role?: Role;
  cells: Array<TdCell | null>;
}

export interface TreeDpState {
  /** What the picture shows, for screen readers. */
  label: string;
  root: string | null;
  nodes: TdNode[];
  /** What each value cell means, in order (drawn once as a key). */
  cellNames: string[];
  /** The edge from a vertex's parent into it, keyed by the child id. */
  edges?: Record<string, Role>;
  /** Named totals at the top right, such as max_sum. */
  totals?: Array<{ label: string; value: string; role?: Role }>;
  /** Shown instead of the tree when root is null. */
  empty?: string;
  strips?: StripData[];
}

const R = 16;
const CW = 34;
const CH = 20;
const GAP_X = 14;
const LEVEL = 2 * R + 5 + CH + 30;
const TOP = 40;
const PAD = 10;

export interface TdGeometry {
  width: number;
  height: number;
  pos: Map<string, { x: number; y: number }>;
}

/** Leaves take consecutive slots left to right; a parent sits midway over its first and last child. */
export function treeDpGeometry(state: Pick<TreeDpState, 'root' | 'nodes' | 'cellNames'>): TdGeometry {
  const byId = new Map(state.nodes.map((n) => [n.id, n]));
  const slot = Math.max(2 * R, state.cellNames.length * CW) + GAP_X;
  const raw = new Map<string, { x: number; depth: number }>();
  let leaves = 0;
  let depth = 0;
  const place = (id: string, d: number) => {
    const n = byId.get(id);
    if (!n || raw.has(id)) return;
    depth = Math.max(depth, d);
    const kids = n.children.filter((c) => byId.has(c));
    if (kids.length === 0) {
      raw.set(id, { x: leaves * slot + slot / 2, depth: d });
      leaves += 1;
      return;
    }
    for (const c of kids) place(c, d + 1);
    raw.set(id, { x: (raw.get(kids[0])!.x + raw.get(kids[kids.length - 1])!.x) / 2, depth: d });
  };
  if (state.root !== null) place(state.root, 0);
  const keyW = 110 + state.cellNames.length * (CW + 4);
  const width = Math.max(leaves * slot, keyW * 2, 260) + 2 * PAD;
  const offset = (width - leaves * slot) / 2;
  const pos = new Map<string, { x: number; y: number }>();
  for (const [id, p] of raw) pos.set(id, { x: offset + p.x, y: TOP + R + p.depth * LEVEL });
  const height = state.root === null ? TOP + 60 : TOP + depth * LEVEL + 2 * R + 5 + CH + PAD;
  return { width, height, pos };
}

const glyphOf = (role: Role | undefined) => (role === 'good' ? SYM.check : role === 'bad' ? SYM.cross : null);

function Cells({ x, y, cells, names }: { x: number; y: number; cells: Array<TdCell | null>; names?: string[] }) {
  const left = x - (cells.length * CW) / 2;
  return (
    <g>
      {cells.map((c, i) => {
        const role = c?.role ?? 'idle';
        const glyph = glyphOf(c?.role);
        return (
          <g key={i} className={`td-cell role-${role}${c ? '' : ' empty'}`}>
            <rect x={left + i * CW + 1} y={y} width={CW - 2} height={CH} rx={4} />
            <text x={left + i * CW + CW / 2} y={y + CH / 2}>
              {names ? names[i] : c ? c.text : SYM.middot}
            </text>
            {glyph && (
              <text className="td-glyph" x={left + (i + 1) * CW - 3} y={y + 1}>
                {glyph}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

/**
 * Organism: a rooted tree evaluated bottom-up. Every vertex shows its value in a NodeGlyph and,
 * underneath, a row of cells with its DP results (include / exclude, or its best chain and the
 * best path through it) that fill in post-order. Edges carry roles (the child being read, the
 * chains a path uses), a key names the cells once, and totals such as max_sum sit at the top.
 */
export function TreeDpView({ state }: { state: TreeDpState }) {
  const g = treeDpGeometry(state);
  const totals = state.totals ?? [];
  let tx = g.width - PAD;
  const totalBoxes = totals
    .map((t) => {
      const text = `${t.label} = ${t.value}`;
      const w = text.length * 7 + 18;
      tx -= w;
      const box = { ...t, text, x: tx, w };
      tx -= 8;
      return box;
    })
    .reverse();
  return (
    <div className="td-wrap">
      <svg className="td-view" viewBox={`0 0 ${g.width} ${g.height}`} style={{ width: g.width, maxWidth: '100%' }} role="img" aria-label={state.label}>
        <g className="td-key">
          <text className="td-keylabel" x={PAD} y={14}>
            under each node:
          </text>
          <Cells x={PAD + 104 + (state.cellNames.length * CW) / 2} y={4} cells={state.cellNames.map(() => null)} names={state.cellNames} />
        </g>
        {totalBoxes.map((t) => (
          <g key={t.label} className={`td-total role-${t.role ?? 'idle'}`}>
            <rect x={t.x} y={3} width={t.w} height={22} rx={11} />
            <text x={t.x + t.w / 2} y={14}>
              {t.text}
            </text>
          </g>
        ))}
        {state.root === null && (
          <text className="td-empty" x={g.width / 2} y={TOP + 24}>
            {state.empty ?? 'root is None'}
          </text>
        )}
        {state.nodes.flatMap((n) =>
          n.children
            .filter((c) => g.pos.has(c) && g.pos.has(n.id))
            .map((c) => {
              const a = g.pos.get(n.id)!;
              const b = g.pos.get(c)!;
              const role = state.edges?.[c] ?? 'idle';
              return <line key={`e${c}`} className={`td-edge role-${role}`} x1={a.x} y1={a.y + R + 5 + CH} x2={b.x} y2={b.y - R} />;
            }),
        )}
        {state.nodes
          .filter((n) => g.pos.has(n.id))
          .map((n) => {
            const p = g.pos.get(n.id)!;
            return (
              <g key={n.id} className="td-node">
                <NodeGlyph x={p.x} y={p.y} r={R} label={n.label} role={n.role ?? 'idle'} badge={n.tag} badgePlacement="corner" />
                <Cells x={p.x} y={p.y + R + 5} cells={n.cells} />
              </g>
            );
          })}
      </svg>
      <Strips strips={state.strips} />
    </div>
  );
}
