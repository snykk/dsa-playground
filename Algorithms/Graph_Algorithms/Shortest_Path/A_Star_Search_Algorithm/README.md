# A* Search Algorithm

A* finds a cheapest path from a start vertex to one goal vertex. It works like Dijkstra's algorithm, but it always expands the vertex with the smallest f = g + h, where g is the cost so far and h is a heuristic estimate of the cost still to go. With an admissible heuristic the path is optimal, and an informative heuristic means far fewer vertices are expanded.

## Intuition

Dijkstra's algorithm spreads out in every direction, because it only knows how far it has come. A* adds a guess of the distance remaining, so vertices that point away from the goal wait in the priority queue and are often never expanded.

The invariant: if h never overestimates the true remaining cost (it is *admissible*), then g + h is a lower bound on the cost of any path through a vertex. When the goal is popped with f = g, every other queued entry has f at least as large, so nothing can be cheaper. With h = 0, A* is exactly Dijkstra's algorithm.

## Visual

```text
Same graph as the trace below, goal G (value in brackets):

Dijkstra, ordered by g          S(0)  E(1)  A(2)  B(3)  F(3)  C(4)  then G(7)   6 expansions
A*, ordered by f = g + h        S(6)  B(6)  A(7)  C(7)  then G(7)               4 expansions

E and F lie in the opposite direction of G (h = 7), so their f is too large
and A* never expands them.
```

## How It Works

1. Push the start with g = 0 and f = h(start). Record `g[start] = 0`.
2. Pop the entry with the smallest f. If its vertex is the goal, return its g and its path.
3. If the popped g is larger than the recorded `g[v]`, the entry is stale: skip it.
4. For each edge (v, u, w): let t = g + w. If u is new or t < `g[u]`, record `g[u] = t` and push u with f = t + h(u).
5. If the queue empties, the goal is unreachable.

There is no closed set: a vertex whose cost improves later is pushed and expanded again. That is what makes the result optimal for any admissible heuristic, not only for consistent ones.

## Step-by-Step Trace

Undirected graph: S-A 2, S-B 3, S-E 1, A-C 4, B-C 1, B-D 5, C-G 3, D-G 2, E-F 2, F-G 20. Heuristic h: S 6, A 5, B 3, C 3, D 2, G 0, E 7, F 7. Output of the Python `astar` with S, A, B, C, D, G, E, F numbered 0 to 7: cost 7, path S, B, C, G.

| Pop | g | h | f | Pushed |
|-----|---|---|---|--------|
| S | 0 | 6 | 6 | A (f 7), B (f 6), E (f 8) |
| B | 3 | 3 | 6 | C (g 4, f 7), D (g 8, f 10) |
| A | 2 | 5 | 7 | nothing (C via A costs 6, not better than 4) |
| C | 4 | 3 | 7 | G (g 7, f 7) |
| G | 7 | 0 | 7 | goal: return 7 |

A* expanded 4 vertices. With h = 0 (Dijkstra) the search expands 6: S, E, A, B, F, C.

## Complexity

| Case | Time | Why |
|------|------|-----|
| Best | O(d) expansions | a perfect heuristic expands only the solution path of length d |
| Consistent heuristic, explicit graph | O((V + E) log V) | every vertex is expanded at most once, like Dijkstra |
| Worst | O(b^d) | a useless heuristic, or an inconsistent one that forces re-expansions (b is the branching factor, d the depth) |

Space is O(b^d) in general: A* stores every generated vertex. In this code every queue entry also carries a copy of its path.

Admissible: h(v) is at most the true cost from v to the goal. Consistent: h(u) <= w(u, v) + h(v) for every edge; this implies admissible.

## When to Use

Use A* for one source and one goal when you can supply a good admissible heuristic: grid and map pathfinding (Manhattan or Euclidean distance), puzzle solving (sliding puzzle). Do not use it for negative weights, or when you need distances to all vertices (use Dijkstra's algorithm).

## A* vs. Alternatives

| Algorithm | Time | Uses a goal | Edge weights |
|-----------|------|-------------|--------------|
| A* | O((V + E) log V) with a consistent h | Yes | non-negative |
| Dijkstra's | O((V + E) log V) | No | non-negative |
| BFS | O(V + E) | No | all equal |
| Bellman-Ford | O(V * E) | No | negative allowed |

## Common Pitfalls

- **Overestimating h.** You still get a path, but it may not be the cheapest.
- **A closed set with an inconsistent h.** With edges S->A 1, S->B 1, A->C 1, B->C 2, C->G 3 and h(A) = 4 (admissible, not consistent), a closed set returns cost 6; the correct answer is 5 (S, A, C, G). This code re-opens vertices, so it returns 5.
- **Negative weights.** Not supported.
- **Wrong heuristic signature.** The `heuristic` argument takes one vertex. `manhattan_distance` and `euclidean_distance` (Python) take two coordinate pairs, so wrap them.
- **Returning f instead of g.** The returned cost is g.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `astar.py` | returns `(cost, path)` or `None`; also `manhattan_distance` and `euclidean_distance` |
| C++ | [C++/](C++/) | `astar.cpp` | returns `pair<int, vector<int>>`, `(-1, {})` when unreachable |
| Go | [Go/](Go/) | `main.go` | returns `(int, []int)`, `(-1, nil)` when unreachable; container/heap |

## Practice Problems

- [Shortest Path in Binary Matrix](https://leetcode.com/problems/shortest-path-in-binary-matrix/) (LeetCode; BFS is enough, A* is a good exercise)
- [Sliding Puzzle](https://leetcode.com/problems/sliding-puzzle/) (LeetCode)
- [Network Delay Time](https://leetcode.com/problems/network-delay-time/) (LeetCode; the Dijkstra special case h = 0)

## Related

- [Dijkstra's Algorithm](../Dijkstra's_Algorithm/) - A* with h = 0
- [BFS](../../Traversal/BFS/) - fewest edges
- [Bellman-Ford](../Bellman-Ford_Algorithm/) - negative weights
- [Floyd-Warshall](../Floyd-Warshall_Algorithm/) - all pairs
