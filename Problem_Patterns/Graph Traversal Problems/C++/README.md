# Graph Traversal Problems -- C++ Implementation

BFS shortest path, flood fill and Kahn's topological sort. See the [topic README](../README.md) for the ideas. There is no standalone DFS traversal in C++; flood fill uses recursive DFS.

## Files

| File | Contents |
|------|----------|
| `graph_traversal.cpp` | `GraphTraversal` class with static methods, and a demo `main` |
| `graph_traversal_test.cpp` | Assert-based tests (includes the `.cpp`) |

## API

- `using Graph = std::map<int, std::vector<int>>`
- `static int bfsShortestPath(const Graph& graph, int start, int target)`: -1 if `start` is missing or the target is unreachable.
- `static int numIslands(std::vector<std::vector<char>>& grid)`: modifies `grid`.
- `static std::vector<int> topologicalSort(int n, const std::vector<std::vector<int>>& edges)`: empty vector on a cycle. Edge endpoints must be in `[0, n)`; this is not checked.

## C++-Specific Notes

- `numIslands` recurses through a generic lambda, so one huge island can overflow the call stack.
- Structured bindings in `bfsShortestPath` need C++17.
- The demo `main` is compiled out when `IS_TEST_BUILD` is defined.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD graph_traversal_test.cpp -o graph_test && ./graph_test
```

## Key Takeaways

- `std::queue` for BFS, mark nodes on push.
- Copy the grid if you need it after `numIslands`.
- Validate edge endpoints yourself before calling `topologicalSort`.
