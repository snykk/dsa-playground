# Gaussian Elimination

Gaussian elimination solves a system of linear equations `A x = b`, `n` equations in `m` unknowns. It reduces the augmented matrix `[A | b]` to row echelon form with row operations that do not change the solutions (swap two rows, subtract a multiple of one row from another), then reads the unknowns off from the last pivot up. The same pass gives the rank of `A` and, for a square `A`, its determinant. This topic has two versions: floating point with partial pivoting and a stated tolerance for zero, and exact arithmetic modulo a prime `p`, where dividing by a pivot multiplies by its modular inverse. Both take O(n^3) for a square system.

## Intuition

Subtracting a multiple of one equation from another keeps every solution: if `2x + y = 8` and `-3x - y = -11` both hold, so does their combination. Choose the multiple that cancels `x`, and the second equation no longer mentions it. Do that for every equation below the first, then repeat with `y` on the rest, and the system becomes a staircase: the last equation has one unknown, the one above it two, and so on. Solving from the bottom up is then one division per unknown.

Three things can happen. Every unknown gets a pivot (the first nonzero entry of its step), and the solution is **unique**. Some column has no pivot: its unknown can take any value, so there are **infinitely many** solutions, and the code returns the one with every such free unknown set to 0. Or a row of `A` becomes all zero while its right-hand side does not, so it reads `0 = c`: there is **no solution**.

On a computer the division by the pivot is where things go wrong. A tiny pivot gives huge multipliers, the other entries grow to match, and rounding then wipes out the information in the small ones. **Partial pivoting** picks, in each column, the entry of largest absolute value at or below the current row and swaps its row up, so every multiplier is at most 1 in absolute value. Modulo a prime there is no rounding, so any nonzero entry will do.

## Visual

`solve(A, b)` for `2x0 + x1 - x2 = 8`, `-3x0 - x1 + 2x2 = -11`, `-2x0 + x1 + 2x2 = -3`. Entries rounded to 4 digits; `E0`, `E1`, `E2` name the equations as they were given.

```text
 start                  column 0: |-3| is largest     column 1: |1.667| is largest   back substitution
                        swap E1 up, clear below        swap E2 up, clear below

 E0 [  2   1  -1 |   8]  E1 [-3  -1      2     | -11  ]  E1 [-3  -1      2     | -11  ]  x2 = -0.2 / 0.2      = -1
 E1 [ -3  -1   2 | -11]  E0 [ 0   0.3333 0.3333 | 0.6667]  E2 [ 0   1.667  0.6667 | 4.333]  x1 = (4.333 + 0.6667) / 1.667 = 3
 E2 [ -2   1   2 |  -3]  E2 [ 0   1.667  0.6667 | 4.333 ]  E0 [ 0   0      0.2    | -0.2 ]  x0 = (-11 + 3 + 2) / -3     = 2
```

Pivots -3, 1.667 and 0.2; two swaps, so `det(A) = (+1)(-3)(1.667)(0.2) = -1`. Rank 3 = the number of unknowns, so the solution is unique.

## How It Works

### Forward elimination (`_forward`, `_choose_pivot`, `_subtract_row`)

The augmented matrix `M` has `n` rows and `m + 1` columns. `row` starts at 0.

1. For each column `col = 0 .. m-1`, while `row < n`:
   1. **Choose the pivot.** With partial pivoting, the row `r >= row` with the largest `|M[r][col]|`; the comparison is a strict `>`, so on a tie the upper row wins. If that largest value is at most `eps`, the column has no pivot: its unknown is free, and the next column is tried with the same `row`.
   2. **Swap** row `r` up to `row` if they differ, and count the swap.
   3. **Eliminate below.** For each `target` below `row` whose entry in `col` is not already exactly 0: `factor = M[target][col] / M[row][col]`, set `M[target][col] = 0`, and subtract `factor * M[row][c]` from `M[target][c]` for every column `c` right of `col`, the right-hand side included. Columns left of `col` are 0 in the pivot row already, so they are not touched.
   4. Record `col` as a pivot column and move to the next `row`.
