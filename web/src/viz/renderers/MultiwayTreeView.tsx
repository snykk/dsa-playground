import type { Frame, Role } from '../core/types';
import { NodeGlyph } from '../ui/atoms/NodeGlyph';
import { useTween, type Pt } from '../ui/hooks/useTween';
import { Strips, type StripData } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';
import '../ui/roles.css';
import './MultiwayTreeView.css';

/** One key in a node (a B-tree key, a B+ tree separator or leaf entry). */
export interface MwCell {
  /** Stable identity: a key keeps its id when it moves to another node, so it glides there. */
  id: string;
  label: string;
  /** Second line under the key, e.g. the value stored with it in a B+ tree leaf. */
  sub?: string;
  role?: Role;
  /** Faded and dashed: a placeholder, e.g. the slot a shift opens before the key is written. */
  ghost?: boolean;
}

/** Text on the edge from a node's parent into the node (a trie character, a suffix-tree substring). */
export interface MwEdgeLabel {
  text: string;
  /** Per-character roles, e.g. the matched part of a suffix-tree edge in compare and the mismatch in bad. */
  marks?: Array<Role | undefined>;
  /** Smaller second line, e.g. the label's [start, end] indices into the text. */
  sub?: string;
  role?: Role;
}

export interface MwNode {
  id: string;
  /** Key cells: the node is drawn as a row of keys. Leave it out for a dot node (trie, suffix tree). */
  keys?: MwCell[];
  /** Child ids, left to right. */
  children: string[];
  /** Dot nodes: text inside the dot, e.g. the suffix index of a suffix-tree leaf. */
  label?: string;
  /** Dot nodes: a second ring around the dot, e.g. a trie node that ends a word. */
  marked?: boolean;
  /** The node as a whole: the frame of a key node, the dot of a dot node. */
  role?: Role;
  /** Small text under the node: "full", "t - 1 keys", "new root"... */
  tag?: string;
  /** Label on the edge from the parent. */
  edge?: MwEdgeLabel;
  /** Faded: about to leave the tree (a pruned trie node). */
  ghost?: boolean;
}

/** A key outside the tree, drawn above a node: the key being inserted, a separator on its way up. */
export interface MwFloat {
  cell: MwCell;
  /** Node it hovers over. */
  anchor: string;
  /** Key-slot index of the anchor to hover over (between keys when fractional); centered if left out. */
  slot?: number;
  /** Short word next to it: "insert", "copy". */
  tag?: string;
}

/** A row of characters above the tree: the text of a suffix tree, the word a trie operation walks. */
export interface MwTextRow {
  label: string;
  cells: Array<{ ch: string; role?: Role }>;
  /** Index numbers under the cells (default true). */
  indices?: boolean;
}

/** Space a run keeps for its whole length, so the picture does not resize between steps. */
export interface MwExtent {
  width: number;
  /** y of the first tree row. */
  top: number;
  /** Distance between two tree rows. */
  pitch: number;
  rows: number;
  /** Tallest node box. */
  nodeH: number;
}

export interface MwState {
  nodes: MwNode[];
  root: string | null;
  /** Roles of tree edges, keyed by the child's id (the edge from its parent). */
  edgeRoles?: Record<string, Role>;
  /** B+ tree: leaf ids in `next` order; an arrow is drawn from each leaf to the next. */
  chain?: string[];
  /** Roles of the chain arrows, keyed by the id of the leaf the arrow leaves. */
  chainRoles?: Record<string, Role>;
  floating?: MwFloat[];
  text?: MwTextRow;
  note?: string;
  strips?: StripData[];
  /** Set by stabilizeMultiway; never needed by a tracer. */
  extent?: MwExtent;
}

const CW = 30;
const CH = 26;
const CH_SUB = 38;
const KEY_GAP = 16;
const LINK_GAP = 26;
const R = 12;
const DOT_GAP = 10;
const PAD = 14;
const FRAME = 3;
const KEY_PITCH_GAP = 56;
const TAG_ROOM = 14;
const CHAR_W = 7.4;
const LABEL_LINE = 12;
const TEXT_CW = 20;
const TEXT_CH = 22;
const TEXT_ROW = TEXT_CH + 22;
const FLOAT_ROOM = CH + 14;
/** A wide tree is never drawn smaller than this: the stage scrolls sideways instead. */
const MIN_SCALE = 0.7;

/** Width of an edge label in px (12px monospace). */
function labelWidth(e: MwEdgeLabel | undefined): number {
  if (!e) return 0;
  return Math.max(e.text.length, e.sub?.length ?? 0) * CHAR_W + 8;
}

