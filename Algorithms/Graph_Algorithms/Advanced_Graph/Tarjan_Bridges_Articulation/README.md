# Tarjan's Bridges and Articulation Points

Given an **undirected** graph, find its **bridges** (edges whose removal disconnects the graph) and its **articulation points** (vertices whose removal disconnects it). Tarjan's algorithm finds both in one DFS in **O(V + E)** time.

## Intuition

Think of a road map. A bridge is a road that, if closed, cuts a neighbourhood off. An articulation point is an intersection that, if blocked, does the same. Both are single points of failure in a network.

A DFS on an undirected graph produces tree edges and back edges (a back edge goes to an ancestor). Two numbers per vertex are enough:

- `disc[u]`: when the DFS discovered `u`.
- `low[u]`: the smallest `disc` reachable from `u`'s subtree using tree edges and at most one back edge.

If `u`'s child `v` has `low[v] > disc[u]`, the subtree of `v` cannot get back to `u` or above, so the edge `(u, v)` is the only link: a bridge. If `low[v] >= disc[u]`, the subtree can reach `u` but not past it, so removing `u` cuts it off: `u` is an articulation point (the root is one only if it has two or more DFS children).

## Visual

Two triangles joined by the edge 2-3. Badges are `disc/low`:

```text
   0 (0/0)                 4 (4/3)
   |  \                    |  \
   |   2 (2/0) ---- 3 (3/3)   |
   |  /                    |  /
   1 (1/0)                 5 (5/3)

   edges: 0-1 1-2 2-0 | 2-3 | 3-4 4-5 5-3
   bridge: 2-3        articulation points: 2 and 3
```

The back edges 2-0 and 5-3 pull `low` down to 0 and 3. The edge 2-3 has `low[3] = 3 > disc[2] = 2`, so it is a bridge.

## How It Works

1. `dfs(u, parentEdge)`: set `disc[u] = low[u] = timer++`.
2. For each edge `(v, id)` of `u`, skip `id == parentEdge` (skip by edge id, not by parent vertex).
3. If `v` is new: it is a tree edge. Recurse, then `low[u] = min(low[u], low[v])`. Then:
   - if `low[v] > disc[u]`, edge `(u, v)` is a bridge;
   - if `low[v] >= disc[u]` and `u` is not the root, `u` is an articulation point.
4. If `v` is already discovered: back edge, `low[u] = min(low[u], disc[v])`.
5. After the loop: the root is an articulation point if it has more than one DFS child.

## Step-by-Step Trace

Graph `0-1, 1-2, 2-0, 2-3, 3-4, 4-5, 5-3` on 6 vertices. The DFS discovers 0, 1, 2, 3, 4, 5 in that order:

| Child returns | low[child] | disc[parent] | Bridge (>) | Cut vertex (>=) |
|---------------|-----------|--------------|-----------|-----------------|
| 5 to 4 | 3 | 4 | no | no |
| 4 to 3 | 3 | 3 | no | yes: 3 |
| 3 to 2 | 3 | 2 | yes: 2-3 | yes: 2 |
| 2 to 1 | 0 | 1 | no | no |
| 1 to 0 | 0 | 0 | no | root with one child |

Result from `find_bridges_and_articulations`: bridges `[(2, 3)]`, articulation points `[2, 3]`.

## Complexity

| Phase | Time | Space |
|-------|------|-------|
| DFS | O(V + E) | O(V + E) |
| **Total** | **O(V + E)** | **O(V + E)** |

Each edge is scanned from both endpoints and each vertex is discovered once; every `low` update is O(1). Space covers the adjacency lists with edge ids, `disc`, `low` and the DFS stack.

## When to Use

Use it when:

- you need single points of failure in a network (cables and routers);
- you want 2-edge-connected components (remove the bridges) or the block structure of a graph;
- you need to know which edges lie on a cycle (exactly the non-bridges).

Do not use it when:

- the graph is directed: use strongly connected components;
- you need the exact connectivity numbers of a graph: that is a max-flow problem.

## Bridges vs. Articulation Points

| | Bridge | Articulation point |
|---|---|---|
| What | an edge | a vertex |
| Test on tree edge (u, v) | `low[v] > disc[u]` | `low[v] >= disc[u]`, u not the root |
| Root | no special case | cut vertex if 2 or more DFS children |
| Parallel edges | a doubled edge is never a bridge | unaffected |

A bridge endpoint that has other edges is an articulation point; a leaf at the end of a bridge is not. A vertex can be an articulation point without touching a bridge (two cycles sharing one vertex).

## Common Pitfalls

1. **Parallel edges.** Skipping the parent vertex hides the second copy of the edge. Skip the edge id you arrived by.
2. **`>` versus `>=`.** Strict for bridges, non-strict for articulation points.
3. **The root rule.** A non-root vertex needs a child with `low[v] >= disc[u]`; the root needs two DFS children.
4. **Recursion depth.** Raising `sys.setrecursionlimit` for a long path ends in an interpreter crash. Python and C++ here use an explicit stack; Go uses a recursive closure, which is safe because goroutine stacks grow.
5. **Vertex labels.** Vertices must be numbered `0..n-1`. A larger label raises `KeyError` in Python, is undefined behaviour in C++ and panics in Go.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `tarjan_bridges.py` | iterative DFS; returns sorted `(bridges, articulation_points)` |
| C++ | [C++/](C++/) | `tarjan_bridges.h` | header-only class; iterative DFS; `TarjanResult` struct |
| Go | [Go/](Go/) | `main.go` | recursive closure DFS; `Result` struct |

## Practice Problems

- [LeetCode 1192. Critical Connections in a Network](https://leetcode.com/problems/critical-connections-in-a-network/): the canonical bridges problem.
- [Codeforces 118E. Bertown Roads](https://codeforces.com/problemset/problem/118/E): orient the edges of a bridge-free graph.
- [UVa 315. Network](https://onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&category=11&page=show_problem&problem=251): the canonical articulation points problem.

## Related

- [DFS](../../Traversal/DFS/README.md): the traversal Tarjan builds on
- [Strongly Connected Components](../Strongly_Connected_Components/README.md): the directed analogue
- [Tarjan's SCC Algorithm](../Strongly_Connected_Components/Tarjans_Algorithm/README.md): the same low-link idea with a stack
- [Union-Find](../Union_Find_DSU/README.md): an alternative when edges arrive incrementally
