# Shell Sort

Shell Sort is insertion sort over shrinking gaps. A pass with gap `h` insertion-sorts the `h` interleaved subsequences `arr[r], arr[r + h], arr[r + 2h], ...`, so far-apart elements move in long jumps; the last pass, with gap 1, is a plain insertion sort of an array that is already nearly sorted. It sorts in place with O(1) extra space and is not stable. Its running time depends on the gap sequence: Theta(n^2) in the worst case with Shell's original gaps, O(n^(3/2)) with Knuth's, and no proven bound, but the fewest comparisons in practice, with Ciura's, the default here.

## Intuition

Insertion Sort is slow on random input because an element moves one place per shift: a small value near the end needs about `n` shifts to reach the front. Shell Sort first sorts elements that are far apart. With gap `h` an element jumps `h` places per shift, so a few long jumps put it near its final place, and later passes with smaller gaps only have to fix short distances.

An array is **h-sorted** when `arr[i] <= arr[i + h]` for every `i`: each of the `h` subsequences of every `h`-th element is sorted. A pass with gap `h` makes the array h-sorted. Two facts make the passes add up:

- **The last gap is 1.** A 1-sorted array is sorted, so any gap sequence that ends with 1 sorts correctly, whatever came before.
- **A later pass does not undo an earlier one.** An h-sorted array stays h-sorted after a pass with a smaller gap. The tests check this after every pass, for every earlier gap, in all three languages.

## Visual

The gap-4 pass of the worked example below. The index modulo 4 names the group (A to D); each group is insertion-sorted on its own, and the groups never touch.

```text
after the gap-10 pass:   93 38 74 79 60 91 41 99 18 63 98 69
index                     0  1  2  3  4  5  6  7  8  9 10 11
group (index mod 4)       A  B  C  D  A  B  C  D  A  B  C  D

gap 4: insertion-sort each group
  A  indices 0, 4, 8     93 60 18  ->  18 60 93
  B  indices 1, 5, 9     38 91 63  ->  38 63 91
  C  indices 2, 6, 10    74 41 98  ->  41 74 98
  D  indices 3, 7, 11    79 99 69  ->  69 79 99

after the gap-4 pass:    18 38 41 69 60 63 74 79 93 91 98 99   (4-sorted)
gap 1: insertion sort finishes with only 3 shifts
```

## How It Works

1. Take the gaps for `n` elements: the terms of the chosen sequence that are below `n`, largest first. Fewer than 2 elements need no pass.
2. For each gap `h`, run one pass (`h_sort`): for `i` from `h` to `n - 1`, save `key = arr[i]`, set `j = i`, and while `j >= h` and `arr[j - h] > key`, shift `arr[j - h]` to `arr[j]` and set `j = j - h`. Then write `key` to `arr[j]`.
3. The last gap is 1, so the last pass is Insertion Sort and leaves the array sorted.

Step 2 visits the indices in order, so consecutive values of `i` belong to different groups (group `i mod h`). Each insertion only looks at earlier members of its own group, so this is the same as sorting the groups one after another: the same result, the same comparisons and the same shifts.

### The gap sequences

All three versions provide three sequences and use the same rule for each: every term below `n`, largest first.

| Sequence | Terms | Gaps for n = 100 | Number of gaps for n = 10^6 | Proven worst case |
|----------|-------|------------------|-------------------|-------------------|
| Shell (1959) | `n/2, n/4, ..., 1` (halving, rounded down) | 50 25 12 6 3 1 | 19 | Theta(n^2) |
| Knuth | `(3^k - 1)/2`: 1, 4, 13, 40, 121, ..., each `3h + 1` | 40 13 4 1 | 13 | O(n^(3/2)) |
| Ciura (2001) | 1, 4, 10, 23, 57, 132, 301, 701, then `2h + h/4` | 57 23 10 4 1 | 16 | none known |

**Ciura's extension.** Ciura found the gaps up to 701 by experiment. Past 701 each gap is `floor(2.25 h)`, computed in integers as `2h + h/4` (rounded down) in all three languages: 1577, 3548, 7983, 17961, 40412, 90927, ... Rounding to the nearest instead gives 17962 after 7983, and rounding up gives 1578 after 701, so the rule has to be stated exactly; integers keep the three languages in step.

**Knuth's starting gap.** The usual statement of Knuth's sequence starts lower, with no gap above about `n/3`. Using every term below `n` adds at most one pass with a gap above `n/3` (checked for every `n` up to 100,000), and such a pass makes at most 2 comparisons per element, because an element at index `i < n < 3h` has at most 2 earlier members in its group.

**The default is Ciura's.** On the random inputs measured below it makes the fewest comparisons and the fewest shifts of the three at every size, and it is the best sequence known in practice. Its weakness is theory: nobody has proved a bound for it.

