# Segment Tree with Lazy Propagation (C++)

C++ implementation of a segment tree supporting efficient range updates and range queries.

## Files

| File | Description |
|------|-------------|
| `segment_tree_lazy.cpp` | Main implementation |
| `segment_tree_lazy_test.cpp` | Test cases |

## How to Run

```bash
g++ -std=c++17 -o test segment_tree_lazy_test.cpp
./test
```

## Key Methods

| Method | Description | Time |
|--------|-------------|------|
| `LazySegmentTree(arr)` | Build segment tree from vector | O(n) |
| `query(left, right)` | Range sum query with lazy propagation | O(log n) |
| `updateRange(left, right, val)` | Add val to all elements in [left, right] | O(log n) |

## Complexity

| Aspect | Complexity |
|--------|-----------|
| Build | O(n) |
| Range Query | O(log n) |
| Range Update | O(log n) |
| Space | O(n) |

---

_Last Updated: April 2026_
