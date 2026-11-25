# Unbounded Knapsack

Given `n` kinds of items, each with a weight and a value, and a bag of capacity `W`, find the best total value of items that fit when **each item can be taken any number of times**. One row `dp[0..W]` solves it in O(n * W) time and O(W) space. The code is the one-row 0/1 knapsack with a single change: the loop over capacities runs **up** instead of down. The same table also gives the fewest coins and the number of ways of [Coin Change](../Coin_Change/).

## Intuition

You can carry 10 kg and the shop has unlimited stock of four items, as (weight, value): (1, 1), (3, 4), (4, 5), (5, 7). These are the items of the [0/1 Knapsack](../../2D_DP/0_1_Knapsack/) topic. There, each item exists once and the best you can carry is 13 (items of 1, 4 and 5 kg). Here you take the 5 kg item twice and carry 14.

Let `dp[w]` be the best value of a bag of capacity `w`. If the bag is not empty, some item `i` is in it; take one copy out and the rest is a bag of capacity `w - weight[i]`, which is best when it is worth `dp[w - weight[i]]`. Unlike the 0/1 knapsack, the rest **may still contain item `i`**: nothing was used up. So

    dp[w] = max(0, max over items i with weight[i] <= w of dp[w - weight[i]] + value[i])

and `dp[w]` reads only entries to its left. Filling the row from `w = 0` up to `W` answers every capacity.

The code computes the same row one item at a time, like the one-row 0/1 knapsack: for each item, `w` runs from the item's weight up to `W`, and `dp[w] = max(dp[w], dp[w - weight] + value)`. Going **up**, `dp[w - weight]` has already been updated for this item, so it may contain the item already, and adding one more copy is allowed. Going **down**, `dp[w - weight]` still holds the value from before this item, so each item is used at most once: that is the 0/1 knapsack. The loop direction is the whole difference.

## Visual

The 2D form of the same computation: row `i` is the best value with only the first `i` items. Each row is the one row after that many items, as `unbounded_knapsack_table` returns it for capacity 10.

```text
 items        w=0  w=1  w=2  w=3  w=4  w=5  w=6  w=7  w=8  w=9  w=10
 none           0    0    0    0    0    0    0    0    0    0    0
 + (1, 1)       0    1    2    3    4    5    6    7    8    9   10
 + (3, 4)       0    1    2    4    5    6    8    9   10   12   13
 + (4, 5)       0    1    2    4    5    6    8    9   10   12   13
 + (5, 7)       0    1    2    4    5    7    8    9   11   12   14   <- answer 14
 choice[w]     -1    0    0    1    1    3    1    1    3    1    3
```

`choice[w]` is the item that last raised `dp[w]`. Walking it back from `w = 10`: item 3 (to `w = 5`), item 3 again (to `w = 0`), where `choice` is -1. The multiset is two copies of item 3, weight 10, value 14.

The item (4, 5) changes nothing: (1, 1) and (3, 4) already reach every value it could, since 4 kg as 3 + 1 is also worth 5.

## How It Works

1. Check the input: as many values as weights, a capacity of 0 or more, and every weight at least 1.
2. Set `dp = [0] * (W + 1)` and `choice = [-1] * (W + 1)`.
3. For each item `i` in input order, and `w` from `weight[i]` **up** to `W`: if `dp[w - weight[i]] + value[i] > dp[w]`, set `dp[w]` to it and `choice[w] = i`.
4. `dp[W]` is the answer (`unbounded_knapsack`).
5. To recover the items (`unbounded_knapsack_items`), start at `w = W`; while `choice[w]` is not -1, count one copy of item `choice[w]` and subtract its weight from `w`.

An item heavier than `W` is never tried: its range of capacities is empty. An item worth 0 or less is never taken, because it never raises an entry. `dp[w]` is the best value within `w`, not exactly `w`, so the multiset can weigh less than `W`: with one item (3, 5) and `W = 7` it is two copies, weight 6.

**The tie rule.** `dp[w]` and `choice[w]` change only on a strict gain, and the items are tried in input order. After item `i`, `dp[w]` is the best value using items `0..i`, so `choice[w]` is the **first item `i` such that items `0..i` alone already reach the best value for `w`**. The walk therefore meets the items in non-increasing index order. With items (2, 3) and (4, 6) and `W = 4`, both 2 + 2 and 4 are worth 6, and the code returns two copies of item 0; list the items the other way round and it returns one copy of the 4 kg item, now item 0. Of two identical items, the first is always the one taken. Python, C++ and Go follow this rule and return the same counts.

**The 2D form and why one row is enough.** `unbounded_knapsack_table` keeps every row:

    table[i][w] = max(table[i-1][w], table[i][w - weight] + value)

Skipping item `i` reads the row above; taking it reads **the same row**, because after one copy the item is still available. (The 0/1 knapsack reads `table[i-1][w - weight]` for the take.) In one row swept upward, when `w` is reached, the cells to its left already hold row `i` and `dp[w]` itself still holds row `i - 1`: exactly the two cells the recurrence reads. So the row after item `i` equals `table[i + 1]`, and the tests check this on random inputs.

