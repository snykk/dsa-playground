"""
Euler's Totient

phi(n) counts the integers k with 1 <= k <= n and gcd(k, n) = 1. If n = p1^k1 * ... * pr^kr,

    phi(n) = n * (1 - 1/p1) * ... * (1 - 1/pr)

so one factorization gives phi(n). This module computes it two ways:

- phi(n): factor one n by trial division in O(sqrt n), then apply the product formula.
- linear_sieve(n): phi of every number from 0 to n in O(n), with the smallest prime factor of
  every number and the list of primes. Each composite m is crossed out exactly once, as
  i * p with p the smallest prime factor of m, and phi(m) follows from phi(i) in O(1).

Euler's theorem says a^phi(n) = 1 (mod n) when gcd(a, n) = 1, so a^(phi(n) - 1) is the
inverse of a modulo n: mod_inverse_euler. For a prime n it is Fermat's a^(n - 2).

phi(0) is undefined: phi, prime_factors and mod_inverse_euler raise ValueError for n < 1. The
table from linear_sieve holds 0 at index 0, so that index i holds phi(i).

Python integers never overflow, so any n works here; the C++ and Go versions take unsigned
64-bit n, up to 2^64 - 1, and write the loop test p * p <= n as p <= n // p, which cannot
overflow. This file writes it the same way, so that the three agree line by line.
"""

import math
from typing import List, NamedTuple, Tuple


def _check_positive(n: int, what: str = "n") -> None:
    if n < 1:
        raise ValueError(f"{what} = {n}: phi is defined for n >= 1 only (phi(0) is undefined)")


def _divide_out(n: int, p: int) -> Tuple[int, int]:
    """Divide p out of n as often as it goes: (n // p^k, k). Called once per candidate p."""
    k = 0
    while n % p == 0:
        n //= p
        k += 1
    return n, k


def prime_factors(n: int) -> List[Tuple[int, int]]:
    """The prime factorization of n >= 1 by trial division, as (p, k) pairs with p increasing.

    The candidates p = 2, 3, 4, ... are tried while p * p <= n, where n is what is left after
    dividing out the smaller factors. A composite p never divides what is left, because its
    prime factors are gone already. When the loop stops, what is left is 1 or one prime: a
    composite would have a prime factor of at most its square root, and that was tried.

    prime_factors(1) is []. Raises ValueError for n < 1.

    Time: O(sqrt n) candidates in the worst case (n prime); n = 2^k takes one.
    """
    _check_positive(n)
    factors = []
    p = 2
    # p <= n // p is p * p <= n for positive integers, without forming p * p.
    while p <= n // p:
        n, k = _divide_out(n, p)
        if k:
            factors.append((p, k))
        p += 1
    if n > 1:
        factors.append((n, 1))
    return factors


def phi(n: int) -> int:
    """Euler's totient of n >= 1 by trial division and the product formula: O(sqrt n).

    result starts at n and loses the fraction 1/p of itself for each distinct prime p: the
    division is exact, because p divides n and none of the earlier steps removed it.
    Raises ValueError for n < 1.
    """
    result = n
    for p, _ in prime_factors(n):
        result -= result // p  # result * (1 - 1/p)
    return result


class TotientSieve(NamedTuple):
    """The tables of linear_sieve(n), each of length n + 1 except primes."""

    phi: List[int]  # phi[i] for 1 <= i <= n; phi[0] = 0 stands for "undefined"
    spf: List[int]  # the smallest prime factor of i for i >= 2; spf[0] = spf[1] = 0
    primes: List[int]  # the primes up to n, increasing
    crossings: int  # how many times a number was crossed out: once per composite


def _cross_out(phi_table: List[int], spf: List[int], i: int, p: int) -> None:
    """Cross out the composite i * p, whose smallest prime factor is p (p <= spf[i])."""
    m = i * p
    spf[m] = p
    if p == spf[i]:
        # p divides i already: i = p^k * r with gcd(p, r) = 1, and phi(p^(k+1)) = p * phi(p^k).
        phi_table[m] = phi_table[i] * p
    else:
        # p does not divide i: gcd(i, p) = 1, so phi(i * p) = phi(i) * phi(p) = phi(i) * (p - 1).
        phi_table[m] = phi_table[i] * (p - 1)


def linear_sieve(n: int) -> TotientSieve:
    """phi, the smallest prime factor and the primes for every number up to n >= 0: O(n).

    For each i from 2 to n: if no smaller number crossed i out, i is prime. Then i crosses out
    i * p for the primes p in increasing order, up to and including spf[i]. Every composite m
    is crossed out exactly once, by i = m / spf(m) and p = spf(m): a p above spf[i] would not be
    the smallest prime factor of i * p. So the work is O(n), against O(n log log n) for the
    Sieve of Eratosthenes, and crossings ends equal to the number of composites up to n.

    Raises ValueError for n < 0. linear_sieve(0) gives phi = [0], spf = [0], no primes.
    """
    if n < 0:
        raise ValueError(f"n = {n}: the sieve limit must not be negative")
    phi_table = [0] * (n + 1)
    spf = [0] * (n + 1)
    primes: List[int] = []
    crossings = 0
    if n >= 1:
        phi_table[1] = 1
    for i in range(2, n + 1):
        if spf[i] == 0:  # nothing crossed i out: no prime below i divides it
            spf[i] = i
            phi_table[i] = i - 1
            primes.append(i)
        for p in primes:
            # p > n // i is i * p > n, written so that it cannot overflow in C++ and Go.
            if p > spf[i] or p > n // i:
                break
            _cross_out(phi_table, spf, i, p)
            crossings += 1
    return TotientSieve(phi_table, spf, primes, crossings)


def mod_inverse_euler(a: int, n: int) -> int:
    """The inverse of a modulo n by Euler's theorem: a^(phi(n) - 1) mod n, in 0..n-1.

    a^phi(n) = 1 (mod n) when gcd(a, n) = 1, so a * a^(phi(n) - 1) = 1 (mod n). It costs one
    phi(n), O(sqrt n), plus one modular power, O(log n) multiplications; the extended
    Euclidean algorithm finds the same number in O(log n) without factoring n.
    a may be negative or larger than n; it is reduced first. Modulo 1 every number is 0, so the
    answer for n = 1 is 0.

    Raises ValueError when n < 1 or gcd(a, n) != 1 (then no inverse exists).
    """
    _check_positive(n, "the modulus n")
    r = a % n
    g = math.gcd(r, n)
    if g != 1:
        raise ValueError(f"{a} has no inverse modulo {n}: gcd({a}, {n}) = {g}")
    return pow(r, phi(n) - 1, n)


def main() -> None:
    print("phi(n) for n = 1..12:", [phi(n) for n in range(1, 13)])
    print("prime_factors(360) =", prime_factors(360), " phi(360) =", phi(360))
    big = 2**64 - 1
    print(f"phi(2^64 - 1) = {phi(big)} from {prime_factors(big)}")
    table = linear_sieve(30)
    print("linear_sieve(30).phi =", table.phi)
    print("linear_sieve(30).spf =", table.spf)
    print(f"{len(table.primes)} primes, {table.crossings} crossings (one per composite)")
    print("sum of phi(d) over the divisors of 360 =", sum(phi(d) for d in range(1, 361) if 360 % d == 0))
    print("mod_inverse_euler(7, 360) =", mod_inverse_euler(7, 360), " check:", 7 * mod_inverse_euler(7, 360) % 360)


if __name__ == "__main__":
    main()
