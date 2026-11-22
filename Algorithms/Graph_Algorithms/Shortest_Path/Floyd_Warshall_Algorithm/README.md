# Floyd-Warshall Algorithm

Floyd-Warshall computes the shortest distance between every pair of vertices with three nested loops over a distance matrix. It allows negative edge weights, detects negative cycles, and takes O(V^3) time and O(V^2) space.

## Intuition

For each pair (i, j) ask one question: is it shorter to go through vertex k? Let the vertices 0, 1, 2, ... become allowed intermediate stops one at a time.

The invariant: after the round for k, `dist[i][j]` is the length of the shortest path from i to j that uses only vertices `0..k` as intermediates. A better path through k splits into i to k and k to j, and neither half needs k as a stop, so both halves are already known from the previous round. That is why k must be the outermost loop.

## Visual

```text
Distance matrix (row = from, column = to), vertices A B C D = 0 1 2 3.
Round k looks at "row i, column k" + "row k, column j" for every cell (i, j):

            col k            col j
   row i    d[i][k]  -----+      d[i][j]  <-  min( d[i][j],  d[i][k] + d[k][j] )
                          |
   row k                  +--->  d[k][j]

Final matrix of the example below:
        A   B   C   D
   A    0   3   1   2
   B    1   0  -2  -1
   C    3   6   0   1
   D    2   5   3   0
```

## How It Works

1. `dist[i][i] = 0`; `dist[u][v] = min(dist[u][v], w)` for every edge, so parallel edges keep the cheapest and a positive self-loop never raises the diagonal; infinity elsewhere.
2. For k = 0 .. V - 1, for every i and j: if `dist[i][k]` and `dist[k][j]` are finite and their sum is smaller than `dist[i][j]`, replace it.
3. If any `dist[i][i] < 0`, there is a negative cycle. C++ and Go check after every round and return an empty matrix / nil; Python checks once at the end and returns `None`.
4. Otherwise `dist[i][j]` is the shortest distance, or the infinity value if j is unreachable from i.

For paths, Python's `floyd_warshall_path` keeps `next[i][j]`, the first vertex after i on a shortest path to j. It is set to `next[i][k]` when the route through k wins, and `reconstruct_path` follows it.

## Step-by-Step Trace

Directed graph with edges A->B 3, A->D 7, B->A 8, B->C -2, C->A 5, C->D 1, D->A 2 (vertices A to D are 0 to 3). Cells that improve in each round:

| Round | Improved cells |
|-------|----------------|
| k = A | B to D = 15, C to B = 8, D to B = 5 |
| k = B | A to C = 1, D to C = 3 |
| k = C | A to D = 2, B to A = 3, B to D = -1 |
| k = D | B to A = 1, C to A = 3, C to B = 6 |

The final matrix is shown above (output of `floyd_warshall`). The path from B to D is `[1, 2, 3]` (cost -1) and from D to C is `[3, 0, 1, 2]` (cost 3), from `reconstruct_path`.

## Complexity

| Quantity | Cost | Why |
|----------|------|-----|
| Time | O(V^3) | V rounds of V * V cell updates, whatever the edge count |
| Space | O(V^2) | the matrix, updated in place |

The in-place update is safe because during round k the entries `dist[i][k]` and `dist[k][j]` do not change (`dist[k][k]` is 0 unless there is a negative cycle).

## When to Use

Use it for all-pairs shortest paths on small or dense graphs, with negative edges allowed, for transitive closure (replace min and + by or and and), and when short code matters. Do not use it on large sparse graphs: V runs of Dijkstra's algorithm (non-negative weights) or Johnson's algorithm are much faster.

## Floyd-Warshall vs. Alternatives

| Approach | Time | Negative edges |
|----------|------|----------------|
| Floyd-Warshall | O(V^3) | Yes |
| Dijkstra's from every vertex | O(V (V + E) log V) | No |
| Bellman-Ford from every vertex | O(V^2 E) | Yes |
| BFS from every vertex | O(V (V + E)) | n/a (unweighted) |

## Common Pitfalls

- **Wrong loop order.** `k` must be outermost.
- **Assigning instead of min.** With parallel edges the last would win, and a self-loop would overwrite the diagonal 0.
- **Adding infinity.** Skip cells where `dist[i][k]` or `dist[k][j]` is the infinity sentinel.
- **Ignoring the diagonal.** A negative `dist[i][i]` means a negative cycle and the matrix cannot be trusted.
- **Next pointers on a negative cycle.** They can loop forever; `floyd_warshall_path` returns `None` and `reconstruct_path` stops after V vertices.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `floyd_warshall.py` | `floyd_warshall`, `floyd_warshall_path`, `reconstruct_path`; `sys.maxsize` means no path; `None` on a negative cycle |
| C++ | [C++/](C++/) | `floyd_warshall.cpp` | `floydWarshall`; `long long`, `LLONG_MAX` means no path; empty matrix on a negative cycle |
| Go | [Go/](Go/) | `main.go` | `FloydWarshall`; `math.MaxInt` means no path; nil on a negative cycle |

## Practice Problems

- [Find the City With the Smallest Number of Neighbors at a Threshold Distance (LeetCode 1334)](https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/)
- [Shortest Routes II (CSES 1672)](https://cses.fi/problemset/task/1672)
- [Course Schedule IV (LeetCode 1462)](https://leetcode.com/problems/course-schedule-iv/)
- [Minimum Cost to Convert String I (LeetCode 2976)](https://leetcode.com/problems/minimum-cost-to-convert-string-i/)
- [Greg and Graph (Codeforces 295B)](https://codeforces.com/problemset/problem/295/B)

## Related

- [Dijkstra's Algorithm](../Dijkstras_Algorithm/) - single source, non-negative weights
- [Bellman-Ford](../Bellman_Ford_Algorithm/) - single source, negative weights
- [A* Search](../A_Star_Search_Algorithm/)
- [Kruskal's Algorithm](../../Minimum_Spanning_Tree/Kruskals_Algorithm/) - another graph algorithm over edge weights
