# Convex Hull Trick and Li Chao Tree

The Convex Hull Trick (CHT) answers "smallest value of `m*x + b` over a set of lines" in O(1) amortized time when slopes and queries are sorted, and a Li Chao tree does it in O(log V) in any order. They speed up DP transitions of the form `dp[i] = min over j of (m_j * x_i + b_j)` from O(n) per state to near-constant.

## Intuition

Many DPs look like `dp[i] = min over j < i of (m_j * x_i + b_j)`. Each earlier state `j` is a **line** `y = m_j * x + b_j`, and `x_i` is the query point. The minimum of many lines as a function of `x` is the **lower envelope**, a convex piecewise-linear function, and only lines that appear on it can ever be the answer. CHT keeps just those lines:

- Slopes inserted in non-increasing order and queries with non-decreasing `x`: a deque, with every line pushed once and popped at most once.
- Any order: a Li Chao tree, a segment tree over `x` whose node stores the one line that is best at the node's midpoint.

## Visual

Lines `3x`, `2x + 4`, `x + 3` and `7`, values at x = 0..6 (the minimum of each column is the envelope):

```text
 x        0   1   2   3   4   5   6
 3x       0   3   6   9  12  15  18      best at x = 0, 1
 2x + 4   4   6   8  10  12  14  16      never best: not on the envelope
 x + 3    3   4   5   6   7   8   9      best at x = 2, 3 (tie at 4)
 7        7   7   7   7   7   7   7      best from x = 4
 min      0   3   5   6   7   7   7
```

## How It Works

Monotonic CHT (deque of `(m, b)`, slopes strictly decreasing):

1. Insert `(m, b)`. If the last line has the same slope, keep only the lower intercept (drop the new line if it is not lower, otherwise pop the last one).
2. While at least two lines are stored and the last line `l2` is redundant given the one before it `l1` and the new line `l3`, pop it. The test uses integers: `(b3 - b1) * (m1 - m2) <= (b2 - b1) * (m1 - m3)`.
3. Push the new line.
4. Query at `x` (non-decreasing): while the first line is no better than the second at `x`, pop the front. Return the first line's value.

Li Chao tree over `[lo, hi]`:

1. Insert: compare the new line and the stored one at the midpoint and keep the better one in the node.
2. Send the loser to the left child if it is better at the left end of the range, or to the right child if it is better at the right end; otherwise drop it.
3. Query: walk from the root to the leaf of `x` and take the minimum of the stored lines.

## Step-by-Step Trace

Insert `(3, 0)`, `(2, 4)`, `(1, 3)`, `(0, 7)` into the monotonic CHT, then query:

| Step | Deque | Note |
|------|-------|------|
| add (3, 0) | (3,0) | first line |
| add (2, 4) | (3,0) (2,4) | fewer than two lines, no test |
| add (1, 3) | (3,0) (1,3) | `3 * 1 <= 4 * 2`: (2,4) popped |
| add (0, 7) | (3,0) (1,3) (0,7) | `7 * 2 <= 3 * 3` is false: keep |
| query 0 | (3,0) (1,3) (0,7) | 0 (3x) |
| query 1 | same | 3 |
| query 2 | (1,3) (0,7) | 6 >= 5: front popped, answer 5 |
| query 4 | (0,7) | 7 >= 7: front popped, answer 7 |

The answers for x = 0..6 are 0, 3, 5, 6, 7, 7, 7.

## Complexity

| Variant | Insert | Query | Restrictions |
|---------|--------|-------|--------------|
| Monotonic CHT (deque) | O(1) amortized | O(1) amortized | slopes non-increasing, queries non-decreasing |
| CHT with binary search | O(1) amortized | O(log n) | slopes monotone, queries arbitrary |
| Li Chao tree | O(log V) | O(log V) | a fixed range of V integer query points |

Each line is pushed once and popped at most once, so n operations on the deque cost O(n) in total (the Python version uses `collections.deque`, so front pops are O(1)). The Li Chao tree creates nodes lazily, at most one per inserted line, so space is O(n) in both variants.

## When to Use

- A DP whose transition is `min` or `max` of terms linear in an index-dependent value, such as setup costs or squared distances expanded as `(x_i - x_j)^2`.
- Not when the cost is not linear in the query variable (try divide and conquer DP or Knuth's optimization), or when n is small enough for a plain scan.

## CHT vs. Alternatives

| Technique | Time | Use when |
|-----------|------|----------|
| Monotonic CHT | O(n) | sorted slopes and queries |
| Li Chao tree | O(n log V) | any order, known range of x |
| Divide and conquer DP | O(n log n) | quadrangle-inequality costs |
| Plain scan | O(n^2) | n up to a few thousand |

## Common Pitfalls

- Equal slopes: keep the lower intercept only. Without it, three lines with the same slope can drop the best line (the cross-multiplied test is 0 on both sides). Fixed here: `(2,5), (2,1), (2,3)` queried at 0 now returns 1.
- Wrong order: slopes must be non-increasing and queries non-decreasing; otherwise the answers are silently wrong.
- Min versus max: the envelope and comparisons flip for the maximum, so write it separately.
- Floating point: compare intersections by cross-multiplication, not division.
- Overflow: the C++ version widens to `__int128` and Go uses `big.Int` in the redundancy test, but `m * x + b` must still fit in 64 bits.
- Empty structure: Python raises `ValueError`, C++ has undefined behaviour and Go panics.
- Li Chao tree outside its range: Python raises `ValueError` and Go panics; C++ does not check. An empty tree returns `inf` (Python), `LLONG_MAX` (C++) or `MaxInt64` (Go).

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `cht.py` | Deque-based CHT and Li Chao tree; 12 tests |
| C++ | [C++](C++/) | `cht.h` | Header-only; `__int128` in the redundancy test; 5 tests |
| Go | [Go](Go/) | `main.go` | Slice-based CHT, `big.Int` in the redundancy test; 5 tests |

## Practice Problems

- [Kalila and Dimna (Codeforces 319C)](https://codeforces.com/problemset/problem/319/C)
- [Escape Through Leaf (Codeforces 932F)](https://codeforces.com/problemset/problem/932/F)
- [Frog 3 (AtCoder Educational DP Contest, problem Z)](https://atcoder.jp/contests/dp/tasks/dp_z)
- [Commando (SPOJ APIO10A)](https://www.spoj.com/problems/APIO10A/)

## Related

- [Dynamic Programming](../../README.md)
- [DP on Trees](../../Advanced_DP/DP_on_Trees/)
- [Monotonic Queue](../../../../Problem_Patterns/Monotonic_Queue/)
- [DP Problem Patterns](../../../../Problem_Patterns/DP_Problem_Patterns/)