## Step-by-Step Trace

Input `[98, 69, 74, 79, 60, 91, 41, 99, 18, 63, 93, 38]` (12 values), Ciura's gaps below 12: 10, 4, 1.

| Pass | Gap | Array after the pass | Comparisons | Shifts |
|------|-----|----------------------|-------------|--------|
| 1 | 10 | 93 38 74 79 60 91 41 99 18 63 98 69 | 2 | 2 |
| 2 | 4 | 18 38 41 69 60 63 74 79 93 91 98 99 | 11 | 7 |
| 3 | 1 | 18 38 41 60 63 69 74 79 91 93 98 99 | 14 | 3 |

Gap 10 makes ten groups, and only two of them have two members (indices 0 and 10, indices 1 and 11): 98 and 93 swap, then 69 and 38. Gap 4 sorts the four groups of three shown above. Gap 1 finds 3 inversions left: 69 > 60, 69 > 63 and 93 > 91.

In total: 27 comparisons and 12 shifts. Plain Insertion Sort needs 47 comparisons and 40 shifts on the same input (it has 40 inversions). Knuth's gaps (4, 1) take 28 comparisons and 14 shifts, Shell's (6, 3, 1) 38 and 18.

## Complexity

| Case | Time | Space | When |
|------|------|-------|------|
| Best | O(n log n) | O(1) | sorted input: every pass makes `n - h` comparisons and no shift; there are O(log n) passes |
| Worst, Shell's gaps | Theta(n^2) | O(1) | `n` a power of 2 with the small half at even indices (below) |
| Worst, Knuth's gaps | O(n^(3/2)) | O(1) | a proven bound |
| Worst, Ciura's gaps | unknown | O(1) | no bound has been proved |

