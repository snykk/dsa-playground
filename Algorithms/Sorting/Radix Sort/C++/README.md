# Radix Sort — C++ Implementation

**Radix Sort** sorts numbers by processing one digit at a time, from least significant (LSD) to most significant — typically using Counting Sort as the stable per-digit sort. O(d·(n + k)) where `d` is digit count and `k` is the base (usually 10 or 256).

For the conceptual overview, LSD vs MSD variants, and comparison with comparison-based sorts, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `radix_sort.cpp` | LSD Radix Sort implementation using Counting Sort per digit |
| `radix_sort_test.cpp` | Assertion tests |

---

## Complexity

| Aspect | Value |
|--------|-------|
| Time | O(d · (n + k)) |
| Space | O(n + k) |
| Stable? | Yes (requires stable per-digit sort) |
| Comparison-based? | **No** |

For 32-bit ints with base 256, `d = 4` and `k = 256`, giving effectively O(n) — faster than O(n log n) comparison sorts on large inputs of bounded integers.

---

## C++-Specific Notes

- **Use base 256 (byte-level) on modern hardware**, not base 10. Four passes for 32-bit ints, eight for 64-bit. Cache-friendly because the count array fits in L1.
- **Per-digit sort must be stable**. Counting Sort is naturally stable — but if you substitute an unstable sort, Radix Sort breaks silently.
- **Negative numbers**: when the minimum is negative, `radixSort` takes the digits of `value - min` (a 64-bit key, never negative, same order as the values). Byte-wise radix sorts usually bias by `INT_MIN` or treat the sign bit separately instead.
- **`std::vector<int>` over raw arrays**: automatic sizing and bounds safety. The `count` array can be `std::array<int, 256>` (stack-allocated, no allocation cost).

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall radix_sort_test.cpp -o radix_sort_test
./radix_sort_test
```

---

## Key Takeaways for Learners

1. **Non-comparison sorts beat the Ω(n log n) lower bound.** Radix Sort is O(n · d) — linear in `n` when `d` is constant. The trade-off: you need _structured_ data (integers, fixed-length strings) rather than arbitrary comparable values.
2. **LSD vs MSD**: LSD is the standard go-to; it processes digits right-to-left and guarantees stability. MSD is recursive and can terminate early on distinguishable prefixes — useful for strings.
3. **Stability of the per-digit sort is mandatory.** Substitute a non-stable sort (Quick Sort, Heap Sort) for the digit pass and Radix Sort silently produces wrong results.
