# Dijkstra's Algorithm -- C++ Implementation

Dijkstra's algorithm over `unordered_map<int, vector<pair<int, int>>>` with `std::priority_queue` and `long long` distances.

## Files

| File | Contents |
|------|----------|
| `dijkstra.cpp` | `dijkstra` and `dijkstraWithPath` |
| `dijkstra_test.cpp` | 11 test functions using `assert`; it `#include`s `dijkstra.cpp` |

## API

| Function | Returns |
|----------|---------|
| `dijkstra(graph, start)` | `unordered_map<int, long long>`; unreachable vertices are `LLONG_MAX`; empty map for an empty graph |
| `dijkstraWithPath(graph, start, target)` | `pair<long long, vector<int>>`: distance and path, or `(-1, {})` if unreachable; `(0, {start})` when `start == target` |

Both run in O((V + E) log V) time and O(V + E) space. There is no all-pairs function in C++.

## C++-Specific Notes

- Needs C++17. The test file includes `dijkstra.cpp`; compile only the test file, or you get duplicate-symbol errors.
- Distances are `long long`, so two weights up to the `int` limit cannot overflow. Weights are `int`.
- Every vertex (map keys and neighbor-only vertices) gets `LLONG_MAX` first, so `operator[]` never inserts a wrong 0.
- A min-heap `priority_queue` with `greater<>` is used, and stale entries are skipped when popped.
- Negative weights are not detected.

## How to Run

```bash
cd "Algorithms/Graph_Algorithms/Shortest_Path/Dijkstras_Algorithm/C++"
g++ -std=c++17 -O2 -Wall dijkstra_test.cpp -o dijkstra_test
./dijkstra_test
```

## Key Takeaways

- Initialize every vertex, including neighbor-only ones, before relaxing.
- Use 64-bit distances.
- Compile only the test file.
