# DP on Graphs -- C++ Implementation

Longest path in a directed acyclic graph with a memoized DFS and cycle detection, ported from the Python version in C++17.

## Files

| File | Description |
|------|-------------|
| `graph_dp.cpp` | `Graph` and `dagLongestPath` |
| `graph_dp_test.cpp` | 9 assert-based tests: the 7 Python cases, values printed by the Python code (a 12-node DAG, negative and sparse node ids, a cycle below a DAG), and 500 random graphs checked against a brute force over all simple paths |

## API

| Name | Description |
|------|-------------|
| `using Graph = std::unordered_map<int, std::vector<int>>` | node -> successor nodes; a node without an entry has no successors |
| `int dagLongestPath(const Graph& graph, int start)` | number of edges on the longest path starting at `start`; throws `std::invalid_argument` if a cycle (including a self-loop) is reachable from `start` |

```cpp
Graph graph = {{0, {1, 2}}, {1, {3}}, {2, {3}}, {3, {}}};
int length = dagLongestPath(graph, 0);  // 2  (0 -> 1 -> 3 or 0 -> 2 -> 3)
```

## C++-Specific Notes

- Python's `ValueError` becomes `std::invalid_argument`, with the same message.
- Node ids are `int` and need not be contiguous or non-negative; the memo and the in-progress set are an `std::unordered_map` and an `std::unordered_set`, like Python's dict and set.
- The DFS is recursive, so its depth is at most the number of nodes on the longest path. The default 8 MB stack holds paths of many thousands of nodes, but not millions.
- Only the part of the graph reachable from `start` is examined; an unreachable cycle is not reported. Edge weights are not supported.

## How to Run

```bash
cd "Algorithms/Dynamic_Programming/Advanced_DP/DP_on_Graphs/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD graph_dp_test.cpp -o graph_dp_test
./graph_dp_test
```

## Key Takeaways

- Memoization makes each node and edge cost O(1) work overall: O(V + E).
- An in-progress set distinguishes a cycle from a harmless shared descendant.
- The memo counts nodes; the function subtracts 1 to return edges.
