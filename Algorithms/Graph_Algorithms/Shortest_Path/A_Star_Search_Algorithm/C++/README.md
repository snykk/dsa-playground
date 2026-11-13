# A* Search Algorithm -- C++ Implementation

A* over `unordered_map<int, vector<pair<int, int>>>` (vertex to `(neighbor, weight)` pairs) with `std::priority_queue`.

## Files

| File | Contents |
|------|----------|
| `astar.cpp` | the `Node` struct and `astar` |
| `astar_test.cpp` | 8 test functions using `assert`; it `#include`s `astar.cpp` |

## API

| Function | Returns |
|----------|---------|
| `astar(graph, start, goal, heuristic)` | `pair<int, vector<int>>`: cost and path, or `(-1, {})` if the goal is unreachable; `(0, {start})` when `start == goal` |

`heuristic` is a `function<int(int)>`.

```cpp
unordered_map<int, vector<pair<int, int>>> graph = {
    {0, {{1, 4}, {2, 2}}}, {1, {{3, 5}}}, {2, {{3, 1}}}, {3, {}}};
auto [cost, path] = astar(graph, 0, 3, [](int v) { return v == 3 ? 0 : 1; });
// cost 3, path 0 2 3
```

## C++-Specific Notes

- Needs C++17 (structured bindings). The test file includes `astar.cpp`; compile only the test file, or you get duplicate-symbol errors.
- The queue orders `Node`s by f only, so entries with equal f can pop in any order; the cost is unaffected.
- No closed set: a vertex is pushed again when a cheaper g is found, and stale entries are skipped. This keeps the result optimal for any admissible heuristic.
- Costs are `int` and are not checked for overflow. Each node copies its path.
- `(-1, {})` also means "unreachable"; negative costs are not supported, so it is not ambiguous.

## How to Run

```bash
cd Algorithms/Graph_Algorithms/Shortest_Path/A_Star_Search_Algorithm/C++
g++ -std=c++17 -O2 -Wall astar_test.cpp -o astar_test
./astar_test
```

## Key Takeaways

- Compile only the test file; it includes the implementation.
- Re-opening vertices makes an admissible heuristic enough for optimality.
- Ties in f are not broken by g here.
