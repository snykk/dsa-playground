# Combinatorics

Combinatorics counts the ways to choose, arrange and distribute things. Its building block is the binomial coefficient `C(n, k)`, the number of ways to choose `k` items out of `n`, computed here three ways: Pascal's triangle in O(n^2) additions with no modulus, the multiplicative formula exactly in `min(k, n - k)` steps, and factorials with inverse factorials modulo a prime `p` for `C(n, k) mod p` in O(1) after O(n) preprocessing. On top of it come the Catalan numbers, stars and bars, and derangements.

The factorial tables also appear in [Precomputation](../../../../Utilities/Optimization_Techniques/Precomputation/), and [Modular Arithmetic Tricks](../../../../Utilities/Optimization_Techniques/Modular_Arithmetic_Tricks/) has Lucas's theorem for `n >= p`; this topic links to them instead of repeating them. The one modular inverse the tables need is Euler's theorem for a prime, from [Euler's Totient](../../Number_Theory/Eulers_Totient/).

## Intuition

**Pascal's rule.** Fix one item out of `n`. A `k`-subset either contains it, and then picks the other `k - 1` from the remaining `n - 1`, or it does not, and picks all `k` from the remaining `n - 1`. So `C(n, k) = C(n - 1, k - 1) + C(n - 1, k)`: each cell of Pascal's triangle is the sum of the two above it, and both ends of a row are 1.

**The multiplicative formula.** `C(n, k) = n! / (k! (n - k)!) = (n - k + 1)/1 * (n - k + 2)/2 * ... * n/k`. After `i` factors the product is `C(n - k + i, i)`, an integer, so every division is exact, and each value on the way is at most the answer.

**Factorials modulo a prime.** Modulo a prime `p`, every number from 1 to `p - 1` has an inverse, so `C(n, k) = n! * (k!)^-1 * ((n - k)!)^-1 (mod p)` for `n < p`. One inverse is enough: `(i - 1)!^-1 = i * (i!)^-1`, so the inverse factorials are filled backwards from `(n!)^-1`. From `n = p` on, `n!` contains the factor `p` and is 0 modulo p; it has no inverse, and that is where Lucas's theorem takes over.

**The three counts.**

- **Catalan numbers** `C_n`: structures that split at their first piece into two smaller ones of sizes `i` and `n - 1 - i` (the pair of parentheses that opens first, the root of a binary tree, the triangle on one fixed side of a polygon). Hence `C_n = sum of C_i * C_(n-1-i)`, and in closed form `C_n = C(2n, n) / (n + 1)`.
- **Stars and bars**: `n` identical items in `k` boxes are a row of `n` stars and `k - 1` bars, so there are `C(n + k - 1, k - 1)` ways; with at least one per box, `C(n - 1, k - 1)`.
- **Derangements** `D(n)`: permutations with no item in its own place. Item 1 goes to place `j` (`n - 1` choices); if `j` goes to place 1, the other `n - 2` form a derangement, and if not, place 1 acts as `j`'s forbidden place in a derangement of `n - 1`. So `D(n) = (n - 1)(D(n - 1) + D(n - 2))`.

## Visual

Pascal's triangle, rows 0 to 6 (row `n`, column `k` holds `C(n, k)`); `C(6, 2) = 15` is the sum of `C(5, 1) = 5` and `C(5, 2) = 10` above it:

```text
n = 0                1
n = 1              1   1
n = 2            1   2   1
n = 3          1   3   3   1
n = 4        1   4   6   4   1
n = 5      1  [5] [10] 10  5   1          [5] + [10] = 15
n = 6    1   6  (15) 20  15  6   1
```

`ModBinomial(6, 13)`: `fact` fills downwards, one inverse `fact[6]^(13 - 2) = 5^11 = 8 (mod 13)`, then `inv_fact` fills upwards:

```text
i          0    1    2    3    4    5    6
fact[i]    1    1    2    6   11    3    5      fact[i] = fact[i-1] * i mod 13
inv_fact   1    1    7   11    6    9    8      inv_fact[i-1] = inv_fact[i] * i mod 13

C(6, 2) mod 13 = fact[6] * inv_fact[2] * inv_fact[4] = 5 * 7 * 6 = 210 = 2 (mod 13)
               = 15 mod 13 = 2
```

## How It Works

### Pascal's triangle (`pascal_triangle`, `binomial_pascal`)

1. `pascal_triangle(n)` starts with `[[1]]`. Row `r` is `[1] * (r + 1)`, and each interior cell `j` (from 1 to `r - 1`) is `above[j - 1] + above[j]`. That is `n(n - 1)/2` additions for rows 0 to `n`. `ValueError` for `n < 0`.
2. `binomial_pascal(n, k)` returns 0 for `k < 0` or `k > n`, replaces `k` with `min(k, n - k)`, and keeps one row of `k + 1` cells, starting as `[1, 0, ..., 0]` (row 0). For each `r = 1..n` it updates the cells `j = min(r, k)` down to 1 with `row[j] += row[j - 1]`. Right to left, so `row[j - 1]` still holds row `r - 1` when `row[j]` reads it. The work is `sum of min(r, k)` additions, at most `n * k`.

### The multiplicative formula (`binomial`)

1. Return 0 for `k < 0` or `k > n` (a negative `n` falls under `k > n`), and set `k = min(k, n - k)`.
2. `result = 1`; for `i = 1..k`: `result = result * (n - k + i) / i`, which turns `C(n - k + i - 1, i - 1)` into `C(n - k + i, i)`.
3. The step divides first: with `g = gcd(result, i)`, the rest of `i`, `i / g`, shares no factor with `result / g` and still divides the product, so it divides `n - k + i`. The step computes `(result / g) * ((n - k + i) / (i / g))`, and that product is the next value exactly. In C++ and Go it overflows only when the next value, and so the answer, does not fit in 64 bits.

### Factorials and inverse factorials modulo p (`ModBinomial`)

1. Raise `ValueError` if `n_max < 0`, if `p < 2`, or if `n_max >= p`: `p` divides `n!` for every `n >= p`, so `n!` has no inverse. Lucas's theorem (in Modular Arithmetic Tricks) handles `n >= p`.
2. `fact = [1] * (n_max + 1)` and `fact[i] = fact[i - 1] * i mod p`: `n_max` products.
3. One inverse: `inv = fact[n_max]^(p - 2) mod p` by square and multiply. For a prime `p`, `phi(p) = p - 1`, so Euler's theorem gives `a^(p - 1) = 1` and `a^(p - 2)` is the inverse of `a` (Fermat's little theorem). If `fact[n_max] * inv mod p != 1`, then `p` is not prime: `ValueError`.
4. `inv_fact[n_max] = inv` and `inv_fact[i - 1] = inv_fact[i] * i mod p` for `i = n_max..1`: `n_max` more products.
5. `binomial(n, k)` returns 0 for `k < 0` or `k > n` before it looks at the table, raises `ValueError` for `n > n_max`, and otherwise returns `fact[n] * inv_fact[k] * inv_fact[n - k] mod p`.

