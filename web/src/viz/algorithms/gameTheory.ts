/**
 * Game theory tracers: six of the fifteen functions of
 * Utilities/Problem_Types/Game_Theory/Python/game_theory.py, in three tabs.
 *   'nim'    nim_winning_move(piles) (with nim_winner's XOR test), drawn with NimView: XOR the
 *            piles, then take the first pile whose size XOR the total is smaller.
 *   'grundy' subtraction_grundy(n, moves) with mex, and combined_grundy for several piles of
 *            the same game, drawn with GrundyView.
 *   'graph'  game_graph_outcomes(n, edges), drawn with GameGraphView: retrograde analysis from
 *            the nodes with no move (LOSE), a predecessor of a LOSE node wins, a node whose
 *            moves all reach WIN nodes loses; never settled = DRAW. Moves are kept in input order
 *            (duplicates included), as the Python adjacency lists keep them.
 * Golden fixtures (__fixtures__/mathAndProblemTypes.json) pin every result, every Grundy table and
 * reachable set, and the order in which the graph settles its nodes.
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { StripData, StripItem } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';

function ints(text: string, what: string, lo: number, hi: number): number[] {
  return text
    .replace(/[[\]()]/g, ' ')
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((t) => {
      if (!/^-?\d+$/.test(t)) throw new InputError(`${what}: "${t}" is not a whole number.`);
      const v = Number(t) + 0;
      if (v < lo || v > hi) throw new InputError(`${what} go from ${lo} to ${hi} here (got ${t}).`);
      return v;
    });
}

const bitsOf = (v: number, width: number) => Array.from({ length: width }, (_, i) => (v >> (width - 1 - i)) & 1);

/* =====================================================================
 * Nim: nim_winner and nim_winning_move
 * ===================================================================== */

export const NIM_LIMITS = { maxPiles: 8, maxPile: 31 };

/** "3 4 5" or "[3, 4, 5]": the pile sizes. */
export function parseNim(text: string): number[] {
  const piles = ints(text.replace(/piles?\s*[:=]?/i, ''), 'Pile sizes', 0, NIM_LIMITS.maxPile);
  if (piles.length === 0) throw new InputError('Give the pile sizes, e.g. "3 4 5".');
  if (piles.length > NIM_LIMITS.maxPiles) throw new InputError(`At most ${NIM_LIMITS.maxPiles} piles here (got ${piles.length}).`);
  return piles;
}

export const NIM_CODE = [
  'def nim_winner(piles):',
  '    return XOR of all piles != 0          # the first player wins',
  'def nim_winning_move(piles):',
  '    xor_sum = 0',
  '    for pile in piles:',
  '        xor_sum ^= pile',
  '    if xor_sum == 0:',
  '        return (-1, -1)                    # losing position',
  '    for i, pile in enumerate(piles):',
  '        target = pile ^ xor_sum',
  '        if target < pile:',
  '            return (i, pile - target)',
  '    return (-1, -1)',
];

export interface NimRowView {
  label: string;
  size: number;
  /** Stones taken by the winning move: drawn crossed out at the end of the pile. */
  removed: number;
  bits: number[];
  role: Role;
  bitRoles?: Role[];
  note?: string;
}

export interface NimState {
  width: number;
  /** The largest pile of the run: the stone area keeps its width when the winning move shrinks it. */
  maxPile?: number;
  rows: NimRowView[];
  xor: { value: number; bits: number[]; role: Role; bitRoles?: Role[]; label: string };
  status?: 'good' | 'bad';
}

export interface NimRun {
  frames: Array<Frame<NimState>>;
  winner: boolean;
  move: [number, number];
}

