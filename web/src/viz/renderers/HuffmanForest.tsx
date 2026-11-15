import type { Frame, Role } from '../core/types';
import { NodeGlyph } from '../ui/atoms/NodeGlyph';
import { Token } from '../ui/atoms/Token';
import { useTween, type Pt } from '../ui/hooks/useTween';
import { Strip } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';
import '../ui/molecules/Strip.css';
import '../ui/roles.css';
import './HuffmanForest.css';

export interface HuffNodeView {
  /** Stable identity: a tree keeps its node ids, so it glides when the heap reorders or a merge lowers it. */
  id: number;
  /** A leaf's symbol as drawn (a space is an open box); null for a merged node. */
  symbol: string | null;
  freq: number;
  left: number | null;
  right: number | null;
  role: Role;
  /** Role of the edge from this node's parent to it (a code path). */
  edgeRole?: Role;
  /** A leaf's code word, once build_codes reached it. */
  code?: string;
}

export interface HuffmanExtent {
  width: number;
  depth: number;
  heap: number;
  longCodes: boolean;
}

export interface HuffmanState {
  /** Every node of every tree drawn (the heap's trees and the loose ones). */
  nodes: HuffNodeView[];
  /** The heap list in index order: the root id of each tree. */
  heap: number[];
  /** Roles of heap cells, by index. */
  heapRoles?: Record<number, Role>;
  /** Trees outside the heap (popped as left / right, or just merged), drawn after the heap's trees. */
  loose: Array<{ id: number; tag: string }>;
  /** The text: one unit per character, or one per run ("a x45") in the frequency form. */
  text: Array<{ s: string; n: number; role?: Role }>;
  codes: Array<{ symbol: string; code: string; role?: Role }>;
  /** The encoded bits, one chunk per text unit. */
  bits: Array<{ bits: string; role?: Role }>;
  /** The open build_codes calls, as the code each one carries. */
  calls?: string[];
  /** Set by stabilizeHuffman; never needed by a tracer. */
  extent?: HuffmanExtent;
}

const PAD = 12;
const X0 = 52; // room for the row label "heap"
const HP = 44; // heap cell pitch
const CELL_W = 40;
const CELL_H = 28;
const CELL_TOP = 20;
const CW = 36; // one leaf column
const GAP = 10; // between two trees
const LOOSE_GAP = 30; // between the heap's trees and the loose ones
const R = 14;
const ROOT_Y = CELL_TOP + CELL_H + 44;
const DY = 42;

interface TreeBox {
  root: number;
  tag: string;
  loose: boolean;
}

/** Leaf columns left to right (heap order, then the loose trees), each internal node over the middle of its children. */
function layout(state: HuffmanState) {
  const byId = new Map(state.nodes.map((n) => [n.id, n]));
  const trees: TreeBox[] = [
    ...state.heap.map((id, i) => ({ root: id, tag: `[${i}]`, loose: false })),
    ...state.loose.map((l) => ({ root: l.id, tag: l.tag, loose: true })),
  ];
  const pos = new Map<number, Pt>();
  let cursor = X0;
  let depth = 0;
  let separator: number | undefined;
  trees.forEach((t, i) => {
    if (i > 0) cursor += t.loose && !trees[i - 1].loose ? LOOSE_GAP : GAP;
    if (t.loose && (i === 0 || !trees[i - 1].loose)) separator = cursor - (i === 0 ? 0 : LOOSE_GAP / 2);
    let col = 0;
    const place = (id: number | null, d: number): number => {
      const n = id === null ? undefined : byId.get(id);
      if (!n) return cursor;
      depth = Math.max(depth, d);
      if (n.left === null && n.right === null) {
        const x = cursor + col * CW + CW / 2;
        col++;
        pos.set(n.id, { x, y: ROOT_Y + d * DY });
        return x;
      }
      const a = place(n.left, d + 1);
      const b = place(n.right, d + 1);
      const x = (a + b) / 2;
      pos.set(n.id, { x, y: ROOT_Y + d * DY });
      return x;
    };
    place(t.root, 0);
    cursor += col * CW;
  });
  return { trees, pos, right: cursor, depth, separator };
}

