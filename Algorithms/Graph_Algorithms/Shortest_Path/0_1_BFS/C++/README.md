# 0-1 BFS -- C++ Implementation

Single-source shortest paths with weights 0 and 1, using `std::deque`, plus the grid example of breaking walls. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `zero_one_bfs.cpp` | `zeroOneBfs`, `pathTo`, `zeroOneBfsWithPath`, `gridEdges`, `minWallBreaks` and a demo `main` (compiled out when `IS_TEST_BUILD` is defined) |
| `zero_one_bfs_test.cpp` | 12 assert-based test functions: the worked example and its counts, edge cases, invalid input, a chain of 200000 vertices, the grid, 2000 random graphs against Dijkstra, the push and pop counts, and 40 graphs pinned to the Python outputs; it `#include`s `zero_one_bfs.cpp` |

## API

- `struct Edge { int u, v, weight; }`: a directed edge of weight 0 or 1.
- `struct ShortestPaths { std::vector<int> dist, parent; }`: `dist[v]` is the shortest distance from the start or -1 when `v` is unreachable; `parent[v]` is the vertex before `v` on that path, or -1 for the start and unreachable vertices.
- `ShortestPaths zeroOneBfs(const std::vector<Edge>& edges, int numVertices, int start)`.
- `std::vector<int> pathTo(const std::vector<int>& parent, int start, int target)`: `{start}` when they are equal, `{}` when `target` is unreachable.
- `std::pair<int, std::vector<int>> zeroOneBfsWithPath(edges, numVertices, start, target)`: the distance and one shortest path, `{-1, {}}` when there is none.
- `std::vector<Edge> gridEdges(const std::vector<std::string>& grid)`: the edges of a grid of `.` (road) and `#` (wall); entering a wall costs 1, a road 0.
- `int minWallBreaks(const std::vector<std::string>& grid, std::pair<int, int> start, std::pair<int, int> goal)`: the fewest walls to break, cells as `{row, col}`.

All of them throw `std::invalid_argument` on bad input: a negative vertex count, an endpoint out of range, a weight other than 0 or 1, a start or target that is not a vertex, or a grid that is empty, ragged or has another character.

```cpp
std::vector<Edge> edges = {{0, 1, 1}, {0, 2, 0}, {2, 1, 0}, {1, 3, 1}, {2, 4, 1},
                           {4, 3, 0}, {4, 5, 1}, {3, 5, 1}, {6, 0, 1}};
ShortestPaths r = zeroOneBfs(edges, 7, 0);     // dist [0, 0, 0, 1, 1, 2, -1], parent [-1, 2, 0, 1, 2, 4, -1]
auto [d, path] = zeroOneBfsWithPath(edges, 7, 0, 5);  // 2, [0, 2, 4, 5]
```

## C++-Specific Notes

- **`int` distances.** A shortest distance is at most V - 1 when every weight is 0 or 1, so `int` cannot overflow; -1 marks an unreachable vertex, as in Python and Go.
- **Helpers.** The adjacency builder and the search live in `namespace zero_one_bfs_detail`. `search` takes an optional `Counters*` that counts pops, stale pops and edge reads; the tests use it to check the O(V + E) bounds.
- **Same output as Python.** `adj[u]` keeps the edges in input order and the search relaxes them in that order; the agreement test checks `dist` and `parent` on 40 graphs computed by the Python code.
- **Test build.** The test `#include`s the `.cpp`, so build only the test file and define `IS_TEST_BUILD` to drop the demo `main`. CI also runs it under AddressSanitizer and UndefinedBehaviorSanitizer.

## How to Run

```bash
cd "Algorithms/Graph_Algorithms/Shortest_Path/0_1_BFS/C++"
# tests
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD zero_one_bfs_test.cpp -o zero_one_bfs_test
./zero_one_bfs_test

# demo
g++ -std=c++17 -O2 -Wall zero_one_bfs.cpp -o zero_one_bfs_demo
./zero_one_bfs_demo
```

## Key Takeaways

1. `push_front` for an edge of weight 0, `push_back` for weight 1: that is the whole difference from Dijkstra's heap.
2. Skip an entry whose distance is above `dist[u]`; it is stale.
3. Build only the test file; it already includes the implementation.
