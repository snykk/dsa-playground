# Dijkstra's Algorithm

Dijkstra's algorithm finds the cheapest path from one source to every other vertex in a graph with non-negative edge weights. It repeatedly settles the closest unsettled vertex using a priority queue: O((V + E) log V) time with a binary heap.

## Intuition

Keep a tentative distance for every vertex. Take the unsettled vertex with the smallest tentative distance, declare it final, and use its edges to improve its neighbors. Repeat.

Why a settled distance is final: let v have the smallest tentative distance d among unsettled vertices. Any other route to v must leave the settled region through an unsettled vertex x with `dist[x] >= d`, and the rest of the route adds only non-negative weights, so it costs at least d. A negative edge breaks exactly this argument.

## Visual

```text
Undirected graph, source A (final distance in brackets):

        4            10
   A(0) ----- B(4) ------- D(9) ---- 11 ---- F(20)
    \          |            |
   2 \       5 |            | 4
      \        |            |
       C(2) ---+            |
        \                   |
         +--- 3 --- E(5) ---+

Shortest path to F: A - C - E - D - F  (2 + 3 + 4 + 11 = 20)
```

## How It Works

1. Set `dist[start] = 0`, all other distances to infinity, and push `(0, start)` into a min-heap.
2. Pop the smallest entry `(d, v)`. If `v` is already settled, skip it (a stale entry).
3. Settle `v`. For each edge `(v, u, w)` with `u` unsettled: if `d + w < dist[u]`, set `dist[u] = d + w` and push `(dist[u], u)`.
4. Stop when the heap is empty. Unreachable vertices keep the infinity value.

The path version also stores `previous[u] = v` and stops as soon as the target is popped. There is no decrease-key: a better distance pushes a new entry and the old one is skipped when it comes out (lazy deletion).

## Step-by-Step Trace

The graph above with A to F numbered 0 to 5:

| Pop | Distance | Pushed |
|-----|----------|--------|
| A | 0 | B = 4, C = 2 |
| C | 2 | E = 5 |
| B | 4 | D = 14 |
| E | 5 | D = 9 |
| D | 9 | F = 20 |
| D | 14 | stale: skipped |
| F | 20 | nothing |

`dijkstra(g, 0)` returns `{0: 0, 1: 4, 2: 2, 3: 9, 4: 5, 5: 20}`; `dijkstra_with_path(g, 0, 5)` returns `(20, [0, 2, 4, 3, 5])`.

## Complexity

| Version | Time | Space |
|---------|------|-------|
| Binary heap, lazy deletion (this code) | O((V + E) log V) | O(V + E) |
| Array scan, no heap | O(V^2) | O(V) |
| Fibonacci heap | O(E + V log V) | O(V) |

Each edge can push one heap entry, so the heap holds up to E entries (hence O(V + E) space); each push and pop costs O(log V).

## When to Use

Use it for single-source shortest paths with non-negative weights: routes, weighted grids, network delays. Do not use it with negative weights (use Bellman-Ford), for unweighted graphs (BFS is simpler), or for one target with a good heuristic (A* expands fewer vertices).

## Dijkstra's vs. Alternatives

| Algorithm | Time | Weights | Gives |
|-----------|------|---------|-------|
| Dijkstra's (heap) | O((V + E) log V) | non-negative | one source to all |
| BFS | O(V + E) | all equal | one source to all |
| Bellman-Ford | O(V * E) | negative allowed | one source to all |
| A* | depends on the heuristic | non-negative | one source to one goal |
| Floyd-Warshall | O(V^3) | negative allowed | all pairs |

## Common Pitfalls

- **Negative weights.** No error, wrong answer: for `0->1 (2), 0->2 (5), 2->1 (-4)` it returns `d(1) = 2` while the true value is 1.
- **No stale check.** Always skip an entry whose vertex is settled.
- **Marking on push.** Settle a vertex when it is popped, not when it is pushed.
- **Neighbor-only vertices.** A vertex that appears only in neighbor lists still needs an initial distance; the code collects vertices from keys and neighbors.
- **Overflow.** Distances are `long long` in C++ and `int` (64-bit) in Go; a 32-bit sum of two large weights would overflow.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `dijkstra.py` | `dijkstra`, `dijkstra_with_path`, `dijkstra_all_pairs`; `heapq`; infinity is `float('inf')` |
| C++ | [C++/](C++/) | `dijkstra.cpp` | `dijkstra`, `dijkstraWithPath`; `long long` distances; `priority_queue` |
| Go | [Go/](Go/) | `main.go` | `Dijkstra`, `DijkstraWithPath`; `container/heap`; `math.MaxInt` for infinity |

## Practice Problems

- [Network Delay Time](https://leetcode.com/problems/network-delay-time/) (LeetCode)
- [Path With Minimum Effort](https://leetcode.com/problems/path-with-minimum-effort/) (LeetCode)
- [Cheapest Flights Within K Stops](https://leetcode.com/problems/cheapest-flights-within-k-stops/) (LeetCode)
- [Shortest Routes I](https://cses.fi/problemset/task/1671) (CSES)

## Related

- [Bellman-Ford](../Bellman-Ford_Algorithm/) - negative weights
- [A* Search](../A_Star_Search_Algorithm/) - Dijkstra with a heuristic
- [Floyd-Warshall](../Floyd-Warshall_Algorithm/) - all pairs
- [BFS](../../Traversal/BFS/) - the unweighted case
- [Prim's Algorithm](../../../Greedy/Minimum%20Spanning%20Tree/Prim's%20Algorithm/) - a similar greedy growth