function extentOf(state: HuffmanState): HuffmanExtent {
  const lay = layout(state);
  return {
    width: Math.max(lay.right, X0 + state.heap.length * HP),
    depth: lay.depth,
    heap: state.heap.length,
    longCodes: state.nodes.some((n) => (n.code?.length ?? 0) > 4),
  };
}

/** Give every frame the size of the whole run, so the forest keeps one size while it merges. Call it from trace(). */
export function stabilizeHuffman<S extends HuffmanState>(frames: Array<Frame<S>>): Array<Frame<S>> {
  let all: HuffmanExtent | undefined;
  for (const f of frames) {
    const e = extentOf(f.state);
    all = all
      ? { width: Math.max(all.width, e.width), depth: Math.max(all.depth, e.depth), heap: Math.max(all.heap, e.heap), longCodes: all.longCodes || e.longCodes }
      : e;
  }
  if (!all) return frames;
  const extent = all;
  return frames.map((f) => ({ ...f, state: { ...f.state, extent } }));
}

const glyphOf = (role: Role | undefined) => (role === 'good' ? ` ${SYM.check}` : role === 'bad' ? ` ${SYM.cross}` : '');

/**
 * Organism for Huffman coding: the heap list on top (one cell per tree, by index), the forest of
 * those trees below in heap order (popped and merged trees to the right of a divider), edges
 * labelled 0 and 1, each leaf's frequency and code under it; then the text, the code table and
 * the encoded bits. Cells and nodes keep their ids, so a sift slides cells and trees together
 * and a merge lowers two trees under their new root.
 */
