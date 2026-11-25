# Timsort

Timsort is a stable merge sort that uses the order already present in the data. It splits the array into natural runs (stretches that already ascend, or strictly descend and get reversed), extends short runs to a minimum length with binary insertion sort, and merges neighbouring runs from a stack whose length rules keep it O(log n) runs deep. When one run keeps winning during a merge, it gallops: an exponential search moves a whole block at once. It makes `n - 1` comparisons on sorted or strictly descending input, O(n log n) in the worst case, and needs O(n) extra space. This implementation follows the design of CPython's `list.sort()` as described in CPython's `Objects/listsort.txt`.

## Intuition

Plain Merge Sort splits the array in the middle whatever the data looks like, so a sorted array costs it as much as a random one. Real data is often partly sorted: a sorted list with a few new items appended, two sorted lists glued together, a log in nearly increasing time order. Timsort reads the array from left to right and takes the sorted stretches as they come, so an array that is already one run costs a single scan.

Three ideas make it fast and keep it O(n log n):

- **Runs of at least `minrun` elements.** Random data has short runs, so a run shorter than `minrun` (32 to 64 for 64 elements or more) is extended with binary insertion sort, which is fast on short arrays.
- **A shallow stack of runs.** Runs are pushed on a stack and merged only with a neighbour, which keeps the sort stable. The lengths on the stack must satisfy, for every three neighbouring runs X, Y, Z (Z nearest the top), `X > Y + Z` and `Y > Z`. Read from the top down, the lengths then grow at least as fast as the Fibonacci numbers, so the stack holds O(log n) runs. On random data, where every run but the last has `minrun` elements, almost every merge joins two runs of the same length: all 63 merges for `n = 2,112`, and all but 8 of the 2,040 for `n = 100,000`.
- **Galloping.** If one run wins `min_gallop` times in a row during a merge (7 at the start), the data is probably clustered, so the merge stops comparing one pair at a time and searches for where the other run's head belongs.

Invariant: the runs on the stack lie side by side from index 0, each one sorted. A merge replaces two neighbouring runs by one sorted run, so when the stack holds a single run that covers the array, the array is sorted.

## Visual

The worked example below, with `minrun = 4` so that a short array has several runs (the function computes `minrun = n` below 64 elements, which would make it one binary insertion sort):

```text
input     43 37 31 24 15  9 | 12 40  6 28 |  2  5 18 20 33 35 46 | 44 39 30 26 21 14  3
          strictly descending  run of 2,     ascending, 7          strictly descending, 7
          6, reversed          + 2 inserted                        reversed
runs       9 15 24 31 37 43 |  6 12 28 40 |  2  5 18 20 33 35 46 |  3 14 21 26 30 39 44

stack (bottom ... top) after each push, and what the push triggers:
  push 6    [6]
  push 4    [6, 4]       6 > 4: keep
  push 7    [6, 4, 7]    A = 6 <= B + C = 4 + 7: merge B with the smaller of A and C,
                         here A                                     -> [10, 7]
  push 7    [10, 7, 7]   A = 10 <= B + C = 14, and C = 7 <= A: merge B and C
                                                                    -> [10, 14]
                         B = 10 <= C = 14: merge B and C            -> [24]
```

## How It Works

1. **minrun.** `compute_minrun(n)`: below 64, `minrun = n`. From 64 on, take the six most significant bits of `n` and add 1 if any of the remaining bits is set. The result lies in 32..64 and `n / minrun` is a power of 2 or a little below one, so random data splits into a power-of-2 number of equal runs and the merges stay balanced to the end.
2. **Find the next run** (`count_run`). Compare `a[lo + 1]` with `a[lo]`. If it is strictly smaller, the run is strictly descending and goes on while each element is strictly smaller than the one before; otherwise it is non-descending and goes on while no element is smaller than the one before.
3. **Reverse a descending run** in place. It is strictly descending, so it holds no two equal elements and reversing it cannot reorder equal keys.
4. **Extend a short run** to `min(minrun, elements left)` with binary insertion sort: each new element is placed by a binary search over the sorted part (equal elements stay to its left), then the larger ones shift right.
5. **Push the run and collapse** (`merge_collapse`). With C the top run and B, A and W below it, repeat:
   - if `A <= B + C` or `W <= A + B`: merge B with the smaller of A and C (with C on a tie);
   - else if `B <= C`: merge B and C;
   - else stop: the invariants hold.
