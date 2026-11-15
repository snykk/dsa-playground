import { useId } from 'react';
import type { Frame, Role } from '../core/types';
import { NodeGlyph } from '../ui/atoms/NodeGlyph';
import { useTween, type Pt } from '../ui/hooks/useTween';
import { Strips, type StripData } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';
import '../ui/roles.css';
import './AhoCorasickView.css';

/** One trie node. Node 0 is the root. */
export interface AcNodeView {
  id: number;
  /** Child ids, in the order the children dict keeps them (insertion order). */
  children: number[];
  /** The character on the edge from the parent ('' for the root), drawn inside the dot. */
  ch: string;
  /** The string the node spells from the root, drawn under the dot (the root is "root"). */
  name: string;
  /** How many patterns end here: a double ring when > 0, an "xN" badge when > 1. */
  patterns: number;
  role?: Role;
}

/** A failure link (dashed) or an output link (dotted), drawn as a curved arrow. */
export interface AcLinkView {
  from: number;
  to: number;
  kind: 'fail' | 'output';
  role?: Role;
}

/** A row of characters above the trie: the pattern being inserted or the text being scanned. */
export interface AcTextRow {
  label: string;
  cells: Array<{ ch: string; role?: Role }>;
}

/** Space a run keeps for its whole length, so the picture does not resize between steps. */
export interface AcExtent {
  cols: number;
  rows: number;
  textCells: number;
  textLabel: number;
}

export interface AcState {
  nodes: AcNodeView[];
  links: AcLinkView[];
  /** Roles of trie edges, keyed by the child's id (the edge from its parent). */
  edgeRoles?: Record<number, Role>;
  text?: AcTextRow;
  note?: string;
  strips?: StripData[];
  /** Set by stabilizeAho; never needed by a tracer. */
  extent?: AcExtent;
}

const R = 13;
const SLOT = 72;
const PITCH = 62;
const PAD = 16;
const TEXT_CW = 22;
const TEXT_CH = 24;
const TEXT_ROW = TEXT_CH + 26;
const CHAR_W = 7.2;
const MARKER_ROLES: Role[] = ['idle', 'compare', 'active', 'done', 'muted'];

interface Layout {
  /** Center x in slot units (leaves are 1 apart) and depth of every node. */
  at: Map<number, { x: number; depth: number }>;
  cols: number;
  rows: number;
}

/** Tidy layout: every leaf takes one slot, a parent sits centered over its first and last child. */
export function layoutAho(nodes: AcNodeView[]): Layout {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const at = new Map<number, { x: number; depth: number }>();
  let next = 0;
  let rows = 0;
  const place = (id: number, depth: number): number => {
    const n = byId.get(id)!;
    rows = Math.max(rows, depth + 1);
    const kids = n.children.filter((c) => byId.has(c));
    let x: number;
    if (kids.length === 0) x = next++;
    else {
      const xs = kids.map((c) => place(c, depth + 1));
      x = (xs[0] + xs[xs.length - 1]) / 2;
    }
    at.set(id, { x, depth });
    return x;
  };
  if (byId.has(0)) place(0, 0);
  return { at, cols: Math.max(1, next), rows: Math.max(1, rows) };
}

function extentOf(state: AcState): AcExtent {
  const l = layoutAho(state.nodes);
  return { cols: l.cols, rows: l.rows, textCells: state.text?.cells.length ?? 0, textLabel: state.text?.label.length ?? 0 };
}

/** Give every frame the extent of the whole run, so the picture keeps its size. Call it from trace(). */
export function stabilizeAho<S extends AcState>(frames: Array<Frame<S>>): Array<Frame<S>> {
  const all: AcExtent = { cols: 1, rows: 1, textCells: 0, textLabel: 0 };
  for (const f of frames) {
    const e = extentOf(f.state);
    all.cols = Math.max(all.cols, e.cols);
    all.rows = Math.max(all.rows, e.rows);
    all.textCells = Math.max(all.textCells, e.textCells);
    all.textLabel = Math.max(all.textLabel, e.textLabel);
  }
  return frames.map((f) => ({ ...f, state: { ...f.state, extent: all } }));
}

/** A curved arrow from a to b; failure links bend one way and output links the other, so a pair never overlaps. */
function arrowPath(a: Pt, b: Pt, kind: AcLinkView['kind']): string {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const bend = (kind === 'fail' ? 1 : -1) * Math.min(50, Math.max(24, len * 0.28));
  const c = { x: (a.x + b.x) / 2 - (dy / len) * bend, y: (a.y + b.y) / 2 + (dx / len) * bend };
  const trim = (p: Pt, by: number) => {
    const ux = c.x - p.x;
    const uy = c.y - p.y;
    const l = Math.hypot(ux, uy) || 1;
    return { x: p.x + (ux / l) * by, y: p.y + (uy / l) * by };
  };
  const s = trim(a, R + 2);
  const e = trim(b, R + 6);
  return `M${s.x.toFixed(1)},${s.y.toFixed(1)} Q${c.x.toFixed(1)},${c.y.toFixed(1)} ${e.x.toFixed(1)},${e.y.toFixed(1)}`;
}

