"""
Ford-Fulkerson Algorithm Implementation

Ford-Fulkerson algorithm finds the maximum flow in a flow network.
It uses DFS to find augmenting paths and updates flow along these paths.

The DFS is iterative (explicit stack with a parent map), so long chains of
vertices do not hit Python's recursion limit.
"""

from typing import Dict, List, Optional, Set, Tuple

Graph = Dict[int, Dict[int, int]]


def _build_residual(graph: Graph) -> Graph:
    """Copy the capacities and add a 0-capacity reverse entry for every edge."""
    residual: Graph = {u: dict(neighbors) for u, neighbors in graph.items()}
    for u in graph:
        for v in graph[u]:
            residual.setdefault(v, {})
            residual[v].setdefault(u, 0)
    return residual


def _find_path(residual: Graph, source: int, sink: int) -> Optional[List[int]]:
    """Iterative DFS for an augmenting path. Returns the vertex list or None."""
    parent: Dict[int, Optional[int]] = {source: None}
    stack = [(source, iter(residual.get(source, {}).items()))]
    while stack:
        u, neighbors = stack[-1]
        for v, capacity in neighbors:
            if v not in parent and capacity > 0:
                parent[v] = u
                if v == sink:
                    path = [sink]
                    while parent[path[-1]] is not None:
                        path.append(parent[path[-1]])
                    path.reverse()
                    return path
                stack.append((v, iter(residual.get(v, {}).items())))
                break
        else:
            stack.pop()
    return None


def _augment(residual: Graph, path: List[int]) -> int:
    """Push the bottleneck capacity along the path and return it."""
    bottleneck = min(residual[path[i]][path[i + 1]] for i in range(len(path) - 1))
    for i in range(len(path) - 1):
        u, v = path[i], path[i + 1]
        residual[u][v] -= bottleneck
        residual[v][u] += bottleneck
    return bottleneck


def _run(graph: Graph, source: int, sink: int) -> Tuple[int, List[Tuple[List[int], int]], Graph]:
    """Run Ford-Fulkerson. Returns (max flow, augmenting paths with bottlenecks, final residual graph)."""
    residual = _build_residual(graph)
    max_flow = 0
    paths: List[Tuple[List[int], int]] = []
    while True:
        path = _find_path(residual, source, sink)
        if path is None:
            break
        bottleneck = _augment(residual, path)
        max_flow += bottleneck
        paths.append((path, bottleneck))
    return max_flow, paths, residual


def ford_fulkerson(graph: Graph, source: int, sink: int) -> int:
    """
    Find maximum flow using Ford-Fulkerson algorithm with DFS

    Args:
        graph: Dictionary mapping vertex to dictionary of (neighbor, capacity) pairs
        source: Source vertex
        sink: Sink vertex

    Returns:
        Maximum flow value

    Time Complexity: O(E * max_flow) for integer capacities
    Space Complexity: O(V + E)
    """
    if source == sink:
        return 0
    return _run(graph, source, sink)[0]


def ford_fulkerson_with_path(graph: Graph, source: int,
                             sink: int) -> Tuple[int, List[Tuple[List[int], int]]]:
    """
    Find maximum flow and return the augmenting paths used

    Args:
        graph: Dictionary mapping vertex to dictionary of (neighbor, capacity) pairs
        source: Source vertex
        sink: Sink vertex

    Returns:
        Tuple of (max_flow, list of (path, bottleneck) pairs)

    Time Complexity: O(E * max_flow) for integer capacities
    Space Complexity: O(V + E)
    """
    if source == sink:
        return 0, []
    max_flow, paths, _ = _run(graph, source, sink)
    return max_flow, paths


def min_cut(graph: Graph, source: int, sink: int) -> Tuple[int, Set[int], Set[int]]:
    """
    Find minimum cut (max-flow min-cut theorem)

    Args:
        graph: Dictionary mapping vertex to dictionary of (neighbor, capacity) pairs
        source: Source vertex
        sink: Sink vertex

    Returns:
        Tuple of (min_cut_value, source_side, sink_side)

    Time Complexity: O(E * max_flow) for integer capacities
    Space Complexity: O(V + E)
    """
    if source == sink:
        return 0, {source}, set()

    max_flow, _, residual = _run(graph, source, sink)

    # Vertices still reachable from the source in the final residual graph.
    reachable = {source}
    stack = [source]
    while stack:
        u = stack.pop()
        for v, capacity in residual.get(u, {}).items():
            if v not in reachable and capacity > 0:
                reachable.add(v)
                stack.append(v)

    all_vertices = set(graph.keys())
    for u in graph:
        all_vertices.update(graph[u])
    return max_flow, reachable, all_vertices - reachable


if __name__ == "__main__":
    # Example usage
    graph = {
        0: {1: 16, 2: 13},
        1: {2: 10, 3: 12},
        2: {1: 4, 4: 14},
        3: {2: 9, 5: 20},
        4: {3: 7, 5: 4}
    }

    print("Ford-Fulkerson Algorithm Example:")
    print(f"Graph: {graph}")

    # Find maximum flow
    max_flow = ford_fulkerson(graph, 0, 5)
    print(f"Maximum flow: {max_flow}")  # 23

    # Find minimum cut
    cut_value, source_side, sink_side = min_cut(graph, 0, 5)
    print(f"Minimum cut value: {cut_value}")
    print(f"Source side: {source_side}")
    print(f"Sink side: {sink_side}")
