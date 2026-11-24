# Bipartite Matching

A bipartite graph has its vertices on two sides, left and right, and every edge joins a left vertex to a right one. A **matching** is a set of edges with no vertex in common, and a **maximum matching** is one with as many edges as possible: workers to jobs, students to projects, applicants to open positions. This topic covers unweighted graphs, with two algorithms that both grow the matching along augmenting paths: **Kuhn's algorithm** in **O(V E)** and **Hopcroft-Karp** in **O(E sqrt(V))**. It also covers **Konig's theorem**, which turns the final matching into a minimum vertex cover.

## Intuition

An **augmenting path** starts at a free left vertex, ends at a free right vertex, and alternates between edges outside the matching and edges inside it. It has one more edge outside than inside, so **flipping** it (the outside edges enter the matching, the inside ones leave) matches one more vertex on each side and keeps every vertex that was matched matched.

**Berge's theorem.** A matching is maximum exactly when no augmenting path exists. So both algorithms repeat one step, find an augmenting path and flip it, until none is left.

- **Kuhn** asks each left vertex in turn to find a partner. If the right vertex it wants is taken, its partner is asked to move to another right vertex, which may push a third vertex along, and so on: a depth-first search for an augmenting path.
- **Hopcroft-Karp** first measures, with one BFS from every free left vertex at once, how long the shortest augmenting paths are. Then it flips as many vertex-disjoint paths of that length as it can find, and repeats. Each round (a **phase**) makes the shortest augmenting path longer, which bounds the number of phases by about 2 sqrt(V).

**Konig's theorem.** In a bipartite graph, the smallest set of vertices that touches every edge (a minimum vertex cover) has exactly as many vertices as a maximum matching has edges. Any cover needs one vertex per matching edge, so the two numbers prove each other optimal.

**Reduction to maximum flow.** Add a source with an edge of capacity 1 to every left vertex, give every edge of the graph capacity 1 from left to right, and add an edge of capacity 1 from every right vertex to a sink. The maximum flow equals the size of a maximum matching, and the middle edges that carry flow form one. Each search of Kuhn's algorithm is a DFS for an augmenting path in this network's residual graph, from one free left vertex: the backward residual edges are the matching edges, walked from right to left.

## Visual

The worked example has four vertices a side and seven edges, written in this order: `(0, 1), (0, 2), (0, 3), (1, 0), (1, 1), (2, 0), (3, 1)`. An `x` is an edge, an `M` an edge of the matching Kuhn's algorithm returns:

```text
          R0   R1   R2   R3
    L0     .    x    M    x        L0 reaches R1, R2 and R3
    L1     x    M    .    .        L1, L2 and L3 reach only R0 and R1,
    L2     M    .    .    .        so one of them stays free:
    L3     .    x    .    .        the maximum matching has 3 edges
```

In this picture a vertex cover is a set of rows and columns that together hold every `x`. Row L0 and columns R0 and R1 do, and three lines is the least possible, because the three `M`s sit in three different rows and columns.

## How It Works

The graph is `n_left`, `n_right` and a list of edges `(u, v)` with `0 <= u < n_left` and `0 <= v < n_right`; both sides are numbered from 0. `adj[u]` lists the right neighbours of `u` **in the order the edges are given** (a repeated edge stays and changes nothing), and every search tries them in that order. `match_left[u]` and `match_right[v]` hold each vertex's partner, or -1.

### Kuhn's algorithm

1. For each left vertex `root`, in order `0, 1, ..., n_left - 1`, run one DFS for an augmenting path.
2. The DFS stands on a left vertex `u` and tries its next neighbour `v` that this search has not tried yet (`seen[v] == root` marks the tried ones, so nothing is cleared between roots).
3. If `v` is free, the path from `root` to `v` is augmenting: flip it, and the matching grows by one.
4. If `v` is matched to `w`, push `w`: `u` can only take `v` if `w` moves to another right vertex.
5. If `u` has no neighbour left to try, pop it. If the stack empties, `root` stays free. It never finds a path later either: a vertex with no augmenting path keeps having none as the matching grows, so one search per left vertex is enough.

### Hopcroft-Karp

1. **BFS (the layers).** Every free left vertex is in layer 0. From a left vertex `u` in layer `d`, an edge to a matched right vertex `v` puts `v`'s partner in layer `d + 1`, if it has no layer yet. The BFS stops at the first free right vertex it meets: the layer of its neighbour, `last`, is where every shortest augmenting path ends, and layers past `last` are cleared. If the BFS never meets a free right vertex, the matching is maximum.
2. **DFS (the paths).** From each free left vertex in order, search for a path that goes from layer `d` only to a partner in layer `d + 1`. A free right vertex can only be next to layer `last` (the BFS stopped at the first one, and no right vertex becomes free during a phase), so every path found is a shortest one. A vertex whose search fails gets `dist = -1` for the rest of the phase, and a flipped path cannot be reached again, so the paths of a phase share no vertex.
3. Repeat from step 1.

