"""
Combinatorics

Counting the ways to choose, arrange and distribute things, exactly and modulo a prime.

Binomial coefficients C(n, k), the number of k-element subsets of an n-element set, three ways:

- pascal_triangle(n) and binomial_pascal(n, k): Pascal's rule C(n, k) = C(n-1, k-1) + C(n-1, k),
  additions only. The whole triangle up to row n takes O(n^2) additions; one value takes
  O(n * min(k, n - k)) additions on a single row of min(k, n - k) + 1 cells.
- binomial(n, k): the multiplicative formula, C(n, k) = prod over i = 1..k of (n - k + i) / i,
  in min(k, n - k) steps. After step i the running value is C(n - k + i, i), never more than the
  answer, and each step divides the common factor out before it multiplies, so the C++ and Go
  versions overflow only when the answer itself does not fit in 64 bits.
- ModBinomial(n_max, p): fact[i] = i! mod p and inv_fact[i] = (i!)^-1 mod p for i <= n_max, with
  ONE modular inverse: inv_fact[n_max] = fact[n_max]^(p - 2) mod p (Euler's theorem for a prime,
  where phi(p) = p - 1), then inv_fact[i - 1] = inv_fact[i] * i backwards. A query
  C(n, k) mod p = fact[n] * inv_fact[k] * inv_fact[n - k] costs O(1). It needs a prime p > n_max:
  from n = p on, p divides n!, so n! is 0 modulo p and has no inverse. Lucas's theorem takes
  over there (Utilities/Optimization_Techniques/Modular_Arithmetic_Tricks).

Then three counts built on them:

- Catalan numbers: catalan_numbers(n) by the recurrence C_(m+1) = sum of C_i * C_(m-i), O(n^2),
  and catalan(n) = C(2n, n) / (n + 1).
- Stars and bars: stars_and_bars(n, k) = C(n + k - 1, k - 1) ways to put n identical items into
  k boxes, and stars_and_bars_positive(n, k) = C(n - 1, k - 1) with at least one item per box.
- Derangements: derangement_numbers(n) = [D(0), ..., D(n)], D(m) = (m - 1)(D(m - 1) + D(m - 2)).

C(n, k) is 0 for k < 0 or k > n (there is no such subset; a negative n falls under k > n), and
C(n, 0) = C(n, n) = 1, C(0, 0) included. Python integers never overflow; the C++ and Go
versions return unsigned 64-bit numbers and report an overflow instead of a wrong number.
The helpers _pascal_cell, _add_left, _times_over and _power sit at module level, so that the
tests can wrap them and count the work.
"""

import math
from typing import List, Tuple


def _check_not_negative(value: int, what: str) -> None:
    if value < 0:
        raise ValueError(f"{what} = {value} must not be negative")


# ---------- Pascal's triangle ----------


def _pascal_cell(above: List[int], j: int) -> int:
    """Pascal's rule: column j of a row is the sum of the two cells above it, j - 1 and j."""
    return above[j - 1] + above[j]


def pascal_triangle(n: int) -> List[List[int]]:
    """Rows 0..n of Pascal's triangle, exact: rows[r][j] = C(r, j).

    Both ends of a row are 1 (C(r, 0) = C(r, r) = 1); every other cell is the sum of the two
    above it. That is n(n - 1) / 2 additions in all, one per interior cell. Raises ValueError
    for n < 0.
    """
    _check_not_negative(n, "n")
    rows = [[1]]
    for r in range(1, n + 1):
        above = rows[r - 1]
        row = [1] * (r + 1)
        for j in range(1, r):
            row[j] = _pascal_cell(above, j)
        rows.append(row)
    return rows


def _add_left(row: List[int], j: int) -> None:
    """One cell of binomial_pascal's row: C(r, j) = C(r - 1, j) + C(r - 1, j - 1), in place."""
    row[j] += row[j - 1]


def binomial_pascal(n: int, k: int) -> int:
    """C(n, k) by Pascal's rule on one row: O(n * min(k, n - k)) additions, O(min(k, n - k)) memory.

    The row holds columns 0..k of the triangle, with k = min(k, n - k) (C(n, k) = C(n, n - k)).
    Each new row is written right to left, so row[j - 1] still holds the previous row when
    row[j] reads it. Returns 0 for k < 0 or k > n.
    """
    if k < 0 or k > n:
        return 0
    k = min(k, n - k)
    row = [1] + [0] * k  # row 0 of the triangle, columns 0..k
    for r in range(1, n + 1):
        for j in range(min(r, k), 0, -1):
            _add_left(row, j)
    return row[k]