6. **Merge two neighbouring runs** (`merge_at`). First trim: `gallop_right` finds the elements at the start of A that are not greater than `B[0]`, and `gallop_left` the elements at the end of B that are not less than `A[-1]`. They are already in place. Then copy the smaller of what is left to a temporary list and merge: `merge_lo` from the left when A is smaller, `merge_hi` from the right when B is.
7. **Gallop** inside a merge. Count how many times in a row each run has won. When a count reaches `min_gallop`, switch to galloping: find with `gallop_right` how many elements of A go before B's head and move them as one block, move B's head, find with `gallop_left` how many elements of B go before A's head and move them, move A's head, and repeat. Stay while either block has at least `MIN_GALLOP = 7` elements. Each round in galloping mode lowers `min_gallop` by 1 (not below 1), and leaving galloping mode raises it by 1, so it follows the data.
8. **At the end** (`merge_force_collapse`), merge what is left on the stack, top first (B with A when A is smaller than C).

### Why four runs are checked

Before 2015 the stack check looked only at A, B and C. In 2015 Stijn de Gouw and others, trying to prove Java's TimSort correct with the KeY verifier, found that this does not keep the invariant for the whole stack. Runs of 240, 160, 50, 40 and 60 show it (the tests build this input; `n = 550` gives `minrun = 35`, so the runs stay as they are):

| Step | Stack | Rule |
|------|-------|------|
| push 60 | 240, 160, 50, 40, 60 | A = 50 <= B + C = 100, A < C: merge A and B |
| | 240, 160, 90, 60 | A = 160 > B + C = 150 and B = 90 > C = 60 |
| three-run check | stops here | but 240 <= 160 + 90 = 250: the invariant is broken below the top |
| four-run check | W = 240 <= A + B = 250 | merges on: 240, 160, 150, then 240, 310, then 550 |

Merging A and B made the run third from the top longer, and the run under it was never tested again. Without the invariant the Fibonacci bound on the stack height no longer holds, so a stack sized for it can overflow: Java's version could crash on crafted input. CPython's stack has 85 slots (`MAX_MERGE_PENDING`), and Tim Peters noted on the bug report that no existing machine has enough memory for an input that overflows it; CPython took the fix anyway in February 2015 (bpo-23515), and this code uses it. The tests check the invariants on the whole stack after every collapse in all three languages.

### Galloping

`gallop_left(key, a, base, n, hint)` returns where `key` belongs in a sorted run, to the left of equal elements; `gallop_right` to the right of them. Both start at `hint`, probe offsets 1, 3, 7, 15, ... (exponential search) and binary-search the last gap. From hint 0, a position `i >= 1` costs `2 floor(log2(i)) + 2` comparisons, which the tests check for every `i` below 2048; a linear scan costs `i + 1`. The search loses to the scan at `i = 2` and `i = 4` and wins from `i = 6` on, so the merge only starts galloping after a streak of wins.

Which side equal keys fall on is what keeps galloping stable: in `merge_lo`, the block of A before B's head ends after A's elements equal to it (`gallop_right`), and the block of B before A's head stops before B's elements equal to it (`gallop_left`). Swapping the two made 245 of 400 random test sorts unstable.

### What is the same as CPython, and what is simplified

The same as CPython from the 2015 fix through 3.10 (the sources of 3.5, 3.9 and 3.10 have the same rules): the run detection, `compute_minrun`, the corrected `merge_collapse`, `merge_force_collapse`, the trimming in `merge_at`, `merge_lo` and `merge_hi` (including the first and last element placed without a comparison), `gallop_left`, `gallop_right`, `MIN_GALLOP = 7` and the adaptive `min_gallop`. On Python 3.9.6, `list.sort()` made the same number of comparisons as this code and put equal keys in the same order on all 3,000 test inputs tried, of up to 5,000 elements; a test repeats the check on CPython up to 3.10 and is skipped on newer versions.

Newer CPython differs: 3.11 replaced `merge_collapse` by the powersort merge policy, 3.13 also takes non-strict descending runs (it reverses their equal stretches to stay stable), and 3.15 computes `minrun` per run.

Simplified here:

- No `key=` function and no key caching (CPython keeps the keys in a parallel array), and no `reverse=`.
- No type-specialized comparisons (CPython picks a faster compare when every element has the same type, for example a `float`, a small `int` or a one-byte-per-character `str`).
- The temporary copy is a new list in Python and a reused buffer in C++ and Go; CPython keeps a small buffer on the stack and grows a heap buffer.
- No exception safety. If a comparison raises, CPython puts the temporary copy back, so the list keeps every element. Here the list can be left with elements missing and others duplicated: in a test with a comparison that raised at a random call, that happened in 64 of 247 sorts.
- The `gallop` switch (galloping mode on or off) and the `minrun` override exist for teaching and measuring; CPython has neither.

## Step-by-Step Trace

The input of the Visual section, `minrun = 4`. Comparisons as counted on the Python code (70 in all):

