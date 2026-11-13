"""
Chinese Remainder Theorem Implementation

The Chinese Remainder Theorem (CRT) solves systems of simultaneous
congruences. With pairwise coprime moduli the solution always exists and is
unique modulo the product of the moduli. This implementation also accepts
moduli that are not coprime: it merges the congruences one at a time and
reports "no solution" only when two of them really contradict each other.
"""


def _extended_gcd_nonneg(a, b):
    """Extended Euclid for a, b >= 0. Returns (g, x, y) with a*x + b*y = g."""
    if b == 0:
        return (a, 1, 0)
    gcd_val, x1, y1 = _extended_gcd_nonneg(b, a % b)
    return (gcd_val, y1, x1 - (a // b) * y1)


def extended_gcd(a, b):
    """
    Extended Euclidean Algorithm

    Returns (g, x, y) such that a*x + b*y = g = gcd(a, b) >= 0, for inputs of
    any sign. The algorithm runs on |a| and |b|, then flips the sign of x
    (or y) when a (or b) was negative.
    """
    g, x, y = _extended_gcd_nonneg(abs(a), abs(b))
    return (g, -x if a < 0 else x, -y if b < 0 else y)


def _merge(r1, m1, r2, m2):
    """
    Merge x = r1 (mod m1) and x = r2 (mod m2), with m1, m2 > 0.

    Returns (r, lcm(m1, m2)) with 0 <= r < lcm, or None when the two
    congruences contradict each other (r1 and r2 differ modulo gcd(m1, m2)).
    """
    g, p, _ = extended_gcd(m1, m2)  # m1*p + m2*q = g
    if (r2 - r1) % g != 0:
        return None
    m2_g = m2 // g
    t = ((r2 - r1) // g * p) % m2_g
    lcm = m1 // g * m2
    return ((r1 + m1 * t) % lcm, lcm)


def chinese_remainder_theorem(remainders, moduli):
    """
    Solve x = remainders[i] (mod moduli[i]) for all i.

    Args:
        remainders: List of remainders (any sign; they are reduced first)
        moduli: List of positive moduli (need not be coprime)

    Returns:
        The smallest non-negative solution x. It is unique modulo
        lcm(moduli), which equals the product when the moduli are pairwise
        coprime. Returns None when the lists differ in length, a modulus is
        not positive, or the system has no solution. An empty system returns 0.

    Time Complexity: O(n log max(moduli)) big-integer operations
    Space Complexity: O(1) besides the input
    """
    n = len(remainders)
    if n != len(moduli):
        return None
    if any(m <= 0 for m in moduli):
        return None

    x, lcm = 0, 1
    for r, m in zip(remainders, moduli):
        merged = _merge(x, lcm, r % m, m)
        if merged is None:
            return None
        x, lcm = merged
    return x


def chinese_remainder_theorem_pairwise(a1, m1, a2, m2):
    """
    Solve two congruences with coprime moduli

    Solves: x = a1 (mod m1) and x = a2 (mod m2)

    Returns:
        The solution x mod (m1 * m2), or None if the moduli are not positive
        or not coprime.
    """
    if m1 <= 0 or m2 <= 0:
        return None
    if extended_gcd(m1, m2)[0] != 1:
        return None  # Not coprime
    merged = _merge(a1 % m1, m1, a2 % m2, m2)
    return None if merged is None else merged[0]


def verify_crt_solution(x, remainders, moduli):
    """
    Verify that x satisfies all congruences

    Remainders are reduced modulo each modulus first, so a remainder of 8
    modulo 3 is the same as 2 and a remainder of -1 modulo 7 is the same as 6.

    Returns:
        True if x satisfies all congruences, False otherwise
    """
    for i in range(len(remainders)):
        if (x - remainders[i]) % moduli[i] != 0:
            return False
    return True


if __name__ == "__main__":
    print("Chinese Remainder Theorem Examples:")

    # x = 2 (mod 3), x = 3 (mod 5), x = 2 (mod 7)
    remainders = [2, 3, 2]
    moduli = [3, 5, 7]
    solution = chinese_remainder_theorem(remainders, moduli)
    print(f"x = {remainders} (mod {moduli})")
    print(f"Solution: x = {solution}")  # 23
    print(f"Verification: {verify_crt_solution(solution, remainders, moduli)}")

    print("\nPairwise CRT:")
    print(f"x = 1 (mod 3), x = 2 (mod 5): {chinese_remainder_theorem_pairwise(1, 3, 2, 5)}")  # 7

    print("\nNon-coprime moduli:")
    print(f"x = 1 (mod 4), x = 3 (mod 6): {chinese_remainder_theorem([1, 3], [4, 6])}")  # 9
