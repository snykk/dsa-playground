/**
 * Coordinate compression tracers.
 *
 * Mirrors Problem_Patterns/Coordinate_Compression/Python/coordinate_compression.py:
 *   compress_coordinates: sorted(set(coords)), then {coord: idx for idx, coord in enumerate(...)}
 *     (dense ranks 0..k-1; duplicates share one rank; the dict is in sorted order);
 *   decompress_coordinates: the reverse dict read for i in range(len(...)), i.e. the values by rank;
 *   compress_2d_coordinates: x and y compressed separately into two mappings.
 * The 1D view (PatternLanes) also shows [mapping[c] for c in coords], the use the tests make of
 * the mapping; the 2D view (CompressionPlane) moves every point from its original coordinates
 * to (x rank, y rank). Golden fixtures (__fixtures__/patternsMore.json, sections "compress" and
 * "compress2d") pin the mappings in dict order, the ranks and the decompressed lists.
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { CompressionPlaneState, PlanePointView } from '../renderers/CompressionPlane';
import type { LaneArrow, LaneCellView, PatternLanesState } from '../renderers/PatternLanes';
import type { StripItem } from '../ui/molecules/Strip';

export const COMPRESS_LIMITS = { maxValues: 12, maxPoints: 8, maxAbs: 1e9 };

function parseValue(t: string): number {
  if (!/^-?\d+$/.test(t)) throw new InputError(`"${t}" is not a whole number.`);
  const v = Number(t) || 0;
  if (Math.abs(v) > COMPRESS_LIMITS.maxAbs) throw new InputError(`Values go from -10^9 to 10^9 here (got ${t}).`);
  return v;
}

export function parseCompress(text: string): number[] {
  const tokens = text.split(/[\s,;]+/).filter(Boolean);
  if (tokens.length > COMPRESS_LIMITS.maxValues) throw new InputError(`At most ${COMPRESS_LIMITS.maxValues} values, so every lane fits on screen (got ${tokens.length}).`);
  return tokens.map(parseValue);
}

export function parsePoints(text: string): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  const re = /\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/g;
  let rest = text;
  for (const m of text.matchAll(re)) {
    pts.push([parseValue(m[1]), parseValue(m[2])]);
    rest = rest.replace(m[0], '');
  }
  if (rest.replace(/[\s,;]/g, '') !== '') throw new InputError('Write points as (x, y), separated by commas: "(1000, 500), (5, 10), (200, 300)".');
  if (pts.length === 0) throw new InputError('Give at least one point, as in "(1000, 500)".');
  if (pts.length > COMPRESS_LIMITS.maxPoints) throw new InputError(`At most ${COMPRESS_LIMITS.maxPoints} points, please (got ${pts.length}).`);
  return pts;
}

/** Python's compress_coordinates: the mapping as [value, rank] pairs in dict (sorted) order. */
export function compressCoordinates(coords: number[]): Array<[number, number]> {
  const sorted = [...new Set(coords)].sort((a, b) => a - b);
  return sorted.map((v, i) => [v, i]);
}

/** Python's decompress_coordinates on such a mapping: the values by rank. */
export function decompressCoordinates(mapping: Array<[number, number]>): number[] {
  const reverse = new Map(mapping.map(([k, v]) => [v, k]));
  return Array.from({ length: reverse.size }, (_, i) => reverse.get(i)!);
}

const fmt = (v: number) => String(v);
const dict = (pairs: Array<[number, number]>) => `{${pairs.map(([k, v]) => `${k}: ${v}`).join(', ')}}`;

/* ---------- 1D ---------- */

export const COMPRESS_CODE = [
  'compress_coordinates(coords):',
  '  sorted_coords = sorted(set(coords))     # set() drops duplicates, sorted() orders them',
  '  mapping = {coord: idx for idx, coord in enumerate(sorted_coords)}',
  '  return mapping',
  'ranks = [mapping[c] for c in coords]       # how the mapping is used',
  'decompress_coordinates(mapping):',
  '  reverse_mapping = {v: k for k, v in mapping.items()}',
  '  return [reverse_mapping[i] for i in range(len(reverse_mapping))]',
];

