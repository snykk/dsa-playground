# Prim's Algorithm -- C++ Implementation

Prim's algorithm on a `vector<vector<pair<int, int>>>` adjacency list (`graph[u]` holds `(neighbor, weight)` pairs), using a `std::priority_queue`.

## Files

| File | Contents |
|------|----------|
| `prim.cpp` | `primMST` |
| `prim_test.cpp` | 4 test functions using `assert`; it `#include`s `prim.cpp` |

## API

| Function | Returns |
|----------|---------|
| `primMST(graph, start)` | `vector<tuple<int, int, int>>` of `(from, to, weight)` edges; empty for an empty graph |

Time O(E log V), space O(V + E). The function returns edges only; add up the weights yourself. There is no edge-list or matrix version in C++.

```cpp
std::vector<std::vector<std::pair<int, int>>> graph = {
    {{1, 10}, {2, 6}, {3, 5}}, {{0, 10}, {3, 15}}, {{0, 6}, {3, 4}}, {{0, 5}, {1, 15}, {2, 4}}};
auto mst = primMST(graph, 0);   // (0,3,5) (3,2,4) (0,1,10)
```

## C++-Specific Notes

- Needs C++17 (structured bindings). The test file includes `prim.cpp`; compile only the test file, or you get duplicate-symbol errors.
- The heap orders `(weight, from, to)` tuples with `std::greater`, so ties go to the smaller `from`, then `to`.
- Every vertex is a row of `graph`, so `graph.size()` is the vertex count; `start` must be a valid index.
- The loop stops once V - 1 edges are kept. A disconnected graph returns only the tree of the start vertex.

## How to Run

```bash
cd "Algorithms/Greedy/Minimum Spanning Tree/Prim's Algorithm/C++"
g++ -std=c++17 -O2 -Wall prim_test.cpp -o prim_test
./prim_test
```

## Key Takeaways

- Compile only the test file.
- Sum the weights yourself; the result is a list of edges.
- `start` must be a valid row index.
