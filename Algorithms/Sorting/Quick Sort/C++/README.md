# Quick Sort — C++ Implementation

**Quick Sort** picks a pivot, partitions the array into "less than pivot" and "greater than pivot", and recursively sorts each side. Average O(n log n), worst O(n²) — but with good pivot selection, worst case is vanishingly rare in practice.

For the conceptual overview, pivot strategies, and comparison with Merge Sort, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `quick_sort.cpp` | `quickSort(std::vector<int>&)` with Lomuto or Hoare partition |
| `quick_sort_test.cpp` | Assertion tests for sorted / reversed / random / duplicates |

---

## Complexity

| Case | Time | Space |
|------|------|-------|
| Best | O(n log n) | O(log n) |
| Average | O(n log n) | O(log n) |
| Worst | **O(n²)** | O(n) (unbalanced recursion) |

Worst case happens when every pivot is the min or max — e.g., already-sorted input with "first element" pivot strategy.

---

## C++-Specific Notes

- **`std::sort` is (almost certainly) IntroSort**: it starts as Quick Sort, switches to Heap Sort if recursion goes too deep, and uses Insertion Sort on small ranges. This hybrid avoids the O(n²) worst case while keeping Quick Sort's small constants.
- **Pivot selection matters.** "First element" is the textbook bug. Use median-of-three, a random pivot, or `std::nth_element` for median selection. `std::sort` uses median-of-three.
- **`std::partition`** does the partition step for you: `auto mid = std::partition(begin, end, pred)`. Use it for clean, iterator-based implementation.
- **Tail-call optimization via manual loop**: recurse into the smaller partition, loop into the larger one. Keeps recursion depth at O(log n) even on adversarial inputs.

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall quick_sort_test.cpp -o quick_sort_test
./quick_sort_test
```

---

## Key Takeaways for Learners

1. **`std::sort` already does Quick Sort better than you will.** Hand-rolling is for learning; in production, always use the stdlib.
2. **Pivot choice is the entire algorithm.** First-element on sorted input → O(n²). Random or median-of-three → O(n log n) with overwhelming probability.
3. **IntroSort is the production answer.** Quick Sort's speed + Heap Sort's worst-case guarantee + Insertion Sort's small-array efficiency. Reading the libstdc++ sort implementation is a good exercise.
