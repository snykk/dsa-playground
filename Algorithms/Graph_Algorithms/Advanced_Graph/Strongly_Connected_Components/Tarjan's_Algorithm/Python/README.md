# Tarjan's SCC Algorithm -- Python Implementation

SCCs in one iterative DFS pass. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `tarjan.py` | `tarjan_scc`, `tarjan_scc_count`, `is_strongly_connected`, `tarjan_bridges`, `tarjan_articulation_points` |
| `tarjan_test.py` | 11 unit tests: SCC basics, count, strong connectivity, order of components, a 5000-vertex path and cycle, bridges (including parallel edges), articulation points |

## API

- `tarjan_scc(graph) -> List[List[int]]`: components in reverse topological order (sinks first). `graph` maps a vertex to its neighbour list.
- `tarjan_scc_count(graph) -> int`: number of components.
- `is_strongly_connected(graph) -> bool`: exactly one component (false for an empty graph).
- `tarjan_bridges(graph) -> List[tuple]`: bridges of an undirected adjacency list.
- `tarjan_articulation_points(graph) -> Set[int]`: cut vertices of an undirected adjacency list.

## Python-Specific Notes

- **Iterative SCC search.** `work` holds `(vertex, neighbour iterator)` pairs and plays the call stack, so `tarjan_scc` has no recursion limit.
- **Bridges and articulation points are recursive.** They fail with `RecursionError` on graphs about 1000 vertices deep. For large graphs use the iterative implementation in `Tarjan_Bridges_Articulation`.
- **Parallel edges.** `tarjan_bridges` skips the arriving edge only once, so a doubled edge is not a bridge.
- **Vertex ids.** Dicts mean any hashable int works, and vertices that only appear as neighbours are found through `graph.get`.

## How to Run

```bash
python3 -m unittest tarjan_test
python3 tarjan.py      # demo
```

## Key Takeaways

1. `low` only follows edges to vertices on the stack.
2. Components come out sinks first.
3. Keep deep searches iterative in Python.
