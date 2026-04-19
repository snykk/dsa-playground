# Insertion Sort — C++ Implementation

**Insertion Sort** builds the sorted portion one element at a time, shifting larger values right to make room for the new element. O(n²) in the general case, but O(n) on already-sorted (or nearly-sorted) input — which makes it the fastest sort for very small or mostly-sorted arrays.

For the conceptual overview and comparison with other quadratic sorts, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `insertion_sort.cpp` | `insertionSort(std::vector<int>&)` implementation |
| `insertion_sort_test.cpp` | Assertion tests |

---

## Complexity

| Case | Time | Space |
|------|------|-------|
| Best | **O(n)** | O(1) — already sorted |
| Average | O(n²) | O(1) |
| Worst | O(n²) | O(1) — reverse sorted |

---

## C++-Specific Notes

- **`std::sort` uses Insertion Sort internally** on subranges below a threshold (~16 elements in libstdc++). That's why IntroSort is fast on small arrays.
- **`std::rotate` + `std::upper_bound`** gives a clean "binary-search the insertion point, rotate into place" variant. It's O(log n) comparisons but still O(n) moves per insert.
- **In place, stable, adaptive**: preserves equal-element order, O(1) auxiliary space, O(n) on sorted input. Rare combination.
- **Use in hybrid sorts**: IntroSort + TimSort both delegate to Insertion Sort on short ranges. Worth implementing once to understand why.

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall insertion_sort_test.cpp -o insertion_sort_test
./insertion_sort_test
```

---

## Key Takeaways for Learners

1. **Adaptive sorts win on nearly-sorted input.** O(n) for sorted, O(n + inversions) in general. If your data is usually "close to sorted", Insertion Sort beats Merge Sort on small-to-medium sizes.
2. **Hybrid sorts choose it for small n.** Modern `std::sort` switches to Insertion Sort below ~16 elements. Understanding why is understanding cache locality and constant factors.
3. **Stable + in-place + adaptive = the Swiss army knife.** None of the O(n log n) sorts have all three. Insertion Sort does — at the cost of O(n²).
