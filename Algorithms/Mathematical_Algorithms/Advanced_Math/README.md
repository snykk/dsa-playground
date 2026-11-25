# Advanced Mathematical Algorithms

These topics cut a slow linear or quadratic computation down to O(log k) or O(n log n) steps by halving the problem. Matrix exponentiation squares a matrix to jump to the k-th term of a recurrence, the Fast Fourier Transform multiplies polynomials through their values, and the Number Theoretic Transform does the same with integers modulo a prime, exactly.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Matrix Exponentiation](Matrix_Exponentiation/) | A^k by repeated squaring, which turns a linear recurrence such as Fibonacci into O(log k) matrix products. | Intermediate |
| 2 | [Fast Fourier Transform](Fast_Fourier_Transform/) | The discrete Fourier transform in O(n log n) by splitting into even and odd positions; it multiplies polynomials. | Advanced |
| 3 | [Number Theoretic Transform](Number_Theoretic_Transform/) | The FFT's butterflies modulo 998244353, iterative and in place: polynomial products exact modulo the prime, with no rounding. | Advanced |

Matrix exponentiation and the NTT are exact integer arithmetic and the FFT is floating point, and that difference decides where each one fits.

## How They Compare

| Topic | Time | Space | Limit |
|-------|------|-------|-------|
| Matrix exponentiation | O(n^3 log k) | O(n^2) | without a modulus the entries overflow |
| Fibonacci by matrix | O(log k) | O(log k) | F(93) is the first Fibonacci number that does not fit in a signed 64-bit integer |
| Fast Fourier Transform | O(n log n) | O(n) | exact only while output coefficients stay below about 2^53 |
| Number Theoretic Transform | O(n log n) | O(n) | exact modulo 998244353; at most 2^23 coefficients |

`n` is the matrix size or the number of points, and `k` the exponent. The recursive versions add an O(log k) stack.

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| The k-th term of a linear recurrence, with k very large | Matrix exponentiation | one matrix power, with a modulus to keep numbers small |
| Multiplying two long polynomials | Fast Fourier Transform | O(n log n) instead of O(n^2) |
| Convolving two sequences | Fast Fourier Transform | convolution is polynomial multiplication of the sequences |
| Exact results with huge integer coefficients | Matrix exponentiation with a modulus, or an NTT | doubles lose exactness above about 2^53 |
| A convolution whose answer is wanted modulo 998244353 | Number Theoretic Transform | the same O(n log n) with no rounding |
| A small input | the direct method | the setup and constants outweigh the asymptotic gain |

## Common Pitfalls

- Without a modulus, matrix entries and Fibonacci numbers overflow 64 bits quickly. The C++ `fibonacciMatrix` and Go `FibonacciMatrix` refuse n above 92 without a modulus, but the matrix power itself does not check.
- The power is only defined for a square matrix.
- The FFT rounds from doubles, so past coefficients of about 2^53 it is wrong.
- The NTT is exact only modulo its prime: a coefficient above 998244353 comes out reduced.
- The forward transform pads with zeros to the next power of two. The inverse refuses other lengths: Python raises `ValueError`.
- On a small input the plain loop or the direct product is faster and simpler.

## Related

- [Modular Exponentiation](../Number_Theory/Modular_Exponentiation/): read first.
- [Number Theory Algorithms](../Number_Theory/): square and multiply, the idea matrix exponentiation extends.
- [Fibonacci Numbers](../../Dynamic_Programming/Basic_DP/Fibonacci_Numbers/): the recurrence that becomes a 2 x 2 matrix power.
- [Divide and Conquer](../../Divide_and_Conquer/): the halving idea behind these topics.
- [Galois Field GF(2^8)](../../Coding_Theory/Galois_Field/): another finite field, used for error-correcting codes.
