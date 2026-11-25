"""
Divide and Conquer Optimization: a layered DP

    dp[g][i] = min over j < i of dp[g - 1][j] + C(j, i)

computed in O(n log n) per layer instead of O(n^2), when the best j, opt(g, i), never moves
left as i grows: opt(g, i) <= opt(g, i + 1).

The example problem: split values (n numbers, each >= 0) into exactly k contiguous, non-empty
groups so that the sum over the groups of (sum of the group)^2 is as small as possible. The
square punishes a heavy group, so the best split balances the sums. dp[g][i] is the best cost
of the first i values in g groups, and C(j, i) = (P[i] - P[j])^2 is the cost of the group
values[j:i], read in O(1) from the prefix sums P.

One layer, computed by _solve_range(lo, hi, opt_lo, opt_hi): take the middle cell
mid = (lo + hi) // 2, try every j in [opt_lo, min(opt_hi, mid - 1)], then solve the left half
with j up to opt(mid) and the right half with j from opt(mid). Each depth of the recursion
tries at most m + (number of calls) values of j for a layer of m cells, and there are about
log2(m) depths: O(m log m) per layer and O(k n log n) in all, against O(k n^2) for the plain
DP (min_cost_partition_plain), which tries every j for every i.

When it is correct: if C satisfies the quadrangle inequality

    C(a, c) + C(b, d) <= C(a, d) + C(b, c)    for all a <= b <= c <= d,

then the smallest best j is monotone and the recursion never cuts it off. For the square of
the group sum, C(a, c) + C(b, d) - C(a, d) - C(b, c) = -2 (P[b] - P[a]) (P[d] - P[c]), which is
<= 0 when P never decreases, that is when every value is >= 0. With a negative value the
inequality can fail, opt can move left, and the recursion returns a cost that is too high:
partition_dp(..., optimized=True) and (..., optimized=False) then differ. The two concrete
functions therefore reject negative values with ValueError.

Tie rule: opt(g, i) is the SMALLEST j that reaches the minimum (j is tried in increasing order
and only a strictly smaller candidate replaces the best). The plain DP and the recursion use
the same _best_split, so they return the same bounds, and the C++ and Go versions follow the
same rule.

k must be between 1 and n: groups are not empty, so k > n (and any k for an empty list) raises
ValueError. Python's integers do not overflow.
"""

from itertools import accumulate
from typing import Callable, List, Sequence, Tuple

Cost = Callable[[int, int], int]


def _check_k(n: int, k: int) -> None:
    if k < 1:
        raise ValueError(f"k must be at least 1, got {k}")
    if k > n:
        raise ValueError(f"cannot split {n} values into {k} non-empty groups")


def _prefix_sums(values: Sequence[int]) -> List[int]:
    """P[i] = values[0] + ... + values[i - 1]; every value must be >= 0."""
    for t, v in enumerate(values):
        if v < 0:
            raise ValueError(f"values[{t}] = {v}; every value must be >= 0 (see partition_dp for any cost)")
    return list(accumulate(values, initial=0))


def _group_cost(prefix: List[int], j: int, i: int) -> int:
    """The cost of the group values[j:i]: the square of its sum."""
    s = prefix[i] - prefix[j]
    return s * s


def _best_split(prev: List[int], cost: Cost, i: int, j_lo: int, j_hi: int) -> Tuple[int, int]:
    """min over j in [j_lo, j_hi] of prev[j] + cost(j, i), and the smallest j that reaches it."""
    best, best_j = prev[j_lo] + cost(j_lo, i), j_lo
    for j in range(j_lo + 1, j_hi + 1):
        candidate = prev[j] + cost(j, i)
        if candidate < best:
            best, best_j = candidate, j
    return best, best_j


def _solve_range(prev: List[int], cur: List[int], opt_row: List[int], cost: Cost, g: int, lo: int, hi: int, opt_lo: int, opt_hi: int) -> None:
    """Fill cur[i] and opt_row[i] for every i in [lo, hi] of layer g, given opt in [opt_lo, opt_hi]."""
    if lo > hi:
        return
    mid = (lo + hi) // 2
    # j < mid keeps the group values[j:mid] non-empty; j >= g - 1 leaves g - 1 values for g - 1 groups.
    cur[mid], opt_row[mid] = _best_split(prev, cost, mid, max(opt_lo, g - 1), min(opt_hi, mid - 1))
    _solve_range(prev, cur, opt_row, cost, g, lo, mid - 1, opt_lo, opt_row[mid])  # left: j <= opt(mid)
    _solve_range(prev, cur, opt_row, cost, g, mid + 1, hi, opt_row[mid], opt_hi)  # right: j >= opt(mid)


