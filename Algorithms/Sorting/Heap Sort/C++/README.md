# Heap Sort — C++ Implementation

**Heap Sort** builds a max-heap from the input, then repeatedly extracts the maximum and moves it to the end. Guaranteed O(n log n), in-place, but **not stable**.

For the conceptual overview and comparison with Merge / Quick Sort, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `heap_sort.cpp` | `heapSort(std::vector<int>&)` — build + sift-down |
| `heap_sort_test.cpp` | Assertion tests for various array shapes |

---

## Complexity

| Case | Time | Space |
|------|------|-------|
| Best | O(n log n) | O(1) |
| Average | O(n log n) | O(1) |
| Worst | **O(n log n)** | O(1) — in place |

The build-heap step is O(n) (surprising but true via aggregate analysis), and n extractions at O(log n) each give O(n log n) total.

---

## C++-Specific Notes

- **`std::make_heap` + `std::pop_heap`** in `<algorithm>` do the work for you. A two-line Heap Sort using them is idiomatic and optimal.
- **`std::priority_queue<T>` is a max-heap wrapper**: for a priority queue you'd use it directly, but for sorting we want the underlying array so use the free `make_heap` / `pop_heap` functions.
- **Not stable**: unlike Merge Sort, equal elements can swap relative order. If stability matters, use `std::stable_sort`.
- **Sift-down beats sift-up** for the build-heap phase: O(n) total instead of O(n log n). Most textbook implementations get this right; verify yours.

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall heap_sort_test.cpp -o heap_sort_test
./heap_sort_test
```

---

## Key Takeaways for Learners

1. **Build-heap is O(n), not O(n log n).** The aggregate analysis — summing the work at each level weighted by how many nodes live there — gives O(n). Counter-intuitive but foundational.
2. **In-place is the killer feature.** Heap Sort uses O(1) extra space, unlike Merge Sort's O(n). For memory-constrained systems, that's decisive.
3. **Worst-case O(n log n) without randomization** makes Heap Sort the fallback in IntroSort: if Quick Sort's recursion gets too deep, switch to Heap Sort to guarantee the bound.
