# Ternary Search

Ternary Search splits a sorted range into three parts with two probes and discards at least a third of it each round. It is in the same O(log n) class as Binary Search but makes about 26 percent more probes, so for plain lookup it loses. Its real use is finding the peak of a unimodal function.

## Intuition

Binary Search asks one question per round and halves the range. Ternary Search asks two questions (compare with `mid1` and `mid2`) and keeps a third. There are fewer rounds (log3 n against log2 n), but each costs two probes, so the total is 2 log3(n) = 1.26 log2(n) probes against log2(n).

The invariant is the same as in Binary Search: if the target is in the array, it is inside `arr[left..right]`. The three cases (left third, middle third, right third) are exhaustive.

For a unimodal function the picture is different. You cannot test one point against a target, but comparing `f(mid1)` with `f(mid2)` tells you which side of the peak you are on, so two evaluations per round is natural.

## Visual

```text
index:   0  1  2  3  4  5  6  7  8  9
array:  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]      target = 5
         lo       m1       m2          hi

round 1: m1 = 3 (4), m2 = 6 (7)   4 < 5 < 7   -> middle third: lo = 4, hi = 5
round 2: m1 = 4 (5)               found, return 4

  [ left third | m1 | middle third | m2 | right third ]
```

## How It Works

1. Set `left = 0` and `right = n - 1`.
2. While `left <= right`: `mid1 = left + (right - left) / 3` and `mid2 = right - (right - left) / 3`.
3. If `arr[mid1] == target` return `mid1`; if `arr[mid2] == target` return `mid2`.
4. If `target < arr[mid1]`, set `right = mid1 - 1`. If `target > arr[mid2]`, set `left = mid2 + 1`. Otherwise set `left = mid1 + 1` and `right = mid2 - 1`.
5. If the window becomes empty, return -1.

### Peak of a unimodal function (Python)

`ternary_search_unimodal(func, left, right)` finds the maximum of a function that strictly increases and then strictly decreases, on **integer** bounds. While the window is wider than 2 it compares `func(mid1)` with `func(mid2)`: if `func(mid1) < func(mid2)`, set `left = mid1`; otherwise set `right = mid2`. Then it scans the last few points. Floats raise `TypeError`, and only maxima are supported (negate `func` for a minimum).

## Step-by-Step Trace

Search for 5 in `[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]`:

| Round | left | right | mid1 | mid2 | Values | Decision |
|-------|------|-------|------|------|--------|----------|
| 1 | 0 | 9 | 3 | 6 | 4, 7 | 4 < 5 < 7: `left = 4`, `right = 5` |
| 2 | 4 | 5 | 4 | 5 | 5, 6 | `arr[4] = 5`: found, return 4 |

For the target 9 it takes 3 rounds (5 probes); Binary Search needs 3 probes.

Peak of `f(x) = -(x - 7)^2 + 3` on `[0, 20]`: the window shrinks `[0, 20]`, `[0, 14]`, `[0, 10]`, `[3, 10]`, `[5, 10]`, `[5, 9]`, `[5, 8]`, `[6, 8]`; scanning 6, 7, 8 returns 7.

## Complexity

| Case | Time | Space |
|------|------|-------|
| Best | O(1) | O(1) |
| Average and worst | O(log n) | O(1) |

T(n) = T(n/3) + O(1) gives about log3(n) rounds. The recursive version uses O(log n) stack. Worst-case probes on the array `0 .. n - 1`, over every present and missing target:

| n | Ternary probes | Binary probes |
|---|----------------|---------------|
| 10 | 6 | 4 |
| 100 | 10 | 7 |
| 1,000 | 14 | 10 |
| 100,000 | 22 | 17 |

Splitting into k parts needs k - 1 probes per round and log2(n) / log2(k) rounds, so the cost is (k - 1) / log2(k) times log2(n), which is smallest for k = 2.

## When to Use

Use it to find the maximum (or minimum, by negation) of a strictly unimodal function over a range, when you cannot differentiate.

Do not use it for plain lookup in a sorted array (use Binary Search), or on functions with plateaus or several local maxima.

## Ternary Search vs. Binary Search

| Aspect | Ternary Search | Binary Search |
|--------|----------------|---------------|
| Probes per round | 2 | 1 |
| Rounds | about log3(n) | about log2(n) |
| Total probes | about 1.26 log2(n) | about log2(n) |
| Sorted lookup | works, wasteful | the standard choice |
| Unimodal peak | natural (two evaluations) | needs a different formulation (compare `f(m)` and `f(m + 1)`) |

## Common Pitfalls

- **Using it for lookup.** Binary Search is cheaper.
- **Plateaus.** A function that rises to 5 at x = 5, stays flat until x = 15 and then rises to 10 at x = 20 is not unimodal; the Python peak finder returns x = 5 instead of x = 20, because equal values at the probes do not say where the peak is.
- **Float bounds.** The Python peak finder uses `range`, so floats raise `TypeError`.
- **Minimum instead of maximum.** Negate the function.
- **Colliding probes on tiny windows.** `mid1` and `mid2` can coincide, which is why the peak finder scans the last few points.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `ternary_search.py` | iterative, recursive and the integer unimodal peak finder |
| C++ | [C++/](C++/) | `ternary_search.cpp` | templates with `int` and `double` instances; no unimodal function |
| Go | [Go/](Go/) | `main.go` | `[]int` only; no unimodal function |

## Practice Problems

- [Peak Index in a Mountain Array (LeetCode 852)](https://leetcode.com/problems/peak-index-in-a-mountain-array/)
- [Find in Mountain Array (LeetCode 1095)](https://leetcode.com/problems/find-in-mountain-array/)
- [Devu and his Brother (Codeforces 439D)](https://codeforces.com/problemset/problem/439/D)
- [Weakness and Poorness (Codeforces 578C)](https://codeforces.com/problemset/problem/578/C)
- [Find Peak Element (LeetCode 162)](https://leetcode.com/problems/find-peak-element/)

## Related

- [Binary Search](../Binary_Search/)
- [Linear Search](../Linear_Search/)
- [Interpolation Search](../Interpolation_Search/)
- [Binary Search on Answer](../../../Problem_Patterns/Binary_Search_on_Answer/)
