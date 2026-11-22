# Fractional Knapsack

Fractional knapsack fills a knapsack of capacity `W` with items that have a value and a weight, where any fraction of an item may be taken. Taking items in order of value per unit of weight is optimal, in O(n log n) time.

## Intuition

Think of filling a jar with different kinds of sand, each with a price per kilogram. Because you can scoop any amount, you fill the jar with the most valuable sand per kilogram first, then the next, and top it off with a partial scoop of the last one.

Why it is correct (exchange argument): if a full jar holds some low-ratio material while a higher-ratio material is not used up, swap a small weight `d` of the low one for `d` of the high one. The weight is unchanged and the value changes by `d * (high ratio - low ratio)`, which is not negative. Repeating the swap turns any solution into the greedy one without losing value. It needs items to be divisible: that is what lets the swap move exactly `d`.

## Visual

```text
capacity 50, items written value/weight, sorted by ratio:

  60/10 (6)   100/20 (5)   120/30 (4)

bag: |##########|####################|####################|   (1 char = 1 unit of weight, capacity 50)
      item 1     item 2 (whole)        2/3 of item 3 (20 of its 30 units)
      weight 10  weight 20             weight 20

total weight 50, value 60 + 100 + 80 = 240
```

## How It Works

1. Compute `value / weight` for every item. A zero-weight item gets an infinite ratio (it costs no capacity, so it is taken first).
2. Sort the items by ratio, highest first.
3. Walk through them with `remaining = W`. If the whole item fits, take it and subtract its weight. Otherwise take the fraction `remaining / weight` and stop.
4. If `remaining` reaches 0, stop early.

## Step-by-Step Trace

Capacity 50, items `(value, weight)`: `(60, 10)`, `(100, 20)`, `(120, 30)`.

| Item | Ratio | Remaining before | Taken | Value added | Remaining after |
|------|-------|------------------|-------|-------------|-----------------|
| (60, 10) | 6 | 50 | 1 (whole) | 60 | 40 |
| (100, 20) | 5 | 40 | 1 (whole) | 100 | 20 |
| (120, 30) | 4 | 20 | 2/3 | 80 | 0 |

Total value 240. The Python function returns `(240.0, [(60, 10, 1.0), (100, 20, 1.0), (120, 30, 0.6666666666666666)])`.

## Complexity

| Quantity | Cost | Why |
|----------|------|-----|
| Time | O(n log n) | the sort by ratio; the fill is O(n) |
| Space | O(n) | Python sorts a copy; C++ and Go sort the input in place and use O(1) extra |

## When to Use

Use it when the items can be split (liquids, grain, time, budget shares), and as a quick upper bound for 0/1 knapsack. Do not use it when items are indivisible: use dynamic programming instead.

## Fractional vs. 0/1 Knapsack

| | Fractional | 0/1 |
|--|------------|-----|
| Item can be cut | Yes | No |
| Method | greedy by value / weight | dynamic programming |
| Time | O(n log n) | O(n * W) |
| Greedy by ratio optimal | Yes | No |

On the items above with capacity 50, the fractional answer is 240. The 0/1 optimum is 220 (the second and third items), while greedy by ratio would take the first two (value 160) and then find that the third does not fit.

## Common Pitfalls

- **Sorting by value or by weight** instead of by the ratio.
- **Using the greedy for the 0/1 problem.**
- **A zero weight.** `value / weight` would fail; the code gives such items an infinite ratio and takes them whole (earlier versions raised `ZeroDivisionError` in Python and returned NaN in C++ and Go).
- **Capacity of 0 or less** returns 0 immediately, even if a zero-weight item could have been taken.
- **Input order.** C++ and Go sort the vector or slice you pass in; Python does not.
- **Negative values or weights** are not handled; assume non-negative input.
- **Floating point.** C++ and Go use `double` / `float64`, so compare totals with a tolerance.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `fractional_knapsack.py` | `fractional_knapsack` (value and fractions taken), `fractional_knapsack_value_only`; sorts a copy |
| C++ | [C++/](C++/) | `fractional_knapsack.cpp` | `fractionalKnapsack`; returns the value only; sorts the input in place |
| Go | [Go/](Go/) | `main.go` | `FractionalKnapsack`; returns the value only; sorts the input in place |

## Practice Problems

- [Maximum Units on a Truck (LeetCode 1710)](https://leetcode.com/problems/maximum-units-on-a-truck/)
- [Cheese (AtCoder abc229_c)](https://atcoder.jp/contests/abc229/tasks/abc229_c)
- [Maximum Bags With Full Capacity of Rocks (LeetCode 2279)](https://leetcode.com/problems/maximum-bags-with-full-capacity-of-rocks/)
- [Knapsack 1 (AtCoder dp_d)](https://atcoder.jp/contests/dp/tasks/dp_d)

## Related

- [0-1 Knapsack](../../Dynamic_Programming/2D_DP/0_1_Knapsack/) - the indivisible version, solved with dynamic programming
- [Activity Selection](../Activity_Selection/) - another greedy with an exchange-argument proof
- [Job Scheduling](../Job_Scheduling/) - greedy scheduling with deadlines and profits
- [Greedy algorithms overview](../)
