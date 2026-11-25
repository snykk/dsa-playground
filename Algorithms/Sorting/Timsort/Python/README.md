# Timsort -- Python Implementation

## Files

- `timsort.py`: `timsort`, its helpers (`compute_minrun`, `count_run`, `reverse_range`, `binary_insertion_sort`, `gallop_left`, `gallop_right`, `merge_at`, `merge_lo`, `merge_hi`, `merge_collapse`, `merge_force_collapse`), `MergeState`, `invariants_hold`, `MIN_GALLOP`, and a demo.
- `timsort_test.py`: unit tests (minrun against CPython's rule for every `n` below 70,000, runs, binary insertion, the gallop searches against `bisect` and their cost, 1,500 random and 140 structured lists against `sorted()` with a payload to check stability, galloping on and off, `n - 1` comparisons on sorted and strictly descending input, the stack invariants after every collapse, the 2015 example, merges, `min_gallop`, the counts of 40 lists pinned for C++ and Go, and the same comparison count as `list.sort()` on CPython up to 3.10).

## API

- `timsort(arr, gallop=True, minrun=0)`: sorts `arr` in place, stably, and returns the same list. `gallop=False` turns galloping mode off inside merges; `minrun=0` computes minrun from `len(arr)`, a positive value replaces it.
- `compute_minrun(n)`: `n` below 64, else 32 to 64.
- `count_run(arr, lo, hi)`: `(length, descending)` of the run starting at `lo`.
- `binary_insertion_sort(arr, lo, hi, start)`: sorts `arr[lo:hi]` given that `arr[lo:start]` is sorted.
- `gallop_left(key, a, base, n, hint)`, `gallop_right(key, a, base, n, hint)`: where `key` goes in the sorted `a[base:base + n]`, left or right of equal elements, by exponential search from `hint`.
- `MergeState(arr, gallop=True)`: `arr`, `pending` (a list of `(base, length)` runs, bottom first), `min_gallop` and `gallop`. `merge_at(ms, i)` merges the runs at stack positions `i` and `i + 1`; `merge_collapse(ms)` and `merge_force_collapse(ms)` work on the stack.
- `invariants_hold(lengths)`: whether run lengths, bottom first, satisfy `X > Y + Z` and `Y > Z`.

```python
from timsort import timsort

print(timsort([43, 37, 31, 24, 15, 9, 12, 40, 6, 28, 2, 5], minrun=4))
# [2, 5, 6, 9, 12, 15, 24, 28, 31, 37, 40, 43]
```

## Python-Specific Notes

- Works on any items that support `<`; it is the only comparison the code makes, as in CPython. Items that cannot be compared raise `TypeError`, and a negative `minrun` raises `ValueError`.
- `timsort` looks up `merge_collapse`, `merge_at` and the other helpers as module globals on every call, so the tests replace them with wrappers that record the stack after every collapse and check the invariants.
- The temporary copy is a slice (`arr[base_a:base_a + na]`), and the block moves are slice assignments, which copy the right-hand side first, so overlapping moves are safe.
- In `merge_hi` the index `a` of A's last element can reach `base_a - 1` once A is empty; it is never read after that (Python would read `arr[-1]`).
- If a comparison raises, the exception propagates and the list may have lost some elements and duplicated others; `list.sort()` restores them. Python 3.9 and later. For real code use `sorted()` or `list.sort()`.

## How to Run

```bash
python3 -m unittest timsort_test
python3 timsort.py   # minrun for a few n, and a sort with minrun 4
```

## Key Takeaways

- A natural run costs one comparison per element to find; sorted input costs `n - 1` comparisons in all.
- The stack invariants keep merges balanced; the 2015 fix checks the run below A too.
- Wrapping `<` is how every count in the README was measured.
