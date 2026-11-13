"""Galois Field GF(2^8) arithmetic for Reed-Solomon and AES.

Each byte (0..255) is treated as a polynomial of degree <= 7 over GF(2).
Addition is XOR; multiplication is polynomial multiplication mod the
Rijndael irreducible polynomial x^8 + x^4 + x^3 + x + 1 (0x11B).

The class precomputes log/antilog tables for O(1) multiplication, division,
inversion, and exponentiation.
"""

from typing import List


# Irreducible polynomial used by AES / Rijndael / common Reed-Solomon parameters.
PRIMITIVE_POLY: int = 0x11B
GENERATOR: int = 0x03  # 0x03 = x + 1 is a primitive element of GF(2^8) under 0x11B.
FIELD_SIZE: int = 256
FIELD_ORDER: int = 255  # |GF(2^8)*| = 256 - 1


def _slow_multiply(a: int, b: int, poly: int = PRIMITIVE_POLY) -> int:
    """Polynomial multiplication in GF(2^8) without tables.

    Russian-peasant shift-and-add. Used once at startup to build tables.
    """
    result = 0
    while a and b:
        if b & 1:                       # if current low bit of b is set,
            result ^= a                 # add (XOR) shifted a into result
        b >>= 1
        a <<= 1
        if a & 0x100:                   # overflow into bit 8 -> reduce
            a ^= poly
    return result


class GF256:
    """GF(2^8) arithmetic with O(1) table-based operations.

    Use the module-level singleton `GF` for shared tables, or construct
    your own (e.g., for a different irreducible polynomial).
    """

    def __init__(self, primitive_poly: int = PRIMITIVE_POLY,
                 generator: int = GENERATOR) -> None:
        self.poly = primitive_poly
        self.generator = generator
        self.exp_table: List[int] = [0] * 512  # doubled so we can skip mod 255
        self.log_table: List[int] = [0] * 256

        acc = 1
        for i in range(FIELD_ORDER):
            self.exp_table[i] = acc
            self.log_table[acc] = i
            acc = _slow_multiply(acc, generator, primitive_poly)
        # Wrap-around: exp_table[i + 255] == exp_table[i]. Lets multiply skip a mod.
        for i in range(FIELD_ORDER, len(self.exp_table)):
            self.exp_table[i] = self.exp_table[i - FIELD_ORDER]

    # -- Basic operations ----------------------------------------------------

    @staticmethod
    def add(a: int, b: int) -> int:
        """Addition (== subtraction) in GF(2^8)."""
        return a ^ b

    sub = add  # subtraction is the same operation in characteristic-2 fields

    def mul(self, a: int, b: int) -> int:
        """Multiplication in GF(2^8) via log tables. O(1)."""
        if a == 0 or b == 0:
            return 0
        return self.exp_table[self.log_table[a] + self.log_table[b]]

    def div(self, a: int, b: int) -> int:
        """Division a / b in GF(2^8). Raises if b == 0."""
        if b == 0:
            raise ZeroDivisionError("division by zero in GF(2^8)")
        if a == 0:
            return 0
        return self.exp_table[(self.log_table[a] - self.log_table[b]) % FIELD_ORDER]

    def inv(self, b: int) -> int:
        """Multiplicative inverse of b. Raises if b == 0."""
        if b == 0:
            raise ZeroDivisionError("0 has no multiplicative inverse")
        return self.exp_table[FIELD_ORDER - self.log_table[b]]

    def pow(self, a: int, n: int) -> int:
        """a^n in GF(2^8). Negative n uses inv(a) first."""
        if a == 0:
            if n == 0:
                raise ValueError("0^0 is undefined")
            return 0
        return self.exp_table[(self.log_table[a] * n) % FIELD_ORDER]

    # -- Polynomial operations (used by Reed-Solomon) ------------------------

    def poly_add(self, p: List[int], q: List[int]) -> List[int]:
        """Add two GF(2^8) polynomials (lists of coefficients, low-to-high)."""
        if len(p) < len(q):
            p, q = q, p
        result = list(p)
        for i, qi in enumerate(q):
            result[i] ^= qi
        return result

    def poly_scale(self, p: List[int], k: int) -> List[int]:
        """Multiply every coefficient of polynomial p by scalar k."""
        return [self.mul(c, k) for c in p]

    def poly_mul(self, p: List[int], q: List[int]) -> List[int]:
        """Multiply two GF(2^8) polynomials. Result length is len(p)+len(q)-1."""
        if not p or not q:
            return []
        result = [0] * (len(p) + len(q) - 1)
        for i, pi in enumerate(p):
            if pi == 0:
                continue
            for j, qj in enumerate(q):
                result[i + j] ^= self.mul(pi, qj)
        return result

    def poly_eval(self, p: List[int], x: int) -> int:
        """Horner evaluation of p(x) over GF(2^8)."""
        if not p:
            return 0
        # Polynomial is stored low-degree first; iterate from high degree down.
        y = p[-1]
        for i in range(len(p) - 2, -1, -1):
            y = self.mul(y, x) ^ p[i]
        return y

    def poly_divmod(self, dividend: List[int],
                    divisor: List[int]) -> tuple[List[int], List[int]]:
        """Polynomial long division: dividend = quotient * divisor + remainder.

        Returns (quotient, remainder), both as low-degree-first lists.
        """
        if not divisor or all(c == 0 for c in divisor):
            raise ZeroDivisionError("divide by zero polynomial")
        if len(dividend) < len(divisor):
            return [], list(dividend)

        out = list(dividend)
        normalizer = divisor[-1]
        for i in range(len(dividend) - len(divisor), -1, -1):
            coef = self.div(out[i + len(divisor) - 1], normalizer)
            if coef != 0:
                for j in range(len(divisor) - 1):
                    if divisor[j] != 0:
                        out[i + j] ^= self.mul(divisor[j], coef)
            out[i + len(divisor) - 1] = coef
        # Split into quotient (high half) and remainder (low half).
        sep = len(divisor) - 1
        return out[sep:], out[:sep]


# Module-level singleton for shared use.
GF = GF256()


if __name__ == "__main__":
    # Demo: classic AES test vector. 0x53 * 0xCA = 0x01 in Rijndael GF(2^8).
    print(f"0x53 + 0xCA = 0x{GF.add(0x53, 0xCA):02X}")        # 0x99
    print(f"0x53 * 0xCA = 0x{GF.mul(0x53, 0xCA):02X}")        # 0x01
    print(f"inv(0x53)   = 0x{GF.inv(0x53):02X}")              # 0xCA
    print(f"0x53^4      = 0x{GF.pow(0x53, 4):02X}")