`multiplications` counts the products of steps 2 to 4 (not the check). A composite `p` passes the check only when the power really is an inverse of `n_max!`; then every inverse factorial is a true inverse, and the answers are still right. The tests try every modulus up to 159.

### Catalan numbers (`catalan_numbers`, `catalan`)

`catalan_numbers(n)` fills `[C_0, ..., C_n]` with `C_0 = 1` and `C_m = C_0 C_(m-1) + C_1 C_(m-2) + ... + C_(m-1) C_0`: O(n^2) products. `catalan(n)` is `binomial(2n, n) // (n + 1)`. The tests compare both with brute-force counts: balanced strings of `n` pairs of parentheses (n up to 9), binary tree shapes with `n` nodes (up to 9) and triangulations of a convex polygon with `n + 2` corners (up to 6).

### Stars and bars (`stars_and_bars`, `stars_and_bars_positive`)

`stars_and_bars(n, k) = C(n + k - 1, k - 1)`; `stars_and_bars_positive(n, k) = C(n - 1, k - 1)`, which is `stars_and_bars(n - k, k)`: put one item in each box first. For `k = 0` both are 1 when `n = 0` (nothing goes nowhere in one way) and 0 otherwise; the formula alone would give 0 for `n = k = 0`. A negative `n` or `k` raises `ValueError`.

