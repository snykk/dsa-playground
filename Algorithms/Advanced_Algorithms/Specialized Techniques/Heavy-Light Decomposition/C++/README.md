# Heavy-Light Decomposition -- C++ Implementation

## Files

| File | Contents |
|------|----------|
| `heavy_light_decomposition.cpp` | the `HLD` class and a demo `main()` (compiled out with `-DIS_TEST_BUILD`) |
| `heavy_light_decomposition_test.cpp` | assert-based tests (LCA, rebuild) |

## API

| Member | Description |
|--------|-------------|
| `HLD(int n, const vector<vector<int>>& adj)` | copies the adjacency list of a tree on `0..n-1` |
| `void build(int root = 0)` | resets state and builds the decomposition |
| `int lca(int u, int v)` | lowest common ancestor, O(log n) |

There is no path-query or segment-tree API in C++; only `lca`.

## C++-Specific Notes

- `dfsSize` and `decompose` are recursive; a very deep tree can overflow the stack.
- The decomposition arrays are private; only `lca` is exposed.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD heavy_light_decomposition_test.cpp -o test && ./test
g++ -std=c++17 -O2 heavy_light_decomposition.cpp -o demo && ./demo
```

## Key Takeaways

- The C++ version implements the decomposition and LCA only.
- `build` can be called repeatedly.
