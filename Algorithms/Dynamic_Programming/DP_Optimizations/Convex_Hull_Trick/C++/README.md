# Convex Hull Trick — C++ Implementation

Monotonic CHT and Li Chao Tree for min queries, with integer-only arithmetic (via `__int128` for cross-multiplication).

For the conceptual overview, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `cht.h` | Header-only `MonotonicCHT` and `LiChaoTree` classes |
| `cht_test.cpp` | Assertion-based tests including random stress against brute-force |

---

## C++-Specific Notes

- **`__int128` for cross-multiplication**: when slope and intercept are both `int64`, their product can overflow. `__int128` is a GCC/Clang extension that's exactly what we need for overflow-free comparison.
- **`std::deque<Line>`** for the monotonic CHT: `pop_front` is O(1) unlike `std::vector::erase(begin())`.
- **`new` / `delete` in Li Chao**: we own the tree nodes with raw pointers here for clarity. In production, use `std::unique_ptr` with a custom destructor. We delete-copy/assign to prevent shallow-copy bugs.
- **`Line{true, m, b}`** explicit aggregate initialization avoids narrowing warnings when the first field is a `bool`.
- **Recursive Li Chao**: depth is O(log V). For `V = 10¹⁸`, that's ~60 — no stack concerns.

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall cht_test.cpp -o cht_test
./cht_test
```

---

## Key Takeaways for Learners

1. **`__int128` saves you from overflow.** When comparing line intersections via cross-products, the intermediate value can easily blow `int64`. `__int128` is GCC/Clang-only but widely available.
2. **Rule of 5 via `= delete`.** The Li Chao Tree owns heap-allocated nodes; shallow copies would double-free. Deleting the copy/assign operators is the safest minimum.
3. **CHT is a DP-optimization pattern, not a data structure per se.** The structure is a means to an end — the algorithm shines when you see it applied to a DP problem that previously was O(n²). Try one on an Atcoder DP contest problem to feel the difference.
