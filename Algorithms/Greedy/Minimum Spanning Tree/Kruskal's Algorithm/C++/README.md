# Kruskal's Algorithm -- C++ Implementation

Kruskal's algorithm on a `vector<tuple<int, int, int>>` of `(u, v, weight)` edges.

## Files

| File | Contents |
|------|----------|
| `kruskal.cpp` | the `UnionFind` class and `kruskalMST` |
| `kruskal_test.cpp` | 4 test functions using `assert`; it `#include`s `kruskal.cpp` |

## API

| Name | Returns |
|------|---------|
| `UnionFind(n)` | `find(x)` with path compression; `unionSets(x, y)` by rank, returning `false` if already joined |
| `kruskalMST(edges, numVertices)` | `vector<tuple<int, int, int>>` of the chosen edges; empty for 0 vertices |

Time O(E log E), space O(V). The function returns edges only; add up the weights yourself.

```cpp
std::vector<std::tuple<int, int, int>> edges = {{0, 1, 10}, {0, 2, 6}, {0, 3, 5}, {1, 3, 15}, {2, 3, 4}};
auto mst = kruskalMST(edges, 4);   // (2,3,4) (0,3,5) (0,1,10)
```

## C++-Specific Notes

- Needs C++17 (generic lambda in `std::sort`, structured bindings in the tests). The test file includes `kruskal.cpp`; compile only the test file, or you get duplicate-symbol errors.
- `kruskalMST` takes the edge vector by non-const reference and **sorts it in place**. Copy it first if you need the original order.
- `std::sort` is not stable, so equal-weight edges can come out in any order; the total weight does not change.
- A disconnected graph returns a spanning forest (fewer than V - 1 edges).

## How to Run

```bash
cd "Algorithms/Greedy/Minimum Spanning Tree/Kruskal's Algorithm/C++"
g++ -std=c++17 -O2 -Wall kruskal_test.cpp -o kruskal_test
./kruskal_test
```

## Key Takeaways

- The input vector is sorted in place.
- Compile only the test file.
- Sum the weights yourself; the result is a list of edges.
