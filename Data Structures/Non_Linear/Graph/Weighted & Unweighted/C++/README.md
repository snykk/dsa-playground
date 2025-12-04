# Weighted & Unweighted Graph - C++

This folder contains a C++ implementation of **Weighted Graph** that supports both weighted and unweighted edges.

A **Weighted Graph** is a graph where edges have associated weights (costs, distances, or values). An **Unweighted Graph** treats all edges as having equal weight (typically 1).

---

## Concept

- **Edge Weights**: Each edge can have a weight value
- **Unweighted Default**: Default weight is 1.0 for unweighted edges
- **Adjacency List**: Uses `unordered_map<int, vector<pair<int, double>>>` for storage
- **Flexible**: Can mix weighted and unweighted operations

---

## Operations

| Operation | Description | Time Complexity |
| --------- | ----------- | --------------- |
| `add_vertex(vertex)` | Add a vertex to the graph | O(1) |
| `add_edge(from, to, weight)` | Add a weighted edge | O(1) |
| `remove_edge(from, to)` | Remove an edge | O(V) |
| `has_edge(from, to)` | Check if edge exists | O(V) |
| `get_weight(from, to)` | Get edge weight | O(V) |
| `get_neighbors(vertex)` | Get all neighbors | O(1) |
| `get_total_weight()` | Get sum of all edge weights | O(E) |
| `bfs(start)` | Breadth-First Search | O(V + E) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Add Edge | O(1) | O(1) |
| Get Weight | O(V) | O(1) |
| Get Neighbors | O(1) | O(degree) |
| BFS | O(V + E) | O(V) |
| Total Weight | O(E) | O(1) |

---

## Usage

```cpp
#include "weighted_graph.cpp"
#include <iostream>
using namespace std;

int main() {
    WeightedGraph graph(false);
    graph.add_edge(1, 2, 5.0);
    graph.add_edge(2, 3, 3.0);

    double weight = graph.get_weight(1, 2);  // 5.0
    double total = graph.get_total_weight();  // 8.0

    vector<int> bfs_result = graph.bfs(1);

    return 0;
}
```

---

## Compile and Run

```bash
# Compile
g++ -o weighted_graph_test weighted_graph_test.cpp

# Run
./weighted_graph_test
```

---

## Notes

- Uses `unordered_map<int, vector<pair<int, double>>>` for adjacency list
- Default weight is 1.0 if not specified
- Supports both integer and floating-point weights
- For undirected graphs, both directions have same weight
- Requires `<unordered_map>`, `<vector>`, `<queue>` headers

