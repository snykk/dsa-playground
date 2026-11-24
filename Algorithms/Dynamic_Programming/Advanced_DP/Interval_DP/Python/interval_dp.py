"""
Interval DP: the best way to handle a contiguous range i..j, built from the best ways to handle
shorter ranges inside it.

dp[i][j] answers the question for the range i..j alone. Its value comes from one choice inside
the range: a split point k, or the last action taken in it. Each choice leaves two shorter
ranges, whose answers are already in the table, because the table is filled by increasing
length: every range of length 2, then 3, up to n. With about n^2 / 2 cells and up to n - 1
choices each, that is O(n^3) time and O(n^2) space.

Three problems use the pattern:

- merge_piles: n piles in a row; merging two adjacent piles costs the size of the pile it
  makes. The minimum total cost of merging all of them into one pile. Whatever the order, the
  last merge of piles i..j joins i..k with k+1..j for some k and costs sum(i..j):

      dp[i][j] = min over i <= k < j of dp[i][k] + dp[k+1][j] + sum(i..j)

  merge_piles_plan also returns the merges, read back from split[i][j], the k that won.
  merge_piles_memo is the same recurrence top-down with a memo: it computes the same cells.
- burst_balloons: bursting balloon k earns left * nums[k] * right, with left and right its
  neighbours at that moment (1 past either end). The balloon burst LAST between two balloons
  that stay, left and right, has exactly those two as neighbours, and the two sides of it
  never touch each other:

      dp[left][right] = max over left < k < right of dp[left][k] + v[left] * v[k] * v[right] + dp[k][right]

- min_palindrome_cuts: the fewest cuts that split s into palindromes. An O(n^2) table, filled
  by length too, says which ranges are palindromes; a palindrome needs no cut, and any other
  range has a first cut after some k:

      cuts[i][j] = 0 if s[i..j] is a palindrome, else min over i <= k < j of cuts[i][k] + 1 + cuts[k+1][j]

Tie rule (merge_piles_plan): the splits k are tried in increasing order and dp[i][j] changes
only on a strict gain, so split[i][j] is the smallest k that reaches the minimum. The merges
come in the order of a post-order walk of the split tree: the merges that build the left part,
then those that build the right part, then the merge that joins the two. The C++ and Go
versions follow the same rule and return the same merges.

Pile sizes and balloon values must be 0 or more (ValueError otherwise). No piles costs 0, no
balloons earn 0, and the empty string needs 0 cuts. Python's integers do not overflow.
"""

from typing import List, Sequence, Tuple

INF = float("inf")

# One merge (i, k, j): the pile made of piles i..k joins the pile made of piles k+1..j.
Merge = Tuple[int, int, int]


def _check_non_negative(values: Sequence[int], what: str) -> None:
    for i, value in enumerate(values):
        if value < 0:
            raise ValueError(f"{what} {i} is {value}; every {what} must be 0 or more")


def _prefix_sums(piles: Sequence[int]) -> List[int]:
    """prefix[t] = piles[0] + ... + piles[t - 1], so sum(i..j) = prefix[j + 1] - prefix[i]."""
    prefix = [0] * (len(piles) + 1)
    for t, size in enumerate(piles):
        prefix[t + 1] = prefix[t] + size
    return prefix


def _try_split(dp: List[list], split: List[List[int]], prefix: List[int], i: int, k: int, j: int) -> None:
    """One candidate for dp[i][j]: the last merge joins i..k and k+1..j. A strict gain keeps k."""
    cost = dp[i][k] + dp[k + 1][j] + prefix[j + 1] - prefix[i]
    if cost < dp[i][j]:
        dp[i][j] = cost
        split[i][j] = k


def _fill_merge(piles: Sequence[int]) -> Tuple[List[list], List[List[int]], List[int]]:
    """Bottom-up: dp[i][j], the minimum cost of merging piles i..j; split[i][j], the smallest k
    that reaches it (-1 when i == j, and below the diagonal); and the prefix sums."""
    _check_non_negative(piles, "pile")
    n = len(piles)
    prefix = _prefix_sums(piles)
    dp = [[0] * n for _ in range(n)]
    split = [[-1] * n for _ in range(n)]
    for length in range(2, n + 1):  # i..k and k+1..j are shorter, so they are already final
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i][j] = INF
            for k in range(i, j):
                _try_split(dp, split, prefix, i, k, j)
    return dp, split, prefix


def _fill_merge_memo(piles: Sequence[int]) -> Tuple[List[list], List[List[int]], List[int]]:
    """Top-down: the same tables, each cell computed once, when a larger range first asks for it.
    The recursion goes up to n calls deep."""
    _check_non_negative(piles, "pile")
    n = len(piles)
    prefix = _prefix_sums(piles)
    dp = [[0] * n for _ in range(n)]
    split = [[-1] * n for _ in range(n)]
    solved = [[i == j for j in range(n)] for i in range(n)]

    def solve(i: int, j: int) -> None:
        if solved[i][j]:
            return
        dp[i][j] = INF
        for k in range(i, j):
            solve(i, k)
            solve(k + 1, j)
            _try_split(dp, split, prefix, i, k, j)
        solved[i][j] = True

    if n:
        solve(0, n - 1)
    return dp, split, prefix


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


