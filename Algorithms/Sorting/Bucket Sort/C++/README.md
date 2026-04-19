# Bucket Sort — C++ Implementation

**Bucket Sort** distributes elements into `k` buckets based on value range, sorts each bucket (typically with Insertion Sort), then concatenates. Works brilliantly on uniformly-distributed data, degrades to O(n²) on adversarial distributions.

For the conceptual overview and comparison with Radix / Counting Sort, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `bucket_sort.cpp` | `bucketSort(std::vector<double>&)` implementation |
| `bucket_sort_test.cpp` | Assertion tests |

---

## Complexity

| Case | Time | Space |
|------|------|-------|
| Best | O(n + k) | O(n + k) |
| Average | **O(n + k)** (uniform distribution) | O(n + k) |
| Worst | O(n²) (all elements in one bucket) | O(n + k) |

`k` = number of buckets. Rule of thumb: `k = n` for uniform distribution gives O(n).

---

## C++-Specific Notes

- **`std::vector<std::vector<T>>` for buckets**: clean and efficient. Reserve capacity per bucket based on expected size to avoid growth overhead.
- **`std::sort` within each bucket**: the stdlib sort on short ranges (~16 elements) is essentially Insertion Sort, which is perfect here. Don't hand-roll the inner sort.
- **Float-heavy use cases**: Bucket Sort is most commonly taught with `double` inputs on [0, 1). For integers over a known range, **Counting Sort** is usually faster.
- **Distribution assumption matters**: the "average case" assumes uniform distribution. If your data clusters (e.g., exponential distribution), you get the worst case.

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall bucket_sort_test.cpp -o bucket_sort_test
./bucket_sort_test
```

---

## Key Takeaways for Learners

1. **Uniform distribution is the precondition.** Bucket Sort's O(n) bound assumes each bucket gets ≈ n/k elements. Cluster everything into one bucket and you're back to O(n²).
2. **Bucket size × bucket count trade-off.** More buckets → fewer per-bucket elements → faster inner sort but more overhead. Empirically, `k = n` is a sweet spot.
3. **Pairs naturally with hashing intuition.** A hash-partitioned bucket sort for non-uniform data is almost a distributed sort.
