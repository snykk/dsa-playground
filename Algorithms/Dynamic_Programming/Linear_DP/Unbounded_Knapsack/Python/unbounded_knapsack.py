"""
Unbounded Knapsack: the best total value within a capacity when every item may be taken any
number of times.

Item i weighs weights[i] (an integer, at least 1) and is worth values[i]. One row dp[0..W]
holds, for every capacity w, the best value of a multiset of items whose total weight is at
most w. For each item in input order, w runs UP from the item's weight to W:

    dp[w] = max(dp[w], dp[w - weight] + value)

Going up, dp[w - weight] has already been updated for this item, so it may contain the item
already, and taking it again is allowed: that is the reuse. Run the same loop DOWN and
dp[w - weight] still holds the value from before this item, so each item is used at most once:
the 0/1 knapsack. The loop direction is the whole difference (zero_one_knapsack).

- unbounded_knapsack: the best value.
- unbounded_knapsack_items: the best value and one optimal multiset, as a count per item.
- unbounded_knapsack_table: the 2D form, dp[i][w] over the first i items.
- zero_one_knapsack: the same one-row loop with w going down (each item at most once).
- count_combinations / count_permutations: the number of ways to fill a total exactly, with
  the items outside (combinations: order ignored) or the totals outside (permutations: every
  order counted).

Tie rule: dp[w] and choice[w] change only on a strict gain, and the items are tried in input
order. So choice[w] is the first item i such that items 0..i alone already reach the best value
for w, and the multiset read back from choice[] is fixed. The C++ and Go versions follow the
same order and return the same counts.

An item must weigh at least 1: an item of weight 0 and positive value could be taken without
end, so every function rejects weight 0 (and negative weights) with ValueError. A negative
capacity or target, and weights and values of different lengths, raise ValueError too. An
item heavier than the capacity is never tried, and an item of value 0 or less is never taken.
"""

from typing import List, Sequence, Tuple


def _check_weights(weights: Sequence[int]) -> None:
    for i, weight in enumerate(weights):
        if weight < 1:
            raise ValueError(f"item {i} has weight {weight}; every weight must be at least 1")


def _check_items(weights: Sequence[int], values: Sequence[int], capacity: int) -> None:
    if len(weights) != len(values):
        raise ValueError(f"{len(weights)} weights but {len(values)} values")
    if capacity < 0:
        raise ValueError(f"capacity must be >= 0, got {capacity}")
    _check_weights(weights)


def _relax(dp: List[int], choice: List[int], item: int, w: int, rest: int, value: int) -> None:
    """dp[w] = max(dp[w], dp[rest] + value); a strict gain makes item the choice for w."""
    candidate = dp[rest] + value
    if candidate > dp[w]:
        dp[w] = candidate
        choice[w] = item


def _fill_row(weights: Sequence[int], values: Sequence[int], capacity: int, upward: bool) -> Tuple[List[int], List[int]]:
    """The one-row table and, for every w, the item that last raised dp[w] (-1: none)."""
    _check_items(weights, values, capacity)
    dp = [0] * (capacity + 1)
    choice = [-1] * (capacity + 1)
    for i in range(len(weights)):
        weight = weights[i]
        if upward:
            capacities = range(weight, capacity + 1)  # dp[w - weight] may already hold item i
        else:
            capacities = range(capacity, weight - 1, -1)  # dp[w - weight] is still the old value
        for w in capacities:
            _relax(dp, choice, i, w, w - weight, values[i])
    return dp, choice


def unbounded_knapsack(weights: Sequence[int], values: Sequence[int], capacity: int) -> int:
    """The best total value of items that fit in capacity, each item usable any number of times.

    Raises:
        ValueError: lengths differ, capacity < 0, or a weight below 1.

    Time Complexity: O(n * W), n items and W = capacity
    Space Complexity: O(W)
    """
    return _fill_row(weights, values, capacity, upward=True)[0][capacity]


def zero_one_knapsack(weights: Sequence[int], values: Sequence[int], capacity: int) -> int:
    """The same one-row loop with w going down: each item at most once (the 0/1 knapsack).

    It takes the same input and raises the same errors as unbounded_knapsack, so the two can
    be compared on any input; only the direction of the loop over w differs.

    Time Complexity: O(n * W)
    Space Complexity: O(W)
    """
    return _fill_row(weights, values, capacity, upward=False)[0][capacity]