**The counts.** With the values dropped and the capacity filled exactly, the same loops count ways:

- `count_combinations(weights, target)`: `ways[0] = 1`, then for each item (outer loop) and each `t` from its weight up to `target`, `ways[t] += ways[t - weight]`. Each multiset is built in item order, so 1 + 2 and 2 + 1 count once.
- `count_permutations(weights, target)`: for each `t` from 1 to `target` (outer loop), add `ways[t - weight]` for every item that fits, as the last item of the sequence. Every order counts.

Items are told apart by position: two items of weight 2 give three combinations of total 4 ({a, a}, {a, b}, {b, b}) and four sequences.

**Bad input.** A weight of 0 is rejected: an item of weight 0 and positive value could be taken without end, so the best value would be infinite. All functions raise `ValueError` in Python, throw `std::invalid_argument` in C++ and return an error wrapping `ErrInvalidInput` in Go, for a weight below 1, a negative capacity or target, and weights and values of different lengths.

## Step-by-Step Trace

The last item, (5, 7), on the row the first three items left, going up (`unbounded_knapsack`). The numbers are those `_relax` sees when the code runs:

| w | reads | candidate | dp[w] before | dp[w] after |
|---|-------|-----------|--------------|-------------|
| 5 | `dp[0] = 0` | 0 + 7 = 7 | 6 | 7, `choice[5] = 3` |
| 6 | `dp[1] = 1` | 8 | 8 | 8 (a tie: no change) |
| 7 | `dp[2] = 2` | 9 | 9 | 9 (a tie) |
| 8 | `dp[3] = 4` | 11 | 10 | 11, `choice[8] = 3` |
| 9 | `dp[4] = 5` | 12 | 12 | 12 (a tie) |
| 10 | `dp[5] = 7` | 14 | 13 | 14, `choice[10] = 3` |

At `w = 10` the cell read, `dp[5] = 7`, was raised by this same item at `w = 5`, earlier in the same pass: the 5 kg item is taken twice.

The same input going down (`zero_one_knapsack`): after the first three items the row is `0, 1, 1, 4, 5, 6, 6, 9, 10, 10, 10`, and the last item starts at `w = 10`. It reads `dp[5] = 6`, which this item has not touched yet, so the candidate is 6 + 7 = 13. The answer is 13, the 0/1 knapsack's answer: `knapsack_01([1, 3, 4, 5], [1, 4, 5, 7], 10)` in the 0/1 Knapsack topic also returns 13. At `W = 7` both directions return 9.

The two counts on the [Coin Change](../Coin_Change/) input, weights 1, 2 and 5 and total 5:

| Order of the loops | `ways[0..5]` | Result |
|--------------------|--------------|--------|
| items outside: after item 1, item 2, item 5 | `1,1,1,1,1,1`, then `1,1,2,2,3,3`, then `1,1,2,2,3,4` | `count_combinations` = 4: 5; 2+2+1; 2+1+1+1; 1+1+1+1+1 |
| totals outside | `1,1,2,3,5,9` | `count_permutations` = 9: 5; three orders of 2+2+1; four of 2+1+1+1; 1+1+1+1+1 |

## Complexity

| Function | Time | Space | Why |
|----------|------|-------|-----|
| `unbounded_knapsack`, `zero_one_knapsack` | O(n * W) | O(W) | item `i` costs `W - weight[i] + 1` updates, or none when it is heavier than `W` |
| `unbounded_knapsack_items` | O(n * W) | O(W) | the fill, then a walk of at most `W` steps (every weight is at least 1) |
| `unbounded_knapsack_table` | O(n * W) | O(n * W) | `(n + 1)(W + 1)` cells |
| `count_combinations`, `count_permutations` | O(n * target) | O(target) | one update per (item, total) pair |

Counted on the Python code (the number of `dp[w] = max(...)` updates, for the four items of the example):

| W | bits to write W | updates |
|---|-----------------|---------|
| 10 | 4 | 31 |
| 1,000 | 10 | 3,991 |
| 100,000 | 17 | 399,991 |
| 1,000,000 | 20 | 3,999,991 |

The work grows with the **value** of `W`, while the input grows only with its length in bits: each extra bit doubles `W` and the work. That is pseudo-polynomial time, as for the 0/1 knapsack.

**Overflow.** Python's integers do not overflow. C++ and Go keep values and counts in signed 64-bit integers and report a result above 2^63 - 1 instead of wrapping: `std::overflow_error` in C++, an error wrapping `ErrOverflow` in Go. Two copies of an item worth 2^62 overflow (Python returns 2^63); `count_permutations([1, 2], 91)` is 7540113804746346429 and fits, and `92` does not. An overflow is reported only when the target's own count does not fit: `count_permutations([2, 4], 191)` returns 0 in all three languages, although `ways[190]` passes 2^63.

## When to Use

Use it when:
- every item can be used again: cutting a rod or ribbon into pieces of given lengths, buying from unlimited stock, paying with coins;
- the capacity is a moderate integer (`n * W` up to about 10^8);
- you need the exact optimum, or the number of ways to reach a total.

