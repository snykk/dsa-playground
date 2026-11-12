# Prim's Algorithm

Prim's algorithm builds a minimum spanning tree (MST) by growing one tree from a start vertex, always adding the cheapest edge that leaves the tree. With a binary heap it runs in O(E log V); with an array and an adjacency matrix it runs in O(V^2), which suits dense graphs.

## Intuition

Start with one vertex. At every step, look at all edges that connect the tree to a vertex outside it, and take the cheapest. Repeat until every reachable vertex is in the tree.

Why it is safe (the cut property): the tree and the remaining vertices form a cut, and a lightest edge crossing any cut belongs to some MST, so adding it can never rule out an optimal tree. Prim's algorithm resembles Dijkstra's, but it ranks a vertex by one connecting edge instead of by the length of a whole path.

## Visual

```text
Edges: A-B 7, A-D 5, B-C 8, B-D 9, B-E 7, C-E 5, D-E 15, D-F 6, E-F 8, E-G 9, F-G 11
Start at A. The tree grows by one vertex per step:

  step  cheapest crossing edge    tree
   1    (start)                   {A}
   2    A-D 5                     {A D}
   3    D-F 6                     {A D F}
   4    A-B 7                     {A B D F}
   5    B-E 7                     {A B D E F}
   6    E-C 5                     {A B C D E F}
   7    E-G 9                     {A B C D E F G}   total 39
```

## How It Works

1. Put the start vertex in the tree and push its edges `(weight, from, to)` into a min-heap.
2. Pop the lightest entry. If `to` is already in the tree, it is stale: skip it.
3. Otherwise keep the edge, add `to` to the tree, and push every edge from `to` to a vertex still outside.
4. Stop when the heap is empty. Vertices that cannot be reached from the start are never added.

Instead of decreasing a key, this "lazy" version leaves old entries in the heap and skips them when they come out, so the heap can hold up to E entries. The matrix version has no heap: it keeps a `key` per vertex (the cheapest edge into the tree so far) and scans for the minimum each round. In that version, `0` means "no edge".

## Step-by-Step Trace

The graph above with A to G numbered 0 to 6, using `prim_mst_adjacency_list`. Heap entries are (weight, from, to):

| Pop | Result | Pushed |
|-----|--------|--------|
| (0, A, A) | A joins | A-B 7, A-D 5 |
| (5, A, D) | D joins, edge A-D | D-B 9, D-E 15, D-F 6 |
| (6, D, F) | F joins, edge D-F | F-E 8, F-G 11 |
| (7, A, B) | B joins, edge A-B | B-C 8, B-E 7 |
| (7, B, E) | E joins, edge B-E | E-C 5, E-G 9 |
| (5, E, C) | C joins, edge E-C | none |
| (8, B, C), (8, F, E), (9, D, B) | stale: skipped | - |
| (9, E, G) | G joins, edge E-G | none |
| (11, F, G), (15, D, E) | stale: skipped | - |

`prim_mst_edge_list(edges, 7, 0)` returns the six edges `(0, 3, 5), (3, 5, 6), (0, 1, 7), (1, 4, 7), (4, 2, 5), (4, 6, 9)`, total 39 (the same total as Kruskal's algorithm).

## Complexity

| Version | Time | Space | Why |
|---------|------|-------|-----|
| Binary heap (lazy) | O(E log V) | O(V + E) | each edge is pushed at most twice; each push and pop is O(log V) |
| Array + matrix | O(V^2) | O(V) | V rounds, each scanning V keys and V matrix entries |
| Fibonacci heap | O(E + V log V) | O(V) | mostly theoretical |

On dense graphs (E about V^2) the array version wins; on sparse graphs the heap version does.

A disconnected graph is not an error: Prim covers only the start vertex's component. For edges `(0,1,1), (2,3,1)` on 4 vertices it returns just `(0, 1, 1)`; Kruskal's algorithm returns both edges.

## When to Use

Use Prim's algorithm on dense graphs (array version), when the graph is already an adjacency list or matrix, or when you only need the tree around one vertex. Negative weights are fine. Use Kruskal's algorithm on sparse edge lists or when you need a spanning forest.

## Prim's vs. Alternatives

| | Prim's | Kruskal's | Dijkstra's |
|--|--------|-----------|------------|
| Produces | minimum spanning tree | minimum spanning tree/forest | shortest-path tree |
| Priority | one edge weight | edge weight, globally sorted | total path length |
| Time | O(E log V) heap, O(V^2) array | O(E log E) | O((V + E) log V) |
| Disconnected graph | start component only | spanning forest | reachable vertices |

## Common Pitfalls

- **Wrong priority.** Using the total distance is Dijkstra's algorithm, which builds a shortest-path tree, not an MST.
- **Stopping at `len(graph)` vertices.** A vertex that appears only in neighbor lists is not a key; the code runs until the heap is empty so it is not missed.
- **No stale check.** Without the visited test, an edge into the tree would be added again and create a cycle.
- **Zero-weight edges in the matrix version.** `0` means "no edge" there.
- **Assuming a connected graph.** The result has fewer than V - 1 edges if the graph is disconnected.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `prim.py` | `prim_mst_adjacency_list`, `prim_mst_edge_list`, `prim_mst_adjacency_matrix` (O(V^2)) |
| C++ | [C++/](C++/) | `prim.cpp` | `primMST` on a `vector` adjacency list; returns edges only |
| Go | [Go/](Go/) | `main.go` | `PrimMST` on a `map[int][]Edge`; returns edges and total |

## Practice Problems

- [Min Cost to Connect All Points](https://leetcode.com/problems/min-cost-to-connect-all-points/) (LeetCode)
- [Connecting Cities With Minimum Cost](https://leetcode.com/problems/connecting-cities-with-minimum-cost/) (LeetCode)
- [Road Reparation](https://cses.fi/problemset/task/1675) (CSES)

## Related

- [Kruskal's Algorithm](../Kruskals_Algorithm/) - the other classic MST algorithm
- [Dijkstra's Algorithm](../../Shortest_Path/Dijkstras_Algorithm/) - the same loop with a different priority
- [Union-Find (DSU)](../../../../Data_Structures/Advanced_Structures/Disjoint_Set_Union/)
- [Activity Selection](../../../Greedy/Activity_Selection/) - another greedy algorithm