def merge_piles(piles: Sequence[int]) -> int:
    """The minimum total cost of merging adjacent piles into one; a merge costs the size of the
    pile it makes. 0 for no piles or one pile.

    Raises:
        ValueError: a pile size below 0.

    Time Complexity: O(n^3)
    Space Complexity: O(n^2)
    """
    dp, _, _ = _fill_merge(piles)
    return dp[0][len(piles) - 1] if piles else 0


def merge_piles_plan(piles: Sequence[int]) -> Tuple[int, List[Merge]]:
    """The minimum cost and one order of merges that reaches it.

    Each merge is (i, k, j): the pile made of piles i..k joins the pile made of piles k+1..j,
    at a cost of sum(i..j). split[i][j] is the smallest k that reaches dp[i][j], and the merges
    are listed in post-order (left part, right part, then the merge that joins them), so their
    costs add up to the minimum and the list is the same in every language.

    Raises:
        ValueError: a pile size below 0.

    Time Complexity: O(n^3)
    Space Complexity: O(n^2)
    """
    dp, split, _ = _fill_merge(piles)
    n = len(piles)
    if n == 0:
        return 0, []
    return dp[0][n - 1], _read_merges(split, 0, n - 1)


def merge_piles_memo(piles: Sequence[int]) -> int:
    """merge_piles computed top-down: the same recurrence, the same cells and the same answer.

    Raises:
        ValueError: a pile size below 0.
        RecursionError: about 1000 piles or more (the recursion goes n calls deep).

    Time Complexity: O(n^3)
    Space Complexity: O(n^2)
    """
    dp, _, _ = _fill_merge_memo(piles)
    return dp[0][len(piles) - 1] if piles else 0


def _try_last(dp: List[List[int]], vals: List[int], left: int, k: int, right: int) -> None:
    """One candidate for dp[left][right]: balloon k is burst last between left and right, which
    are still there, so it earns vals[left] * vals[k] * vals[right]. A strict gain keeps it."""
    coins = dp[left][k] + vals[left] * vals[k] * vals[right] + dp[k][right]
    if coins > dp[left][right]:
        dp[left][right] = coins


def burst_balloons(nums: Sequence[int]) -> int:
    """The most coins from bursting every balloon, where bursting a balloon earns the product of
    its value and its current neighbours' values (1 past either end).

    vals is nums with a 1 added at each end, and dp[left][right] is the best for the balloons
    strictly between left and right, with left and right still there.

    Raises:
        ValueError: a balloon value below 0.

    Time Complexity: O(n^3)
    Space Complexity: O(n^2)
    """
    _check_non_negative(nums, "balloon")
    vals = [1] + list(nums) + [1]
    m = len(vals)
    dp = [[0] * m for _ in range(m)]
    for gap in range(2, m):  # right - left: the open range holds gap - 1 balloons
        for left in range(m - gap):
            right = left + gap
            for k in range(left + 1, right):
                _try_last(dp, vals, left, k, right)
    return dp[0][m - 1]


def _palindrome_table(s: Sequence) -> List[List[bool]]:
    """pal[i][j]: s[i..j] reads the same both ways. Filled by length, since it reads the range
    one shorter at each end. O(n^2) time and space."""
    n = len(s)
    pal = [[False] * n for _ in range(n)]
    for length in range(1, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            pal[i][j] = s[i] == s[j] and (length <= 2 or pal[i + 1][j - 1])
    return pal


def _try_cut(cuts: List[List[int]], i: int, k: int, j: int) -> None:
    """One candidate for cuts[i][j]: cut after position k."""
    candidate = cuts[i][k] + 1 + cuts[k + 1][j]
    if candidate < cuts[i][j]:
        cuts[i][j] = candidate


def min_palindrome_cuts(s: Sequence) -> int:
    """The fewest cuts that split s into pieces that are all palindromes. 0 for the empty string
    and for a palindrome. Characters are compared with ==, so a str is compared by code point.

    Time Complexity: O(n^3) (the palindrome table alone is O(n^2))
    Space Complexity: O(n^2)
    """
    n = len(s)
    if n == 0:
        return 0
    pal = _palindrome_table(s)
    cuts = [[0] * n for _ in range(n)]
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            if pal[i][j]:
                continue  # a palindrome needs no cut: cuts[i][j] stays 0
            cuts[i][j] = j - i  # a cut between every two neighbours is always enough
            for k in range(i, j):
                _try_cut(cuts, i, k, j)
    return cuts[0][n - 1]


if __name__ == "__main__":
    piles = [3, 2, 4, 1]
    print("merge_piles:", merge_piles(piles))  # 20
    print("merge_piles_plan:", merge_piles_plan(piles))  # (20, [(0, 0, 1), (2, 2, 3), (0, 1, 3)])
    print("merge_piles_memo:", merge_piles_memo(piles))  # 20
    print("burst_balloons:", burst_balloons([3, 1, 5, 8]))  # 167
    print("min_palindrome_cuts:", min_palindrome_cuts("aab"))  # 1
