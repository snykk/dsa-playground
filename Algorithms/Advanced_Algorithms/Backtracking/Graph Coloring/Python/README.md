# Graph Coloring - Python

This folder contains a Python implementation of **Graph Coloring** using backtracking.

---

## Concept

Colors a graph with minimum number of colors such that no two adjacent vertices have the same color. Uses backtracking to find a valid coloring.

**Key Features:**
- Backtracking algorithm
- Finds minimum chromatic number
- Validates coloring constraints

---

## Functions

| Function | Description | Time Complexity |
|----------|-------------|----------------|
| `is_safe(graph, v, color, c)` | Check if color c is safe for vertex v | O(V) |
| `graph_coloring(graph, m)` | Color graph with m colors | O(m × k^n) |
| `chromatic_number(graph)` | Find minimum colors needed | O(V × m × k^n) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Graph Coloring | O(m × k^n) | O(n) |
| Chromatic Number | O(V × m × k^n) | O(n) |
| Safety Check | O(V) | O(1) |

---

## Usage

```python
from graph_coloring import graph_coloring, chromatic_number

graph = [
    [0, 1, 1, 1],
    [1, 0, 1, 0],
    [1, 1, 0, 1],
    [1, 0, 1, 0]
]

color = graph_coloring(graph, 3)
if color:
    print(f"Coloring: {color}")

print(f"Chromatic number: {chromatic_number(graph)}")
```

---

## Running Tests

```bash
python graph_coloring_test.py
```

---

_Last Updated: December 2025_

