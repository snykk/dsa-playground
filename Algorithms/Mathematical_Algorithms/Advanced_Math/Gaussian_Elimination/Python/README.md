# Gaussian Elimination -- Python Implementation

`A x = b` by elimination to row echelon form and back substitution: in floating point with partial pivoting, and exactly modulo a prime. See the [topic README](../README.md) for the idea, a trace and the example that shows why pivoting matters.

## Files

| File | Contents |
|------|----------|
| `gaussian_elimination.py` | `EPS`, `Kind`, `Solution`, `solve`, `solve_without_pivoting`, `determinant`, `solve_mod`, `determinant_mod`, the module-level helpers `_choose_pivot`, `_subtract_row`, `_forward`, `_back_substitute`, `_inverse`, `_subtract_row_mod` and `_forward_mod`, and a demo `main()` |
| `gaussian_elimination_test.py` | 36 `unittest` tests: random systems with a known solution (floating point within `EPS`, exact modulo 11 primes from 2 to the largest prime below 2^64); singular and inconsistent systems built on purpose; rank and determinant against cofactor expansion in exact fractions; more and fewer equations than unknowns; the pivoting example; the tolerance and the tie rule; 1 x 1, a zero matrix, a zero right-hand side; the errors; the values the C++ and Go tests pin; three tests that count the row operations, the entries they write and the inverses |

## API

| Call | Result | Time |
|------|--------|------|
| `solve(A, b, eps=EPS)` | a `Solution` for `n` equations in `m` unknowns, floating point with partial pivoting; `ValueError` for an empty or ragged `A` or a `b` of the wrong length | O(min(n, m) * n * m) |
| `solve_without_pivoting(A, b, eps=EPS)` | the same with the first entry above `eps` as the pivot; kept to show why `solve` pivots | O(min(n, m) * n * m) |
| `determinant(A, eps=EPS)` | `det(A)` as a float for a square `A`, 0.0 when a column has no pivot; `ValueError` if `A` is not square | O(n^3) |
| `solve_mod(A, b, p)` | a `Solution` modulo the prime `p`, `x` in `[0, p)`; `ValueError` for `p < 2`, a bad shape, or a pivot with no inverse (`p` not prime) | O(min(n, m) * n * m + rank * log p) |
| `determinant_mod(A, p)` | `det(A) mod p` in `[0, p)` | O(n^3) |

`Solution` is a `NamedTuple` with `kind` (`Kind.NO_SOLUTION`, `Kind.UNIQUE` or `Kind.INFINITE`, whose values are `"no solution"`, `"unique"` and `"infinite"`), `x` (`None` when there is no solution; free unknowns 0), `rank`, `pivot_cols`, `swaps` and `updates`.

```python
solve([[2, 1, -1], [-3, -1, 2], [-2, 1, 2]], [8, -11, -3]).x
# [2.0, 3.0000000000000004, -0.9999999999999999]
solve([[1, 2], [2, 4]], [3, 6])            # Kind.INFINITE, x = [3.0, 0.0], rank 1
solve([[1, 2], [2, 4]], [3, 7]).kind       # Kind.NO_SOLUTION
solve_mod([[2, 1, -1], [-3, -1, 2], [-2, 1, 2]], [8, -11, -3], 7).x   # [2, 3, 6]
determinant_mod([[0, 1], [1, 0]], 5)       # 4, which is -1 modulo 5
```

## Python-Specific Notes

- **Any numbers in.** `solve` converts every entry with `float()`, so lists of ints work; `solve_mod` reduces any integer with `%`, so negative and huge entries work, and Python's integers never overflow.
- **The inverse** is the built-in `pow(a, p - 2, p)`, checked with one multiplication; `pow(a, -1, p)` (Python 3.8 and later) would give the same number by the extended Euclid.
- **Floating point** is IEEE 754 double, rounded after every operation; CPython never fuses a multiplication and an addition, so these are the digits the C++ and Go versions reproduce.
- **Counting the work.** `_subtract_row`, `_subtract_row_mod` and `_inverse` are module-level functions, so the tests replace them with counting wrappers: the updates of a dense `n x n` system are exactly `(n - 1) n (n + 1) / 3`, an identity matrix makes no row operation at all, and `solve_mod` computes one inverse per pivot.
- **The input is copied**: `A` and `b` are never modified.

## How to Run

```bash
cd "Algorithms/Mathematical_Algorithms/Advanced_Math/Gaussian_Elimination/Python"
python3 -m unittest gaussian_elimination_test
python3 gaussian_elimination.py
```

## Key Takeaways

- Pick the largest entry of the column as the pivot, and treat `|v| <= eps` as zero.
- After the forward pass, a zero row with a nonzero right-hand side means no solution; a column without a pivot means infinitely many.
- Modulo a prime, divide by multiplying with `a^(p - 2)`, once per pivot.
