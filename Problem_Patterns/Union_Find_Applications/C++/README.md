# Union-Find Applications -- C++ Implementation

A disjoint set union with path compression and union by rank. See the [topic README](../README.md) for the applications.

## Files

| File | Contents |
|------|----------|
| `union_find.cpp` | `UnionFind` class and a demo `main` |
| `union_find_test.cpp` | Assert-based tests (includes the `.cpp`) |

## API

- `UnionFind(int size)`: throws `std::invalid_argument` if `size < 0`.
- `int find(int x)`: root with path compression; throws `std::out_of_range` for a bad index.
- `bool unite(int x, int y)`: `true` if merged, `false` if already connected.
- `bool connected(int x, int y)`
- `int getCount() const`

## C++-Specific Notes

- The merge method is named `unite` because `union` is a C++ keyword.
- `find` is recursive; union by rank keeps trees shallow.
- There is no `count_components` helper in C++; call `unite` for each edge and read `getCount()`.
- The demo `main` is compiled out when `IS_TEST_BUILD` is defined.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD union_find_test.cpp -o uf_test && ./uf_test
g++ -std=c++17 -O2 -Wall union_find.cpp -o uf_demo && ./uf_demo
```

## Key Takeaways

- `unite` returns the cycle signal.
- Bad indices throw instead of corrupting memory.
- Count components with `getCount()` after uniting all edges.
