# Convex Hull Trick -- Python Implementation

A monotonic deque-based CHT and a Li Chao tree, both for minimum queries over lines `y = m*x + b` with integer coefficients.

## Files

| File | Description |
|------|-------------|
| `cht.py` | `MonotonicCHT` and `LiChaoTree` |
| `cht_test.py` | `unittest` tests (13): classic examples, equal slopes, a long query sweep on the deque, random stress against a brute-force minimum |

## API

- `MonotonicCHT()`: `add_line(m, b)` (slopes non-increasing; equal slopes keep the lower intercept), `query(x)` (x non-decreasing; raises `ValueError` if no line was added). O(1) amortized each.
- `LiChaoTree(lo, hi)`: `add_line(m, b)` in any order and `query(x)` for `lo <= x <= hi`. O(log(hi - lo)) each. `query` raises `ValueError` outside the range and returns `float('inf')` on an empty tree.

```python
from cht import MonotonicCHT

cht = MonotonicCHT()
for m, b in [(3, 0), (2, 4), (1, 3), (0, 7)]:
    cht.add_line(m, b)
print([cht.query(x) for x in range(7)])   # [0, 3, 5, 6, 7, 7, 7]
```

## Python-Specific Notes

- Integer arithmetic only: the redundancy test `(b3 - b1) * (m1 - m2) <= (b2 - b1) * (m1 - m3)` avoids division, and Python integers cannot overflow.
- The lines are stored in a `collections.deque`, so popping from the front is O(1). (A list with `pop(0)` is O(n) per pop and made query sweeps quadratic.)
- Li Chao nodes use `__slots__` to save memory. The recursion depth is about log2 of the range size, well within Python's default limit.
- Queries of the monotonic CHT mutate it (front lines are discarded), so queries must not go backwards.

## How to Run

From this folder:

```bash
python3 -m unittest cht_test
```

## Key Takeaways

- Cross-multiplication keeps the comparisons exact; never divide.
- The monotonic version is simple but silently wrong if slopes or queries are out of order.
- The Li Chao tree needs no ordering, at the cost of a logarithmic factor and a bounded range.
