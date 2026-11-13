# BFS -- C++ Implementation

Breadth-First Search over `unordered_map<int, vector<int>>` with `std::queue` and `unordered_set`.

## Files

| File | Contents |
|------|----------|
| `bfs.cpp` | the four BFS functions |
| `bfs_test.cpp` | 12 test functions using `assert`; it `#include`s `bfs.cpp` |

## API

| Function | Returns |
|----------|---------|
| `bfsAdjacencyList(graph, start)` | `vector<int>` in BFS order; empty if `start` is not a key |
| `bfsWithPath(graph, start, target)` | a shortest path as `vector<int>`; empty if none; `{start}` when `start == target` |
| `bfsLevelOrder(graph, start)` | `vector<vector<int>>`, one vector per level |
| `bfsShortestDistance(graph, start)` | `unordered_map<int, int>` of hops to every reachable vertex |

All run in O(V + E) time and O(V) space.

```cpp
unordered_map<int, vector<int>> graph = {{1, {2, 4}}, {2, {3}}, {3, {}}, {4, {}}};
vector<int> order = bfsAdjacencyList(graph, 1);  // 1 2 4 3
vector<int> path = bfsWithPath(graph, 1, 3);     // 1 2 3
```

## C++-Specific Notes

- Needs C++17. The test file already includes `bfs.cpp`, so compile the test file alone; passing both files to the compiler gives duplicate-symbol errors.
- Neighbors are read only when the vertex is a key of the map, so a vertex that appears only in neighbor lists is handled. The function never inserts into the graph (it is `const`).
- `bfsWithPath` stores one parent per vertex and rebuilds the path once, so it is O(V + E).
- "Not found" is an empty vector, which cannot be told apart from an empty result; check `start == target` and key membership if you need to.
- Connected components exist only in the Python version.

## How to Run

```bash
cd Algorithms/Graph_Algorithms/Traversal/BFS/C++
g++ -std=c++17 -O2 -Wall bfs_test.cpp -o bfs_test
./bfs_test
```

## Key Takeaways

- Compile only the test file; it includes the implementation.
- Keep the graph `const` and read neighbors without `operator[]`.
- Mark vertices when they are enqueued.
