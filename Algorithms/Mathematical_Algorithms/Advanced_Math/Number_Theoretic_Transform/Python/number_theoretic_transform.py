"""
Number Theoretic Transform (NTT)

The Fast Fourier Transform's butterflies, computed with the integers modulo the prime

    p = 998244353 = 119 * 2^23 + 1

instead of complex numbers. 3 is a primitive root modulo p: its powers run through all p - 1
nonzero residues. So for every power of two n up to 2^23, w = 3^((p - 1) / n) is a primitive n-th
root of unity modulo p: w^n = 3^(p - 1) = 1 (Fermat), w^k != 1 for 0 < k < n, and w^(n/2) = -1.
Those are the properties the FFT uses of e^(-2*pi*i/n), so the same butterflies

    X[k] = E[k] + w^k * O[k],   X[k + n/2] = E[k] - w^k * O[k]   (mod p)

compute X[k] = sum_j a[j] * w^(j*k) mod p, and the inverse uses w^-1 and divides by n (multiplies
by the inverse of n modulo p). Every step is an exact integer operation: nothing is rounded.

This version is iterative and in place, where the FFT topic's code is recursive. The recursion
splits a list into its even and its odd positions until single values are left; read left to right,
those single values are the input in bit-reversed index order. So ntt_in_place first reorders the
list that way (bit_reverse_permute), then runs the recursion's combining loops bottom-up: the stage
of length 2, 4, ..., n combines each block of `length` entries, which is one recursive call of that
size, with E[k] at block[k] and O[k] at block[k + length/2].

multiply_polynomials(p, q) returns the product's coefficients modulo p. They equal the true
coefficients when those lie in 0..p-1 (for example, non-negative inputs whose products stay below
p); a larger one comes out reduced modulo p, and a negative one as p minus its absolute value.
Exact coefficients above p need several primes and the Chinese Remainder Theorem (three primes
like this one cover every coefficient below about 2^86), which is not implemented here.

2^23 is the largest power of two dividing p - 1, so no transform is longer than 2^23 and no product
has more than 2^23 coefficients: longer inputs raise ValueError.
"""

import operator
from typing import List, Sequence

MOD = 998244353  # 119 * 2^23 + 1, a prime
PRIMITIVE_ROOT = 3  # a generator of the nonzero residues modulo MOD
MAX_LENGTH = 1 << 23  # the largest power of two that divides MOD - 1


def _is_power_of_two(n: int) -> bool:
    return n > 0 and n & (n - 1) == 0


