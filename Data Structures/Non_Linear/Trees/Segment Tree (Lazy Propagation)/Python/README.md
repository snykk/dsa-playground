# Segment Tree with Lazy Propagation (Python)

Python implementation of a segment tree supporting efficient range updates and range queries.

## Files

| File | Description |
|------|-------------|
| `segment_tree_lazy.py` | Main implementation |
| `segment_tree_lazy_test.py` | Test cases |

## How to Run

```bash
python segment_tree_lazy.py       # Run demo
python segment_tree_lazy_test.py  # Run tests
```

## Key Methods

| Method | Description | Time |
|--------|-------------|------|
| `__init__(arr)` | Build segment tree from array | O(n) |
| `query(left, right)` | Range sum query with lazy propagation | O(log n) |
| `update_range(left, right, val)` | Add val to all elements in [left, right] | O(log n) |

## Complexity

| Aspect | Complexity |
|--------|-----------|
| Build | O(n) |
| Range Query | O(log n) |
| Range Update | O(log n) |
| Space | O(n) |

---

_Last Updated: April 2026_