| Step | What happens | Stack after | Comparisons |
|------|--------------|-------------|-------------|
| 1 | Run at 0: `43 37 31 24 15 9` is strictly descending (12 >= 9 ends it); reversed to `9 15 24 31 37 43` | 6 | 6 |
| 2 | Run at 6: `12 40` (6 < 40 ends it), length 2 < 4: binary insertion adds 6 and 28: `6 12 28 40` | 6, 4 | 2 + 4 |
| 3 | Run at 10: `2 5 18 20 33 35 46` ascending (44 < 46 ends it). A = 6 <= 4 + 7 and A < C: merge the first two runs. Trimming keeps nothing in place (1 + 1); B is the smaller, so `merge_hi` copies `6 12 28 40` and merges from the right (7) | 10, 7 | 7 + 9 |
| 4 | Run at 17: `44 39 30 26 21 14 3`, strictly descending to the end; reversed. A = 10 <= 7 + 7 and C <= A: merge B and C. Trimming finds `2` in place at the front (2 + 1); `merge_lo` copies the 6 values left of A and merges from the left (9) | 10, 14 | 6 + 12 |
| 5 | B = 10 <= C = 14: merge them. Trimming finds `44 46` in place at the end (1 + 4); `merge_lo` merges 10 and 12 values (19) | 24 | 24 |

No merge here wins 7 times in a row, so nothing gallops. The visualization's **Galloping** example does: two runs of 11 and 13, `2 3 7 10 12 14 17 22 23 57 58` and `5 6 26 27 33 34 35 37 45 47 49 50 54`. Trimming finds `2 3` already in place at the front and nothing at the end; after B's 5 and 6, A wins 7 times in a row (7 to 23), then `gallop_left` finds in 5 comparisons that 10 values of B (27 to 54) go before 57 and moves them as one block. The sort makes 42 comparisons, 47 with galloping off.

## Complexity

| Case | Time | Space | When |
|------|------|-------|------|
| Best | O(n) | O(1) | sorted or strictly descending input: one run, `n - 1` comparisons, no merge |
| Few runs | O(n + n log r) | O(n) | `r` runs: proven for this merge policy (below) |
| Worst | O(n log n) | O(n) | e.g. random input |

- **Why O(n log n).** Every run but the last has at least `minrun` elements, and the invariants make the lengths on the stack grow like Fibonacci numbers, so the stack holds O(log n) runs. Auger, Juge, Nicaud and Pivoteau proved in 2018 that this version of Timsort runs in O(n log n), and in O(n + n log r) for `r` runs.
- **Space.** The temporary copy holds the smaller of two runs, at most `n / 2` elements, and the stack O(log n) runs. Binary insertion and the run reversal work in place.
- **Comparisons on random input,** counted on the Python code, averaged over 5 random permutations per size:

| n | Comparisons | / (n log2 n) | / log2(n!) |
|---|-------------|--------------|------------|
| 1,000 | 8,637 | 0.867 | 1.013 |
| 10,000 | 119,897 | 0.902 | 1.012 |
| 100,000 | 1,529,170 | 0.921 | 1.008 |

`log2(n!)` is the fewest comparisons any comparison sort can need on average, and these counts stay within 1.3% of it.

**By input shape,** `n = 100,000` (`minrun = 49`), the mean of 5 inputs per shape. Merge Sort is the repository's top-down version.

| Input | Runs found | Comparisons | Galloping off | Merge Sort |
|-------|------------|-------------|---------------|------------|
| random permutation | 2,041 | 1,529,193 | 1,529,219 | 1,536,427 |
| sorted | 1 | 99,999 | 99,999 | 815,024 |
| reversed | 1 | 99,999 | 99,999 | 853,904 |
| four sorted quarters of a random permutation | 4 | 299,996 | 299,994 | 915,015 |
| sawtooth, `i mod 100` | 1,000 | 595,504 | 1,089,932 | 1,356,948 |
| organ pipe: `0 .. n/2 - 1`, then `n/2` down to 1 | 2 | 199,999 | 199,999 | 884,462 |
| long runs: `0 .. n - 1` cut into 20 blocks at random, blocks shuffled | 9.6 | 100,861 | 335,642 | 957,561 |

What the counts show, and no more:

- Sorted and reversed input cost exactly `n - 1` comparisons, which the tests check for many `n` in all three languages.
- Galloping cut the comparisons by 70% on the long runs, whose blocks do not interleave, and by 45% on the sawtooth, whose merged runs hold long stretches of equal keys.
- On the random, four-quarter and organ-pipe inputs, whose runs interleave finely, galloping changed the count by less than 0.01%, in either direction.
- On every shape the counts were at most Merge Sort's, and on the structured ones far below it.

## When to Use

Use it when:

- the sort must be stable, as when sorting records by one key after another;
- the data is often partly sorted: appended items, concatenated sorted lists, nearly ordered logs;
- comparisons are expensive (Python objects, strings, user-defined orders), since it makes close to the fewest comparisons possible on random input and far fewer on ordered input.

