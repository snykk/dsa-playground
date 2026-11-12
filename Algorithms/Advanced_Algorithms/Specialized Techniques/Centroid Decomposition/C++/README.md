# Centroid Decomposition -- C++ Implementation

## Files

| File | Contents |
|------|----------|
| `centroid_decomposition.cpp` | the `CentroidDecomposition` class and a demo `main()` (compiled out with `-DIS_TEST_BUILD`) |
| `centroid_decomposition_test.cpp` | assert-based tests |

## API

| Member | Description |
|--------|-------------|
| `CentroidDecomposition(int n, const vector<vector<int>>& adj)` | copies the adjacency list of a tree on `0..n-1` |
| `void build(int root = 0)` | resets state and decomposes the component containing `root` |
| `vector<int> getParent() const` | centroid-tree parent of each node, `-1` for the root |

## C++-Specific Notes

- Subtree sizes are computed by a recursive DFS, so recursion depth equals the component's depth. A path of hundreds of thousands of nodes can overflow the default stack.
- The class copies `adj` and stores `removed` as `vector<bool>`.
- There is no centroid-tree adjacency list; build it from `getParent()`.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD centroid_decomposition_test.cpp -o test && ./test
g++ -std=c++17 -O2 centroid_decomposition.cpp -o demo && ./demo
```

## Key Takeaways

- Same algorithm as Python, but with a recursive size DFS.
- `build` can be called repeatedly; it resets `removed` and `parent`.
