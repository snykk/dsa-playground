# Tarjan's Bridges and Articulation Points -- C++ Implementation

One O(V + E) DFS that finds the bridges and the articulation points of an undirected graph. For the idea, the trace and the rules, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `tarjan_bridges.h` | Header-only `TarjanBridges` class and the `TarjanResult` struct |
| `tarjan_bridges_test.cpp` | 12 assert-based tests: standard shapes, parallel edges, a cycle with a bridge, a 10^6-vertex path, a self-loop |

## API

- `TarjanBridges(int n, const std::vector<std::pair<int, int>>& edges)`: a graph on vertices `0..n-1`.
- `TarjanResult compute()`: `bridges` (sorted `(min, max)` pairs) and `articulations` (sorted vertex ids).

## C++-Specific Notes

- **Edge ids in the adjacency lists.** Each entry is `(neighbour, edge id)`, so parallel edges are handled.
- **Iterative DFS.** A `std::vector<Frame>` replaces recursion; a recursive DFS overflows the stack at about 10^5 vertices, while this version handles 10^6.
- **Sets for the output.** `std::set` gives unique, sorted bridges and articulation points.
- **Labels.** A vertex label outside `0..n-1` is undefined behaviour.
- **C++17.** The code uses structured bindings.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall tarjan_bridges_test.cpp -o tarjan_bridges_test
./tarjan_bridges_test
```

## Key Takeaways

1. Edge ids, not parent vertices, make the algorithm safe on multigraphs.
2. An explicit frame stack scales to a million-vertex path.
3. Strict `>` for bridges, `>=` for articulation points.
