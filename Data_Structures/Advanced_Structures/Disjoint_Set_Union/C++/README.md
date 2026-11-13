# Disjoint Set Union -- C++ Implementation

Union by rank plus path compression, with a size array and a component counter.

## Files

- `dsu.cpp`: the `DSU` class (header-style, included directly by the test).
- `dsu_test.cpp`: assert-based tests.

## API

| Method | Description | Time |
|--------|-------------|------|
| `explicit DSU(int n)` | n singleton sets; throws `std::invalid_argument` if `n < 0` | O(n) |
| `find(x)` | root with path compression; throws `std::out_of_range` outside `[0, n)` | O(alpha(n)) |
| `unite(x, y)` | merge by rank; true if merged (`union` is a C++ keyword) | O(alpha(n)) |
| `connected(x, y)` | same set? | O(alpha(n)) |
| `getSize(x)` | size of the set of x | O(alpha(n)) |
| `getComponentCount()` | number of sets | O(1) |
| `getComponents()` | `unordered_map` root to members | O(n alpha(n)) |
| `getParent(x)` | raw parent, no compression, no range check | O(1) |
| `getCount()` | alias of `getComponentCount()`; `UnionFind` is an alias of `DSU` | O(1) |
| `connectedComponents`, `hasCycle`, `kruskalMST` | free functions over edge lists | O(E alpha(n)) and up |

## C++-Specific Notes

- The rank vector is called `rnk` to avoid clashing with `std::rank`.
- `find` is recursive; the depth is at most log2(n) thanks to union by rank.
- `getParent` does not validate its argument. It exists for tests.
- Everything is held in `std::vector`, so copying the DSU is a safe deep copy.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD dsu_test.cpp -o dsu_test && ./dsu_test
```

## Key Takeaways

- Both optimizations together give O(alpha(n)) amortized operations.
- Bad input throws instead of reading out of bounds.
- Use `find`, not `getParent`, to identify a set.