export interface CompressRun {
  frames: Array<Frame<PatternLanesState>>;
  mapping: Array<[number, number]>;
  ranks: number[];
  decompressed: number[];
}

export function compressTrace(coords: number[]): CompressRun {
  const frames: Array<Frame<PatternLanesState>> = [];
  const n = coords.length;
  const mapping = compressCoordinates(coords);
  const rankOf = new Map(mapping);
  const sorted = mapping.map(([v]) => v);
  const firstIndex = new Map<number, number>();
  coords.forEach((v, i) => {
    if (!firstIndex.has(v)) firstIndex.set(v, i);
  });

  // What is drawn so far.
  let stage: 'start' | 'set' | 'sorted' = 'start';
  let built = 0; // mapping entries shown
  let ranked = 0; // ranks shown
  let decompressed = false;

  const snap = (line: number | undefined, caption: string, o: { roles?: Record<string, Role>; arrows?: LaneArrow[]; headerRoles?: Record<number, Role>; vars?: Array<[string, string | number]> } = {}) => {
    const cells: LaneCellView[] = [];
    coords.forEach((v, i) => {
      const moved = stage === 'sorted' && firstIndex.get(v) === i;
      const dup = stage !== 'start' && firstIndex.get(v) !== i;
      // The first copy of each value moves down into its rank slot; the coords lane keeps a fresh copy.
      cells.push({ id: moved ? `o${i}` : `v${i}`, lane: 0, col: i, text: fmt(v), role: o.roles?.[`c${i}`], ghost: dup && stage === 'set' });
    });
    if (stage === 'sorted') {
      sorted.forEach((v, k) => cells.push({ id: `v${firstIndex.get(v)}`, lane: 1, col: k, text: fmt(v), role: o.roles?.[`s${k}`] }));
    }
    for (let i = 0; i < ranked; i++) cells.push({ id: `r${i}`, lane: 2, col: i, text: String(rankOf.get(coords[i])), role: o.roles?.[`r${i}`] });
    if (decompressed) sorted.forEach((v, k) => cells.push({ id: `d${k}`, lane: 3, col: k, text: fmt(v), role: o.roles?.[`d${k}`] }));
    const shownMap: StripItem[] = mapping.slice(0, built).map(([v, k], idx) => ({ text: `${v}: ${k}`, role: idx === built - 1 && stage === 'sorted' && ranked === 0 ? 'active' : undefined }));
    frames.push({
      line,
      caption,
      vars: o.vars,
      state: {
        label: `coords [${coords.join(', ')}], sorted distinct [${sorted.join(', ')}]`,
        lanes: [
          { label: 'coords', sub: 'index i', header: coords.map((_, i) => String(i)) },
          { label: 'sorted_coords', sub: 'rank', header: stage === 'sorted' && built > 0 ? sorted.map((_, k) => (k < built ? String(k) : '')) : undefined, headerRoles: o.headerRoles },
          { label: 'ranks', sub: 'mapping[c]' },
          { label: 'decompressed', sub: 'by rank' },
        ],
        cells,
        arrows: o.arrows,
        strips: [{ label: 'mapping', items: built ? shownMap : [{ text: '{}' }] }],
      },
    });
  };

  const span = n ? `${Math.min(...coords)}..${Math.max(...coords)}` : 'empty';
  snap(0, n ? `compress_coordinates(${n} values spanning ${span}). Only their order matters, so each value can be replaced by its rank among the distinct values.` : 'compress_coordinates([]): no values, so the mapping will be empty.', {
    vars: [['n', n]],
  });

  stage = 'set';
  const dups = coords.map((v, i) => (firstIndex.get(v) !== i ? i : -1)).filter((i) => i >= 0);
  snap(
    1,
    dups.length
      ? `set(coords) keeps one copy of each value: ${dups.map((i) => `${coords[i]} at index ${i}`).join(', ')} ${dups.length === 1 ? 'is a repeat' : 'are repeats'}, so ${sorted.length} distinct values remain.`
      : `set(coords): all ${n} values are distinct, so nothing is dropped.`,
    { roles: Object.fromEntries(dups.map((i) => [`c${i}`, 'muted' as Role])), vars: [['distinct', sorted.length]] },
  );

  stage = 'sorted';
  snap(
    1,
    n
      ? `sorted() puts the ${sorted.length} distinct values in increasing order: [${sorted.join(', ')}]. Each value's position in this list will be its rank.`
      : 'sorted(set([])) is [], so there is nothing to rank.',
    {
      roles: Object.fromEntries(sorted.map((_, k) => [`s${k}`, 'active' as Role])),
      arrows: [],
      vars: [['k', sorted.length]],
    },
  );

  sorted.forEach((v, k) => {
    built = k + 1;
    snap(2, `enumerate gives ${v} the index ${k}: mapping[${v}] = ${k}.${k === 0 ? ' The smallest value gets rank 0.' : ` ${k} distinct value${k === 1 ? ' is' : 's are'} smaller than ${v}.`}`, {
      roles: { [`s${k}`]: 'active' },
      headerRoles: { [k]: 'active' },
      vars: [['coord', v], ['idx', k]],
    });
  });
  snap(3, `return mapping = ${dict(mapping)}: ${sorted.length} ranks for ${n} values${n ? `, a range of ${sorted.length} instead of ${span}` : ''}.`, { vars: [['len(mapping)', sorted.length]] });

  coords.forEach((v, i) => {
    ranked = i + 1;
    const k = rankOf.get(v)!;
    snap(4, `coords[${i}] = ${v}: mapping[${v}] = ${k}.${firstIndex.get(v) !== i ? ' A repeat gets the same rank as its first copy.' : ''}`, {
      roles: { [`c${i}`]: 'compare', [`s${k}`]: 'compare', [`r${i}`]: 'active' },
      arrows: [{ from: `v${firstIndex.get(v)}`, to: `r${i}`, role: 'active', label: `rank ${k}` }],
      vars: [['i', i], ['rank', k]],
    });
  });
  if (n) {
    snap(4, `ranks = [${coords.map((v) => rankOf.get(v)).join(', ')}]. For any two values, a < b exactly when rank(a) < rank(b), and equal values share a rank: the order survived, the gaps did not.`, {
      roles: Object.fromEntries(coords.map((_, i) => [`r${i}`, 'done' as Role])),
    });
  }

  decompressed = true;
  const back = decompressCoordinates(mapping);
  snap(
    7,
    n
      ? `decompress_coordinates(mapping) flips the dict to rank -> value and reads ranks 0..${sorted.length - 1}: [${back.join(', ')}]. Index = rank, so any rank translates back to its original value.`
      : 'decompress_coordinates({}) returns []: there are no ranks to read.',
    {
      // No arrow: one from sorted_coords down to decompressed would cross the ranks lane.
      roles: Object.fromEntries(back.flatMap((_, k) => [[`d${k}`, 'done' as Role], [`s${k}`, 'compare' as Role]])),
    },
  );
  return { frames, mapping, ranks: coords.map((v) => rankOf.get(v)!), decompressed: back };
}

