# Dinic's Algorithm -- Python Implementation

Maximum flow with level graphs and blocking flows, plus the flow on every edge and the minimum cut. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `dinic.py` | `dinic`, `dinic_flow`, the `DinicResult` tuple, the helpers `_build_residual`, `_neighbours`, `_bfs_levels`, `_find_path`, `_push` and `_run`, and a demo |
| `dinic_test.py` | 26 unit tests: the classic network (value, flows, cut, phases, every search), edge cases, a 5000-vertex chain, 660 random networks against an Edmonds-Karp reference, the cut and the flow conservation, growing levels and blocking flows, the visits per phase, the comb, unit networks from bipartite matching |

## API

- `dinic(graph, source, sink) -> int`: the maximum flow value. `graph` maps `u` to a dict `{v: capacity}`, as for `edmonds_karp`. Returns 0 when `source == sink` or the sink is unreachable.
- `dinic_flow(graph, source, sink) -> DinicResult`: a named tuple `(max_flow, flows, source_side, phases, edge_visits)`. `flows[u][v]` is the flow on the edge `u -> v`, for every edge of `graph`; `source_side` is the increasing list of vertices the last BFS reached, one side of a minimum cut; `phases` counts the BFS runs, the last one included; `edge_visits` counts the residual entries the depth-first searches looked at. When `source == sink` it returns `(0, all flows 0, [source], 0, 0)`.

Neither function raises: like `edmonds_karp`, they return a flow of 0 for the cases above.

## Python-Specific Notes

- **Dict of dicts.** The residual graph is a dict of dicts, as in Edmonds-Karp, and `adj[u] = sorted(residual[u])` fixes the order every search tries; `current[u]` is an index into that list. The input is never modified.
- **No recursion.** `_find_path` keeps the search path in a list and runs the same steps as the recursive DFS, so the 5000-vertex chain in the tests works; a recursive version fails at about 1000.
- **Helpers at module level.** The tests wrap `_bfs_levels`, `_find_path` and `_push` to watch every phase, and `_neighbours` to count the reads of `adj`; the site's fixture generator reads the same functions.
- **Unbounded integers.** No overflow; float capacities also work, with the usual caveats about floating point.

## How to Run

```bash
python3 -m unittest dinic_test
python3 dinic.py      # demo: maximum flow 23, source side [0, 1, 2, 4], 3 phases, 40 edge visits
```

## Key Takeaways

1. One BFS per phase, then as many shortest augmenting paths as the level graph holds.
2. The current-arc pointer is one integer per vertex, and it is what keeps a phase at O(V E).
3. The last BFS is the minimum cut: `source_side` costs nothing extra.
