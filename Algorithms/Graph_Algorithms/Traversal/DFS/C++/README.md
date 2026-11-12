# DFS -- C++ Implementation

Depth-First Search over `unordered_map<int, vector<int>>` with `std::stack`. Cycle detection uses an explicit stack of frames instead of recursion.

## Files

| File | Contents |
|------|----------|
| `dfs.cpp` | the three DFS functions |
| `dfs_test.cpp` | 15 test functions using `assert`; it `#include`s `dfs.cpp` |

## API

| Function | Returns |
|----------|---------|
| `dfsAdjacencyList(graph, start)` | `vector<int>` in DFS order; empty if `start` is not a key |
| `dfsWithPath(graph, start, target)` | the first path found in DFS order; empty if none; `{start}` when `start == target` |
| `dfsDetectCycle(graph, directed)` | `true` if the graph has a cycle |

Time is O(V + E). Space is O(V + E) for the first two (the stack can hold one entry per edge) and O(V) for cycle detection. There is no recursive variant, connected components or topological sort in C++; Python has them.

## C++-Specific Notes

- Needs C++17 (structured bindings). The test file includes `dfs.cpp`, so compile only the test file; passing both gives duplicate-symbol errors.
- `dfsDetectCycle` keeps a `hasParent` flag in each frame instead of a sentinel, so a vertex numbered -1 works. Its explicit stack means a path of a million vertices does not overflow the call stack.
- Neighbors are read without `operator[]`, so the graph stays `const` and neighbor-only vertices are handled.

## How to Run

```bash
cd Algorithms/Graph_Algorithms/Traversal/DFS/C++
g++ -std=c++17 -O2 -Wall dfs_test.cpp -o dfs_test
./dfs_test
```

## Key Takeaways

- Compile only the test file; it includes the implementation.
- Use an explicit stack to keep deep graphs off the call stack.
- Do not use a vertex value as the "no parent" marker.