export function nimTrace(piles: number[]): NimRun {
  const frames: Array<Frame<NimState>> = [];
  const width = Math.max(3, ...piles.map((p) => p.toString(2).length));
  let xor = 0;
  const snap = (line: number, caption: string, o: { rows?: Partial<NimRowView>[]; xorRole?: Role; xorBits?: Role[]; xorLabel?: string; status?: 'good' | 'bad'; piles?: number[] } = {}) => {
    const sizes = o.piles ?? piles;
    frames.push({
      line,
      caption,
      vars: [
        ['xor_sum', `${xor} = ${xor.toString(2).padStart(width, '0')}`],
        ['piles', `[${sizes.join(', ')}]`],
      ],
      state: {
        width,
        maxPile: Math.max(0, ...piles),
        rows: sizes.map((p, i) => ({ label: `pile ${i}`, size: p, removed: 0, bits: bitsOf(p, width), role: 'idle' as Role, ...(o.rows?.[i] ?? {}) })),
        xor: { value: xor, bits: bitsOf(xor, width), role: o.xorRole ?? 'idle', bitRoles: o.xorBits, label: o.xorLabel ?? 'xor_sum' },
        status: o.status,
      },
    });
  };
  const highest = (v: number) => (v === 0 ? -1 : 31 - Math.clz32(v));

  snap(
    3,
    `nim_winning_move([${piles.join(', ')}]): a move takes any number of stones from one pile. Bouton's theorem: the player to move wins exactly when the XOR of the pile sizes is not 0. Write the piles in binary and XOR the columns.`,
  );
  piles.forEach((p, i) => {
    const before = xor;
    xor ^= p;
    const rows: Partial<NimRowView>[] = [];
    rows[i] = { role: 'active' };
    snap(
      5,
      `xor_sum ^= ${p}: ${before.toString(2).padStart(width, '0')} XOR ${p.toString(2).padStart(width, '0')} = ${xor.toString(2).padStart(width, '0')} (${xor}). Each bit column keeps the parity of its 1s.`,
      { rows, xorRole: 'active' },
    );
  });
  if (xor === 0) {
    snap(
      7,
      `xor_sum = 0, so nim_winner is False: the player to move loses against perfect play. Any move changes one pile, which makes the XOR non-zero, and the opponent can always bring it back to 0. Return (-1, -1).`,
      { xorRole: 'bad', status: 'bad' },
    );
    return { frames, winner: false, move: [-1, -1] };
  }
  const hb = highest(xor);
  const xorBits = bitsOf(xor, width).map((_, idx): Role => (width - 1 - idx === hb ? 'active' : 'idle'));
  snap(
    6,
    `xor_sum = ${xor} is not 0, so nim_winner is True: the player to move wins. A winning move must leave XOR 0: some pile has the highest 1 bit of ${xor} (bit ${hb}), and replacing it by pile ^ ${xor} makes every column even.`,
    { xorRole: 'compare', xorBits },
  );
  for (let i = 0; i < piles.length; i++) {
    const p = piles[i];
    const target = p ^ xor;
    const rows: Partial<NimRowView>[] = [];
    if (target < p) {
      rows[i] = { role: 'good', size: target, removed: p - target, bits: bitsOf(target, width), note: `${p} ^ ${xor} = ${target}` };
      snap(
        11,
        `Pile ${i}: target = ${p} ^ ${xor} = ${target} < ${p}, so it can shrink to ${target}: take ${p - target} stone${p - target > 1 ? 's' : ''}. nim_winning_move returns (${i}, ${p - target}).`,
        { rows, xorRole: 'compare', xorBits },
      );
      const after = piles.map((x, j) => (j === i ? target : x));
      const before = xor;
      xor = after.reduce((a, b) => a ^ b, 0);
      const done: Partial<NimRowView>[] = [];
      done[i] = { role: 'good' };
      snap(
        11,
        `After the move the piles are [${after.join(', ')}] and their XOR is ${xor}: every column has an even number of 1s. The opponent now faces XOR 0 (it was ${before}), a losing position.`,
        { rows: done, xorRole: 'good', status: 'good', piles: after, xorLabel: 'XOR after' },
      );
      xor = before;
      return { frames, winner: true, move: [i, p - target] };
    }
    rows[i] = { role: 'compare', note: `${p} ^ ${xor} = ${target}` };
    snap(10, `Pile ${i}: target = ${p} ^ ${xor} = ${target} is not smaller than ${p}, because pile ${i} does not have bit ${hb} set: stones can only be taken, not added.`, { rows, xorRole: 'compare', xorBits });
  }
  return { frames, winner: true, move: [-1, -1] };
}

