# Kruskal's Algorithm

Kruskal's algorithm builds a minimum spanning tree (MST) by sorting all edges by weight and adding each edge unless it closes a cycle. A union-find structure answers the cycle question in almost constant time, so the cost is dominated by the sort: O(E log E).

## Intuition

A spanning tree connects all V vertices with V - 1 edges and no cycle; a minimum one has the smallest total weight. The greedy rule: look at edges from lightest to heaviest and keep an edge whenever it joins two vertices that are not yet connected.

Why it is safe (the cut property): a lightest edge crossing any cut belongs to some MST. When Kruskal reaches an edge that joins two different trees, every lighter edge was already kept or skipped, so this edge is a lightest one leaving one of those trees.

## Visual

```text
Edges: A-B 7, A-D 5, B-C 8, B-D 9, B-E 7, C-E 5, D-E 15, D-F 6, E-F 8, E-G 9, F-G 11

Scan in weight order; the forest is the set of trees built so far:

  A-D 5   keep    {A D}  {B}  {C}  {E}  {F}  {G}
  C-E 5   keep    {A D}  {B}  {C E}  {F}  {G}
  D-F 6   keep    {A D F}  {B}  {C E}  {G}
  A-B 7   keep    {A B D F}  {C E}  {G}
  B-E 7   keep    {A B C D E F}  {G}
  B-C 8   skip    B and C are already in one tree: a cycle
  E-F 8   skip    cycle
  B-D 9   skip    cycle
  E-G 9   keep    {A B C D E F G}: 6 edges = V - 1, stop
```

## How It Works

1. Sort the edges by weight, lightest first.
2. Give every vertex its own union-find set.
3. For each edge `(u, v, w)`: if `union(u, v)` succeeds (different sets), keep the edge; otherwise skip it (it would close a cycle).
4. Stop as soon as V - 1 edges are kept. If the edges run out first, the graph is disconnected and the result is a spanning forest.

The union-find uses path compression and union by rank, so each operation costs O(alpha(V)) amortized, where alpha (the inverse Ackermann function) is below 5 for any practical input.

## Step-by-Step Trace

The graph above with A to G numbered 0 to 6:

| Edge | Weight | Decision |
|------|--------|----------|
| A-D | 5 | keep |
| C-E | 5 | keep |
| D-F | 6 | keep |
| A-B | 7 | keep |
| B-E | 7 | keep (merges {A,B,D,F} with {C,E}) |
| B-C | 8 | skip: already connected through E |
| E-F | 8 | skip: already connected |
| B-D | 9 | skip: already connected |
| E-G | 9 | keep: 6 edges, the scan stops |

`kruskal_mst` returns `[(0, 3, 5), (2, 4, 5), (3, 5, 6), (0, 1, 7), (1, 4, 7), (4, 6, 9)]` and total weight 39.

## Complexity

| Quantity | Cost | Why |
|----------|------|-----|
| Time | O(E log E) | sorting dominates; the E union-find operations cost O(E alpha(V)) |
| Space | O(V) | union-find arrays, plus the sorted edge list |

Since E is at most V^2, log E is at most 2 log V, so O(E log E) equals O(E log V).

Disconnected input is not an error: the result is a minimum spanning forest. For edges `(0,1,5), (2,3,3)` on 4 vertices, the result is 2 edges with total 8. Prim's algorithm on the same input covers only the start component.

## When to Use

Use Kruskal on sparse graphs, when the graph is already an edge list, or when you want a spanning forest of a possibly disconnected graph. Negative weights are fine: only the order of the weights matters. For dense graphs, or when edges are generated lazily from an adjacency structure, Prim's algorithm with an array or heap is often a better fit.

## Kruskal's vs. Prim's

| | Kruskal's | Prim's |
|--|-----------|--------|
| Idea | merge trees by the lightest safe edge | grow one tree from a start vertex |
| Main structure | sort + union-find | priority queue |
| Time | O(E log E) | O(E log V) heap, O(V^2) array |
| Better on | sparse graphs | dense graphs |
| Disconnected graph | spanning forest | start component only |

## Common Pitfalls

- **No cycle check.** The lightest edges can form a cycle; union-find prevents it.
- **Assuming a connected graph.** Check `len(mst) == V - 1`, or use `is_connected` from `kruskal_mst_with_details`.
- **In-place sort.** The C++ and Go versions sort the edge list you pass in.
- **Ties.** With equal weights, several MSTs exist. Python's stable sort uses input order; C++ and Go do not specify it. The total weight is always the same.
- **Vertex numbering.** Vertices must be 0 to V - 1; the union-find arrays have size V.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `kruskal.py` | `kruskal_mst`, `kruskal_mst_with_details` (adds `is_connected`); sorts a copy |
| C++ | [C++/](C++/) | `kruskal.cpp` | `kruskalMST`; returns edges only; sorts the input vector in place |
| Go | [Go/](Go/) | `main.go` | `KruskalMST`; returns edges and total; sorts the input slice in place |

## Practice Problems

- [Min Cost to Connect All Points](https://leetcode.com/problems/min-cost-to-connect-all-points/) (LeetCode)
- [Connecting Cities With Minimum Cost](https://leetcode.com/problems/connecting-cities-with-minimum-cost/) (LeetCode)
- [Find Critical and Pseudo-Critical Edges in Minimum Spanning Tree](https://leetcode.com/problems/find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree/) (LeetCode)
- [Road Reparation](https://cses.fi/problemset/task/1675) (CSES)

## Related

- [Prim's Algorithm](../Prims_Algorithm/) - the other classic MST algorithm
- [Union-Find (DSU)](../../../../Data_Structures/Advanced_Structures/Disjoint_Set_Union/) - the cycle test
- [Disjoint Set Union](../../../../Data_Structures/Advanced_Structures/Disjoint_Set_Union/)
- [Activity Selection](../../../Greedy/Activity_Selection/) - another greedy algorithm
