# Number Theory Algorithms

Number theory algorithms work on exact integers, using divisors, remainders, powers and primes. They build on each other. The Euclidean algorithm gives gcd and inverses, modular arithmetic and exponentiation use them, and the sieve and Miller-Rabin tell primes apart.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Euclidean Algorithm](Euclidean_Algorithm/) | gcd by repeated remainders, and the extended form that gives the Bezout coefficients behind inverses. | Beginner |
| 2 | [Modular Arithmetic](Modular_Arithmetic/) | Add, subtract and multiply with wrap-around, and divide by multiplying with an inverse. | Beginner |
| 3 | [Modular Exponentiation](Modular_Exponentiation/) | base^e mod m in O(log e) multiplications by squaring the base once per bit of the exponent. | Beginner |
| 4 | [Chinese Remainder Theorem](Chinese_Remainder_Theorem/) | Combine congruences with different moduli into one, using an extended Euclid per congruence. | Intermediate |
| 5 | [Sieve of Eratosthenes](Sieve_of_Eratosthenes/) | Cross out multiples of each prime to list every prime up to n and answer "is k prime?" in O(1). | Beginner |
| 6 | [Miller-Rabin Primality Test](Miller_Rabin_Primality_Test/) | Decide whether one huge number is prime with a few modular exponentiations. | Advanced |

All results are exact integer arithmetic. Modular arithmetic and modular exponentiation each lean on the topic before them, the Chinese Remainder Theorem needs the extended Euclid, and Miller-Rabin needs modular exponentiation.

## How They Compare

| Topic | Time | Extra space | Note |
|-------|------|-------------|------|
| Euclidean algorithm | O(log min(a, b)) | O(1) | O(log n) for the recursive version |
| Modular arithmetic | O(1); inverse O(log m) | O(1) | the inverse uses the extended Euclid |
| Modular exponentiation | O(log e) | O(1) | the naive loop is O(e) |
| Chinese Remainder Theorem | O(n log max m) | O(1) | the lcm must be below 2^63 in C++ and Go |
| Sieve of Eratosthenes | O(n log log n) | O(n) | one flag per number |
| Miller-Rabin | O(k log n) multiplications for k witnesses | O(1) | a composite passes one random witness with probability at most 1/4 |

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| gcd or lcm of two numbers | Euclidean algorithm | a few remainder steps, no factoring |
| Counting or hashing modulo a prime | Modular arithmetic | wrap after every step so values stay small |
| A huge power modulo m | Modular exponentiation | about 2 log2(e) multiplications instead of e |
| Remainders modulo several numbers | Chinese Remainder Theorem | one answer modulo the lcm, or a report that none exists |
| All primes up to a limit | Sieve of Eratosthenes | the table also answers later queries in O(1) |
| Is this one large number prime? | Miller-Rabin | a sieve would need memory proportional to the number |

## Common Pitfalls

- Compute the lcm as `a / gcd * b`, not `a * b / gcd`: the product can overflow.
- An inverse needs `gcd(a, m) = 1`. Python's `mod_inverse` returns `None` otherwise.
- Modular multiplication of two values near `m` needs 128-bit intermediates once `m` is above about 3.04e9, in both exponentiation and Miller-Rabin.
- Fermat's test is fooled by Carmichael numbers such as 561, which is why Miller-Rabin tests more than `a^(n-1) = 1`.
- A sieve for one big number needs O(n) memory. Use Miller-Rabin instead.

## Related

- [Big O Notation](../../../Complexity_Analysis/Time_Complexity/Big_O_Notation/): read first.
- [Advanced Mathematical Algorithms](../Advanced_Math/): the same halving idea on matrices and polynomials.
- [Galois Field GF(2^8)](../../Coding_Theory/Galois_Field/): a finite field built on modular ideas.
- [Dynamic Programming](../../Dynamic_Programming/): counting problems often take their answer modulo a prime.