/* ---------- 2D ---------- */

export const COMPRESS_2D_CODE = [
  'compress_2d_coordinates(points):',
  '  x_coords = [p[0] for p in points]; y_coords = [p[1] for p in points]',
  '  x_mapping = compress_coordinates(x_coords)   # x and y separately',
  '  y_mapping = compress_coordinates(y_coords)',
  '  return x_mapping, y_mapping',
  '# use: (x, y) -> (x_mapping[x], y_mapping[y])',
];

export interface Compress2dRun {
  frames: Array<Frame<CompressionPlaneState>>;
  x: Array<[number, number]>;
  y: Array<[number, number]>;
}

export function compress2dTrace(points: Array<[number, number]>): Compress2dRun {
  const frames: Array<Frame<CompressionPlaneState>> = [];
  const xMap = compressCoordinates(points.map((p) => p[0]));
  const yMap = compressCoordinates(points.map((p) => p[1]));
  const xr = new Map(xMap);
  const yr = new Map(yMap);
  let xMode: 'value' | 'rank' = 'value';
  let yMode: 'value' | 'rank' = 'value';
  let showX = false;
  let showY = false;

  const snap = (line: number | undefined, caption: string, o: { roles?: Record<number, Role>; xRole?: Role; yRole?: Role; labels?: 'value' | 'rank'; vars?: Array<[string, string | number]> } = {}) => {
    const pts: PlanePointView[] = points.map(([x, y], i) => ({
      id: `p${i}`,
      x,
      y,
      label: o.labels === 'rank' ? `(${xr.get(x)}, ${yr.get(y)})` : `(${x}, ${y})`,
      role: o.roles?.[i],
    }));
    frames.push({
      line,
      caption,
      vars: o.vars,
      state: {
        label: `points ${points.map(([x, y]) => `(${x}, ${y})`).join(', ')}`,
        points: pts,
        xAxis: { mode: xMode, values: xMap.map(([v]) => v), role: o.xRole },
        yAxis: { mode: yMode, values: yMap.map(([v]) => v), role: o.yRole },
        strips: [
          { label: 'x_mapping', items: showX ? [{ text: dict(xMap), role: o.xRole === 'active' ? 'active' : undefined }] : [{ text: '-' }] },
          { label: 'y_mapping', items: showY ? [{ text: dict(yMap), role: o.yRole === 'active' ? 'active' : undefined }] : [{ text: '-' }] },
        ],
      },
    });
  };

  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  snap(0, `${points.length} point${points.length === 1 ? '' : 's'} at their real coordinates: x spans ${Math.min(...xs)}..${Math.max(...xs)} and y spans ${Math.min(...ys)}..${Math.max(...ys)}, so a grid over them would be huge and nearly empty.`);
  snap(1, `x_coords = [${xs.join(', ')}] and y_coords = [${ys.join(', ')}]: the two axes are compressed on their own.`, { xRole: 'compare', yRole: 'compare' });
  xMode = 'rank';
  showX = true;
  snap(2, `x_mapping = compress_coordinates(x_coords) = ${dict(xMap)}. The points slide sideways onto ${xMap.length} evenly spaced columns, keeping their left-to-right order.`, {
    xRole: 'active',
    vars: [['distinct x', xMap.length]],
  });
  yMode = 'rank';
  showY = true;
  snap(3, `y_mapping = compress_coordinates(y_coords) = ${dict(yMap)}. Now they slide onto ${yMap.length} rows: the plane became a ${xMap.length} x ${yMap.length} grid.`, {
    yRole: 'active',
    vars: [['distinct y', yMap.length]],
  });
  points.forEach(([x, y], i) => {
    snap(5, `(${x}, ${y}) -> (x_mapping[${x}], y_mapping[${y}]) = (${xr.get(x)}, ${yr.get(y)}).`, { roles: { [i]: 'active' }, labels: 'rank', vars: [['point', i]] });
  });
  snap(4, `Done: return x_mapping, y_mapping. ${points.length} point${points.length === 1 ? '' : 's'} now index a ${xMap.length} x ${yMap.length} grid; points that share an x share a column, and the same for y.`, {
    roles: Object.fromEntries(points.map((_, i) => [i, 'done' as Role])),
    labels: 'rank',
  });
  return { frames, x: xMap, y: yMap };
}