2. The **rank** is the number of pivots.

`solve_without_pivoting` differs only in step 1.1: it takes the first row whose entry is above `eps`, however small. It is there to show why the other one pivots.

### The result (`_solve`, `_back_substitute`)

- Rows `rank .. n-1` are zero in `A`'s columns (exactly, or below `eps`). If one of them has `|M[r][m]| > eps`, it reads `0 = c`: **no solution**, and `x` is `None` (an empty vector in C++, `nil` in Go).
- Otherwise `x` starts as all zeros and the pivot rows are solved from the last up: `x[c] = (M[i][m] - sum of M[i][j] * x[j] for j > c) / M[i][c]`, the sum taken with `j` increasing. A free unknown keeps its 0.
- The kind is **unique** when `rank == m`, **infinite** when `rank < m`. With fewer equations than unknowns, `rank <= n < m`, so it is never unique.

The result in every language holds the kind (named `no solution`, `unique` and `infinite`), `x`, the rank, the pivot columns, the number of swaps and `updates`, the number of entries the forward elimination computed.

### The tolerance

`EPS = 1e-9` (Python, C++; `Eps` in Go) is an absolute tolerance: an entry with `|v| <= eps` counts as zero, both when choosing a pivot and when testing a row `0 = c`. Without it, a column that should be zero but holds rounding noise such as `1e-17` would become a pivot and produce a huge, meaningless answer. Absolute means it suits entries of moderate size, not far from 1; scale the equations first if they are much larger or much smaller. `solve([[1e-10]], [1])` finds no solution, and `solve([[1e-10]], [1], eps=1e-12)` finds `x = [1e10]`.

### Determinant

`determinant(A)` runs the same forward elimination on a square `A`, without a right-hand side. Each swap flips the sign of the determinant, and subtracting a multiple of one row from another does not change it, so `det(A) = (-1)^swaps * (product of the pivots)`. If a column has no pivot, the matrix is singular and the result is 0. The product is taken in row order.

### Modulo a prime (`solve_mod`, `determinant_mod`)

Entries are reduced into `[0, p)` first, as Python's `%` does (`-1` becomes `p - 1`). The steps are the same, with three changes:

