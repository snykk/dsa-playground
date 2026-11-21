"""Reed-Solomon error correction over GF(2^8).

Supports:
  - Systematic encode (codeword layout: [parity ... | message ...])
  - Berlekamp-Massey decoder with Forney + Chien search
  - Combined error + erasure correction: e + 2v <= n - k, where e counts the
    erasures (positions known to be bad) and v the unknown errors
  - Configurable first consecutive root (fcr), the same knob that libraries
    such as libfec and reedsolo expose

Usage:
    rs = ReedSolomon(n=15, k=11)            # 4 parity bytes -> fixes 2 errors
    codeword = rs.encode(message_11_bytes)
    recovered = rs.decode(corrupted_codeword)               # may raise DecodeError
    recovered = rs.decode(corrupted, erasures=[3, 11])      # 2 known + up to 1 unknown
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Iterable, List, Optional

# Re-use the sibling Galois Field implementation.
_GF_PATH = Path(__file__).resolve().parents[2] / "Galois_Field" / "Python"
sys.path.insert(0, str(_GF_PATH))
from galois_field import GF, FIELD_ORDER  # noqa: E402


class DecodeError(Exception):
    """Raised when the codeword has more errors than the code can correct."""


class ReedSolomon:
    """Reed-Solomon (n, k) code over GF(2^8).

    Parameters:
      n     -- codeword length (<= 255)
      k     -- message length (k < n)
      alpha -- primitive element of GF(2^8) (default 3, the true primitive
               under the Rijndael polynomial 0x11B). The element 2 is NOT
               primitive in this field (order 51); using it breaks decoding of
               codewords longer than 51 bytes, even with a single error. If you
               need to match a standard that uses 2, you must also change the
               underlying GF polynomial (e.g., to 0x11D).
      fcr   -- first consecutive root (default 0). The generator's roots are
               alpha^fcr, alpha^(fcr+1), ..., alpha^(fcr+n-k-1); encoder and
               decoder must agree on it. Real-world examples:
                 fcr=0    QR codes (field polynomial 0x11D, alpha = 2)
                 fcr=1    the "narrow-sense" convention of many textbooks
                 fcr=112  CCSDS RS(255, 223) (field polynomial 0x187, with
                          alpha^11 as the root step)
               This class fixes the field to 0x11B, so it is not bit-compatible
               with those standards; fcr is exposed to show how the algebra
               generalizes.
    """

    def __init__(self, n: int, k: int, alpha: int = 3, fcr: int = 0) -> None:
        if not 0 < k < n:
            raise ValueError(f"need 0 < k < n; got k={k}, n={n}")
        if n > 255:
            raise ValueError("n must be <= 255 for GF(2^8) codes")
        self.n = n
        self.k = k
        self.t = (n - k) // 2          # max correctable errors with no erasures
        self.alpha = alpha
        self.fcr = fcr
        self.generator = self._build_generator()

    # --- Setup -----------------------------------------------------------

    def _build_generator(self) -> List[int]:
        """g(x) = (x - alpha^fcr)(x - alpha^(fcr+1)) ... (x - alpha^(fcr+n-k-1))."""
        g: List[int] = [1]
        for i in range(self.n - self.k):
            factor = [GF.pow(self.alpha, self.fcr + i), 1]
            g = GF.poly_mul(g, factor)
        return g

    # --- Encode ----------------------------------------------------------

    def encode(self, message: Iterable[int]) -> List[int]:
        """Systematic encode: codeword = [parity ... message ...]."""
        msg = list(message)
        if len(msg) != self.k:
            raise ValueError(f"message must have {self.k} bytes; got {len(msg)}")
        parity_len = self.n - self.k
        dividend = [0] * parity_len + msg
        _, remainder = GF.poly_divmod(dividend, self.generator)
        while len(remainder) < parity_len:
            remainder.append(0)
        codeword = remainder + msg
        assert len(codeword) == self.n
        return codeword

    # --- Decode ----------------------------------------------------------

    def decode(self, received: Iterable[int],
               erasures: Optional[Iterable[int]] = None) -> List[int]:
        """Recover the original k-byte message from a (possibly corrupted) codeword.

        Args:
          received: the n-byte received codeword.
          erasures: optional list of positions known to be wrong. Each erasure
                    only costs one parity byte (vs two for an unknown error,
                    whose position AND value must both be found), so the
                    correction budget becomes: e + 2*v <= n - k.

        Raises:
          DecodeError if the codeword has more errors+erasures than the code
                      can correct.
          ValueError  on malformed input.
        """
        received = list(received)
        if len(received) != self.n:
            raise ValueError(f"received must have {self.n} bytes; got {len(received)}")

        erasure_positions = sorted(set(erasures or []))
        for p in erasure_positions:
            if not 0 <= p < self.n:
                raise ValueError(f"erasure position {p} out of range [0, {self.n})")
        e = len(erasure_positions)
        if e > self.n - self.k:
            raise DecodeError(f"too many erasures: {e} > n - k = {self.n - self.k}")

        # Step 1: Syndromes. If all zero AND no erasures were declared, the
        # codeword is clean; return its message slice directly.
        syndromes = self._compute_syndromes(received)
        if all(s == 0 for s in syndromes) and e == 0:
            return received[-self.k:]

        # Step 2: Build the erasure locator Gamma(x) from known positions.
        # Gamma(x) = prod_{i in E} (1 - alpha^i * x)   (low-degree-first)
        # In characteristic 2, "-X" = "+X", so the factor (1 - X*x) becomes (1 + X*x).
        erasure_locator = [1]
        for pos in erasure_positions:
            factor = [1, GF.pow(self.alpha, pos)]
            erasure_locator = GF.poly_mul(erasure_locator, factor)

        # Step 3: Berlekamp-Massey initialized with the erasure locator. BM
        # processes only the LAST (n - k - e) syndromes (skipping the first e,
        # which are "consumed" by the known erasure positions). The output is
        # the combined locator Phi(x) = Lambda(x) * Gamma(x) directly -- no
        # separate combine step required.
        combined_locator = self._berlekamp_massey(
            syndromes,
            erase_count=e,
            init_locator=erasure_locator,
        )

        # Step 4: Chien search for ALL error positions (known + unknown). A
        # locator of degree d must have exactly d roots inside the codeword;
        # anything else means the damage exceeded the correction budget.
        all_positions = self._find_error_positions(combined_locator)
        if len(all_positions) != len(combined_locator) - 1:
            raise DecodeError("error locations could not be determined")

        # Step 5: Forney for magnitudes (uses original syndromes + combined locator).
        magnitudes = self._forney(syndromes, combined_locator, all_positions)
        corrected = list(received)
        for pos, mag in zip(all_positions, magnitudes):
            corrected[pos] ^= mag

        # Step 6: Verify -- all syndromes of the corrected codeword must vanish.
        if any(s != 0 for s in self._compute_syndromes(corrected)):
            raise DecodeError("decode failed: too many errors")

        return corrected[-self.k:]

    # --- Internal helpers ------------------------------------------------

    def _compute_syndromes(self, received: List[int]) -> List[int]:
        """s_i = received(alpha^(fcr + i)) for i = 0..n-k-1."""
        return [GF.poly_eval(received, GF.pow(self.alpha, self.fcr + i))
                for i in range(self.n - self.k)]

    def _berlekamp_massey(self, syndromes: List[int],
                          erase_count: int = 0,
                          init_locator: Optional[List[int]] = None) -> List[int]:
        """Berlekamp-Massey -- returns the error/errata locator polynomial.

        Args:
          syndromes:    full syndrome vector (length n - k).
          erase_count:  number of known erasures (e). BM iterates exactly
                        (n - k - e) times, starting at syndrome index e.
          init_locator: optional initial locator (low-degree-first). When
                        provided -- typically the erasure locator Gamma(x) --
                        BM produces the COMBINED locator Phi(x) = Lambda(x) *
                        Gamma(x) in one shot.

        Returns the locator polynomial, low-degree-first.
        """
        nsym = len(syndromes)
        iterations = nsym - erase_count
        if iterations < 0:
            iterations = 0

        # Internal storage: high-degree-first.
        if init_locator is None:
            err_loc: List[int] = [1]
        else:
            err_loc = list(reversed(init_locator))
        old_loc: List[int] = list(err_loc)

        for i in range(iterations):
            K = erase_count + i   # syndrome index
            delta = syndromes[K]
            for j in range(1, len(err_loc)):
                delta ^= GF.mul(err_loc[-(j + 1)], syndromes[K - j])

            old_loc = old_loc + [0]

            if delta != 0:
                if len(old_loc) > len(err_loc):
                    new_loc = GF.poly_scale(old_loc, delta)
                    old_loc = GF.poly_scale(err_loc, GF.inv(delta))
                    err_loc = new_loc
                scaled = GF.poly_scale(old_loc, delta)
                length = max(len(err_loc), len(scaled))
                err_loc = [0] * (length - len(err_loc)) + err_loc
                scaled = [0] * (length - len(scaled)) + scaled
                err_loc = [a ^ b for a, b in zip(err_loc, scaled)]

        while len(err_loc) > 1 and err_loc[0] == 0:
            err_loc.pop(0)
        return list(reversed(err_loc))

    def _find_error_positions(self, err_locator: List[int]) -> List[int]:
        """Chien search: positions i where err_locator(alpha^(-i)) = 0."""
        positions: List[int] = []
        for i in range(self.n):
            if GF.poly_eval(err_locator, GF.pow(self.alpha, FIELD_ORDER - i)) == 0:
                positions.append(i)
        return positions

    def _forney(self, syndromes: List[int], err_locator: List[int],
                err_positions: List[int]) -> List[int]:
        """Forney's algorithm for error magnitudes.

        e_j = X_j^(1 - fcr) * Omega(X_j^-1) / Lambda'(X_j^-1)
        where X_j = alpha^pos.
        """
        product = GF.poly_mul(syndromes, err_locator)
        truncate = self.n - self.k
        omega = product[:truncate]

        # Formal derivative: in characteristic 2, even-index terms vanish.
        lam_prime = [
            err_locator[i] if i % 2 == 1 else 0
            for i in range(1, len(err_locator))
        ]

        magnitudes: List[int] = []
        for pos in err_positions:
            x_inv = GF.pow(self.alpha, FIELD_ORDER - pos)
            num = GF.poly_eval(omega, x_inv)
            den = GF.poly_eval(lam_prime, x_inv)
            if den == 0:
                raise DecodeError("Forney denominator is zero")
            # X_j^(1 - fcr): just X_j when fcr = 0, and 1 when fcr = 1. The
            # textbook formula's leading minus sign vanishes in characteristic 2.
            x_factor = GF.pow(self.alpha, pos * (1 - self.fcr))
            magnitudes.append(GF.mul(x_factor, GF.div(num, den)))
        return magnitudes


if __name__ == "__main__":
    # Demo 1: classic errors-only decode.
    rs = ReedSolomon(n=15, k=11)
    msg = [ord(c) for c in "Hello DSA!!"]
    codeword = rs.encode(msg)
    corrupted = list(codeword)
    corrupted[3] ^= 0x99
    corrupted[12] ^= 0xFF
    print(f"Errors-only recovered: {''.join(chr(b) for b in rs.decode(corrupted))}")

    # Demo 2: erasure + error mixed. RS(15, 7) has n-k = 8 parity bytes.
    # Budget: e + 2*errors <= 8. Use 4 erasures + 2 errors.
    rs2 = ReedSolomon(n=15, k=7)
    msg2 = [ord(c) for c in "ABCDEFG"]
    cw = rs2.encode(msg2)
    corrupted = list(cw)
    # Erasures: positions 0, 1, 2, 3 (known wrong).
    erasures = [0, 1, 2, 3]
    for p in erasures:
        corrupted[p] = 0xFF
    # Unknown errors at positions 7, 11.
    corrupted[7] ^= 0xAA
    corrupted[11] ^= 0x55
    recovered = rs2.decode(corrupted, erasures=erasures)
    print(f"Erasure+error recovered: {''.join(chr(b) for b in recovered)}")