/* =====================================================================
 * Sprague-Grundy: subtraction_grundy, mex, combined_grundy
 * ===================================================================== */

export interface GrundyInput {
  n: number;
  moves: number[];
  piles: number[];
}

export const GRUNDY_LIMITS = { maxN: 24, maxMoves: 6, maxPiles: 4 };

/** "n 12; moves 1 3 4; piles 5 6" (piles optional). */
export function parseGrundy(text: string): GrundyInput {
  let n: number | undefined;
  let moves: number[] | undefined;
  let piles: number[] = [];
  for (const seg of text.split(/[;\n]/).map((s) => s.trim()).filter(Boolean)) {
    let m: RegExpMatchArray | null;
    if ((m = seg.match(/^n\s*[:=]?\s*(-?\d+)$/i))) {
      n = Number(m[1]);
      if (n < 0 || n > GRUNDY_LIMITS.maxN) throw new InputError(`n goes from 0 to ${GRUNDY_LIMITS.maxN} here, so every position fits in one row (got ${n}).`);
    } else if ((m = seg.match(/^moves?\s*[:=]?\s*(.*)$/i))) {
      moves = ints(m[1], 'Moves', 1, 30);
      if (moves.length === 0 || moves.length > GRUNDY_LIMITS.maxMoves) throw new InputError(`Give 1 to ${GRUNDY_LIMITS.maxMoves} moves, e.g. "moves 1 3 4".`);
    } else if ((m = seg.match(/^piles?\s*[:=]?\s*(.*)$/i))) {
      piles = ints(m[1], 'Piles', 0, GRUNDY_LIMITS.maxN);
      if (piles.length > GRUNDY_LIMITS.maxPiles) throw new InputError(`At most ${GRUNDY_LIMITS.maxPiles} piles here.`);
    } else {
      throw new InputError(`Cannot read "${seg}". Write "n 12; moves 1 3 4", optionally with "; piles 5 6".`);
    }
  }
  if (moves === undefined) throw new InputError('Give the allowed moves, e.g. "moves 1 3 4" (positive amounts to remove).');
  if (n === undefined) n = piles.length ? Math.max(...piles) : 12;
  const big = piles.find((p) => p > n!);
  if (big !== undefined) throw new InputError(`A pile of ${big} needs the table up to ${big}, but n is ${n}: raise n or shrink the pile.`);
  return { n, moves, piles };
}

export const GRUNDY_CODE = [
  'def mex(s):',
  '    result = 0',
  '    while result in s: result += 1',
  '    return result',
  'def subtraction_grundy(n, moves):',
  '    grundy = [0] * (n + 1)',
  '    for i in range(1, n + 1):',
  '        reachable = set()',
  '        for move in moves:',
  '            if i >= move: reachable.add(grundy[i - move])',
  '        grundy[i] = mex(reachable)',
  '    return grundy',
  'def combined_grundy(states, grundy_tables):',
  '    result = 0',
  '    for i, state in enumerate(states): result ^= grundy_tables[i][state]',
  '    return result',
];

export interface GrundyCellView {
  value: number | null;
  role: Role;
}

export interface GrundyState {
  n: number;
  cells: GrundyCellView[];
  /** Moves from the current position: arcs from `from` back to each target. */
  arcs: Array<{ from: number; to: number; label: string; role: Role }>;
  /** The mex scan: candidate values 0, 1, ... and whether each is in the reachable set. */
  mex: Array<{ value: number; taken: boolean; role: Role }>;
  piles: Array<{ size: number; role: Role }>;
  strips: StripData[];
  /** The run's longest strips (withStripGhosts): the stage keeps one height. */
  ghosts?: StripData[];
}

