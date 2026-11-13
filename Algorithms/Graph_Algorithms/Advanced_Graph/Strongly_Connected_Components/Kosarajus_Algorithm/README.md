# Kosaraju's Algorithm

Kosaraju's algorithm finds the strongly connected components (SCCs) of a directed graph with two depth-first searches: one on the graph, one on its reverse. It runs in **O(V + E)** time and needs O(V + E) memory for the reversed graph.

## Intuition

An SCC is a maximal set of vertices where each can reach every other. If you contract every SCC into one node, the result (the condensation) is a DAG, so the components have a "source end" and a "sink end".

A DFS finishes the vertices of a sink component before it can finish anything that points into it. Formally, if there is an edge from component `C` to component `C'`, the latest finish time in `C` is later than the latest finish time in `C'`. So the vertex that finishes last overall lies in a **source** component. In the reversed graph that component has no outgoing edges, so a DFS from it collects exactly that component and nothing else. Remove it, take the next-latest unvisited finisher, and repeat.

## Visual

```text
  G:   0 ---> 1 ---> 2 ---> 3 ---> 4 ---> 5
       ^             |       ^      |
       +-------------+       +------+       (edges 2->0 and 4->3 close the cycles)

  SCCs:  {0, 1, 2}  ->  {3, 4}  ->  {5}      (condensation, a chain)

  Pass 1 finish order:        5, 4, 3, 2, 1, 0
  Pass 2 start order (latest first): 0, 1, 2, 3, 4, 5  on the reversed graph
```

## How It Works

1. **DFS on G.** Visit every vertex; append a vertex to the finish order when all its neighbours are done.
2. **Reverse every edge** to get the transpose `G^T`. A vertex that appears only as a neighbour gets an entry too.
3. **DFS on G^T** in decreasing finish time. Each time an unvisited vertex starts a DFS, everything it reaches is one SCC.
4. **Skip** vertices that already belong to a component.

## Step-by-Step Trace

Graph `{0:[1], 1:[2], 2:[0,3], 3:[4], 4:[3,5], 5:[]}`. Pass 1 finishes the vertices in the order 5, 4, 3, 2, 1, 0.

| Pass 2 start | Visited before? | Reaches in G^T | Component |
|--------------|-----------------|----------------|-----------|
| 0 | no | 0, 2, 1 | {0, 2, 1} |
| 1 | yes | - | skipped |
| 2 | yes | - | skipped |
| 3 | no | 3, 4 | {3, 4} |
| 4 | yes | - | skipped |
| 5 | no | 5 | {5} |

`kosaraju_scc` returns `[[0, 2, 1], [3, 4], [5]]`. Components come out in topological order of the condensation (sources first). The order inside a component carries no meaning.

If pass 2 used increasing finish order it would start at 5 and, on G^T, reach 5, 4, 3, 2, 1, 0 in one go: the components would merge.

## Complexity

| Step | Time | Space |
|------|------|-------|
| DFS on G | O(V + E) | O(V) |
| Build G^T | O(V + E) | O(V + E) |
| DFS on G^T | O(V + E) | O(V) |
| **Total** | **O(V + E)** | **O(V + E)** |

Each vertex and edge is touched a constant number of times. The reversed graph is as large as the input, so the memory is O(V + E), not O(V).

## When to Use

Use it when:

- you need the SCCs or the condensation DAG of a directed graph;
- you want to test whether a graph is strongly connected;
- you want components in topological order without extra work (for DP on the condensation, or 2-SAT).

Do not use it when:

- memory is tight and a single pass is enough: Tarjan's algorithm needs no transposed graph;
- the graph is undirected: use plain connected components, or bridges/articulation points for 2-connectivity.

## Kosaraju vs. Tarjan

| | Kosaraju | Tarjan |
|---|---|---|
| DFS passes | 2 | 1 |
| Extra memory | transposed graph, O(V + E) | stack and low-link arrays, O(V) |
| Components emitted | sources first | sinks first |
| Idea | finish order, then reverse edges | low-link values |
| 2-SAT test | `comp[x] > comp[~x]` | `comp[x] < comp[~x]` |

Both give the same partition on every graph.

## Common Pitfalls

1. **Wrong order in pass 2.** Use decreasing finish time.
2. **Not reversing the graph.** A second DFS on the original graph only finds reachable sets.
3. **Neighbour-only vertices.** Without an entry in the transpose a vertex that is never a key of the map is lost or raises an error; the repository handles it in all three languages.
4. **Recursive DFS on deep graphs.** Python and C++ use explicit stacks for this reason; Go recursion is safe because goroutine stacks grow.
5. **Quoting O(V) space.** The transpose costs O(V + E).
6. **Empty graph.** All three languages return no components, so `is_strongly_connected` of an empty graph is false.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `kosaraju.py` | iterative DFS; also `kosaraju_scc_count`, `is_strongly_connected`, `kosaraju_condensation_graph` |
| C++ | [C++/](C++/) | `kosaraju.cpp` | iterative DFS; `kosarajuSCC`, `kosarajuSCCCount`, `isStronglyConnected` |
| Go | [Go/](Go/) | `main.go` | recursive closures; `KosarajuSCC`, `KosarajuSCCCount`, `IsStronglyConnected` |

## Practice Problems

- [CSES 1682. Flight Routes Check](https://cses.fi/problemset/task/1682): is the graph strongly connected?
- [CSES 1683. Planets and Kingdoms](https://cses.fi/problemset/task/1683): label every SCC.
- [CSES 1684. Giant Pizza](https://cses.fi/problemset/task/1684): 2-SAT, solved with SCCs.

## Related

- [Strongly Connected Components](../README.md): category overview
- [Tarjan's Algorithm](../Tarjans_Algorithm/README.md): the single-pass alternative
- [2-SAT](../../2_SAT/README.md): uses SCCs on an implication graph
- [Topological Sort](../../Topological_Sort/README.md): orders the condensation
- [DFS](../../../Traversal/DFS/README.md): the building block of both passes
