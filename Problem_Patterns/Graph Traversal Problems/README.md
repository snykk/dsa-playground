# Graph Traversal Problems Pattern

A **Graph Traversal** pattern involves systematically visiting all vertices and edges of a graph. The two fundamental traversal algorithms are Depth-First Search (DFS) and Breadth-First Search (BFS), each with different characteristics and use cases.

---

## Overview

Graph traversal is fundamental to solving graph problems. The choice between DFS and BFS depends on the problem requirements:

- **DFS (Depth-First Search)**: Explores as far as possible along each branch before backtracking
  - Uses recursion or stack
  - Good for: Path finding, cycle detection, topological sort
  - Space: O(V) for recursion stack

- **BFS (Breadth-First Search)**: Explores all neighbors at current depth before moving to next level
  - Uses queue
  - Good for: Shortest path (unweighted), level-order traversal
  - Space: O(V) for queue

Both algorithms have time complexity O(V + E) for adjacency list representation.

---

## Key Characteristics

1. **Complete Traversal**: Visits all reachable vertices
2. **Systematic**: Follows consistent exploration order
3. **Flexible**: Can be adapted for various graph problems
4. **Foundation**: Basis for many advanced graph algorithms

---

## Operations

| Operation | Description | Time Complexity | Space Complexity |
|-----------|-------------|----------------|------------------|
| `dfs(graph, start)` | Depth-first traversal from start | O(V + E) | O(V) |
| `bfs(graph, start)` | Breadth-first traversal from start | O(V + E) | O(V) |
| `has_path(graph, start, end)` | Check if path exists | O(V + E) | O(V) |
| `count_components(graph, n)` | Count connected components | O(V + E) | O(V) |

Where V is number of vertices and E is number of edges.

---

## Implementation Approaches

### 1. Recursive DFS
- **Pros**: Simple, intuitive, clean code
- **Cons**: Stack overflow risk for deep graphs
- **Use Case**: Most graph problems, when depth is reasonable

### 2. Iterative DFS
- **Pros**: No stack overflow, explicit control
- **Cons**: More code, need to manage stack
- **Use Case**: Very deep graphs, when need explicit control

### 3. BFS with Queue
- **Pros**: Finds shortest path (unweighted), level-order
- **Cons**: More memory for queue
- **Use Case**: Shortest path, level-order problems

---

## Applications

1. **Path Finding**: Check if path exists between nodes
2. **Connected Components**: Count or find connected components
3. **Cycle Detection**: Detect cycles in graphs
4. **Shortest Path**: BFS for unweighted graphs
5. **Topological Sort**: Ordering of nodes in DAG
6. **Tree Traversal**: Special case of graph traversal

---

## Example Use Cases

### DFS Traversal
```python
graph = {0: [1, 2], 1: [0, 3], 2: [0], 3: [1]}
result = dfs(graph, 0)  # Returns [0, 1, 3, 2]
```

### BFS Traversal
```python
graph = {0: [1, 2], 1: [0, 3], 2: [0], 3: [1]}
result = bfs(graph, 0)  # Returns [0, 1, 2, 3]
```

### Path Checking
```python
has_path = has_path(graph, 0, 3)  # Returns True
```

### Component Counting
```python
graph = {0: [1], 2: [3]}
components = count_components(graph, 4)  # Returns 2
```

---

## Implementations

This folder contains implementations in three languages:

- **Python** (`Python/`) - Dictionary and set-based implementation
- **C++** (`C++/`) - Unordered_map and unordered_set-based implementation
- **Go** (`Go/`) - Map-based implementation

Each implementation includes:
- Complete source code
- Comprehensive test suite
- Detailed README with usage examples

---

## Complexity Summary

| Algorithm | Time Complexity | Space Complexity | Best For |
|-----------|----------------|------------------|----------|
| **DFS** | O(V + E) | O(V) | Path finding, cycles |
| **BFS** | O(V + E) | O(V) | Shortest path, levels |
| **Path Check** | O(V + E) | O(V) | Connectivity |
| **Components** | O(V + E) | O(V) | Component analysis |

---

## When to Use

- **DFS**: Path finding, cycle detection, topological sort, backtracking
- **BFS**: Shortest path (unweighted), level-order, minimum steps
- **Path Check**: Connectivity problems, reachability
- **Components**: Network analysis, clustering

---

## Related Patterns

- **Union-Find**: Alternative for connectivity
- **Shortest Path**: Dijkstra, Bellman-Ford for weighted graphs
- **Topological Sort**: Special DFS application

---

## Further Reading

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena
- "Competitive Programming" by Halim & Halim
- LeetCode graph problems

---

**Note**: DFS and BFS are fundamental graph algorithms. Master these before moving to advanced graph algorithms. The choice between DFS and BFS often depends on whether you need shortest path (BFS) or any path (DFS).

---

_Last Updated: December 2025_
