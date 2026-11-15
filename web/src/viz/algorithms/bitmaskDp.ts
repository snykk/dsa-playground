/**
 * Bitmask DP tracer: the Traveling Salesman Problem over subsets, drawn with DpTableView.
 *
 * Mirrors Algorithms/Dynamic_Programming/Advanced_DP/Bitmask_DP/Python/bitmask_dp.py:
 * traveling_salesman_dp(distances). dp[mask][last] is the cheapest path that starts at city 0,
 * visits exactly the cities of mask and stands at last. The loops run in the code's order
 * (mask ascending, then last, then next_city, each ascending); masks without city 0 are skipped,
 * an unreachable state (inf) is still extended but inf + d stays inf, and the answer closes the
 * tour with the edge back to city 0. No cities returns 0; no tour returns float('inf').
 * Golden fixtures (__fixtures__/advancedDp.json) pin every cell of the Python table and the result.
 *
 * Input: the distance matrix, one row per city: "0 10 15 20; 10 0 35 25; ..." ("inf" or "x" = no edge).
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { DpTableState, DtCell, DtChip, DtTable } from '../renderers/DpTableView';
import { SYM } from '../ui/symbols';

export interface TspInput {
  /** distances[i][j]; Infinity for a missing edge. */
  dist: number[][];
}

export const TSP_LIMITS = { maxCities: 6, lo: -99, hi: 999 };

/** City i is a letter: A is city 0, the start of every tour. */
export const cityName = (i: number) => String.fromCharCode(65 + i);

/** A number as Python prints it, with inf as "inf". */
export const pyNum = (v: number) => (v === Infinity ? 'inf' : v === -Infinity ? '-inf' : String(v));

/** The mask as n binary digits, city n-1 on the left (as the article writes it). */
export const maskBits = (mask: number, n: number) => mask.toString(2).padStart(n, '0');

/** "{A, C}" */
export const maskSet = (mask: number, n: number) =>
  `{${Array.from({ length: n }, (_, i) => i)
    .filter((i) => mask & (1 << i))
    .map(cityName)
    .join(', ')}}`;

/**
 * Parse a square distance matrix: rows separated by ";", "|" or new lines, or a Python list
 * "[[0, 1], [1, 0]]". "inf", "x" or "-" is a missing edge. "[]" is the empty matrix (no cities).
 */
export function parseTsp(text: string): TspInput {
  const t = text.trim();
  if (/^(\[\s*\]|empty|none)$/i.test(t)) return { dist: [] };
  const rows = (t.startsWith('[') ? [...t.matchAll(/\[([^[\]]*)\]/g)].map((m) => m[1]) : t.split(/[;|\n]/)).map((r) => r.trim()).filter(Boolean);
  if (rows.length === 0) throw new InputError('Enter the distance matrix, one row per city, for example "0 10 15; 10 0 35; 15 35 0". Write [] for no cities.');
  if (rows.length > TSP_LIMITS.maxCities) {
    throw new InputError(`At most ${TSP_LIMITS.maxCities} cities, so the ${1 << (TSP_LIMITS.maxCities - 1)} masks that contain city A fit on screen (got ${rows.length}).`);
  }
  const n = rows.length;
  const dist = rows.map((row, i) => {
    const tokens = row.split(/[\s,]+/).filter(Boolean);
    if (tokens.length !== n) throw new InputError(`Row ${i + 1} has ${tokens.length} entr${tokens.length === 1 ? 'y' : 'ies'}, but a matrix for ${n} cities needs ${n} per row.`);
    return tokens.map((tok) => {
      if (/^(inf|x|-)$/i.test(tok) || tok === "float('inf')") return Infinity;
      if (!/^-?\d+$/.test(tok)) throw new InputError(`"${tok}" is not a distance: use a whole number, or "inf" for a missing edge.`);
      const v = Number(tok) || 0;
      if (v < TSP_LIMITS.lo || v > TSP_LIMITS.hi) throw new InputError(`Distances go from ${TSP_LIMITS.lo} to ${TSP_LIMITS.hi} (got ${tok}).`);
      return v;
    });
  });
  return { dist };
}

