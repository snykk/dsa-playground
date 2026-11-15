/**
 * 2-SAT tracer, drawn with ImplicationGraphView: the implication graph with x on the top row
 * and ~x below it, the iterative Tarjan run, then the assignment and a check of every clause.
 *
 * Mirrors TwoSAT in Algorithms/Graph_Algorithms/Advanced_Graph/2_SAT/Python/two_sat.py:
 * TwoSAT(n) has 2n nodes (x is 2x, ~x is 2x + 1, lit ^ 1 negates); add_clause(a, b) appends
 * b to graph[a ^ 1] and a to graph[b ^ 1]; implies(a, b) is add_clause(a ^ 1, b); force_true(a)
 * is add_clause(a, a). solve() runs Tarjan iteratively (a work stack of (u, i) pairs) from
 * every undiscovered node 0..2n-1 in order, gives components ids in the order they finish
 * (sinks first), returns (False, None) at the first x with comp[2x] == comp[2x + 1], and
 * otherwise sets x = comp[2x] < comp[2x + 1]. A literal beyond 2n raises IndexError, in
 * add_clause (after its first append, if that one fit) or later in solve().
 * The golden fixture (__fixtures__/advancedGraph.json) pins comp for every node, the answer
 * and the assignment.
 *
 * Input: "x0 or x1, not x0 or x1, ~x0 or ~x1"; also "x0 -> x1" (implies), a lone literal
 * (force_true) and "n 4" for the number of variables.
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { ReservedStrip } from '../renderers/advancedGraphShared';
import type { ClauseView, ImplicationEdgeView, ImplicationState, LiteralView } from '../renderers/ImplicationGraphView';
import { SYM } from '../ui/symbols';

export interface SatClause {
  /** The add_clause(a, b) call this clause makes. */
  a: number;
  b: number;
  kind: 'or' | 'implies' | 'force';
  /** As written, normalised: "x0 or ~x1", "x0 -> x1", "x2". */
  text: string;
}

export interface TwoSatInput {
  n: number;
  clauses: SatClause[];
}

export const SAT_LIMITS = { maxVars: 6, maxClauses: 16 };

const ARROW = SYM.rightArrow;

export const litName = (l: number) => `${l % 2 === 1 ? '~' : ''}x${Math.floor(l / 2)}`;

function parseLiteral(token: string): number {
  const m = token.trim().match(/^(?:(not\s+|~|!|-)\s*)?x(\d+)$/i);
  if (!m) throw new InputError(`"${token.trim()}" is not a literal. Write x0 to x${SAT_LIMITS.maxVars - 1}, negated as "not x2", "~x2" or "!x2".`);
  const x = Number(m[2]);
  if (x >= SAT_LIMITS.maxVars) throw new InputError(`Variables go from x0 to x${SAT_LIMITS.maxVars - 1} here (got x${m[2]}).`);
  return 2 * x + (m[1] ? 1 : 0);
}

/**
 * Parse clauses separated by commas, semicolons, new lines or "and": "x0 or not x1", "(x0 | ~x1)",
 * "x0 -> x1" (implies), "x2" (force_true), plus an optional "n 4". Without n, n is one more than
 * the largest variable used.
 */