# ---------- the multiplicative formula ----------


def _times_over(value: int, m: int, i: int) -> int:
    """value * m // i, for an i that divides value * m, without a product above the result.

    g = gcd(value, i) comes out of value; what is left of i is coprime to value / g and still
    divides value * m, so it divides m. The product (value / g) * (m / (i / g)) is then exactly
    the result: in 64 bits it overflows only if the result does.
    """
    g = math.gcd(value, i)
    return (value // g) * (m // (i // g))


def binomial(n: int, k: int) -> int:
    """C(n, k) by the multiplicative formula, exact, in min(k, n - k) steps.

    Before step i the value is C(n - k + i - 1, i - 1); times (n - k + i) / i it becomes
    C(n - k + i, i), so the steps climb C(n - k, 0), C(n - k + 1, 1), ..., C(n, k), each one an
    integer no larger than the answer. Returns 0 for k < 0 or k > n.
    """
    if k < 0 or k > n:
        return 0
    k = min(k, n - k)
    result = 1
    for i in range(1, k + 1):
        result = _times_over(result, n - k + i, i)
    return result


# ---------- factorials and inverse factorials modulo a prime ----------


def _power(base: int, exp: int, m: int) -> Tuple[int, int]:
    """base^exp mod m by square and multiply: (value, multiplications made).

    The same loop as powMod in C++ and PowMod in Go: one squaring per bit of exp, and one
    product into the result per set bit. 1 % m for exp = 0.
    """
    result = 1 % m
    base %= m
    multiplications = 0
    while exp > 0:
        if exp & 1:
            result = result * base % m
            multiplications += 1
        base = base * base % m
        multiplications += 1
        exp >>= 1
    return result, multiplications


class ModBinomial:
    """i! and (i!)^-1 modulo a prime p for every i <= n_max, so that C(n, k) mod p is O(1).

    Building takes O(n_max + log p): n_max products for fact, one modular power for the inverse
    of n_max!, and n_max products backwards for inv_fact, since (i - 1)!^-1 = i * (i!)^-1.
    multiplications counts those products (the check of the inverse is not counted).

    Raises ValueError when n_max < 0, when p < 2, when n_max >= p (p divides n_max!, which then
    has no inverse; Lucas's theorem handles n >= p), and when the power p - 2 does not invert
    n_max! (then p is not prime). A composite p that passes that check still gives right
    answers, because the inverse it found is a true inverse.
    """

    def __init__(self, n_max: int, p: int):
        _check_not_negative(n_max, "n_max")
        if p < 2:
            raise ValueError(f"p = {p} is not prime: the modulus must be a prime")
        if n_max >= p:
            raise ValueError(
                f"n_max = {n_max} >= p = {p}: p divides n! for every n >= p, so n! has no inverse modulo p; "
                f"Lucas's theorem handles n >= p"
            )
        fact = [1] * (n_max + 1)
        multiplications = 0
        for i in range(1, n_max + 1):
            fact[i] = fact[i - 1] * i % p
            multiplications += 1
        inverse, power_multiplications = _power(fact[n_max], p - 2, p)
        multiplications += power_multiplications
        check = fact[n_max] * inverse % p
        if check != 1:
            raise ValueError(
                f"p = {p} is not prime: {fact[n_max]} * {inverse} % {p} = {check}, "
                f"so the power p - 2 did not invert {n_max}! modulo p"
            )
        inv_fact = [1] * (n_max + 1)
        inv_fact[n_max] = inverse
        for i in range(n_max, 0, -1):
            inv_fact[i - 1] = inv_fact[i] * i % p
            multiplications += 1
        self.n_max = n_max
        self.p = p
        self.fact = fact
        self.inv_fact = inv_fact
        self.multiplications = multiplications

    def binomial(self, n: int, k: int) -> int:
        """C(n, k) mod p in O(1): fact[n] * inv_fact[k] * inv_fact[n - k] mod p.

        Returns 0 for k < 0 or k > n, before looking at the table; raises ValueError for an
        n above n_max.
        """
        if k < 0 or k > n:
            return 0
        if n > self.n_max:
            raise ValueError(f"n = {n} is past the table: it was built for n <= {self.n_max}")
        return self.fact[n] * self.inv_fact[k] % self.p * self.inv_fact[n - k] % self.p


# ---------- Catalan numbers ----------


def catalan_numbers(n: int) -> List[int]:
    """[C_0, ..., C_n] by the recurrence C_0 = 1, C_m = sum over i of C_i * C_(m-1-i): O(n^2).

    A structure of size m >= 1 splits at its first piece into one of size i and one of size
    m - 1 - i: the first matched pair of parentheses, the root of a binary tree, the triangle
    on a fixed side of a polygon. Raises ValueError for n < 0.
    """
    _check_not_negative(n, "n")
    cat = [1] + [0] * n
    for m in range(1, n + 1):
        cat[m] = sum(cat[i] * cat[m - 1 - i] for i in range(m))
    return cat


def catalan(n: int) -> int:
    """C_n = C(2n, n) / (n + 1), exact. Raises ValueError for n < 0."""
    _check_not_negative(n, "n")
    return binomial(2 * n, n) // (n + 1)


# ---------- stars and bars ----------


def stars_and_bars(n: int, k: int) -> int:
    """Ways to put n identical items into k distinct boxes: C(n + k - 1, k - 1).

    A distribution is a row of n stars and k - 1 bars between the boxes; choosing where the
    bars go chooses it. With k = 0 there is one way to place nothing and none to place n >= 1
    items. Raises ValueError for a negative n or k.
    """
    _check_not_negative(n, "n")
    _check_not_negative(k, "k")
    if k == 0:
        return 1 if n == 0 else 0
    return binomial(n + k - 1, k - 1)


def stars_and_bars_positive(n: int, k: int) -> int:
    """The same with at least one item in every box: C(n - 1, k - 1), 0 when n < k.

    Put one item in each box first; the other n - k go anywhere: C((n - k) + k - 1, k - 1).
    Equivalently, the k - 1 bars go into k - 1 of the n - 1 gaps between the stars.
    Raises ValueError for a negative n or k.
    """
    _check_not_negative(n, "n")
    _check_not_negative(k, "k")
    if k == 0:
        return 1 if n == 0 else 0
    return binomial(n - 1, k - 1)


# ---------- derangements ----------


def derangement_numbers(n: int) -> List[int]:
    """[D(0), ..., D(n)]: D(m) counts the permutations of m items that leave none in place.

    D(0) = 1 (the empty permutation), D(1) = 0, and D(m) = (m - 1)(D(m - 1) + D(m - 2)): item 1
    goes to one of m - 1 other places j; then either j goes to place 1 (the other m - 2 items
    form a derangement) or it does not (place 1 acts as j's forbidden place: a derangement of
    m - 1). Raises ValueError for n < 0.
    """
    _check_not_negative(n, "n")
    d = [1, 0][: n + 1]
    for m in range(2, n + 1):
        d.append((m - 1) * (d[m - 1] + d[m - 2]))
    return d


def main() -> None:
    rows = pascal_triangle(6)
    print("Pascal's triangle, rows 0..6:")
    for row in rows:
        print("   ", " ".join(f"{v:>3}" for v in row))
    print("C(10, 3) three ways:", binomial_pascal(10, 3), binomial(10, 3), ModBinomial(10, 10**9 + 7).binomial(10, 3))
    print("C(67, 33) =", binomial(67, 33), "(the largest middle value that fits in 64 bits)")
    table = ModBinomial(10**6, 10**9 + 7)
    print("C(10^6, 5 * 10^5) mod 10^9 + 7 =", table.binomial(10**6, 5 * 10**5), f"({table.multiplications} multiplications to build)")
    print("Catalan numbers C_0..C_10:", catalan_numbers(10), " catalan(10) =", catalan(10))
    print("stars_and_bars(5, 3) =", stars_and_bars(5, 3), " stars_and_bars_positive(5, 3) =", stars_and_bars_positive(5, 3))
    d = derangement_numbers(15)
    print("D(0..10):", d[:11])
    print("D(n) / n! against 1/e = %.15f:" % (1 / math.e))
    for m in (1, 2, 3, 4, 5, 6, 8, 10, 15):
        ratio = d[m] / math.factorial(m)
        print(f"    n = {m:>2}: {ratio:.15f}   difference {ratio - 1 / math.e:+.2e}")
    try:
        ModBinomial(9, 7)
    except ValueError as e:
        print("ModBinomial(9, 7):", e)


if __name__ == "__main__":
    main()
