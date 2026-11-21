# Bellman-Ford Algorithm

Bellman-Ford finds the shortest distance from one source to every vertex, even when some edges have negative weights, and detects a negative cycle reachable from the source. It relaxes every edge V - 1 times, for O(V * E) time and O(V) space.

## Intuition

Dijkstra's algorithm is greedy: it settles the closest vertex and never looks back, which a negative edge can invalidate. Bellman-Ford never settles anything early. It keeps a tentative distance per vertex and keeps improving them by relaxing edges: if `dist[u] + w < dist[v]`, set `dist[v] = dist[u] + w`.

The invariant: after round k, `dist[v]` is at most the length of the shortest path to v that uses at most k edges. A shortest path with no repeated vertex has at most V - 1 edges, so V - 1 rounds finish the job. If round V still improves some distance, a path with V edges beats every shorter one, which can only happen on a negative cycle.

## Visual

```text
Edges in list order: D->E 1, C->D 3, B->C -2, A->C 4, A->B 5   (source A)

   5        -2         3         1
A ---> B ------> C ------> D ------> E        (A->C 4 also exists, but loses: 5 - 2 = 3 < 4)
 \_________4_____/

round:    A   B   C   D   E
start     0   -   -   -   -
1         0   5   4   -   -
2         0   5   3   7   -
3         0   5   3   6   8
4         0   5   3   6   7      (- means infinity)
```

## How It Works

1. Set `dist[start] = 0` and every other distance to infinity.
2. Repeat V - 1 times: for every edge (u, v, w), if `dist[u]` is finite and `dist[u] + w < dist[v]`, set `dist[v] = dist[u] + w`.
3. Check round: if any edge still relaxes, a negative cycle is reachable from the start. Python returns `None`, C++ an empty map, Go a nil map.
4. Otherwise return `dist`. Unreachable vertices keep the infinity value.

Edges whose tail is still at infinity are skipped, so a negative cycle the source cannot reach is ignored. There is no early exit: the code always runs V - 1 rounds.

## Step-by-Step Trace

The graph above (A to E are vertices 0 to 4). The edges are listed from the end of the path to the start, the worst order, so each round extends the correct distances by one edge:

| Round | Relaxations that succeed | dist (A B C D E) |
|-------|--------------------------|------------------|
| 1 | A->C gives C = 4, A->B gives B = 5 | 0 5 4 - - |
| 2 | C->D gives D = 7, B->C gives C = 3 | 0 5 3 7 - |
| 3 | D->E gives E = 8, C->D gives D = 6 | 0 5 3 6 8 |
| 4 | D->E gives E = 7 | 0 5 3 6 7 |

Result: `{0: 0, 1: 5, 2: 3, 3: 6, 4: 7}`; `bellman_ford_with_path(edges, 5, 0, 4)` returns `(7, [0, 1, 2, 3, 4])`. Adding the edge E->B with weight -3 makes the cycle B, C, D, E weigh -1, so both functions return `None`.

## Complexity

| Quantity | Cost | Why |
|----------|------|-----|
| Time | O(V * E) | V - 1 rounds of E relaxations, plus E checks, in every case |
| Space | O(V) | one distance per vertex |

On a dense graph (E about V^2) this is O(V^3). Stopping when a round changes nothing helps in practice but is not in this code and does not change the worst case.

## When to Use

Use Bellman-Ford when edge weights can be negative, when you need to detect a negative cycle (arbitrage, difference constraints), or when the graph is naturally an edge list. Do not use it when all weights are non-negative and the graph is big: Dijkstra's algorithm is much faster.

## Bellman-Ford vs. Alternatives

| Algorithm | Time | Negative edges | Gives |
|-----------|------|----------------|-------|
| Bellman-Ford | O(V * E) | Yes, detects negative cycles | one source to all |
| Dijkstra's | O((V + E) log V) | No | one source to all |
| Floyd-Warshall | O(V^3) | Yes, detects negative cycles | all pairs |
| BFS | O(V + E) | n/a | fewest edges only |

## Common Pitfalls

- **Too few rounds.** A shortest path can have V - 1 edges, and a bad edge order needs every round.
- **Relaxing from an unreached vertex.** Adding to infinity or `INT_MAX` overflows or gives a bogus value; the code skips such edges.
- **Undirected negative edges.** One undirected edge with weight -2 is already a negative cycle (walk back and forth). Use directed edges.
- **Trusting distances after a negative cycle.** They are not shortest distances; check the return value.
- **Vertices out of range.** Vertices must be numbered 0 to `num_vertices - 1`. C++ throws `out_of_range` and Go panics on a bad edge; Python does not check up front.
- **Overflow.** C++ and Go use plain `int` distances; keep weights far below the limit.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `bellman_ford.py` | `bellman_ford` and `bellman_ford_with_path`; infinity is `float('inf')`; `None` on a negative cycle |
| C++ | [C++/](C++/) | `bellman_ford.cpp` | `bellmanFord` only; `INT_MAX` for infinity; empty map on a negative cycle |
| Go | [Go/](Go/) | `main.go` | `BellmanFord` only; `math.MaxInt` for infinity; nil map on a negative cycle |

## Practice Problems

- [Cheapest Flights Within K Stops](https://leetcode.com/problems/cheapest-flights-within-k-stops/) (LeetCode; at most K + 1 rounds)
- [Network Delay Time](https://leetcode.com/problems/network-delay-time/) (LeetCode)
- [High Score](https://cses.fi/problemset/task/1673) (CSES; negative cycle on a path to the goal)
- [Cycle Finding](https://cses.fi/problemset/task/1197) (CSES)

## Related

- [Dijkstra's Algorithm](../Dijkstras_Algorithm/) - faster, non-negative weights only
- [Floyd-Warshall](../Floyd_Warshall_Algorithm/) - all pairs
- [A* Search](../A_Star_Search_Algorithm/)
- [BFS](../../Traversal/BFS/)