def partition_dp(n: int, k: int, cost: Cost, optimized: bool = True) -> Tuple[int, List[int]]:
    """Split positions 0..n-1 into k non-empty contiguous groups, minimizing the sum of cost(j, i)
    over the groups [j, i). Returns (best total, bounds): group g is [bounds[g], bounds[g + 1]).

    optimized=True computes each layer with the divide-and-conquer recursion, which is correct
    only when the smallest best j is monotone in i (the quadrangle inequality on cost is
    enough); optimized=False is the plain DP, correct for any cost. Both apply the same tie rule.

    Raises:
        ValueError: k < 1 or k > n.

    Time Complexity: O(k n log n) cost calls optimized, O(k n^2) plain
    Space Complexity: O(k n) for the best j of every cell, which rebuilds the groups
    """
    _check_k(n, k)
    opt = [[0] * (n + 1) for _ in range(k + 1)]
    prev = [0] * (n + 1)
    for i in range(1, n + 1):
        prev[i] = cost(0, i)  # layer 1: one group, values[0:i]
    for g in range(2, k + 1):
        cur = [0] * (n + 1)
        if optimized:
            _solve_range(prev, cur, opt[g], cost, g, g, n, g - 1, n - 1)
        else:
            for i in range(g, n + 1):
                cur[i], opt[g][i] = _best_split(prev, cost, i, g - 1, i - 1)
        prev = cur
    bounds = [0] * (k + 1)
    bounds[k] = n
    for g in range(k, 1, -1):
        bounds[g - 1] = opt[g][bounds[g]]
    return prev[n], bounds


def min_cost_partition(values: Sequence[int], k: int) -> Tuple[int, List[int]]:
    """The smallest sum of (group sum)^2 over k contiguous non-empty groups, and the bounds.

    Computed with the divide-and-conquer optimization. bounds has k + 1 entries,
    0 = bounds[0] < bounds[1] < ... < bounds[k] = len(values), and group g is
    values[bounds[g]:bounds[g + 1]]. Of several best splits it returns the one whose last
    cut is smallest, then the cut before it, and so on (the tie rule above).

    Raises:
        ValueError: a negative value, k < 1, or k > len(values).

    Time Complexity: O(k n log n)
    Space Complexity: O(k n)
    """
    _check_k(len(values), k)
    prefix = _prefix_sums(values)
    return partition_dp(len(values), k, lambda j, i: _group_cost(prefix, j, i), optimized=True)


def min_cost_partition_plain(values: Sequence[int], k: int) -> Tuple[int, List[int]]:
    """The same answer and bounds as min_cost_partition, from the plain O(k n^2) DP.

    Raises:
        ValueError: as min_cost_partition.

    Time Complexity: O(k n^2)
    Space Complexity: O(k n)
    """
    _check_k(len(values), k)
    prefix = _prefix_sums(values)
    return partition_dp(len(values), k, lambda j, i: _group_cost(prefix, j, i), optimized=False)


if __name__ == "__main__":
    values = [3, 1, 4, 1, 5, 9, 2, 6]
    cost, bounds = min_cost_partition(values, 3)
    print("cost:", cost)  # 341
    print("bounds:", bounds)  # [0, 4, 6, 8]
    print("groups:", [values[bounds[g]:bounds[g + 1]] for g in range(3)])  # [[3, 1, 4, 1], [5, 9], [2, 6]]
    print("plain DP:", min_cost_partition_plain(values, 3))  # (341, [0, 4, 6, 8])
    # A negative value breaks the quadrangle inequality, and the recursion misses the best split.
    with_negative = [1, 2, 4, -5]
    prefix = list(accumulate(with_negative, initial=0))
    square = lambda j, i: (prefix[i] - prefix[j]) ** 2  # noqa: E731
    print("optimized:", partition_dp(4, 2, square, optimized=True))  # (10, [0, 2, 4]): wrong
    print("plain:", partition_dp(4, 2, square, optimized=False))  # (2, [0, 1, 4])