const isKeys = (n: MwNode) => n.keys !== undefined;
const boxH = (n: MwNode) => (isKeys(n) ? (n.keys!.some((k) => k.sub !== undefined) ? CH_SUB : CH) : 2 * R);
const ownW = (n: MwNode) => (isKeys(n) ? Math.max(1, n.keys!.length) * CW + 2 * FRAME : Math.max(2 * R + 4, labelWidth(n.edge)));

export interface MwBox {
  id: string;
  depth: number;
  /** Center x, relative to the tree's left edge. */
  cx: number;
  /** Width of the node box (key cells, or the dot). */
  w: number;
  h: number;
}

export interface MwLayout {
  boxes: Map<string, MwBox>;
  treeW: number;
  rows: number;
  nodeH: number;
  labelLines: number;
  floatAtRoot: boolean;
}

/**
 * Tidy layout: every subtree gets the width of its widest level of packing (its own box, or
 * its children side by side), and a parent sits centered over its children.
 */
export function layoutMultiway(state: MwState): MwLayout {
  const byId = new Map(state.nodes.map((n) => [n.id, n]));
  const dots = state.nodes.some((n) => !isKeys(n));
  const gap = state.chain ? LINK_GAP : dots ? DOT_GAP : KEY_GAP;
  const sw = new Map<string, number>();
  const kids = (n: MwNode) => n.children.filter((c) => byId.has(c));
  const seen = new Set<string>();
  const measure = (id: string): number => {
    const n = byId.get(id)!;
    seen.add(id);
    const cs = kids(n).filter((c) => !seen.has(c));
    const total = cs.reduce((s, c) => s + measure(c), 0) + gap * Math.max(0, cs.length - 1);
    const w = Math.max(ownW(n), total);
    sw.set(id, w);
    return w;
  };
  const boxes = new Map<string, MwBox>();
  let rows = 0;
  const place = (id: string, left: number, depth: number) => {
    const n = byId.get(id)!;
    const w = sw.get(id)!;
    boxes.set(id, { id, depth, cx: left + w / 2, w: isKeys(n) ? Math.max(1, n.keys!.length) * CW : 2 * R, h: boxH(n) });
    rows = Math.max(rows, depth + 1);
    const cs = kids(n).filter((c) => sw.has(c) && !boxes.has(c));
    const total = cs.reduce((s, c) => s + sw.get(c)!, 0) + gap * Math.max(0, cs.length - 1);
    let x = left + (w - total) / 2;
    for (const c of cs) {
      place(c, x, depth + 1);
      x += sw.get(c)! + gap;
    }
  };
  let treeW = 0;
  if (state.root !== null && byId.has(state.root)) {
    treeW = measure(state.root);
    place(state.root, 0, 0);
  }
  return {
    boxes,
    treeW,
    rows,
    nodeH: Math.max(dots ? 2 * R : CH, ...state.nodes.map(boxH)),
    labelLines: Math.max(0, ...state.nodes.map((n) => (n.edge ? (n.edge.sub ? 2 : 1) : 0))),
    floatAtRoot: (state.floating ?? []).some((f) => f.anchor === state.root),
  };
}

/** x of a floating key's left edge, relative to the tree's left edge (the k-th float over its anchor). */
function floatX(f: MwFloat, b: MwBox, k: number): number {
  const x = f.slot !== undefined ? b.cx - b.w / 2 + f.slot * CW : b.cx - CW / 2;
  return x + k * (CW + 4);
}

function extentOf(state: MwState): MwExtent {
  const l = layoutMultiway(state);
  const dots = state.nodes.some((n) => !isKeys(n));
  const textW = state.text ? state.text.label.length * CHAR_W + 10 + state.text.cells.length * TEXT_CW : 0;
  // Floating keys may stick out past the tree: keep room for them on both sides (the tree is centered).
  let side = 0;
  const perAnchor = new Map<string, number>();
  for (const f of state.floating ?? []) {
    const b = l.boxes.get(f.anchor);
    if (!b) continue;
    const k = perAnchor.get(f.anchor) ?? 0;
    perAnchor.set(f.anchor, k + 1);
    const x = floatX(f, b, k);
    const right = x + CW + (f.tag ? 4 + f.tag.length * 6.5 : 0);
    side = Math.max(side, -x, right - l.treeW);
  }
  return {
    width: Math.max(l.treeW + 2 * PAD + 2 * side, textW + 2 * PAD, 200),
    top: PAD + (state.text ? TEXT_ROW : 0) + (l.floatAtRoot ? FLOAT_ROOM : 0),
    pitch: l.nodeH + (dots ? 30 + l.labelLines * LABEL_LINE : KEY_PITCH_GAP),
    rows: Math.max(1, l.rows),
    nodeH: l.nodeH,
  };
}