export interface GrundyRun {
  frames: Array<Frame<GrundyState>>;
  table: number[];
  /** The reachable set of every position 1..n, sorted. */
  reachable: number[][];
  combined: number | null;
}

export function grundyTrace({ n, moves, piles }: GrundyInput): GrundyRun {
  const frames: Array<Frame<GrundyState>> = [];
  const grundy: Array<number | null> = Array(n + 1).fill(null);
  grundy[0] = 0;
  const reachableSets: number[][] = [];
  const steps: StripItem[] = [];
  let combined: number | null = null;

  const snap = (line: number, caption: string, o: { cells?: Record<number, Role>; arcs?: GrundyState['arcs']; mex?: GrundyState['mex']; piles?: Role[]; set?: number[] } = {}) => {
    const strips: StripData[] = [
      { label: 'reachable', items: o.set?.length ? o.set.map((v) => ({ text: String(v), role: 'compare' as Role })) : [{ text: SYM.emptySet, role: 'muted' }] },
    ];
    if (piles.length) strips.push({ label: 'combined_grundy', items: steps.length ? steps.map((s) => ({ ...s })) : [{ text: 'not yet', role: 'muted' }] });
    frames.push({
      line,
      caption,
      vars: [
        ['moves', `[${moves.join(', ')}]`],
        ['grundy', `[${grundy.map((g) => (g === null ? '?' : g)).join(', ')}]`],
        ...(combined !== null ? ([['combined', combined]] as Array<[string, number]>) : []),
      ],
      state: {
        n,
        cells: grundy.map((g, i) => ({ value: g, role: o.cells?.[i] ?? 'idle' })),
        arcs: o.arcs ?? [],
        mex: o.mex ?? [],
        piles: piles.map((p, i) => ({ size: p, role: o.piles?.[i] ?? 'idle' })),
        strips,
      },
    });
  };

  snap(
    5,
    `subtraction_grundy(${n}, [${moves.join(', ')}]): a move removes ${moves.length === 1 ? `${moves[0]} stone${moves[0] > 1 ? 's' : ''}` : `${moves.slice(0, -1).join(', ')} or ${moves[moves.length - 1]} stones`} from a pile. Position 0 has no move, so grundy[0] = 0 (the player to move there has lost).`,
    { cells: { 0: 'done' } },
  );
  for (let i = 1; i <= n; i++) {
    const reachable = new Set<number>();
    const arcs: GrundyState['arcs'] = [];
    const targets: string[] = [];
    for (const move of moves) {
      if (i >= move) {
        reachable.add(grundy[i - move]!);
        arcs.push({ from: i, to: i - move, label: `-${move}`, role: 'compare' });
        targets.push(`${i - move} (g ${grundy[i - move]})`);
      }
    }
    const set = [...reachable].sort((a, b) => a - b);
    reachableSets.push(set);
    const cells: Record<number, Role> = { [i]: 'active' };
    for (const a of arcs) cells[a.to] = 'compare';
    snap(
      9,
      targets.length
        ? `Position ${i}: the moves reach ${targets.join(', ')}, so reachable = {${set.join(', ')}}.`
        : `Position ${i}: every move is bigger than ${i}, so there is no move and reachable is empty.`,
      { cells, arcs, set },
    );
    let mex = 0;
    const scan: GrundyState['mex'] = [];
    while (reachable.has(mex)) {
      scan.push({ value: mex, taken: true, role: 'compare' });
      mex += 1;
    }
    scan.push({ value: mex, taken: false, role: 'active' });
    grundy[i] = mex;
    snap(
      10,
      `mex: ${scan
        .slice(0, -1)
        .map((s) => `${s.value} is reachable`)
        .concat(`${mex} is not`)
        .join(', ')}, so grundy[${i}] = ${mex}.` +
        (mex === 0 ? ` Every move from ${i} leads to a position with a non-zero Grundy number: ${i} is a losing position (P).` : ` Some move reaches a position with Grundy number 0, so ${i} wins for the player to move.`),
      { cells: { ...cells, [i]: 'active' }, arcs, mex: scan, set },
    );
  }
  const table = grundy.map((g) => g!);
  snap(
    11,
    `Table done: positions ${table.flatMap((g, i) => (g === 0 ? [i] : [])).join(', ')} have Grundy number 0 and lose for the player to move; every other position wins.`,
    { cells: Object.fromEntries(table.map((g, i) => [i, g === 0 ? 'done' : 'idle'] as [number, Role])) },
  );
  if (piles.length) {
    combined = 0;
    snap(13, `combined_grundy: several piles of the same game played side by side. By the Sprague-Grundy theorem the sum behaves like Nim with piles of sizes g(pile): XOR them.`, {
      cells: Object.fromEntries(piles.map((p) => [p, 'compare'] as [number, Role])),
    });
    piles.forEach((p, idx) => {
      const before = combined!;
      combined = before ^ table[p];
      steps.push({ text: `g(${p}) = ${table[p]}`, role: 'done' });
      snap(14, `Pile ${idx} has ${p} stones: grundy[${p}] = ${table[p]}, and result = ${before} ^ ${table[p]} = ${combined}.`, {
        cells: { [p]: 'active' },
        piles: piles.map((_, j) => (j === idx ? 'active' : j < idx ? 'done' : 'idle')),
      });
    });
    steps.push({ text: `XOR = ${combined}`, role: combined !== 0 ? 'good' : 'bad' });
    snap(
      15,
      combined !== 0
        ? `combined_grundy = ${combined} is not 0: the first player wins the sum of games, by moving in one pile to a position whose Grundy number makes the XOR 0.`
        : `combined_grundy = 0: the first player loses the sum of games against perfect play.`,
      { piles: piles.map(() => (combined !== 0 ? 'good' : 'bad')) },
    );
  }
  return { frames, table, reachable: reachableSets, combined };
}

