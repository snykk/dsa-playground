"""
0-1 BFS: single-source shortest paths when every edge weight is 0 or 1.

The graph has num_vertices vertices, numbered 0 .. num_vertices - 1, and a list of directed
edges (u, v, w) with w equal to 0 or 1; an undirected graph is given as both directions.
Instead of Dijkstra's priority queue the search keeps a deque of (distance, vertex) entries:
relaxing an edge of weight 0 pushes the vertex to the FRONT, an edge of weight 1 to the BACK.
The deque then always holds at most two distances, d at the front and d + 1 behind them, in
order, so the front entry is always one with the smallest distance, as in Dijkstra, at O(1)
per push and pop: O(V + E) in total.

- zero_one_bfs: the distance and the parent of every vertex.
- path_to: the path from the source to one vertex, read back along the parent array.
- zero_one_bfs_with_path: both at once, for one target.
- min_wall_breaks: a grid example. Moving onto a road cell costs 0 and breaking into a wall
  costs 1, so the fewest walls to break is a 0-1 shortest path.

An unreachable vertex has distance -1 and parent -1, and its path is empty; the source has
parent -1 too. adj[u] keeps u's edges in the order given and every search relaxes them in
that order, so the parent array, and with it every path, is fixed by the edge order. The C++
and Go versions follow the same order and return the same arrays.
"""

from collections import deque
from typing import Iterable, List, Sequence, Tuple

Edge = Tuple[int, int, int]


def _adjacency(edges: Iterable[Edge], num_vertices: int, start: int) -> List[List[Tuple[int, int]]]:
    """adj[u]: the pairs (v, w) of u's edges, in edge order. Checks the whole input first."""
    if num_vertices < 0:
        raise ValueError(f"num_vertices must be >= 0, got {num_vertices}")
    adj: List[List[Tuple[int, int]]] = [[] for _ in range(num_vertices)]
    for u, v, w in edges:
        if not (0 <= u < num_vertices and 0 <= v < num_vertices):
            raise ValueError(f"edge ({u}, {v}, {w}) has an endpoint outside [0, {num_vertices})")
        if not (isinstance(w, int) and w in (0, 1)):
            raise ValueError(f"edge ({u}, {v}, {w}) has weight {w!r}; 0-1 BFS takes weights 0 and 1 only")
        adj[u].append((v, w))
    if not 0 <= start < num_vertices:
        raise ValueError(f"start {start} is not a vertex: it must be in [0, {num_vertices})")
    return adj


def _search(adj: List[List[Tuple[int, int]]], start: int) -> Tuple[List[int], List[int]]:
    """The 0-1 BFS itself, on an adjacency list from _adjacency."""
    n = len(adj)
    dist = [-1] * n
    parent = [-1] * n
    dist[start] = 0
    queue = deque([(0, start)])
    while queue:
        d, u = queue.popleft()
        if d > dist[u]:
            # A stale entry: u was pushed again with a smaller distance after this entry, and
            # that entry has already been popped and processed. Skip it.
            continue
        for v, w in adj[u]:
            nd = d + w
            if dist[v] == -1 or nd < dist[v]:
                dist[v] = nd
                parent[v] = u
                if w == 0:
                    queue.appendleft((nd, v))  # the same distance as u: goes before every d + 1
                else:
                    queue.append((nd, v))  # one more than u: goes behind everything
    return dist, parent


def zero_one_bfs(edges: Iterable[Edge], num_vertices: int, start: int) -> Tuple[List[int], List[int]]:
    """Shortest distances from start when every edge weight is 0 or 1.

    Args:
        edges: directed edges (u, v, w) with 0 <= u, v < num_vertices and w in {0, 1}. Self-loops
            and parallel edges are allowed. An undirected edge is given as (u, v, w) and (v, u, w).
        num_vertices: the number of vertices (>= 0).
        start: the source, in [0, num_vertices).

    Returns:
        (dist, parent): dist[v] is the length of a shortest path from start to v, or -1 when v is
        unreachable; parent[v] is the vertex before v on that path, or -1 for start and for
        unreachable vertices. Among several shortest paths, parent records the first one found:
        a vertex's parent changes only when its distance strictly drops.

    Raises:
        ValueError: a negative num_vertices, an endpoint out of range, a weight other than 0 or
            1, or a start that is not a vertex (so num_vertices == 0 always raises).

    Time Complexity: O(V + E): each vertex is processed once and pushed at most twice.
    Space Complexity: O(V + E)
    """
    return _search(_adjacency(edges, num_vertices, start), start)


