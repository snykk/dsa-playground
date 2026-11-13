# Bellman-Ford Algorithm -- C++ Implementation

Bellman-Ford on a `vector<Edge>`, returning `unordered_map<int, int>` distances.

## Files

| File | Contents |
|------|----------|
| `bellman_ford.cpp` | `struct Edge { int u, v, weight; }` and `bellmanFord` |
| `bellman_ford_test.cpp` | 8 test functions using `assert`; it `#include`s `bellman_ford.cpp` |

## API

| Function | Returns |
|----------|---------|
| `bellmanFord(edges, numVertices, start)` | map from vertex to distance, with `INT_MAX` for unreachable vertices; an empty map if a negative cycle is reachable or `numVertices` is 0; throws `std::out_of_range` if an edge endpoint is outside `0..numVertices-1` |

Time O(V * E), space O(V). There is no path-reconstruction function in C++.

```cpp
vector<Edge> edges = {{3, 4, 1}, {2, 3, 3}, {1, 2, -2}, {0, 2, 4}, {0, 1, 5}};
unordered_map<int, int> dist = bellmanFord(edges, 5, 0);  // 0:0 1:5 2:3 3:6 4:7
```

## C++-Specific Notes

- Needs C++17. The test file includes `bellman_ford.cpp`; compile only the test file, or you get duplicate-symbol errors.
- Edges are validated first, so an out-of-range endpoint cannot be read as a vertex at distance 0.
- An empty map means a negative cycle (or zero vertices); check `numVertices` if you need to tell them apart.
- Distances are `int` with `INT_MAX` as infinity. Edges whose tail is `INT_MAX` are skipped, but sums are not checked for overflow, so keep weights small.

## How to Run

```bash
cd Algorithms/Graph_Algorithms/Shortest_Path/Bellman-Ford_Algorithm/C++
g++ -std=c++17 -O2 -Wall bellman_ford_test.cpp -o bellman_ford_test
./bellman_ford_test
```

## Key Takeaways

- Validate edge endpoints before indexing the distance map.
- An empty result signals a negative cycle.
- Compile only the test file.
