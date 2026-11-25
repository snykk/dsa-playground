import { useId } from 'react';
import type { Role } from '../core/types';
import { ArrowDefs, monoW, SvgArrow, SvgBox, SvgFrame, TextLines, type OkText } from './OptimizationKit';
import './DncLayerView.css';

export interface DncCell {
  text: string;
  role?: Role;
  /** A cell of the layer not solved yet: a dashed outline, no text. */
  ghost?: boolean;
}

/** A bracket over cells from..to (inclusive), with a label. */
export interface DncSpan {
  from: number;
  to: number;
  text: string;
  role: Role;
}

/** One call of the recursion: the cells lo..hi it covers, drawn at its depth, and the j it tries. */
export interface DncCall {
  lo: number;
  hi: number;
  depth: number;
  text: string;
  role: Role;
}

export interface DncState {
  /** What the picture shows, for screen readers. */
  label: string;
  title: string;
  n: number;
  /** values[t], drawn between the columns t and t + 1. */
  values: DncCell[];
  /** P[i], one per column 0..n. */
  prefix: DncCell[];
  prevLabel: string;
  curLabel: string;
  optLabel: string;
  /** The previous layer dp[g-1][j], the current layer dp[g][i] and opt[g][i]; null = no cell. */
  prev: Array<DncCell | null>;
  cur: Array<DncCell | null>;
  opt: Array<DncCell | null>;
  /** The range of j the current cell may try: a bracket over the previous layer. */
  jRange: DncSpan | null;
  /** Groups of values (value indices), bracketed under the values row. */
  groups: DncSpan[];
  /** Cuts between the values, at these boundaries. */
  cuts: number[];
  /** dp[g-1][from] read by dp[g][to]. */
  arrow: { from: number; to: number; role: Role; label?: string } | null;
  /** The calls of the recursion so far, as bars under the layer: the recursion tree. */
  calls: DncCall[];
  /** Depth rows kept for the calls, the same for a whole run. */
  depthRows: number;
  work: OkText[];
  /** Widest work line of the run in characters, so the picture keeps one width. */
  workChars: number;
}

const PAD = 10;
const LABEL_W = 78;
const CW = 44;
const STEP = 48;
const CH = 24;
const BAR_H = 20;
const BAR_GAP = 4;
const LINE_H = 18;

/**
 * Organism for the divide-and-conquer optimization: one layer of the DP as rows of cells, built
 * from the OptimizationKit atoms. The values sit between the columns (a group values[j:i] spans
 * the columns j to i), the prefix sums, the previous layer with a bracket over the j the current
 * cell may try, the current layer and its best j, then the calls of the recursion as bars by
 * depth (the recursion tree) and the cost evaluations counted so far.
 */
