# Kosaraju's Algorithm -- Python Implementation

SCCs with two iterative DFS passes. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `kosaraju.py` | `kosaraju_scc`, `kosaraju_scc_count`, `is_strongly_connected`, `kosaraju_condensation_graph` |
| `kosaraju_test.py` | 10 unit tests: basic, strongly connected, DAG, empty graph, count, condensation, neighbour-only vertices, a 5000-vertex path and cycle |

## API

- `kosaraju_scc(graph) -> List[List[int]]`: the components, source components first. `graph` maps a vertex to its list of neighbours.
- `kosaraju_scc_count(graph) -> int`: number of components.
- `is_strongly_connected(graph) -> bool`: exactly one component (false for an empty graph).
- `kosaraju_condensation_graph(graph) -> Dict[int, List[int]]`: component index to the indices of the components it points to.

## Python-Specific Notes

- **Iterative DFS.** Both passes keep an explicit stack of neighbour iterators, so a deep graph does not hit Python's recursion limit.
- **Neighbour-only vertices.** `reversed_graph.setdefault(neighbor, [])` creates the entry on first use; the first pass reads neighbours with `graph.get`.
- **Condensation only in Python.** C++ and Go do not provide it.
- **Space** is O(V + E): the reversed graph is a second adjacency list.

## How to Run

```bash
python3 -m unittest kosaraju_test
python3 kosaraju.py      # demo on two 3-cycles
```

## Key Takeaways

1. Latest finisher first, on the reversed graph.
2. Components come out in topological order of the condensation.
3. Keep the DFS iterative in Python.
