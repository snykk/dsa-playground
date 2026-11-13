# Ford-Fulkerson Method -- Python Implementation

Maximum flow with DFS augmenting paths, plus the augmenting paths and the minimum cut. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `ford_fulkerson.py` | `ford_fulkerson`, `ford_fulkerson_with_path`, `min_cut` and three private helpers (`_build_residual`, `_find_path`, `_augment`) |
| `ford_fulkerson_test.py` | 11 unit tests: classic network, small network (flow 11), unreachable sink, key-less sink, anti-parallel edges, a 5000-vertex chain, min-cut sides, path accounting |

## API

- `ford_fulkerson(graph, source, sink) -> int`: maximum flow value.
- `ford_fulkerson_with_path(graph, source, sink) -> (int, list)`: the value and the augmenting paths as `(path, bottleneck)` pairs.
- `min_cut(graph, source, sink) -> (int, set, set)`: the cut value, the source side and the sink side.

`graph` maps `u` to `{v: capacity}`. When `source == sink` the value is 0 (and `min_cut` returns `(0, {source}, set())`).

## Python-Specific Notes

- **Iterative DFS.** `_find_path` keeps a stack of `(vertex, neighbour iterator)` and a parent dict, so deep graphs do not raise `RecursionError` and a round costs O(V + E).
- **One implementation.** All three public functions share `_run`, so they cannot drift apart.
- **Unbounded integers.** There is no overflow; float capacities work but may add rounds.
- **Neighbour order matters for the paths,** not for the flow value: the augmenting paths follow dictionary insertion order.

## How to Run

```bash
python3 -m unittest ford_fulkerson_test
python3 ford_fulkerson.py      # demo: max flow 23 and the minimum cut
```

## Key Takeaways

1. Reverse edges are what make augmenting paths correct.
2. The same DFS yields the maximum flow, the paths and the cut.
3. Keep the search iterative in Python.
