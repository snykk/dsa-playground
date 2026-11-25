# Mathematical Algorithms

Mathematical algorithms compute with exact integers and structured numbers. Number Theory covers divisors, remainders, powers, primes and Euler's totient. Advanced Math covers binomial coefficients, matrix powers, linear systems, and polynomial products by the Fast Fourier and Number Theoretic Transforms.

## Topics

Read them in this order.

| # | Section | What it adds | Level |
|---|---------|--------------|-------|
| 1 | [Number Theory Algorithms](Number_Theory/) | Euclid, modular arithmetic and exponentiation, the Chinese Remainder Theorem, the sieve, Euler's totient and Miller-Rabin. | 7 topics |
| 2 | [Advanced Mathematical Algorithms](Advanced_Math/) | Combinatorics, matrix exponentiation for recurrences, Gaussian elimination for linear systems, and the Fast Fourier and Number Theoretic Transforms for polynomial products. | 5 topics |

The two meet in modular exponentiation. Square and multiply for numbers is the template for matrix exponentiation, which squares matrices in the same way. The modular inverse of Number Theory is what combinatorics, Gaussian elimination and the NTT need to work modulo a prime.

## How They Compare

| Sub-area | Topics | Question it answers | Typical cost |
|----------|--------|---------------------|--------------|
| Number Theory | Euclid, Modular Arithmetic, Modular Exponentiation, CRT, Sieve, Euler's Totient, Miller-Rabin | divisors, remainders, big powers, primes, counts of coprimes | O(log n) to O(n log log n) |
| Advanced Math | Combinatorics, Matrix Exponentiation, Gaussian Elimination, FFT, NTT | counts, the k-th term of a recurrence, linear systems, products of long polynomials | O(1) per C(n, k) after O(n), O(n^3 log k), O(n^3), O(n log n) |

## Where to Start

1. Euclidean algorithm and modular arithmetic. They give gcd, the wrap-around of remainders and the modular inverse.
2. Modular exponentiation. Square and multiply is the idea you meet again in matrix exponentiation.
3. The Chinese Remainder Theorem, the sieve, Euler's totient and Miller-Rabin. CRT builds on the extended Euclid, Euler's totient on the sieve, and Miller-Rabin on modular exponentiation. The sieve needs only the basics.
4. Combinatorics, which needs one modular inverse; matrix exponentiation and Gaussian elimination on matrices; then the Fast Fourier Transform and the Number Theoretic Transform. Matrix exponentiation and the two transforms are divide and conquer on a larger object.

| Situation | Go to | Why |
|-----------|-------|-----|
| gcd, lcm or a modular inverse | [Euclidean Algorithm](Number_Theory/Euclidean_Algorithm/) | a few remainder steps |
| A huge power modulo m | [Modular Exponentiation](Number_Theory/Modular_Exponentiation/) | O(log e) multiplications |
| Is a large number prime? | [Miller-Rabin Primality Test](Number_Theory/Miller_Rabin_Primality_Test/) | exact for n < 2^64 with 12 fixed bases |
| All primes up to n | [Sieve of Eratosthenes](Number_Theory/Sieve_of_Eratosthenes/) | O(n log log n), O(1) lookups afterwards |
| phi(n), or phi of every number up to n | [Euler's Totient](Number_Theory/Eulers_Totient/) | O(sqrt n) by factorization, O(n) with the linear sieve |
| Many C(n, k) modulo a prime | [Combinatorics](Advanced_Math/Combinatorics/) | O(1) per query after O(n) factorial tables |
| The k-th term of a linear recurrence | [Matrix Exponentiation](Advanced_Math/Matrix_Exponentiation/) | O(log k) small matrix products |
| Solving a system of linear equations, a rank or a determinant | [Gaussian Elimination](Advanced_Math/Gaussian_Elimination/) | O(n^3), in floating point or exactly modulo a prime |
| Multiplying long polynomials | [Fast Fourier Transform](Advanced_Math/Fast_Fourier_Transform/) | O(n log n) instead of O(n^2), with rounding error |
| A convolution wanted modulo 998244353 | [Number Theoretic Transform](Advanced_Math/Number_Theoretic_Transform/) | O(n log n), exact modulo the prime |

## Common Pitfalls

- Modular products need 128-bit intermediates once the modulus is above about 3.04e9. Matrix entries and Fibonacci numbers overflow 64 bits without a modulus.
- The FFT rounds from doubles, so it is exact only while coefficients stay below about 2^53. The NTT is exact, but only modulo its prime.
- Gaussian elimination in floating point needs partial pivoting: a tiny pivot can make the answer visibly wrong.
- Dividing modulo `m` needs an inverse, which exists only when `gcd(a, m) = 1`.
- A sieve for a single big number wastes O(n) memory. Use Miller-Rabin.

## Related

- [Big O Notation](../../Complexity_Analysis/Time_Complexity/Big_O_Notation/): read first.
- [Coding Theory](../Coding_Theory/): builds a finite field on modular ideas.
- [Dynamic Programming](../Dynamic_Programming/): uses matrix powers to speed up linear recurrences.
- [Divide and Conquer](../Divide_and_Conquer/): the halving idea behind modular and matrix exponentiation and the two transforms.
