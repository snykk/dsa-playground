# Adjacency Matrix - C++

This folder contains a C++ implementation of **Adjacency Matrix** graph representation.

An **Adjacency Matrix** is a 2D array representation of a graph where `matrix[i][j]` represents an edge from vertex `i` to vertex `j`.

---

## Concept

- **2D Vector**: `V × V` matrix where V is the number of vertices
- **Unweighted**: Values are `0` (no edge) or `1` (edge exists)
- **Weighted**: Values are edge weights or `INT_MAX` (infinity) if no edge
- **Fast Lookups**: O(1) to check if edge exists
- **Space**: O(V²) - always uses V² space

---

## Operations

| Operation | Description | Time Complexity |
| --------- | ----------- | --------------- |
| `add_edge(from, to, weight)` | Add an edge between vertices | O(1) |
| `remove_edge(from, to)` | Remove an edge | O(1) |
| `has_edge(from, to)` | Check if edge exists | O(1) |
| `get_weight(from, to)` | Get edge weight | O(1) |
| `get_neighbors(vertex)` | Get all neighbors of a vertex | O(V) |
| `bfs(start)` | Breadth-First Search traversal | O(V²) |
| `dfs(start)` | Depth-First Search traversal | O(V²) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Initialize | O(V²) | O(V²) |
| Add Edge | O(1) | O(1) |
| Remove Edge | O(1) | O(1) |
| Check Edge | O(1) | O(1) |
| Get Neighbors | O(V) | O(V) |
| BFS/DFS | O(V²) | O(V) |
| Space | O(V²) | O(V²) |

---

## Usage

```cpp
#include "adjacency_matrix.cpp"
#include <iostream>
using namespace std;

int main() {
    // Unweighted undirected graph
    AdjacencyMatrix graph(5, false, false);
    graph.add_edge(0, 1);
    graph.add_edge(1, 2);

    cout << graph.has_edge(0, 1) << endl;  // 1 (true)
    vector<int> neighbors = graph.get_neighbors(1);
    // neighbors: [0, 2]

    // Weighted directed graph
    AdjacencyMatrix weighted(5, true, true);
    weighted.add_edge(0, 1, 5.0);
    weighted.add_edge(1, 2, 3.0);

    double weight = weighted.get_weight(0, 1);  // 5.0
    vector<int> bfs_result = weighted.bfs(0);

    return 0;
}
```

---

## Example: Unweighted Undirected Graph

```cpp
AdjacencyMatrix graph(4, false, false);

// Add edges
graph.add_edge(0, 1);
graph.add_edge(1, 2);
graph.add_edge(2, 3);
graph.add_edge(3, 0);

// Matrix representation:
//     0  1  2  3
//  0 [0  1  0  1]
//  1 [1  0  1  0]
//  2 [0  1  0  1]
//  3 [1  0  1  0]

// Traverse
vector<int> bfs_result = graph.bfs(0);
vector<int> dfs_result = graph.dfs(0);
```

---

## Compile and Run

```bash
# Compile
g++ -o adjacency_matrix_test adjacency_matrix_test.cpp

# Run
./adjacency_matrix_test
```

Or compile and run in one command:

```bash
g++ adjacency_matrix_test.cpp -o adjacency_matrix_test && ./adjacency_matrix_test
```

---

## Notes

- Matrix uses `INT_MAX` from `<climits>` for infinity in weighted graphs
- Diagonal is set to `0` (no self-loops by default)
- For undirected graphs, matrix is symmetric
- Vertices are 0-indexed
- Uses `vector<vector<double>>` for matrix storage