function union(a: MwExtent, b: MwExtent | undefined): MwExtent {
  if (!b) return a;
  return {
    width: Math.max(a.width, b.width),
    top: Math.max(a.top, b.top),
    pitch: Math.max(a.pitch, b.pitch),
    rows: Math.max(a.rows, b.rows),
    nodeH: Math.max(a.nodeH, b.nodeH),
  };
}

/** Give every frame the extent of the whole run, so the picture keeps its size. Call it from trace(). */
export function stabilizeMultiway<S extends MwState>(frames: Array<Frame<S>>): Array<Frame<S>> {
  let all: MwExtent | undefined;
  for (const f of frames) all = union(extentOf(f.state), all);
  if (!all) return frames;
  const extent = all;
  return frames.map((f) => ({ ...f, state: { ...f.state, extent } }));
}

function describe(state: MwState, layout: MwLayout): string {
  const byId = new Map(state.nodes.map((n) => [n.id, n]));
  const levels: string[][] = [];
  for (const b of [...layout.boxes.values()].sort((x, y) => x.cx - y.cx)) {
    const n = byId.get(b.id)!;
    const text = isKeys(n) ? `[${n.keys!.map((k) => k.label).join(' ')}]` : `${n.edge?.text ?? 'root'}${n.label ? ` (${n.label})` : ''}${n.marked ? ' (end)' : ''}`;
    (levels[b.depth] ??= []).push(text);
  }
  return levels.length ? `Tree by level: ${levels.map((l) => l.join(', ')).join(' / ')}` : 'Empty tree';
}

function glyphOf(role: Role): string | null {
  return role === 'good' ? SYM.check : role === 'bad' ? SYM.cross : null;
}

/** Group consecutive characters with the same mark into one tspan. */
function labelRuns(e: MwEdgeLabel): Array<{ text: string; role?: Role }> {
  const runs: Array<{ text: string; role?: Role }> = [];
  [...e.text].forEach((ch, i) => {
    const role = e.marks?.[i];
    const last = runs[runs.length - 1];
    if (last && last.role === role) last.text += ch;
    else runs.push({ text: ch, role });
  });
  return runs;
}

/** y of an edge label's lines above a child whose top is at `top`: the main line, then the [start, end] line. */
function labelLines(child: MwNode, top: number): { main: number; sub: number; above: number } {
  const ring = child.marked ? 4 : 0;
  const sub = top - ring - 8;
  const main = child.edge?.sub ? sub - LABEL_LINE : sub;
  return { main, sub, above: main - 9 };
}

/**
 * An edge into a labelled dot ends just above the child's label, which hangs between the edge
 * and the dot: a wide fan of edges then never crosses a sibling's label.
 */
function edgePoints(a: Pt, b: Pt, child: MwNode): Pt[] {
  if (!child.edge || child.keys !== undefined) return [a, b];
  return [a, { x: b.x, y: Math.max(labelLines(child, b.y).above, a.y + 2) }];
}

/**
 * Organism: a rooted tree whose nodes are either rows of key cells (B-tree, B+ tree) or small
 * dots with labelled edges (trie, suffix tree). Keys keep their id, so a split, a borrow or a
 * merge makes them glide to their new node; node frames stretch and shrink with their keys.
 * B+ tree leaves can be linked by `next` arrows, keys can hover above a node on their way in,
 * and a row of characters (the text or the word) can sit above the tree.
 */
