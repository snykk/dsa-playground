"""
Dinic's Algorithm Implementation

Dinic's algorithm finds the maximum flow from a source to a sink in phases. Each phase runs
one BFS from the source over the residual graph and gives every vertex it reaches a level,
its distance in residual edges. Then it pushes a blocking flow through the level graph:
depth-first searches that only step from level d to level d + 1, repeated until no such path
reaches the sink. A current-arc pointer per vertex remembers which residual entry to try
next, so within one phase each entry is passed over at most once. The run stops when the
BFS no longer reaches the sink; the vertices it did reach are the source side of a minimum
cut.

The input is the one edmonds_karp takes: a dict mapping u to {v: capacity}. The residual
graph is a dict of dicts as well, with a 0-capacity reverse entry for every edge. Every
search tries the residual entries of a vertex in increasing order of the neighbour, so the
C++ and Go versions push the same flow along the same paths.

The depth-first search keeps its path in a list, so a long path does not hit Python's
recursion limit.
"""

from collections import deque
from typing import Dict, List, NamedTuple, Optional, Tuple

Graph = Dict[int, Dict[int, int]]


class DinicResult(NamedTuple):
    """What dinic_flow returns."""

    max_flow: int
    # flows[u][v]: the flow on the edge u -> v, for every edge of the input graph.
    flows: Graph
    # The vertices the last BFS reached, in increasing order: the source side of a minimum cut.
    source_side: List[int]
    # BFS runs, the last one (which no longer reaches the sink) included.
    phases: int
    # Residual entries the depth-first searches looked at, over all phases.
    edge_visits: int


def _build_residual(graph: Graph) -> Graph:
    """Copy the capacities and add a 0-capacity reverse entry for every edge without one."""
    residual: Graph = {u: dict(neighbors) for u, neighbors in graph.items()}
    for u in graph:
        for v in graph[u]:
            residual.setdefault(v, {})
            residual[v].setdefault(u, 0)
    return residual


def _neighbours(residual: Graph) -> Dict[int, List[int]]:
    """adj[u]: the residual entries of u in increasing order, the order every search tries."""
    return {u: sorted(row) for u, row in residual.items()}


def _bfs_levels(residual: Graph, adj: Dict[int, List[int]], source: int) -> Dict[int, int]:
    """level[v]: the fewest residual edges with room on a path from the source to v.

    Only the vertices the BFS reaches get a level. The dict keeps them in BFS order.
    """
    level = {source: 0}
    queue = deque([source])
    while queue:
        u = queue.popleft()
        for v in adj.get(u, ()):
            if v not in level and residual[u][v] > 0:
                level[v] = level[u] + 1
                queue.append(v)
    return level


def _find_path(residual: Graph, adj: Dict[int, List[int]], level: Dict[int, int],
               current: Dict[int, int], source: int, sink: int) -> Tuple[Optional[List[int]], int]:
    """One depth-first search from the source through the level graph.

    It steps from u to v only when residual[u][v] > 0 and level[v] == level[u] + 1, and each
    vertex resumes at current[u], its current arc. An entry that cannot be used now cannot be
    used later in the phase either: pushing flow only empties level-graph entries, and the
    reverse entries it fills point one level back. So the pointer only moves forward. A
    vertex whose pointer reaches the end is a dead end: it is popped, and the vertex before
    it moves past the entry that led there.

    Returns (path, visits): the path from the source to the sink, or None when the source
    itself is a dead end (the blocking flow is complete), and how many residual entries the
    search looked at.
    """
    path = [source]
    visits = 0
    while path:
        u = path[-1]
        if u == sink:
            return path, visits
        row = adj[u]
        step = None
        while current[u] < len(row):
            v = row[current[u]]
            visits += 1
            if residual[u][v] > 0 and level.get(v) == level[u] + 1:
                step = v
                break
            current[u] += 1
        if step is None:
            # A dead end for the rest of the phase: back up and skip the entry that led here.
            path.pop()
            if path:
                current[path[-1]] += 1
            continue
        path.append(step)
    return None, visits


def _push(residual: Graph, path: List[int]) -> int:
    """Push the bottleneck of the path along it and return the bottleneck."""
    bottleneck = min(residual[path[k]][path[k + 1]] for k in range(len(path) - 1))
    for k in range(len(path) - 1):
        u, v = path[k], path[k + 1]
        residual[u][v] -= bottleneck
        residual[v][u] += bottleneck
    return bottleneck


def _run(graph: Graph, source: int, sink: int) -> Tuple[int, Graph, Dict[int, int], int, int]:
    """Run the phases. Returns (max flow, final residual graph, last levels, phases, edge visits)."""
    residual = _build_residual(graph)
    adj = _neighbours(residual)
    max_flow = 0
    phases = 0
    edge_visits = 0
    while True:
        level = _bfs_levels(residual, adj, source)
        phases += 1
        if sink not in level:
            return max_flow, residual, level, phases, edge_visits
        current = {u: 0 for u in adj}
        while True:
            path, visits = _find_path(residual, adj, level, current, source, sink)
            edge_visits += visits
            if path is None:
                break
            max_flow += _push(residual, path)


def dinic(graph: Graph, source: int, sink: int) -> int:
    """
    Find the maximum flow with Dinic's algorithm (level graphs and blocking flows).

    Args:
        graph: Dictionary mapping vertex to dictionary of (neighbor, capacity) pairs
        source: Source vertex
        sink: Sink vertex

    Returns:
        Maximum flow value; 0 when source == sink or the sink cannot be reached.

    Time Complexity: O(V^2 * E); O(E * sqrt(V)) on unit networks
    Space Complexity: O(V + E)
    """
    if source == sink:
        return 0
    return _run(graph, source, sink)[0]


def dinic_flow(graph: Graph, source: int, sink: int) -> DinicResult:
    """
    Run Dinic's algorithm and return the flow itself, the minimum cut and the work done.

    Args:
        graph: Dictionary mapping vertex to dictionary of (neighbor, capacity) pairs
        source: Source vertex
        sink: Sink vertex

    Returns:
        DinicResult(max_flow, flows, source_side, phases, edge_visits). flows has the shape
        of graph. Two anti-parallel edges share their residual entries, so only their net
        flow is defined: it is given to the edge it runs along, and the other edge gets 0.
        When source == sink nothing is sent: every flow is 0, phases and edge_visits are 0
        and source_side is [source].

    Time Complexity: O(V^2 * E); O(E * sqrt(V)) on unit networks
    Space Complexity: O(V + E)
    """
    if source == sink:
        flows = {u: {v: 0 for v in row} for u, row in graph.items()}
        return DinicResult(0, flows, [source], 0, 0)
    max_flow, residual, level, phases, edge_visits = _run(graph, source, sink)
    flows = {u: {v: max(0, capacity - residual[u][v]) for v, capacity in row.items()}
             for u, row in graph.items()}
    return DinicResult(max_flow, flows, sorted(level), phases, edge_visits)


if __name__ == "__main__":
    # Example usage
    graph = {
        0: {1: 16, 2: 13},
        1: {2: 10, 3: 12},
        2: {1: 4, 4: 14},
        3: {2: 9, 5: 20},
        4: {3: 7, 5: 4}
    }

    print("Dinic's Algorithm Example:")
    print(f"Graph: {graph}")
    print(f"Maximum flow: {dinic(graph, 0, 5)}")  # 23

    result = dinic_flow(graph, 0, 5)
    print(f"Flows: {result.flows}")
    print(f"Source side of a minimum cut: {result.source_side}")  # [0, 1, 2, 4]
    print(f"Phases: {result.phases}, edge visits: {result.edge_visits}")
