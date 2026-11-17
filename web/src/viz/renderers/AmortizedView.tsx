import type { Frame, Role } from '../core/types';
import '../ui/roles.css';
import './AmortizedView.css';

/** One slot of the array, or one bit of the counter, with the coins stored on it. */
export interface CoinCellView {
  /** Stable identity: an element keeps its key when it is copied into the new block, so it glides. */
  key: string;
  /** null: an empty slot (dashed). */
  value: string | null;
  role?: Role;
  /** Coins stored on the cell (credit of the accounting method). */
  coins?: number;
  /** How many of those just arrived (drawn in the active colour). */
  newCoins?: number;
  /** Coins just spent from this cell (drawn as fading outlines above it). */
  spentCoins?: number;
}

/** A row of cells: the array's block, the new block of a resize, or the counter's bits. */
export interface CoinBlockView {
  id: string;
  label: string;
  sub?: string;
  row: number;
  role?: Role;
  cells: CoinCellView[];
  /** Labels under the cells; the slot indices when absent. */
  indexLabels?: string[];
}

export interface ChartLine {
  id: string;
  label: string;
  points: Array<[number, number]>;
  role: Role;
  dashed?: boolean;
  dots?: boolean;
  /** Dots only. */
  noLine?: boolean;
}

export interface CostChartView {
  title: string;
  /** What one bar is, for the key: "cost of an append". */
  barLabel: string;
  xLabel: string;
  /** Operations in the run (bars at x = 1..xMax). */
  xMax: number;
  yMin: number;
  yMax: number;
  bars: Array<{ x: number; value: number; role?: Role }>;
  lines: ChartLine[];
}

export interface AmortizedState {
  blocks: CoinBlockView[];
  chart: CostChartView;
  readouts?: Array<{ label: string; value: string; role?: Role }>;
  /** Leave room for coins above the cells. */
  coins?: boolean;
  /** Set by stabilizeAmortized: the size and scale the whole run needs. */
  extent?: { cols: number; rows: number; yMin: number; yMax: number };
}

const LABEL_W = 74;
const CW = 24;
const STEP = 27;
const CH = 26;
const PAD = 10;
const READ_H = 22;
const PLOT_H = 124;
const PL = 40;
const PR = 14;
const MAX_COINS = 4;

function extentOf(s: AmortizedState) {
  return {
    cols: Math.max(1, ...s.blocks.map((b) => b.cells.length)),
    rows: Math.max(1, ...s.blocks.map((b) => b.row + 1)),
    yMin: Math.min(0, s.chart.yMin),
    yMax: Math.max(1, s.chart.yMax),
  };
}

/** Give every frame the size and chart scale of the whole run. Call it from the spec's trace(). */
export function stabilizeAmortized<S extends AmortizedState>(frames: Array<Frame<S>>): Array<Frame<S>> {
  const e = { cols: 1, rows: 1, yMin: 0, yMax: 1 };
  for (const f of frames) {
    const x = extentOf(f.state);
    e.cols = Math.max(e.cols, x.cols);
    e.rows = Math.max(e.rows, x.rows);
    e.yMin = Math.min(e.yMin, x.yMin);
    e.yMax = Math.max(e.yMax, x.yMax);
  }
  return frames.map((f) => ({ ...f, state: { ...f.state, extent: e } }));
}

function yTicks(lo: number, hi: number): number[] {
  const span = hi - lo;
  const step = [1, 2, 5, 10, 20, 25, 50, 100].find((s) => span / s <= 5) ?? 100;
  const out: number[] = [];
  for (let t = Math.ceil(lo / step) * step; t <= hi + 1e-9; t += step) out.push(t);
  return out;
}

/**
 * Organism for amortized analysis: the dynamic array as a block of slots (a resize adds the new
 * block under it, and the elements glide down as they are copied) or the binary counter's bits,
 * with the coins of the accounting method stacked on the cells; under it, a bar chart of the
 * real cost of every operation with the method's lines (the running total against 3n or 2n,
 * the bank, or the potential and the amortized costs).
 */
