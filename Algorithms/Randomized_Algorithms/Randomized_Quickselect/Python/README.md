# Randomized Quickselect -- Python Implementation

The k-th smallest element in O(n) expected time, using a three-way partition and a random pivot. For the idea, the trace and the complexity argument see the [topic README](../README.md).

## Files

- `quickselect.py` - `quickselect`, `top_k_smallest` and the private partition.
- `quickselect_test.py` - 17 tests: ranks, duplicates, sorted and reverse-sorted input, a random cross-check against `sorted()`, error cases and large duplicate-heavy inputs.

## API

- `quickselect(arr, k, rng=None)` - the k-th smallest element, 0-indexed. Reorders `arr` in place. Raises `ValueError` if `arr` is empty and `IndexError` if `k` is out of range.
- `top_k_smallest(arr, k, rng=None)` - the k smallest elements, unordered, from a copy. Returns `[]` for `k <= 0` and a copy of everything for `k >= len(arr)`.

## Python-Specific Notes

- The loop is iterative (`while lo < hi`); Python does not eliminate tail calls, so this avoids recursion limits.
- `rng.randint(lo, hi)` is inclusive on both ends, which matches the inclusive bounds of the partition.
- Pass a `random.Random(seed)` for reproducible tests; without it the module-level `random` is used.
- The three-way partition makes all-equal input linear. A strict two-way partition would be quadratic there.
- `heapq.nsmallest` is better when `k` is much smaller than `n` (O(n log k)); Quickselect wins for a rank near the middle.

## How to Run

From this folder:

```bash
python3 -m unittest quickselect_test
python3 quickselect.py
```

## Key Takeaways

- Keep only the side that contains `k`; that is the whole difference from Quick Sort.
- A random pivot makes the expected time linear for every input.
- Three bands (`<`, `==`, `>`) keep duplicates from causing quadratic time.
