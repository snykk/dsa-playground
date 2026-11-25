# Gaussian Elimination -- C++ Implementation

`A x = b` by elimination to row echelon form and back substitution: in `double` with partial pivoting, and exactly modulo a prime up to 2^64 - 1 with 128-bit products. See the [topic README](../README.md) for the idea, a trace and the example that shows why pivoting matters.

## Files

| File | Contents |
|------|----------|
| `gaussian_elimination.cpp` | `EPS`, `Kind`, `kindName`, `Solution`, `ModSolution`, `solve`, `solveWithoutPivoting`, `determinant`, `mulMod`, `powMod`, `reduceMod`, `inverseMod`, `solveMod`, `determinantMod`, and a demo `main()` (compiled out with `-DIS_TEST_BUILD`) |
| `gaussian_elimination_test.cpp` | assert-based tests: the results the Python code computes (33 of `solveMod` and 10 of `determinantMod` exactly, 12 of `solve` and 5 of `determinant` within `EPS`); random systems with a known solution; singular and inconsistent systems built on purpose; rank and determinant against cofactor expansion in `__int128` and modulo `p`; non-square systems; the pivoting example; the tolerance, ties and edge cases; the errors; the count of updates |

## API

| Function | Description |
|----------|-------------|
| `Solution solve(const std::vector<std::vector<double>>& A, const std::vector<double>& b, double eps = EPS)` | partial pivoting; throws `std::invalid_argument` for an empty or ragged `A` or a `b` of the wrong length; O(min(n, m) * n * m) |
| `Solution solveWithoutPivoting(A, b, double eps = EPS)` | the first entry above `eps` as the pivot |
| `double determinant(A, double eps = EPS)` | for a square `A`; 0 when a column has no pivot; throws if `A` is not square |
| `ModSolution solveMod(const std::vector<std::vector<int64_t>>& A, const std::vector<int64_t>& b, uint64_t p)` | modulo the prime `p`, `x` in `[0, p)`; throws for `p < 2`, a bad shape, or a pivot with no inverse |
| `uint64_t determinantMod(const std::vector<std::vector<int64_t>>& A, uint64_t p)` | `det(A) mod p` |
| `std::string kindName(Kind k)` | `"no solution"`, `"unique"` or `"infinite"` |
| `uint64_t mulMod(a, b, m)`, `powMod(base, exp, m)`, `reduceMod(int64_t v, p)`, `inverseMod(a, p)` | the modular helpers: a product in `unsigned __int128`, square and multiply, Python's `%` for any `int64_t`, and Fermat's inverse with its check |

`Solution` and `ModSolution` hold `kind` (`Kind::NoSolution`, `Kind::Unique`, `Kind::Infinite`), `x` (empty when there is no solution; free unknowns 0), `rank`, `pivotCols`, `swaps` and `updates`.

## C++-Specific Notes

- **The same doubles as Python.** `#pragma clang fp contract(off)` (and `#pragma GCC optimize("fp-contract=off")` for GCC) stops the compiler from fusing `M[t][c] -= factor * M[r][c]` into one FMA. Without it, Apple clang on arm64 fuses by default, and the example without pivoting returns `x1 = 4.546...` instead of Python's `4.470...`.
- **128-bit products.** `mulMod` casts to `unsigned __int128`, a GCC and Clang extension, so any modulus up to 2^64 - 1 is exact; the tests use 18446744073709551557, the largest prime below 2^64. `reduceMod` takes the remainder in signed `__int128`, so even `INT64_MIN` reduces correctly, and `subMod` never forms `a + p`.
- **Speed.** At `-O2`, a 500 x 500 system took 16 ms in `double` and 0.37 s modulo 10^9 + 7 on the machine the numbers were measured on; the 128-bit remainders dominate the modular version.
- **Rows are swapped** with `std::swap` on the inner vectors, which exchanges their buffers in O(1).
- The sanitizer build in CI (`-fsanitize=address,undefined`) runs the same tests.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD gaussian_elimination_test.cpp -o test && ./test
g++ -std=c++17 -O2 gaussian_elimination.cpp -o demo && ./demo
```

## Key Takeaways

- Partial pivoting is one strict `>` comparison per row of the column.
- Turn floating-point contraction off when results must match another language bit for bit.
- Multiply residues of a 64-bit modulus in 128 bits.
