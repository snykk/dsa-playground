# Ford-Fulkerson Method

Ford-Fulkerson computes the maximum flow of a network by repeatedly finding any source-to-sink path that still has spare capacity and pushing flow along it. This repository finds the path with DFS. With integer capacities it runs in **O(E f)**, where `f` is the maximum flow value.

## Intuition

Send flow down any available route until one edge on it is full, then look for another route. Two ideas make this correct:

- **Residual graph.** For an edge `u -> v` with capacity `c` and flow `f`, keep a forward edge with `c - f` left and a backward edge `v -> u` with `f`. Pushing flow along a backward edge cancels flow sent earlier, so a poor early choice can always be undone.
- **Max-flow min-cut.** When no augmenting path exists, let `S` be the vertices reachable from the source. All edges leaving `S` are full and all edges entering it are empty, so the flow equals the capacity of the cut `(S, rest)`. No flow can exceed any cut, so the flow is maximum and the cut is minimum.

Termination needs integer capacities: each round then adds at least 1 to the flow. With irrational capacities a bad path order may never terminate.

## Visual

Diamond network, every edge 1000 except the cross edge 1 -> 2 (capacity 1):

```text
          1000          1000
     +-----> (1) ---------> (3)
     |         |              ^
  (0)-+       1|              |
     |         v              | 1000
     +-----> (2) -------------+
        1000      1000
```

The flow value is 2000. The cross edge only matters for the order of paths, not for the answer.

## How It Works

1. **Build the residual graph.** Copy the capacities and add a 0-capacity reverse edge for every edge.
2. **Find an augmenting path** with DFS over edges whose residual capacity is positive. If none exists, stop.
3. **Push the bottleneck**, the smallest residual capacity on the path: subtract it from the forward edges, add it to the reverse edges.
4. **Add it to the total** and repeat.

## Step-by-Step Trace

The diamond above, run with `ford_fulkerson_with_path` (edges inserted in the order `0:{1,2}`, `1:{2,3}`, `2:{3}`):

| Round | Augmenting path | Bottleneck | Total |
|-------|-----------------|-----------|-------|
| 1 | 0 -> 1 -> 2 -> 3 | 1 | 1 |
| 2 | 0 -> 1 -> 3 | 999 | 1000 |
| 3 | 0 -> 2 -> 3 | 999 | 1999 |
| 4 | 0 -> 2 -> 1 -> 3 (backward edge 2 -> 1) | 1 | 2000 |
| 5 | none | - | 2000 |

Round 4 uses the backward edge to cancel the unit that round 1 sent over the cross edge. On the 5-vertex network `0:{1:16,2:13}, 1:{2:10,3:12}, 2:{1:4,4:14}, 3:{2:9,5:20}, 4:{3:7,5:4}` the same code needs 6 augmentations and returns 23; Edmonds-Karp needs 3.

## Complexity

| Quantity | Bound | Why |
|----------|-------|-----|
| Rounds | at most f | each round adds at least 1 (integer capacities) |
| One round | O(V + E) | one DFS plus the path update |
| Total time | O(E f) | pseudo-polynomial: depends on the capacity values |
| Space | O(V + E) | residual graph, parent map |

The worst case is exponential in the number of bits of the capacities. On the diamond with capacity `N`, an unlucky order alternates between `0-1-2-3` and `0-2-1-3` and needs `2N` rounds, each adding 1.

## When to Use

Use it when:

- capacities are small integers, so `f` is small;
- you want the simplest max-flow code, or the minimum cut as a by-product (Python `min_cut`);
- the problem reduces to flow with unit capacities (bipartite matching, edge-disjoint paths).

Do not use it when:

- capacities are large or real-valued: use Edmonds-Karp, or Dinic if speed matters;
- you need guaranteed termination on arbitrary real capacities.

## Ford-Fulkerson vs. Edmonds-Karp

| | Ford-Fulkerson (DFS) | Edmonds-Karp (BFS) |
|---|---|---|
| Path choice | first path DFS finds | fewest edges |
| Time | O(E f) | O(V E^2) |
| Worst case | exponential in capacity bits | polynomial |
| Termination | integer capacities | always |

## Common Pitfalls

1. **Missing backward edges.** Without them the method is greedy and can stop below the maximum.
2. **Fixed-size visited array.** An old C++ version used `vector<bool>(1000)`, which breaks for ids of 1000 or more and for negative ids; use a set or map.
3. **Recursive DFS.** In Python a chain of about 1000 vertices raised `RecursionError`; the code is now iterative.
4. **C++ overflow.** Use `long long` for residual capacities and the total.
5. **Real capacities.** Rounding leaves tiny residuals and may add many rounds; scale to integers when possible.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `ford_fulkerson.py` | `ford_fulkerson`, `ford_fulkerson_with_path`, `min_cut`; iterative DFS |
| C++ | [C++/](C++/) | `ford_fulkerson.cpp` | value only; `int` capacities, `long long` residual and total; iterative DFS |
| Go | [Go/](Go/) | `main.go` | value only; recursive DFS helper |

## Practice Problems

- [School Dance (CSES 1696)](https://cses.fi/problemset/task/1696)
- [Police Chase (CSES 1695)](https://cses.fi/problemset/task/1695)
- [Distinct Routes (CSES 1711)](https://cses.fi/problemset/task/1711)
- [Download Speed (CSES 1694)](https://cses.fi/problemset/task/1694)

## Related

- [Edmonds-Karp](../Edmonds_Karp/README.md): the same method with BFS paths
- [Network Flow](../README.md): the category overview
- [DFS](../../../Traversal/DFS/README.md): finds the augmenting path
