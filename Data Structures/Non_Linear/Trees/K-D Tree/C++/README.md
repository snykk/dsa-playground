# K-D Tree — C++ Implementation

Template-based K-D Tree with compile-time dimensionality: `KDTree<2>`, `KDTree<3>`, etc. Uses `std::unique_ptr` for memory management.

For the conceptual overview and visuals, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `kd_tree.h` | Header-only `KDTree<K>` template with `insert`, `nearest`, `rangeSearch` |
| `kd_tree_test.cpp` | 8 tests: textbook example, random cross-check against brute force, 2D & 3D range queries |

---

## C++-Specific Notes

- **`template <size_t K>`** gives compile-time dimensionality. `std::array<double, K>` for points is stack-allocated with no heap overhead and enables loop unrolling.
- **`std::nth_element` for median pivoting during build**: O(n) per level expected, giving O(n log n) total build time. Much faster than `std::sort`.
- **`std::unique_ptr<Node>`** for automatic cleanup. Move semantics during insert avoid copies.
- **`std::optional<Point>`** as `nearest` return type: cleaner than sentinel values when the tree is empty.
- **Squared distance** to avoid `sqrt` in the inner loop — the correctness property `a < b ⟺ a² < b²` holds for non-negative values.

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall kd_tree_test.cpp -o kd_tree_test
./kd_tree_test
```

---

## Key Takeaways for Learners

1. **Template dimensionality** is C++'s answer to runtime polymorphism here: the compiler unrolls the K-dimension loops, giving assembly equivalent to hand-written 2D or 3D code.
2. **`std::nth_element` beats `std::sort` for median finding** — O(n) vs O(n log n). Every K-D Tree build should use it.
3. **The prune-by-squared-distance trick** (`diff * diff < bestDist`) is what makes NN search O(log n) expected. Skip it and you visit every node.
