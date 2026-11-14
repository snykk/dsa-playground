import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import { cellGeometry, stabilizeGraphRep, vertexPositions, type GraphRepState } from '../renderers/GraphRepresentationView';
import fixtures from './__fixtures__/heapsGraphs.json';
import { matrixSize, parseRep, pyNumRepr, REP_CODE, repTrace, type PyNum, type RepInput, type RepMode, type RepOp } from './graphRepresentations';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

type FixtureOp = [string, ...Array<number | string | null>];
interface FixtureCase {
  mode: RepMode;
  directed: boolean;
  weighted: boolean;
  n: number | null;
  ops: FixtureOp[];
  initial: string;
  steps: Array<{ result: string | null; error: string | null; state: string }>;
}

const weightOf = (text: string): PyNum => ({ v: Number(text), f: text.includes('.') });

function toOp([kind, ...args]: FixtureOp): RepOp {
  const [a, b, c] = args as Array<number | string | null>;
  switch (kind) {
    case 'add_edge':
      return { kind, u: a as number, v: b as number, w: c === null ? null : weightOf(c as string) };
    case 'remove_edge':
    case 'has_edge':
    case 'get_weight':
      return { kind, u: a as number, v: b as number };
    case 'add_vertex':
    case 'get_neighbors':
    case 'get_degree':
      return { kind, v: a as number };
    default:
      return { kind } as RepOp;
  }
}

/** Every frame: a caption, a line in range, unique ids, edges between drawn vertices, ChainView links to drawn nodes. */
function expectWellFormed(frames: Array<Frame<GraphRepState>>, mode: RepMode) {
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(10);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(REP_CODE[mode].length);
    }
    const vs = f.state.vertices.map((v) => v.id);
    expect(new Set(vs).size).toBe(vs.length);
    for (const e of f.state.edges) {
      expect(vs, f.caption).toContain(e.from);
      expect(vs, f.caption).toContain(e.to);
    }
    const keys = f.state.edges.map((e) => e.key);
    expect(new Set(keys).size).toBe(keys.length);
    const s = f.state.store;
    if (s.kind === 'chain') {
      const ids = s.state.nodes.map((n) => n.id);
      expect(new Set(ids).size, f.caption).toBe(ids.length);
      for (const l of s.state.links) {
        expect(ids).toContain(l.from);
        if (l.to !== null) expect(ids).toContain(l.to);
      }
    } else if (s.kind === 'cells') {
      const ids = s.cells.map((c) => c.id);
      expect(new Set(ids).size, f.caption).toBe(ids.length);
      const places = s.cells.map((c) => c.index);
      expect(new Set(places).size, `cells overlap: ${f.caption}`).toBe(places.length);
    } else {
      for (const k of Object.keys(s.state.roles)) {
        const [r, c] = k.split(',').map(Number);
        expect(r).toBeLessThan(s.state.cells.length);
        expect(c).toBeLessThan(s.state.cells.length);
      }
    }
  }
}

