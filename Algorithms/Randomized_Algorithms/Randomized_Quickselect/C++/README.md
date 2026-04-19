# Randomized Quickselect — C++ Implementation

O(n) expected-time k-th smallest selection using Lomuto partition and `std::mt19937`.

For the conceptual overview and proof of O(n) expected, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `quickselect.h` | Header-only `quickselect(arr, k)` with explicit-RNG and default overloads |
| `quickselect_test.cpp` | 10 tests including random cross-check against `std::sort` |

---

## C++-Specific Notes

- **`std::nth_element` does this better.** It's Introselect (Quickselect + median-of-medians fallback), guaranteeing O(n) worst-case. Use the stdlib in production; this header is for learning.
- **`std::uniform_int_distribution` prevents modulo bias**: `dist(rng)` is uniform over `[lo, hi]`, unlike `rng() % (hi - lo + 1)` which is biased when the range doesn't divide the RNG's output range.
- **Iterative loop** avoids recursion depth concerns. With random pivot, expected depth is O(log n) — never a problem — but iteration is still cleaner.
- **In place**: mutates the input `std::vector<int>&`. Callers who need the original should copy: `auto work = arr;`.
- **Namespace `detail::`** for partition isolates it from the public API without the `static` linkage boilerplate.

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall quickselect_test.cpp -o quickselect_test
./quickselect_test
```

---

## Key Takeaways for Learners

1. **`std::nth_element` > your hand-rolled Quickselect.** Introselect wraps Quickselect with a deterministic fallback, giving O(n) worst case. 99% of the time, reach for it.
2. **Modulo bias is real.** `rand() % n` isn't uniform. Always use `std::uniform_int_distribution` for correctness — it also handles types other than `int` cleanly.
3. **Random pivot = random-time algorithm.** Even on adversarial input, the expected run time holds because the adversary can't predict your pivot choices. The math doesn't lie — but the math assumes your RNG is unpredictable.
