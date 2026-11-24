# Eulerian Path and Circuit

An **Eulerian path** is a walk that uses every edge of a graph exactly once; an **Eulerian circuit** is one that ends where it started. Whether one exists depends only on the degrees of the vertices and on whether the edges hang together, and **Hierholzer's algorithm** finds one in **O(V + E)**. This topic covers undirected and directed graphs, with self-loops, parallel edges and isolated vertices allowed.

## Intuition

Every time a walk passes through a vertex, it arrives along one edge and leaves along another. So at a vertex in the middle of the walk the edges are used in pairs, and only the two ends of the walk can have an edge left over:

- **Undirected:** a circuit needs every degree even; a path needs exactly two vertices of odd degree, and it runs from one to the other. A self-loop adds 2 to its vertex's degree.
- **Directed:** a circuit needs out-degree equal to in-degree at every vertex; a path needs one vertex with one more edge out than in (the start), one with one more edge in than out (the end), and every other vertex balanced.
- **Connected:** a walk cannot jump, so every edge must lie in one connected component (for a directed graph, one weakly connected component: connected when the directions are ignored). Vertices with no edge do not matter.

The degrees and the connectivity together are enough: when both hold, a walk exists. That is Euler's answer to the bridges of Konigsberg (1736): four land masses joined by seven bridges, with degrees 5, 3, 3 and 3. Four odd vertices, so no walk crosses every bridge once.

**Hierholzer's idea.** Walk from the start, always along an unused edge, until you are stuck. When the degrees pass the test you can only get stuck at the end (or, for a circuit, back at the start): every other vertex you enter still has an unused edge to leave by. The edges you have not used yet form closed circuits that touch the walk, and each one can be **spliced in** where it touches it. The version here keeps the walk on a stack and splices while backing up, so it needs no second pass.

## Visual

The worked example: two triangles joined by the edge 0-3, with the edges given in the order `(0, 3), (0, 1), (1, 2), (2, 0), (3, 4), (4, 5), (5, 3)`:

```text
          1                   4
         / \                 / \          degree of 0 and 3: 3 (odd)
        /   \               /   \         every other degree: 2
       2-----0-------------3-----5        so a path from 0 to 3
```

The walk first takes 0 -> 3 -> 4 -> 5 -> 3 and is stuck. Backing up to 0, it walks the triangle 0 -> 1 -> 2 -> 0, which lands in front of the part already finished:

```text
    stuck walk:      0 . . . . . . . 3 -> 4 -> 5 -> 3
    spliced in at 0: 0 -> 1 -> 2 -> 0 -> 3 -> 4 -> 5 -> 3
```

## How It Works

The graph is `n` vertices, `0 .. n - 1`, and a list of edges `(u, v)`, all undirected or all directed.

1. **Adjacency.** `adj[v]` lists v's edges as `(neighbour, edge index)` pairs **in the order the edges are given**. A directed edge `u -> v` sits in `adj[u]`; an undirected edge sits in `adj[u]` and `adj[v]`, so a self-loop sits twice in its vertex's list and `len(adj[v])` is v's degree.
2. **Degree test.** Count odd degrees (undirected) or out-degree minus in-degree (directed), decide between circuit, path and nothing, and pick the start (see the tie rule below). If the test fails, stop: there is no walk.
3. **Walk.** `stack = [start]`. Look at the top vertex `v`. Move `ptr[v]` along `adj[v]` past entries whose edge is already used (an undirected edge used from its other end); if an unused edge `e` to `w` is found, mark it used and push `w`. If not, `v` is finished: pop it onto `result`.
4. **Connectivity.** The walk can only use edges of the start's component. If `result` holds fewer than `E + 1` vertices, some edge lies in another component: there is no walk. Otherwise `result`, reversed, is the walk.

`ptr[v]` only moves forward, so every entry of every adjacency list is read once in the whole run. That is what makes the walk O(V + E); a walk that rescans `adj[v]` from the front each time it returns to `v` is quadratic on a vertex it enters many times (see Complexity).

### Loops, parallel edges and isolated vertices

- **Self-loop.** Undirected, it adds 2 to its vertex's degree and sits twice in `adj[v]`; the second entry is skipped as used. Directed, it adds 1 to both the out- and the in-degree. Either way the walk takes it as `v -> v`.
- **Parallel edges.** Each one is its own edge with its own index, used once. The walk returns the indices (`edge_ids`), so it says which of two parallel edges was taken.
- **Isolated vertices.** They have no edge to walk, so the degree test and the connectivity check ignore them, and the start is the smallest vertex that **has** an edge.
- **No edges at all.** There is nothing to walk: the kind is "circuit" and the walk is two empty lists. This is different from "no walk".

### What is returned when no walk exists