export function parseTwoSat(text: string): TwoSatInput {
  let n: number | undefined;
  const clauses: SatClause[] = [];
  for (let seg of text.split(/[,;\n]+|\s+and\s+|\s*&&?\s*/i).map((t) => t.trim()).filter(Boolean)) {
    const opt = seg.match(/^(?:n|vars?|variables)\s*[:= ]\s*(-?\d+)$/i);
    if (opt) {
      if (n !== undefined) throw new InputError('Give the number of variables ("n 4") only once.');
      n = Number(opt[1]);
      if (n < 1 || n > SAT_LIMITS.maxVars) throw new InputError(`n goes from 1 to ${SAT_LIMITS.maxVars} here (got ${opt[1]}).`);
      continue;
    }
    while (/^\(.*\)$/.test(seg)) seg = seg.slice(1, -1).trim();
    const imp = seg.match(/^(.+?)\s*(?:->|=>|\bimplies\b)\s*(.+)$/i);
    const or = imp ? null : seg.match(/^(.+?)\s*(?:\|\||\||\bor\b|\bv\b)\s*(.+)$/i);
    if (imp) {
      const p = parseLiteral(imp[1]);
      const q = parseLiteral(imp[2]);
      clauses.push({ a: p ^ 1, b: q, kind: 'implies', text: `${litName(p)} -> ${litName(q)}` });
    } else if (or) {
      const a = parseLiteral(or[1]);
      const b = parseLiteral(or[2]);
      clauses.push({ a, b, kind: 'or', text: `${litName(a)} or ${litName(b)}` });
    } else {
      const a = parseLiteral(seg);
      clauses.push({ a, b: a, kind: 'force', text: litName(a) });
    }
  }
  if (clauses.length === 0 && n === undefined) throw new InputError('Add at least one clause, for example "x0 or x1, not x0 or x1".');
  if (clauses.length > SAT_LIMITS.maxClauses) throw new InputError(`At most ${SAT_LIMITS.maxClauses} clauses, please (got ${clauses.length}).`);
  const used = clauses.reduce((m, c) => Math.max(m, Math.floor(c.a / 2) + 1, Math.floor(c.b / 2) + 1), 0);
  return { n: n ?? used, clauses };
}

export function formatTwoSat(input: TwoSatInput): string {
  return `n ${input.n}; ${input.clauses.map((c) => c.text).join(', ')}`;
}

/** The value of a literal under an assignment. */
export const litValue = (l: number, assignment: boolean[]) => (l % 2 === 0 ? assignment[l >> 1] : !assignment[l >> 1]);

export const TWO_SAT_CODE = [
  'TwoSAT(n): graph = [[] for _ in range(2 * n)]   # node 2x is x, 2x + 1 is ~x',
  'add_clause(a, b): graph[a ^ 1].append(b); graph[b ^ 1].append(a)   # ~a -> b, ~b -> a',
  'solve(): for i in range(2 * n): if disc[i] == -1: dfs(i)',
  '  dfs(start): work = [(start, 0)]; while work: u, i = work[-1]',
  '    if i == 0: disc[u] = low[u] = timer; timer += 1; stack.append(u)',
  '    if i < len(graph[u]): work[-1] = (u, i + 1); v = graph[u][i]',
  '      if disc[v] == -1: work.append((v, 0))        # tree edge: visit v next',
  '      elif on_stack[v]: low[u] = min(low[u], disc[v])',
  '    else:                                        # every edge of u is done',
  '      if low[u] == disc[u]: pop the stack down to u, comp[w] = scc_id; scc_id += 1',
  '      work.pop(); if work: low[p] = min(low[p], low[u])   # p = the new work[-1]',
  '  for x in range(n):',
  '    if comp[2x] == comp[2x + 1]: return False, None',
  '    assignment[x] = comp[2x] < comp[2x + 1]',
  '  return True, assignment',
  'check (as the tests do): every clause (a or b) has a true literal',
];

export type SatFrame = Frame<ImplicationState>;
type Vars = NonNullable<SatFrame['vars']>;

export interface TwoSatRun {
  frames: SatFrame[];
  /** true / false as solve() returns it; null when the Python code raises IndexError. */
  ok: boolean | null;
  assignment: boolean[] | null;
  /** comp[node] after Tarjan, Python's ids (-1 where solve() never got that far). */
  comp: number[];
  /** Indices of the clauses whose add_clause raised IndexError. */
  raised: number[];
  /** solve() raised IndexError (on an entry a failed add_clause left behind). */
  solveRaised: boolean;
  graph: number[][];
}

const plural = (k: number, one: string, many = `${one}s`) => `${k} ${k === 1 ? one : many}`;
const set = (xs: string[]) => `{${xs.join(', ')}}`;

