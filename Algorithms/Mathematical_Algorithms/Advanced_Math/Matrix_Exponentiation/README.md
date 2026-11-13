# Matrix Exponentiation

Matrix exponentiation computes `A^k` for a square matrix `A` with O(log k) matrix multiplications, using repeated squaring. It turns linear recurrences such as Fibonacci, and walk counting in graphs, into a matrix power: O(n^3 log k) for an `n x n` matrix.

## Intuition

Multiplying `A` by itself `k` times is too slow when `k` is huge. Matrix multiplication is associative, so write `k` in binary and build `A^1, A^2, A^4, A^8, ...` by squaring; `A^k` is the product of the powers that match the 1 bits of `k`.

The invariant of the iterative loop: at the start of every round, `result * base^k` equals the `A^k0` that was requested. When `k` reaches 0, `result` is the answer.

A linear recurrence is a matrix in disguise. `F(n+1) = F(n) + F(n-1)` maps the pair `(F(n), F(n-1))` to `(F(n+1), F(n))` with the matrix `[[1, 1], [1, 0]]`, so `A^n = [[F(n+1), F(n)], [F(n), F(n-1)]]`.

## Visual

```text
k = 11 = 1011 in binary          A = [[1, 1], [1, 0]]

 bit   base (A^(2^i))        used?   result so far
  1    A^1  [[1,1],[1,0]]    yes     A^1
  1    A^2  [[2,1],[1,1]]    yes     A^3
  0    A^4  [[5,3],[3,2]]    no      A^3
  1    A^8  [[34,21],[21,13]] yes    A^11 = [[144,89],[89,55]]

A^11 = [[F(12), F(11)], [F(11), F(10)]]
```

## How It Works

1. Start with `result = I` and `base = A` (entries reduced first when a modulus is given).
2. If the lowest bit of `k` is 1, set `result = result * base`.
3. Set `base = base * base` and shift `k` right by one.
4. Repeat until `k == 0`.

Modulus convention (all three languages): a modulus is applied when it is a positive number; `None` (Python), 0 and negative values mean no modulus. With a modulus every result lies in `[0, mod)`, negative entries included. Modulus 1 gives the zero matrix, including for `A^0`. A negative exponent is an error.

The recursive `matrix_power` / `matrixPower` / `MatrixPower` computes the same result: `A^k = (A^(k/2))^2` for even `k`, and `A * A^(k-1)` for odd `k`.

## Step-by-Step Trace

`A^11` for `A = [[1, 1], [1, 0]]`, values from the Python implementation:

| Step | Product | Result |
|------|---------|--------|
| `A^8 * A^2` | `[[34,21],[21,13]] * [[2,1],[1,1]]` | `A^10 = [[89, 55], [55, 34]]` |
| `A^10 * A^1` | `[[89,55],[55,34]] * [[1,1],[1,0]]` | `A^11 = [[144, 89], [89, 55]]` |

For Fibonacci, `fibonacci_matrix(n)` raises `A` to `n - 1` and multiplies by `(F(1), F(0)) = (1, 0)`, so the answer is the top left entry of `A^(n-1)`.

Walk counting: for the triangle graph (3 vertices, all joined), `A^3 = [[2,3,3],[3,2,3],[3,3,2]]`: 2 closed walks of length 3 from each vertex, and 3 walks to each other vertex.

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| `A^k`, `n x n` matrix | O(n^3 log k) | O(n^2) (plus O(log k) stack for the recursive form) |
| Fibonacci `F(k)` | O(log k) | O(log k) (the recursive `matrix_power` stack) |
| naive repeated multiplication | O(n^3 k) | O(n^2) |

Recurrence: `T(k) = T(k/2) + O(n^3)`.

## When to Use

Use it for linear recurrences with constant coefficients and a huge index, counting walks of a given length, and DP whose transition is the same at every step. Do not use it when `k` is small (a loop is simpler), when the recurrence is not linear, or when the dimension `d` is large (cost `d^3` per multiplication).

## Matrix Power vs. Alternatives

| Method | Time for `F(n)` | Notes |
|--------|-----------------|-------|
| Matrix exponentiation | O(log n) | exact, works modulo `m`, any linear recurrence |
| Simple loop | O(n) | fine up to about 10^7 |
| Fast doubling | O(log n) | Fibonacci only |
| Binet formula (floating point) | O(1) | loses exactness for large `n` |

## Common Pitfalls

1. **Overflow without a modulus.** `F(93)` does not fit in 64 bits. C++ `fibonacciMatrix` and Go `FibonacciMatrix` reject `n > 92` without a modulus (exception / panic); `matrixPower` itself does not check. Python integers do not overflow.
2. **Negative entries.** Normalised into `[0, mod)` in all three languages (the C++ and Go versions used to leave them negative).
3. **Large moduli.** C++ uses a 128-bit intermediate and Go uses `math/bits`, so any modulus up to 2^63 - 1 is exact.
4. **Wrong exponent.** `fibonacci_matrix` uses `A^(n-1)`; `A^n` gives `F(n+1)`.
5. **Negative exponents** are rejected (`ValueError`, `std::invalid_argument`, panic); there is no matrix inverse.
6. **Modulus 0** means no modulus, not a division by zero.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `matrix_exponentiation.py` | unbounded integers; `None`/0 means no modulus |
| C++ | [C++/](C++/) | `matrix_exponentiation.cpp` | `long long` entries, `__int128` products, exceptions |
| Go | [Go/](Go/) | `main.go` | `int64` entries, `math/bits` products, panics |

## Practice Problems

- [Climbing Stairs (LeetCode 70)](https://leetcode.com/problems/climbing-stairs/): solve it in O(log n).
- [Fibonacci Numbers (CSES)](https://cses.fi/problemset/task/1722): the n-th Fibonacci number modulo 10^9 + 7 for n up to 10^18.
- [N-th Tribonacci Number (LeetCode 1137)](https://leetcode.com/problems/n-th-tribonacci-number/): use a 3 x 3 matrix.
- Count walks of length `k` between two vertices of a small graph.
- Compute the `n`-th term of a recurrence with a negative coefficient modulo a prime.

## Related

- [Fast Fourier Transform](../Fast_Fourier_Transform/README.md)
- [Modular Exponentiation](../../Number_Theory/Modular_Exponentiation/README.md): the scalar version of the same idea.
- [Fibonacci Numbers](../../../Dynamic_Programming/Basic_DP/Fibonacci_Numbers/README.md)
