# Merge Sort — C++ Implementation

**Merge Sort** is the canonical divide-and-conquer sort: split the array in half, recursively sort each half, then merge the two sorted halves in linear time. Guaranteed O(n log n) in every case.

For the conceptual overview, recurrence analysis, and comparison with Quick Sort, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `merge_sort.cpp` | `mergeSort(std::vector<int>&)` implementation |
| `merge_sort_test.cpp` | Assertion-based tests |

---

## Complexity

| Case | Time | Space |
|------|------|-------|
| Best | O(n log n) | O(n) |
| Average | O(n log n) | O(n) |
| Worst | **O(n log n)** | O(n) |

The O(n) space is the auxiliary buffer for merging — you can't merge in place without giving up time or stability.

---

## C++-Specific Notes

- **`std::stable_sort` is effectively Merge Sort.** The stdlib implementation uses a merge-sort-family algorithm. Prefer it for production code; hand-rolling is educational.
- **`std::inplace_merge` from `<algorithm>`** performs the merge step for you. A one-line merge using it is both correct and efficient.
- **Buffer reuse**: allocate a single `std::vector<int>` at the top level and pass it through recursive calls. Saves O(log n) allocations.
- **Recursion depth is O(log n)** — never a stack concern.

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall merge_sort_test.cpp -o merge_sort_test
./merge_sort_test
```

---

## Key Takeaways for Learners

1. **O(n log n) with no bad case.** Unlike Quick Sort, Merge Sort has no input that makes it quadratic. Trade-off: O(n) auxiliary space.
2. **Merge Sort is naturally stable.** Equal elements keep their original order — critical when sorting records by a secondary key.
3. **The merge step _is_ the algorithm.** Understand two-pointer merge of two sorted arrays in O(n + m), and Merge Sort is just recursion around that primitive.