export function twoSatTrace(input: TwoSatInput): TwoSatRun {
  const { n, clauses } = input;
  const N = 2 * n;
  const graph: number[][] = Array.from({ length: N }, () => []);
  const frames: SatFrame[] = [];
  const nodeRole = new Map<number, Role>();
  const edgeRole = new Map<string, Role>();
  const badges = new Map<number, string>();
  const clauseState: Array<{ role: Role; mark?: 'ok' | 'bad' }> = clauses.map(() => ({ role: 'idle' }));
  const values: Array<{ text: string; role: Role }> = Array.from({ length: n }, (_, x) => ({ text: `x${x} = ?`, role: 'idle' }));
  let strips: ReservedStrip[] = [];

  const edgeId = (u: number, k: number) => `${u}:${k}`;
  const snap = (line: number | undefined, caption: string, vars: Vars, extra: { nodes?: Record<number, Role>; edges?: Record<string, Role> } = {}) => {
    const literals: LiteralView[] = Array.from({ length: N }, (_, l) => ({
      id: litName(l),
      col: l >> 1,
      row: (l % 2) as 0 | 1,
      role: extra.nodes?.[l] ?? nodeRole.get(l) ?? 'idle',
      badge: badges.get(l),
    }));
    const edges: ImplicationEdgeView[] = [];
    graph.forEach((list, u) =>
      list.forEach((v, k) => {
        if (v >= N) return; // a dangling entry: Python appended it before raising IndexError
        const id = edgeId(u, k);
        edges.push({ id, from: litName(u), to: litName(v), role: extra.edges?.[id] ?? edgeRole.get(id) ?? 'idle' });
      }),
    );
    const clauseViews: ClauseView[] = clauses.map((c, i) => ({ label: `c${i + 1}: ${c.text}`, role: clauseState[i].role, mark: clauseState[i].mark }));
    frames.push({
      line,
      caption,
      vars,
      state: { n, literals, edges, values: values.map((v) => ({ label: v.text, role: v.role })), clauses: clauseViews, strips },
    });
  };

  // ---------------------------------------------------------------- build the implication graph
  strips = [
    { label: 'Work stack', items: [], empty: '(empty)' },
    { label: 'Tarjan stack', items: [], empty: '(empty)' },
    { label: 'Components', items: [], empty: '(none yet)' },
  ];
  snap(
    0,
    `TwoSAT(${n}): ${plural(N, 'node')}, one per literal. x${n > 1 ? 'k' : '0'} is node ${n > 1 ? '2k' : '0'} on the top row and its negation ~x${n > 1 ? 'k' : '0'} is node ${n > 1 ? '2k + 1' : '1'} below it, so lit ^ 1 flips a literal.`,
    [['n', n], ['nodes', N]],
  );
  const raised: number[] = [];
  clauses.forEach((c, ci) => {
    const { a, b } = c;
    const how =
      c.kind === 'implies'
        ? `${c.text} is the clause (${litName(a)} or ${litName(b)}), added as add_clause(${a}, ${b}).`
        : c.kind === 'force'
          ? `force_true(${a}) adds the clause (${litName(a)} or ${litName(a)}), add_clause(${a}, ${a}).`
          : `add_clause(${a}, ${b}).`;
    for (let i = 0; i < ci; i++) if (clauseState[i].role === 'active') clauseState[i].role = 'idle';
    for (const [id, role] of edgeRole) if (role === 'active') edgeRole.set(id, 'idle');
    if ((a ^ 1) >= N || (b ^ 1) >= N) {
      const firstFits = (a ^ 1) < N;
      if (firstFits) graph[a ^ 1].push(b);
      clauseState[ci] = { role: 'bad', mark: 'bad' };
      const bad = (a ^ 1) >= N ? a : b;
      raised.push(ci);
      snap(
        1,
        `c${ci + 1} (${c.text}): ${how} ${litName(bad)} is node ${bad}, but TwoSAT(${n}) has nodes 0..${N - 1}, so graph[${bad ^ 1}] raises IndexError: list index out of range. ` +
          (firstFits
            ? `The first append, ${litName(a ^ 1)} ${ARROW} node ${b}, already happened, so the graph keeps an edge to a node that does not exist.`
            : 'Nothing was appended.') +
          ' The script goes on with the next clause.',
        [['a', a], ['b', b], ['2n', N]],
      );
      return;
    }
    graph[a ^ 1].push(b);
    edgeRole.set(edgeId(a ^ 1, graph[a ^ 1].length - 1), 'active');
    graph[b ^ 1].push(a);
    edgeRole.set(edgeId(b ^ 1, graph[b ^ 1].length - 1), 'active');
    clauseState[ci] = { role: 'active' };
    const na = litName(a ^ 1);
    const nb = litName(b ^ 1);
    let why: string;
    if (a === b) {
      why = `If ${litName(a)} were false, the clause would need ${litName(a)} to be true: the edge ${na} ${ARROW} ${litName(a)}, added twice (once per literal). Only ${litName(a)} = true avoids the contradiction.`;
    } else if (a === (b ^ 1)) {
      why = `Each half implies itself: ${na} ${ARROW} ${litName(b)} and ${nb} ${ARROW} ${litName(a)} are self-loops. A clause like this is always true and forces nothing.`;
    } else {
      why = `If ${litName(a)} is false, ${litName(b)} must be true: ${na} ${ARROW} ${litName(b)}. Its contrapositive, if ${litName(b)} is false then ${litName(a)} must be true, is the second edge ${nb} ${ARROW} ${litName(a)}.`;
    }
    snap(1, `c${ci + 1} (${c.text}): ${how} ${why}`, [['a', a], ['b', b], ['a ^ 1', a ^ 1], ['b ^ 1', b ^ 1]]);
  });
  for (const cs of clauseState) if (cs.role === 'active') cs.role = 'idle';
  edgeRole.clear();

  // ---------------------------------------------------------------- solve(): iterative Tarjan
  const comp = Array<number>(N).fill(-1);
  const disc = Array<number>(N).fill(-1);
  const low = Array<number>(N).fill(-1);
  const onStack = Array<boolean>(N).fill(false);
  const stack: number[] = [];
  const components: number[][] = [];
  let timer = 0;
  let sccId = 0;
  let work: Array<[number, number]> = [];

  const showDl = (u: number) => badges.set(u, `${disc[u]}/${low[u]}`);
  const tarjanStrips = () => {
    strips = [
      { label: 'Work stack', items: work.map(([u, i]) => ({ text: `(${litName(u)}, ${i})` })), empty: '(empty)' },
      { label: 'Tarjan stack', items: stack.map((u) => ({ text: litName(u) })), empty: '(empty)' },
      { label: 'Components', items: components.map((c, k) => ({ text: `C${k}: ${c.map(litName).join(' ')}` })), empty: '(none yet)' },
    ];
  };
  const paintNodes = () => {
    nodeRole.clear();
    for (let l = 0; l < N; l++) {
      if (comp[l] !== -1) nodeRole.set(l, 'done');
      else if (onStack[l]) nodeRole.set(l, 'compare');
    }
    if (work.length) nodeRole.set(work[work.length - 1][0], 'active');
  };
  const tv = (u?: number, ...extra: Vars): Vars => [
    ...(u === undefined ? [] : ([['u', litName(u)], ['disc[u]', disc[u]], ['low[u]', low[u]]] as Vars)),
    ...extra,
    ['timer', timer],
    ['scc_id', sccId],
  ];

  tarjanStrips();
  snap(
    2,
    `solve() runs Tarjan's algorithm on the ${plural(N, 'node')} and ${plural(graph.reduce((s, l) => s + l.length, 0), 'edge')}, starting a DFS from every node without a discovery time, in node order. Badges show disc/low; low is the smallest disc a node reaches while staying among nodes on the stack.`,
    tv(),
  );

  const finishRun = (): TwoSatRun => ({ frames, ok: null, assignment: null, comp, raised, solveRaised: true, graph });

  for (let s = 0; s < N; s++) {
    if (disc[s] !== -1) continue;
    work = [[s, 0]];
    paintNodes();
    tarjanStrips();
    snap(2, `disc[${s}] == -1: ${litName(s)} (node ${s}) has not been discovered, so dfs(${s}) starts with work = [(${litName(s)}, 0)].`, tv());
    while (work.length) {
      const top = work[work.length - 1];
      const [u, i] = top;
      if (i === 0) {
        disc[u] = timer;
        low[u] = timer;
        timer++;
        stack.push(u);
        onStack[u] = true;
        showDl(u);
        paintNodes();
        tarjanStrips();
        snap(
          4,
          `Discover ${litName(u)}: disc = low = ${disc[u]}. Push it on the Tarjan stack, where it stays until its whole component is known.`,
          tv(u),
        );
      }
      if (i < graph[u].length) {
        top[1] = i + 1;
        const v = graph[u][i];
        const id = edgeId(u, i);
        if (v >= N) {
          paintNodes();
          tarjanStrips();
          snap(
            5,
            `graph[${u}][${i}] is node ${v}, left behind by the add_clause that raised. disc[${v}] is out of range for ${N} nodes, so solve() raises IndexError: list index out of range, and there is no answer.`,
            tv(u, ['v', v]),
          );
          return finishRun();
        }
        if (disc[v] === -1) {
          work.push([v, 0]);
          edgeRole.set(id, 'done');
          paintNodes();
          nodeRole.set(u, 'compare');
          tarjanStrips();
          snap(
            6,
            `Edge ${litName(u)} ${ARROW} ${litName(v)} (graph[${u}][${i}]): ${litName(v)} has no discovery time, so this is a tree edge. Push (${litName(v)}, 0) on the work stack and visit it next.`,
            tv(u, ['v', litName(v)], ['i', i]),
            { edges: { [id]: 'compare' } },
          );
        } else if (onStack[v]) {
          const before = low[u];
          low[u] = Math.min(low[u], disc[v]);
          showDl(u);
          edgeRole.set(id, 'muted');
          paintNodes();
          tarjanStrips();
          snap(
            7,
            `Edge ${litName(u)} ${ARROW} ${litName(v)}: ${litName(v)} is still on the stack, so its component is open and ${litName(u)} can reach back into it. low[${litName(u)}] = min(${before}, disc[${litName(v)}] = ${disc[v]}) = ${low[u]}.`,
            tv(u, ['v', litName(v)], ['i', i]),
            { edges: { [id]: 'compare' } },
          );
        } else {
          edgeRole.set(id, 'muted');
          paintNodes();
          tarjanStrips();
          snap(
            5,
            `Edge ${litName(u)} ${ARROW} ${litName(v)}: ${litName(v)} already belongs to the finished component C${comp[v]}, which cannot reach back to ${litName(u)}. Neither branch applies, so the edge changes nothing.`,
            tv(u, ['v', litName(v)], ['i', i]),
            { edges: { [id]: 'compare' } },
          );
        }
        continue;
      }
      // Every edge of u is done.
      let root = '';
      if (low[u] === disc[u]) {
        const members: number[] = [];
        for (;;) {
          const w = stack.pop()!;
          onStack[w] = false;
          comp[w] = sccId;
          members.push(w);
          if (w === u) break;
        }
        components.push(members);
        for (const w of members) badges.set(w, `C${sccId}`);
        root = `low[${litName(u)}] = disc[${litName(u)}] = ${disc[u]}: nothing below ${litName(u)} reaches an older node on the stack, so ${litName(u)} roots a component. Pop the stack down to it: ${set(members.map(litName))} gets comp id ${sccId}.`;
        sccId++;
      }
      work.pop();
      let back = '';
      if (work.length) {
        const p = work[work.length - 1][0];
        const before = low[p];
        low[p] = Math.min(low[p], low[u]);
        showDl(p);
        back = ` Back in ${litName(p)}: low[${litName(p)}] = min(${before}, low[${litName(u)}] = ${low[u]}) = ${low[p]}.`;
      }
      paintNodes();
      tarjanStrips();
      if (root) {
        snap(9, root + back, tv(u));
      } else {
        snap(
          10,
          `Every edge of ${litName(u)} is done, but low[${litName(u)}] = ${low[u]} < disc[${litName(u)}] = ${disc[u]}: it reaches an older node still on the stack, so it stays there and joins that node's component.${back}`,
          tv(u),
        );
      }
    }
  }
  work = [];
  tarjanStrips();

  // ---------------------------------------------------------------- assignment
  edgeRole.clear();
  nodeRole.clear();
  snap(
    11,
    `Tarjan is done: ${plural(sccId, 'component')}, numbered in finishing order. A component finishes only after everything it reaches, so a lower id sits later in topological order: C0 is a sink. Now compare each variable's two literals.`,
    tv(),
  );
  const assignment = Array<boolean>(n).fill(false);
  for (let x = 0; x < n; x++) {
    const p = 2 * x;
    const q = 2 * x + 1;
    if (comp[p] === comp[q]) {
      const there = pathWithin(graph, comp, p, q);
      const back = pathWithin(graph, comp, q, p);
      const hot: Record<string, Role> = {};
      for (const walk of [there, back]) {
        for (let k = 0; k + 1 < walk.length; k++) hot[edgeId(walk[k], graph[walk[k]].indexOf(walk[k + 1]))] = 'active';
      }
      const walkText = (walk: number[]) => walk.map(litName).join(` ${ARROW} `);
      values[x] = { text: `x${x} = ${SYM.cross}`, role: 'bad' };
      snap(
        12,
        `comp[x${x}] = comp[~x${x}] = ${comp[p]}: x${x} and ~x${x} are in one component, so each implies the other: ${walkText(there)}, and ${walkText(back)}. ` +
          `Setting x${x} true forces it false and the other way round, so no assignment works: return False, None.`,
        tv(undefined, ['x', x], ['comp[2x]', comp[p]], ['comp[2x+1]', comp[q]]),
        { nodes: { [p]: 'bad', [q]: 'bad' }, edges: hot },
      );
      return { frames, ok: false, assignment: null, comp, raised, solveRaised: false, graph };
    }
    assignment[x] = comp[p] < comp[q];
    const t = assignment[x] ? p : q;
    nodeRole.set(t, 'good');
    nodeRole.set(t ^ 1, 'muted');
    values[x] = { text: `x${x} = ${assignment[x] ? 'T' : 'F'}`, role: 'done' };
    snap(
      13,
      `comp[x${x}] = ${comp[p]} ${assignment[x] ? '<' : '>'} comp[~x${x}] = ${comp[q]}: ${litName(t)}'s component finished first, so it comes later in topological order and nothing true can force it false. ` +
        `assignment[${x}] = ${assignment[x] ? 'True' : 'False'}: ${litName(t)} is true, ${litName(t ^ 1)} is false.`,
      tv(undefined, ['x', x], ['comp[2x]', comp[p]], ['comp[2x+1]', comp[q]]),
    );
  }
  const py = `[${assignment.map((v) => (v ? 'True' : 'False')).join(', ')}]`;
  snap(14, `No variable shares a component with its negation: return True, ${py}.`, tv());

  clauses.forEach((c, ci) => {
    for (let i = 0; i < ci; i++) if (clauseState[i].role === 'compare') clauseState[i].role = 'good';
    if (raised.includes(ci)) {
      snap(15, `c${ci + 1} (${c.text}) raised IndexError in add_clause and is not part of the graph, so there is nothing to check.`, [['clause', `c${ci + 1}`]]);
      return;
    }
    const va = litValue(c.a, assignment);
    const vb = litValue(c.b, assignment);
    const holds = va || vb;
    clauseState[ci] = { role: holds ? 'compare' : 'bad', mark: holds ? 'ok' : 'bad' };
    const which = va ? c.a : c.b;
    snap(
      15,
      holds
        ? `c${ci + 1} (${litName(c.a)} or ${litName(c.b)}): ${litName(which)} is true, so the clause holds ${SYM.check}.`
        : `c${ci + 1} (${litName(c.a)} or ${litName(c.b)}): both literals are false ${SYM.cross}.`,
      [['clause', `c${ci + 1}`], [litName(c.a), String(va)], [litName(c.b), String(vb)]],
      { nodes: { [which]: 'active' } },
    );
  });
  for (const cs of clauseState) if (cs.role === 'compare') cs.role = 'good';
  snap(
    15,
    clauses.length > raised.length
      ? `Every clause${raised.length ? ' that was added' : ''} holds, so ${py} satisfies the formula, as the tests' check_assignment confirms.`
      : `There are no clauses, so ${py} trivially satisfies the formula.`,
    tv(),
  );
  return { frames, ok: true, assignment, comp, raised, solveRaised: false, graph };
}

/** A shortest path from s to t that stays inside their component (both are in it). */
function pathWithin(graph: number[][], comp: number[], s: number, t: number): number[] {
  const prev = new Map<number, number>([[s, -1]]);
  const queue = [s];
  while (queue.length) {
    const u = queue.shift()!;
    if (u === t && u !== s) break;
    for (const v of graph[u]) {
      if (v < comp.length && comp[v] === comp[s] && !prev.has(v)) {
        prev.set(v, u);
        queue.push(v);
      }
    }
  }
  const path = [t];
  while (path[path.length - 1] !== s) path.push(prev.get(path[path.length - 1])!);
  return path.reverse();
}
