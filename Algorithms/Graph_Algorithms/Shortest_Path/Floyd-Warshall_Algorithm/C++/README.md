# Floyd-Warshall Algorithm -- C++ Implementation

All-pairs shortest paths over `vector<vector<pair<int, int>>>` (`graph[u]` is a list of `(v, weight)` pairs), returning a `long long` matrix.

## Files

| File | Contents |
|------|----------|
| `floyd_warshall.cpp` | `floydWarshall` |
| `floyd_warshall_test.cpp` | 9 test functions using `assert`; it `#include`s `floyd_warshall.cpp` |

## API

| Function | Returns |
|----------|---------|
| `floydWarshall(graph, numVertices)` | `vector<vector<long long>>`, with `LLONG_MAX` where j is unreachable from i; an empty matrix if there is a negative cycle |

Time O(V^3), space O(V^2). `graph` may have fewer rows than `numVertices` (missing rows have no edges). There is no path reconstruction in C++.

```cpp
vector<vector<pair<int, int>>> g = {{{1, 3}, {3, 7}}, {{0, 8}, {2, -2}}, {{0, 5}, {3, 1}}, {{0, 2}}};
auto dist = floydWarshall(g, 4);   // dist[1] = {1, 0, -2, -1}
```

## C++-Specific Notes

- Needs C++17. The test file includes `floyd_warshall.cpp`; compile only the test file, or you get duplicate-symbol errors.
- Distances are `long long`; the negative-cycle check runs after every round, so values cannot shrink without bound.
- An edge endpoint outside `0..numVertices-1` throws `std::out_of_range` (`dist[u].at(v)`).
- An empty matrix means a negative cycle (or zero vertices).

## How to Run

```bash
cd Algorithms/Graph_Algorithms/Shortest_Path/Floyd-Warshall_Algorithm/C++
g++ -std=c++17 -O2 -Wall floyd_warshall_test.cpp -o floyd_warshall_test
./floyd_warshall_test
```

## Key Takeaways

- Check the diagonal after each round to avoid runaway values.
- Weights are `int` but sums are `long long`.
- Compile only the test file.
