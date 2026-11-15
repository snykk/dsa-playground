import type { ReservoirState, ResToken } from '../algorithms/reservoir';
import { Strips } from '../ui/molecules/Strip';
import '../ui/roles.css';
import { SYM } from '../ui/symbols';
import './ReservoirView.css';

export type { ReservoirState };

const CELL = 34;
const STEP = 40;
const LEFT = 96; // row labels
const DRAW = 28; // height of a draw cell
const TALLY = 64; // height of the tallest tally bar

interface Rows {
  idx: number;
  stream: number;
  chance: number;
  draw: number;
  res: number;
  slotIdx: number;
  height: number;
}

function rows(state: ReservoirState): Rows {
  const idx = 12;
  const stream = 22;
  const chance = stream + CELL + 14;
  const draw = chance + 26;
  const drawH = (state.layout?.tally ?? state.tally !== null) ? TALLY + 18 : DRAW + 18;
  const res = draw + drawH + 18;
  const slotIdx = res + CELL + 13;
  return { idx, stream, chance, draw, res, slotIdx, height: slotIdx + 8 };
}

const sx = (i: number) => LEFT + i * STEP;

function Token({ token, x, y, extra }: { token: ResToken; x: number; y: number; extra?: string }) {
  return (
    <g className={`rv-token role-${token.role}${extra ? ` ${extra}` : ''}`} style={{ transform: `translate(${x}px, ${y}px)` }}>
      <rect x={0} y={0} width={CELL} height={CELL} rx={6} />
      <text x={CELL / 2} y={CELL / 2}>
        {token.text}
      </text>
    </g>
  );
}

/**
 * Organism for reservoir sampling: the stream with each item's position i, the chance every item
 * read so far has of being in the sample, the draw j = randrange(i) as i cells whose first k are
 * the reservoir's slots, and the k slots themselves. The item being read glides from its stream
 * cell into the slot it wins, and the item it replaces drops out to the right. The closing frame
 * shows how often each item was kept over many runs, against the expected runs * k / n.
 */
export function ReservoirView({ state }: { state: ReservoirState }) {
  const { stream, k, slots, floating, evicted, draw, chance, tally, current, strips } = state;
  const r = rows(state);
  const cols = Math.max(stream.length + (state.layout?.tally ? 2 : 0), k + 2, draw ? draw.i : 0, 4);
  const width = LEFT + cols * STEP + 8;
  const tokens: Array<{ token: ResToken; x: number; y: number; extra?: string }> = [];
  slots.forEach((s, slot) => s && tokens.push({ token: s, x: sx(slot), y: r.res }));
  if (floating) tokens.push({ token: floating, x: sx(floating.id), y: r.stream, extra: 'floating' });
  if (evicted) tokens.push({ token: evicted.token, x: sx(k) + 14, y: r.res + 10, extra: 'evicted' });
  tokens.sort((a, b) => a.token.id - b.token.id); // stable DOM order, so a token glides between rows
  const maxCount = tally ? Math.max(1, ...tally.counts, tally.expected) : 1;
  const tallyY = (c: number) => r.draw + 14 + TALLY - (c / maxCount) * TALLY;
  const label = `Stream ${stream.map((s) => s.text).join(' ')}; reservoir ${slots.map((s) => (s ? s.text : 'empty')).join(', ')}${draw ? `; drew j = ${draw.j} from 0..${draw.i - 1}` : ''}`;

  return (
    <div className="rv-wrap">
      <svg className="reservoir-view" viewBox={`0 0 ${width} ${r.height}`} style={{ width, maxWidth: '100%', minWidth: Math.min(width, 460) }} role="img" aria-label={label}>
        <g className="rv-labels">
          <text x={LEFT - 10} y={r.idx}>
            i
          </text>
          <text x={LEFT - 10} y={r.stream + CELL / 2}>
            stream
          </text>
          <text x={LEFT - 10} y={r.chance}>
            chance kept
          </text>
          {draw && (
            <text x={LEFT - 10} y={r.draw + DRAW / 2}>
              randrange({draw.i})
            </text>
          )}
          {tally && (
            <text x={LEFT - 10} y={r.draw + 14 + TALLY / 2}>
              kept in {tally.runs}
            </text>
          )}
          <text x={LEFT - 10} y={r.res + CELL / 2}>
            reservoir
          </text>
        </g>
        {stream.map((s, i) => (
          <g key={`s${s.id}`}>
            <text className={`rv-index${i === current ? ' is-current' : ''}`} x={sx(i) + CELL / 2} y={r.idx}>
              {i + 1}
            </text>
            <g className={`rv-cell role-${s.role}`}>
              <rect x={sx(i)} y={r.stream} width={CELL} height={CELL} rx={6} />
              <text x={sx(i) + CELL / 2} y={r.stream + CELL / 2}>
                {s.text}
              </text>
            </g>
            {chance[i] && (
              <text className="rv-chance" x={sx(i) + CELL / 2} y={r.chance}>
                {chance[i]}
              </text>
            )}
          </g>
        ))}
        {draw && (
          <g className="rv-draw">
            {Array.from({ length: draw.i }, (_, j) => {
              const hit = j === draw.j;
              const cls = `${j < k ? 'slot-zone' : 'miss-zone'}${hit ? ' hit' : ''}`;
              return (
                <g key={`d${j}`} className={cls}>
                  <rect x={sx(j)} y={r.draw} width={CELL} height={DRAW} rx={5} />
                  <text x={sx(j) + CELL / 2} y={r.draw + DRAW / 2}>
                    {j}
                  </text>
                </g>
              );
            })}
            {draw.j !== null && (
              <g className="rv-j" style={{ transform: `translateX(${sx(draw.j) + CELL / 2}px)` }}>
                <path d={`M0,${r.draw + DRAW + 2}l-5,8h10z`} />
                <text x={0} y={r.draw + DRAW + 18}>
                  j {draw.j < k ? '< k' : '>= k'}
                </text>
              </g>
            )}
          </g>
        )}
        {tally && (
          <g className="rv-tally">
            {tally.counts.map((c, i) => (
              <g key={`t${i}`}>
                <rect x={sx(i) + 3} y={tallyY(c)} width={CELL - 6} height={r.draw + 14 + TALLY - tallyY(c)} rx={3} />
                <text x={sx(i) + CELL / 2} y={r.draw + 14 + TALLY - 9}>
                  {c}
                </text>
              </g>
            ))}
            <line x1={sx(0) - 4} x2={sx(stream.length - 1) + CELL + 4} y1={tallyY(tally.expected)} y2={tallyY(tally.expected)} />
            <text className="rv-expected" x={sx(stream.length - 1) + CELL + 8} y={tallyY(tally.expected)}>
              {Math.round(tally.expected)} expected
            </text>
          </g>
        )}
        {Array.from({ length: k }, (_, s) => (
          <g key={`slot${s}`} className="rv-slot">
            <rect x={sx(s)} y={r.res} width={CELL} height={CELL} rx={6} />
            <text x={sx(s) + CELL / 2} y={r.slotIdx}>
              slot {s}
            </text>
          </g>
        ))}
        {evicted && (
          <text className="rv-out" x={sx(k) + 14 + CELL / 2} y={r.slotIdx + 2}>
            out {SYM.leftArrow} slot {evicted.slot}
          </text>
        )}
        {tokens.map(({ token, x, y, extra }) => (
          <Token key={`tok${token.id}`} token={token} x={x} y={y} extra={extra} />
        ))}
      </svg>
      <Strips strips={strips} />
    </div>
  );
}
