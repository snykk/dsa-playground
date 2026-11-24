"""
Eulerian paths and circuits: a walk that uses every edge of a graph exactly once.

The graph has n vertices, 0 .. n - 1, and a list of edges (u, v), all undirected or all
directed. Self-loops, parallel edges and isolated vertices are allowed.

- eulerian_kind: "circuit", "path" or "none".
- eulerian_path: the walk, found by Hierholzer's algorithm in O(V + E), or None.

When a walk exists (the graph has at least one edge):
- undirected: 0 or 2 vertices have odd degree (a self-loop adds 2 to its vertex's degree),
  and every edge lies in one connected component. With 0 odd vertices the walk is a circuit,
  which ends where it starts; with 2 it is a path from one odd vertex to the other.
- directed: every vertex has out-degree equal to in-degree (a circuit), or one vertex has
  out = in + 1 (the start), one has in = out + 1 (the end) and every other is balanced
  (a path); and every edge lies in one weakly connected component.
Isolated vertices have no edge to walk and play no part. A graph with no edges has the
empty walk: eulerian_kind says "circuit" and eulerian_path returns two empty lists.

Which walk is returned (the tie rule). The start is the smaller of the two odd vertices
(undirected path), the vertex with out = in + 1 (directed path), or the smallest vertex
that has an edge (circuit). adj[v] lists v's edges in the order they are given, an
undirected edge in the lists of both its ends (a self-loop twice in its vertex's list), and
the walk always leaves v by the first edge of adj[v] it has not used yet. The vertices come
out in reverse order of being popped from Hierholzer's stack. The C++ and Go versions follow
the same rule and return the same walk.

The connectivity condition is checked by the walk itself: it can only use edges of the
start's component, so it uses all E edges exactly when they all lie in that component.

The walk keeps its vertices in an explicit stack instead of recursing, so a graph with
10^5 edges in a row does not hit Python's recursion limit.
"""

from typing import Iterable, List, NamedTuple, Optional, Tuple

Edge = Tuple[int, int]

CIRCUIT = "circuit"
PATH = "path"
NONE = "none"


class EulerWalk(NamedTuple):
    """A walk that uses every edge once.

    vertices has E + 1 entries (none when E == 0), and edge_ids[i] is the index, in the input,
    of the edge between vertices[i] and vertices[i + 1].
    """

    vertices: List[int]
    edge_ids: List[int]


def _adjacency(n: int, edges: List[Edge], directed: bool) -> List[List[Tuple[int, int]]]:
    """adj[u]: (neighbour, edge index) pairs in edge order.

    A directed edge u -> v sits in adj[u] only. An undirected edge sits in adj[u] and adj[v],
    so a self-loop sits twice in adj[u], and len(adj[u]) is u's degree.
    """
    if n < 0:
        raise ValueError(f"the number of vertices must be >= 0, got {n}")
    adj: List[List[Tuple[int, int]]] = [[] for _ in range(n)]
    for e, (u, v) in enumerate(edges):
        if not (0 <= u < n and 0 <= v < n):
            raise ValueError(f"edge {e} ({u}, {v}) is outside the graph: both ends must be in [0, {n})")
        adj[u].append((v, e))
        if not directed:
            adj[v].append((u, e))
    return adj


def _degree_check(n: int, edges: List[Edge], directed: bool) -> Tuple[str, int]:
    """The degree half of the test: (kind, start).

    kind is CIRCUIT or PATH when the degrees allow that walk, NONE otherwise. start is where
    the walk must begin: the smaller odd vertex (undirected path), the vertex with
    out = in + 1 (directed path) or the smallest vertex with an edge (circuit). It is -1
    when kind is NONE or there is no edge.
    """
    if not edges:
        return CIRCUIT, -1
    first = min(min(u, v) for u, v in edges)
    if directed:
        surplus = [0] * n  # out-degree minus in-degree
        for u, v in edges:
            surplus[u] += 1
            surplus[v] -= 1
        starts = [v for v in range(n) if surplus[v] == 1]
        ends = [v for v in range(n) if surplus[v] == -1]
        unbalanced = sum(1 for s in surplus if s != 0)
        if unbalanced == 0:
            return CIRCUIT, first
        if unbalanced == 2 and len(starts) == 1 and len(ends) == 1:
            return PATH, starts[0]
        return NONE, -1
    degree = [0] * n
    for u, v in edges:
        degree[u] += 1
        degree[v] += 1  # a self-loop adds 2
    odd = [v for v in range(n) if degree[v] % 2 == 1]
    if not odd:
        return CIRCUIT, first
    if len(odd) == 2:
        return PATH, odd[0]
    return NONE, -1


