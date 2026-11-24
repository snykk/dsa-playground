"""
Maximum matching in an unweighted bipartite graph.

The graph has n_left vertices on the left (0 .. n_left - 1), n_right on the right
(0 .. n_right - 1) and a list of edges (u, v), each joining left vertex u to right vertex v.
A matching is a set of edges with no vertex in common; both algorithms here find one of
maximum size by repeatedly flipping augmenting paths: paths that start at a free left vertex,
end at a free right vertex and alternate between edges outside and inside the matching.

- kuhn: one depth-first search from each left vertex in turn, O(V * E).
- hopcroft_karp: phases of one BFS (the layers) and many DFSs that take vertex-disjoint
  shortest augmenting paths, O(E * sqrt(V)).
- min_vertex_cover: Konig's construction, a smallest set of vertices touching every edge,
  read off the Hopcroft-Karp matching. Its size equals the matching's.

Which maximum matching is returned is fixed by the order of the edges: adj[u] lists the
right neighbours of u in the order the edges are given, and every search tries them in that
order. The C++ and Go versions follow the same order and return the same matching.

The depth-first searches use an explicit stack, so a long augmenting path does not hit
Python's recursion limit.
"""

from collections import deque
from typing import Iterable, List, Tuple

Edge = Tuple[int, int]


def _adjacency(n_left: int, n_right: int, edges: Iterable[Edge]) -> List[List[int]]:
    """adj[u]: the right neighbours of left vertex u, in edge order (a duplicate edge stays)."""
    if n_left < 0 or n_right < 0:
        raise ValueError(f"side sizes must be >= 0, got n_left={n_left}, n_right={n_right}")
    adj: List[List[int]] = [[] for _ in range(n_left)]
    for u, v in edges:
        if not (0 <= u < n_left and 0 <= v < n_right):
            raise ValueError(
                f"edge ({u}, {v}) is outside the graph: u must be in [0, {n_left}) and v in [0, {n_right})"
            )
        adj[u].append(v)
    return adj


def _flip(stack: List[int], through: List[int], match_left: List[int], match_right: List[int]) -> None:
    """Flip the augmenting path stack[0] - through[0] - stack[1] - ... - stack[-1] - through[-1].

    Every left vertex on it takes the right vertex that follows it, so the path's edges outside
    the matching enter it, the edges inside leave it, and the matching grows by one.
    """
    for left, right in zip(stack, through):
        match_left[left] = right
        match_right[right] = left


def _kuhn_augment(root: int, adj: List[List[int]], match_left: List[int], match_right: List[int], seen: List[int]) -> bool:
    """Search for an augmenting path from the free left vertex root by DFS; flip it if found.

    The same search as the recursive
        try(u): for v in adj[u]: if v is not seen: mark v seen;
                    if v is free or try(match_right[v]): match u with v; return True
                return False
    with the recursion kept in lists. seen[v] == root marks the right vertices this search
    has already tried, so no array is cleared between roots.
    """
    stack = [root]  # left vertices on the current alternating path
    next_edge = [0]  # next_edge[k]: the next index into adj[stack[k]]
    through = []  # through[k]: the right vertex between stack[k] and stack[k + 1]
    while stack:
        u = stack[-1]
        if next_edge[-1] == len(adj[u]):
            # Every neighbour of u is tried: back up to the left vertex before it.
            stack.pop()
            next_edge.pop()
            if through:
                through.pop()
            continue
        v = adj[u][next_edge[-1]]
        next_edge[-1] += 1
        if seen[v] == root:
            continue
        seen[v] = root
        through.append(v)
        if match_right[v] == -1:
            _flip(stack, through, match_left, match_right)
            return True
        # v is taken: ask its partner to move to another right vertex.
        stack.append(match_right[v])
        next_edge.append(0)
    return False


def kuhn(n_left: int, n_right: int, edges: Iterable[Edge]) -> Tuple[int, List[int]]:
    """Maximum matching with Kuhn's algorithm.

    Left vertices are tried in order 0, 1, ..., n_left - 1, each with one DFS for an
    augmenting path. A vertex that finds none now never will later, so one pass is enough.

    Args:
        n_left: number of left vertices (>= 0).
        n_right: number of right vertices (>= 0).
        edges: pairs (u, v) with 0 <= u < n_left and 0 <= v < n_right; duplicates are allowed.

    Returns:
        (size, match_left): the matching's size and, for each left vertex, its partner on the
        right, or -1 when it is unmatched.

    Raises:
        ValueError: a negative side size or an edge endpoint out of range.

    Time Complexity: O(V * E): one search per left vertex, each O(E).
    Space Complexity: O(V + E)
    """
    adj = _adjacency(n_left, n_right, edges)
    match_left = [-1] * n_left
    match_right = [-1] * n_right
    seen = [-1] * n_right
    size = 0
    for root in range(n_left):
        if _kuhn_augment(root, adj, match_left, match_right, seen):
            size += 1
    return size, match_left


