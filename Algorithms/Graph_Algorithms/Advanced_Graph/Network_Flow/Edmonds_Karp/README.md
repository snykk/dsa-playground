# Edmonds-Karp Algorithm

Edmonds-Karp finds the maximum flow from a source to a sink in a flow network. It is Ford-Fulkerson with one rule: always augment along a **shortest** path (fewest edges), found with BFS. That rule gives a polynomial bound of **O(V E^2)** that does not depend on the capacity values.

## Intuition

Think of pipes with capacities. Push water along any source-to-sink route until one pipe on it is full, then look for another route through the pipes that still have room. Two ideas make this correct:

- **Residual graph.** For an edge `u -> v` with capacity `c` and flow `f`, keep a forward edge with `c - f` left and a backward edge `v -> u` with `f`. Using the backward edge cancels earlier flow, so a bad early choice can always be repaired.
- **Max-flow min-cut.** When no path with spare capacity is left, the vertices still reachable from the source form a cut whose edges are all full. The flow equals the cut's capacity, and no flow can beat any cut, so the flow is maximum.

Using BFS is what bounds the number of rounds: shortest-path distances in the residual graph never decrease, and each round makes at least one edge critical (the bottleneck).

## Visual

Network with source 0 and sink 5 (capacities on the edges):

```text
            16         12         20
      +----->(1)------->(3)------->(5)
      |       | ^        ^          ^
 (0)--+      10 | 4      | 7        | 4
      |       v |        |          |
      +----->(2)------->(4)---------+
        13         14

   plus the edge 3 -> 2 with capacity 9
```

Edges: 0->1 16, 0->2 13, 1->2 10, 1->3 12, 2->1 4, 2->4 14, 3->2 9, 3->5 20, 4->3 7, 4->5 4. The maximum flow is 23 and the minimum cut separates {0, 1, 2, 4} from {3, 5}.

## How It Works

1. **Build the residual graph.** Copy the capacities and add a reverse edge of capacity 0 for every edge.
2. **BFS from the source** over edges with positive residual capacity, recording each vertex's parent.
3. **Stop** if the sink was not reached; the total so far is the maximum flow.
4. **Push the bottleneck.** Find the smallest residual capacity on the path, subtract it from the forward edges and add it to the reverse edges.
5. **Add the bottleneck to the total** and go back to step 2.

## Step-by-Step Trace

The network above, run with `python3 edmonds_karp.py`:

| Round | Shortest augmenting path | Bottleneck | Total flow |
|-------|--------------------------|-----------|-----------|
| 1 | 0 -> 1 -> 3 -> 5 | 12 | 12 |
| 2 | 0 -> 2 -> 4 -> 5 | 4 | 16 |
| 3 | 0 -> 2 -> 4 -> 3 -> 5 | 7 | 23 |
| 4 | BFS cannot reach 5 | - | 23 |

After round 3, BFS reaches {0, 1, 2, 4}. The edges leaving this set are 1->3 (12), 4->3 (7) and 4->5 (4): 12 + 7 + 4 = 23, equal to the flow.

The path order depends on neighbour order. Python follows dictionary insertion order; C++ and Go iterate hash maps, so they may pick other shortest paths. The total is always 23.

## Complexity

| Quantity | Bound | Why |
|----------|-------|-----|
| Augmentations | O(V E) | Distances never decrease; each edge is critical at most V/2 times |
| One round | O(E) | A BFS and a path update |
| Total time | O(V E^2) | Rounds times work per round |
| Space | O(V + E) | Residual graph and BFS parent map |

The bound counts rounds, not the flow value, so it holds for any capacities.

## When to Use

Use it when:

- you need the maximum flow or minimum cut on a small or medium graph and want simple code;
- capacities are huge, so a DFS-based Ford-Fulkerson could be too slow;
- the problem reduces to flow: bipartite matching, edge-disjoint paths, project selection.

Do not use it when:

- the graph is large and speed matters: Dinic's algorithm or push-relabel are much faster in practice (neither is implemented here);
- you need the flow on each edge or the cut itself: the functions here return only the flow value.

## Edmonds-Karp vs. Alternatives

| Algorithm | Augmenting path | Time | Notes |
|-----------|-----------------|------|-------|
| Edmonds-Karp | shortest, BFS | O(V E^2) | independent of capacity values |
| Ford-Fulkerson | any (DFS here) | O(E f), integer capacities | f is the max-flow value |
| Dinic | blocking flow on BFS levels | O(V^2 E) | faster in practice; not in this repository |
| Push-relabel | none | O(V^3) for the FIFO variant | not in this repository |

On the "diamond" `0->1 1000, 0->2 1000, 1->3 1000, 2->3 1000, 1->2 1`, Edmonds-Karp needs 2 augmentations. A DFS that keeps choosing the cross edge 1->2 may need up to 2000.

## Common Pitfalls

1. **No reverse edges.** Without the 0-capacity backward edges, flow cannot be undone and the answer can be too small.
2. **32-bit overflow.** In C++ the residual graph and the total are `long long`; an `int` total overflows when two `INT_MAX` paths are added.
3. **DFS instead of BFS.** That is Ford-Fulkerson and loses the polynomial bound.
4. **Expecting more than the value.** Only the maximum flow value is returned.
5. **`source == sink`** returns 0, and an unreachable sink also returns 0.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `edmonds_karp.py` | Unbounded integers; dict of dicts |
| C++ | [C++/](C++/) | `edmonds_karp.cpp` | `int` capacities, `long long` residual and total |
| Go | [Go/](Go/) | `main.go` | 64-bit `int`; map of maps |

## Practice Problems

- [CSES 1694. Download Speed](https://cses.fi/problemset/task/1694): maximum flow.
- [CSES 1695. Police Chase](https://cses.fi/problemset/task/1695): minimum cut, print the edges.
- [CSES 1696. School Dance](https://cses.fi/problemset/task/1696): bipartite matching as flow.

## Related

- [Ford-Fulkerson](../Ford_Fulkerson/README.md): the same method with any augmenting path
- [Network Flow](../README.md): the category overview
- [BFS](../../../Traversal/BFS/README.md): finds the augmenting path
