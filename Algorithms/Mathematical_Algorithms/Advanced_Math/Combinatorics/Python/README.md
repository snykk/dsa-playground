# Combinatorics -- Python Implementation

Binomial coefficients by Pascal's triangle, by the multiplicative formula and modulo a prime from factorial tables, then Catalan numbers, stars and bars and derangements, all exact. See the [topic README](../README.md) for the idea, the traces and the 64-bit limits of the other two languages.

## Files

| File | Contents |
|------|----------|
| `combinatorics.py` | `pascal_triangle`, `binomial_pascal`, `binomial`, `ModBinomial`, `catalan_numbers`, `catalan`, `stars_and_bars`, `stars_and_bars_positive`, `derangement_numbers`, the module-level helpers `_pascal_cell`, `_add_left`, `_times_over` and `_power`, and a demo `main()` |
| `combinatorics_test.py` | 41 `unittest` tests: binomials against a count of subsets and against `math.comb`, the three methods against each other; the modular tables against `math.comb` reduced modulo 12 primes up to `2^64 - 59`, every prime below 200 with its largest table, and every modulus up to 159 (refused, or right); Catalan numbers against balanced parentheses, binary tree shapes and polygon triangulations; stars and bars and derangements against enumeration; `D(n) / n!` against `1/e`; the counted work; the edge cases, the errors, the 64-bit limits and the values the C++ and Go tests pin |

## API

| Call | Result | Time |
|------|--------|------|
| `pascal_triangle(n)` | rows 0..n, `rows[r][j] = C(r, j)`; `ValueError` for `n < 0` | O(n^2) |
| `binomial_pascal(n, k)` | `C(n, k)` by Pascal's rule on one row; 0 for `k < 0` or `k > n` | O(n * min(k, n - k)) |
| `binomial(n, k)` | `C(n, k)` by the multiplicative formula; 0 for `k < 0` or `k > n` | `min(k, n - k)` steps |
| `ModBinomial(n_max, p)` | the tables `fact`, `inv_fact` (lists of `n_max + 1`), `n_max`, `p` and `multiplications`; `ValueError` for `n_max < 0`, `p < 2`, `n_max >= p` or a `p` the power `p - 2` does not invert | O(n_max + log p) |
| `ModBinomial.binomial(n, k)` | `C(n, k) mod p`; 0 for `k < 0` or `k > n`; `ValueError` for `n > n_max` | O(1) |
| `catalan_numbers(n)` | `[C_0, ..., C_n]` by the recurrence; `ValueError` for `n < 0` | O(n^2) |
| `catalan(n)` | `C(2n, n) // (n + 1)`; `ValueError` for `n < 0` | O(n) steps |
| `stars_and_bars(n, k)` | `C(n + k - 1, k - 1)`, 1 for `n = k = 0`; `ValueError` for a negative argument | `min(n, k - 1)` steps |
| `stars_and_bars_positive(n, k)` | `C(n - 1, k - 1)`, 0 for `n < k`, 1 for `n = k = 0` | `min(n - k, k - 1)` steps |
| `derangement_numbers(n)` | `[D(0), ..., D(n)]`; `ValueError` for `n < 0` | O(n) |

```python
pascal_triangle(4)                # [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1]]
binomial(10, 3)                   # 120, and binomial_pascal(10, 3) too
binomial(10**18, 10**18 - 1)      # 1000000000000000000, in one step
t = ModBinomial(6, 13)
t.fact, t.inv_fact                # [1, 1, 2, 6, 11, 3, 5], [1, 1, 7, 11, 6, 9, 8]
t.binomial(6, 2)                  # 2, and C(6, 2) = 15 = 2 (mod 13)
catalan_numbers(5)                # [1, 1, 2, 5, 14, 42]
stars_and_bars(5, 3)              # 21; stars_and_bars_positive(5, 3) is 6
derangement_numbers(6)            # [1, 0, 1, 2, 9, 44, 265]
ModBinomial(9, 7)                 # ValueError: n_max = 9 >= p = 7: ... Lucas's theorem handles n >= p
```

## Python-Specific Notes

- Integers never overflow, so every function is exact at any size; only time and memory grow. The multiplicative formula still divides the gcd out before it multiplies, as C++ and Go must, so the three versions take the same steps.
- `ModBinomial` raises the modular power with its own `_power` loop instead of the built-in `pow(a, p - 2, p)`, so that `multiplications` counts the same products as `powMod` in C++ and Go. The built-in gives the same inverse; the tests compare both through `math.comb`.
- `math.comb` (Python 3.8 and later) is the reference in the tests. On Python 3.9 it takes about 4 s for `C(200000, 100000)`, so the tests keep `k` or `n - k` small for `n` near 10^6.
- `_pascal_cell` (one call per interior cell), `_add_left` (one per addition of the one-row version), `_times_over` (one per step of the multiplicative formula) and `_power` (one per table) are module-level functions, so the tests replace them with counting wrappers.

## How to Run

```bash
cd "Algorithms/Mathematical_Algorithms/Advanced_Math/Combinatorics/Python"
python3 -m unittest combinatorics_test
python3 combinatorics.py
```

## Key Takeaways

- `C(n, k) = C(n - 1, k - 1) + C(n - 1, k)` needs no division and works modulo anything.
- The multiplicative formula climbs through `C(n - k + i, i)`, so each division is exact.
- Modulo a prime, one power gives `(n!)^-1` and the rest of the inverse factorials come backwards in O(n).