function describe(state: AcState): string {
  const byId = new Map(state.nodes.map((n) => [n.id, n]));
  const name = (id: number) => (id === 0 ? 'root' : byId.get(id)?.name ?? '?');
  const nodes = state.nodes.filter((n) => n.id !== 0).map((n) => `${n.name}${n.patterns ? ' (ends a pattern)' : ''}`);
  const links = state.links.map((l) => `${l.kind} ${name(l.from)} to ${name(l.to)}`);
  return `Trie with ${nodes.length} nodes below the root: ${nodes.join(', ') || 'none'}. Links: ${links.join(', ') || 'none'}.`;
}

/**
 * Organism: an Aho-Corasick automaton. The trie is drawn top-down with the character of each
 * node in its dot and the string it spells underneath; a double ring marks a node that ends a
 * pattern. Failure links are dashed curved arrows and output links dotted ones, curving the
 * other way. A row of characters (the pattern being inserted, or the text) sits above. Nodes
 * keep their id, so they glide when the trie grows.
 */
export function AhoCorasickView({ state }: { state: AcState }) {
  const uid = useId().replace(/:/g, '');
  const layout = layoutAho(state.nodes);
  const ext = state.extent ?? extentOf(state);
  const cols = Math.max(ext.cols, layout.cols);
  const rows = Math.max(ext.rows, layout.rows);
  const textW = ext.textCells ? ext.textLabel * CHAR_W + 12 + ext.textCells * TEXT_CW : 0;
  const width = Math.max(cols * SLOT + 2 * PAD, textW + 2 * PAD, 220);
  const top = PAD + (ext.textCells ? TEXT_ROW : 0) + 6;
  const height = top + (rows - 1) * PITCH + 2 * R + 30;
  const left = (width - cols * SLOT) / 2;

  const target = new Map<number, Pt>();
  for (const [id, p] of layout.at) target.set(id, { x: left + (p.x + 0.5) * SLOT, y: top + R + p.depth * PITCH });
  const pos = useTween(target);
  const at = (id: number): Pt | undefined => pos.get(id) ?? target.get(id);

  const byId = new Map(state.nodes.map((n) => [n.id, n]));
  const drawn = state.nodes.filter((n) => target.has(n.id));
  const text = state.text;
  const textLeft = PAD + (text ? text.label.length * CHAR_W + 12 : 0);

  return (
    <div className="ac-wrap">
      <svg
        className="ac-view"
        viewBox={`0 0 ${width} ${height}`}
        style={{ width, maxWidth: '100%', minWidth: Math.min(width, 480) }}
        role="img"
        aria-label={describe(state)}
      >
        <defs>
          {MARKER_ROLES.map((role) => (
            <marker key={role} id={`ac-${uid}-${role}`} className={`role-${role}`} viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" className="ac-head" />
            </marker>
          ))}
        </defs>
        {text && (
          <g className="ac-text">
            <text className="ac-text-label" x={PAD} y={PAD + TEXT_CH / 2}>
              {text.label}
            </text>
            {text.cells.map((c, i) => {
              const x = textLeft + i * TEXT_CW;
              return (
                <g key={`t${i}`} className={`ac-tcell role-${c.role ?? 'idle'}`}>
                  <rect x={x + 1} y={PAD} width={TEXT_CW - 2} height={TEXT_CH} rx={4} />
                  <text className="ac-tchar" x={x + TEXT_CW / 2} y={PAD + TEXT_CH / 2}>
                    {c.ch === ' ' ? SYM.openBox : c.ch}
                  </text>
                  <text className="ac-tindex" x={x + TEXT_CW / 2} y={PAD + TEXT_CH + 9}>
                    {i}
                  </text>
                </g>
              );
            })}
          </g>
        )}
        {drawn.flatMap((n) =>
          n.children
            .filter((c) => target.has(c))
            .map((c) => {
              const a = at(n.id)!;
              const b = at(c)!;
              const role = state.edgeRoles?.[c] ?? 'idle';
              return <line key={`e${c}`} className={`ac-edge role-${role}`} x1={a.x} y1={a.y + R} x2={b.x} y2={b.y - R} />;
            }),
        )}
        {state.links
          .filter((l) => target.has(l.from) && target.has(l.to))
          .map((l) => {
            const role = l.role ?? 'idle';
            return (
              <path
                key={`${l.kind}${l.from}`}
                className={`ac-${l.kind} role-${role}`}
                d={arrowPath(at(l.from)!, at(l.to)!, l.kind)}
                markerEnd={`url(#ac-${uid}-${MARKER_ROLES.includes(role) ? role : 'active'})`}
              />
            );
          })}
        {drawn.map((n) => {
          const c = at(n.id)!;
          const role = n.role ?? 'idle';
          const ring = n.patterns > 0;
          return (
            <g key={`n${n.id}`} className="ac-node">
              {ring && <circle className={`ac-ring role-${role}`} cx={c.x} cy={c.y} r={R + 4} />}
              <NodeGlyph
                x={c.x}
                y={c.y}
                r={R}
                label={n.id === 0 ? SYM.emptySet : n.ch === ' ' ? SYM.openBox : n.ch}
                role={role}
                badge={n.patterns > 1 ? `x${n.patterns}` : undefined}
                badgePlacement="corner"
              />
              <text className="ac-name" x={c.x} y={c.y + R + (ring ? 15 : 11)}>
                {n.id === 0 ? 'root' : byId.get(n.id)!.name.replace(/ /g, SYM.openBox)}
              </text>
            </g>
          );
        })}
      </svg>
      {state.note && <p className="ac-note">{state.note}</p>}
      <Strips strips={state.strips} />
    </div>
  );
}
