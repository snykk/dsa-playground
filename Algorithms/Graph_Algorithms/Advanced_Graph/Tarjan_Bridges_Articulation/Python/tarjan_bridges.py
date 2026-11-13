"""Tarjan's algorithm for bridges & articulation points in an undirected graph.

Finds both in a single O(V + E) DFS using:
    disc[u] : discovery time of u
    low[u]  : smallest disc[] reachable from u's subtree (including one back edge)

Bridge rule:      low[v] >  disc[u]  on tree edge (u, v)
Articulation:     low[v] >= disc[u]  (non-root) or root has >= 2 DFS children
"""

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
    timer = 0

    # Iterative DFS. Each frame is [u, parent_edge, next adjacency index, children]
    # and stands for one call of the recursive dfs(u, parent_edge). An explicit
    # stack avoids Python's recursion limit; raising that limit instead lets a long
    # path (n = 100000) overflow the C stack and crash the interpreter.
    for start in range(n):
        if disc[start] != -1:
            continue
        disc[start] = low[start] = timer
        timer += 1
        stack = [[start, -1, 0, 0]]
        while stack:
            frame = stack[-1]
            u, parent_edge, i = frame[0], frame[1], frame[2]
            if i < len(adj[u]):
                frame[2] += 1
                v, edge_idx = adj[u][i]
                if edge_idx == parent_edge:
                    continue                   # skip the edge we came in on
                if disc[v] == -1:              # tree edge: descend into v
                    frame[3] += 1
                    disc[v] = low[v] = timer
                    timer += 1
                    stack.append([v, edge_idx, 0, 0])
                else:                          # back edge
                    low[u] = min(low[u], disc[v])
                continue
            # u is finished: return to its parent p, as after a recursive call
            stack.pop()
            if stack:
                p, p_parent_edge = stack[-1][0], stack[-1][1]
                low[p] = min(low[p], low[u])
                if low[u] > disc[p]:
                    bridges.append((min(p, u), max(p, u)))
                if p_parent_edge != -1 and low[u] >= disc[p]:
                    articulations.add(p)
            elif frame[3] > 1:                 # root with >= 2 DFS children
                articulations.add(u)

    return sorted(bridges), sorted(articulations)


if __name__ == "__main__":
    # Example: triangle 0-1-2-0 plus tail 2-3
    edges = [(0, 1), (1, 2), (2, 0), (2, 3)]
    bridges, aps = find_bridges_and_articulations(4, edges)
    print(f"Bridges: {bridges}")
    print(f"Articulation points: {aps}")
