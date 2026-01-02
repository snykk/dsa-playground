# Graph Coloring

**Graph Coloring** is the problem of assigning colors to vertices of a graph such that no two adjacent vertices share the same color. The goal is to find the minimum number of colors needed (chromatic number) or to color the graph with a given number of colors.

---

## Overview

Graph coloring is a fundamental problem in graph theory with applications in scheduling, register allocation, and map coloring. The problem can be stated as:
- Given a graph G and k colors
- Color each vertex with one of k colors
- Ensure no two adjacent vertices have the same color

The backtracking approach:
1. Try coloring vertices one by one
2. For each vertex, try colors 1 to k
3. Check if color is valid (no adjacent vertex has same color)
4. If valid, recursively color next vertex
5. If no valid color, backtrack and try different color

---

## Key Characteristics

1. **Constraint Satisfaction**: Adjacent vertices must have different colors
2. **Backtracking**: Recursively explores color assignments
3. **NP-Complete**: Finding minimum colors is computationally hard
4. **Greedy Alternative**: Greedy algorithms exist but may use more colors

---

## Operations

| Operation | Description | Time Complexity |
|-----------|-------------|----------------|
| `is_safe(graph, v, color, c)` | Check if color c is valid for vertex v | O(V) |
| `graph_coloring(graph, m)` | Color graph with m colors | O(m^V) worst case |
| `chromatic_number(graph)` | Find minimum colors needed | O(m^V) for each m |
| `is_valid_coloring(graph, color)` | Validate coloring | O(V + E) |

---

## Implementation Approaches

### 1. Basic Backtracking
- **Pros**: Simple, finds valid coloring if exists
- **Cons**: Exponential time complexity
- **Use Case**: Small graphs, learning

### 2. Greedy Coloring
- **Pros**: Fast, O(V + E) time
- **Cons**: May use more colors than optimal
- **Use Case**: When optimality not required

### 3. Optimized Backtracking
- **Pros**: Better pruning, constraint propagation
- **Cons**: More complex implementation
- **Use Case**: Medium graphs, need optimal solution

---

## Applications

1. **Scheduling**: Assigning time slots to avoid conflicts
2. **Register Allocation**: Assigning CPU registers to variables
3. **Map Coloring**: Coloring maps so adjacent regions differ
4. **Frequency Assignment**: Assigning frequencies to avoid interference
5. **Sudoku**: Special case of graph coloring

---

## Example Use Cases

### Coloring with Given Colors
```python
graph = [
    [0, 1, 1, 1],
    [1, 0, 1, 0],
    [1, 1, 0, 1],
    [1, 0, 1, 0]
]
colors = 3
if graph_coloring(graph, colors):
    print("Graph can be colored with", colors, "colors")
```

### Finding Minimum Colors
```python
chromatic_num = chromatic_number(graph)
print("Minimum colors needed:", chromatic_num)
```

---

## Implementations

This folder contains implementations in three languages:

- **Python** (`Python/`) - List-based implementation
- **C++** (`C++/`) - Vector-based implementation
- **Go** (`Go/`) - Slice-based implementation

Each implementation includes:
- Complete source code
- Comprehensive test suite
- Detailed README with usage examples

---

## Complexity Summary

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| **is_safe** | O(V) | O(1) |
| **graph_coloring** | O(m^V) | O(V) |
| **chromatic_number** | O(m^V × m) | O(V) |
| **greedy_coloring** | O(V + E) | O(V) |

Where V is vertices, E is edges, m is number of colors.

---

## When to Use

- **Constraint Satisfaction**: Problems with coloring constraints
- **Scheduling**: Time slot assignment
- **Resource Allocation**: Assigning resources with conflicts
- **Graph Problems**: When need to partition vertices

---

## Related Patterns

- **Backtracking**: Core technique
- **Greedy Algorithms**: Alternative approach
- **Graph Algorithms**: Related graph problems

---

## Further Reading

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena
- "Graph Theory" by Reinhard Diestel
- LeetCode: Is Graph Bipartite problem

---

**Note**: Graph coloring is NP-complete for general graphs. For special graph classes (bipartite, trees, etc.), polynomial-time algorithms exist. The backtracking approach works well for small graphs. For larger graphs, consider greedy algorithms or approximation methods.

---

_Last Updated: December 2025_
