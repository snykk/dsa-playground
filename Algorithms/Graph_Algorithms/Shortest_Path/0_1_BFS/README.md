# 0-1 BFS

0-1 BFS finds the shortest distance from one source to every vertex of a graph whose edge weights are all **0 or 1**: walls to break on a map, arrows to change, coupons to spend. It is Dijkstra's algorithm with the priority queue replaced by a **deque**: relaxing an edge of weight 0 pushes the vertex to the front, an edge of weight 1 to the back. Every push and pop costs O(1), so the whole search runs in **O(V + E)** time instead of Dijkstra's O((V + E) log V).

## Intuition

Dijkstra always takes the closest unsettled vertex next. When the weights are 0 and 1, "closest" never needs a heap. Say the vertex at the front has distance `d`. Its edges lead to `d + 0 = d` or `d + 1`, and nothing else is in the deque but entries at `d` and `d + 1`. So an entry at `d` belongs in front of everything (push it to the front) and an entry at `d + 1` behind everything (push it to the back).

**The invariant.** At every moment the distances in the deque never decrease from front to back, and the last is at most 1 more than the first: the deque holds at most two distances, `d` and `d + 1`, in that order. It holds at the start (one entry), a pop keeps it, and each push keeps it as just shown. So the entries come out in order of distance, exactly as from Dijkstra's heap, and the first time a vertex comes out its distance is final.

**Stale entries.** A vertex can be pushed twice: first at `d + 1` behind an edge of weight 1, then at `d` when a path of weight 0 reaches it more cheaply. The second entry comes out first and the vertex is processed with its final distance. When the first entry comes out later, its distance is larger than `dist[v]`, and the code skips it, like Dijkstra's lazy deletion.

## Visual

The worked example: seven vertices, nine directed edges, source A. Edge labels are weights.

```text
    G
    | 1                          (G -> A: no edge leads into G)
    v
    A ------1-----> B ------1-----> D ------1-----> F
    |               ^               ^               ^
    0               0               0               1
    |               |               |               |
    v               |               |               |
    C --------------+               E --------------+
    |                               ^
    +---------------1---------------+

final distances: A 0, B 0, C 0, D 1, E 1, F 2, G unreachable (-1)
```

A grid version: `.` is a road, `#` a wall. Entering a road costs 0, breaking into a wall costs 1. Column 5 is a wall from top to bottom, so at least one wall must go.

```text
    map (S start, G goal)      fewest walls broken to enter each cell
    S . . # . # .              0 0 0 1 0 1 1
    # # . # . # .              1 1 0 1 0 1 1
    . . . # . # .              0 0 0 1 0 1 1
    . # # # . # .              0 1 1 1 0 1 1
    . . . . . # G              0 0 0 0 0 1 1
```

The straight route along the top row breaks two walls, `(0, 3)` and `(0, 5)`. The answer is 1: the roads wind down to row 4 at no cost and the path breaks only `(4, 5)`.

## How It Works

The graph is `num_vertices` vertices numbered from 0 and a list of directed edges `(u, v, w)` with `w` equal to 0 or 1. An undirected edge is given as both `(u, v, w)` and `(v, u, w)`. Self-loops and parallel edges are allowed.

1. Check the input: every endpoint in range, every weight 0 or 1, the start a vertex. Build `adj[u]`, the edges out of `u` **in the order given**.
2. Set `dist[start] = 0`, every other `dist` to -1 (unreached) and every `parent` to -1. Put `(0, start)` in the deque.
3. Pop the front entry `(d, u)`. If `d > dist[u]`, it is stale: skip it.
4. For each edge `(u, v, w)` in order: if `v` is unreached or `d + w < dist[v]`, set `dist[v] = d + w` and `parent[v] = u`, then push `(d + w, v)` to the **front** if `w` is 0 and to the **back** if `w` is 1.
5. Repeat from step 3 until the deque is empty. Unreached vertices keep `dist = -1` and `parent = -1`.

**The path.** `parent[v]` is the vertex before `v` on a shortest path. Walk the parents back from the target to the start and reverse: that is `path_to`. It returns `[start]` for the start itself and an empty list for an unreachable target.

**Which shortest path.** A vertex's parent changes only when its distance strictly drops, so an equal offer later changes nothing. Entries pushed to the back come out in the order they were pushed, entries pushed to the front in the reverse order. With the edges `0->1 (0), 0->2 (0), 1->3 (1), 2->3 (1)`, vertex 2 is pushed in front of 1, is processed first and becomes 3's parent. Python, C++ and Go follow these rules on the same edge order and return the same parent array.

