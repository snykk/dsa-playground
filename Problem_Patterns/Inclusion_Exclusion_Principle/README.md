# Inclusion-Exclusion Principle

Inclusion-exclusion counts the elements that satisfy at least one of several conditions: add the sizes of the sets, subtract the pairwise intersections, add the triple intersections, and so on. It costs 2^k terms for k conditions, so it is for small k.

## Intuition

A plain sum counts an element once for every set it belongs to. The alternating sum corrects that layer by layer. An element lying in exactly m sets is counted C(m,1) - C(m,2) + C(m,3) - ... times, which equals 1 for every m >= 1, so each element of the union is counted exactly once.

```text
|A1 u ... u Ak| = sum over non-empty subsets S of (-1)^(|S|+1) * |intersection of the sets in S|
```

Signals: "divisible by at least one of", "size of the union", "none of these properties" (total minus the union), and a small number of conditions.

## Visual

```text
Numbers 1..30 divisible by 4 or 6:

multiples of 4:  4  8 12 16 20 24 28        7 numbers
multiples of 6:  6 12 18 24 30              5 numbers
both (lcm 12):  12 24                       2 numbers

union = 7 + 5 - 2 = 10:  4 6 8 12 16 18 20 24 28 30
```

## How It Works

1. Loop `mask` from 1 to 2^k - 1; bit j means condition j is in the subset.
2. Count the intersection of the subset. For divisibility it is `n / lcm` of the chosen divisors; for explicit sets, intersect the sets, starting from the first set in the subset.
3. Add the term when the subset size is odd, subtract it when even.
4. For divisors, build the lcm with `lcm = lcm / gcd(lcm, d) * d`, and skip the subset once the lcm exceeds `n` (its term is 0 and the product could overflow).

## Step-by-Step Trace

`count_divisible(100, [2, 3, 5])` returns 74.

| Subset | lcm | n / lcm | Sign | Running total |
|--------|-----|---------|------|---------------|
| {2} | 2 | 50 | + | 50 |
| {3} | 3 | 33 | + | 83 |
| {2, 3} | 6 | 16 | - | 67 |
| {5} | 5 | 20 | + | 87 |
| {2, 5} | 10 | 10 | - | 77 |
| {3, 5} | 15 | 6 | - | 71 |
| {2, 3, 5} | 30 | 3 | + | 74 |

For sets A={1,2,3}, B={2,3,4}, C={3,4,5}: 9 (singles) - 5 (pairs: 2+1+2) + 1 (triple) = 5, which `count_union_sets` returns.

## Complexity

| Function | Time | Space |
|----------|------|-------|
| `count_divisible(n, divisors)` | O(2^k * k log n) | O(1) |
| `count_union_sets(sets)` | O(2^m * m * s) for m sets of up to s elements | O(s) |
| `gcd(a, b)` | O(log min(a, b)) | O(1) |

The 2^k factor dominates: k = 20 is about a million subsets, k = 40 is infeasible.

## When to Use

Use it when conditions overlap, intersections are easy to count and k is small (about 20 or fewer). Do not use it for large k, or when the conditions are independent and a product formula exists.

## Inclusion-Exclusion vs. Alternatives

| Approach | Good for | Cost |
|----------|----------|------|
| Inclusion-exclusion | overlapping conditions, small k | O(2^k) terms |
| Direct enumeration | small n | O(n) checks |
| Sieve / marking | all numbers up to a moderate n | O(n log log n) |
| Complement and product | independent conditions | O(k) |

## Common Pitfalls

- Starting each intersection from `sets[0]` instead of the first set in the subset (the bug this code used to have).
- Using the product of the divisors instead of the lcm.
- Integer overflow while building the lcm; C++ and Go here skip a subset once the lcm exceeds `n`.
- Wrong sign: the union adds odd subsets; the complement count has the opposite sign and starts from the total.
- Divisors must be at least 1; zero divides by zero.
- `1 << k` on a 32-bit int in C++ limits k to below 31; Go's `int` is 64 bits on common platforms.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `inclusion_exclusion.py` | big ints; no overflow |
| C++ | [C++/](C++/) | `inclusion_exclusion.cpp` | `long long` lcm, 64-bit running total |
| Go | [Go/](Go/) | `main.go` | `int` lcm with pruning; maps as sets |

## Practice Problems

- [Prime Multiples (CSES 2185)](https://cses.fi/problemset/task/2185)
- [Nth Magical Number (LeetCode 878)](https://leetcode.com/problems/nth-magical-number/)
- [Ugly Number III (LeetCode 1201)](https://leetcode.com/problems/ugly-number-iii/)
- [Christmas Party (CSES 1717)](https://cses.fi/problemset/task/1717)
- [Counting Coprime Pairs (CSES 2417)](https://cses.fi/problemset/task/2417)
- Count the integers in 1..n that are coprime to m, using the prime factors of m
- Count derangements of n items with inclusion-exclusion
- Count the integers in 1..n divisible by none of a given list of numbers

## Related

- [Bit Manipulation](../Bit_Manipulation/)
- [Bitmasking](../../Utilities/Optimization_Techniques/Bitmasking/)
- [Euclidean Algorithm](../../Algorithms/Mathematical_Algorithms/Number_Theory/Euclidean_Algorithm/)
