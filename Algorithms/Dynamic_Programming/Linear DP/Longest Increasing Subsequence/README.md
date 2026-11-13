# Longest Increasing Subsequence

The Longest Increasing Subsequence (LIS) of an array is the longest subsequence whose elements are strictly increasing; a subsequence keeps the order but may skip elements. A DP over the end index finds its length in O(n^2), and a "tails" array with binary search finds it in O(n log n).

## Intuition

Let `dp[i]` be the length of the longest increasing subsequence that ends at index `i`. Element `arr[i]` can extend any run that ends at an earlier, smaller element `arr[j]`, so `dp[i] = 1 + max(dp[j])` over `j < i` with `arr[j] < arr[i]` (or 1 if there is none). The answer is the maximum over all `i`, not `dp[n-1]`, because the best run need not end at the last element.

The faster method keeps `tails[k]`, the smallest possible last value of an increasing subsequence of length `k + 1`. A smaller tail is never worse, because whatever can follow a larger tail can follow a smaller one. The array stays sorted, so each new element is placed by binary search.

## Visual

`arr = [10, 9, 2, 5, 3, 7, 101, 18]`. The returned LIS is `[2, 5, 7, 101]`.

```text
index    0   1   2   3   4   5    6    7
arr     10   9   2   5   3   7  101   18
dp       1   1   1   2   2   3    4    4
parent   -   -   -   2   2   3    5    5
                 ^   ^       ^    ^        <- the chain 6 -> 5 -> 3 -> 2
```

The tails array after each element:

```text
10  -> [10]
9   -> [9]
2   -> [2]
5   -> [2, 5]
3   -> [2, 3]
7   -> [2, 3, 7]
101 -> [2, 3, 7, 101]
18  -> [2, 3, 7, 18]      length 4
```

## How It Works

Table (`lis_dp`, `lis_with_sequence`, `lisDP`, `LISDP`):
1. `dp[i] = 1` for every `i`.
2. For each `i` and each `j < i` with `arr[j] < arr[i]`: `dp[i] = max(dp[i], dp[j] + 1)`.
3. Return the maximum of `dp`. For the sequence, record `parent[i] = j` whenever `dp[i]` improves, start from the first index with the maximum, and follow the parents.

Tails (`lis_binary_search`, Python only):
1. `tails = []`.
2. For each `x`, find `pos = bisect_left(tails, x)` (the first tail `>= x`).
3. If `pos` is the end, append `x`; otherwise set `tails[pos] = x`.
4. The answer is `len(tails)`.

`bisect_left` makes the result strictly increasing: equal values replace each other. The tails array is not itself a subsequence of the input; only its length is meaningful.

## Step-by-Step Trace

The tails version on `[10, 9, 2, 5, 3, 7, 101, 18]`:

| x | Position found | Action | tails |
|---|----------------|--------|-------|
| 10 | 0 | append | `[10]` |
| 9 | 0 | replace 10 | `[9]` |
| 2 | 0 | replace 9 | `[2]` |
| 5 | 1 | append | `[2, 5]` |
| 3 | 1 | replace 5 | `[2, 3]` |
| 7 | 2 | append | `[2, 3, 7]` |
| 101 | 3 | append | `[2, 3, 7, 101]` |
| 18 | 3 | replace 101 | `[2, 3, 7, 18]` |

## Complexity

| Version | Time | Space | Why |
|---------|------|-------|-----|
| `lis_naive` | O(2^n) | O(n) | take or skip every element |
| Table (`lis_dp`, `lis_with_sequence`, C++, Go) | O(n^2) | O(n) | a double loop over pairs |
| Tails (`lis_binary_search`) | O(n log n) | O(n) | one binary search per element |

## When to Use

Use it for:
- the longest strictly increasing chain in a sequence;
- problems that reduce to it after sorting (nested envelopes, pair chains);
- measuring how sorted a sequence is: `n - LIS` elements are out of place.

Use the O(n^2) table when you need the sequence or a variant such as counting; use tails when only the length matters and `n` is large.

## LIS vs. Alternatives

| Problem | Subject | Time | Note |
|---------|---------|------|------|
| LIS | one sequence, ordered by value | O(n log n) | tails plus binary search |
| Longest Common Subsequence | two sequences | O(m * n) | 2D table |
| Maximum Subarray | contiguous block with the maximum sum | O(n) | one pass |
| Longest increasing substring | contiguous run | O(n) | one pass, no DP |

## Common Pitfalls

1. Returning `dp[n-1]` instead of the maximum of `dp`.
2. Strict versus non-strict: `[7, 7, 7]` has LIS length 1 and `[1, 3, 3, 5]` has 3. For a non-decreasing subsequence use `<=` in the table or `bisect_right`.
3. Treating the tails array as the answer sequence.
4. Starting `dp` at 0: each element alone gives 1.
5. Using the O(n^2) table for very large inputs.

The O(n log n) method can also recover the sequence (store each element's predecessor), but this repository returns the sequence only from the O(n^2) version.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `lis.py` | `lis_naive`, `lis_dp`, `lis_binary_search`, `lis_with_sequence` |
| C++ | [C++/](C++/) | `lis.cpp` | `lisDP` (O(n^2) length only) |
| Go | [Go/](Go/) | `main.go` | `LISDP` (O(n^2) length only) |

## Practice Problems

- [LeetCode 300. Longest Increasing Subsequence](https://leetcode.com/problems/longest-increasing-subsequence/) - the classic
- [LeetCode 673. Number of Longest Increasing Subsequence](https://leetcode.com/problems/number-of-longest-increasing-subsequence/) - counting
- [LeetCode 354. Russian Doll Envelopes](https://leetcode.com/problems/russian-doll-envelopes/) - sort, then LIS
- [LeetCode 646. Maximum Length of Pair Chain](https://leetcode.com/problems/maximum-length-of-pair-chain/) - a chain problem

## Related

- [Longest Common Subsequence](../../2D%20DP/Longest%20Common%20Subsequence/) - two-sequence version
- [Maximum Subarray (Kadane's Algorithm)](../Maximum%20Subarray%20(Kadane's%20Algorithm)/) - another linear DP
- [Coin Change](../Coin%20Change/) - a one-dimensional DP over amounts
- [Binary Search](../../../Searching/Binary%20Search/) - the search used by the tails method
- [Dynamic Programming overview](../../README.md)
