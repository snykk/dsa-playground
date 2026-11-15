import { useId } from 'react';
import type { Role } from '../core/types';
import { NodeGlyph } from '../ui/atoms/NodeGlyph';
import '../ui/roles.css';
import { SYM } from '../ui/symbols';
import { ArrowMarkers, edgeShapes, ReservedStrips, type Pt, type ReservedStrip } from './advancedGraphShared';
import './ImplicationGraphView.css';

/** One literal: variable `col`, row 0 for x and row 1 for ~x. */
export interface LiteralView {
  id: string;
  col: number;
  row: 0 | 1;
  role: Role;
  /** disc/low during Tarjan, then the component id. */
  badge?: string;
}

export interface ImplicationEdgeView {
  id: string;
  from: string;
  to: string;
  role: Role;
}

/** A cell under a variable's column: "x0 = ?", "x0 = T". */
export interface VariableView {
  label: string;
  role: Role;
}

export interface ClauseView {
  label: string;
  role: Role;
  /** A check (the clause holds) or a cross (it failed, or add_clause raised). */
  mark?: 'ok' | 'bad';
}

export interface ImplicationState {
  n: number;
  literals: LiteralView[];
  edges: ImplicationEdgeView[];
  values: VariableView[];
  clauses: ClauseView[];
  strips: ReservedStrip[];
}

const R = 20;
const TOP = 80;
const BOTTOM = 230;
const VALUES = 292;
const CLAUSE_TOP = 326;
const CLAUSE_W = 140;
const CLAUSE_H = 22;
/** Four rows of clauses keep the tallest picture (16 clauses) under the stage's 440px. */
const CLAUSE_ROWS = 4;

/**
 * Size of the picture: wide enough for the variable columns (96px apart, 6 fit in 600px) and
 * for the clause grid, which takes as few columns as fit, but enough that it needs at most four rows.
 * A small formula therefore stays narrow and is drawn at full size on a phone.
 */
export function implicationLayout(n: number, clauses: number) {
  const step = n <= 5 ? 96 : (600 - 80) / n;
  const graphW = Math.max(300, 80 + n * step);
  const cols = clauses === 0 ? 0 : Math.min(clauses, Math.max(Math.floor((graphW - 20) / CLAUSE_W), Math.ceil(clauses / CLAUSE_ROWS)));
  const width = Math.max(graphW, cols * CLAUSE_W + 20);
  const rows = cols ? Math.ceil(clauses / cols) : 0;
  const height = rows ? CLAUSE_TOP + rows * (CLAUSE_H + 4) + 4 : VALUES + 24;
  return { width, height, cols, column: (col: number) => (width - step * n) / 2 + (col + 0.5) * step };
}

/**
 * Organism: a 2-SAT implication graph. Variable k owns one column, x_k on the top row and
 * ~x_k under it, so the two edges of a clause mirror each other. Under the graph: each
 * variable's value, then the clauses with a check once they are verified.
 */
export function ImplicationGraphView({ state }: { state: ImplicationState }) {
  const uid = `imp-${useId().replace(/:/g, '')}`;
  const { width: W, height, cols, column } = implicationLayout(state.n, state.clauses.length);
  const pos = new Map<string, Pt>(state.literals.map((l) => [l.id, { x: column(l.col), y: l.row === 0 ? TOP : BOTTOM }]));
  const shapes = edgeShapes(state.edges, pos, R, {
    center: { x: W / 2, y: (TOP + BOTTOM) / 2 },
    // Down and to the left: clear of the badge above a vertex and of the check mark at its top left.
    loopAngle: () => 2.4,
  });
  const clauseLeft = (W - cols * CLAUSE_W) / 2;

  return (
    <div className="imp-graph">
      <svg className="imp-svg" viewBox={`0 0 ${W} ${height}`} style={{ width: W }} role="img" aria-label="Implication graph">
        <ArrowMarkers prefix={uid} />
        <text className="imp-row-label" x={8} y={TOP}>
          x
        </text>
        <text className="imp-row-label" x={8} y={BOTTOM}>
          ~x
        </text>
        {state.edges.map((e) => (
          <path key={e.id} className={`imp-edge role-${e.role}`} d={shapes.get(e.id)!.d} markerEnd={`url(#${uid}-${e.role})`} />
        ))}
        {state.literals.map((l) => {
          const p = pos.get(l.id)!;
          return <NodeGlyph key={l.id} x={p.x} y={p.y} r={R} label={l.id} role={l.role} badge={l.badge} />;
        })}
        {state.values.map((v, k) => {
          const x = column(k);
          return (
            <g key={`v${k}`} className={`imp-cell role-${v.role}`}>
              <rect x={x - 32} y={VALUES - 12} width={64} height={24} rx={6} />
              <text x={x} y={VALUES}>
                {v.label}
              </text>
            </g>
          );
        })}
        {state.clauses.map((c, i) => {
          const x = clauseLeft + (i % cols) * CLAUSE_W;
          const y = CLAUSE_TOP + Math.floor(i / cols) * (CLAUSE_H + 4);
          const glyph = c.mark === 'ok' ? SYM.check : c.mark === 'bad' ? SYM.cross : '';
          return (
            <g key={`c${i}`} className={`imp-clause role-${c.role}`}>
              <rect x={x + 3} y={y} width={CLAUSE_W - 6} height={CLAUSE_H} rx={5} />
              <text x={x + 10} y={y + CLAUSE_H / 2}>
                {c.label}
              </text>
              <text className="imp-mark" x={x + CLAUSE_W - 12} y={y + CLAUSE_H / 2}>
                {glyph}
              </text>
            </g>
          );
        })}
      </svg>
      <ReservedStrips strips={state.strips} />
    </div>
  );
}