**The grid.** Cell `(r, c)` of a `rows x cols` grid is vertex `r * cols + c`. For every cell in row-major order and every neighbour in the order up, down, left, right, `grid_edges` adds an edge into the neighbour, of weight 1 for a wall and 0 for a road. `min_wall_breaks` runs 0-1 BFS on it. The start cell is free, even when it is a wall.

## Step-by-Step Trace

The worked example, as `python3 zero_one_bfs.py` runs it (A to G are vertices 0 to 6, and the edges are given in the order `A->B 1, A->C 0, C->B 0, B->D 1, C->E 1, E->D 0, E->F 1, D->F 1, G->A 1`):

| Pop | What happens | Pushes | Deque after (front first) |
|-----|--------------|--------|---------------------------|
| (0, A) | process A | B = 1 to the back, C = 0 to the front | (0, C) (1, B) |
| (0, C) | process C | B = 0 to the front (0 < 1), E = 1 to the back | (0, B) (1, B) (1, E) |
| (0, B) | process B | D = 1 to the back | (1, B) (1, E) (1, D) |
| (1, B) | stale: `dist[B]` is already 0 | none | (1, E) (1, D) |
| (1, E) | process E; E->D gives 1, not below 1 | F = 2 to the back | (1, D) (2, F) |
| (1, D) | process D; D->F gives 2, not below 2 | none | (2, F) |
| (2, F) | process F; it has no edges | none | empty |

Result: `dist = [0, 0, 0, 1, 1, 2, -1]` and `parent = [-1, 2, 0, 1, 2, 4, -1]`. `zero_one_bfs_with_path(edges, 7, 0, 5)` returns `(2, [0, 2, 4, 5])`, the path A, C, E, F, and for G it returns `(-1, [])`. Seven pops, one of them stale, and eight edge reads: every edge except G->A, whose tail is never reached.

## Complexity

| Quantity | Cost | Why |
|----------|------|-----|
| Time | O(V + E) | each vertex is processed once, so each edge is read at most once; at most 2V - 1 pushes and pops of O(1) each |
| Space | O(V + E) | the adjacency lists, `dist`, `parent` and at most 2V - 1 deque entries |

Why at most two pushes per vertex: when `v` is first reached from a vertex at distance `d`, it gets `d` or `d + 1`, and every later offer comes from a vertex at distance `d` or more. So `dist[v]` can drop at most once more, from `d + 1` to `d`. The source is pushed once, so there are at most 1 + 2(V - 1) = 2V - 1 pushes, and also at most E + 1, one per successful relaxation plus the source.

