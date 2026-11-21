# Fast Fourier Transform (FFT)

The FFT computes the discrete Fourier transform of `n` values in O(n log n) instead of O(n^2). In programming it is mostly used to multiply two polynomials, or convolve two sequences, in O(n log n).

## Intuition

A polynomial can be stored as its coefficients or as its values at `n` points. Multiplying two polynomials is cheap in value form (multiply point by point, O(n)) and expensive in coefficient form (O(n^2)). The DFT converts coefficients to values at the `n` complex `n`-th roots of unity; the FFT does that conversion fast.

The trick: write `A(x) = E(x^2) + x * O(x^2)`, where `E` and `O` hold the even- and odd-indexed coefficients. Squaring the `n`-th roots of unity gives the `n/2`-th roots of unity, so one problem of size `n` becomes two of size `n/2` plus `n/2` cheap combinations. The invariant: after the recursion, `X[k]` equals `A(w^k)` for `w = e^(-2*pi*i/n)`.

## Visual

```text
fft([1, 2, 3, 4])             n = 4, w = -i

   even [1, 3]  -> FFT -> E = [ 4, -2]
   odd  [2, 4]  -> FFT -> O = [ 6, -2]

   X[0] = E[0] + w^0 * O[0] =  4 + 6        = 10
   X[2] = E[0] - w^0 * O[0] =  4 - 6        = -2
   X[1] = E[1] + w^1 * O[1] = -2 + (-i)(-2) = -2 + 2i
   X[3] = E[1] - w^1 * O[1] = -2 - (-i)(-2) = -2 - 2i
```

## How It Works

Convention: the forward transform is `X[k] = sum_j a[j] * e^(-2*pi*i*j*k/n)` (textbook and NumPy). The inverse uses `+` in the exponent and divides by `n`.

1. If `n` is not a power of two, a forward transform pads with zeros to the next power of two. The inverse requires a power-of-two length.
2. Split into even-indexed and odd-indexed elements; a single element is its own transform.
3. Recursively transform both halves.
4. For `k` from 0 to `n/2 - 1`: `t = w^k * O[k]`, `X[k] = E[k] + t`, `X[k + n/2] = E[k] - t`.
5. For the inverse, flip the sign of the exponent and divide by `n`.

Polynomial multiplication: pad both inputs to a power of two that holds `len(p) + len(q) - 1` coefficients, transform both, multiply point by point, apply the inverse, and round the real parts.

## Step-by-Step Trace

Multiply `(1 + 2x + 3x^2)` by `(4 + 5x)` with `n = 4` (values from the Python implementation):

| Stage | Values |
|-------|--------|
| FFT of `[1, 2, 3, 0]` | `[6, -2-2i, 2, -2+2i]` |
| FFT of `[4, 5, 0, 0]` | `[9, 4-5i, -1, 4+5i]` |
| Pointwise product | `[54, -18+2i, -2, -18-2i]` |
| Inverse FFT, rounded | `[4, 13, 22, 15]` |

The product is `4 + 13x + 22x^2 + 15x^3`.

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| `fft` / `ifft` | O(n log n) | O(n) |
| polynomial multiplication | O(n log n) | O(n) |
| direct DFT or schoolbook product | O(n^2) | O(n) |

The recurrence is `T(n) = 2 T(n/2) + O(n)`, which gives `n log n`.

**Precision.** Everything is double precision, so integer results are right only while the largest output coefficient is well below 2^53 (about 9e15). In the repository's check, `n = 512` with coefficients up to 1,000,000 (outputs near 1.3e14) was still exact, while `n = 4096` with coefficients up to 10^7 gave thousands of wrong coefficients. For bigger values, split the coefficients into smaller pieces, or use a number-theoretic transform (not implemented here).

## When to Use

Use the FFT for multiplying long polynomials or big numbers, convolutions, correlation and spectra. Do not use it when exact results are needed and the values are large (use an NTT or a splitting scheme), or when the inputs are short (schoolbook multiplication is faster).

## FFT vs. Alternatives

| Method | Time | Exact | Good for |
|--------|------|-------|----------|
| FFT multiplication | O(n log n) | No (rounding) | long inputs, moderate coefficients |
| Schoolbook | O(n^2) | Yes | short inputs |
| Karatsuba | O(n^1.585) | Yes | medium sizes |
| NTT | O(n log n) | Yes, modulo a prime | counting modulo a prime |

## Common Pitfalls

1. **Sign convention.** This code uses `e^(-2*pi*i/n)` for the forward transform, like NumPy. (Earlier versions used the opposite sign, giving the conjugate spectrum.)
2. **Output too short.** Pad to at least `len(p) + len(q) - 1` or the product wraps around.
3. **Inverse of a non-power-of-two length** is rejected (`ValueError`, `std::invalid_argument`, panic).
4. **Precision.** Large integer outputs are silently wrong; see the bound above.
5. **`int` overflow in C++.** `multiplyPolynomials` returns `long long` because a product of two `int` values can overflow `int`.
6. **Empty input** returns an empty result; multiplying by one empty polynomial gives `[0]`.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `fast_fourier_transform.py` | recursive; unbounded integers in `multiply_polynomials` |
| C++ | [C++/](C++/) | `fast_fourier_transform.cpp` | recursive; `std::vector<long long>` result; divides by 2 at every level of the inverse |
| Go | [Go/](Go/) | `main.go` | recursive; `int` (64-bit) result; panics on a bad inverse length |

## Practice Problems

- [Multiply Strings (LeetCode 43)](https://leetcode.com/problems/multiply-strings/): solve it with the FFT.
- [Fast Multiplication (SPOJ MUL)](https://www.spoj.com/problems/MUL/)
- [Nikita and Order Statistics (Codeforces 993E)](https://codeforces.com/problemset/problem/993/E)
- Write an iterative in-place FFT with bit-reversal and compare the speed.
- Implement an NTT modulo 998244353 and compare with this version.

## Related

- [Matrix Exponentiation](../Matrix_Exponentiation/README.md)
- [Modular Exponentiation](../../Number_Theory/Modular_Exponentiation/README.md)
- [Galois Field GF(2^8)](../../../Coding_Theory/Galois_Field/README.md): polynomial arithmetic over a finite field.