def root_of_unity(n: int, inverse: bool = False) -> int:
    """A primitive n-th root of unity modulo MOD: 3^((MOD - 1) / n), or its inverse.

    n must be a power of two from 1 to MAX_LENGTH; otherwise ValueError. root_of_unity(1) is 1,
    root_of_unity(2) is MOD - 1 (that is, -1), and root_of_unity(4) is 911660635, a square root
    of -1. The inverse is w^(MOD - 2) by Fermat's little theorem.
    """
    if not _is_power_of_two(n) or n > MAX_LENGTH:
        raise ValueError(f"no {n}-th root of unity here: n must be a power of two from 1 to 2^23 = {MAX_LENGTH}")
    w = pow(PRIMITIVE_ROOT, (MOD - 1) // n, MOD)
    return pow(w, MOD - 2, MOD) if inverse else w


def bit_reverse_permute(a: List[int]) -> None:
    """Reorder a in place so that a[i] and a[rev(i)] swap, rev(i) being i with its log2(n) bits reversed.

    len(a) must be a power of two (or 0). For n = 8 the order becomes 0, 4, 2, 6, 1, 5, 3, 7: the
    order in which the FFT's recursion reaches its single values. j runs through rev(1), rev(2), ...
    by adding 1 at the top bit and carrying downwards.
    """
    n = len(a)
    j = 0
    for i in range(1, n):
        bit = n >> 1
        while j & bit:
            j ^= bit
            bit >>= 1
        j |= bit
        if i < j:
            a[i], a[j] = a[j], a[i]


def _butterfly(a: List[int], i: int, j: int, w: int) -> None:
    """One butterfly: t = w * a[j], then a[i], a[j] = a[i] + t, a[i] - t, all modulo MOD.

    The FFT's result[k] = even[k] + t, result[k + n/2] = even[k] - t, written in place. Called once
    per butterfly, so the tests count the work through it.
    """
    u = a[i]
    t = a[j] * w % MOD
    a[i] = (u + t) % MOD
    a[j] = (u - t) % MOD


def ntt_in_place(a: List[int], inverse: bool = False) -> int:
    """Transform a in place; returns the number of butterflies, (n / 2) * log2(n).

    len(a) must be a power of two from 1 to MAX_LENGTH (ValueError otherwise), and the entries
    should be residues 0..MOD-1 (ntt reduces them first). After bit_reverse_permute, the stage of
    length 2, 4, ..., n combines every block of `length` entries with the root of unity of that
    length; the inverse uses the inverse roots and then multiplies by n^-1 modulo MOD.
    """
    n = len(a)
    if not _is_power_of_two(n) or n > MAX_LENGTH:
        raise ValueError(f"the transform length must be a power of two from 1 to 2^23 = {MAX_LENGTH}; got {n}")
    bit_reverse_permute(a)
    butterflies = 0
    length = 2
    while length <= n:
        w_length = root_of_unity(length, inverse)
        half = length // 2
        for start in range(0, n, length):  # one block = one call of the recursive FFT
            w = 1  # w_length^k
            for k in range(half):
                _butterfly(a, start + k, start + k + half, w)
                butterflies += 1
                w = w * w_length % MOD
        length <<= 1
    if inverse:
        n_inverse = pow(n, MOD - 2, MOD)
        for i in range(n):
            a[i] = a[i] * n_inverse % MOD
    return butterflies


def ntt(a: Sequence[int], inverse: bool = False) -> List[int]:
    """The number theoretic transform of a list of integers, as a new list of residues 0..MOD-1.

    X[k] = sum_j a[j] * w^(j*k) mod MOD with w = root_of_unity(n), the FFT's formula with
    e^(-2*pi*i/n) replaced by w. The entries are reduced modulo MOD first, so negative integers
    are allowed; a float raises TypeError. Like the FFT topic's fft:

    - an empty list returns [];
    - a forward transform pads with zeros to the next power of two;
    - inverse=True requires a power-of-two length (ValueError otherwise) and divides by n.

    A list longer than MAX_LENGTH = 2^23 raises ValueError: no longer power-of-two transform exists
    modulo MOD. ntt([1, 2, 3, 4]) is [10, 173167434, 998244351, 825076915].
    Time O(n log n), space O(n) for the copy.
    """
    n = len(a)
    if n == 0:
        return []
    if n > MAX_LENGTH:
        raise ValueError(f"at most 2^23 = {MAX_LENGTH} values: modulo {MOD} no longer transform exists; got {n}")
    if inverse and not _is_power_of_two(n):
        raise ValueError(f"inverse NTT needs a power-of-two length; got {n} (a zero-padded spectrum is not the spectrum of the original sequence)")
    size = 1
    while size < n:
        size <<= 1
    values = [operator.index(x) % MOD for x in a] + [0] * (size - n)
    ntt_in_place(values, inverse)
    return values


def intt(a: Sequence[int]) -> List[int]:
    """The inverse transform: ntt(a, inverse=True). intt(ntt(a)) == [x % MOD for x in a] for a power-of-two length."""
    return ntt(a, inverse=True)


def multiply_polynomials(p: Sequence[int], q: Sequence[int]) -> List[int]:
    """The coefficients of p * q modulo MOD, lowest degree first: len(p) + len(q) - 1 of them.

    Pads both to the smallest power of two n >= len(p) + len(q) - 1, transforms both, multiplies
    point by point, and transforms back. No rounding: every coefficient is exact modulo MOD, so it
    is the true coefficient whenever that lies in 0..MOD-1. An empty list is the zero polynomial:
    the result is len(p) + len(q) - 1 zeros, and [] when both are empty or one is empty and the
    other has one coefficient (the same lengths as the FFT topic's multiply_polynomials).

    Raises ValueError when the product has more than MAX_LENGTH = 2^23 coefficients.
    Time O(n log n): three transforms of size n and n pointwise products.
    """
    need = len(p) + len(q) - 1
    if need > MAX_LENGTH:
        raise ValueError(f"the product has {need} coefficients; modulo {MOD} at most 2^23 = {MAX_LENGTH} fit in one transform")
    if not p or not q:
        return [0] * max(0, need)
    n = 1
    while n < need:
        n <<= 1
    fp = [operator.index(x) % MOD for x in p] + [0] * (n - len(p))
    fq = [operator.index(x) % MOD for x in q] + [0] * (n - len(q))
    ntt_in_place(fp)
    ntt_in_place(fq)
    product = [fp[i] * fq[i] % MOD for i in range(n)]
    ntt_in_place(product, inverse=True)
    return product[:need]


def convolve(a: Sequence[int], b: Sequence[int]) -> List[int]:
    """The convolution of two sequences modulo MOD: the same as multiply_polynomials."""
    return multiply_polynomials(a, b)


def main() -> None:
    print(f"MOD = {MOD} = 119 * 2^23 + 1, primitive root {PRIMITIVE_ROOT}")
    w4 = root_of_unity(4)
    print(f"root_of_unity(4) = {w4}, and w^2 = {w4 * w4 % MOD} = MOD - 1, that is -1")
    spectrum = ntt([1, 2, 3, 4])
    print(f"ntt([1, 2, 3, 4]) = {spectrum}")
    print(f"intt of that = {intt(spectrum)}")
    print(f"multiply_polynomials([1, 2, 3], [4, 5]) = {multiply_polynomials([1, 2, 3], [4, 5])}")
    print(f"(1 - x)(1 + x) = {multiply_polynomials([1, -1], [1, 1])}  (-1 comes out as MOD - 1)")
    big = MOD - 2
    print(f"{big}^2 mod MOD = {multiply_polynomials([big], [big])}; the true product {big * big} is above 2^53")


if __name__ == "__main__":
    main()