/* =====================================================================
 * Game graph: game_graph_outcomes (retrograde analysis)
 * ===================================================================== */

export type Outcome = 'win' | 'lose' | 'draw';

export interface GameGraphInput {
  n: number;
  edges: Array<[number, number]>;
}

export const GAME_GRAPH_LIMITS = { maxNodes: 10, maxEdges: 24 };

/** "0>1, 1>0, 1>2" with an optional "n 4" for nodes that have no edge. */
export function parseGameGraph(text: string): GameGraphInput {
  let n: number | undefined;
  const edges: Array<[number, number]> = [];
  for (const seg of text.split(/[;,\n]/).map((s) => s.trim()).filter(Boolean)) {
    let m: RegExpMatchArray | null;
    if ((m = seg.match(/^n\s*[:=]?\s*(\d+)$/i))) {
      n = Number(m[1]);
      if (n < 1 || n > GAME_GRAPH_LIMITS.maxNodes) throw new InputError(`n goes from 1 to ${GAME_GRAPH_LIMITS.maxNodes} here (got ${n}).`);
    } else {
      const parts = seg.split(/\s+/).filter(Boolean);
      for (const p of parts) {
        const e = p.match(/^(\d+)\s*-?>\s*(\d+)$/);
        if (!e) throw new InputError(`Cannot read "${p}". Write moves as "0>1" (a token on node 0 may move to node 1), separated by commas, and "n 5" for the node count.`);
        edges.push([Number(e[1]), Number(e[2])]);
      }
    }
  }
  const top = edges.reduce((mx, [u, v]) => Math.max(mx, u, v), -1);
  if (n === undefined) n = top + 1;
  if (n < 1) throw new InputError('Give at least one node: moves like "0>1", or "n 1".');
  if (top >= n) throw new InputError(`Node ${top} does not exist: with n ${n} the nodes are 0..${n - 1}.`);
  if (n > GAME_GRAPH_LIMITS.maxNodes) throw new InputError(`At most ${GAME_GRAPH_LIMITS.maxNodes} nodes here (got ${n}).`);
  if (edges.length > GAME_GRAPH_LIMITS.maxEdges) throw new InputError(`At most ${GAME_GRAPH_LIMITS.maxEdges} moves here (got ${edges.length}).`);
  return { n, edges };
}