Do not use it when:
- each item exists once (the [0/1 Knapsack](../../2D_DP/0_1_Knapsack/), the same loop going down) or `k` times (bounded knapsack);
- items can be cut (fractional knapsack: greedy by value per weight);
- `W` is huge: the row has `W + 1` entries and every item sweeps it.

## Unbounded Knapsack vs. Alternatives

Greedy by value per weight is not optimal here either. With items (3, 5) and (4, 7) and `W = 6`, greedy takes the better ratio, one copy of (4, 7), and then nothing else fits: value 7. Two copies of (3, 5) are worth 10, and `unbounded_knapsack([3, 4], [5, 7], 6)` returns 10.

| Problem | Items | Loop over capacities | Time |
|---------|-------|----------------------|------|
| Unbounded knapsack | any number of copies | up | O(n * W) |
| 0/1 knapsack | each at most once | down | O(n * W) |
| Bounded knapsack | item `i` up to `k[i]` times | down, after splitting into 0/1 items | O(n * W * log k) |
| Fractional knapsack | can be cut | none: greedy by ratio | O(n log n) |
| Coin Change, fewest coins | coins reusable, total exact, minimize the count | up | O(n * A) |
| Coin Change, number of ways | coins reusable, total exact, count | up; items outside for combinations, totals outside for permutations | O(n * A) |

Coin Change is the unbounded knapsack with every value 1, the total filled exactly, and a minimum instead of a maximum: `coin_change_min_coins([1, 2, 5], 11)` returns 3. Its `coin_change_ways` is `count_combinations` and returns the same 4 on the example above.

## Common Pitfalls

1. **The loop direction.** Up reuses an item, down uses it once. With one item (2, 3) and `W = 4`, up gives 6 and down gives 3. Copying the 0/1 knapsack loop gives the 0/1 answer without any error.
2. **The loop order when counting.** Items outside count combinations, totals outside count permutations: 4 against 9 above. For the value itself the order does not matter.
3. **Weight 0.** An item of weight 0 and positive value makes the answer infinite, and a walk back from `choice[]` would never move. The code rejects every weight below 1.
4. **Exactly `W` or at most `W`.** Starting from `dp = [0] * (W + 1)` gives the best within `W`. To fill `W` exactly (as Coin Change does), start with `dp[0] = 0` and every other entry at minus infinity (plus infinity for a minimum).
5. **Equal values.** Use a strict `>` and decide the order of the items, or the multiset you return changes with the code.
6. **Overflow in C++ and Go.** Counts grow exponentially: the number of sequences of 1s and 2s passes 2^63 at a total of 92.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `unbounded_knapsack.py` | `unbounded_knapsack`, `unbounded_knapsack_items`, `unbounded_knapsack_table`, `zero_one_knapsack`, `count_combinations`, `count_permutations`; `ValueError` on bad input |
| C++ | [C++/](C++/) | `unbounded_knapsack.cpp` | `unboundedKnapsack`, `unboundedKnapsackItems` (a `KnapsackChoice` struct), `unboundedKnapsackTable`, `zeroOneKnapsack`, `countCombinations`, `countPermutations`; `long long`; `std::invalid_argument`, `std::overflow_error` |
| Go | [Go/](Go/) | `main.go` | `UnboundedKnapsack`, `UnboundedKnapsackItems`, `UnboundedKnapsackTable`, `ZeroOneKnapsack`, `CountCombinations`, `CountPermutations`; `int64`; errors wrapping `ErrInvalidInput` or `ErrOverflow` |

All three take the weights, the values and the capacity in the same order, try the items in input order and return the same values and counts: the C++ and Go tests check 44 knapsack inputs and 24 count inputs against outputs of the Python code.

## Practice Problems

- [Knapsack (HackerRank unbounded-knapsack)](https://www.hackerrank.com/challenges/unbounded-knapsack/problem): the value of each item is its weight; the best sum not above `k`.
- [Minimizing Coins (CSES 1634)](https://cses.fi/problemset/task/1634): the minimum version, with the total filled exactly.
- [Coin Combinations I (CSES 1635)](https://cses.fi/problemset/task/1635): ordered ways, totals in the outer loop; `count_permutations([2, 3, 5], 9)` is the example's 8.
- [Coin Combinations II (CSES 1636)](https://cses.fi/problemset/task/1636): ways without order, coins in the outer loop; `count_combinations([2, 3, 5], 9)` is the example's 3.
- [Form Largest Integer With Digits That Add up to Target (LeetCode 1449)](https://leetcode.com/problems/form-largest-integer-with-digits-that-add-up-to-target/): fill a cost exactly with as many digits as possible, then rebuild the largest number with a tie rule of your own.

## Related

- [0/1 Knapsack](../../2D_DP/0_1_Knapsack/): each item at most once, the same row swept down
- [Coin Change](../Coin_Change/): the minimum and the counting versions with every value 1
- [Fractional Knapsack](../../../Greedy/Fractional_Knapsack/): items that can be cut, solved by greedy
- [Climbing Stairs](../../Basic_DP/Climbing_Stairs/): `count_permutations` with the step sizes as weights
- [Linear DP overview](../README.md)