### Minimum vertex cover (Konig)

1. Take the Hopcroft-Karp matching.
2. Let `Z` be the vertices reachable from the free left vertices by alternating paths: from a left vertex along any edge, from a right vertex along its matching edge. Every right vertex in `Z` is matched, or there would be an augmenting path.
3. The cover is the left vertices **outside** `Z` and the right vertices **inside** `Z`. It holds exactly one end of every matching edge and touches every edge, so its size is the size of the matching.

### Which matching is returned

A graph can have many maximum matchings. The one returned is fixed by the edge order, the order of the roots and the algorithm, and Python, C++ and Go return the same one. Kuhn and Hopcroft-Karp often return different matchings of the same size: on the complete graph with edges `(0, 0), (0, 1), (1, 0), (1, 1)`, Kuhn returns `match_left = [1, 0]` (L1 asks for R0 first and moves L0 to R1) and Hopcroft-Karp `[0, 1]` (its first phase gives each vertex its first free neighbour). Listing the edges in reverse swaps the two answers.

## Step-by-Step Trace

The worked example, as `python3 bipartite_matching.py` runs it.

**Kuhn:**

| Root | Search | Augmenting path | Matching after |
|------|--------|-----------------|----------------|
| L0 | R1 is free | L0 - R1 | L0-R1 |
| L1 | R0 is free | L1 - R0 | L0-R1, L1-R0 |
| L2 | R0 is taken by L1; L1 tries R1, taken by L0; L0 tries R2, free | L2 - R0 - L1 - R1 - L0 - R2 | L0-R2, L1-R1, L2-R0 |
| L3 | R1 is taken by L1; L1 tries R0, taken by L2; L2 has nothing else to try, and neither has L1 | none | unchanged |

Result: size 3, `match_left = [2, 1, 0, -1]`.

**Hopcroft-Karp:**

| Phase | Layers (dist of L0..L3) | last | Searches | Matching after |
|-------|-------------------------|------|----------|----------------|
| 1 | 0, 0, 0, 0 | 0 | L0 - R1 and L1 - R0 are flipped; L2 (R0 leads to L1 in layer 0) and L3 (R1 leads to L0) are dead ends | L0-R1, L1-R0 |
| 2 | 1, 1, 0, 0 | 1 | L2 - R0 - L1, but L1 has no partner in layer 2: L1 and L2 are dead ends. L3 - R1 - L0 - R2 is flipped | L0-R2, L1-R0, L3-R1 |
| 3 | -1, 1, 0, 2 | -1 | the BFS from L2 reaches L1 and L3 but no free right vertex: done | unchanged |

Result: size 3, `match_left = [2, 0, -1, 1]`, a different maximum matching from Kuhn's.

**Cover:** from the free L2, alternating paths reach R0, L1, R1 and L3, so `Z = {L1, L2, L3, R0, R1}`. The cover is `{L0}` on the left and `{R0, R1}` on the right: three vertices for three matching edges, and every edge has an end in it.

## Complexity

| Algorithm | Searches | One search | Total time | Space |
|-----------|----------|------------|------------|-------|
| Kuhn | one per left vertex | O(E): each right vertex is tried once, so each adjacency list is scanned once | O(V E) | O(V + E) |
| Hopcroft-Karp | at most about 2 sqrt(V) phases | O(V + E) per phase: one BFS and DFSs that enter each vertex once | O(E sqrt(V)) | O(V + E) |
| Konig cover | one walk after Hopcroft-Karp | O(V + E) | O(E sqrt(V)) | O(V + E) |

Why about 2 sqrt(V) phases: each phase makes the shortest augmenting path longer. After sqrt(V) phases every augmenting path has more than sqrt(V) left vertices; the maximum matching differs from the current one by vertex-disjoint augmenting paths, so at most sqrt(V) of them remain, and each later phase flips at least one.

Counted edge scans of the Python code (every time a search looks at an entry of `adj`):

| Graph | Kuhn | Hopcroft-Karp |
|-------|------|---------------|
| complete K_{n,n}, n = 200 (E = 40000) | 1,353,400 = n(n+1)(n+2)/6 | 20,101 = n(n+1)/2 + 1, in 2 phases |
| random, n = 8000 a side, E = 32000 | 4,232,716 | 553,173, in 16 phases |
| 80 components, the k-th needing a path of 2k+1 edges (V = 6480, E = 6400) | 9,560 | 344,679, in 81 phases |

The phases count every BFS, the last one, which finds no path, included: on the complete graph the first phase matches every vertex and the second only confirms it. Each new root of Kuhn's asks for R0 and pushes every earlier vertex one place along. The last family is close to Hopcroft-Karp's worst case: one phase per path length, about sqrt(V) phases, while Kuhn finds each long path in one search. Neither algorithm is faster on every graph; Hopcroft-Karp has the better bound.