export function formatTsp(input: TspInput): string {
  return input.dist.length === 0 ? '[]' : input.dist.map((r) => r.map(pyNum).join(' ')).join('; ');
}

export const TSP_CODE = [
  'traveling_salesman_dp(distances):',
  '  n = len(distances); if n == 0: return 0',
  '  dp = [[inf] * n for _ in range(1 << n)]; dp[1][0] = 0   # start at city 0',
  '  for mask in range(1, 1 << n):',
  '    if not (mask & 1): continue              # every tour starts at city 0',
  '    for last in range(n):',
  '      if not (mask & (1 << last)): continue',
  '      for next_city in range(n):',
  '        if mask & (1 << next_city): continue',
  '        new_mask = mask | (1 << next_city)',
  '        dp[new_mask][next_city] = min(dp[new_mask][next_city], dp[mask][last] + distances[last][next_city])',
  '  result = inf',
  '  for last in range(n):',
  '    result = min(result, dp[(1 << n) - 1][last] + distances[last][0])',
  '  return result',
];

export interface TspRun {
  frames: Array<Frame<DpTableState>>;
  /** The whole table, 2^n rows (masks without city 0 included), as Python leaves it. */
  dp: number[][];
  result: number;
}

/** Rows of the drawn table: the masks that contain city 0, in loop order; 16 per block. */
const BLOCK = 16;

