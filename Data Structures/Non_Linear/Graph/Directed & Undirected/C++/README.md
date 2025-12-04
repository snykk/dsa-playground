# Directed & Undirected Graph - C++

This folder contains a C++ implementation of **Graph** that supports both directed and undirected graphs.

A **Graph** is a collection of vertices (nodes) connected by edges. Graphs can be classified based on the direction of their edges.

---

## Concept

- **Directed Graph**: Edges have direction (A → B)
- **Undirected Graph**: Edges are bidirectional (A ↔ B)
- **Adjacency List**: Uses `unordered_map<int, vector<int>>` for storage
- **Dynamic**: Can add vertices dynamically

---

## Operations

| Operation | Description | Time Complexity |
| --------- | ----------- | --------------- |
| `add_vertex(vertex)` | Add a vertex to the graph | O(1) |
| `add_edge(from, to)` | Add an edge between vertices | O(1) |
| `remove_edge(from, to)` | Remove an edge | O(V) |
| `has_edge(from, to)` | Check if edge exists | O(V) |
| `get_neighbors(vertex)` | Get all neighbors of a vertex | O(1) |
| `get_edges()` | Get all edges in the graph | O(E) |
| `get_degree(vertex)` | Get degree of a vertex | O(V) |
| `bfs(start)` | Breadth-First Search traversal | O(V + E) |
| `dfs(start)` | Depth-First Search traversal | O(V + E) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Add Vertex | O(1) | O(1) |
| Add Edge | O(1) | O(1) |
| Remove Edge | O(V) | O(1) |
| Check Edge | O(V) | O(1) |
| Get Neighbors | O(1) | O(degree) |
| BFS/DFS | O(V + E) | O(V) |
| Space | O(V + E) | O(V + E) |

---

## Usage

```cpp
#include "graph.cpp"
#include <iostream>
using namespace std;

int main() {
    // Undirected graph
    Graph undirected(false);
    undirected.add_edge(1, 2);
    undirected.add_edge(2, 3);

    cout << undirected.has_edge(1, 2) << endl;  // 1 (true)
    cout << undirected.has_edge(2, 1) << endl;  // 1 (true, bidirectional)

    // Directed graph
    Graph directed(true);
    directed.add_edge(1, 2);
    directed.add_edge(2, 3);

    cout << directed.has_edge(1, 2) << endl;  // 1 (true)
    cout << directed.has_edge(2, 1) << endl;  // 0 (false, not bidirectional)

    vector<int> bfs_result = undirected.bfs(1);

    return 0;
}
```

---

## Compile and Run

```bash
# Compile
g++ -o graph_test graph_test.cpp

# Run
./graph_test
```

---

## Notes

- Uses `unordered_map<int, vector<int>>` for adjacency list
- For undirected graphs, edges are stored in both directions
- Supports dynamic vertex addition
- Requires `<unordered_map>`, `<vector>`, `<queue>`, `<stack>` headers
- BFS uses `queue`, DFS uses `stack` from STL

