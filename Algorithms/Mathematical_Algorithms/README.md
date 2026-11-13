# Mathematical Algorithms

Mathematical algorithms compute with exact integers and structured numbers. Number Theory covers divisors, remainders, powers and primes. Advanced Math covers matrix powers and the Fast Fourier Transform, which cut a slow computation to a logarithmic one.

## Topics

Read them in this order.

| # | Section | What it adds | Level |
|---|---------|--------------|-------|
| 1 | [Number Theory Algorithms](Number_Theory/) | Euclid, modular arithmetic and exponentiation, the Chinese Remainder Theorem, the sieve and Miller-Rabin. | 6 topics |
| 2 | [Advanced Mathematical Algorithms](Advanced_Math/) | Matrix exponentiation for recurrences and the Fast Fourier Transform for polynomial products. | 2 topics |

The two meet in modular exponentiation. Square and multiply for numbers is the template for matrix exponentiation, which squares matrices in the same way.

## How They Compare

| Sub-area | Topics | Question it answers | Typical cost |
|----------|--------|---------------------|--------------|
| Number Theory | Euclid, Modular Arithmetic, Modular Exponentiation, CRT, Sieve, Miller-Rabin | divisors, remainders, big powers, primes | O(log n) to O(n log log n) |
| Advanced Math | Matrix Exponentiation, Fast Fourier Transform | the k-th term of a recurrence, products of long polynomials | O(n^3 log k), O(n log n) |

## Where to Start

1. Euclidean algorithm and modular arithmetic. They give gcd, the wrap-around of remainders and the modular inverse.
2. Modular exponentiation. Square and multiply is the idea you meet again in matrix exponentiation.
3. The Chinese Remainder Theorem, the sieve and Miller-Rabin. CRT builds on the extended Euclid, and Miller-Rabin on modular exponentiation. The sieve needs only the basics.
4. Matrix exponentiation, then the Fast Fourier Transform. Both are divide and conquer on a larger object.

| Situation | Go to | Why |
|-----------|-------|-----|
| gcd, lcm or a modular inverse | [Euclidean Algorithm](Number_Theory/Euclidean_Algorithm/) | a few remainder steps |
| A huge power modulo m | [Modular Exponentiation](Number_Theory/Modular_Exponentiation/) | O(log e) multiplications |
| Is a large number prime? | [Miller-Rabin Primality Test](Number_Theory/Miller_Rabin_Primality_Test/) | exact for n < 2^64 with 12 fixed bases |
| All primes up to n | [Sieve of Eratosthenes](Number_Theory/Sieve_of_Eratosthenes/) | O(n log log n), O(1) lookups afterwards |
| The k-th term of a linear recurrence | [Matrix Exponentiation](Advanced_Math/Matrix_Exponentiation/) | O(log k) small matrix products |
| Multiplying long polynomials | [Fast Fourier Transform](Advanced_Math/Fast_Fourier_Transform/) | O(n log n) instead of O(n^2), with rounding error |

## Common Pitfalls

- Modular products need 128-bit intermediates once the modulus is above about 3.04e9. Matrix entries and Fibonacci numbers overflow 64 bits without a modulus.
- The FFT rounds from doubles, so it is exact only while coefficients stay below about 2^53.
- Dividing modulo `m` needs an inverse, which exists only when `gcd(a, m) = 1`.
- A sieve for a single big number wastes O(n) memory. Use Miller-Rabin.

## Related

- [Big O Notation](../../Complexity_Analysis/Time_Complexity/Big_O_Notation/): read first.
- [Coding Theory](../Coding_Theory/): builds a finite field on modular ideas.
- [Dynamic Programming](../Dynamic_Programming/): uses matrix powers to speed up linear recurrences.
- [Divide and Conquer](../Divide_and_Conquer/): the halving idea behind both sub-areas.
