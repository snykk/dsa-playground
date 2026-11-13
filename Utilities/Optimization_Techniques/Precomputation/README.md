# Precomputation

Precomputation spends time and memory once, before the queries arrive, so that each query is answered in O(1) or O(log n). The standard tables are factorials and inverse factorials, prime sieves, smallest-prime-factor tables, prefix sums (1D and 2D), sparse tables and binary lifting.

## Intuition

If the same kind of question is asked many times about data that does not change, answer the parts that repeat once and store them. A prefix sum stores every running total, so any range sum is one subtraction. A sieve stores which numbers are prime, so a primality test is one lookup.

The invariant is that each table entry is built from earlier entries (`prefix[i+1] = prefix[i] + a[i]`), so the whole table costs one pass.

## Visual

```text
a      =  3   1   4   1   5   9   2   6
prefix = 0   3   4   8   9  14  23  25  31      (prefix[i] = sum of the first i elements)

sum of a[2..5] = prefix[6] - prefix[2] = 23 - 4 = 19      (4 + 1 + 5 + 9)

sparse table for min of [5, 2, 8, 1, 9, 3, 7]
level 0 (len 1): 5 2 8 1 9 3 7
level 1 (len 2): 2 2 1 1 3 3
level 2 (len 4): 1 1 1 1
query [1, 5]: length 5 -> k = 2 -> min(level2[1], level2[2]) = min(1, 1) = 1
```

## How It Works

1. **Factorials:** `fact[i] = fact[i-1] * i`, then one modular inverse `invFact[n] = fact[n]^(p-2)` and `invFact[i-1] = invFact[i] * i`. `C(n, r) = fact[n] * invFact[r] * invFact[n-r]`.
2. **Sieve of Eratosthenes:** for each prime `i`, mark its multiples as composite. Python and Go start at `i*i`; the C++ file starts at `2*i`.
3. **Smallest prime factor (SPF):** like the sieve, but store the first prime that marks each number. To factorize `x`, repeatedly take `spf[x]` and divide it out.
4. **Prefix sums:** 1D `prefix[i+1] = prefix[i] + a[i]`; 2D by inclusion-exclusion `P[i][j] = g + P[i-1][j] + P[i][j-1] - P[i-1][j-1]`.
5. **Sparse table:** `table[i][j]` is the combination of the `2^j` elements starting at `i`. A query reads two overlapping blocks, so the operation must be idempotent (min, max, gcd).
6. **Binary lifting (LCA):** `parent[v][j]` is the `2^j`-th ancestor; lift the deeper node to the same depth, then lift both while their ancestors differ.

## Step-by-Step Trace

- Sparse table, query [4, 6] on `[5, 2, 8, 1, 9, 3, 7]`: length 3, so `k = 1`; `min(table[4][1], table[5][1]) = min(3, 3) = 3`.
- `factorize(720)` with SPF: 720 has smallest prime 2 (four times), 45 has 3 (twice), 5 has 5 (once): `[(2, 4), (3, 2), (5, 1)]`.
- 2D prefix sums of `[[1,2,3],[4,5,6],[7,8,9]]`: the rectangle from (1, 1) to (2, 2) has sum `P[3][3] - P[1][3] - P[3][1] + P[1][1] = 45 - 6 - 12 + 1 = 28`.

## Complexity

| Table | Build | Query | Space |
|-------|-------|-------|-------|
| factorials | O(n) | O(1) | O(n) |
| prime sieve | O(n log log n) | O(1) | O(n) |
| smallest prime factor | O(n log log n) | O(log x) to factorize x | O(n) |
| 1D prefix sum | O(n) | O(1) | O(n) |
| 2D prefix sum | O(n m) | O(1) | O(n m) |
| sparse table | O(n log n) | O(1) | O(n log n) |
| binary lifting | O(n log n) | O(log n) | O(n log n) |

## When to Use

Use it when many queries hit the same static data, or when a value is needed over and over. Do not use it when each value is needed once, or when the data changes between queries (use a Fenwick tree or a segment tree). Check the memory budget first: `n log n` entries can be large.

## Precomputation vs. Alternatives

| Need | Precomputed table | Alternative |
|------|-------------------|-------------|
| range sum, static | prefix sum | Fenwick tree if values change |
| range min or max, static | sparse table | segment tree if values change |
| primality of many numbers | sieve | Miller-Rabin for a few huge numbers |
| factorization of many numbers | SPF table | trial division for a single number |
| binomials modulo a prime | factorial tables | Pascal's triangle, O(n^2) |

## Common Pitfalls

1. **Off-by-one in prefix sums:** use length `n + 1` with a leading 0 and `prefix[r + 1] - prefix[l]` for an inclusive range.
2. **Non-idempotent sparse table:** `SparseTable(arr, func)` accepts any function, but a sum would count the overlap twice; use min, max or gcd.
3. **Table size:** the C++ tables hold `MAXN = 2e5 + 5` entries.
4. **Forgetting to build:** the C++ tables are zeros until the builders run.
5. **Tiny limits:** `Sieve(0)` used to fail; Python and Go now return no primes for `n < 2`.
6. **Overflow:** use 64-bit sums; the C++ `pow2` table is unsigned because `2^63` does not fit in a signed `long long`.
7. **Static only:** none of these tables supports updates.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `precomputation.py` | all tables: factorials, sieve, SPF, `PrefixSum`, `PrefixSum2D`, `SparseTable`, `LCA`, `POW2` |
| C++ | [C++/](C++/) | `precomputation.cpp` | the same set as global arrays and builder functions |
| Go | [Go/](Go/) | `main.go` | factorials, `Sieve`, `ComputeSPF`, `PrefixSum` only (no 2D, sparse table or LCA) |

## Practice Problems

- [Range Sum Queries (LeetCode 303)](https://leetcode.com/problems/range-sum-query-immutable/)
- [Range Sum Query 2D (LeetCode 304)](https://leetcode.com/problems/range-sum-query-2d-immutable/)
- [Count Primes (LeetCode 204)](https://leetcode.com/problems/count-primes/)
- [Static Range Minimum Queries (CSES)](https://cses.fi/problemset/task/1647)
- [Company Queries II (CSES)](https://cses.fi/problemset/task/1688): lowest common ancestor with binary lifting.

## Related

- [Prefix Sum and Difference Array](../../../Problem_Patterns/Prefix%20Sum%20Difference%20Array/README.md)
- [Modular Arithmetic Tricks](../Modular_Arithmetic_Tricks/README.md)
- [Sieve of Eratosthenes](../../../Algorithms/Mathematical_Algorithms/Number_Theory/Sieve%20of%20Eratosthenes/README.md)
- [Bitmasking](../Bitmasking/README.md)
