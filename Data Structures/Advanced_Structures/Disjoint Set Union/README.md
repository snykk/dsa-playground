# Disjoint Set Union (DSU)

A disjoint set union, also called union-find, keeps items split into non-overlapping sets. It answers "are x and y in the same set?" and merges two sets, each in O(alpha(n)) amortized time, which is effectively constant.

This topic is the data structure itself. For graph algorithms built on it (cycle detection, Kruskal's MST) see [`Algorithms/Graph_Algorithms/Advanced_Graph/Union-Find_DSU`](../../../Algorithms/Graph_Algorithms/Advanced_Graph/Union-Find_DSU/), and for problem-solving patterns see [`Problem_Patterns/Union-Find Applications`](../../../Problem_Patterns/Union-Find%20Applications/).

## Intuition

Every set is a tree, and the root is the set's name. To ask which set an item is in, walk up to the root. To merge two sets, make one root the child of the other. Two optimizations keep the trees almost flat:

- **Union by rank:** hang the shorter tree under the taller one, so trees stay at most log2(n) high.
- **Path compression:** while walking up, re-point every visited node at the root, so the next walk is one step.

Invariant: `parent` is always a forest, and an item's set is identified by the root reached from it.

## Visual

```text
parent = [0, 0, 0, 2, 4, 4]      sets {0,1,2,3} and {4,5}

      0           4
     / \          |
    1   2         5
        |
        3
```

## Operations

| Operation | What it does | Time (amortized) |
|-----------|--------------|------------------|
| `DSU(n)` | n singleton sets `{0}...{n-1}` | O(n) |
| `find(x)` | root of the set of x, compressing the path | O(alpha(n)) |
| `union(x, y)` | merge by rank; returns whether a merge happened | O(alpha(n)) |
| `connected(x, y)` | `find(x) == find(y)` | O(alpha(n)) |
| `get_size(x)` | size of the set of x | O(alpha(n)) |
| `get_component_count()` | number of sets (a counter) | O(1) |
| `get_components()` | root to members map | O(n alpha(n)) |

Union by rank: let `rx = find(x)`, `ry = find(y)`. If equal, return false. If `rank[rx] < rank[ry]` attach `rx` under `ry`; if greater, the other way; on a tie attach `ry` under `rx` and increase `rank[rx]`. Then decrement the component count.

Out-of-range items (negative or `>= n`) and negative `n` are rejected: Python raises `IndexError` / `ValueError`, C++ throws `std::out_of_range` / `std::invalid_argument`, and Go panics.

## Step-by-Step Trace

Eight items. `parent` after each call (the rank of the new root is in the last column):

| Call | parent | Root rank |
|------|--------|-----------|
| `union(0,1)` | `[0,0,2,3,4,5,6,7]` | 0:1 |
| `union(2,3)` | `[0,0,2,2,4,5,6,7]` | 2:1 |
| `union(0,2)` | `[0,0,0,2,4,5,6,7]` | 0:2 |
| `union(4,5)`, `union(6,7)` | `[0,0,0,2,4,4,6,6]` | 4:1, 6:1 |
| `union(4,6)` | `[0,0,0,2,4,4,4,6]` | 4:2 |
| `union(0,4)` | `[0,0,0,2,0,4,4,6]` | 0:3 |
| `find(7)` | `[0,0,0,2,0,4,0,0]` | path 7, 6, 4, 0 compressed |

## Complexity

| Variant | find / union |
|---------|--------------|
| Naive linking | O(n) |
| Union by rank only | O(log n) |
| Both optimizations (this code) | O(alpha(n)) amortized |

A root of rank r has at least 2^r nodes (rank grows only when equal-rank trees merge), so rank is at most log2(n). alpha is the inverse Ackermann function, at most 4 for any practical n. Space is three arrays of n integers (`parent`, `rank`, `size`). The code keeps `size` as well as `rank` because `get_size` needs it; union by size gives the same height bound.

## When to Use

- Connectivity that only grows: groups merge, never split.
- Online queries mixed with unions.
- Not suited to deleting edges or splitting a set, or to questions about paths (use BFS/DFS or a link-cut tree).

## DSU vs. Alternatives

| Approach | Same-set query | Add an edge | Notes |
|----------|----------------|-------------|-------|
| DSU | O(alpha(n)) | O(alpha(n)) | online, merges only |
| BFS/DFS labelling | O(1) after O(n + m) | recompute | static graph, gives paths |
| Search per query | O(n + m) | O(1) | only for very few queries |
| Link-cut tree | O(log n) | O(log n) | supports cuts, complex |

## Common Pitfalls

- Linking `x` to `y` instead of `find(x)` to `find(y)`.
- Reading `parent[x]` as the set id instead of calling `find(x)`.
- Negative or out-of-range items (rejected here; plain arrays would alias or crash).
- Expecting delete or split; neither exists.
- Treating `rank` as the exact height: after compression it is only an upper bound.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [`Python/`](Python/) | `dsu.py` | recursive `find`; `get_parent` for tests |
| C++ | [`C++/`](C++/) | `dsu.cpp` | method is `unite`; `explicit` constructor; throws on bad input |
| Go | [`Go/`](Go/) | `main.go` | `NewDSU`, `Union`; panics on bad input |

## Practice Problems

- [LeetCode 547 - Number of Provinces](https://leetcode.com/problems/number-of-provinces/)
- [LeetCode 684 - Redundant Connection](https://leetcode.com/problems/redundant-connection/)
- [LeetCode 721 - Accounts Merge](https://leetcode.com/problems/accounts-merge/)
- [LeetCode 1971 - Find if Path Exists in Graph](https://leetcode.com/problems/find-if-path-exists-in-graph/)
- [CSES - Road Construction](https://cses.fi/problemset/task/1676)

## Related

- [Union-Find DSU (graph algorithm view)](../../../Algorithms/Graph_Algorithms/Advanced_Graph/Union-Find_DSU/)
- [Union-Find Applications (patterns)](../../../Problem_Patterns/Union-Find%20Applications/)
- [Kruskal's algorithm](../../../Algorithms/Graph_Algorithms/Minimum_Spanning_Tree/Kruskals_Algorithm/)
- [Advanced Structures overview](../README.md)