`None` in Python, `std::nullopt` in C++, and `ok == false` (with a zero `Walk`) in Go: the same answer in all three, distinct from the empty walk of a graph with no edges. A graph that passes the degree test but has edges in two components also gets this answer.

### Which walk is returned (the tie rule)

A graph usually has many Eulerian walks. The one returned is fixed by three rules, the same in Python, C++ and Go:

1. **The start**: the smaller of the two odd vertices (undirected path), the vertex with out = in + 1 (directed path, the only possible start), or the smallest vertex with an edge (circuit).
2. **The next edge**: from `v`, the first entry of `adj[v]` not used yet, in input order.
3. **The order**: the vertices in reverse order of being popped from the stack.

So the edge order decides the walk. The bowtie `(0, 1), (1, 2), (2, 0), (0, 3), (3, 4), (4, 0)` gives `0 1 2 0 3 4 0`; the same edges in reverse order give `0 4 3 0 2 1 0`.

## Step-by-Step Trace

The worked example, as `python3 eulerian_path.py` runs it. Degrees: 0 and 3 are odd, so it is a path from 0. `adj[0]` is `(3, e0), (1, e1), (2, e3)` and `adj[3]` is `(0, e0), (4, e4), (5, e6)`.

| Step | Top v | Action | Stack after | result after (pop order) |
|------|-------|--------|-------------|--------------------------|
| 1 | 0 | take e0 to 3 | 0 3 | |
| 2 | 3 | skip e0 (used), take e4 to 4 | 0 3 4 | |
| 3 | 4 | skip e4, take e5 to 5 | 0 3 4 5 | |
| 4 | 5 | skip e5, take e6 to 3 | 0 3 4 5 3 | |
| 5 | 3 | skip e6: no unused edge, pop (stuck at the end) | 0 3 4 5 | 3 |
| 6-8 | 5, 4, 3 | nothing left: pop | 0 | 3 5 4 3 |
| 9 | 0 | `ptr[0]` is past e0 already: take e1 to 1, a detour from 0 | 0 1 | 3 5 4 3 |
| 10 | 1 | skip e1, take e2 to 2 | 0 1 2 | 3 5 4 3 |
| 11 | 2 | skip e2, take e3 to 0 | 0 1 2 0 | 3 5 4 3 |
| 12 | 0 | skip e3: stuck back at 0, pop | 0 1 2 | 3 5 4 3 0 |
| 13-15 | 2, 1, 0 | nothing left: pop | (empty) | 3 5 4 3 0 2 1 0 |

Reversed: the path `0 1 2 0 3 4 5 3`, along edges `1, 2, 3, 0, 4, 5, 6`. Seven pushes and eight pops; each of the 14 adjacency entries is read once.

**Directed example**: `0 -> 1, 1 -> 4, 1 -> 2, 2 -> 3, 3 -> 1`. Vertex 0 has out - in = +1 and vertex 4 has -1, so the walk starts at 0. It goes 0 -> 1 -> 4 and is stuck at 4; backing up to 1, it walks the cycle 1 -> 2 -> 3 -> 1, and the result is `0 1 2 3 1 4`, along edges `0, 2, 3, 4, 1`.

## Complexity

| Part | Time | Why |
|------|------|-----|
| Adjacency and degree test | O(V + E) | one pass over the edges, one over the vertices |
| Hierholzer's walk | O(V + E) | every edge is pushed once and popped once; `ptr` reads every adjacency entry once (E entries directed, 2E undirected) |
| Total | O(V + E) | the connectivity check is the walk's length, so it costs nothing extra |
| Space | O(V + E) | the adjacency lists, `ptr`, `used`, the stack and the result |

Counted reads of adjacency entries in the Python code, on a "flower": k triangles `0 - a - b - 0` that share vertex 0, so the walk comes back to 0 k times (undirected, E = 3k):

| k | E | Reads, with `ptr` | Reads, scanning `adj[v]` from the front |
|---|---|-------------------|------------------------------------------|
| 100 | 300 | 600 | 31,000 |
| 200 | 600 | 1,200 | 122,000 |
| 400 | 1,200 | 2,400 | 484,000 |
| 800 | 2,400 | 4,800 | 1,928,000 |

With the pointer the count is exactly 2E. Without it, each return to 0 reads the used entries of `adj[0]` again: 3k^2 + 10k reads, about four times as many each time k doubles. The directed flower gives E and (3k^2 + 11k) / 2.

## When to Use

Use it when:

