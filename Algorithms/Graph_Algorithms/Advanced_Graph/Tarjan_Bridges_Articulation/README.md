# Tarjan's Bridges & Articulation Points

> Given an **undirected** graph, find its **critical edges (bridges)** — edges whose removal disconnects the graph — and its **articulation points (cut vertices)** — vertices whose removal disconnects the graph. Tarjan's algorithm finds both in **O(V + E)** via a single DFS.

---

## 🎯 Intuition

Imagine a city's road map:

- A **bridge** (in graph-theory sense) is a road that, if closed, would cut off some neighborhood from the rest.
- An **articulation point** is an intersection that, if blocked, would do the same.

Both concepts matter for **network reliability** analysis: which links are single points of failure? In a computer network, an articulation point is a router whose crash disconnects clients; a bridge is a cable whose cut does the same.

The brilliance of Tarjan: **one DFS pass**, keeping two timestamps per vertex:
- `disc[u]` — the time `u` was first discovered (pre-order timestamp).
- `low[u]` — the smallest `disc` value reachable from `u`'s DFS subtree, including via one non-tree (back) edge.

These two values tell us everything we need about bridges and cut vertices.

---

## 📊 Visual: DFS Timestamps and `low` Values

```
Graph:
    1 --- 2
    |     |
    0     3
    |
    4 --- 5

DFS from 0 (arbitrary root):
    disc[0]=1  low[0]=1
    disc[1]=2  low[1]=1   (can reach 0 via back edge ... but only tree edge here)
    disc[2]=3  low[2]=3
    disc[3]=4  low[3]=3
    disc[4]=5  low[4]=5
    disc[5]=6  low[5]=5

Edges considered:
    (0,1) - tree. low[1]=2 > disc[0]=1 → this is a BRIDGE ✓
    (1,2) - tree. low[2]=3 > disc[1]=2 → BRIDGE ✓
    (2,3) - tree. low[3]=4 > disc[2]=3 → BRIDGE ✓
    (0,4) - tree. low[4]=5 > disc[0]=1 → BRIDGE ✓
    (4,5) - tree. low[5]=6 > disc[4]=5 → BRIDGE ✓

Articulation points:
    0 is root with 2 children (1, 4) → cut vertex ✓
    1 has child 2 with low[2]=3 ≥ disc[1]=2 → cut vertex ✓
    2 has child 3 with low[3]=4 ≥ disc[2]=3 → cut vertex ✓
    4 has child 5 with low[5]=6 ≥ disc[4]=5 → cut vertex ✓

This is a tree, so every internal vertex is a cut vertex and every edge is a bridge.
```

---

## 🧮 Algorithm

```
function dfs(u, parent):
    disc[u] = low[u] = time++
    children = 0
    for v in adj[u]:
        if disc[v] == -1:           # tree edge
            children += 1
            dfs(v, u)
            low[u] = min(low[u], low[v])
            # Bridge condition: no back edge from v's subtree reaches u or earlier
            if low[v] > disc[u]:
                bridges.add((u, v))
            # Articulation condition: v's subtree can't reach above u (except for root)
            if parent != -1 and low[v] >= disc[u]:
                articulation.add(u)
        elif v != parent:            # back edge
            low[u] = min(low[u], disc[v])
    # Root is articulation iff it has ≥ 2 children in DFS tree
    if parent == -1 and children > 1:
        articulation.add(u)
```

Two rules:
- **Bridge**: `low[v] > disc[u]` — `v`'s subtree has NO escape route back to `u` or ancestors, so removing `(u, v)` disconnects.
- **Articulation**: `low[v] ≥ disc[u]` for non-root, or root has `≥ 2` DFS children.

---

## 🚶 Step-by-Step Trace

Graph: `0 - 1 - 2 - 0` (triangle) plus `2 - 3`.

```
Call dfs(0, -1):
    disc[0]=1, low[0]=1
    Neighbors of 0: [1, 2]
    → visit 1 (tree edge):
        disc[1]=2, low[1]=2
        Neighbors: [0, 2]
        → 0 is parent, skip
        → visit 2 (tree edge):
            disc[2]=3, low[2]=3
            Neighbors: [0, 1, 3]
            → 0: disc[0]=1 != -1, 0 != parent=1 → back edge! low[2] = min(3, 1) = 1
            → 1 is parent, skip
            → visit 3 (tree edge):
                disc[3]=4, low[3]=4
                Neighbors: [2] (parent) — done
                low[3] = 4
            Back in 2: low[2] = min(1, low[3]=4) = 1
            Check bridge: low[3]=4 > disc[2]=3 → BRIDGE (2, 3) ✓
            Check articulation: parent=1 != -1 && low[3]=4 ≥ disc[2]=3 → ARTICULATION 2 ✓
        Back in 1: low[1] = min(2, low[2]=1) = 1
        Check bridge: low[2]=1 > disc[1]=2? NO → not a bridge (correct, triangle reroutes)
        Check articulation: low[2]=1 ≥ disc[1]=2? NO → not articulation
    Back in 0: low[0] = min(1, low[1]=1) = 1
    Root check: children=1 → NOT articulation

Result: bridges = [(2,3)], articulations = [2]
```

