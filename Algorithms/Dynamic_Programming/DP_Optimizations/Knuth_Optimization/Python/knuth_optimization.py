"""
Knuth's optimization: the interval DP

    dp[i][j] = min over i <= k < j of dp[i][k] + dp[k+1][j] + C(i, j),   dp[i][i] = 0

in O(n^2) time instead of O(n^3), when the best split moves in one direction only. Let
opt(i, j) be the smallest k that reaches dp[i][j]. If

    opt(i, j - 1) <= opt(i, j) <= opt(i + 1, j)

then the cell (i, j) only needs the splits from split[i][j - 1] to split[i + 1][j], two cells
of the diagonal just before it. Along one diagonal the upper end of a cell's window is the lower
end of the next cell's, so the window sizes telescope: a whole diagonal tries at most
(n - L + 1) + (n - 2) splits, and the n - 1 diagonals O(n^2) in all.

A sufficient condition on the cost (Knuth 1971; Yao 1980): for every a <= b <= c <= d,

    quadrangle inequality:  C(a, c) + C(b, d) <= C(a, d) + C(b, c)
    monotone on intervals:  C(b, c) <= C(a, d)

A range sum satisfies both: the inequality with equality, and monotonicity because no value is
below 0. A cost that fails the inequality can make the window miss the best split, and then the
narrowed DP returns a larger value than the plain one (the tests show one).

- split_dp: the recurrence for any cost C(i, j) of 0 or more over n points, with the window
  (knuth=True) or with every split (knuth=False, the plain interval DP).
- merge_piles, merge_piles_plan: the pile-merging problem of Interval DP, with the same input,
  the same tie rule and the same result, in O(n^2). C(i, j) = sum(piles[i..j]).
- optimal_bst: the optimal binary search tree for key frequencies, the problem Knuth's paper
  solved. Its recurrence over the n + 1 gaps between keys is split_dp's with
  C(i, j) = freq[i] + ... + freq[j - 1].

Tie rule: the splits of a window are tried in increasing order and dp[i][j] changes only on a
strict gain, so split[i][j] is the smallest k of the window that reaches the minimum. When the
condition holds that window contains the smallest best k, so split is the same table as the
plain interval DP's and merge_piles_plan returns the same merges, in the same post-order. The
C++ and Go versions follow the same rule.

Pile sizes, frequencies and costs must be 0 or more, and n must be 0 or more (ValueError
otherwise). Python's integers do not overflow.
"""

import math
from typing import Callable, List, Sequence, Tuple

INF = float("inf")

# One merge (i, k, j): the pile made of piles i..k joins the pile made of piles k+1..j.
Merge = Tuple[int, int, int]

# C(i, j): the cost added when the range of points i..j is joined, whatever the split.
Cost = Callable[[int, int], int]


def _check_non_negative(values: Sequence[int], what: str) -> None:
    for i, value in enumerate(values):
        if value < 0:
            raise ValueError(f"{what} {i} is {value}; every {what} must be 0 or more")


def _prefix_sums(values: Sequence[int]) -> List[int]:
    """prefix[t] = values[0] + ... + values[t - 1]."""
    prefix = [0] * (len(values) + 1)
    for t, value in enumerate(values):
        prefix[t + 1] = prefix[t] + value
    return prefix


def _window(split: List[List[int]], i: int, j: int) -> Tuple[int, int]:
    """The splits Knuth's optimization tries for dp[i][j], both ends included: k = i alone for
    two points, otherwise split[i][j - 1] to split[i + 1][j], two cells of the last diagonal."""
    if j - i == 1:
        return i, i
    return split[i][j - 1], split[i + 1][j]


def _try_split(dp: List[list], split: List[List[int]], join: int, i: int, k: int, j: int) -> None:
    """One candidate for dp[i][j]: the left part i..k and the right part k+1..j, joined at the
    cost join = C(i, j). A strict gain keeps k, so the smallest k wins a tie."""
    cost = dp[i][k] + dp[k + 1][j] + join
    if cost < dp[i][j]:
        dp[i][j] = cost
        split[i][j] = k


def _fill(n: int, cost: Cost, knuth: bool = True) -> Tuple[List[list], List[List[int]]]:
    """dp[i][j] and split[i][j] (-1 when i == j, and below the diagonal) for every range of the
    n points, by increasing length. With knuth=False every k from i to j - 1 is tried."""
    dp = [[0] * n for _ in range(n)]
    split = [[-1] * n for _ in range(n)]
    for length in range(2, n + 1):  # the window reads two cells of length - 1: already final
        for i in range(n - length + 1):
            j = i + length - 1
            lo, hi = _window(split, i, j) if knuth else (i, j - 1)
            join = cost(i, j)
            if join < 0:
                raise ValueError(f"cost({i}, {j}) is {join}; every cost must be 0 or more")
            dp[i][j] = INF
            for k in range(lo, hi + 1):
                _try_split(dp, split, join, i, k, j)
    return dp, split