export function MultiwayTreeView({ state }: { state: MwState }) {
  const layout = layoutMultiway(state);
  const ext = union(extentOf(state), state.extent);
  const byId = new Map(state.nodes.map((n) => [n.id, n]));
  const offX = (ext.width - layout.treeW) / 2;
  const rowTop = (depth: number) => ext.top + depth * ext.pitch;
  const height = rowTop(ext.rows - 1) + ext.nodeH + TAG_ROOM + PAD;

  const target = new Map<string, Pt>();
  for (const b of layout.boxes.values()) {
    const n = byId.get(b.id)!;
    const x = offX + b.cx;
    const y = rowTop(b.depth);
    if (isKeys(n)) {
      target.set(`L:${n.id}`, { x: x - b.w / 2, y });
      target.set(`R:${n.id}`, { x: x + b.w / 2, y });
      n.keys!.forEach((k, i) => target.set(`K:${k.id}`, { x: x - b.w / 2 + i * CW, y }));
    } else {
      target.set(`D:${n.id}`, { x, y: y + R });
    }
  }
  const floats = (state.floating ?? []).filter((f) => layout.boxes.has(f.anchor));
  const perAnchor = new Map<string, number>();
  for (const f of floats) {
    const b = layout.boxes.get(f.anchor)!;
    const k = perAnchor.get(f.anchor) ?? 0;
    perAnchor.set(f.anchor, k + 1);
    target.set(`K:${f.cell.id}`, { x: offX + floatX(f, b, k), y: rowTop(b.depth) - CH - 10 });
  }
  const pos = useTween(target);
  const at = (key: string): Pt => pos.get(key) ?? target.get(key)!;

  const frameOf = (n: MwNode) => {
    const l = at(`L:${n.id}`);
    const r = at(`R:${n.id}`);
    return { x: l.x, y: l.y, w: Math.max(r.x - l.x, CW), h: boxH(n) };
  };
  /** Bottom anchor of child pointer i of node n, and the top anchor of node n. */
  const pointer = (n: MwNode, i: number): Pt => {
    if (!isKeys(n)) {
      const c = at(`D:${n.id}`);
      return { x: c.x, y: c.y + R };
    }
    const f = frameOf(n);
    const k = Math.max(1, n.keys!.length);
    const x = f.x + (f.w * Math.min(i, k)) / k;
    return { x: Math.min(Math.max(x, f.x + 4), f.x + f.w - 4), y: f.y + f.h + FRAME };
  };
  const topOf = (n: MwNode): Pt => {
    if (!isKeys(n)) {
      const c = at(`D:${n.id}`);
      return { x: c.x, y: c.y - R };
    }
    const f = frameOf(n);
    return { x: f.x + f.w / 2, y: f.y - FRAME };
  };

  const placed = state.nodes.filter((n) => layout.boxes.has(n.id));
  const edges = placed.flatMap((n) =>
    n.children
      .filter((c) => layout.boxes.has(c))
      .map((c, i) => {
        const child = byId.get(c)!;
        const a = pointer(n, i);
        const b = topOf(child);
        const role = state.edgeRoles?.[c] ?? 'idle';
        return { key: `${n.id}>${c}`, a, b, role, child };
      }),
  );

  const cellView = (k: MwCell, p: Pt, h: number) => {
    const role = k.role ?? 'idle';
    const glyph = glyphOf(role);
    return (
      <g key={`K:${k.id}`} className={`mw-cell role-${role}${k.ghost ? ' ghost' : ''}`}>
        <rect x={p.x + 1} y={p.y} width={CW - 2} height={h} rx={5} />
        <text className="mw-key" x={p.x + CW / 2} y={p.y + (k.sub !== undefined ? 13 : h / 2)}>
          {k.label}
        </text>
        {k.sub !== undefined && (
          <text className="mw-sub" x={p.x + CW / 2} y={p.y + 29}>
            {k.sub}
          </text>
        )}
        {glyph && (
          <text className="mw-glyph" x={p.x + CW - 1} y={p.y - 4}>
            {glyph}
          </text>
        )}
      </g>
    );
  };

  const chain = (state.chain ?? []).filter((id) => layout.boxes.has(id) && isKeys(byId.get(id)!));
  const text = state.text;
  const textLeft = PAD + (text ? text.label.length * CHAR_W + 10 : 0);

  return (
    <div className="mw-wrap">
      <svg
        className="mw-view"
        viewBox={`0 0 ${ext.width} ${height}`}
        style={{ width: ext.width, maxWidth: '100%', minWidth: Math.min(ext.width, Math.max(520, ext.width * MIN_SCALE)) }}
        role="img"
        aria-label={describe(state, layout)}
      >
        {text && (
          <g className="mw-text">
            <text className="mw-text-label" x={PAD} y={PAD + TEXT_CH / 2}>
              {text.label}
            </text>
            {text.cells.map((c, i) => {
              const x = textLeft + i * TEXT_CW;
              const role = c.role ?? 'idle';
              return (
                <g key={`t${i}`} className={`mw-tcell role-${role}`}>
                  <rect x={x + 1} y={PAD} width={TEXT_CW - 2} height={TEXT_CH} rx={4} />
                  <text className="mw-tchar" x={x + TEXT_CW / 2} y={PAD + TEXT_CH / 2}>
                    {c.ch}
                  </text>
                  {text.indices !== false && (
                    <text className="mw-tindex" x={x + TEXT_CW / 2} y={PAD + TEXT_CH + 9}>
                      {i}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        )}
        {state.root === null && (
          <text className="mw-note-svg" x={ext.width / 2} y={ext.top + ext.nodeH / 2}>
            (empty tree)
          </text>
        )}
        {edges.map((e) => (
          <polyline key={e.key} className={`mw-edge role-${e.role}`} points={edgePoints(e.a, e.b, e.child).map((p) => `${p.x},${p.y}`).join(' ')} />
        ))}
        {chain.slice(0, -1).map((id, i) => {
          const a = frameOf(byId.get(id)!);
          const b = frameOf(byId.get(chain[i + 1])!);
          const y = a.y + a.h / 2;
          const x1 = a.x + a.w + FRAME + 2;
          const x2 = b.x - FRAME - 2;
          const role = state.chainRoles?.[id] ?? 'idle';
          if (x2 - x1 < 6) return null;
          return (
            <g key={`c:${id}`} className={`mw-link role-${role}`}>
              <line x1={x1} y1={y} x2={x2 - 6} y2={b.y + b.h / 2} />
              <path d={`M ${x2} ${b.y + b.h / 2} l -7 -4 v 8 z`} />
            </g>
          );
        })}
        {placed.map((n) => {
          const role = n.role ?? 'idle';
          if (isKeys(n)) {
            const f = frameOf(n);
            const glyph = glyphOf(role);
            return (
              <g key={`F:${n.id}`} className={`mw-frame role-${role}${n.keys!.length === 0 ? ' empty' : ''}${n.ghost ? ' ghost' : ''}`}>
                <rect x={f.x - FRAME} y={f.y - FRAME} width={f.w + 2 * FRAME} height={f.h + 2 * FRAME} rx={7} />
                {n.keys!.length === 0 && (
                  <text className="mw-empty" x={f.x + f.w / 2} y={f.y + f.h / 2}>
                    {SYM.emptySet}
                  </text>
                )}
                {glyph && (
                  <text className="mw-glyph" x={f.x - FRAME - 2} y={f.y - 6} style={{ textAnchor: 'end' }}>
                    {glyph}
                  </text>
                )}
                {n.tag && (
                  <text className="mw-tag" x={f.x + f.w / 2} y={f.y + f.h + FRAME + 10}>
                    {n.tag}
                  </text>
                )}
              </g>
            );
          }
          const c = at(`D:${n.id}`);
          return (
            <g key={`D:${n.id}`} className={`mw-dot${n.ghost ? ' ghost' : ''}`}>
              {n.marked && <circle className={`mw-ring role-${role}`} cx={c.x} cy={c.y} r={R + 4} />}
              <NodeGlyph x={c.x} y={c.y} r={R} label={n.label ?? ''} role={role} />
              {n.tag && (
                <text className="mw-tag" x={c.x} y={c.y + R + (n.marked ? 15 : 11)}>
                  {n.tag}
                </text>
              )}
            </g>
          );
        })}
        {placed.flatMap((n) => {
          if (!isKeys(n)) return [];
          const f = frameOf(n);
          return n.keys!.map((k) => cellView(k, at(`K:${k.id}`), f.h));
        })}
        {edges
          .filter((e) => e.child.edge)
          .map((e) => {
            const label = e.child.edge!;
            const b = e.b;
            const { main: mainY, sub: subY } = labelLines(e.child, b.y);
            return (
              <g key={`E:${e.key}`} className={`mw-elabel role-${label.role ?? 'idle'}`}>
                <text className="mw-etext" x={b.x} y={mainY}>
                  {labelRuns(label).map((r, i) => (
                    <tspan key={i} className={r.role ? `mark role-${r.role}` : undefined}>
                      {r.text}
                    </tspan>
                  ))}
                </text>
                {label.sub && (
                  <text className="mw-esub" x={b.x} y={subY}>
                    {label.sub}
                  </text>
                )}
              </g>
            );
          })}
        {floats.map((f) => {
          const p = at(`K:${f.cell.id}`);
          return (
            <g key={`FL:${f.cell.id}`} className="mw-float">
              {cellView(f.cell, p, CH)}
              {f.tag && (
                <text className="mw-ftag" x={p.x + CW + 4} y={p.y + CH / 2}>
                  {f.tag}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {state.note && <p className="mw-note">{state.note}</p>}
      <Strips strips={state.strips} />
    </div>
  );
}