/** The reference model: a map of edges (key -> weight) and the set of known vertices. */
function checkAgainstModel(input: RepInput) {
  const { mode, directed } = input;
  const weighted = mode === 'weighted' || (input.weighted && mode !== 'graph');
  const n = mode === 'matrix' ? matrixSize(input) : 0;
  const run = repTrace(input);
  const edges = new Map<string, PyNum | null>();
  const vertices = new Set<number>();
  if (mode === 'list' && input.n) for (let i = 0; i < input.n; i++) vertices.add(i);
  const key = (u: number, v: number) => (directed ? `${u}>${v}` : `${Math.min(u, v)}~${Math.max(u, v)}`);
  const inRange = (x: number) => x >= 0 && x < n;
  const has = (u: number, v: number) => edges.has(key(u, v));
  const neighbors = (v: number) => [...new Set([...edges.keys()].flatMap((k) => {
    const [a, b] = k.split(/[>~]/).map(Number);
    return directed ? (a === v ? [b] : []) : a === v ? [b] : b === v ? [a] : [];
  }))].sort((x, y) => x - y);
  const methods: Record<RepMode, string[]> = {
    list: ['add_vertex', 'add_edge', 'remove_edge', 'has_edge', 'get_neighbors', 'get_weight', 'get_degree'],
    matrix: ['add_edge', 'remove_edge', 'has_edge', 'get_neighbors', 'get_weight', 'get_degree'],
    edges: ['add_edge', 'remove_edge', 'has_edge', 'get_neighbors', 'get_weight', 'get_edge_count'],
    graph: ['add_vertex', 'add_edge', 'remove_edge', 'has_edge', 'get_neighbors', 'get_degree'],
    weighted: ['add_vertex', 'add_edge', 'remove_edge', 'has_edge', 'get_weight', 'get_neighbors', 'get_total_weight'],
  };
  input.ops.forEach((op, i) => {
    const step = run.steps[i];
    if (!methods[mode].includes(op.kind)) {
      expect(step.error).toBe('AttributeError');
      return;
    }
    if (mode === 'graph' && op.kind === 'add_edge' && op.w) {
      expect(step.error).toBe('TypeError');
      return;
    }
    if (mode === 'matrix' && op.kind === 'add_edge' && (!inRange(op.u) || !inRange(op.v))) {
      expect(step.error).toBe('ValueError');
      return;
    }
    expect(step.error).toBeNull();
    const known = (v: number) => (mode === 'matrix' ? inRange(v) : vertices.has(v));
    switch (op.kind) {
      case 'add_vertex':
        vertices.add(op.v);
        break;
      case 'add_edge': {
        vertices.add(op.u);
        vertices.add(op.v);
        const k = key(op.u, op.v);
        if (mode === 'graph') {
          if (!edges.has(k)) edges.set(k, null);
        } else edges.set(k, weighted ? (op.w ?? { v: 1, f: true }) : null);
        break;
      }
      case 'remove_edge':
        if (mode !== 'matrix' || (inRange(op.u) && inRange(op.v))) edges.delete(key(op.u, op.v));
        break;
      case 'has_edge':
        expect(step.result).toBe(has(op.u, op.v) ? 'True' : 'False');
        break;
      case 'get_weight': {
        const w = edges.get(key(op.u, op.v));
        expect(step.result).toBe(weighted && w ? pyNumRepr(w) : 'None');
        break;
      }
      case 'get_neighbors':
        expect(
          JSON.parse(step.result!)
            .map(Number)
            .sort((a: number, b: number) => a - b),
        ).toEqual(known(op.v) ? neighbors(op.v) : []);
        break;
      case 'get_degree': {
        if (!known(op.v)) {
          expect(step.result).toBe('0');
          break;
        }
        const out = directed ? neighbors(op.v).length : neighbors(op.v).length;
        const inn = directed ? [...edges.keys()].filter((k) => Number(k.split('>')[1]) === op.v).length : 0;
        expect(step.result).toBe(String(out + inn));
        break;
      }
      case 'get_edge_count':
        expect(step.result).toBe(String(edges.size));
        break;
      case 'get_total_weight': {
        let total = 0;
        for (const w of edges.values()) total += w!.v;
        expect(Number(step.result)).toBeCloseTo(total, 9);
        expect(step.result).toMatch(/\./);
        break;
      }
      default:
        break;
    }
  });
  // The drawn graph of the last frame is the model.
  const last = run.frames[run.frames.length - 1].state;
  expect(last.edges.map((e) => e.key).sort()).toEqual([...edges.keys()].sort());
  if (mode !== 'matrix') expect(last.vertices.map((v) => v.id).sort((a, b) => a - b)).toEqual([...vertices].sort((a, b) => a - b));
  return run;
}

function randomInput(rand: () => number, mode: RepMode): RepInput {
  const directed = rand() < 0.5;
  const weighted = mode === 'weighted' || (mode !== 'graph' && rand() < 0.5);
  const n = mode === 'matrix' ? 2 + Math.floor(rand() * 5) : mode === 'list' && rand() < 0.3 ? 3 : null;
  const ops: RepOp[] = [];
  const live = new Set<string>();
  const weights: Array<PyNum | null> = [null, null, { v: 1, f: false }, { v: 2.5, f: true }, { v: 0, f: false }, { v: -1, f: false }, { v: 1, f: true }, { v: 0.1, f: true }];
  const count = 1 + Math.floor(rand() * 24);
  for (let i = 0; i < count; i++) {
    const u = Math.floor(rand() * 6);
    const v = Math.floor(rand() * 6);
    const k = directed ? `${u}>${v}` : `${Math.min(u, v)}~${Math.max(u, v)}`;
    const r = rand();
    if (r < 0.45 && (live.has(k) || live.size < 12)) {
      ops.push({ kind: 'add_edge', u, v, w: mode === 'graph' && rand() < 0.9 ? null : weights[Math.floor(rand() * weights.length)] });
      live.add(k);
    } else if (r < 0.6) {
      ops.push({ kind: 'remove_edge', u, v });
      live.delete(k);
    } else if (r < 0.7) ops.push({ kind: 'has_edge', u, v });
    else if (r < 0.77) ops.push({ kind: 'get_weight', u, v });
    else if (r < 0.84) ops.push({ kind: 'get_neighbors', v: u });
    else if (r < 0.9) ops.push({ kind: 'get_degree', v: u });
    else if (r < 0.94) ops.push({ kind: 'add_vertex', v: u });
    else if (r < 0.97) ops.push({ kind: 'get_edge_count' });
    else ops.push({ kind: 'get_total_weight' });
  }
  return { mode, directed, weighted, n, ops };
}