def _bfs_layers(adj: List[List[int]], match_left: List[int], match_right: List[int], dist: List[int]) -> int:
    """Hopcroft-Karp's BFS: the layers of the left vertices for one phase.

    Layer 0 holds every free left vertex. From a left vertex in layer d, an edge to a matched
    right vertex v puts v's partner in layer d + 1 (if it has no layer yet). The search stops
    at the first free right vertex it meets: its neighbour's layer is the last one, and every
    shortest augmenting path ends there. dist[u] is u's layer, or -1 outside layers 0 .. last.

    Returns the last layer, or -1 when no augmenting path exists (the matching is maximum).
    """
    queue = deque()
    for u, partner in enumerate(match_left):
        dist[u] = 0 if partner == -1 else -1
        if partner == -1:
            queue.append(u)
    while queue:
        u = queue.popleft()
        for v in adj[u]:
            w = match_right[v]
            if w == -1:
                last = dist[u]
                # Layers past the last one hold no shortest augmenting path: clear them.
                for x, d in enumerate(dist):
                    if d > last:
                        dist[x] = -1
                return last
            if dist[w] == -1:
                dist[w] = dist[u] + 1
                queue.append(w)
    return -1


def _hk_augment(root: int, adj: List[List[int]], match_left: List[int], match_right: List[int], dist: List[int]) -> bool:
    """Hopcroft-Karp's DFS: a shortest augmenting path from root through the layers; flip it.

    From u it only steps to a partner in the next layer, dist[u] + 1. A free right vertex can
    only be next to the last layer (the BFS stopped at the first one, and no right vertex
    becomes free during a phase), so reaching one means the path is a shortest one. A left
    vertex whose search fails gets dist -1, so no later search of the phase enters it again,
    and a flipped path cannot be reached again either: the paths of a phase are disjoint.
    """
    stack = [root]
    next_edge = [0]
    through = []
    while stack:
        u = stack[-1]
        if next_edge[-1] == len(adj[u]):
            dist[u] = -1  # a dead end for the rest of this phase
            stack.pop()
            next_edge.pop()
            if through:
                through.pop()
            continue
        v = adj[u][next_edge[-1]]
        next_edge[-1] += 1
        w = match_right[v]
        if w == -1:
            through.append(v)
            _flip(stack, through, match_left, match_right)
            return True
        if dist[w] == dist[u] + 1:
            through.append(v)
            stack.append(w)
            next_edge.append(0)
    return False


def _hopcroft_karp(adj: List[List[int]], n_right: int) -> Tuple[int, List[int], List[int]]:
    n_left = len(adj)
    match_left = [-1] * n_left
    match_right = [-1] * n_right
    dist = [-1] * n_left
    size = 0
    while _bfs_layers(adj, match_left, match_right, dist) != -1:
        for root in range(n_left):
            if match_left[root] == -1 and _hk_augment(root, adj, match_left, match_right, dist):
                size += 1
    return size, match_left, match_right


def hopcroft_karp(n_left: int, n_right: int, edges: Iterable[Edge]) -> Tuple[int, List[int]]:
    """Maximum matching with the Hopcroft-Karp algorithm.

    Each phase runs one BFS from all free left vertices to build the layers, then one DFS
    from each free left vertex in order 0, 1, ..., taking vertex-disjoint shortest augmenting
    paths. Shortest augmenting paths grow longer from phase to phase, so there are
    O(sqrt(V)) phases of O(V + E) each.

    Args, Returns and Raises: as for kuhn. The matching may differ from Kuhn's; its size
    does not.

    Time Complexity: O(E * sqrt(V)) (O((V + E) * sqrt(V)) when some vertices have no edge).
    Space Complexity: O(V + E)
    """
    adj = _adjacency(n_left, n_right, edges)
    size, match_left, _ = _hopcroft_karp(adj, n_right)
    return size, match_left


def min_vertex_cover(n_left: int, n_right: int, edges: Iterable[Edge]) -> Tuple[List[int], List[int]]:
    """A minimum vertex cover by Konig's theorem, from the Hopcroft-Karp matching.

    Let Z be the vertices reachable from the free left vertices by alternating paths (left to
    right along an edge outside the matching, right to left along a matching edge). The cover
    is the left vertices outside Z and the right vertices inside Z: every edge has an end in
    it, and it holds exactly one end of every matching edge, so its size is the matching's.

    Returns:
        (left_cover, right_cover), each in increasing order.

    Raises:
        ValueError: as for kuhn.

    Time Complexity: O(E * sqrt(V)) for the matching, then O(V + E).
    Space Complexity: O(V + E)
    """
    adj = _adjacency(n_left, n_right, edges)
    _, match_left, match_right = _hopcroft_karp(adj, n_right)
    left_in_z = [partner == -1 for partner in match_left]
    right_in_z = [False] * n_right
    stack = [u for u in range(n_left) if left_in_z[u]]
    while stack:
        u = stack.pop()
        for v in adj[u]:
            if not right_in_z[v]:
                right_in_z[v] = True
                # The matching is maximum, so v is matched: otherwise this is an augmenting path.
                w = match_right[v]
                if not left_in_z[w]:
                    left_in_z[w] = True
                    stack.append(w)
    left_cover = [u for u in range(n_left) if not left_in_z[u]]
    right_cover = [v for v in range(n_right) if right_in_z[v]]
    return left_cover, right_cover


if __name__ == "__main__":
    # Four left and four right vertices. L1, L2 and L3 reach only R0 and R1, so one of them
    # stays free: the maximum matching has 3 edges.
    example = [(0, 1), (0, 2), (0, 3), (1, 0), (1, 1), (2, 0), (3, 1)]
    print("Edges:", example)
    print("Kuhn:", kuhn(4, 4, example))  # (3, [2, 1, 0, -1])
    print("Hopcroft-Karp:", hopcroft_karp(4, 4, example))  # (3, [2, 0, -1, 1])
    print("Minimum vertex cover:", min_vertex_cover(4, 4, example))  # ([0], [0, 1])
