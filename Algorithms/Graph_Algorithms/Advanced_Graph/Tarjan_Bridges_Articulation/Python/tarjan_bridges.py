"""Tarjan's algorithm for bridges & articulation points in an undirected graph.

Finds both in a single O(V + E) DFS using:
    disc[u] : discovery time of u
    low[u]  : smallest disc[] reachable from u's subtree (including one back edge)

Bridge rule:      low[v] >  disc[u]  on tree edge (u, v)
Articulation:     low[v] >= disc[u]  (non-root) or root has >= 2 DFS children
"""

import sys
from typing import Dict, List, Set, Tuple


def find_bridges_and_articulations(
    n: int, edges: List[Tuple[int, int]]
) -> Tuple[List[Tuple[int, int]], List[int]]:
    """Return (bridges, articulation_points) for an undirected graph on vertices 0..n-1.

    Edges are (u, v) pairs. Self-loops and parallel edges are supported.
    """
    adj: Dict[int, List[Tuple[int, int]]] = {i: [] for i in range(n)}
    for idx, (u, v) in enumerate(edges):
        adj[u].append((v, idx))
        adj[v].append((u, idx))

    disc = [-1] * n
    low = [-1] * n
    bridges: List[Tuple[int, int]] = []
    articulations: Set[int] = set()
    timer = [0]

    # Bump recursion limit for safety on long chains.
    old_limit = sys.getrecursionlimit()
    sys.setrecursionlimit(max(old_limit, n + 100))

    def dfs(u: int, parent_edge: int) -> None:
        disc[u] = low[u] = timer[0]
        timer[0] += 1
        children = 0
        for v, edge_idx in adj[u]:
            if edge_idx == parent_edge:
                continue                   # skip the edge we came in on
            if disc[v] == -1:              # tree edge
                children += 1
                dfs(v, edge_idx)
                low[u] = min(low[u], low[v])
                if low[v] > disc[u]:
                    bridges.append((min(u, v), max(u, v)))
                if parent_edge != -1 and low[v] >= disc[u]:
                    articulations.add(u)
            else:                           # back edge
                low[u] = min(low[u], disc[v])
        if parent_edge == -1 and children > 1:
            articulations.add(u)

    try:
        for start in range(n):
            if disc[start] == -1:
                dfs(start, -1)
    finally:
        sys.setrecursionlimit(old_limit)

    return sorted(bridges), sorted(articulations)


if __name__ == "__main__":
    # Example: triangle 0-1-2-0 plus tail 2-3
    edges = [(0, 1), (1, 2), (2, 0), (2, 3)]
    bridges, aps = find_bridges_and_articulations(4, edges)
    print(f"Bridges: {bridges}")
    print(f"Articulation points: {aps}")
