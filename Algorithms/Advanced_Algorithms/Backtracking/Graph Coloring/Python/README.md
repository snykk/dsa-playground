# Graph Coloring -- Python Implementation

## Files

- `graph_coloring.py`: the solver (recursive helper `graph_coloring_util` plus the public functions).
- `graph_coloring_test.py`: tests (valid coloring, too few colors, chromatic number, `is_safe`, empty graph, edgeless graph, even and odd cycles, complete graph; the returned colorings are checked for validity).

## API

- `is_safe(graph, v, color, c)`: true if color `c` can be given to vertex `v` (no neighbor has it).
- `graph_coloring(graph, m)`: tries to color the graph with colors `1..m`; returns the color list, or `None` if impossible
- `chromatic_number(graph)`: smallest m for which a coloring exists (0 for an empty graph).

```python
from graph_coloring import graph_coloring, chromatic_number

graph = [[0, 1, 1, 1], [1, 0, 1, 0], [1, 1, 0, 1], [1, 0, 1, 0]]
print(graph_coloring(graph, 3))   # [1, 2, 3, 2]
print(graph_coloring(graph, 2))   # None
print(chromatic_number(graph))    # 3
```

## Python-Specific Notes

- `graph` is a list of lists of 0 and 1 and must be symmetric.
- The recursion depth is the number of vertices, so graphs with about 1,000 vertices hit Python's recursion limit (the search would be far too slow by then anyway).
- Python 3.9 and later.

## How to Run

```bash
python3 -m unittest graph_coloring_test
```

## Key Takeaways

- Choose a color, check the neighbors, recurse, and undo on failure.
- The worst case is O(V * m^V); use it for small graphs only.
- The chromatic number comes from trying m = 1, 2, 3, ... until one succeeds.
