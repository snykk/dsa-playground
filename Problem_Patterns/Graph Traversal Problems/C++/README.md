# Graph Traversal in C++

Implementation of BFS, DFS, Flood Fill, and Topological Sort in C++.

## Usage

```cpp
#include "graph_traversal.cpp"

// BFS
Graph graph = {{0, {1}}, {1, {2}}};
int dist = GraphTraversal::bfsShortestPath(graph, 0, 2);

// Islands
std::vector<std::vector<char>> grid = {{'1', '0'}};
int count = GraphTraversal::numIslands(grid);
```

## Compilation and Testing

Compile the test file:

```bash
g++ graph_traversal_test.cpp -o test
./test
```