describe('repTrace', () => {
  const cases = (fixtures as unknown as { graphs: FixtureCase[] }).graphs;

  it('reproduces every stored form and return value of the five Python classes', () => {
    expect(cases.length).toBeGreaterThanOrEqual(100);
    for (const c of cases) {
      const run = repTrace({ mode: c.mode, directed: c.directed, weighted: c.weighted, n: c.n, ops: c.ops.map(toOp) });
      const where = `${c.mode} directed=${c.directed} weighted=${c.weighted} n=${c.n} ${JSON.stringify(c.ops)}`;
      expect(run.initial, where).toBe(c.initial);
      expect(run.steps.map((s) => ({ result: s.result, error: s.error, state: s.state })), where).toEqual(c.steps);
    }
  });

  it.each(['list', 'matrix', 'edges', 'graph', 'weighted'] as const)('agrees with an edge-map model on random %s scripts', (mode) => {
    const rand = rng({ list: 1, matrix: 2, edges: 3, graph: 4, weighted: 5 }[mode]);
    for (let t = 0; t < 120; t++) {
      const run = checkAgainstModel(randomInput(rand, mode));
      expectWellFormed(stabilizeGraphRep(run.frames), mode);
    }
  });

  it('stores an undirected edge twice and a self-loop once, in every layout', () => {
    for (const mode of ['list', 'edges', 'graph', 'weighted'] as const) {
      const input = parseRep(mode === 'graph' || mode === 'weighted' ? 'add 1 2, add 3 3' : 'add 1 2, add 3 3', mode);
      const run = repTrace(input);
      const last = run.frames[run.frames.length - 1].state.store;
      const stored = last.kind === 'chain' ? last.state.nodes.filter((nd) => nd.label !== '[]').length : last.kind === 'cells' ? last.cells.length : 0;
      expect(stored, mode).toBe(3);
    }
    const m = repTrace(parseRep('n 4; add 1 2, add 3 3', 'matrix'));
    expect(m.steps[1].state).toContain('[[False, False, False, False], [False, False, True, False], [False, True, False, False], [False, False, False, True]]');
  });

  it('replaces a repeated edge in the list and the edge list, but keeps it in Graph', () => {
    const list = repTrace(parseRep('weighted; add 0 1 4, add 0 2 1, add 0 1 7', 'list'));
    expect(list.steps[2].state).toBe('[(0, [(2, 1), (1, 7)]), (1, [(0, 7)]), (2, [(0, 1)])]');
    const graph = repTrace(parseRep('add 0 1, add 0 2, add 0 1', 'graph'));
    expect(graph.steps[2].state).toBe('[(0, [1, 2]), (1, [0]), (2, [0])]');
    const el = repTrace(parseRep('add 0 1, add 0 2, add 0 1', 'edges'));
    expect(el.steps[2].state).toBe('[(0, 2), (2, 0), (0, 1), (1, 0)] [0, 1, 2]');
  });

  it('keeps a zero weight apart from "no edge" in the matrix, and raises ValueError out of range', () => {
    const run = repTrace(parseRep('weighted; n 3; add 0 1 0, has 0 1, weight 0 1, add 0 5, remove 0 5, has 2 9', 'matrix'));
    expect(run.steps.map((s) => s.result ?? s.error)).toEqual(['None', 'True', '0', 'ValueError', 'None', 'False']);
  });

  it('counts an undirected self-loop as one edge in the edge list', () => {
    const run = repTrace(parseRep('add 1 2, add 3 3, count', 'edges'));
    expect(run.steps[2].result).toBe('2');
  });

  it('raises AttributeError for a method the class lacks, and TypeError for a weight on Graph', () => {
    expect(repTrace(parseRep('vertex 3', 'matrix')).steps[0].error).toBe('AttributeError');
    expect(repTrace(parseRep('add 0 1, degree 0', 'edges')).steps[1].error).toBe('AttributeError');
    expect(repTrace(parseRep('add 0 1 5', 'graph')).steps[0].error).toBe('TypeError');
    expect(repTrace(parseRep('add 0 1, total', 'list')).steps[1].error).toBe('AttributeError');
  });

  it('sums weights as Python floats', () => {
    const run = repTrace(parseRep('add 0 1 0.1, add 1 2 0.2, total', 'weighted'));
    expect(run.steps[2].result).toBe('0.30000000000000004');
    expect(pyNumRepr({ v: 7, f: true })).toBe('7.0');
    expect(pyNumRepr({ v: Infinity, f: true })).toBe('inf');
  });
});

