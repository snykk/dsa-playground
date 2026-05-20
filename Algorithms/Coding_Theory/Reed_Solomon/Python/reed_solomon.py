"""Reed-Solomon error correction over GF(2^8).

Systematic encoder + Berlekamp-Massey decoder with Forney's algorithm
and Chien search for error locations.

Usage:
    rs = ReedSolomon(n=15, k=11)   # 4 parity bytes -> can fix 2 byte errors
    codeword = rs.encode(message_11_bytes)
    recovered = rs.decode(corrupted_codeword)  # may raise DecodeError
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import List

# Re-use the sibling Galois Field implementation.
_GF_PATH = Path(__file__).resolve().parents[2] / "Galois_Field" / "Python"
sys.path.insert(0, str(_GF_PATH))
from galois_field import GF, FIELD_ORDER  # noqa: E402


class DecodeError(Exception):
    """Raised when the codeword has more errors than the code can correct."""


class ReedSolomon:
    """Reed-Solomon (n, k) code over GF(2^8).

    By default uses the primitive element alpha = 3 (= x + 1), which generates the
    full multiplicative group of order 255 in GF(2^8) under the Rijndael
    polynomial 0x11B. Note: the element 2 is *not* primitive in this field
    (it has order 51) -- using alpha = 2 silently breaks decoding past ~3 errors.
    """

    def __init__(self, n: int, k: int, alpha: int = 3) -> None:
        if not 0 < k < n:
            raise ValueError(f"need 0 < k < n; got k={k}, n={n}")
        if n > 255:
            raise ValueError("n must be <= 255 for GF(2^8) codes")
        self.n = n
        self.k = k
        self.t = (n - k) // 2          # max correctable errors
        self.alpha = alpha
        self.generator = self._build_generator()

    # --- Setup -----------------------------------------------------------

    def _build_generator(self) -> List[int]:
        """Construct g(x) = (x - alpha^0)(x - alpha^1)...(x - alpha^(n-k-1))."""
        g: List[int] = [1]
        for i in range(self.n - self.k):
            # (x - alpha^i) = (x + alpha^i) in GF(2^8) since subtraction == addition.
            factor = [GF.pow(self.alpha, i), 1]
            g = GF.poly_mul(g, factor)
        return g

    # --- Encode ----------------------------------------------------------

    def encode(self, message: List[int]) -> List[int]:
        """Systematic encode: codeword = [message ... parity ...]."""
        if len(message) != self.k:
            raise ValueError(f"message must have {self.k} bytes; got {len(message)}")
        # Shift message by (n - k) positions and compute remainder.
        # We work with low-degree-first polynomials, so the codeword layout is
        # [parity_0..parity_(n-k-1), msg_0..msg_(k-1)] in poly form.
        parity_len = self.n - self.k
        # Build dividend = parity_len zeros + message
        dividend = [0] * parity_len + list(message)
        _, remainder = GF.poly_divmod(dividend, self.generator)
        # Pad remainder to parity_len.
        while len(remainder) < parity_len:
            remainder.append(0)
        codeword = remainder + list(message)
        assert len(codeword) == self.n
        return codeword

    # --- Decode ----------------------------------------------------------

    def decode(self, received: List[int]) -> List[int]:
        """Recover the original message from a (possibly corrupted) codeword.

        Raises DecodeError if more than t errors are present.
        Returns the k-byte message portion of the corrected codeword.
        """
        if len(received) != self.n:
            raise ValueError(f"received must have {self.n} bytes; got {len(received)}")

        syndromes = self._compute_syndromes(received)
        if all(s == 0 for s in syndromes):
            return list(received[-self.k:])

        err_locator = self._berlekamp_massey(syndromes)
        err_positions = self._find_error_positions(err_locator)
        if len(err_positions) == 0 or len(err_positions) != len(err_locator) - 1:
            raise DecodeError("error locations could not be determined")

        err_magnitudes = self._forney(syndromes, err_locator, err_positions)
        corrected = list(received)
        for pos, mag in zip(err_positions, err_magnitudes):
            corrected[pos] ^= mag

        # Verify by recomputing syndromes; they should all be zero.
        if any(s != 0 for s in self._compute_syndromes(corrected)):
            raise DecodeError("decode failed: too many errors")

        return corrected[-self.k:]

    # --- Internal helpers ------------------------------------------------

    def _compute_syndromes(self, received: List[int]) -> List[int]:
        """Compute s_i = received(alpha^i) for i = 0..2t-1."""
        # received[i] is the coefficient of x^i (low-degree first).
        return [GF.poly_eval(received, GF.pow(self.alpha, i))
                for i in range(self.n - self.k)]

    def _berlekamp_massey(self, syndromes: List[int]) -> List[int]:
        """Return the error-locator polynomial Lambda(x) (low-degree first).

        Standard iterative Berlekamp-Massey using the "swap-and-scale" form
        (cf. Wikiversity Reed-Solomon tutorial). Internally works with
        polynomials stored *high-degree first* (which makes the discrepancy
        formula and shift-by-x both trivial), then reverses at return.
        """
        # Work high-degree-first for the duration of the algorithm.
        err_loc: List[int] = [1]   # connection polynomial (highest-degree first)
        old_loc: List[int] = [1]   # scratch (previous err_loc, also high-first)

        for i in range(len(syndromes)):
            # Discrepancy: sum lambda_poly_j * s_(i-j) for j = 0..deg(lambda_poly).
            # In high-first storage, lambda_poly_j is err_loc[-(j+1)].
            delta = syndromes[i]
            for j in range(1, len(err_loc)):
                delta ^= GF.mul(err_loc[-(j + 1)], syndromes[i - j])

            # Shift old_loc by x (append a zero on the *low* end).
            old_loc = old_loc + [0]

            if delta != 0:
                if len(old_loc) > len(err_loc):
                    # Length must grow. Swap: new err_loc absorbs delta*old_loc;
                    # new old_loc is the previous err_loc rescaled by 1/delta.
                    new_loc = GF.poly_scale(old_loc, delta)
                    old_loc = GF.poly_scale(err_loc, GF.inv(delta))
                    err_loc = new_loc
                # err_loc <- err_loc XOR (delta * old_loc), aligned on high end.
                scaled = GF.poly_scale(old_loc, delta)
                length = max(len(err_loc), len(scaled))
                # Pad both to length on the LOW end so the high end aligns.
                err_loc = [0] * (length - len(err_loc)) + err_loc
                scaled = [0] * (length - len(scaled)) + scaled
                err_loc = [a ^ b for a, b in zip(err_loc, scaled)]

        # Drop leading zeros (high-degree).
        while len(err_loc) > 1 and err_loc[0] == 0:
            err_loc.pop(0)
        # Convert to low-degree-first to match the rest of the file.
        return list(reversed(err_loc))

    def _find_error_positions(self, err_locator: List[int]) -> List[int]:
        """Chien search: positions i where Lambda(alpha^(-i)) = 0."""
        positions: List[int] = []
        for i in range(self.n):
            # alpha^(-i) = alpha^(FIELD_ORDER - i) for nonzero exponent
            if GF.poly_eval(err_locator, GF.pow(self.alpha, FIELD_ORDER - i)) == 0:
                positions.append(i)
        return positions

    def _forney(self, syndromes: List[int], err_locator: List[int],
                err_positions: List[int]) -> List[int]:
        """Compute error magnitudes via Forney's algorithm."""
        # Error evaluator: Omega(x) = S(x) * Lambda(x) mod x^(2t)
        s_poly = list(syndromes)
        product = GF.poly_mul(s_poly, err_locator)
        truncate = self.n - self.k
        omega = product[:truncate]

        # Lambda'(x) -- formal derivative. In GF(2^8), d/dx of x^k = k * x^(k-1),
        # but k is computed in characteristic 2, so even exponents vanish.
        lam_prime = [
            err_locator[i] if i % 2 == 1 else 0
            for i in range(1, len(err_locator))
        ]

        magnitudes: List[int] = []
        for pos in err_positions:
            x_inv = GF.pow(self.alpha, FIELD_ORDER - pos)
            x_pos = GF.pow(self.alpha, pos)
            num = GF.poly_eval(omega, x_inv)
            den = GF.poly_eval(lam_prime, x_inv)
            if den == 0:
                raise DecodeError("Forney denominator is zero")
            # Forney (syndromes starting at alpha^0):
            #   e_j = X_j * Omega(X_j^-1) / Lambda'(X_j^-1)
            # The leading -1 vanishes in characteristic 2.
            mag = GF.mul(x_pos, GF.div(num, den))
            magnitudes.append(mag)
        return magnitudes


if __name__ == "__main__":
    rs = ReedSolomon(n=15, k=11)
    msg = [ord(c) for c in "Hello DSA!!"]   # 11 ASCII bytes
    codeword = rs.encode(msg)
    print(f"Codeword: {codeword}")

    # Corrupt 2 bytes
    corrupted = list(codeword)
    corrupted[3] ^= 0x99
    corrupted[12] ^= 0xFF
    print(f"Corrupted: {corrupted}")

    recovered = rs.decode(corrupted)
    print(f"Recovered: {recovered}  =>  {''.join(chr(b) for b in recovered)}")