### Derangements (`derangement_numbers`)

`[D(0), ..., D(n)]` with `D(0) = 1` (the empty permutation moves nothing out of place, and there is one of it), `D(1) = 0`, and the recurrence above. `D(n) / n!` is the chance that a random permutation has no fixed point. By inclusion-exclusion `D(n) = n! * (1 - 1/1! + 1/2! - ... + (-1)^n / n!)`, the series of `1/e` cut after `n` terms, so the ratio approaches `1/e = 0.367879...` with an error below `1/(n + 1)!` that changes sign at every step. Running the code:

| n | D(n) | D(n) / n! | minus 1/e |
|---|------|-----------|-----------|
| 1 | 0 | 0.000000000000000 | -3.68e-01 |
| 2 | 1 | 0.500000000000000 | +1.32e-01 |
| 3 | 2 | 0.333333333333333 | -3.45e-02 |
| 4 | 9 | 0.375000000000000 | +7.12e-03 |
| 5 | 44 | 0.366666666666667 | -1.21e-03 |
| 6 | 265 | 0.368055555555556 | +1.76e-04 |
| 8 | 14833 | 0.367881944444444 | +2.50e-06 |
| 10 | 1334961 | 0.367879464285714 | +2.31e-08 |
| 15 | 481066515734 | 0.367879441171397 | -4.51e-14 |

So `D(n)` is `n! / e` rounded to the nearest integer for every `n >= 1`; the tests check that up to `n = 40` with 80-digit decimals.

### Edge cases

| Call | Result | Why |
|------|--------|-----|
| `C(n, k)` with `k < 0` or `k > n` | 0 | no such subset; every method checks this first |
| `C(n, k)` with `n < 0` | 0 | then `k > n` or `k < 0` |
| `C(0, 0)`, `C(n, 0)`, `C(n, n)` | 1 | the empty subset, the whole set |
| `ModBinomial(n_max, p)` with `n_max >= p` | `ValueError` | `n!` is 0 modulo p; use Lucas's theorem |
| `ModBinomial(...).binomial(n, k)` with `n > n_max` | `ValueError` | past the table (but `k > n` still gives 0) |
| `catalan(0)`, `derangement_numbers(0)` | 1, `[1]` | the empty structure counts once |
| `stars_and_bars(0, 0)` | 1 | special-cased: `C(-1, -1)` would be 0 |

### The 64-bit limits (C++ and Go)

C++ and Go return `uint64_t` / `uint64`, take `n` and `k` as signed 64-bit integers (so `k < 0` can be passed), and throw `std::overflow_error` or return `ErrOverflow` instead of a wrapped number. The tests check each limit:

| Count | Last that fits in 64 bits | First that does not |
|-------|---------------------------|---------------------|
| Pascal's triangle | row 67, whose middle `C(67, 33) = 14,226,520,737,620,288,370` | row 68: `C(68, 31)`, the first sum that wraps |
| the same in signed 64 bits | row 66 (`C(66, 33) = 7,219,428,434,016,265,740`) | row 67 |
| `binomial(n, k)` | any `C(n, k) <= 2^64 - 1`, such as `C(2^32, 2) = 9,223,372,034,707,292,160` | `C(68, 34)`, `C(10^18, 2)` |
| `catalan_numbers` (recurrence) | `C_36 = 11,959,798,385,860,453,492` | `C_37` |
| `catalan` (closed form) | `n = 33` | `n = 34`: `C(68, 34)` overflows although `C_34` fits |
| `derangement_numbers` | `D(20) = 895,014,631,192,902,121` | `D(21)` |

