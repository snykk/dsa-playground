/**
 * Divide and Conquer Optimization tracer, drawn with DncLayerView.
 *
 * Mirrors Algorithms/Dynamic_Programming/DP_Optimizations/Divide_and_Conquer_Optimization/Python/
 * divide_and_conquer_optimization.py: partition_dp(n, k, cost, optimized=True) with
 * cost(j, i) = (P[i] - P[j])^2, which is what min_cost_partition runs.
 *   Layer 1: dp[1][i] = cost(0, i).
 *   _solve_range(g, lo, hi, opt_lo, opt_hi): mid = (lo + hi) // 2; _best_split tries j from
 *     max(opt_lo, g - 1) to min(opt_hi, mid - 1) going up and keeps the smallest j with the least
 *     dp[g-1][j] + cost(j, mid); then the left half with (opt_lo, opt[mid]) and the right half
 *     with (opt[mid], opt_hi).
 *   The walk: bounds[k] = n and bounds[g - 1] = opt[g][bounds[g]].
 * min_cost_partition rejects negative values; this player runs them through partition_dp, which
 * does not check, to show the wrong answer when the quadrangle inequality fails.
 * Golden fixtures (__fixtures__/dynamicProgramming.json, section "dncOptimization") pin every
 * call, every solved cell, every cost evaluation, and the answers of the recursion and of the
 * plain DP.
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { DncCall, DncCell, DncSpan, DncState } from '../renderers/DncLayerView';
import type { OkText } from '../renderers/OptimizationKit';

export interface DncInput {
  values: number[];
  k: number;
}

export const DNC_LIMITS = { maxN: 12, maxK: 5, maxAbs: 30 };

export function parseDnc(text: string): DncInput {
  const m = text.match(/^\s*k\s*[=:]?\s*(-?\d+)\s*(?:;(.*))?$/i);
  if (!m) throw new InputError('Start with k, then the values: "k=3; 3 1 4 1 5 9 2 6".');
  const k = Number(m[1]);
  const values: number[] = [];
  for (const raw of (m[2] ?? '').split(/[\s,]+/).filter(Boolean)) {
    if (!/^-?\d+$/.test(raw)) throw new InputError(`"${raw}" is not a whole number.`);
    const v = Number(raw);
    if (Math.abs(v) > DNC_LIMITS.maxAbs) throw new InputError(`Values go from -${DNC_LIMITS.maxAbs} to ${DNC_LIMITS.maxAbs} here, so the costs fit in their cells (got ${v}).`);
    values.push(v);
  }
  if (k < 1) throw new InputError(`k = ${k}: the code raises ValueError for k below 1.`);
  if (values.length === 0) throw new InputError('No values: groups cannot be empty, so the code raises ValueError for an empty list.');
  if (values.length > DNC_LIMITS.maxN) throw new InputError(`At most ${DNC_LIMITS.maxN} values here, so the rows fit on screen (got ${values.length}).`);
  if (k > values.length) throw new InputError(`k = ${k} groups of ${values.length} value${values.length === 1 ? '' : 's'}: groups cannot be empty, so the code raises ValueError for k > n.`);
  if (k > DNC_LIMITS.maxK) throw new InputError(`k goes up to ${DNC_LIMITS.maxK} here (got ${k}).`);
  return { values, k };
}

export const DNC_CODE = [
  'for i in 1..n: dp[1][i] = C(0, i)            # layer 1: one group',
  'for g in 2..k: solve(g, g, n, g - 1, n - 1)',
  'solve(g, lo, hi, opt_lo, opt_hi):',
  '  if lo > hi: return',
  '  mid = (lo + hi) // 2',
  '  for j in max(opt_lo, g-1) .. min(opt_hi, mid-1):   # j going up',
  '    if dp[g-1][j] + C(j, mid) < best: best, opt[g][mid] = it, j',
  '  solve(g, lo, mid - 1, opt_lo, opt[g][mid])   # left: j <= opt(mid)',
  '  solve(g, mid + 1, hi, opt[g][mid], opt_hi)   # right: j >= opt(mid)',
  'bounds[k] = n; bounds[g - 1] = opt[g][bounds[g]] down to g = 2',
];

const L = { layer1: 0, layer: 1, mid: 4, scan: 5, best: 6, left: 7, walk: 9 };

export interface DncRun {
  frames: Array<Frame<DncState>>;
  /** Every call of _solve_range, empty ones too: [g, lo, hi, opt_lo, opt_hi]. */
  calls: number[][];
  /** Every _best_split: [i, j_lo, j_hi, best, best_j]. */
  splits: number[][];
  /** Every cost evaluated, layer 1 included: [j, i, cost]. */
  evaluations: number[][];
  cost: number;
  bounds: number[];
  plainCost: number;
  plainBounds: number[];
}

