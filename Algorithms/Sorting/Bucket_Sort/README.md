# Bucket Sort

Bucket Sort distributes values into buckets by magnitude, sorts each bucket, and concatenates the buckets. For numbers spread evenly over a known range it runs in O(n + k) time (O(n) with k about n); a crowded bucket pushes it towards O(n^2).

## Intuition

Sorting a pile of exam papers by score: first drop each paper into a pile for its score range (0-9, 10-19, ...), then sort each small pile by hand, then stack the piles in order. The expensive sorting only ever happens inside small piles.

Invariant: the bucket index never decreases as the value grows, so every value in bucket `b` is no larger than every value in bucket `b + 1`. Sorting inside each bucket therefore finishes the global sort.

This repository sorts values in `[0.0, 1.0]` with `n` buckets: `x` goes to bucket `floor(x * n)`, and `1.0` goes to the last bucket.

## Visual

```text
input:  0.78 0.17 0.39 0.26 0.72 0.94 0.21 0.12 0.23 0.68      (n = 10)

bucket 0 |
bucket 1 | 0.17 0.12            -> 0.12 0.17
bucket 2 | 0.26 0.21 0.23       -> 0.21 0.23 0.26
bucket 3 | 0.39
bucket 4 |
bucket 5 |
bucket 6 | 0.68
bucket 7 | 0.78 0.72            -> 0.72 0.78
bucket 8 |
bucket 9 | 0.94

output: 0.12 0.17 0.21 0.23 0.26 0.39 0.68 0.72 0.78 0.94
```

## How It Works

1. Check that every value is in `[0.0, 1.0]` (otherwise raise or panic: such a value has no bucket).
2. Create `n` empty buckets.
3. Append each value to bucket `min(floor(x * n), n - 1)`.
4. Sort each bucket (insertion sort in Python, the library sort in C++ and Go).
5. Read the buckets in order into the output.

## Step-by-Step Trace

The input of the Visual section, bucket by bucket:

| Bucket | Range | Arrival order | After sorting |
|--------|-------|---------------|---------------|
| 1 | [0.1, 0.2) | 0.17, 0.12 | 0.12, 0.17 |
| 2 | [0.2, 0.3) | 0.26, 0.21, 0.23 | 0.21, 0.23, 0.26 |
| 3 | [0.3, 0.4) | 0.39 | 0.39 |
| 6 | [0.6, 0.7) | 0.68 | 0.68 |
| 7 | [0.7, 0.8) | 0.78, 0.72 | 0.72, 0.78 |
| 9 | [0.9, 1.0] | 0.94 | 0.94 |

Buckets 0, 4, 5 and 8 are empty. No bucket has more than three values.

## Complexity

| Case | Time | Space | When |
|------|------|-------|------|
| Best | O(n + k) | O(n + k) | every bucket holds a few values |
| Average | O(n + k) | O(n + k) | uniform input, k about n |
| Worst | O(n^2) | O(n + k) | all values in one bucket (Python: one insertion sort) |

`k` is the number of buckets. Distributing and concatenating cost O(n + k). If bucket `i` has `n_i` values and is insertion-sorted, the sorting step costs the sum of `n_i^2`, which is O(n) when every `n_i` is a constant. C++ and Go sort buckets with a library sort, so their worst case is O(n log n) instead.

## When to Use

Use it for real numbers (or integers) with a known range and roughly uniform spread, and when the buckets can be handled in parallel or on separate machines. Avoid it for clustered data, for unknown ranges (without scaling first) and when memory is tight.

## Bucket Sort vs. Alternatives

| Algorithm | Average | Worst | Stable | Needs |
|-----------|---------|-------|--------|-------|
| Bucket Sort | O(n + k) | O(n^2) | depends on the inner sort | known range, even spread |
| [Counting Sort](../Counting_Sort/README.md) | O(n + k) | O(n + k) | Yes | small integer range |
| [Radix Sort](../Radix_Sort/README.md) | O(d (n + b)) | O(d (n + b)) | Yes | bounded digit count |
| [Quick Sort](../Quick_Sort/README.md) | O(n log n) | O(n^2) | No | only comparisons |

## Common Pitfalls

- Forgetting `1.0`: `floor(1.0 * n)` is `n`, one past the last bucket, so it must be clamped.
- Values outside `[0, 1]`: a negative value gives a negative index and a value above 1 gives an index past the end. The implementations here reject them (`ValueError`, `std::invalid_argument`, panic); scale the data first with `(x - min) / (max - min)` if you need other ranges.
- Assuming linear time on skewed data.
- Assuming stability: only the Python version (insertion sort) is stable; C++ and Go use unstable library sorts.
- `bucket_sort_integers` (Python) allocates `max - min + 1` lists, so a huge range exhausts memory.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `bucket_sort.py` | `bucket_sort(arr, num_buckets=None)` returns a new list; `bucket_sort_integers` (one bucket per value, i.e. Counting Sort with lists, negatives allowed) |
| C++ | [C++](C++/) | `bucket_sort.cpp` | `bucketSort(std::vector<double>&)`, in place, `n` buckets, `std::sort` inside buckets, throws on bad input |
| Go | [Go](Go/) | `main.go` | `BucketSort([]float64)`, in place, `n` buckets, `sort.Float64s` inside buckets, panics on bad input |

## Practice Problems

- [Sort Characters By Frequency (LeetCode 451)](https://leetcode.com/problems/sort-characters-by-frequency/)
- [Top K Frequent Elements (LeetCode 347)](https://leetcode.com/problems/top-k-frequent-elements/)
- [H-Index (LeetCode 274)](https://leetcode.com/problems/h-index/)
- [Maximum Gap (LeetCode 164)](https://leetcode.com/problems/maximum-gap/)
- [Contains Duplicate III (LeetCode 220)](https://leetcode.com/problems/contains-duplicate-iii/)

## Related

- [Counting Sort](../Counting_Sort/README.md)
- [Radix Sort](../Radix_Sort/README.md)
- [Insertion Sort](../Insertion_Sort/README.md)
- [Quick Sort](../Quick_Sort/README.md)