- **The pivot** is the first nonzero entry at or below `row`: every nonzero number has an inverse modulo a prime, and nothing rounds, so its size does not matter.
- **Dividing** by the pivot `a` multiplies by its inverse `a^(p - 2) mod p`. That is Fermat's little theorem, Euler's theorem with `phi(p) = p - 1`; see [Euler's Totient](../../Number_Theory/Eulers_Totient/) and [Modular Arithmetic](../../Number_Theory/Modular_Arithmetic/). The inverse is computed once per pivot and reused for every row below it and in back substitution.
- **Every entry** of `x` is in `[0, p)`, and the determinant is `p - 1` times the product of the pivots after an odd number of swaps (`-1` modulo `p`).

The code does not test that `p` is prime: that would cost more than the elimination for a 64-bit `p`. It checks every inverse it computes instead (`a * inverse mod p == 1`); a composite `p` that makes a pivot without an inverse raises `ValueError` with "p must be prime". `solve_mod([[2]], [1], 4)` does.

### Why pivoting matters

Found by running the code: `A = [[1e-8, 0, 1], [1, 1e-8, 0], [0, 1, 0]]`, `b = [1, 2, 3]`. The last equation says `x1 = 3`.

| | Pivots | `x` |
|---|---|---|
| `solve_without_pivoting` | 1e-8, 1e-8, 1e16 | `[1.9999999545383673, 4.470348358154297, 0.9999999800000005]` |
| `solve` (partial pivoting) | 1, 1, 1 | `[1.99999997, 3.0, 0.9999999800000003]` |
| exact | | `[1.99999997, 3, 0.9999999800000003...]` |

Every pivot without pivoting passes the tolerance, yet the answer is wrong. Both multipliers are `1 / 1e-8 = 1e8`, so the last row becomes `[0, 0, 1e16 | 9999999800000003]`. Doubles near 1e16 are 2 apart, and the code stores `9999999800000004`: `x2` comes out as `0.9999999800000005` where the exact value is `0.9999999800000003`. Back substitution then computes `x1 = (-99999998 + 1e8 * x2) / 1e-8`, which multiplies that error of about 1.5e-16 by 1e16: `x1 = 4.47`. With partial pivoting the multipliers are `1e-8` and `-1e-16`, nothing grows, and every entry of `x` is within 1e-15 of the exact one. The tests check both.

### Floating point: the same digits in three languages

`M[t][c] -= factor * M[r][c]` is a multiplication and a subtraction, each rounded. A compiler may fuse them into one FMA instruction with a single rounding: clang does on arm64 by default, and Go may. The last bits change, and in the example above the wrong answer becomes 4.546 instead of 4.470. The C++ file turns contraction off (`#pragma clang fp contract(off)`, and `#pragma GCC optimize("fp-contract=off")` for GCC), and the Go code writes `float64(factor * M[row][c])`, which the Go specification says rounds the product on its own. Python never fuses. So all three print the same doubles; the tests still compare floating-point results within a tolerance.

### Errors

| Input | Python | C++ | Go |
|-------|--------|-----|----|
| `A` with no rows or no columns, rows of different lengths, `b` of the wrong length, a determinant of a matrix that is not square | `ValueError` | `std::invalid_argument` | an error wrapping `ErrShape` |
| `p < 2` | `ValueError` | `std::invalid_argument` | an error wrapping `ErrModulus` |
| a pivot with no inverse modulo `p` (`p` is not prime) | `ValueError` | `std::invalid_argument` | an error wrapping `ErrNoInverse` |

The input is never modified: every function works on a copy.

## Step-by-Step Trace

`solve(A, b)` for the system in [Visual](#visual), values from the Python code:

| Step | Pivot | Action | Rows after it (`[A \| b]`) |
|------|-------|--------|----------------------------|
| column 0 | -3 (row 1, the largest of 2, 3, 2) | swap rows 0 and 1 | `[-3, -1, 2, -11]`, `[2, 1, -1, 8]`, `[-2, 1, 2, -3]` |
| | | row 1 -= -0.6667 x row 0 | `[0, 0.3333, 0.3333, 0.6667]` |
| | | row 2 -= 0.6667 x row 0 | `[0, 1.667, 0.6667, 4.333]` |
| column 1 | 1.667 (row 2, larger than 0.3333) | swap rows 1 and 2 | |
| | | row 2 -= 0.2 x row 1 | `[0, 0, 0.2, -0.2]` |
| column 2 | 0.2 (row 2) | nothing below | |
| back substitution | | `x2 = -0.2 / 0.2`, then `x1`, then `x0` | `x = [2.0, 3.0000000000000004, -0.9999999999999999]` |

Rank 3, pivot columns `[0, 1, 2]`, 2 swaps, 8 updates (3 + 3 in column 0, 2 in column 1). `determinant(A)` returns `-0.9999999999999993`: the exact answer is -1, and the last digits show the rounding.

`solve_mod(A, b, 7)`: `A` mod 7 is `[[2, 1, 6], [4, 6, 2], [5, 1, 2]]`, `b` mod 7 is `[1, 3, 4]`.

| Column | Pivot | Inverse | Row operations | Rows after them |
|--------|-------|---------|----------------|-----------------|
| 0 | 2 (row 0, the first nonzero) | 4, since 2 x 4 = 8 = 1 | row 1 -= 2 x row 0; row 2 -= 6 x row 0 | `[0, 4, 4, 1]`, `[0, 2, 1, 5]` |
| 1 | 4 (row 1) | 2 | row 2 -= 4 x row 1 | `[0, 0, 6, 1]` |
| 2 | 6 (row 2) | 6 | | |

Back substitution: `x2 = 1 x 6 = 6`, `x1 = (1 - 4 x 6) x 2 = 3`, `x0 = (1 - 1 x 3 - 6 x 6) x 4 = 2`, all modulo 7. So `x = [2, 3, 6]`, and 6 is -1 modulo 7. No swaps, and `determinant_mod(A, 7) = 2 x 4 x 6 mod 7 = 6`, which is -1 again.

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| `solve`, `solve_mod`: `n` equations, `m` unknowns | O(min(n, m) * n * m) | O(n * m), a copy of `[A \| b]` |
| square system, `n = m` | O(n^3): `(n - 1) n (n + 1) / 3` updates when every column has a pivot and no entry is 0 | O(n^2) |
| `determinant`, `determinant_mod` | O(n^3) | O(n^2) |
| back substitution | O(rank * m) | O(m) |
| the inverses in `solve_mod` | O(log p) multiplications each, one per pivot | |

Three nested loops make the cubic term: one pivot per column (at most `min(n, m)` of them), every row below the pivot (at most `n`), and every entry right of the pivot column (at most `m + 1`). Pivot `k` costs `(n - 1 - k)` rows times `(m - k)` entries, so a dense square system costs the sum of `j(j + 1)` for `j < n`, which is `(n - 1) n (n + 1) / 3`, about `n^3 / 3`. Choosing the pivot scans one column, O(n) per pivot, and back substitution is one row per pivot: both are O(n^2) together.

Counted with the Python code on random dense matrices: 330 updates for `n = 10`, 2,660 for 20, 21,320 for 40, 170,640 for 80 and 1,365,280 for 160, each exactly `(n - 1) n (n + 1) / 3`, so the ratio to `n^3 / 3` goes 0.99, 0.9975, 0.9994, 0.9998, 0.99996. A 100 x 50 system takes 105,400 updates and a 50 x 100 one 102,900, both the sum above. In Python `solve` took 0.19 s for `n = 200` and 1.59 s for `n = 400` (8.4 times as long for twice the size), and `solve_mod` about twice as long. In C++ at `-O2`, a 500 x 500 system took 16 ms in doubles and 0.37 s modulo 10^9 + 7, most of it in 128-bit remainders.

## When to Use

- A system of linear equations of moderate size (up to a few hundred unknowns in Python, about a thousand in C++ or Go), solved once.
- Counting or constructing solutions modulo a prime: the number of solutions of a consistent system is `p^(m - rank)`.
- The rank of a matrix, or whether a set of vectors is independent.
- The determinant of an integer matrix modulo a prime, for example a count of spanning trees by the matrix-tree theorem.
- Not for large sparse systems (iterative methods or sparse factorizations), and not for many right-hand sides with the same `A`: factor `A = LU` once and solve each `b` in O(n^2).

## Gaussian Elimination vs. Alternatives

| Method | Time | Notes |
|--------|------|-------|
| Gaussian elimination with partial pivoting (here) | O(n^3), about `n^3 / 3` updates | the standard dense solver; stable in practice |
| Without pivoting (`solve_without_pivoting`) | O(n^3) | wrong answers when a pivot is small; fine for diagonally dominant or symmetric positive definite matrices |
| Complete pivoting | O(n^3) plus O(n^3) comparisons | the largest entry of the whole remaining block; safer, rarely needed |
| Gauss-Jordan (reduced row echelon form) | about `n^3 / 2` updates | clears above each pivot too, so `x` is read off without back substitution; used for the inverse matrix |
| LU decomposition | O(n^3) once, O(n^2) per `b` | the same elimination, with the multipliers kept |
| Cramer's rule | O(n * n!) by cofactors, O(n^4) with determinants by elimination | a formula, not an algorithm for computers; the tests use cofactor expansion as a brute-force reference |
| Bareiss's algorithm | O(n^3) with exact integers | fraction-free elimination; entries stay as integers of bounded size |
| Elimination over GF(2) | O(n^3 / 64) with bitsets | the XOR basis: rows are bit masks and subtraction is XOR; not in this repository |

## Common Pitfalls

- **No pivoting in floating point.** A pivot of 1e-8 passes the tolerance of 1e-9 and still ruins the answer, as the example above shows. Always take the largest entry of the column.
- **Comparing to 0.0 exactly.** Rounding leaves `1e-17` where a 0 should be; without a tolerance the code finds a pivot there and returns garbage, or calls a consistent system inconsistent.
- **An absolute tolerance on badly scaled input.** `1e-9` is meaningless when the entries are around `1e-12`; scale the rows first.
- **Forgetting the inconsistent rows.** After the forward pass, the rows below the rank must have a zero right-hand side; skipping that check returns an `x` that does not solve the system.
- **Assuming `rank < n` means no solution.** It means some equations were combinations of others; the system can still be consistent, with infinitely many solutions when `rank < m`.
- **Losing the sign of the swaps** in the determinant.
- **A composite modulus.** Fermat's inverse `a^(p - 2)` is only an inverse when `p` is prime; the code checks each one and raises otherwise.
- **Overflow in modular products.** Two residues below a 64-bit `p` multiply to 128 bits: C++ uses `unsigned __int128` and Go `bits.Mul64` with `bits.Rem64`.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `gaussian_elimination.py` | `solve`, `solve_without_pivoting`, `determinant`, `solve_mod`, `determinant_mod`, `Kind`, `Solution`; the helpers `_choose_pivot`, `_subtract_row`, `_subtract_row_mod` and `_inverse` sit at module level so the tests can count the work |
| C++ | [C++/](C++/) | `gaussian_elimination.cpp` | `solve`, `solveWithoutPivoting`, `determinant`, `solveMod`, `determinantMod`, `Kind`, `kindName`, `Solution`, `ModSolution`; `unsigned __int128` products; FMA contraction off |
| Go | [Go/](Go/) | `main.go` | `Solve`, `SolveWithoutPivoting`, `Determinant`, `SolveMod`, `DeterminantMod`, `Kind`, `Solution`, `ModSolution`; `math/bits` products; errors instead of exceptions |

The three give the same answers on the same input: the pivot rule, the order of the loops and the free unknowns set to 0 are the same everywhere. The C++ and Go tests pin 33 results of `solve_mod` and 10 of `determinant_mod` exactly, and 12 results of `solve` and 5 of `determinant` within a tolerance, all computed by the Python code.

## Practice Problems

- [Linear Equation Solver (Kattis equationsolver)](https://open.kattis.com/problems/equationsolver): `n <= 100` in floating point; print `x`, `multiple` or `inconsistent`, the three kinds.
- [Partial Linear Equation Solver (Kattis equationsolverplus)](https://open.kattis.com/problems/equationsolverplus): the same, but print each unknown the system still determines and `?` for the others.
- [System of Linear Equations (CSES 3154)](https://cses.fi/problemset/task/3154): up to 500 equations in 500 unknowns modulo 10^9 + 7; any solution, or -1.
- [Guess the Root (Codeforces 1155E)](https://codeforces.com/problemset/problem/1155/E): ask for 11 values of a degree-10 polynomial and solve for its coefficients modulo the prime 10^6 + 3.
- [Vasya and Shifts (Codeforces 832E)](https://codeforces.com/problemset/problem/832/E): a system modulo 5; the number of ways is `5^(n - rank)` when it is consistent.

## Related

- [Matrix Exponentiation](../Matrix_Exponentiation/): the other matrix topic here; read first.
- [Euler's Totient](../../Number_Theory/Eulers_Totient/): Euler's theorem, of which the inverse `a^(p - 2)` is the prime case.
- [Modular Arithmetic](../../Number_Theory/Modular_Arithmetic/): inverses and products modulo `m`.
- [Modular Exponentiation](../../Number_Theory/Modular_Exponentiation/): the square-and-multiply behind `a^(p - 2) mod p`.
- [Strassen's Matrix Multiplication](../../../Divide_and_Conquer/Strassens_Matrix_Multiplication/): elimination in fewer than O(n^3) operations goes through fast matrix multiplication.
- [Galois Field GF(2^8)](../../../Coding_Theory/Galois_Field/): another finite field, where the same elimination works with that field's addition and multiplication.
- [Advanced Mathematical Algorithms](../)
