# Coordinate Compression

Coordinate compression replaces each value by its rank among the distinct values, so numbers up to 10^9 become indices 0..k-1 that fit an array, a Fenwick tree or a segment tree. It keeps the order of the values and nothing else. Building the mapping takes O(n log n).

## Intuition

Many algorithms only compare values (smaller, equal, larger). If you replace every value by its position in the sorted list of distinct values, all comparisons stay the same, but the numbers become small and dense. The invariant: `a < b` exactly when `rank(a) < rank(b)`, and `a == b` exactly when the ranks are equal.

The signal is a gap between the range of the values (10^9, 10^18) and their number (n up to about 2 * 10^5), together with a wish to index an array or tree by value.

## Visual

```text
original  : 1000    5  200 1000    5   50
distinct  : 5 < 50 < 200 < 1000      ranks 0   1   2    3
ranks     :    3    0    2    3    0    1
```

## How It Works

1. Collect every value you will index. Include query endpoints, not only the data.
2. Sort and remove duplicates: `v[0] < v[1] < ... < v[k-1]`.
3. The rank of `v[i]` is `i`. Store `value -> rank` in a map, or keep only the sorted list and use a binary search (lower bound).
4. Work with the ranks (array or Fenwick or segment tree indices) and translate back through the sorted list.

## Step-by-Step Trace

`compress_coordinates([1000, 5, 200, 1000, 5, 50])`:

| Step | Result |
|------|--------|
| distinct values | `{1000, 5, 200, 50}` |
| sorted | `[5, 50, 200, 1000]` |
| mapping | `{5: 0, 50: 1, 200: 2, 1000: 3}` |
| ranks of the input | `[3, 0, 2, 3, 0, 1]` |
| `decompress_coordinates(mapping)` | `[5, 50, 200, 1000]` (index = rank) |

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| `compress_coordinates` | O(n log n) | O(k) |
| `decompress_coordinates` | O(k) | O(k) |
| `compress_2d_coordinates` | O(n log n) | O(k) |
| Lookup of a rank | O(1) average (Python dict, Go map), O(log k) (C++ `std::map`) | O(1) |

n is the number of input values and k the number of distinct ones. Sorting dominates the build.

## When to Use

- Values are huge but there are few of them, and the algorithm only needs their order: Fenwick-tree counting of inversions, offline range updates, sweep lines over endpoints.
- Do not use it when you need distances between values (lengths, areas) unless you keep the original values as weights, or when the data arrives online.

## Coordinate Compression vs. Alternatives

| Approach | Time per operation | Use when |
|----------|--------------------|----------|
| Coordinate compression | O(log n) with a Fenwick tree | offline: all values known first |
| Hash map by value | O(1) average | only equality matters |
| Dynamic segment tree | O(log V) | online data, manageable V |
| Order-statistic tree | O(log n) | online rank queries |

## Common Pitfalls

- Not compressing the query values together with the data.
- Losing gaps: ranks do not preserve distances. Example: segments `[0, 10]`, `[5, 20]` and `[100, 110]` compress to endpoints `0, 5, 10, 20, 100, 110`; the covered length 5 + 5 + 10 + 10 = 30 needs the original lengths of the pieces, not their count.
- Off-by-one when turning a half-open range into ranks.
- Compressing x and y of 2D points together instead of separately.
- The mapping only covers the values you passed in.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `coordinate_compression.py` | dictionary mapping; 6 tests |
| C++ | [C++](C++/) | `coordinate_compression.cpp` | `std::set` and `std::map`; 4 tests |
| Go | [Go](Go/) | `main.go` | `map` and `sort.Ints`; 4 tests |

All three provide compress, decompress and a 2D compress. They work on integers.

## Practice Problems

- [The Skyline Problem (LeetCode 218)](https://leetcode.com/problems/the-skyline-problem/)
- [Rectangle Area II (LeetCode 850)](https://leetcode.com/problems/rectangle-area-ii/)
- [Count of Smaller Numbers After Self (LeetCode 315)](https://leetcode.com/problems/count-of-smaller-numbers-after-self/)
- [Salary Queries (CSES)](https://cses.fi/problemset/task/1144)

## Related

- [Prefix Sum and Difference Array](../Prefix_Sum_Difference_Array/)
- [Sliding Window](../Sliding_Window/)
- [Monotonic Stack](../Monotonic_Stack/)
- [DP Problem Patterns](../DP_Problem_Patterns/)
