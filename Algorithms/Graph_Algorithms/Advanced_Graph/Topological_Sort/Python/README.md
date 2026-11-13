# Topological Sort -- Python Implementation

Kahn's algorithm, an iterative DFS version, all orders by backtracking, a DAG check and longest path in a DAG. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `topological_sort.py` | `topological_sort_kahn`, `topological_sort_dfs`, `topological_sort_all_orders`, `is_dag`, `longest_path_dag` |
| `topological_sort_test.py` | 20 unit tests: basic, multiple paths, cycles, empty graph, long chain, neighbour-only vertices, all orders, validity, longest path |

## API

- `topological_sort_kahn(graph) -> Optional[List[int]]`: an order, or `None` on a cycle. An empty graph returns `[]`.
- `topological_sort_dfs(graph) -> Optional[List[int]]`: the reversed DFS finish order, or `None` on a cycle.
- `topological_sort_all_orders(graph) -> List[List[int]]`: every valid order (`[[]]` for an empty graph, `[]` for a cycle).
- `is_dag(graph) -> bool`.
- `longest_path_dag(graph, weights, source=None) -> Dict[int, int]`: longest distance to each vertex; missing edges weigh 1; `-inf` when unreachable from `source`; `{}` on a cycle; `ValueError` if `source` is not a vertex.

`graph` maps a vertex to its neighbour list; vertices that appear only as neighbours are included in every result. Example: the orders of `{1:[2,4], 2:[3]}` are `[1, 2, 3, 4]`, `[1, 2, 4, 3]` and `[1, 4, 2, 3]` (three, not two).

## Python-Specific Notes

- **Iterative DFS.** `topological_sort_dfs` keeps a stack of neighbour iterators, so a chain of thousands of vertices does not hit the recursion limit. `topological_sort_all_orders` still recurses once per vertex, which is fine for the small graphs it is meant for.
- **`None` for a cycle** is distinct from `[]` for an empty graph, unlike in C++ and Go.
- **Order of ties** follows dictionary insertion order, so results are deterministic.

## How to Run

```bash
python3 -m unittest topological_sort_test
python3 topological_sort.py      # demo
```

## Key Takeaways

1. Build the vertex set from keys and neighbours.
2. Kahn's algorithm detects cycles with a simple count.
3. Test validity (every edge points forward), not one fixed order.
