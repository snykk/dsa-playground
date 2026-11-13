# Precomputation -- Python Implementation

Factorial tables, a prime sieve, smallest prime factors, prefix sums (1D and 2D), a sparse table and an LCA with binary lifting.

For the concept, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `precomputation.py` | the functions and classes below, plus a demo |
| `precomputation_test.py` | 17 tests: factorials against exact binomials, sieve (including `n < 2`), SPF and factorization, prefix sums, sparse table (min, max, gcd), LCA, `POW2` |

## API

- `Factorials(n, mod=MOD)`: `fact`, `inv_fact`, `nCr(n, r)`, `nPr(n, r)`.
- `sieve(n)`: returns `(primes, is_prime)`; no primes for `n < 2`.
- `compute_spf(n)`, `factorize(n, spf)`: smallest prime factors and factorization as `(prime, count)` pairs.
- `PrefixSum(arr)`: `range_sum(l, r)` (inclusive).
- `PrefixSum2D(grid)`: `rect_sum(r1, c1, r2, c2)` (inclusive corners).
- `SparseTable(arr, func=min)`: `query(l, r)`; `func` must be idempotent (min, max, `gcd`).
- `LCA(n, adj, root=0)`: `query(u, v)`.
- `POW2`: powers of two from 2^0 to 2^63; `power(base, exp, mod)`.

## Python-Specific Notes

- Integers are unbounded, so prefix sums and `POW2` cannot overflow.
- `SparseTable` does not check that `func` is idempotent; a sum gives wrong answers.
- `LCA` builds the parent table with an iterative DFS, so deep trees do not hit the recursion limit.
- The sieve uses a list of booleans; for very large `n` a `bytearray` is more compact.

## How to Run

```bash
python3 -m unittest precomputation_test
python3 precomputation.py      # demo
```

## Key Takeaways

1. Build once, query many times.
2. Use an array of length `n + 1` for prefix sums to avoid special cases.
3. Sparse tables need an idempotent operation.