The extra space is `key`, `i`, `j` and the list of gaps, which has O(log n) entries (16 for Ciura's at `n = 10^6`). The sort makes no copy of the array and does not recurse.

**Shell's gaps are quadratic.** Take `n` a power of 2 and put the small half `1, 2, ..., n/2` at the even indices and the large half at the odd ones: `1, 9, 2, 10, 3, 11, ...` for `n = 16`. Every gap but the last is even, so no pass ever compares an even index with an odd one. Both halves are already in order, so those passes shift nothing, and the final gap-1 pass must remove all `n(n - 2)/8` inversions alone. Counted on the Python code, the comparisons are exactly `n(n - 2)/8 + (log2(n) - 1) n + 1`:

| n | Shell's gaps | Knuth's gaps | Ciura's gaps |
|---|--------------|--------------|--------------|
| 1,024 | 140,033 | 9,447 | 10,621 |
| 4,096 | 2,141,185 | 45,532 | 50,577 |
| 16,384 | 33,763,329 | 217,302 | 238,967 |

Each quadrupling of `n` multiplies Shell's count by about 16, the mark of Theta(n^2). Knuth's and Ciura's sequences contain odd gaps, which mix the two halves early.

**Random input.** Comparisons counted on the Python code, averaged over 5 random permutations of `0..n-1` per size:

| n | Shell's gaps | Knuth's gaps | Ciura's gaps |
|---|--------------|--------------|--------------|
| 1,000 | 14,923 | 13,695 | 12,960 |
| 4,000 | 84,376 | 78,620 | 66,687 |
| 16,000 | 479,865 | 425,098 | 327,855 |
| 64,000 | 2,881,383 | 2,302,020 | 1,555,831 |
| 256,000 | 17,825,610 | 11,937,427 | 7,201,566 |

What the counts show, and no more:

- All three grow far more slowly than `n^2` on random input. Doubling `n` multiplied the comparisons by 2.34 to 2.53 with Shell's gaps, 2.23 to 2.43 with Knuth's and 2.14 to 2.30 with Ciura's.
- Ciura's gaps made the fewest comparisons at every size, 13% fewer than Shell's at `n = 1,000` and 60% fewer at 256,000. They also made the fewest shifts: 3,850,086 at 256,000, against 9,366,760 for Knuth's and 13,857,648 for Shell's.
- With Ciura's gaps the comparisons divided by `n log2(n)` went from 1.30 at `n = 1,000` to 1.57 at 256,000: close to `n log n`, but still rising, so the counts do not settle the growth rate.
- Knuth's gaps made fewer comparisons than Shell's at every size but more shifts up to `n = 16,000`.

## When to Use

Use it when:

- you need an in-place sort with no recursion and very little code, for arrays of a few thousand elements;
- stability does not matter;
- you want to see why the choice of gaps matters, or to compare gap sequences by counting.

Do not use it when:

- equal keys must keep their order: use Merge Sort or Insertion Sort;
- you need a guaranteed bound: Heap Sort is O(n log n) in place, and Shell Sort with Ciura's gaps has no proven bound;
- the arrays are large: an O(n log n) sort pulls ahead as `n` grows. On the random inputs above, Shell Sort with Ciura's gaps makes 1.61 times as many comparisons as the repository's Merge Sort at `n = 16,000` and 1.68 times as many at 256,000 (7,201,566 against 4,276,426).

## Shell Sort vs. Alternatives

| Algorithm | Best | Worst | Extra space | Stable | Notes |
|-----------|------|-------|-------------|--------|-------|
| Shell Sort (Ciura's gaps) | O(n log n) | unknown | O(1) | No | in place, no recursion, fast in practice for medium `n` |
| [Insertion Sort](../Insertion_Sort/README.md) | O(n) | O(n^2) | O(1) | Yes | Shell Sort's last pass; better on nearly sorted input |
| [Heap Sort](../Heap_Sort/README.md) | O(n log n) | O(n log n) | O(log n) here | No | a guaranteed bound, in place |
| [Quick Sort](../Quick_Sort/README.md) | O(n log n) | O(n^2) | O(log n) | No | usually the fastest in memory |
| [Merge Sort](../Merge_Sort/README.md) | O(n log n) | O(n log n) | O(n) | Yes | stable and guaranteed, needs a buffer |

## Common Pitfalls

- **A sequence that does not end with 1.** The array is then only h-sorted for the last gap, not sorted. Halving `n` and stopping at 2 is the usual way to get this wrong.
- **Powers of 2 as gaps.** With Shell's gaps on `n` a power of 2, even and odd positions never meet until the last pass, which then costs Theta(n^2).
- **Unsigned indices in C++.** Test `j >= gap` before reading `arr[j - gap]`; with `size_t`, `j - gap` wraps around instead of going negative.
- **Expecting stability.** `[2a, 2b, 2c, 2d, 1e]` becomes `[1e, 2b, 2c, 2d, 2a]` with Ciura's or Knuth's gaps: the gap-4 pass swaps `2a` with `1e` and carries it past its three twins. Shell's gaps give `[1e, 2b, 2a, 2d, 2c]`.
- **Using `>=` in the inner loop.** Equal keys then shift past each other for nothing: on 500 equal values, Ciura's gaps make 176,042 comparisons with `>=` and 2,972 with `>`. Keep the strict `>`.
- **Gaps in floating point.** `round(2.25 * h)` and `floor(2.25 * h)` part ways at 17962 and 17961. Compute `2h + h/4` in integers.
- **Overflow while generating gaps.** Computing `3h + 1` or `2.25 h` past `n` can overflow a fixed-width integer when `n` is near the type's limit. The code tests whether the next gap is below `n` without computing it first.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `shell_sort.py` | `shell_sort(arr, sequence="ciura")`, `h_sort`, `gap_sequence` and one function per sequence; any items with `>`; `ValueError` on an unknown sequence or a gap below 1 |
| C++ | [C++](C++/) | `shell_sort.cpp` | templates `shellSort(arr, Sequence = Sequence::Ciura)` and `hSort` over `std::vector<T>` (`T` needs `operator>`); `enum class Sequence`; `std::invalid_argument` for gap 0 or a value outside the enum |
| Go | [Go](Go/) | `main.go` | `ShellSort([]int, Sequence)`, `ShellSortGeneric` with a `less` function, `HSort`, `GapSequence`; `Ciura` is the zero value; panics on an unknown sequence or a gap below 1 |

All three sort in place, use the same gaps and the same comparison (`arr[j - gap] > key`, which Go writes as `less(key, arr[j-gap])`), so they make the same comparisons and shifts: the C++ and Go tests pin the counts of 40 arrays to the Python outputs.

## Practice Problems

- [Sort Even and Odd Indices Independently (LeetCode 2164)](https://leetcode.com/problems/sort-even-and-odd-indices-independently/)
- [K Swap (AtCoder ABC 254 C)](https://atcoder.jp/contests/abc254/tasks/abc254_c)
- [Sort the Matrix Diagonally (LeetCode 1329)](https://leetcode.com/problems/sort-the-matrix-diagonally/)
- [Sort an Array (LeetCode 912)](https://leetcode.com/problems/sort-an-array/)

## Related

- [Insertion Sort](../Insertion_Sort/README.md): read first; Shell Sort's every pass is an insertion sort with a stride
- [Heap Sort](../Heap_Sort/README.md): the in-place sort with a guaranteed O(n log n)
- [Quick Sort](../Quick_Sort/README.md)
- [Merge Sort](../Merge_Sort/README.md)
- [Big-O Notation](../../../Complexity_Analysis/Time_Complexity/Big_O_Notation/)
