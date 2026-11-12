# Union-Find (Disjoint Set Union) -- C++ Implementation

`UnionFind` with path compression and union by rank. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `union_find.cpp` | `UnionFind`, `unionFindCycleDetection` and a demo `main` (compiled out when `IS_TEST_BUILD` is defined) |
| `union_find_test.cpp` | 4 assert-based tests: basics, cycle detection, the README merge sequence, a 10^6-union chain; it `#include`s `union_find.cpp` |

## API

- `UnionFind(int n)`: elements `0..n-1`.
- `int find(int x)`: the root, with path compression.
- `bool unite(int x, int y)`: merge by rank; false if already in one set (the method is not called `union`, which is a C++ keyword).
- `bool connected(int x, int y)` and `int getCount() const`.
- `bool unionFindCycleDetection(const std::vector<std::pair<int, int>>& edges, int n)`.

There are no components, MST or largest-component helpers in C++ (Python has them).

## C++-Specific Notes

- **Recursive `find`.** Union by rank keeps trees at most `log2(n)` high, so the recursion is shallow (10^6 chained unions are tested).
- **No bounds checks.** An id outside `0..n-1` is undefined behaviour.
- **Members** are `std::vector<int>` for `parent` and `rank`; `std::iota` fills `parent`.
- **Test build.** The test `#include`s the `.cpp`, so build only the test file with `-DIS_TEST_BUILD`.

## How to Run

```bash
# tests
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD union_find_test.cpp -o union_find_test
./union_find_test

# demo
g++ -std=c++17 -O2 -Wall union_find.cpp -o union_find_demo
./union_find_demo
```

## Key Takeaways

1. Two small vectors are the whole structure.
2. `unite` returns false for an edge inside a component.
3. Build the test file alone: it includes the implementation.
