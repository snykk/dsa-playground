# K-D Tree -- C++ Implementation

A header-only K-D tree with compile-time dimensionality. See the [topic README](../README.md) for the idea and a trace.

## Files

| File | Contents |
| ---- | -------- |
| `kd_tree.h` | `KDTree<K>` with build, `insert`, `nearest`, `rangeSearch` |
| `kd_tree_test.cpp` | tests: textbook example, random cross-checks against brute force, 2D and 3D range queries |

## API

| Call | Result |
| ---- | ------ |
| `KDTree<K>()`, `KDTree<K>(vector<Point>)` | empty tree, or a balanced build from points (`Point` is `std::array<double, K>`) |
| `void insert(const Point&)` | adds a point as a leaf; no rebalancing |
| `optional<Point> nearest(const Point&) const` | the closest stored point, or an empty optional |
| `vector<Point> rangeSearch(const Point& lo, const Point& hi) const` | points inside the box |

## C++-Specific Notes

- `template <size_t K>` fixes the dimensionality at compile time, so a wrong-sized point does not compile.
- The build uses `std::nth_element` to find each median: linear per level on average, O(n log n) in total (Python and Go sort at every level instead).
- Nodes are owned by `std::unique_ptr`. The destructor, `insert` and the queries are recursive, so a very deep chain (many sorted inserts) can exhaust the stack. Build from the full list to stay balanced.
- Squared distances are compared; there is no `sqrt`.

## How to Run

```bash
cd "Data_Structures/Non_Linear/Trees/K_D_Tree/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD kd_tree_test.cpp -o kd_tree_test && ./kd_tree_test
```

## Key Takeaways

- Template dimensionality lets the compiler unroll the per-axis loops.
- `nth_element` is the right tool for a median pivot.
- The plane test prunes the far subtree.