export const prefixOf = (values: number[]) => values.reduce((p, v) => (p.push(p[p.length - 1] + v), p), [0]);

/** The plain DP of partition_dp(..., optimized=False): every row, every best j, the answer and the bounds. */
export function partitionPlain(values: number[], k: number) {
  const n = values.length;
  const p = prefixOf(values);
  const cost = (j: number, i: number) => (p[i] - p[j]) ** 2;
  const dp: number[][] = [[], p.map((x) => x * x)];
  const opt: number[][] = [[], p.map(() => 0)];
  for (let g = 2; g <= k; g++) {
    dp[g] = p.map(() => 0);
    opt[g] = p.map(() => 0);
    for (let i = g; i <= n; i++) {
      let best = dp[g - 1][g - 1] + cost(g - 1, i);
      let bestJ = g - 1;
      for (let j = g; j <= i - 1; j++) {
        const c = dp[g - 1][j] + cost(j, i);
        if (c < best) [best, bestJ] = [c, j];
      }
      [dp[g][i], opt[g][i]] = [best, bestJ];
    }
  }
  const bounds = Array.from({ length: k + 1 }, () => 0);
  bounds[k] = n;
  for (let g = k; g > 1; g--) bounds[g - 1] = opt[g][bounds[g]];
  return { dp, opt, cost: dp[k][n], bounds };
}