describe('GraphRepresentationView layout', () => {
  it('gives every vertex its own place and packs list entries like list cells', () => {
    const pos = vertexPositions([0, 1, 2, 3, 4, 5, 6, 7]);
    const pts = [...pos.values()];
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) expect(Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y)).toBeGreaterThan(60);
    const frames = stabilizeGraphRep(repTrace(parseRep('add 0 1, add 0 2, add 0 3', 'list')).frames);
    const row = frames[frames.length - 1].state.store;
    if (row.kind !== 'chain') throw new Error('chain expected');
    const cols = row.state.nodes.filter((n) => n.row === 0).map((n) => n.col);
    // Every vertex has a row, an empty list included.
    expect(new Set(row.state.nodes.map((n) => n.row)).size).toBe(row.state.lanes!.length);
    expect(cols[1] - cols[0]).toBeLessThan(1);
    for (const f of frames) expect(f.state.layout).toEqual([0, 1, 2, 3]);
  });

  it('fits the largest edge list in a few rows', () => {
    const g = cellGeometry({ count: 24, chars: '(0, 1, -2.5)'.length });
    expect(g.perRow).toBeGreaterThanOrEqual(3);
    expect(g.height).toBeLessThanOrEqual(440);
  });
});

describe('parseRep', () => {
  it('reads the header, calls and short forms', () => {
    const input = parseRep('directed weighted n 4; 0-1:2.5, add(1, 2), remove 0 1, has 1 2, neighbors 1, weight 1 2, degree 1, vertex 3, count, total', 'list');
    expect(input.directed).toBe(true);
    expect(input.weighted).toBe(true);
    expect(input.n).toBe(4);
    expect(input.ops[0]).toEqual({ kind: 'add_edge', u: 0, v: 1, w: { v: 2.5, f: true } });
    expect(input.ops.map((o) => o.kind)).toEqual(['add_edge', 'add_edge', 'remove_edge', 'has_edge', 'get_neighbors', 'get_weight', 'get_degree', 'add_vertex', 'get_edge_count', 'get_total_weight']);
    expect(parseRep('add 0 1', 'list').directed).toBe(false);
  });

  it('rejects what a class or the picture cannot take', () => {
    expect(() => parseRep('weighted; add 0 1', 'graph')).toThrow(/no weights/);
    expect(() => parseRep('n 3; add 0 1', 'weighted')).toThrow(/no vertex count/);
    expect(() => parseRep('n 9; add 0 1', 'matrix')).toThrow(/n goes from 1 to 8/);
    expect(() => parseRep('add 0 100', 'list')).toThrow(InputError);
    expect(() => parseRep('add 0 1 2.55', 'list')).toThrow(/not a weight/);
    expect(() => parseRep('add 0 1, add 2 3, add 4 5, add 6 7, add 8 9', 'edges')).toThrow(/At most 8 different vertices/);
    expect(() => parseRep('jump 0 1', 'list')).toThrow(/Cannot read/);
    const many = Array.from({ length: 13 }, (_, i) => `add ${i % 5} ${(i * 2 + 1) % 7}`).join(', ');
    expect(() => parseRep(`directed; ${many}`, 'list')).toThrow(InputError);
  });
});
