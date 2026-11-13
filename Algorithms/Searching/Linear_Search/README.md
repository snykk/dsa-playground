# Linear Search

Linear Search (sequential search) checks the elements one by one until it finds the target or reaches the end. It needs no sorting and no random access, runs in O(n) time and O(1) extra space, and is the right tool for small or unsorted collections.

## Intuition

Looking for a name on an unsorted list, you read from the top until you see it. You cannot skip anything, because nothing tells you where the name is.

The invariant: before checking index `i`, the target is known to differ from `arr[0 .. i - 1]`. When the loop ends without a match, the target differs from every element, so returning -1 is correct.

## Visual

```text
Array:  [10, 20, 30, 40, 50]      target = 30
index:    0   1   2   3   4

i = 0:  10 != 30  -> next
i = 1:  20 != 30  -> next
i = 2:  30 == 30  -> return 2          (3 comparisons)

target = 99: all 5 compared, return -1
```

## How It Works

1. Start at index 0.
2. If `arr[i] == target`, return `i`.
3. Otherwise move to `i + 1` and repeat.
4. After the last element, return -1.

To find every occurrence, do not return on a match: append `i` to a result list and continue to the end. There is no last-occurrence function in this repository; scan from the end or use the last element of the all-occurrences result.

## Step-by-Step Trace

Search for 30 in `[10, 20, 30, 40, 50]`:

| Step | Index | Element | Equal to 30? | Action |
|------|-------|---------|--------------|--------|
| 1 | 0 | 10 | No | continue |
| 2 | 1 | 20 | No | continue |
| 3 | 2 | 30 | Yes | return 2 |

All occurrences of 4 in `[4, 7, 4, 9, 4]` give `[0, 2, 4]`.

## Complexity

| Case | Time | Space |
|------|------|-------|
| Best | O(1) | O(1) |
| Average | O(n) | O(1) |
| Worst | O(n) | O(1) |

A target present at position `i` (1-indexed) costs `i` comparisons, so with equally likely positions the average is (1 + 2 + ... + n) / n = (n + 1) / 2. A missing target always costs `n`. The recursive version uses O(n) stack, and the all-occurrences version stores the `k` matches.

## When to Use

Use it for unsorted data, small collections, one-off queries, linked lists and streams, or when you only have an equality test (or a predicate) and no ordering.

Do not use it for large sorted arrays or repeated lookups: Binary Search is O(log n) and a hash table is O(1) on average. Sorting first only pays off if you search often: n linear searches cost O(n^2), while one sort plus n binary searches costs O(n log n).

## Linear Search vs. Alternatives

| Method | Time | Needs sorted | Notes |
|--------|------|--------------|-------|
| Linear Search | O(n) | No | simplest; any data order; linked lists |
| [Binary Search](../Binary_Search/) | O(log n) | Yes | many lookups in a sorted array |
| [Interpolation Search](../Interpolation_Search/) | O(log log n) on uniform data | Yes | evenly spread numbers |
| Hash table | O(1) average | No | many exact lookups; needs memory and a build step |

Variants not implemented here: the sentinel technique (store the target after the last element so the loop needs no bounds check, saving one comparison per step) and move-to-front or transposition heuristics (found items drift toward the front, lowering the average cost on skewed queries).

## Common Pitfalls

- **Recursion on long inputs.** Python's `linear_search_recursive` raises `RecursionError` on about a thousand elements. Prefer the loop.
- **Expecting the last match.** The search stops at the first match; use the all-occurrences function for every index.
- **Returning a valid index on a miss.** Return -1 and check for it.
- **Floating-point equality.** Rounding can make equal values compare unequal; compare with a tolerance.
- **Using it on large sorted data.** Use Binary Search.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `linear_search.py` | iterative, recursive, all occurrences |
| C++ | [C++/](C++/) | `linear_search.cpp` | templates with `int`, `double` and `std::string` instances |
| Go | [Go/](Go/) | `main.go` | `[]int` functions plus a generic `LinearSearchGeneric[T comparable]` |

## Practice Problems

- [Two Sum (LeetCode 1)](https://leetcode.com/problems/two-sum/) - the brute-force linear scan, then a hash table.
- [Find the Index of the First Occurrence in a String (LeetCode 28)](https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/)
- [Search Insert Position (LeetCode 35)](https://leetcode.com/problems/search-insert-position/) - solve it with a scan, then with Binary Search.

## Related

- [Binary Search](../Binary_Search/)
- [Interpolation Search](../Interpolation_Search/)
- [Ternary Search](../Ternary_Search/)