const plural = (count: number, one: string, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;
const sq = (x: number) => (x < 0 ? `(${x})^2` : `${x}^2`);
const range = (a: number, b: number) => (a === b ? `j = ${a}` : `j from ${a} to ${b}`);

export function dncTrace({ values, k }: DncInput): DncRun {
  const n = values.length;
  const p = prefixOf(values);
  const plain = partitionPlain(values, k);
  const frames: Array<Frame<DncState>> = [];
  const calls: number[][] = [];
  const splits: number[][] = [];
  const evaluations: number[][] = [];
  const cost = (j: number, i: number) => {
    const c = (p[i] - p[j]) ** 2;
    evaluations.push([j, i, c]);
    return c;
  };
  const depthRows = k >= 2 ? Math.floor(Math.log2(n - 1)) + 1 : 0;
  const plainTotal = n + Array.from({ length: Math.max(0, k - 1) }, (_, t) => ((n - t - 1) * (n - t)) / 2).reduce((a, b) => a + b, 0);

  // dp[g] and opt[g] as the recursion leaves them; null = not computed.
  const dp: Array<Array<number | null>> = [p.map((_, j) => (j === 0 ? 0 : null))];
  const opt: Array<Array<number | null>> = [p.map(() => null)];
  let g = 1;
  let layerEvals = 0;
  let calls_: DncCall[] = [];

  interface Look {
    curRoles?: Record<number, Role>;
    prevRoles?: Record<number, Role>;
    optRoles?: Record<number, Role>;
    valueRoles?: Record<number, Role>;
    prefixRoles?: Record<number, Role>;
    curText?: Record<number, string>;
    jRange?: DncSpan | null;
    groups?: DncSpan[];
    cuts?: number[];
    arrow?: DncState['arrow'];
    vars?: Array<[string, string | number]>;
    layer?: number;
  }

  const workLines = (): OkText[] => {
    const lines: OkText[] = [];
    if (g >= 2 && g <= k) {
      const m = n - g + 1;
      lines.push({ text: `layer ${g}: ${plural(layerEvals, 'cost evaluation')} so far; trying every j costs ${(m * (m + 1)) / 2}`, role: 'active' });
    } else if (g === 1) {
      lines.push({ text: `layer 1: ${plural(n, 'cost evaluation')}, one per cell` });
    } else {
      lines.push({ text: 'the walk back reads opt and evaluates no cost' });
    }
    lines.push({ text: `all layers: ${plural(evaluations.length, 'cost evaluation')} so far; the plain DP costs ${plainTotal}` });
    return lines;
  };

  const snap = (line: number | undefined, caption: string, o: Look = {}) => {
    const layer = o.layer ?? g;
    const row = (r: Array<number | null> | undefined, roles: Record<number, Role> | undefined, text?: Record<number, string>): Array<DncCell | null> =>
      p.map((_, i) => {
        const v = r?.[i] ?? null;
        if (text?.[i] !== undefined) return { text: text[i], role: roles?.[i] };
        return v === null ? null : { text: String(v), role: roles?.[i] };
      });
    const cur = row(dp[layer], o.curRoles, o.curText).map((c, i) => (c === null && i >= layer && layer <= k ? { text: '', ghost: true } : c));
    frames.push({
      line,
      caption,
      vars: o.vars,
      state: {
        label: `Layer ${layer} of ${k}: dp[${layer}] = [${dp[layer]?.map((v) => v ?? '-').join(', ')}]`,
        title: layer === 1 ? 'layer 1: one group, dp[1][i] = C(0, i) = P[i]^2' : `layer ${layer} of ${k}: dp[${layer}][i] = min over j of dp[${layer - 1}][j] + (P[i] - P[j])^2`,
        n,
        values: values.map((v, t) => ({ text: String(v), role: o.valueRoles?.[t] })),
        prefix: p.map((v, i) => ({ text: String(v), role: o.prefixRoles?.[i] })),
        prevLabel: `dp[${layer - 1}][j]`,
        curLabel: `dp[${layer}][i]`,
        optLabel: `opt[${layer}][i]`,
        prev: row(dp[layer - 1], o.prevRoles),
        cur,
        opt: layer === 1 ? p.map(() => null) : row(opt[layer], o.optRoles),
        jRange: o.jRange ?? null,
        groups: o.groups ?? [],
        cuts: o.cuts ?? [],
        arrow: o.arrow ?? null,
        calls: layer === g ? calls_.map((c) => ({ ...c })) : [],
        depthRows,
        work: workLines(),
        workChars: 1,
      },
    });
  };

  const groupSpan = (j: number, i: number, role: Role = 'compare'): DncSpan => ({ from: j, to: i - 1, text: `sum ${p[i] - p[j]}`, role });

  // Layer 1.
  dp[1] = p.map((_, i) => (i === 0 ? null : 0));
  opt[1] = p.map(() => null);
  for (let i = 1; i <= n; i++) dp[1][i] = cost(0, i);
  snap(
    L.layer1,
    `Layer 1 puts the first i values in one group, so dp[1][i] = C(0, i) = P[i]^2: ${plural(n, 'cost evaluation')}, ${n === 1 ? 'for the one cell' : `one per cell from 1 to ${n}`}. ` +
      (k === 1 ? `With k = 1 that is the answer: dp[1][${n}] = ${sq(p[n])} = ${dp[1][n]}.` : `Each later layer reads the row before it.`),
    { prevRoles: { 0: 'compare' }, curRoles: { [n]: k === 1 ? 'done' : 'idle' }, jRange: { from: 0, to: 0, text: 'j = 0', role: 'compare' }, vars: [['n', n], ['k', k]] },
  );

  let firstMiss: { g: number; i: number; got: number; want: number; wantJ: number; lo: number; hi: number } | null = null;

  for (g = 2; g <= k; g++) {
    dp[g] = p.map(() => null);
    opt[g] = p.map(() => null);
    layerEvals = 0;
    calls_ = [];
    const layerMisses: Array<{ i: number; want: number; wantJ: number }> = [];
    const m = n - g + 1;
    const prev = dp[g - 1] as number[];
    snap(
      L.layer,
      `Layer ${g}: dp[${g}][i] is the best cost of the first i values in ${g} groups, for i from ${g} to ${n} (${plural(m, 'cell')}). ` +
        `The last group is values[j:i], so j runs from ${g - 1} (one value for each earlier group) to i - 1 (at least one value in the last). ` +
        `The recursion starts with every cell and every j.`,
      { vars: [['g', g], ['cells', m]] },
    );

    const solve = (lo: number, hi: number, optLo: number, optHi: number, depth: number, slot: DncCall | null) => {
      calls.push([g, lo, hi, optLo, optHi]);
      if (lo > hi) return;
      const mid = Math.floor((lo + hi) / 2);
      const a = Math.max(optLo, g - 1);
      const b = Math.min(optHi, mid - 1);
      const call: DncCall = slot ?? { lo, hi, depth, text: `${a}..${b}`, role: 'idle' };
      if (!slot) calls_.push(call);
      call.role = 'active';
      const done = () => dp[g].map((v, i) => (v === null ? null : i)).filter((x): x is number => x !== null);
      const doneRoles = (): Record<number, Role> => Object.fromEntries(done().map((i) => [i, 'done' as Role]));
      snap(
        L.mid,
        (lo === g && hi === n ? `The whole layer: ${lo === hi ? `cell ${lo}` : `cells ${lo} to ${hi}`} with j from ${optLo} to ${optHi}. ` : lo === hi ? `Cell ${lo}, with j from ${optLo} to ${optHi}. ` : `Cells ${lo} to ${hi}, with j from ${optLo} to ${optHi}. `) +
          (lo === hi ? `It is its own middle cell, mid = ${mid}` : `The middle cell is mid = (${lo} + ${hi}) // 2 = ${mid}, solved first`) +
          `: it tries ${range(a, b)}` +
          (b < optHi ? `, because j stops at mid - 1 = ${mid - 1} so that the last group is not empty.` : '.'),
        {
          curRoles: { ...doneRoles(), [mid]: 'active' },
          curText: { [mid]: '?' },
          jRange: { from: a, to: b, text: a === b ? `j = ${a}` : `j ${a}..${b}`, role: 'active' },
          vars: [['g', g], ['lo', lo], ['hi', hi], ['mid', mid]],
        },
      );
      let best = 0;
      let bestJ = -1;
      for (let j = a; j <= b; j++) {
        const c = cost(j, mid);
        layerEvals++;
        const cand = prev[j] + c;
        const verdict =
          bestJ < 0
            ? ', the first candidate.'
            : cand < best
              ? `, less than ${best}: the best so far.`
              : cand === best
                ? `, equal to ${best}: a tie, and the smaller j = ${bestJ} stays.`
                : `, more than ${best}.`;
        const before = bestJ;
        if (bestJ < 0 || cand < best) [best, bestJ] = [cand, j];
        const prevRoles: Record<number, Role> = { [j]: 'compare' };
        if (before >= 0 && bestJ !== j) prevRoles[bestJ] = 'active';
        const valueRoles = Object.fromEntries(Array.from({ length: mid - j }, (_, t) => [j + t, 'compare' as Role]));
        snap(
          L.best,
          `j = ${j}: dp[${g - 1}][${j}] + (P[${mid}] - P[${j}])^2 = ${prev[j]} + ${sq(p[mid] - p[j])} = ${prev[j]} + ${c} = ${cand}${verdict}`,
          {
            curRoles: { ...doneRoles(), [mid]: 'active' },
            curText: { [mid]: String(best) },
            prevRoles,
            valueRoles,
            prefixRoles: { [j]: 'compare', [mid]: 'compare' },
            jRange: { from: a, to: b, text: a === b ? `j = ${a}` : `j ${a}..${b}`, role: 'active' },
            groups: [groupSpan(j, mid)],
            arrow: { from: j, to: mid, role: 'compare', label: `+${c}` },
            vars: [['mid', mid], ['j', j], ['candidate', cand], ['best', best]],
          },
        );
      }
      splits.push([mid, a, b, best, bestJ]);
      dp[g][mid] = best;
      opt[g][mid] = bestJ;
      call.role = 'done';
      call.text = `${a}..${b}: ${bestJ}`;
      // Children, pending until their turn.
      const left: DncCall | null = lo <= mid - 1 ? { lo, hi: mid - 1, depth: depth + 1, text: '', role: 'idle' } : null;
      const right: DncCall | null = mid + 1 <= hi ? { lo: mid + 1, hi, depth: depth + 1, text: '', role: 'idle' } : null;
      if (left) {
        const lm = Math.floor((lo + mid - 1) / 2);
        left.text = `${Math.max(optLo, g - 1)}..${Math.min(bestJ, lm - 1)}`;
        calls_.push(left);
      }
      if (right) {
        const rm = Math.floor((mid + 1 + hi) / 2);
        right.text = `${Math.max(bestJ, g - 1)}..${Math.min(optHi, rm - 1)}`;
        calls_.push(right);
      }
      // Trying every j on this row: does the narrowed range hold the best j?
      let fullBest = prev[g - 1] + (p[mid] - p[g - 1]) ** 2;
      let fullJ = g - 1;
      for (let j = g; j <= mid - 1; j++) {
        const cand = prev[j] + (p[mid] - p[j]) ** 2;
        if (cand < fullBest) [fullBest, fullJ] = [cand, j];
      }
      const miss = fullBest < best;
      if (miss) layerMisses.push({ i: mid, want: fullBest, wantJ: fullJ });
      if (miss && !firstMiss) firstMiss = { g, i: mid, got: best, want: fullBest, wantJ: fullJ, lo: a, hi: b };
      const cells = (c: DncCall) => (c.lo === c.hi ? `the cell ${c.lo}` : `the cells ${c.lo} to ${c.hi}`);
      const halves =
        (left ? ` On the left, ${cells(left)} need${left.lo === left.hi ? 's' : ''} only j <= ${bestJ}` : ' No cell of this call is left of it') +
        (right ? `; on the right, ${cells(right)} need${right.lo === right.hi ? 's' : ''} only j >= ${bestJ}.` : left ? '; no cell is right of it.' : ', and none is right of it.');
      snap(
        L.left,
        `dp[${g}][${mid}] = ${best} at j = ${bestJ}, so opt(${g}, ${mid}) = ${bestJ}.` +
          (miss
            ? ` Trying every j would give ${fullBest} at j = ${fullJ}, outside the range ${a}..${b} this cell was given: the best j is not monotone here, because a negative value breaks the quadrangle inequality.`
            : '') +
          halves,
        {
          curRoles: { ...doneRoles(), [mid]: 'active' },
          prevRoles: { [bestJ]: 'active' },
          optRoles: { [mid]: 'active' },
          valueRoles: Object.fromEntries(Array.from({ length: mid - bestJ }, (_, t) => [bestJ + t, 'active' as Role])),
          groups: [groupSpan(bestJ, mid, 'active')],
          arrow: { from: bestJ, to: mid, role: 'active', label: `+${(p[mid] - p[bestJ]) ** 2}` },
          vars: [['mid', mid], ['dp', best], ['opt', bestJ]],
        },
      );
      solve(lo, mid - 1, optLo, bestJ, depth + 1, left);
      solve(mid + 1, hi, bestJ, optHi, depth + 1, right);
    };
    solve(g, n, g - 1, n - 1, 0, null);

    const opts = (opt[g] as Array<number | null>).slice(g) as number[];
    const missed = layerMisses[0];
    snap(
      L.layer,
      `Layer ${g} is done with ${plural(layerEvals, 'cost evaluation')}, where trying every j for every cell costs ${(m * (m + 1)) / 2}. ` +
        `opt(${g}, i) for i = ${g}..${n} is ${opts.join(', ')}` +
        (missed
          ? `, but only because the ranges forced it: trying every j, cell ${missed.i} would take j = ${missed.wantJ} for ${missed.want}, so the best j is not monotone in this layer.`
          : `, and trying every j gives each cell the same minimum: the best j never moves left.`),
      { curRoles: Object.fromEntries(opts.map((_, t) => [g + t, 'done' as Role])), vars: [['g', g], ['evaluations', layerEvals]] },
    );
  }
  g = k + 1;

  // The walk back to the groups.
  const bounds = Array.from({ length: k + 1 }, () => 0);
  bounds[k] = n;
  for (let layer = k; layer > 1; layer--) {
    const i = bounds[layer];
    const j = opt[layer][i] as number;
    bounds[layer - 1] = j;
    const s = p[i] - p[j];
    snap(
      L.walk,
      (layer === k ? `dp[${k}][${n}] = ${dp[k][n]} is the answer. Walk back from bounds[${k}] = ${n}: ` : '') +
        `opt(${layer}, ${i}) = ${j}, so the last of these ${layer} groups is values[${j}:${i}] = [${values.slice(j, i).join(', ')}], sum ${s}, cost ${s * s}; ` +
        `the first ${plural(j, 'value')} ${layer - 1 === 1 ? 'form one group' : `go into ${layer - 1} groups`}.`,
      {
        layer,
        curRoles: { [i]: 'active' },
        prevRoles: { [j]: 'active' },
        optRoles: { [i]: 'active' },
        valueRoles: Object.fromEntries(Array.from({ length: i - j }, (_, t) => [j + t, 'active' as Role])),
        groups: [groupSpan(j, i, 'active')],
        cuts: bounds.slice(layer - 1, k),
        arrow: { from: j, to: i, role: 'active', label: `+${s * s}` },
        vars: [['g', layer], ['i', i], ['opt', j]],
      },
    );
  }
  const total = dp[k][n] as number;
  const parts = bounds.slice(0, k).map((b, t) => p[bounds[t + 1]] - p[b]);
  const sameAsPlain = total === plain.cost && bounds.every((b, t) => b === plain.bounds[t]);
  const negatives = values.some((v) => v < 0);
  let ending =
    `bounds = [${bounds.join(', ')}]: ` +
    (k === 1 ? `one group, cost ${sq(parts[0])} = ${total}.` : `the groups sum to ${parts.join(', ')} and cost ${parts.map((x) => x * x).join(' + ')} = ${total}.`) +
    (k === 1 ? ` Layer 1 evaluated ${plural(n, 'cost')}, as the plain DP does.` : ` The recursion evaluated ${plural(evaluations.length, 'cost')}; the plain DP evaluates ${plainTotal}.`);
  if (!sameAsPlain) {
    const miss = firstMiss as { g: number; i: number; got: number; want: number; wantJ: number; lo: number; hi: number } | null;
    ending +=
      ` But the plain DP returns ${plain.cost} with bounds [${plain.bounds.join(', ')}]` +
      (plain.cost < total ? '' : ', the same cost with other groups') +
      (miss ? `: the narrowing first cut off the best j at dp[${miss.g}][${miss.i}], where j = ${miss.wantJ} lay outside ${miss.lo}..${miss.hi}.` : '.') +
      ' A negative value breaks the quadrangle inequality, which is why min_cost_partition rejects it.';
  } else if (negatives) {
    ending += ' The plain DP agrees here, although a negative value breaks the quadrangle inequality: min_cost_partition rejects it all the same.';
  }
  const groupSpans = bounds.slice(0, k).map((b, t) => ({ from: b, to: bounds[t + 1] - 1, text: `sum ${parts[t]}`, role: 'done' as Role }));
  snap(L.walk, ending, {
    layer: k,
    curRoles: { [n]: 'done' },
    valueRoles: Object.fromEntries(values.map((_, t) => [t, 'done' as Role])),
    groups: groupSpans,
    cuts: bounds.slice(1, k),
    vars: [['cost', total], ['evaluations', evaluations.length]],
  });

  const workChars = Math.max(...frames.flatMap((f) => f.state.work.map((l) => l.text.length + 1)), 30);
  for (const f of frames) f.state.workChars = workChars;
  return { frames, calls, splits, evaluations, cost: total, bounds, plainCost: plain.cost, plainBounds: plain.bounds };
}
