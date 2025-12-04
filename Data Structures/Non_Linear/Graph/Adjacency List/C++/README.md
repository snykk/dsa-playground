# Adjacency List - C++

This folder contains a C++ implementation of **Adjacency List** graph representation.

An **Adjacency List** is a collection of lists where each list represents the neighbors of a vertex. This is the most common and efficient representation for graphs.

---

## Concept

- **Unordered Map of Vectors**: Each vertex maps to a vector of neighbors
- **Unweighted**: Vector contains vertex IDs
- **Weighted**: Vector contains `pair<int, double>` (neighbor, weight)
- **Dynamic**: Can add vertices dynamically
- **Space Efficient**: O(V + E) - only stores existing edges

---

## Operations

| Operation | Description | Time Complexity |
| --------- | ----------- | --------------- |
| `add_vertex(vertex)` | Add a vertex to the graph | O(1) |
| `add_edge(from, to, weight)` | Add an edge between vertices | O(1) |
| `remove_edge(from, to)` | Remove an edge | O(V) |
| `has_edge(from, to)` | Check if edge exists | O(V) |
| `get_neighbors(vertex)` | Get all neighbors of a vertex | O(1) |
| `bfs(start)` | Breadth-First Search traversal | O(V + E) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Initialize | O(V) | O(V) |
| Add Edge | O(1) | O(1) |
| Remove Edge | O(V) | O(1) |
| Check Edge | O(V) | O(1) |
| Get Neighbors | O(1) | O(degree) |
| BFS | O(V + E) | O(V) |
| Space | O(V + E) | O(V + E) |

---

## Usage

```cpp
#include "adjacency_list.cpp"
#include <iostream>
using namespace std;

int main() {
    // Unweighted undirected graph
    AdjacencyList graph(false, false);
    graph.add_edge(1, 2);
    graph.add_edge(2, 3);

    cout << graph.has_edge(1, 2) << endl;  // 1 (true)
    vector<int> neighbors = graph.get_neighbors(2);
    // neighbors: [1, 3]

    // Weighted directed graph
    AdjacencyList weighted(true, true);
    weighted.add_edge(1, 2, 5.0);
    weighted.add_edge(2, 3, 3.0);

    vector<int> bfs_result = weighted.bfs(1);

    return 0;
}
```

---

## Example: Unweighted Undirected Graph

```cpp
AdjacencyList graph(false, false);

// Add edges
graph.add_edge(0, 1);
graph.add_edge(1, 2);
graph.add_edge(2, 3);
graph.add_edge(3, 0);

// Adjacency List representation:
// 0: [1, 3]
// 1: [0, 2]
// 2: [1, 3]
// 3: [0, 2]

// Traverse
vector<int> bfs_result = graph.bfs(0);
```

---

## Compile and Run

```bash
# Compile
g++ -o adjacency_list_test adjacency_list_test.cpp

# Run
./adjacency_list_test
```

Or compile and run in one command:

```bash
g++ adjacency_list_test.cpp -o adjacency_list_test && ./adjacency_list_test
```

---

## Notes

- Uses `unordered_map<int, vector<int>>` for unweighted graphs
- Uses `unordered_map<int, vector<pair<int, double>>>` for weighted graphs
- Supports dynamic vertex addition
- Requires `<unordered_map>`, `<vector>`, `<queue>` headers
- BFS uses `queue` from STL

