# Tarjan's SCC Algorithm

Tarjan's algorithm finds all strongly connected components (SCCs) of a directed graph in a single DFS. It runs in **O(V + E)** time and **O(V)** extra space, and emits the components in reverse topological order (sinks first).

## Intuition

In a DFS tree, every SCC is a connected piece of the tree with one topmost vertex, its **root**. The algorithm finds the roots by giving each vertex two numbers:

- `disc[v]`: the order in which the DFS discovered `v`.
- `low[v]`: the smallest discovery time `v` can reach through its subtree plus one edge into a vertex that is **still on the stack**.

If `low[v] == disc[v]`, `v` cannot reach anything older, so it is a root: pop the stack down to `v` and that is one component. If `low[v] < disc[v]`, `v` can climb to an older vertex and stays on the stack for that vertex's component.

Edges to vertices that were discovered but are no longer on the stack must be ignored: those vertices belong to finished components and cannot lead back.

## Visual

```text
  0 ---> 1 ---> 2 ---> 3 ---> 4 ---> 5        edges 2->0 and 4->3 go back up
  ^             |       ^      |
  +-------------+       +------+

  vertex   0    1    2    3    4    5
  disc     0    1    2    3    4    5
  low      0    0    0    3    3    5
  root?   yes   no   no  yes   no  yes

  SCCs: {0, 1, 2}   {3, 4}   {5}
```

## How It Works

1. **Discover** a vertex: `disc = low = index++`, push it on the stack, mark it on the stack.
2. **For each edge `v -> w`:**
   - `w` unvisited: descend, then `low[v] = min(low[v], low[w])`.
   - `w` on the stack: `low[v] = min(low[v], disc[w])`.
   - `w` visited but not on the stack: ignore.
3. **Finish** `v`: if `low[v] == disc[v]`, pop the stack down to `v`; the popped vertices are one SCC.
4. Repeat from every unvisited vertex.

## Step-by-Step Trace

Graph `{0:[1], 1:[2], 2:[0,3], 3:[4], 4:[3,5], 5:[]}`:

| Event | disc / low | Stack (bottom to top) | Output |
|-------|-----------|-----------------------|--------|
| visit 0, 1, 2 | 0/0, 1/1, 2/2 | 0 1 2 | |
| edge 2 -> 0 (0 on stack) | low[2] = 0 | 0 1 2 | |
| visit 3, 4 | 3/3, 4/4 | 0 1 2 3 4 | |
| edge 4 -> 3 (3 on stack) | low[4] = 3 | 0 1 2 3 4 | |
| visit 5, low = disc | 5/5 | 0 1 2 3 4 5 | [5] |
| 4 finishes, low 3 != disc 4 | low[4] = 3 | 0 1 2 3 4 | |
| 3 finishes, low = disc, pop to 3 | low[3] = 3 | 0 1 2 | [4, 3] |
| 2 and 1 finish | low = 0 | 0 1 2 | |
| 0 finishes, low = disc, pop to 0 | low[0] = 0 | (empty) | [2, 1, 0] |

`tarjan_scc` returns `[[5], [4, 3], [2, 1, 0]]`: sinks first. Within a component the order is the stack pop order.

## Complexity

| Quantity | Bound | Why |
|----------|-------|-----|
| Time | O(V + E) | each vertex discovered and pushed once, each edge examined once |
| Space | O(V) | `disc`, `low`, the component stack and the DFS work stack |

No transposed graph is built, which is the memory advantage over Kosaraju.

## When to Use

Use it when:

- you need SCCs or the condensation DAG of a directed graph in one pass;
- you need components in reverse topological order (2-SAT assignments, DP over the condensation);
- memory matters more than the simplicity of the proof.

Do not use it when:

- the graph is undirected: use connected components, or bridges and articulation points (see the Tarjan Bridges topic);
- you prefer an algorithm that is easy to explain: Kosaraju's two passes are simpler to reason about.

## Tarjan vs. Kosaraju

| | Tarjan | Kosaraju |
|---|---|---|
| DFS passes | 1 | 2 |
| Extra memory | O(V) | O(V + E) for the reversed graph |
| Components emitted | sinks first | sources first |
| 2-SAT test | `comp[x] < comp[~x]` | `comp[x] > comp[~x]` |

Both give the same partition on every graph.

## Common Pitfalls

1. **Updating `low` from finished vertices.** Only vertices on the stack count for non-tree edges.
2. **Using `disc[w]` after a child returns.** After a tree edge, use `low[w]`.
3. **Recursion depth.** The Python and C++ versions are iterative; a recursive C++ version crashes on a cycle of 100000 vertices, a recursive Python version fails at about 1000 vertices.
4. **Vertex ids.** Maps and sets are used, so ids can be any integer and vertices that only appear as neighbours are included.
5. **Extra Python helpers.** `tarjan_bridges` and `tarjan_articulation_points` work on undirected adjacency lists and use a recursive DFS; for large graphs use the dedicated topic.
6. **Empty graph.** All three languages return no components.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `tarjan.py` | iterative DFS; also `tarjan_scc_count`, `is_strongly_connected`, `tarjan_bridges`, `tarjan_articulation_points` |
| C++ | [C++/](C++/) | `tarjan.cpp` | iterative DFS; `tarjanSCC`, `tarjanSCCCount`, `isStronglyConnected` |
| Go | [Go/](Go/) | `main.go` | recursive closure; `TarjanSCC`, `TarjanSCCCount`, `IsStronglyConnected` |

## Practice Problems

- [CSES 1682. Flight Routes Check](https://cses.fi/problemset/task/1682): is the graph strongly connected?
- [CSES 1683. Planets and Kingdoms](https://cses.fi/problemset/task/1683): label every SCC.
- [CSES 1684. Giant Pizza](https://cses.fi/problemset/task/1684): 2-SAT with SCCs.

## Related

- [Strongly Connected Components](../README.md): category overview
- [Kosaraju's Algorithm](../Kosarajus_Algorithm/README.md): the two-pass alternative
- [2-SAT](../../2_SAT/README.md): relies on the reverse topological order
- [Tarjan Bridges and Articulation Points](../../Tarjan_Bridges_Articulation/README.md): same low-link idea on undirected graphs
- [Topological Sort](../../Topological_Sort/README.md): orders the condensation