export function DncLayerView({ state }: { state: DncState }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const cols = state.n + 1;
  const x0 = PAD + LABEL_W;
  const cx = (i: number) => x0 + i * STEP + CW / 2;
  const titleY = PAD + 6;
  const headY = titleY + 22;
  const valuesY = headY + 12;
  const groupY = valuesY + CH + 4;
  const prefixY = groupY + 26;
  const rangeY = prefixY + CH + 6;
  const prevY = rangeY + 20;
  const curY = prevY + CH + 28;
  const optY = curY + CH + 6;
  const callsY = optY + CH + 14;
  const workY = callsY + state.depthRows * (BAR_H + BAR_GAP) + 12;
  const height = workY + 2 * LINE_H;
  const width = Math.max(x0 + cols * STEP + PAD, PAD + monoW('x'.repeat(state.workChars)) + PAD, PAD + monoW(state.title) + PAD);
  const rowLabel = (y: number, text: string, key: string) => (
    <text key={key} className="dnc-row-label" x={x0 - 10} y={y + CH / 2}>
      {text}
    </text>
  );
  const row = (cells: Array<DncCell | null>, y: number, key: string) =>
    cells.map((c, i) =>
      c === null ? null : <SvgBox key={`${key}${i}`} x={cx(i) - CW / 2} y={y} w={CW} h={CH} text={c.text} role={c.role} ghost={c.ghost} size={11.5} />,
    );

  return (
    <SvgFrame width={width} height={height} label={state.label} minWidth={520}>
      <ArrowDefs uid={uid} />
      <text className="ok-title" x={PAD} y={titleY}>
        {state.title}
      </text>
      <text className="dnc-row-label" x={x0 - 10} y={headY}>
        i, j
      </text>
      {Array.from({ length: cols }, (_, i) => (
        <text key={`h${i}`} className="ok-head" x={cx(i)} y={headY}>
          {i}
        </text>
      ))}

      {rowLabel(valuesY, 'values', 'lv')}
      {state.values.map((c, t) => (
        <SvgBox key={`v${t}`} x={cx(t) + STEP / 2 - CW / 2} y={valuesY} w={CW} h={CH} text={c.text} role={c.role} size={11.5} />
      ))}
      {state.cuts.map((b) => (
        <line key={`cut${b}`} className="dnc-cut" x1={cx(b)} y1={valuesY - 5} x2={cx(b)} y2={valuesY + CH + 5} />
      ))}
      {state.groups.map((s) => {
        const x1 = cx(s.from) + STEP / 2 - CW / 2;
        const x2 = cx(s.to) + STEP / 2 + CW / 2;
        return (
          <g key={`g${s.from}`} className={`dnc-span role-${s.role}`}>
            <path d={`M${x1},${groupY} v5 H${x2} v-5`} />
            <text x={(x1 + x2) / 2} y={groupY + 14}>
              {s.text}
            </text>
          </g>
        );
      })}

      {rowLabel(prefixY, 'P[i]', 'lp')}
      {state.prefix.map((c, i) => (
        <SvgBox key={`p${i}`} x={cx(i) - CW / 2} y={prefixY} w={CW} h={CH} text={c.text} role={c.role} size={11.5} className="dnc-prefix" />
      ))}

      {state.jRange &&
        (() => {
          const s = state.jRange;
          const x1 = cx(s.from) - CW / 2;
          const x2 = cx(s.to) + CW / 2;
          const y = prevY - 6;
          return (
            <g className={`dnc-span role-${s.role}`}>
              <path d={`M${x1},${y} v-5 H${x2} v5`} />
              <text x={(x1 + x2) / 2} y={y - 12}>
                {s.text}
              </text>
            </g>
          );
        })()}
      {rowLabel(prevY, state.prevLabel, 'lprev')}
      {row(state.prev, prevY, 'a')}
      {state.arrow && (
        <SvgArrow
          uid={uid}
          d={`M${cx(state.arrow.from)},${prevY + CH + 2} L${cx(state.arrow.to)},${curY - 3}`}
          role={state.arrow.role}
          label={state.arrow.label}
          lx={(cx(state.arrow.from) + cx(state.arrow.to)) / 2 + (state.arrow.from === state.arrow.to ? 8 : 0)}
          ly={(prevY + CH + curY) / 2}
          anchor={state.arrow.from === state.arrow.to ? 'start' : 'middle'}
        />
      )}
      {rowLabel(curY, state.curLabel, 'lcur')}
      {row(state.cur, curY, 'c')}
      {rowLabel(optY, state.optLabel, 'lopt')}
      {row(state.opt, optY, 'o')}

      {state.depthRows > 0 && (
        <text className="dnc-row-label" x={x0 - 10} y={callsY + BAR_H / 2}>
          calls, j
        </text>
      )}
      {state.calls.map((c) => {
        const x1 = cx(c.lo) - CW / 2;
        const x2 = cx(c.hi) + CW / 2;
        const y = callsY + c.depth * (BAR_H + BAR_GAP);
        return (
          <g key={`call${c.lo}-${c.hi}`} className={`dnc-call role-${c.role}`}>
            <rect x={x1} y={y} width={x2 - x1} height={BAR_H} rx={4} />
            <text x={(x1 + x2) / 2} y={y + BAR_H / 2}>
              {c.text}
            </text>
          </g>
        );
      })}
      <TextLines x={PAD} y={workY + 4} lines={state.work} lineH={LINE_H} />
    </SvgFrame>
  );
}