`binomial_pascal` in C++ and Go reports an overflow at once when `min(k, n - k) >= 34`, because then `C(n, k) >= C(68, 34) > 2^64 - 1`; otherwise a sum that wraps finds it. In the recurrence for Catalan numbers every product and partial sum is at most the new value, and in the multiplicative formula every step is at most the answer, so the first overflow is the answer's own. Modular products go through `unsigned __int128` in C++ and `bits.Mul64` with `bits.Rem64` in Go, so `p` can be any 64-bit prime, up to `2^64 - 59`.

### Errors

| Input | Python | C++ | Go |
|-------|--------|-----|----|
| a negative `n` for `pascal_triangle`, `catalan`, `catalan_numbers`, `derangement_numbers`; a negative `n` or `k` for stars and bars; a negative `n_max` | `ValueError` | `std::invalid_argument` | an error wrapping `ErrNegative` |
| `p < 2`, or a `p` the power `p - 2` does not invert | `ValueError` | `std::invalid_argument` | an error wrapping `ErrNotPrime` |
| `n_max >= p` | `ValueError` | `std::invalid_argument` | an error wrapping `ErrNotBelowP` |
| a query with `n > n_max` | `ValueError` | `std::out_of_range` | an error wrapping `ErrPastTable` |
| a count above `2^64 - 1` | (no limit) | `std::overflow_error` | an error wrapping `ErrOverflow` |

## Step-by-Step Trace

`binomial(10, 3)`: `k = min(3, 7) = 3`, three steps.

| i | n - k + i | result before | g = gcd(result, i) | (result / g) * ((n - k + i) / (i / g)) | = |
|---|-----------|---------------|--------------------|-----------------------------------------|---|
| 1 | 8 | 1 | 1 | 1 * 8 | 8 = C(8, 1) |
| 2 | 9 | 8 | 2 | 4 * 9 | 36 = C(9, 2) |
| 3 | 10 | 36 | 3 | 12 * 10 | 120 = C(10, 3) |

`ModBinomial(6, 13)` and the query `C(6, 2)`:

| Step | Computation | Value |
|------|-------------|-------|
| fact[1..6] | 1, 1 * 2, 2 * 3, 6 * 4 = 24, 11 * 5 = 55, 3 * 6 = 18, each mod 13 | 1, 2, 6, 11, 3, 5 |
| the one inverse | `5^11 mod 13`: 11 = 1011 in binary, 4 squarings and 3 products | 8, and `5 * 8 = 40 = 1 (mod 13)` |
| inv_fact[5..0] | 8 * 6 = 48, 9 * 5 = 45, 6 * 4 = 24, 11 * 3 = 33, 7 * 2 = 14, 1 * 1, each mod 13 | 9, 6, 11, 7, 1, 1 |
| C(6, 2) | `fact[6] * inv_fact[2] mod 13 = 5 * 7 = 35 = 9`, then `9 * inv_fact[4] = 9 * 6 = 54 = 2` | 2 |

`multiplications` is 6 + 7 + 6 = 19, and `C(6, 2) = 15 = 2 (mod 13)`.