export function AmortizedView({ state }: { state: AmortizedState }) {
  const e = state.extent ?? extentOf(state);
  const coinH = state.coins ? 26 : 0;
  const rowH = coinH + CH + 22;
  const width = Math.max(LABEL_W + e.cols * STEP + PAD, 470);
  const blocksTop = READ_H + 6;
  // The chart's title, then its key, over the plot.
  const chartTop = blocksTop + e.rows * rowH + 44;
  const height = chartTop + PLOT_H + 36;
  const plotW = width - PL - PR;
  const { chart } = state;
  const xs = (x: number) => PL + (x / (chart.xMax + 0.5)) * plotW;
  const ys = (y: number) => chartTop + PLOT_H - ((y - e.yMin) / (e.yMax - e.yMin)) * PLOT_H;
  const barW = Math.max(2, Math.min(18, (plotW / (chart.xMax + 1)) * 0.62));
  const cellY = (row: number) => blocksTop + row * rowH + coinH;
  // The key names the bars and every line with its own mark, so no label has to sit on the lines.
  const keyItems: Array<{ id: string; label: string; role: Role; mark: 'bar' | 'line' | 'dashed' | 'dot' | 'line-dot' }> = [
    { id: 'bars', label: chart.barLabel, role: 'idle', mark: 'bar' },
    ...chart.lines.map((l) => ({ id: l.id, label: l.label, role: l.role, mark: l.noLine ? ('dot' as const) : l.dashed ? ('dashed' as const) : l.dots ? ('line-dot' as const) : ('line' as const) })),
  ];
  let keyX = PL;
  const keys = keyItems.map((k) => {
    const x = keyX;
    keyX += 28 + k.label.length * 6.2 + 16;
    return { ...k, x };
  });
  // Stable DOM order, so an element copied into the new block is the same node and glides.
  const cells = state.blocks
    .flatMap((b) => b.cells.map((c, k) => ({ c, k, row: b.row })))
    .sort((a, b) => (a.c.key < b.c.key ? -1 : a.c.key > b.c.key ? 1 : 0));

  return (
    <div className="amz-wrap">
      <svg
        className="amz-view"
        viewBox={`0 0 ${width} ${height}`}
        style={{ width, maxWidth: '100%', minWidth: Math.min(width, 460) }}
        role="img"
        aria-label={`${state.blocks.map((b) => `${b.label}: ${b.cells.map((c) => c.value ?? 'empty').join(' ')}`).join('; ')}. ${(state.readouts ?? []).map((r) => `${r.label} ${r.value}`).join(', ')}.`}
      >
        <text className="amz-readouts" x={PAD} y={11}>
          {(state.readouts ?? []).map((r, i) => (
            <tspan key={r.label} className={r.role ? `role-${r.role} amz-strong` : undefined} dx={i === 0 ? 0 : 14}>
              {`${r.label} ${r.value}`}
            </tspan>
          ))}
        </text>
        {state.blocks.map((b) => (
          <g key={b.id} className={`amz-block role-${b.role ?? 'idle'}`} style={{ transform: `translate(0px, ${cellY(b.row)}px)` }}>
            <text className="amz-label" x={LABEL_W - 10} y={CH / 2 - 6}>
              {b.label}
            </text>
            {b.sub && (
              <text className="amz-sub" x={LABEL_W - 10} y={CH / 2 + 8}>
                {b.sub}
              </text>
            )}
            {b.cells.length === 0 && (
              <text className="amz-sub" x={LABEL_W} y={CH / 2} style={{ textAnchor: 'start' }}>
                no slots
              </text>
            )}
            {b.cells.map((_, k) => (
              <text key={`i${k}`} className="amz-index" x={LABEL_W + k * STEP + CW / 2} y={CH + 10}>
                {b.indexLabels?.[k] ?? k}
              </text>
            ))}
            {b.cells.map((c, k) =>
              c.value === null ? <rect key={`slot${k}`} className="amz-slot" x={LABEL_W + k * STEP} y={0} width={CW} height={CH} rx={5} /> : null,
            )}
          </g>
        ))}
        {cells
          .filter(({ c }) => c.value !== null)
          .map(({ c, k, row }) => {
            const coins = c.coins ?? 0;
            const fresh = c.newCoins ?? 0;
            const shown = Math.min(coins, MAX_COINS);
            return (
              <g key={c.key} className={`amz-cell role-${c.role ?? 'idle'}`} style={{ transform: `translate(${LABEL_W + k * STEP}px, ${cellY(row)}px)` }}>
                <rect width={CW} height={CH} rx={5} />
                <text x={CW / 2} y={CH / 2}>
                  {c.value}
                </text>
                {state.coins &&
                  Array.from({ length: shown }, (_, j) => (
                    <circle key={`c${j}`} className={`amz-coin${j >= coins - fresh ? ' fresh' : ''}`} cx={CW / 2} cy={-6 - j * 7} r={4.2} />
                  ))}
                {state.coins && coins > MAX_COINS && (
                  <text className="amz-coin-more" x={CW / 2} y={-6 - MAX_COINS * 7}>
                    +{coins - MAX_COINS}
                  </text>
                )}
                {state.coins &&
                  Array.from({ length: c.spentCoins ?? 0 }, (_, j) => (
                    <circle key={`s${j}`} className="amz-coin spent" cx={CW / 2 + 9} cy={-6 - (shown + j) * 7} r={4.2} />
                  ))}
              </g>
            );
          })}
        <text className="amz-chart-title" x={PL} y={chartTop - 30}>
          {chart.title}
        </text>
        {keys.map((k) => (
          <g key={`k${k.id}`} className={`amz-key role-${k.role}`} transform={`translate(${k.x}, ${chartTop - 12})`}>
            {k.mark === 'bar' && <rect className="amz-bar" x={6} y={-6} width={10} height={11} />}
            {(k.mark === 'line' || k.mark === 'line-dot' || k.mark === 'dashed') && <line className={k.mark === 'dashed' ? 'dashed' : undefined} x1={0} x2={22} y1={0} y2={0} />}
            {(k.mark === 'dot' || k.mark === 'line-dot') && <circle cx={11} cy={0} r={3} />}
            <text x={28} y={0}>
              {k.label}
            </text>
          </g>
        ))}
        <rect className="amz-plot" x={PL} y={chartTop} width={plotW} height={PLOT_H} />
        {yTicks(e.yMin, e.yMax).map((t) => (
          <g key={`y${t}`}>
            <line className={`amz-grid${t === 0 ? ' zero' : ''}`} x1={PL} x2={PL + plotW} y1={ys(t)} y2={ys(t)} />
            <text className="amz-tick y" x={PL - 5} y={ys(t)}>
              {t}
            </text>
          </g>
        ))}
        {chart.bars.map((b) => (
          <rect
            key={`b${b.x}`}
            className={`amz-bar role-${b.role ?? 'idle'}`}
            x={xs(b.x) - barW / 2}
            y={ys(Math.max(0, b.value))}
            width={barW}
            height={Math.max(0, ys(0) - ys(Math.max(0, b.value)))}
          />
        ))}
        {chart.lines.map((l) => (
          <g key={l.id} className={`amz-line role-${l.role}`}>
            {!l.noLine && l.points.length > 1 && (
              <polyline className={l.dashed ? 'dashed' : undefined} points={l.points.map(([x, y]) => `${xs(x).toFixed(1)},${ys(y).toFixed(1)}`).join(' ')} />
            )}
            {l.dots && l.points.filter(([x]) => Number.isInteger(x)).map(([x, y]) => <circle key={`${x}`} cx={xs(x)} cy={ys(y)} r={2.8} />)}
          </g>
        ))}
        {Array.from({ length: chart.xMax }, (_, k) => k + 1)
          .filter((x) => chart.xMax <= 12 || x % (chart.xMax <= 24 ? 2 : 5) === 0 || x === 1)
          .map((x) => (
            <text key={`x${x}`} className="amz-tick" x={xs(x)} y={chartTop + PLOT_H + 11}>
              {x}
            </text>
          ))}
        <text className="amz-axis" x={PL + plotW / 2} y={height - 6}>
          {chart.xLabel}
        </text>
      </svg>
    </div>
  );
}
