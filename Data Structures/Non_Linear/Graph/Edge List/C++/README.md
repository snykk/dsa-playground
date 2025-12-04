# Edge List - C++

This folder contains a C++ implementation of **Edge List** graph representation.

An **Edge List** is a simple way to represent a graph by storing all edges in a list. Each edge is represented as a tuple containing the source vertex, destination vertex, and optionally a weight.

---

## Concept

- **Vector of Tuples**: All edges stored in a vector
- **Unweighted**: Uses `vector<pair<int, int>>` for edges
- **Weighted**: Uses `vector<tuple<int, int, double>>` for edges
- **Space Efficient**: O(E) space - only stores edges
- **Simple Structure**: Easy to understand

---

## Operations

| Operation | Description | Time Complexity |
| --------- | ----------- | --------------- |
| `add_edge(from, to, weight)` | Add an edge to the graph | O(1) |
| `remove_edge(from, to)` | Remove an edge | O(E) |
| `has_edge(from, to)` | Check if edge exists | O(E) |
| `get_weight(from, to)` | Get edge weight | O(E) |
| `get_neighbors(vertex)` | Get all neighbors of a vertex | O(E) |
| `get_edge_count()` | Get number of edges | O(1) |
| `bfs(start)` | Breadth-First Search traversal | O(V + E) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Add Edge | O(1) | O(1) |
| Remove Edge | O(E) | O(1) |
| Check Edge | O(E) | O(1) |
| Get Neighbors | O(E) | O(V) |
| BFS | O(V + E) | O(V) |
| Space | O(E) | O(E) |

---

## Usage

```cpp
#include "edge_list.cpp"
#include <iostream>
using namespace std;

int main() {
    // Unweighted undirected graph
    EdgeList graph(false, false);
    graph.add_edge(1, 2);
    graph.add_edge(2, 3);

    cout << graph.has_edge(1, 2) << endl;  // 1 (true)
    cout << graph.get_edge_count() << endl;  // 2

    // Weighted directed graph
    EdgeList weighted(true, true);
    weighted.add_edge(1, 2, 5.0);
    weighted.add_edge(2, 3, 3.0);

    double weight = weighted.get_weight(1, 2);  // 5.0

    return 0;
}
```

---

## Compile and Run

```bash
# Compile
g++ -o edge_list_test edge_list_test.cpp

# Run
./edge_list_test
```

---

## Notes

- Uses separate vectors for weighted and unweighted edges
- For undirected graphs, edges appear twice in the list
- `get_edge_count()` returns unique edge count
- Requires `<vector>`, `<tuple>`, `<algorithm>` headers
- BFS uses `queue` from STL