Catalan, `n = 3`: `C_3 = C_0 C_2 + C_1 C_1 + C_2 C_0 = 2 + 1 + 2 = 5 = C(6, 3) / 4 = 20 / 4`. The 5 strings are `((()))`, `(()())`, `(())()`, `()(())`, `()()()`. Stars and bars: 5 items in 3 boxes, `C(7, 2) = 21` ways; at least one in each box, `C(4, 2) = 6`.

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| `pascal_triangle(n)` | O(n^2): `n(n - 1)/2` additions | O(n^2) |
| `binomial_pascal(n, k)` | O(n * min(k, n - k)) additions | O(min(k, n - k)) |
| `binomial(n, k)` | `min(k, n - k)` steps, each a gcd and a product | O(1) numbers (Python's grow with the result) |
| `ModBinomial(n_max, p)` | O(n_max + log p): `2 n_max` products plus at most `2 log2(p)` for the inverse | O(n_max) |
| `ModBinomial.binomial(n, k)` | O(1): three lookups, two products | O(1) |
| `catalan_numbers(n)` | O(n^2) products | O(n) |
| `catalan(n)`, stars and bars | one `binomial` | O(1) |
| `derangement_numbers(n)` | O(n) | O(n) |

Counted with the Python code, through the module-level helpers: `pascal_triangle(n)` made exactly `n(n - 1)/2` additions for every `n` below 60; `binomial_pascal(n, k)` made `sum of min(r, min(k, n - k))` over `r = 1..n` for every `n` below 70 (1,999 additions for `C(1000, 998)`, where columns 0 to 998 would take 500,497); `binomial(n, k)` made `min(k, n - k)` steps for every `n` below 120 (3 for `C(10^18, 10^18 - 3)`), and with `k` replaced by `min(k, n - k)` every step was `C(n - k + i, i)`, never above the answer. Every `ModBinomial` called the modular power once; `ModBinomial(10^6, 10^9 + 7)` made 2,000,045 products and took about 0.3 s in Python.

## When to Use

- **Pascal's triangle** for all binomials up to a small `n` at once (a few thousand rows), with no modulus or with a modulus that is not prime: additions need no inverse. Exact in Python; in 64 bits up to row 67.
- **The multiplicative formula** for one exact `C(n, k)`, even with a huge `n`, as long as the answer fits (any size in Python).
- **Factorial tables modulo a prime** for many `C(n, k) mod p` queries with `n < p`, such as `n` up to 10^6 modulo 10^9 + 7.
- **Lucas's theorem** ([Modular Arithmetic Tricks](../../../../Utilities/Optimization_Techniques/Modular_Arithmetic_Tricks/)) when `n >= p`, typically with a small prime.
- Not for a composite modulus such as 10^9 or 2^32: inverses do not exist for every factorial; use Pascal's triangle modulo `m`, or factor `m` and combine with the Chinese Remainder Theorem.

## Combinatorics vs. Alternatives

| Method | Precompute | Per query | Modulus | Limit |
|--------|-----------|-----------|---------|-------|
| Pascal's triangle | O(N^2) | O(1) lookup | any, or none | row 67 in 64 bits |
| One row of Pascal's triangle | none | O(n * min(k, n - k)) | any, or none | answer up to 2^64 - 1 |
| Multiplicative formula | none | O(min(k, n - k)) | none | answer up to 2^64 - 1 (none in Python) |
| Factorials and inverse factorials | O(N + log p) | O(1) | prime `p > N` | `n < p` |
| Lucas's theorem | O(p) | O(log_p n) | prime `p` | any `n` |
| `math.comb` (Python) | none | big-integer arithmetic | none | slow for a large middle `k` on old Pythons |

## Common Pitfalls

- **Dividing modulo p.** `fact[n] / (fact[k] * fact[n - k]) % p` is wrong: modulo `p` a division is a multiplication by an inverse.
- **`n >= p` with factorial tables.** `n!` is 0 modulo `p`, so `C(7, 7) mod 7` would come out 0 instead of 1. Use Lucas's theorem; the code refuses such a table.
- **A composite modulus.** Fermat's inverse `a^(m - 2)` is wrong for most composite `m`; the code checks the inverse and refuses.
- **An inverse per entry.** Computing every `(i!)^-1` by a power costs O(n log p); one power and the backward loop cost O(n).
- **Overflow before the answer.** `C(n, k) = n! / (k! (n - k)!)` overflows at `21!`; even `result * (n - k + i) / i` overflows when `result * (n - k + i)` does not fit. Dividing the gcd out first avoids both.
- **Forgetting `min(k, n - k)`.** `C(10^18, 10^18 - 3)` takes 3 steps, not 10^18.
- **The edge values.** `C(n, k) = 0` for `k < 0` or `k > n`, `C(0, 0) = 1`, `D(0) = 1`, and `stars_and_bars(0, 0) = 1`.
- **The Catalan closed form in 64 bits.** `C(2n, n)` is `n + 1` times the answer and overflows from `n = 34`, while `C_34` to `C_36` still fit; use the recurrence there.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `combinatorics.py` | `pascal_triangle`, `binomial_pascal`, `binomial`, `ModBinomial`, `catalan_numbers`, `catalan`, `stars_and_bars`, `stars_and_bars_positive`, `derangement_numbers`; exact for any size; the helpers `_pascal_cell`, `_add_left`, `_times_over` and `_power` sit at module level so the tests can count the work |
| C++ | [C++/](C++/) | `combinatorics.cpp` | `pascalTriangle`, `binomialPascal`, `binomial`, class `ModBinomial`, `catalanNumbers`, `catalan`, `starsAndBars`, `starsAndBarsPositive`, `derangementNumbers`, `mulMod`, `powMod`; `uint64_t` results with overflow checks; `unsigned __int128` products |
| Go | [Go/](Go/) | `main.go` | `PascalTriangle`, `BinomialPascal`, `Binomial`, `NewModBinomial` and `(*ModBinomial).Binomial`, `CatalanNumbers`, `Catalan`, `StarsAndBars`, `StarsAndBarsPositive`, `DerangementNumbers`, `MulMod`, `PowMod`; errors instead of exceptions |

The three give the same answers on the same input. The C++ and Go tests pin 30 binomials, 6 overflows, rows 10 and 67 of Pascal's triangle, 9 modular tables with 26 queries and their counts of products, the tables of `ModBinomial(6, 13)`, `C_0` to `C_36`, `D(0)` to `D(20)` and 11 stars-and-bars pairs, all computed by the Python code.

## Practice Problems

- [Pascal's Triangle (LeetCode 118)](https://leetcode.com/problems/pascals-triangle/): build the first rows with Pascal's rule.
- [Binomial Coefficients (CSES 1079)](https://cses.fi/problemset/task/1079): up to 10^5 queries `C(a, b) mod 10^9 + 7` with `a` up to 10^6, from factorial tables.
- [Distributing Apples (CSES 1716)](https://cses.fi/problemset/task/1716): `m` apples among `n` children is stars and bars, `C(m + n - 1, n - 1)` modulo a prime.
- [Christmas Party (CSES 1717)](https://cses.fi/problemset/task/1717): nobody gets their own gift, the derangement recurrence modulo a prime.
- [Bracket Sequences I (CSES 2064)](https://cses.fi/problemset/task/2064): valid bracket sequences of length `n` are the Catalan number `C_(n/2)` modulo a prime, and 0 for odd `n`.

## Related

- [Precomputation](../../../../Utilities/Optimization_Techniques/Precomputation/): the factorial and inverse-factorial tables among other precomputed tables.
- [Modular Arithmetic Tricks](../../../../Utilities/Optimization_Techniques/Modular_Arithmetic_Tricks/): Lucas's theorem for `n >= p`, and the factorial class it reads from.
- [Euler's Totient](../../Number_Theory/Eulers_Totient/): Euler's theorem, whose prime case `a^(p - 2)` is the one inverse here.
- [Modular Exponentiation](../../Number_Theory/Modular_Exponentiation/): square and multiply, behind that inverse.
- [Inclusion-Exclusion Principle](../../../../Problem_Patterns/Inclusion_Exclusion_Principle/): the sum that gives `D(n)` and its limit `1/e`.
- [Matrix Exponentiation](../Matrix_Exponentiation/): the other counting tool in this category, for linear recurrences.
- [Number Theoretic Transform](../Number_Theoretic_Transform/): multiplies the generating functions of counts modulo 998244353, the prime these tables often use.
- [Advanced Mathematical Algorithms](../)