Do not use it when:

- memory is tight: it needs up to `n / 2` extra elements; Heap Sort works in place;
- the keys are small integers in a known range: Counting Sort or Radix Sort skip comparisons altogether;
- you are writing real code: `sorted()` and `list.sort()` in Python, `std::stable_sort` in C++ and `slices.SortStableFunc` in Go are tested and tuned.

## Timsort vs. Alternatives

| Algorithm | Best | Worst | Extra space | Stable | Notes |
|-----------|------|-------|-------------|--------|-------|
| Timsort | O(n) | O(n log n) | O(n) | Yes | adapts to runs; galloping on clustered data |
| [Merge Sort](../Merge_Sort/README.md) | O(n log n) | O(n log n) | O(n) | Yes | same work on sorted and random input |
| [Insertion Sort](../Insertion_Sort/README.md) | O(n) | O(n^2) | O(1) | Yes | what Timsort uses (with binary search) for short runs |
| [Quick Sort](../Quick_Sort/README.md) | O(n log n) | O(n^2) | O(log n) | No | in place and fast in memory |
| [Heap Sort](../Heap_Sort/README.md) | O(n log n) | O(n log n) | O(log n) here | No | in place with a guaranteed bound |

## Common Pitfalls

- **Treating equal neighbours as part of a descending run.** Reversing `[3, 2a, 2b]` gives `[2b, 2a, 3]`. A descending run must be strictly descending; with `>=` instead, 343 of 400 random test sorts came out unstable.
- **Checking only the top three runs.** The invariant can then break further down the stack (see Why four runs are checked).
- **Merging runs that are not neighbours.** Merging A with C before B would move an element of C ahead of an equal one in B. Merge B with A or with C, never A with C.
- **Ties on the wrong side.** `merge_lo` takes A's element on a tie and `merge_hi` takes B's, because `merge_hi` fills from the right. Giving ties to A in `merge_hi` made 349 of 400 random test sorts unstable, and swapping `gallop_right` and `gallop_left` 245 of 400.
- **Rounding minrun down.** Taking only the top six bits of `n` gives 32 for `n = 2112`, so random data splits into 66 runs of 32 and the last merge joins 2,048 elements with 64. The `+ 1` gives 33 and 64 balanced runs: 20,570 comparisons on average against 20,876 on 20 random permutations.
- **Unsigned indices in C++.** In `merge_hi` the index of A's last element steps below `base_a` once A is empty; with `size_t` it wraps around. The C++ code never reads it again, but a test such as `a >= base_a` would always be true.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `timsort.py` | `timsort(arr, gallop=True, minrun=0)`; the helpers are module functions the tests wrap; any items with `<`; `ValueError` for a negative `minrun` |
| C++ | [C++](C++/) | `timsort.cpp` | template `timsort(arr, gallop = true, minrun = 0, afterCollapse = nullptr)` over `std::vector<T>` (`T` needs `operator<`); the hook sees the stack after every collapse |
| Go | [Go](Go/) | `main.go` | `Timsort([]int)`, `TimsortFunc` with a `less` function, `TimsortWith` with `Options{NoGallop, MinRun, AfterCollapse}`; panics on a negative `MinRun` |

All three compare only with `<` (Go's `less(a, b)`), in the same order, so they make the same comparisons: the C++ and Go tests pin the counts of 40 arrays, with galloping on and off, to the Python outputs. Fewer than 2 elements cost no comparison. A `minrun` of 0 means the computed value; a positive one replaces it, and a value of `n` or more sorts the whole array by binary insertion.

## Practice Problems

- [Longest Continuous Increasing Subsequence (LeetCode 674)](https://leetcode.com/problems/longest-continuous-increasing-subsequence/)
- [Merge Sorted Array (LeetCode 88)](https://leetcode.com/problems/merge-sorted-array/)
- [Sort an Array (LeetCode 912)](https://leetcode.com/problems/sort-an-array/)
- [Sort List (LeetCode 148)](https://leetcode.com/problems/sort-list/)
- [Merge k Sorted Lists (LeetCode 23)](https://leetcode.com/problems/merge-k-sorted-lists/)

## Related

- [Merge Sort](../Merge_Sort/README.md): read first; Timsort is a merge sort that starts from the runs in the data
- [Insertion Sort](../Insertion_Sort/README.md): read first; short runs are extended by its binary-search variant
- [Binary Search](../../Searching/Binary_Search/): binary insertion and galloping are both binary searches
- [Stack](../../../Data_Structures/Linear/Stack/): the pending runs wait on a stack
- [Big-O Notation](../../../Complexity_Analysis/Time_Complexity/Big_O_Notation/)