- a route must cover every edge once: mail delivery or street sweeping on a network whose degrees pass the test, drawing a figure in one stroke;
- pieces must be chained end to end: dominoes, words whose last letter starts the next word, pairs `[a, b]` arranged so that each `b` is the next `a`, an itinerary that uses every ticket;
- you build a de Bruijn sequence (every string of length n over an alphabet exactly once as a window): it is an Eulerian circuit of the graph on strings of length n - 1;
- you assemble a sequence from overlapping fragments, as in DNA assembly from k-mers;
- you need the lexicographically smallest walk, as for an itinerary: sort the edges by their ends first (undirected: by smaller end, then larger end), which puts every adjacency list in increasing order, and the walk returned is then the smallest one.

Do not use it when:

- every **vertex** must be visited once: that is a Hamiltonian path, which is NP-complete;
- every edge must be covered **at least** once at the least total length, and the degrees fail the test: that is the Chinese postman problem, which adds the cheapest duplicate edges first.

## Eulerian Path vs. Alternatives

| Method | Time | Notes |
|--------|------|-------|
| Hierholzer with a stack (here) | O(V + E) | splices the circuits while backing up; no recursion |
| Hierholzer, recursive | O(V + E) | the same order; recursion depth up to E |
| Fleury's algorithm | O(E (V + E)) | at each step takes an edge that is not a bridge of the unused edges if it can, checked with a DFS; not in this repository |
| Hamiltonian path (every vertex once) | exponential (backtracking) | a different, NP-complete problem; not in this repository |

## Common Pitfalls

1. **Degrees without connectivity.** Two separate triangles have only even degrees and no single walk. Check that the walk used all E edges.
2. **Connectivity over all vertices.** An isolated vertex does not stop a walk; check only the vertices that have edges.
3. **Strong connectivity in a directed graph.** Weak connectivity is enough: `0 -> 1` has a path, though 1 cannot reach 0.
4. **Losing the pointer.** Rescanning `adj[v]` from the front on every visit makes the walk quadratic on a vertex entered many times (the flower above).
5. **An undirected edge used twice.** It sits in two lists, so mark it used by its edge index, not by the list entry.
6. **Recursion depth.** A recursive Hierholzer nests one call per edge on a long cycle. In Python a cycle of 997 edges already exceeds the default limit of 1000; a C++ version built with `-O2` crashed on a cycle of 10^5 edges with an 8 MB stack.
7. **Forgetting to reverse.** The pops come out from the end of the walk; for a directed graph the unreversed list walks every edge backwards.
8. **The wrong start for a path.** A path must start at an odd vertex (undirected) or at the vertex with out = in + 1 (directed). Started elsewhere, the result is not a walk: on `0 -> 1 -> 2` from 1 it misses the edge `0 -> 1`, and on the undirected path `0 - 1 - 2` from 1 it uses both edges but returns `1 2 0`, whose pieces do not join.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `eulerian_path.py` | `eulerian_kind` returns `"circuit"`, `"path"` or `"none"`; `eulerian_path` an `EulerWalk(vertices, edge_ids)` or `None`; `ValueError` on bad input |
| C++ | [C++/](C++/) | `eulerian_path.cpp` | `eulerianKind` returns an `EulerKind`; `eulerianPath` a `std::optional<EulerWalk>`; `std::invalid_argument` on bad input |
| Go | [Go/](Go/) | `main.go` | `EulerianKind` returns a `Kind`; `EulerianPath` a `Walk`, an `ok` flag and an error wrapping `ErrInvalidGraph` on bad input |

All three build `adj` in edge order, run the same loop with an explicit stack and return the same walk. Bad input is a negative `n` or an edge end outside `0 .. n - 1`. The C++ and Go tests pin the outputs of the Python code on 40 graphs.

## Practice Problems

- [Mail Delivery (CSES 1691)](https://cses.fi/problemset/task/1691): an undirected circuit that must start at crossing 1, or IMPOSSIBLE.
- [Teleporters Path (CSES 1693)](https://cses.fi/problemset/task/1693): a directed path from level 1 to level n through every teleporter.
- [Eulerian Path (Kattis eulerianpath)](https://open.kattis.com/problems/eulerianpath): a directed graph per test case, with the start found from the degrees.
- [De Bruijn Sequence (CSES 1692)](https://cses.fi/problemset/task/1692): the shortest bit string with every n-bit string in it, an Eulerian circuit on the (n - 1)-bit strings.

## Related

- [DFS](../../Traversal/DFS/README.md) and [BFS](../../Traversal/BFS/README.md): the walk is a DFS over edges instead of vertices; connectivity is a traversal question
- [Strongly Connected Components](../Strongly_Connected_Components/README.md): the strong connectivity an Eulerian path does not need
- [Bridges and Articulation Points](../Tarjan_Bridges_Articulation/README.md): the bridges that Fleury's algorithm avoids
- [Directed and Undirected Graphs](../../../../Data_Structures/Non_Linear/Graph/Directed_and_Undirected/README.md): degrees, and how a loop counts
