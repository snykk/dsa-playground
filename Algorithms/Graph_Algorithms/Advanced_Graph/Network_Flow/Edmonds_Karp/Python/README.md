# Edmonds-Karp Algorithm -- Python Implementation

Maximum flow with BFS augmenting paths. For the idea, the trace and the complexity proof, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `edmonds_karp.py` | `edmonds_karp(graph, source, sink)` |
| `edmonds_karp_test.py` | 8 unit tests: the classic network, same source and sink, unreachable sink, key-less sink, anti-parallel edges, zero capacity, the 1000/1 diamond, input not modified |

## API

- `edmonds_karp(graph, source, sink) -> int`: the maximum flow value. `graph` maps `u` to a dict `{v: capacity}`. Returns 0 when `source == sink` or the sink is unreachable.

## Python-Specific Notes

- **Dict of dicts.** Vertices are any hashable integers; the sink may have no entry of its own. The function builds its own residual copy, so the input is not modified.
- **No overflow.** Python integers are unbounded; float capacities also work, but the usual caveats about floating point apply.
- **BFS with a parent dict.** The path is rebuilt by walking `parent` back from the sink, and the bottleneck is the minimum residual capacity on it.
- **Returns the value only,** not per-edge flows and not the cut.

## How to Run

```bash
python3 -m unittest edmonds_karp_test
python3 edmonds_karp.py      # demo: prints "Maximum flow: 23"
```

## Key Takeaways

1. The residual graph with reverse edges is what lets the algorithm undo earlier choices.
2. BFS gives shortest augmenting paths and therefore the O(V E^2) bound.
3. The returned number is a value only; extra work is needed to extract the cut.