def unbounded_knapsack_items(weights: Sequence[int], values: Sequence[int], capacity: int) -> Tuple[int, List[int]]:
    """The best value and one optimal multiset, as counts[i] = copies of item i taken.

    The walk starts at w = capacity, takes choice[w] and moves to w - its weight, until
    choice[w] is -1. choice[w] is the first item, in input order, with which dp[w] reaches its
    final value, so the walk meets the items in non-increasing index order and the counts are
    the same in every language. The counts reach the value and their weight is at most the
    capacity (it can be less: dp[w] is the best within w, not exactly w).

    Raises:
        ValueError: as unbounded_knapsack.

    Time Complexity: O(n * W)
    Space Complexity: O(W)
    """
    dp, choice = _fill_row(weights, values, capacity, upward=True)
    counts = [0] * len(weights)
    w = capacity
    while choice[w] != -1:
        item = choice[w]
        counts[item] += 1
        w -= weights[item]
    return dp[capacity], counts


def unbounded_knapsack_table(weights: Sequence[int], values: Sequence[int], capacity: int) -> List[List[int]]:
    """The 2D form: table[i][w] is the best value within w using only the first i items.

        table[i][w] = max(table[i-1][w], table[i][w - weight] + value)

    Taking the item reads row i itself (the 0/1 knapsack reads row i - 1), which is why one
    row swept upward computes the same numbers: after item i, the row equals table[i + 1].

    Raises:
        ValueError: as unbounded_knapsack.

    Time Complexity: O(n * W)
    Space Complexity: O(n * W)
    """
    _check_items(weights, values, capacity)
    n = len(weights)
    table = [[0] * (capacity + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        weight, value = weights[i - 1], values[i - 1]
        for w in range(capacity + 1):
            table[i][w] = table[i - 1][w]
            if weight <= w and table[i][w - weight] + value > table[i][w]:
                table[i][w] = table[i][w - weight] + value
    return table


def count_combinations(weights: Sequence[int], target: int) -> int:
    """The number of multisets of items whose weights add up to exactly target.

    Items are told apart by position, so two items of the same weight are two different
    items. The items are the outer loop: every multiset is built in item order and counted
    once (1 + 2 and 2 + 1 are the same combination). target 0 has one way, the empty one.

    Raises:
        ValueError: target < 0, or a weight below 1.

    Time Complexity: O(n * target)
    Space Complexity: O(target)
    """
    if target < 0:
        raise ValueError(f"target must be >= 0, got {target}")
    _check_weights(weights)
    ways = [1] + [0] * target
    for weight in weights:  # items outside
        for t in range(weight, target + 1):
            ways[t] += ways[t - weight]
    return ways[target]


def count_permutations(weights: Sequence[int], target: int) -> int:
    """The number of sequences of items whose weights add up to exactly target.

    The totals are the outer loop: ways[t] adds ways[t - weight] for every possible LAST item,
    so every order is counted (1 + 2 and 2 + 1 are two sequences). target 0 has one way.

    Raises:
        ValueError: target < 0, or a weight below 1.

    Time Complexity: O(n * target)
    Space Complexity: O(target)
    """
    if target < 0:
        raise ValueError(f"target must be >= 0, got {target}")
    _check_weights(weights)
    ways = [1] + [0] * target
    for t in range(1, target + 1):  # totals outside
        for weight in weights:
            if weight <= t:
                ways[t] += ways[t - weight]
    return ways[target]


if __name__ == "__main__":
    # The items of the 0/1 Knapsack topic, with capacity 10.
    weights, values = [1, 3, 4, 5], [1, 4, 5, 7]
    print("unbounded:", unbounded_knapsack(weights, values, 10))  # 14
    print("items:", unbounded_knapsack_items(weights, values, 10))  # (14, [0, 0, 0, 2])
    print("each item once:", zero_one_knapsack(weights, values, 10))  # 13
    print("table, last row:", unbounded_knapsack_table(weights, values, 10)[-1])
    # The two counts on one input: weights 1, 2 and 5 filling exactly 5.
    print("combinations:", count_combinations([1, 2, 5], 5))  # 4
    print("permutations:", count_permutations([1, 2, 5], 5))  # 9
