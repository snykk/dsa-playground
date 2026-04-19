# Selection Sort — C++ Implementation

**Selection Sort** repeatedly finds the minimum of the unsorted portion and swaps it to the front. O(n²) regardless of input — but uses the minimum possible **number of swaps** (exactly n-1), making it useful when writes are far more expensive than reads.

For the conceptual overview and comparison with Insertion / Bubble sort, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `selection_sort.cpp` | `selectionSort(std::vector<int>&)` implementation |
| `selection_sort_test.cpp` | Assertion tests |

---

## Complexity

| Case | Time | Space | Swaps |
|------|------|-------|-------|
| Best | O(n²) | O(1) | n − 1 |
| Average | O(n²) | O(1) | n − 1 |
| Worst | O(n²) | O(1) | n − 1 |

Unusual: best = worst. The outer loop always runs n times, inner loop always scans the full unsorted tail.

---

## C++-Specific Notes

- **`std::min_element`** from `<algorithm>` finds the minimum in the unsorted range. A two-line Selection Sort using it is the cleanest form.
- **`std::iter_swap`** swaps two iterators cleanly: `std::iter_swap(sorted_end, min_iter)`.
- **Not stable** — swapping equal elements breaks relative order. Use `std::stable_sort` if stability matters.
- **Minimum-write property** is unique here. Every other comparison sort does more writes than reads; Selection Sort does exactly n − 1 writes regardless of input. Useful for EEPROM-backed storage or flash wear leveling.

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall selection_sort_test.cpp -o selection_sort_test
./selection_sort_test
```

---

## Key Takeaways for Learners

1. **Same cost every time** — best-case = worst-case = O(n²). No "early termination" optimization applies because we must scan the unsorted tail to find each minimum.
2. **Minimum swaps** makes it niche-useful. If you're sorting records with huge values (or writing to flash memory), the n − 1 swap count matters more than the n² comparisons.
3. **Rarely the right answer.** For small arrays, Insertion Sort is faster (adaptive). For large arrays, O(n log n) sorts dominate. Selection Sort is a teaching tool first, a specialized tool second.
