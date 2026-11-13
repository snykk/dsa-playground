import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { adjacency, bfs, dfs, dijkstra, finalBadges, parseGraph, type Graph } from './graph';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function randomGraphs(count: number, weighted: boolean): Graph[] {
  const rand = rng(7);
  const out: Graph[] = [];
  for (let t = 0; t < count; t++) {
    const n = 2 + Math.floor(rand() * 9);
    const names = Array.from({ length: n }, (_, i) => String.fromCharCode(65 + i));
    const directed = rand() < 0.4;
    const parts: string[] = [];
    const m = 1 + Math.floor(rand() * n * 2);
    for (let k = 0; k < m; k++) {
      const a = names[Math.floor(rand() * n)];
      const b = names[Math.floor(rand() * n)];
      if (a === b) continue;
      parts.push(`${a}${directed ? '->' : '-'}${b}${weighted ? ` ${Math.floor(rand() * 15)}` : ''}`);
    }
    if (parts.length === 0) parts.push(`A${directed ? '->' : '-'}B`);
    const hasA = parts.some((p) => /(^|[->\s])A(\b|$)/.test(p.replace(/ \d+$/, '')));
    out.push(parseGraph(hasA ? `${parts.join(', ')}; start A` : parts.join(', ')));
  }
  return out;
}

function referenceBfs(g: Graph): Map<string, number> {
  const adj = adjacency(g);
  const dist = new Map([[g.start, 0]]);
  const q = [g.start];
  while (q.length) {
    const u = q.shift()!;
    for (const { to } of adj.get(u)!) {
      if (!dist.has(to)) {
        dist.set(to, dist.get(u)! + 1);
        q.push(to);
      }
    }
  }
  return dist;
}

function referenceDfsOrder(g: Graph): string[] {
  const adj = adjacency(g);
  const seen = new Set<string>();
  const order: string[] = [];
  const go = (u: string) => {
    seen.add(u);
    order.push(u);
    for (const { to } of adj.get(u)!) if (!seen.has(to)) go(to);
  };
  go(g.start);
  return order;
}

function bellmanFord(g: Graph): Map<string, number> {
  const dist = new Map(g.nodes.map((n) => [n, Infinity]));
  dist.set(g.start, 0);
  for (let i = 0; i < g.nodes.length; i++) {
    for (const e of g.edges) {
      const pairs: Array<[string, string]> = e.directed ? [[e.from, e.to]] : [[e.from, e.to], [e.to, e.from]];
      for (const [a, b] of pairs) {
        if (dist.get(a)! + e.weight < dist.get(b)!) dist.set(b, dist.get(a)! + e.weight);
      }
    }
  }
  return dist;
}

describe('parseGraph', () => {
  it('reads undirected, directed and weighted edges plus the start option', () => {
    const g = parseGraph('A-B 4, B->C, C-A 2; start B');
    expect(g.nodes).toEqual(['A', 'B', 'C']);
    expect(g.start).toBe('B');
    expect(g.edges[1]).toMatchObject({ from: 'B', to: 'C', directed: true, weight: 1, weighted: false });
  });
  it.each(['', 'A-A', 'A-B; start Z', 'A=B', 'LONGNAME-B'])('rejects %j with a friendly message', (bad) => {
    expect(() => parseGraph(bad)).toThrow(InputError);
  });
});

describe('BFS', () => {
  it('labels every reachable vertex with its hop distance', () => {
    for (const g of randomGraphs(200, false)) {
      const badges = finalBadges(bfs(g));
      for (const [node, d] of referenceBfs(g)) expect(badges[node]).toBe(`d=${d}`);
      for (const n of g.nodes) if (!referenceBfs(g).has(n)) expect(badges[n]).toBeUndefined();
    }
  });
});

describe('DFS', () => {
  it('discovers vertices in recursive DFS order with consistent timestamps', () => {
    for (const g of randomGraphs(200, false)) {
      const frames = dfs(g);
      const last = frames[frames.length - 1];
      const order = last.state.strips?.find((s) => s.label === 'Discovery order')?.items.map((i) => i.text);
      expect(order).toEqual(referenceDfsOrder(g));
      // Parenthesis theorem: discovery < finish for every visited vertex.
      for (const n of last.state.nodes) {
        if (!n.badge) continue;
        const [d, f] = n.badge.split('/').map(Number);
        expect(d).toBeLessThan(f);
      }
    }
  });
});

describe('Dijkstra', () => {
  it('matches Bellman-Ford on random non-negative graphs', () => {
    for (const g of randomGraphs(200, true)) {
      const badges = finalBadges(dijkstra(g));
      for (const [node, d] of bellmanFord(g)) expect(badges[node]).toBe(d === Infinity ? '\u221e' : String(d));
    }
  });
  it('refuses negative weights', () => {
    expect(() => dijkstra(parseGraph('A-B -1'))).toThrow(InputError);
  });
});