export function tspTrace({ dist }: TspInput): TspRun {
  const n = dist.length;
  const frames: Array<Frame<DpTableState>> = [];
  if (n === 0) {
    frames.push({
      line: 1,
      caption: 'len(distances) == 0: there are no cities, so there is nothing to visit and the function returns 0 before building a table.',
      vars: [
        ['n', 0],
        ['result', 0],
      ],
      state: { label: 'No cities: an empty distance matrix', tables: [], chips: [], note: 'distances = []  ->  return 0' },
    });
    return { frames, dp: [], result: 0 };
  }
  const full = (1 << n) - 1;
  const dp: number[][] = Array.from({ length: 1 << n }, () => Array.from({ length: n }, () => Infinity));
  dp[1][0] = 0;
  const rows = Array.from({ length: 1 << (n - 1) }, (_, k) => 2 * k + 1);

  interface Look {
    mask?: number;
    cells?: Record<string, Role>; // "mask,city"
    dist?: Record<string, Role>; // "from,to"
    chips?: Record<number, Role>; // city -> role (overrides the mask bit)
    rowRole?: Record<number, Role>; // mask -> role
  }
  const cellText = (v: number): DtCell => (v === Infinity ? { text: SYM.infinity, role: 'muted' } : { text: String(v) });

  const snap = (line: number | undefined, caption: string, look: Look, vars: Array<[string, string | number]>) => {
    const tables: DtTable[] = [];
    for (let b = 0; b * BLOCK < rows.length; b++) {
      const masks = rows.slice(b * BLOCK, (b + 1) * BLOCK);
      const rowRoles: Record<number, Role> = {};
      masks.forEach((m, r) => {
        const role = look.rowRole?.[m] ?? (m === look.mask ? 'compare' : undefined);
        if (role) rowRoles[r] = role;
      });
      tables.push({
        id: `dp${b}`,
        title: b === 0 ? 'dp[mask][last]' : 'dp[mask][last], continued',
        corner: 'mask',
        rowHeaders: masks.map((m) => maskBits(m, n)),
        colHeaders: Array.from({ length: n }, (_, c) => cityName(c)),
        cells: masks.map((m) =>
          dp[m].map((v, c) => {
            const role = look.cells?.[`${m},${c}`];
            const base = cellText(v);
            return role ? { text: base.text, role } : base;
          }),
        ),
        rowRoles,
        cellW: 34,
      });
    }
    tables.push({
      id: 'dist',
      title: 'distances[from][to]',
      corner: 'from',
      rowHeaders: Array.from({ length: n }, (_, r) => cityName(r)),
      colHeaders: Array.from({ length: n }, (_, c) => cityName(c)),
      cells: dist.map((row, r) =>
        row.map((v, c) => {
          const role = look.dist?.[`${r},${c}`];
          return { text: v === Infinity ? SYM.infinity : String(v), role: role ?? (v === Infinity ? 'muted' : undefined) };
        }),
      ),
      cellW: 32,
    });
    const chips: DtChip[] = [];
    for (let c = n - 1; c >= 0; c--) {
      const inMask = look.mask !== undefined && (look.mask & (1 << c)) !== 0;
      chips.push({
        text: look.mask === undefined ? SYM.middot : inMask ? '1' : '0',
        sub: cityName(c),
        role: look.chips?.[c] ?? (look.mask === undefined ? 'idle' : inMask ? 'done' : 'muted'),
      });
    }
    frames.push({
      line,
      caption,
      vars,
      state: {
        label: `Bitmask DP table for ${n} cities`,
        chips: [{ label: 'mask', chips }],
        tables,
      },
    });
  };

  const D = (a: number, b: number) => `distances[${cityName(a)}][${cityName(b)}]`;
  const C = (m: number, c: number) => `dp[${maskBits(m, n)}][${cityName(c)}]`;

  snap(
    2,
    `dp has a row for each of the ${1 << n} masks and a column for each last city, all inf. dp[1][0] = 0: the path that has visited only A and stands at A costs nothing. ` +
      (n > 1
        ? `Only the ${rows.length} masks that contain A are drawn, because the loop skips every other mask (every tour starts at A).`
        : 'With one city, mask 1 is also the full mask.'),
    { mask: 1, cells: { '1,0': 'active' } },
    [
      ['n', n],
      ['masks', 1 << n],
    ],
  );

  for (let mask = 1; mask <= full; mask++) {
    if (!(mask & 1)) continue;
    const members = Array.from({ length: n }, (_, i) => i).filter((i) => mask & (1 << i));
    const missing = n - members.length;
    snap(
      3,
      `mask = ${maskBits(mask, n)} = ${maskSet(mask, n)}: ` +
        (missing === 0
          ? 'every city is in the mask, so no next city can be added and the loops do nothing. This row is only read when the tour closes.'
          : `extend each path over exactly these ${members.length} cit${members.length === 1 ? 'y' : 'ies'} by one of the ${missing} cit${missing === 1 ? 'y' : 'ies'} not in it. A transition sets a 0 bit to 1, so it always writes a larger mask, and ascending mask order finishes every row before it is read.`),
      { mask },
      [['mask', `${maskBits(mask, n)} ${maskSet(mask, n)}`]],
    );
    if (missing === 0) continue;
    for (const last of members) {
      const cur = dp[mask][last];
      const baseVars: Array<[string, string | number]> = [
        ['mask', `${maskBits(mask, n)} ${maskSet(mask, n)}`],
        ['last', cityName(last)],
        [`dp[mask][last]`, pyNum(cur)],
      ];
      if (cur === Infinity) {
        snap(
          10,
          `${C(mask, last)} = inf: no path over ${maskSet(mask, n)} ends at ${cityName(last)}` +
            (last === 0 ? ' (a path leaves A at the start and never comes back to it before the tour closes)' : ' (every way into it uses a missing edge)') +
            '. The loop over next_city still runs, but inf + distance is inf, so min() changes nothing.',
          { mask, cells: { [`${mask},${last}`]: 'compare' }, chips: { [last]: 'compare' } },
          baseVars,
        );
        continue;
      }
      for (let next = 0; next < n; next++) {
        if (mask & (1 << next)) continue;
        const nm = mask | (1 << next);
        const d = dist[last][next];
        const cand = cur + d;
        const before = dp[nm][next];
        const better = cand < before;
        if (better) dp[nm][next] = cand;
        const sum = d === Infinity ? `${cur} + inf = inf (no edge from ${cityName(last)} to ${cityName(next)})` : `${cur} + ${d} = ${cand}`;
        snap(
          10,
          `From ${cityName(last)} go to ${cityName(next)}: ${C(mask, last)} + ${D(last, next)} = ${sum}. ` +
            (better
              ? `That is below ${pyNum(before)}, so ${C(nm, next)} becomes ${cand}: the cheapest way found so far to cover ${maskSet(nm, n)} and stand at ${cityName(next)}.`
              : `That is not below ${pyNum(before)}, so ${C(nm, next)} keeps ${pyNum(before)}${before === cand && cand !== Infinity ? ' (a tie: min() keeps the value it has)' : ''}.`),
          {
            mask,
            cells: { [`${mask},${last}`]: 'compare', [`${nm},${next}`]: 'active' },
            dist: { [`${last},${next}`]: 'compare' },
            chips: { [last]: 'compare', [next]: 'active' },
            rowRole: { [mask]: 'compare', [nm]: 'active' },
          },
          [...baseVars, ['next_city', cityName(next)], ['new_mask', `${maskBits(nm, n)} ${maskSet(nm, n)}`], ['candidate', pyNum(cand)]],
        );
      }
    }
  }

  let result = Infinity;
  const closing: Array<{ last: number; value: number }> = [];
  for (let last = 0; last < n; last++) {
    const v = dp[full][last];
    const d = dist[last][0];
    const cand = v + d;
    const before = result;
    if (cand < result) result = cand;
    closing.push({ last, value: cand });
    const sum = v === Infinity ? 'inf + ... = inf' : d === Infinity ? `${v} + inf = inf (no edge back to A)` : `${v} + ${d} = ${cand}`;
    snap(
      13,
      `Close the tour from ${cityName(last)}: ${C(full, last)} + ${D(last, 0)} = ${sum}. ` +
        (cand < before ? `Below ${pyNum(before)}, so result = ${cand}.` : `Not below ${pyNum(before)}, so result stays ${pyNum(before)}.`) +
        (last === 0 && n > 1 ? ' (Standing at A with every city visited is impossible, so this candidate is inf.)' : ''),
      { mask: full, cells: { [`${full},${last}`]: 'compare' }, dist: { [`${last},0`]: 'compare' }, chips: { [last]: 'compare' }, rowRole: { [full]: 'compare' } },
      [
        ['last', cityName(last)],
        ['candidate', pyNum(cand)],
        ['result', pyNum(result)],
      ],
    );
  }

  const winners: Record<string, Role> = {};
  const winDist: Record<string, Role> = {};
  if (result !== Infinity) {
    for (const c of closing) {
      if (c.value === result) {
        winners[`${full},${c.last}`] = 'done';
        winDist[`${c.last},0`] = 'done';
      }
    }
  }
  const ties = Object.keys(winners).length;
  snap(
    14,
    result === Infinity
      ? `Every closing candidate is inf: no tour visits all ${n} cities and returns to A without a missing edge. The function returns float('inf'), not 0, so "no tour" cannot be mistaken for a free one.`
      : `return ${result}: the cheapest tour that starts at A, visits every city once and comes back.` +
          (ties > 1 ? ` ${ties} last cities tie, because a tour and its reverse cost the same when the matrix is symmetric.` : ''),
    {
      mask: full,
      cells: result === Infinity ? Object.fromEntries(closing.map((c) => [`${full},${c.last}`, 'bad' as Role])) : winners,
      dist: winDist,
      rowRole: { [full]: result === Infinity ? 'bad' : 'done' },
    },
    [['result', pyNum(result)]],
  );
  return { frames, dp, result };
}

/** Brute force over every ordering of the cities after A (for the tests). */
export function tspBrute(dist: number[][]): number {
  const n = dist.length;
  if (n === 0) return 0;
  if (n === 1) return dist[0][0] + 0;
  let best = Infinity;
  const rest = Array.from({ length: n - 1 }, (_, i) => i + 1);
  const permute = (k: number) => {
    if (k === rest.length) {
      let cost = 0;
      let at = 0;
      for (const c of rest) {
        cost += dist[at][c];
        at = c;
      }
      cost += dist[at][0];
      if (cost < best) best = cost;
      return;
    }
    for (let i = k; i < rest.length; i++) {
      [rest[k], rest[i]] = [rest[i], rest[k]];
      permute(k + 1);
      [rest[k], rest[i]] = [rest[i], rest[k]];
    }
  };
  permute(0);
  return best;
}