def _read_merges(split: List[List[int]], i: int, j: int) -> List[Merge]:
    """The merges of the split tree of i..j in post-order, with an explicit stack: each merge
    comes after the merges that build its two parts, the left part's first."""
    merges: List[Merge] = []
    stack = [(i, j, False)]
    while stack:
        lo, hi, parts_built = stack.pop()
        if lo == hi:
            continue  # a single pile is already built
        k = split[lo][hi]
        if parts_built:
            merges.append((lo, k, hi))
        else:
            stack.append((lo, hi, True))
            stack.append((k + 1, hi, False))
            stack.append((lo, k, False))
    return merges


def _fill_merge(piles: Sequence[int]) -> Tuple[List[list], List[List[int]]]:
    """The tables of merge_piles: C(i, j) = sum(piles[i..j]) from prefix sums."""
    _check_non_negative(piles, "pile")
    prefix = _prefix_sums(piles)
    return _fill(len(piles), lambda i, j: prefix[j + 1] - prefix[i])


def _fill_bst(freq: Sequence[int]) -> Tuple[List[list], List[List[int]]]:
    """The tables of optimal_bst, over the n + 1 gaps 0..n between the keys: dp[i][j] is the
    best tree of keys i..j-1, its root k is split[i][j], and C(i, j) = freq[i] + ... + freq[j-1]."""
    _check_non_negative(freq, "frequency")
    prefix = _prefix_sums(freq)
    return _fill(len(freq) + 1, lambda i, j: prefix[j] - prefix[i])


def split_dp(n: int, cost: Cost, knuth: bool = True) -> int:
    """dp[0][n - 1] for dp[i][j] = min over i <= k < j of dp[i][k] + dp[k+1][j] + cost(i, j),
    dp[i][i] = 0, over the points 0..n-1; 0 when n is 0 or 1. cost(i, j) is called once for each
    range of two points or more.

    With knuth=True only the window split[i][j-1]..split[i+1][j] is tried, which gives the right
    answer when cost satisfies the quadrangle inequality and is monotone on intervals. With
    knuth=False every k is tried: the plain interval DP, right for any cost.

    Raises:
        ValueError: n below 0, or a cost below 0.

    Time Complexity: O(n^2) with knuth=True, O(n^3) without (plus the calls of cost)
    Space Complexity: O(n^2)
    """
    if n < 0:
        raise ValueError(f"n is {n}; it must be 0 or more")
    dp, _ = _fill(n, cost, knuth)
    return dp[0][n - 1] if n else 0


def merge_piles(piles: Sequence[int]) -> int:
    """The minimum total cost of merging adjacent piles into one; a merge costs the size of the
    pile it makes. 0 for no piles or one pile. The same answer as Interval DP's merge_piles.

    Raises:
        ValueError: a pile size below 0.

    Time Complexity: O(n^2)
    Space Complexity: O(n^2)
    """
    dp, _ = _fill_merge(piles)
    return dp[0][len(piles) - 1] if piles else 0


def merge_piles_plan(piles: Sequence[int]) -> Tuple[int, List[Merge]]:
    """The minimum cost and one order of merges that reaches it, the same as Interval DP's
    merge_piles_plan: each merge (i, k, j) joins piles i..k with piles k+1..j at a cost of
    sum(i..j), split[i][j] is the smallest k that reaches dp[i][j], and the merges are listed
    in post-order (left part, right part, then the merge that joins them).

    Raises:
        ValueError: a pile size below 0.

    Time Complexity: O(n^2)
    Space Complexity: O(n^2)
    """
    dp, split = _fill_merge(piles)
    n = len(piles)
    if n == 0:
        return 0, []
    return dp[0][n - 1], _read_merges(split, 0, n - 1)


def optimal_bst(freq: Sequence[int]) -> int:
    """The least total search cost of a binary search tree on keys 0..n-1 in order, where key t
    is searched for freq[t] times and a search costs the depth of its key (the root has depth
    1): the minimum of sum(freq[t] * depth(t)). Divide by sum(freq) for the expected cost of
    one search. 0 for no keys.

    Raises:
        ValueError: a frequency below 0.

    Time Complexity: O(n^2)
    Space Complexity: O(n^2)
    """
    dp, _ = _fill_bst(freq)
    return dp[0][len(freq)]


if __name__ == "__main__":
    piles = [3, 2, 4, 1]
    print("merge_piles:", merge_piles(piles))  # 20
    print("merge_piles_plan:", merge_piles_plan(piles))  # (20, [(0, 0, 1), (2, 2, 3), (0, 1, 3)])
    print("optimal_bst:", optimal_bst([34, 8, 50]))  # 142
    # A merge that costs the square root of its size, rounded down, fails the quadrangle
    # inequality: the window misses the best split.
    sizes = [1, 1, 2, 1, 6]
    prefix = _prefix_sums(sizes)
    def root_cost(i: int, j: int) -> int:
        return math.isqrt(prefix[j + 1] - prefix[i])

    print("split_dp:", split_dp(5, root_cost), split_dp(5, root_cost, knuth=False))  # 8 7