## When to Use

Use it when:

- you pair items of two kinds, each pair allowed or not, and want as many pairs as possible: jobs to machines, students to slots, dominoes on a grid (a checkerboard colouring makes the grid bipartite);
- you need a minimum vertex cover or a maximum independent set (V minus the matching) of a bipartite graph;
- the graph has up to a few thousand vertices (Kuhn) or a few hundred thousand edges (Hopcroft-Karp).

Do not use it when:

- the edges have weights and you want the cheapest or best assignment: that is the Hungarian algorithm or min-cost flow;
- the graph is not bipartite (it has an odd cycle): an alternating search can then miss an augmenting path that exists, and maximum matching needs Edmonds' blossom algorithm;
- a vertex may take several partners: use maximum flow with capacities larger than 1.

## Bipartite Matching vs. Alternatives

| Method | Time | Notes |
|--------|------|-------|
| Kuhn | O(V E) | shortest code; often fast in practice |
| Hopcroft-Karp | O(E sqrt(V)) | the best bound for unweighted bipartite matching here |
| Max flow on the reduction, Ford-Fulkerson or Edmonds-Karp | O(V E) | the flow is at most V, so either is O(V E); more code |
| Hungarian algorithm | O(V^3) | weighted assignment; not in this repository |
| Edmonds' blossom algorithm | O(V^3) as usually implemented | general graphs; not in this repository |

## Common Pitfalls

1. **Two numberings for one vertex.** Both sides are numbered from 0, so `(1, 1)` joins L1 and R1. Code that puts the right side after the left (`n_left + v`) must do so everywhere.
2. **Resetting `seen` only once.** Kuhn's `seen` belongs to one search; without clearing it (or the per-root stamp used here), later roots skip right vertices they never tried.
3. **Recursion depth.** An augmenting path can pass through every left vertex. A recursive DFS fails at about 1000 vertices in Python; all three versions here keep the path in a stack instead.
4. **Expecting one particular matching.** Only the size is unique. Kuhn and Hopcroft-Karp, or one algorithm on reordered edges, can return different matchings.
5. **Hopcroft-Karp without the layer rule.** A DFS that takes any augmenting path is still correct, but it loses the O(E sqrt(V)) bound.
6. **Konig on a general graph.** The theorem holds for bipartite graphs only; on a triangle the maximum matching has 1 edge and the minimum cover 2 vertices.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `bipartite_matching.py` | `kuhn`, `hopcroft_karp`, `min_vertex_cover`; `ValueError` on bad input |
| C++ | [C++/](C++/) | `bipartite_matching.cpp` | `kuhn`, `hopcroftKarp` return a `Matching` struct, `minVertexCover` a `VertexCover`; `std::invalid_argument` on bad input |
| Go | [Go/](Go/) | `main.go` | `Kuhn`, `HopcroftKarp`, `MinVertexCover`; an error wrapping `ErrInvalidGraph` on bad input |

All three build `adj` in edge order, run the same iterative searches and return the same matching and the same cover. Bad input is a negative side size or an edge endpoint out of range. The C++ and Go tests pin the outputs of the Python code on 40 graphs.

## Practice Problems

- [School Dance (CSES 1696)](https://cses.fi/problemset/task/1696): match boys to girls and print the pairs.
- [Gopher II (Kattis gopher2)](https://open.kattis.com/problems/gopher2): gophers to holes they can reach in time; the answer is n minus the matching.
- [Maxflow (AtCoder Library Practice D)](https://atcoder.jp/contests/practice2/tasks/practice2_d): dominoes on a grid; a checkerboard colouring makes the cells a bipartite graph.
- [Guardian of Decency (Kattis guardianofdecency)](https://open.kattis.com/problems/guardianofdecency): a largest group with no conflicting pair, a maximum independent set by Konig.
- [Bilateral Projects (Kattis bilateral)](https://open.kattis.com/problems/bilateral): print a minimum vertex cover, built from the matching as Konig's proof does, with employee 1009 in it whenever some minimum cover contains 1009.

## Related

- [Network Flow](../Network_Flow/README.md): matching is the unit-capacity case of maximum flow
- [Ford-Fulkerson](../Network_Flow/Ford_Fulkerson/README.md): Kuhn is its DFS on the reduction
- [Edmonds-Karp](../Network_Flow/Edmonds_Karp/README.md): BFS augmenting paths, as in Hopcroft-Karp's layers
- [Graph Coloring](../../../Advanced_Algorithms/Backtracking/Graph_Coloring/README.md): a graph is bipartite exactly when it can be coloured with 2 colours
- [BFS](../../Traversal/BFS/README.md) and [DFS](../../Traversal/DFS/README.md): the two searches inside Hopcroft-Karp