export const GAME_GRAPH_CODE = [
  'def game_graph_outcomes(n, edges):',
  '    for u, v in edges: adj[u].append(v); rev[v].append(u)',
  '    outcome = [None] * n',
  '    remaining = [len(adj[u]) for u in range(n)]     # moves not yet known to lose',
  '    for u in range(n):',
  '        if remaining[u] == 0: outcome[u] = LOSE; queue.append(u)',
  '    while head < len(queue):',
  '        v = queue[head]; head += 1',
  '        for u in rev[v]:                       # every move u -> v',
  '            if outcome[u] is not None: continue',
  '            if outcome[v] == LOSE:',
  '                outcome[u] = WIN; queue.append(u)',
  '            else:',
  '                remaining[u] -= 1',
  '                if remaining[u] == 0: outcome[u] = LOSE; queue.append(u)',
  '    return [o if o is not None else DRAW for o in outcome]',
];

export interface GameNodeView {
  id: number;
  x: number;
  y: number;
  role: Role;
  /** Outcome text once settled ("WIN" / "LOSE" / "DRAW"), else the moves left ("2 left"). */
  badge: string;
}

export interface GameEdgeView {
  id: number;
  from: number;
  to: number;
  role: Role;
}

export interface GameGraphState {
  nodes: GameNodeView[];
  edges: GameEdgeView[];
  strips: StripData[];
  /** The run's longest strips (withStripGhosts): the stage keeps one height. */
  ghosts?: StripData[];
}

export interface GameGraphRun {
  frames: Array<Frame<GameGraphState>>;
  outcomes: Outcome[];
  /** The queue in the order nodes were settled. */
  order: number[];
}