export function HuffmanForest({ state }: { state: HuffmanState }) {
  const lay = layout(state);
  const ext = state.extent ?? extentOf(state);
  const width = Math.max(ext.width, lay.right) + PAD;
  const leafText = ext.longCodes ? 36 : 26;
  const height = ROOT_Y + Math.max(ext.depth, lay.depth) * DY + R + leafText + 8;
  const byId = new Map(state.nodes.map((n) => [n.id, n]));

  const target = new Map<string, Pt>();
  for (const [id, p] of lay.pos) target.set(`n${id}`, p);
  state.heap.forEach((id, i) => target.set(`h${id}`, { x: X0 + i * HP, y: CELL_TOP }));
  const tween = useTween(target);
  const at = (key: string) => tween.get(key) ?? target.get(key)!;

  const edges = state.nodes.flatMap((n) =>
    (
      [
        [n.left, '0'],
        [n.right, '1'],
      ] as Array<[number | null, string]>
    )
      .filter(([c]) => c !== null && lay.pos.has(c) && lay.pos.has(n.id))
      .map(([c, bit]) => {
        const a = at(`n${n.id}`);
        const b = at(`n${c}`);
        const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        const ux = (b.x - a.x) / len;
        const uy = (b.y - a.y) / len;
        const role = byId.get(c!)?.edgeRole;
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        return (
          <g key={`e${c}`} className={`hf-edge${role ? ` role-${role}` : ''}`}>
            <line x1={a.x + ux * R} y1={a.y + uy * R} x2={b.x - ux * R} y2={b.y - uy * R} />
            <text x={mx + (bit === '0' ? -7 : 7)} y={my - 4}>
              {bit}
            </text>
          </g>
        );
      }),
  );

  const summary = `Heap of ${state.heap.length} tree${state.heap.length === 1 ? '' : 's'}${state.loose.length ? `, ${state.loose.length} outside it` : ''}`;
  const totalBits = state.bits.reduce((s, b) => s + b.bits.length, 0);
  const totalChars = state.text.reduce((s, u) => s + u.n, 0);

  return (
    <div className="hf-wrap">
      <div className="hf-scroll">
        <svg className="huffman-forest" viewBox={`0 0 ${width} ${height}`} style={{ width, maxWidth: '100%', minWidth: Math.min(width, 480) }} role="img" aria-label={summary}>
          <text className="hf-row-label" x={X0 - 8} y={CELL_TOP + CELL_H / 2}>
            heap
          </text>
          {state.heap.length === 0 && (
            <text className="hf-note" x={X0} y={CELL_TOP + CELL_H / 2} style={{ textAnchor: 'start' }}>
              [ ] empty list
            </text>
          )}
          {state.heap.map((_, i) => (
            <text key={`i${i}`} className="hf-index" x={X0 + i * HP + CELL_W / 2} y={CELL_TOP - 8}>
              {i}
            </text>
          ))}
          {state.heap.map((id, i) => {
            const n = byId.get(id);
            if (!n) return null;
            const p = at(`h${id}`);
            const role = state.heapRoles?.[i] ?? 'idle';
            return (
              <g key={`h${id}`} className={`hf-cell role-${role}`} transform={`translate(${p.x} ${p.y})`}>
                <rect width={CELL_W} height={CELL_H} rx={6} />
                <text x={CELL_W / 2} y={CELL_H / 2}>
                  {n.symbol !== null ? `${n.symbol}:${n.freq}` : `[${n.freq}]`}
                  {glyphOf(role)}
                </text>
              </g>
            );
          })}
          {lay.separator !== undefined && <line className="hf-divider" x1={lay.separator} x2={lay.separator} y1={ROOT_Y - 30} y2={height - 6} />}
          {edges}
          {state.nodes
            .filter((n) => lay.pos.has(n.id))
            .map((n) => {
              const p = at(`n${n.id}`);
              const leaf = n.symbol !== null;
              const col = Math.round((p.x - X0 - CW / 2) / CW);
              const stagger = ext.longCodes && col % 2 === 1 ? 11 : 0;
              return (
                <g key={`n${n.id}`}>
                  <NodeGlyph x={p.x} y={p.y} r={R} label={leaf ? n.symbol! : n.freq} role={n.role} />
                  {leaf && (
                    <text className="hf-freq" x={p.x} y={p.y + R + 10}>
                      {n.freq}
                    </text>
                  )}
                  {leaf && n.code !== undefined && (
                    <text className="hf-code" x={p.x} y={p.y + R + 22 + stagger}>
                      {n.code}
                    </text>
                  )}
                </g>
              );
            })}
          {lay.trees.map((t) => {
            const p = lay.pos.has(t.root) ? at(`n${t.root}`) : undefined;
            if (!p) return null;
            return (
              <text key={`t${t.root}`} className={`hf-tag${t.loose ? ' loose' : ''}`} x={p.x} y={p.y - R - 9}>
                {t.tag}
              </text>
            );
          })}
        </svg>
      </div>
      <div className="hf-rows">
        <div className="viz-strip hf-text" aria-label="The text">
          <strong>text:</strong>
          {state.text.length === 0 && <span className="hf-empty">(empty)</span>}
          {state.text.map((u, i) => (
            <span key={i} className={`hf-char${u.role ? ` role-${u.role}` : ''}${u.n > 1 ? ' run' : ''}`}>
              {u.n > 1 ? `${u.s} x${u.n}` : u.s}
            </span>
          ))}
        </div>
        {state.calls && state.calls.length > 0 && <Strip label="open build_codes calls (code so far)" items={state.calls.map((c, i) => ({ text: c, role: i === state.calls!.length - 1 ? 'active' : undefined }))} />}
        {state.codes.length > 0 && (
          <div className="viz-strip">
            <strong>codes:</strong>
            {state.codes.map((c, i) => (
              <Token key={i} text={`${c.symbol} ${c.code}`} role={c.role} />
            ))}
          </div>
        )}
        {state.bits.length > 0 && (
          <div className="viz-strip hf-bits" aria-label="Encoded bits">
            <strong>
              encoded ({totalBits} of {totalChars * 8} bits):
            </strong>
            {state.bits.map((b, i) => (
              <span key={i} className={`hf-chunk${b.role ? ` role-${b.role}` : ''}`}>
                {b.bits}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