Counted on the Python code (pops include stale ones; edge reads are entries of `adj` read; the last column is the number of heap entries the repository's `dijkstra.py` creates on the same graph):

| Graph | V | E | Deque pops | Edge reads | Dijkstra heap entries |
|-------|---|---|------------|------------|-----------------------|
| random, weights 0 or 1 | 1,000 | 4,000 | 1,280 | 3,904 | 1,318 |
| random, weights 0 or 1 | 4,000 | 16,000 | 5,229 | 15,692 | 5,268 |
| random, weights 0 or 1 | 16,000 | 64,000 | 20,876 | 62,847 | 20,867 |
| every vertex pushed twice | 10,000 | 19,998 | 19,999 = 2V - 1 | 19,998 | |

The work grows in step with V + E. Both algorithms handle about the same number of entries; a deque operation is O(1) while a heap operation is O(log V). The last family is the worst case for pops: edges of weight 1 from the source to every vertex, then a chain of weight 0 that improves them all.

Distances are at most V - 1 (a shortest path repeats no vertex and every weight is at most 1), so a 32-bit `int` cannot overflow.

## When to Use

Use it when:

- every edge costs 0 or 1: free moves and paid moves, such as walking versus breaking a wall, following an arrow versus changing it, or a move that uses a coupon;
- you would otherwise run Dijkstra on such a graph and want the log factor gone;
- the state space is large (a grid of a million cells, or several trips over one), where O(V + E) per search matters.

Do not use it when:

- a weight is anything other than 0 or 1: use Dijkstra for non-negative weights and Bellman-Ford for negative ones. The code raises an error rather than give a wrong answer;
- every weight is 1: plain BFS with a queue gives the same distances with less work;
- you only need reachability: BFS or DFS.

## 0-1 BFS vs. Alternatives

| Algorithm | Time | Weights | Queue |
|-----------|------|---------|-------|
| 0-1 BFS | O(V + E) | 0 or 1 | deque, push to either end |
| BFS | O(V + E) | all equal (1) | queue, push to the back |
| Dijkstra (binary heap) | O((V + E) log V) | non-negative | priority queue |
| Bellman-Ford | O(V * E) | any, detects negative cycles | none |

With every weight 1, 0-1 BFS only ever pushes to the back and is plain BFS (the tests check that its distances equal BFS hop counts). With every weight 0, all reachable vertices get distance 0.

## Common Pitfalls

- **Marking a vertex done when it is pushed.** As in Dijkstra, the first push is not always the cheapest: a vertex reached at `d + 1` may be reached again at `d`. Compare with `dist[v]` and allow the improvement.
- **No stale check.** Without `if d > dist[u]: continue`, a stale entry processes its vertex a second time. The answer stays right here, but the edge reads are no longer bounded by E.
- **Pushing both kinds to the same end.** Pushing a weight-0 relaxation to the back breaks the invariant: the first pop of a vertex is no longer its final distance, a vertex is processed again each time its distance drops, and the bound of 2V - 1 pushes is gone.
- **Relaxing on `<=`.** On a cycle of weight 0 every vertex keeps offering the same distance to the next, and the loop never ends. Use a strict `<`.
- **Weights other than 0 and 1.** A weight of 2 pushed to the back breaks the order of the deque. All three versions reject such an edge up front, even on a part of the graph the search never reaches.
- **Undirected graphs.** The code takes directed edges; give an undirected edge in both directions.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `zero_one_bfs.py` | `zero_one_bfs`, `path_to`, `zero_one_bfs_with_path`, `grid_edges`, `min_wall_breaks`; `collections.deque`; `ValueError` on bad input |
| C++ | [C++/](C++/) | `zero_one_bfs.cpp` | `zeroOneBfs` returns a `ShortestPaths` struct; `pathTo`, `zeroOneBfsWithPath`, `gridEdges`, `minWallBreaks`; `std::deque`; `std::invalid_argument` on bad input |
| Go | [Go/](Go/) | `main.go` | `ZeroOneBFS`, `PathTo`, `ZeroOneBFSWithPath`, `GridEdges`, `MinWallBreaks`; a two-slice deque; errors wrapping `ErrInvalidGraph` or `ErrInvalidGrid` |

All three report an unreachable vertex the same way: distance -1, parent -1, and an empty path. They take the vertex count, the edges and the start in the same order, relax the edges in the order given and return the same `dist` and `parent`: the C++ and Go tests check 40 graphs against outputs of the Python code. A graph with no vertices has no valid start, so it is an error in all three.

## Practice Problems

- [Find a Safe Walk Through a Grid (LeetCode 3286)](https://leetcode.com/problems/find-a-safe-walk-through-a-grid/): an unsafe cell costs 1 health and a safe one 0; count the start cell too.
- [Minimum Obstacle Removal to Reach Corner (LeetCode 2290)](https://leetcode.com/problems/minimum-obstacle-removal-to-reach-corner/): `min_wall_breaks` itself.
- [Minimum Cost to Make at Least One Valid Path in a Grid (LeetCode 1368)](https://leetcode.com/problems/minimum-cost-to-make-at-least-one-valid-path-in-a-grid/): following a cell's arrow costs 0, any other direction 1.
- [Ocean Currents (Kattis oceancurrents)](https://open.kattis.com/problems/oceancurrents): drifting with the current is free and every other move costs 1, on grids up to 1000 by 1000, with up to 50 trips.
- [Stronger Takahashi (AtCoder ABC 213 E)](https://atcoder.jp/contests/abc213/tasks/abc213_e): walking is free, and one punch costs 1 and opens the cells it can reach.

## Related

- [Dijkstra's Algorithm](../Dijkstras_Algorithm/): the general case; read it first
- [BFS](../../Traversal/BFS/): the case where every weight is 1
- [Deque](../../../../Data_Structures/Linear/Queue/Deque/): the structure that replaces the heap
- [Bellman-Ford](../Bellman_Ford_Algorithm/): negative weights
- [Graph Traversal Problems](../../../../Problem_Patterns/Graph_Traversal_Problems/): grid searches and multi-source BFS