export function gameGraphTrace({ n, edges }: GameGraphInput): GameGraphRun {
  const frames: Array<Frame<GameGraphState>> = [];
  const adj: number[][] = Array.from({ length: n }, () => []);
  const rev: Array<Array<{ u: number; e: number }>> = Array.from({ length: n }, () => []);
  edges.forEach(([u, v], e) => {
    adj[u].push(v);
    rev[v].push({ u, e });
  });
  const outcome: Array<Outcome | null> = Array(n).fill(null);
  const remaining = adj.map((a) => a.length);
  const queue: number[] = [];
  let head = 0;
  const W = 600;
  const H = 360;
  const r = n <= 2 ? 100 : 130;
  const pos = Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return n === 1 ? { x: W / 2, y: H / 2 } : { x: W / 2 + r * Math.cos(a), y: H / 2 + 4 + r * Math.sin(a) };
  });
  const roleOf = (o: Outcome | null): Role => (o === 'win' ? 'good' : o === 'lose' ? 'bad' : o === 'draw' ? 'muted' : 'idle');

  const snap = (line: number, caption: string, o: { nodes?: Record<number, Role>; edges?: Record<number, Role>; final?: boolean } = {}) => {
    frames.push({
      line,
      caption,
      vars: [
        ['settled', outcome.filter((x) => x !== null).length],
        ['queue head', head],
        ['remaining', `[${remaining.join(', ')}]`],
      ],
      state: {
        nodes: pos.map((p, i) => ({
          id: i,
          x: p.x,
          y: p.y,
          role: o.nodes?.[i] ?? roleOf(outcome[i] ?? (o.final ? 'draw' : null)),
          badge: outcome[i] ? outcome[i]!.toUpperCase() : o.final ? 'DRAW' : `${remaining[i]} left`,
        })),
        edges: edges.map(([u, v], id) => ({ id, from: u, to: v, role: o.edges?.[id] ?? 'idle' })),
        strips: [
          {
            label: 'Queue',
            items: queue.length ? queue.map((q, i): StripItem => ({ text: `${q} ${outcome[q] === 'win' ? 'W' : 'L'}`, role: i < head - 1 ? 'muted' : i === head - 1 ? 'active' : undefined })) : [{ text: SYM.emptySet, role: 'muted' }],
          },
        ],
      },
    });
  };

  snap(3, `game_graph_outcomes(${n}, ${edges.length} moves): a token sits on a node and the player to move slides it along one edge; a player with no move loses. remaining[u] counts u's moves not yet known to lead to a WIN node.`);
  const terminal: number[] = [];
  for (let u = 0; u < n; u++) {
    if (remaining[u] === 0) {
      outcome[u] = 'lose';
      queue.push(u);
      terminal.push(u);
    }
  }
  snap(
    5,
    terminal.length
      ? `Node${terminal.length > 1 ? 's' : ''} ${terminal.join(', ')} ${terminal.length > 1 ? 'have' : 'has'} no move, so the player to move there loses: LOSE, and into the queue. Every outcome is worked out backwards from these.`
      : 'Every node has a move, so no node is a loss to start from: the queue stays empty and nothing can be settled.',
  );
  while (head < queue.length) {
    const v = queue[head];
    head += 1;
    const vo = outcome[v]!;
    snap(
      7,
      `v = ${v} (${vo.toUpperCase()}) leaves the queue. Look at every move u -> ${v} into it: ` +
        (vo === 'lose' ? `a player who can move to a losing node wins.` : `a move to a winning node is bad for the mover, so it only counts down remaining[u].`),
      { nodes: { [v]: 'active' } },
    );
    for (const { u, e } of rev[v]) {
      if (outcome[u] !== null) {
        snap(9, `Move ${u} -> ${v}: node ${u} is already settled (${outcome[u]!.toUpperCase()}), so skip it.`, { nodes: { [v]: 'active', [u]: 'compare' }, edges: { [e]: 'compare' } });
        continue;
      }
      if (vo === 'lose') {
        outcome[u] = 'win';
        queue.push(u);
        snap(11, `Move ${u} -> ${v}: ${v} is LOSE, so the player at ${u} moves there and wins. Node ${u} is WIN; queue it.`, { nodes: { [v]: 'active', [u]: 'good' }, edges: { [e]: 'active' } });
      } else {
        remaining[u] -= 1;
        if (remaining[u] === 0) {
          outcome[u] = 'lose';
          queue.push(u);
          snap(14, `Move ${u} -> ${v} reaches a WIN node, and it was ${u}'s last open move: every move from ${u} helps the opponent. Node ${u} is LOSE; queue it.`, {
            nodes: { [v]: 'active', [u]: 'bad' },
            edges: { [e]: 'active' },
          });
        } else {
          snap(13, `Move ${u} -> ${v} reaches a WIN node, a bad move for ${u}: remaining[${u}] = ${remaining[u]}. Node ${u} still has other moves to try.`, {
            nodes: { [v]: 'active', [u]: 'compare' },
            edges: { [e]: 'compare' },
          });
        }
      }
    }
  }
  const draws = outcome.flatMap((o, i) => (o === null ? [i] : []));
  const outcomes = outcome.map((o) => o ?? 'draw') as Outcome[];
  snap(
    15,
    draws.length
      ? `The queue is empty. Node${draws.length > 1 ? 's' : ''} ${draws.join(', ')} never settled: from there neither player can force a win, and the token can cycle forever under best play: DRAW. analyze_game_graph reports them as not winning.`
      : `The queue is empty and every node is settled: ${outcomes.map((o, i) => `${i} ${o.toUpperCase()}`).join(', ')}.`,
    { final: true },
  );
  return { frames, outcomes, order: [...queue] };
}