def path_to(parent: Sequence[int], start: int, target: int) -> List[int]:
    """The path start, ..., target along a parent array from zero_one_bfs(..., start).

    Returns [start] when target == start, [] when target is unreachable (parent -1).

    Raises:
        ValueError: start or target outside [0, len(parent)).

    Time Complexity: O(length of the path)
    """
    n = len(parent)
    if not (0 <= start < n and 0 <= target < n):
        raise ValueError(f"start {start} and target {target} must be in [0, {n})")
    if target == start:
        return [start]
    if parent[target] == -1:
        return []
    path = [target]
    while path[-1] != start:
        path.append(parent[path[-1]])
    path.reverse()
    return path


def zero_one_bfs_with_path(edges: Iterable[Edge], num_vertices: int, start: int, target: int) -> Tuple[int, List[int]]:
    """The distance from start to target and one shortest path, or (-1, []) when there is none.

    The search runs to the end (there is no early exit at target), then path_to reads the
    path back. Raises ValueError as zero_one_bfs does, or for a target that is not a vertex.

    Time Complexity: O(V + E)
    Space Complexity: O(V + E)
    """
    dist, parent = zero_one_bfs(edges, num_vertices, start)
    if not 0 <= target < num_vertices:
        raise ValueError(f"target {target} is not a vertex: it must be in [0, {num_vertices})")
    return dist[target], path_to(parent, start, target)


def grid_edges(grid: Sequence[str]) -> List[Edge]:
    """The 0-1 graph of a grid of '.' (road) and '#' (wall) cells.

    Cell (r, c) is vertex r * cols + c. For every cell in row-major order and every neighbour in
    the order up, down, left, right, there is an edge into the neighbour of weight 0 for a road
    and 1 for a wall: the cost of entering it.

    Raises:
        ValueError: an empty grid, rows of different lengths, or a character other than '.' and '#'.
    """
    if not grid or not grid[0]:
        raise ValueError("the grid needs at least one row and one column")
    rows, cols = len(grid), len(grid[0])
    for r, row in enumerate(grid):
        if len(row) != cols:
            raise ValueError(f"row {r} has {len(row)} cells, row 0 has {cols}")
        for ch in row:
            if ch not in ".#":
                raise ValueError(f"cell {ch!r} in row {r}: use '.' for a road and '#' for a wall")
    edges: List[Edge] = []
    for r in range(rows):
        for c in range(cols):
            for dr, dc in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols:
                    edges.append((r * cols + c, nr * cols + nc, 1 if grid[nr][nc] == "#" else 0))
    return edges


def min_wall_breaks(grid: Sequence[str], start: Tuple[int, int], goal: Tuple[int, int]) -> int:
    """The fewest walls to break to walk from start to goal, moving up, down, left or right.

    Entering a road cell '.' costs 0 and breaking into a wall cell '#' costs 1; the start cell
    itself is free, even when it is a wall. Every cell can be entered, so the answer is never -1.

    Raises:
        ValueError: as grid_edges does, or a start or goal outside the grid.

    Time Complexity: O(rows * cols)
    Space Complexity: O(rows * cols)
    """
    edges = grid_edges(grid)
    rows, cols = len(grid), len(grid[0])
    for name, (r, c) in (("start", start), ("goal", goal)):
        if not (0 <= r < rows and 0 <= c < cols):
            raise ValueError(f"{name} ({r}, {c}) is outside the {rows} x {cols} grid")
    dist, _ = zero_one_bfs(edges, rows * cols, start[0] * cols + start[1])
    return dist[goal[0] * cols + goal[1]]


if __name__ == "__main__":
    # A to G are vertices 0 to 6. B is first reached by A->B (weight 1), then more cheaply by
    # A->C->B (0 + 0), so its first deque entry goes stale. Nothing leads to G.
    example = [(0, 1, 1), (0, 2, 0), (2, 1, 0), (1, 3, 1), (2, 4, 1), (4, 3, 0), (4, 5, 1), (3, 5, 1), (6, 0, 1)]
    dist, parent = zero_one_bfs(example, 7, 0)
    print("dist:  ", dist)  # [0, 0, 0, 1, 1, 2, -1]
    print("parent:", parent)  # [-1, 2, 0, 1, 2, 4, -1]
    print("path to 5:", zero_one_bfs_with_path(example, 7, 0, 5))  # (2, [0, 2, 4, 5])
    print("path to 6:", zero_one_bfs_with_path(example, 7, 0, 6))  # (-1, [])
    # Roads '.' cost 0 to enter and walls '#' cost 1; column 5 is a wall from top to bottom.
    city = ["...#.#.", "##.#.#.", "...#.#.", ".###.#.", ".....#."]
    print("walls to break:", min_wall_breaks(city, (0, 0), (4, 6)))  # 1
