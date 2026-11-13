# Hash Set

A hash set stores each distinct element once and tests membership in O(1) on average. It is a hash table that keeps only keys, so it is the standard tool for removing duplicates and for "have I seen this?" checks.

## Intuition

Hash the element to pick a bucket, then look only in that bucket. Because the set never stores a value, `add` can report whether the element was new, which is the whole duplicate-detection trick. A chain of at most a few elements per bucket (guaranteed on average by resizing at load 0.75) keeps every operation constant.

Invariant: an element lives in bucket `hash(x) mod capacity`, and no element appears twice.

## Visual

```text
elements 10, 14, 18, 3, 7 in 8 buckets (element mod 8):

  bucket 0: -
  bucket 1: -
  bucket 2: 10 -> 18        (collision)
  bucket 3: 3
  bucket 4: -
  bucket 5: -
  bucket 6: 14
  bucket 7: 7
```

## Operations

| Operation | Description | Time |
|-----------|-------------|------|
| `add(x)` | insert if absent; returns whether it was new; resize at load > 0.75 | O(1) average, amortized |
| `remove(x)` | delete if present; returns whether it was there | O(1) average |
| `contains(x)` | membership test | O(1) average |
| size, is empty, clear | bookkeeping | O(1) |
| `to_list`, iteration (Python) | all elements, bucket by bucket | O(capacity + n) |

Per language: Python has `add`, `remove`, `contains`, `clear`, `is_empty`, `to_list`, `in`, `len`, iteration, `repr`. C++ has `add`, `remove`, `contains`, `getSize`, `bucketCount`, `isEmpty`, `clear`. Go has `Add`, `Remove`, `Contains`, `Size`, `IsEmpty`, `Clear`. Only Python iterates; none of them has union, intersection or difference.

Capacity must be positive: Python raises `ValueError`, C++ throws `std::invalid_argument`, Go uses 16.

## Step-by-Step Trace

Python `HashSet(4)`:

| Call | Returns | Buckets after | Note |
|------|---------|---------------|------|
| `add(10)`, `add(14)`, `add(18)` | True | 2: [10, 14, 18] | all `mod 4 = 2`; load 0.75 |
| `add(3)` | True | 2: [10, 18], 3: [3], 6: [14] | load 4/4 > 0.75: 8 buckets, rehash with mod 8 |
| `add(7)` | True | adds 7: [7] | |
| `add(14)` | False | unchanged | already present |
| `remove(18)` | True | 2: [10] | |
| `contains(18)` | False | | |

## Complexity

| Operation | Average | Worst |
|-----------|---------|-------|
| add | O(1) amortized | O(n) |
| contains, remove | O(1) | O(n) |
| iterate | O(capacity + n) | O(capacity + n) |

Resizing doubles the bucket count, so all resizes over n adds cost less than 2n in total. The average chain is at most 0.75, so a lookup compares a constant number of elements. Space is O(n + capacity). Worst case needs all elements in one bucket.

## When to Use

- Duplicate detection, visited sets, membership filters, two-sum style complements.
- Not when you need order, ranges or the minimum (use a tree set), or when memory is tight for a huge set (consider a Bloom filter).

## Hash Set vs. Alternatives

| Structure | Contains | Add | Notes |
|-----------|----------|-----|-------|
| Hash set | O(1) average | O(1) amortized | no order |
| Tree set | O(log n) | O(log n) | sorted, ranges |
| Sorted array | O(log n) | O(n) | compact, static data |
| Bloom filter | O(k) | O(k) | approximate, tiny memory |

## Common Pitfalls

- Expecting an order: iteration follows buckets and changes after a resize.
- Mutating an element after adding it.
- Capacity 0 (divide by zero).
- Assuming O(1) without a resize: the C++ and Go versions used to ignore the load factor; they now resize like Python.
- Go: a non-comparable element (a slice) panics; negative ints and other comparable types work.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [`Python/`](Python/) | `hash_set.py` | list buckets, iteration, `repr` |
| C++ | [`C++/`](C++/) | `hash_set.cpp` | `HashSet<K>` over `std::list<K>`; resize splices nodes |
| Go | [`Go/`](Go/) | `main.go` | `[]interface{}` buckets; any comparable key |

## Practice Problems

- [LeetCode 217 - Contains Duplicate](https://leetcode.com/problems/contains-duplicate/)
- [LeetCode 705 - Design HashSet](https://leetcode.com/problems/design-hashset/)
- [LeetCode 349 - Intersection of Two Arrays](https://leetcode.com/problems/intersection-of-two-arrays/)
- [LeetCode 128 - Longest Consecutive Sequence](https://leetcode.com/problems/longest-consecutive-sequence/)

## Related

- [Hash Table](../Hash_Table/README.md)
- [Bloom Filter](../Bloom_Filter/README.md)
- [Collision Handling](../Collision_Handling/README.md)
- [Hashing overview](../README.md)
