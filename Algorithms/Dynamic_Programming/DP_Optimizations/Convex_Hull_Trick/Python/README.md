# Convex Hull Trick — Python Implementation

Two CHT variants: a monotonic deque-based version (O(1) amortized) and a Li Chao Tree (O(log V), any order).

For the conceptual overview, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `cht.py` | `MonotonicCHT` class + `LiChaoTree` class |
| `cht_test.py` | Unit tests including random stress against brute-force `min` |

---

## Python-Specific Notes

- **Integer arithmetic only** in the `_bad` predicate: `(b3 - b1) * (m1 - m2) <= (b2 - b1) * (m1 - m3)` avoids floating-point division. Python's arbitrary-precision `int` makes cross-multiplication overflow-free.
- **`list.pop(0)` in `query`** of the monotonic CHT is O(n) — but amortized O(1) across the entire sequence of queries because each line is popped at most once. For worst-case behavior use `collections.deque`.
- **Li Chao nodes via `__slots__`**: saves ~40 bytes per node. For a tree over range 10⁹, up to 30 levels deep — the constant matters.
- **Recursive Li Chao insert/query**: clean and O(log V) deep, well within Python's default recursion limit for reasonable ranges. For `V > 2²⁰` depths, bump the limit.
- **`float("inf")`** as the initial query result. Switching to a fixed large sentinel (`10¹⁸`) would be slightly faster but less defensive.

---

## How to Run

```bash
python3 -m unittest cht_test.py
```

---

## Key Takeaways for Learners

1. **Cross-multiplication beats floating-point division.** The moment you write `(b1 - b2) / (m2 - m1)` in a CHT, you're one adversarial test case away from a precision bug. Always cross-multiply.
2. **Monotonic CHT is orders simpler than Li Chao.** If the problem guarantees monotonic slopes and queries, prefer it — 30 lines vs 80.
3. **Li Chao is your universal tool.** When the problem statement doesn't promise monotonicity, Li Chao works without the caller having to sort or batch. The log factor is usually acceptable.