def _hierholzer(start: int, adj: List[List[Tuple[int, int]]], n_edges: int) -> Tuple[List[int], List[int]]:
    """Hierholzer's algorithm from start, with an explicit stack: (vertices, edge_ids).

    The stack holds the current walk. If its top vertex v has an unused edge, the walk goes
    on along it. If not, v is finished: it is popped onto the result, and the walk backs up
    to the vertex before it, which may start a detour along its own unused edges. A detour
    can only get stuck where it started (every vertex it enters has an unused edge to leave
    by, when the degrees pass the test), so its vertices are popped as a closed circuit,
    spliced into the result at that vertex. The result, read backwards, is the walk.

    ptr[v] is the next entry of adj[v] to look at. It only moves forward, so every entry is
    read once in the whole run and the walk is O(V + E). An undirected edge has two entries;
    the second one met is skipped as used.
    """
    used = [False] * n_edges
    ptr = [0] * len(adj)
    stack = [start]  # the vertices of the current walk, start at the bottom
    via = [-1]  # via[k]: the edge that led to stack[k]
    vertices: List[int] = []  # finished vertices, in the order they are popped
    edge_ids: List[int] = []
    while stack:
        v = stack[-1]
        row = adj[v]
        taken = -1
        while ptr[v] < len(row):
            w, e = row[ptr[v]]
            ptr[v] += 1
            if not used[e]:
                taken = e
                break
        if taken == -1:
            # v has no unused edge left: it is finished, and the walk backs up one step.
            vertices.append(stack.pop())
            e = via.pop()
            if e != -1:
                edge_ids.append(e)
        else:
            used[taken] = True
            stack.append(w)
            via.append(taken)
    vertices.reverse()
    edge_ids.reverse()
    return vertices, edge_ids


def _solve(n: int, edges: Iterable[Edge], directed: bool) -> Tuple[str, Optional[EulerWalk]]:
    edges = list(edges)
    adj = _adjacency(n, edges, directed)
    kind, start = _degree_check(n, edges, directed)
    if kind == NONE:
        return NONE, None
    if not edges:
        return CIRCUIT, EulerWalk([], [])
    vertices, edge_ids = _hierholzer(start, adj, len(edges))
    if len(edge_ids) < len(edges):
        # The walk used only the edges of the start's component: the others lie elsewhere.
        return NONE, None
    return kind, EulerWalk(vertices, edge_ids)


def eulerian_kind(n: int, edges: Iterable[Edge], directed: bool = False) -> str:
    """Whether the graph has an Eulerian circuit, only an Eulerian path, or neither.

    Args:
        n: number of vertices (>= 0), numbered 0 .. n - 1.
        edges: pairs (u, v) with 0 <= u, v < n; self-loops and repeats are allowed.
        directed: True if every edge goes from u to v.

    Returns:
        "circuit" when a closed walk uses every edge once (also for a graph with no edges),
        "path" when only an open one does, "none" when no walk does.

    Raises:
        ValueError: n < 0 or an edge end out of range.

    Time Complexity: O(V + E): the degree test, then the walk, which checks connectivity.
    Space Complexity: O(V + E)
    """
    return _solve(n, edges, directed)[0]


def eulerian_path(n: int, edges: Iterable[Edge], directed: bool = False) -> Optional[EulerWalk]:
    """A walk that uses every edge exactly once, by Hierholzer's algorithm.

    Args, Raises: as for eulerian_kind.

    Returns:
        An EulerWalk (vertices, edge_ids), a circuit whenever one exists; EulerWalk([], [])
        for a graph with no edges; None when no such walk exists.

    Time Complexity: O(V + E)
    Space Complexity: O(V + E)
    """
    return _solve(n, edges, directed)[1]


if __name__ == "__main__":
    # Two triangles joined by the edge 0-3. Vertices 0 and 3 have odd degree, so the walk
    # is a path from 0 to 3. It first runs 0 -> 3 and around the right triangle, gets stuck
    # at 3, and backs up to 0, whose triangle is then spliced in at the front.
    example = [(0, 3), (0, 1), (1, 2), (2, 0), (3, 4), (4, 5), (5, 3)]
    print("Undirected:", example)
    print("Kind:", eulerian_kind(6, example))  # path
    print("Walk:", eulerian_path(6, example))  # vertices [0, 1, 2, 0, 3, 4, 5, 3], edge_ids [1, 2, 3, 0, 4, 5, 6]

    directed = [(0, 1), (1, 4), (1, 2), (2, 3), (3, 1)]
    print("Directed:", directed)
    print("Kind:", eulerian_kind(5, directed, directed=True))  # path
    print("Walk:", eulerian_path(5, directed, directed=True))  # vertices [0, 1, 2, 3, 1, 4], edge_ids [0, 2, 3, 4, 1]