Exactly what you'd expect: the triangle has no bridges (any edge can be bypassed), but the tail `2—3` is a dead-end bridge, and vertex 2 is the only cut vertex.

---

## ⏱️ Complexity — and Why

| Phase | Time | Space |
|-------|------|-------|
| DFS | O(V + E) | O(V) for recursion + arrays |
| **Total** | **O(V + E)** | **O(V)** |

Single DFS visits each edge twice (once from each endpoint) and each vertex once. `low` and `disc` updates are O(1) each.

---

## 🎯 When to Use

✅ **Use Tarjan's when:**
- Network reliability analysis (find single points of failure)
- Biconnected components (as a building block — bridges delineate BCCs)
- Identifying cycles (non-bridge edges belong to some cycle)
- 2-edge-connectivity / 2-vertex-connectivity checking
- Problems about "minimum edges/vertices to remove to disconnect"

❌ **Don't use for:**
- **Directed** graphs → use SCC (Kosaraju / Tarjan's SCC) for analogous concepts
- Edge/vertex connectivity in the broader sense (κ(G), λ(G)) → max-flow is the tool
- Finding specific cycles → use DFS with parent tracking, or cycle-finding algorithms

---

## ⚔️ Bridges vs. Articulation Points

| Concept | Definition | Detection rule |
|---------|-----------|----------------|
| **Bridge** | Edge (u,v) whose removal disconnects graph | `low[v] > disc[u]` (strictly greater) |
| **Articulation** | Vertex whose removal disconnects graph | `low[v] ≥ disc[u]` (≥), special-cased for root |

**Key difference**: bridges test whether `v`'s subtree can reach strictly **above** `u` — articulation tests whether it can reach `u` or above. The root is an articulation iff it has **≥ 2 DFS children**.

Every bridge endpoint is (usually) an articulation point — but not always, and not conversely. A triangle has no bridges but no articulation points either.

---

## ⚠️ Common Pitfalls

1. **Multi-edge handling.** If the graph has parallel edges (two edges between u and v), the parent-tracking `v != parent` check fails. Track edges by edge-index instead of parent-vertex.
2. **Strict `>` vs `≥` confusion.** Bridge uses `>`; articulation uses `≥`. Swapping them gives silently wrong answers that look plausible on small examples.
3. **Root is special for articulation.** A non-root vertex is an articulation iff it has a child `v` with `low[v] ≥ disc[u]`. The root is an articulation iff it has ≥ 2 DFS children — a different rule.
4. **Recursion depth on long paths.** DFS on a linear chain of 100,000 vertices will blow Python's recursion limit. Use an iterative DFS or raise `sys.setrecursionlimit`.
5. **Back edges to parent** should not update `low`. That's why we check `v != parent`. Forgetting this gives `low` values that are too small, causing missed bridges.

---

## 🔧 Implementations

| Language | Folder | Notes |
|----------|--------|-------|
| Python | [Python/](Python/) | Recursive DFS; `sys.setrecursionlimit` bump for safety |
| C++ | [C++/](C++/) | Recursive DFS with `std::vector` adjacency lists |
| Go | [Go/](Go/) | Iterative DFS to avoid stack overflow on large graphs |

---

## 📝 Practice Problems

- [LeetCode 1192. Critical Connections in a Network](https://leetcode.com/problems/critical-connections-in-a-network/) — the canonical bridges problem
- [Codeforces 118E. Bertown Roads](https://codeforces.com/problemset/problem/118/E) — orienting a bridge-free graph
- [UVa 315. Network](https://onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&category=11&page=show_problem&problem=251) — canonical articulation points
- [HackerRank — Articulation Point](https://www.hackerrank.com/challenges/ctci-connected-cells-in-a-grid/problem)

---

## 🔗 Related

- [DFS](../../Traversal/DFS/README.md) — the traversal Tarjan's builds on
- [Strongly Connected Components](../Strongly_Connected_Components/README.md) — directed-graph analog
- [Union-Find](../Union-Find_DSU/README.md) — alternative approach (incremental edge-addition)

---

_Part of [Advanced Graph Algorithms](../README.md)._
