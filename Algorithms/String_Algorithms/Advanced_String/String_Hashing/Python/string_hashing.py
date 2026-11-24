"""
String Hashing

A polynomial hash reads a string c_0 c_1 ... c_(m-1) as a number in base B, modulo M:

    hash = (c_0 * B^(m-1) + c_1 * B^(m-2) + ... + c_(m-1)) mod M

Equal strings always get equal hashes; different strings of the same length collide with a
small probability. After O(n) preprocessing of one string s (the prefix hashes
prefix[i] = hash(s[:i]) and the powers power[i] = B^i mod M), the hash of any substring is

    hash(s[l:r]) = (prefix[r] - prefix[l] * power[r - l]) mod M

in O(1). On top of that this module answers, for substrings of s: equality in O(1), the
longest common prefix of two suffixes in O(log n) (a binary search on the length), the
lexicographic order of two substrings in O(log n), and the number of distinct substrings of
one length in O(n) expected time.

- PolynomialHash(s, base, mod): one modulus, any 2 <= mod <= 2^32 and 1 <= base < mod. A small
  modulus makes collisions easy to see.
- DoubleHash(s): two polynomial hashes with the fixed pairs (BASE1, MOD1) and (BASE2, MOD2);
  the hash of a substring is the pair. Contest code picks the bases at random when the
  program starts, so that no input can be prepared against them. This repository fixes them,
  so that Python, C++ and Go compute the same numbers and the tests can pin them.
- overflow_hash(s, base) and thue_morse_pair(k): the hash modulo 2^64 that C++ and Go get
  from unsigned overflow, and the strings that break it for every odd base.

A character's value is its code point for a str and its byte for bytes. C++ and Go hash the
bytes of their strings, so for text outside ASCII pass s.encode("utf-8") to get their numbers.
"""

from typing import List, Tuple, Union

# The largest modulus PolynomialHash accepts. With mod <= 2^32 every value is below 2^32, so
# C++ and Go can multiply two of them in an unsigned 64-bit integer without overflow.
MAX_MOD = 1 << 32

# The two fixed (base, modulus) pairs of DoubleHash: two primes near 10^9, and a base for each.
MOD1, BASE1 = 1_000_000_007, 911_382_323
MOD2, BASE2 = 998_244_353, 972_663_749

MASK64 = (1 << 64) - 1

Text = Union[str, bytes]


def _codes(s: Text) -> List[int]:
    """The values that get hashed: code points of a str, bytes of a bytes object."""
    if isinstance(s, (bytes, bytearray)):
        return list(s)
    if isinstance(s, str):
        return [ord(c) for c in s]
    raise TypeError(f"expected str or bytes, got {type(s).__name__}")


class _SubstringQueries:
    """equal, lcp, compare and count_distinct, built on get(l, r) and the codes of the string."""

    n: int
    codes: List[int]

    def get(self, l: int, r: int):  # pragma: no cover - every subclass defines it
        raise NotImplementedError

    def _check_range(self, l: int, r: int) -> None:
        if not 0 <= l <= r <= self.n:
            raise IndexError(f"[{l}, {r}) is not a range of 0..{self.n}")

    def equal(self, i: int, j: int, length: int) -> bool:
        """Whether s[i:i+length] == s[j:j+length], by comparing two hashes: O(1)."""
        if length < 0:
            raise ValueError(f"length {length} is negative")
        self._check_range(i, i + length)
        self._check_range(j, j + length)
        return self.get(i, i + length) == self.get(j, j + length)

    def _lcp(self, i: int, j: int, limit: int) -> int:
        """The largest k <= limit with equal hashes of s[i:i+k] and s[j:j+k]: binary search."""
        lo, hi = 0, limit
        # Invariant: the prefixes of length lo agree, and none longer than hi can.
        while lo < hi:
            mid = (lo + hi + 1) // 2
            if self.get(i, i + mid) == self.get(j, j + mid):
                lo = mid
            else:
                hi = mid - 1
        return lo

    def lcp(self, i: int, j: int) -> int:
        """Length of the longest common prefix of the suffixes s[i:] and s[j:]: O(log n).

        i and j may be n (the empty suffix). Each step of the binary search compares two
        substring hashes, so the answer is exact unless two of them collide.
        """
        self._check_range(i, self.n)
        self._check_range(j, self.n)
        return self._lcp(i, j, min(self.n - i, self.n - j))

    def compare(self, l1: int, r1: int, l2: int, r2: int) -> int:
        """-1, 0 or 1 as s[l1:r1] is smaller than, equal to or larger than s[l2:r2]: O(log n).

        The order is by character value (code point for a str, byte for bytes), a proper prefix
        first, the order of Python's < on str and bytes. The common prefix comes from _lcp; the
        first character after it decides.
        """
        self._check_range(l1, r1)
        self._check_range(l2, r2)
        len1, len2 = r1 - l1, r2 - l2
        k = self._lcp(l1, l2, min(len1, len2))
        if k == min(len1, len2):
            return (len1 > len2) - (len1 < len2)
        return -1 if self.codes[l1 + k] < self.codes[l2 + k] else 1

    def count_distinct(self, length: int) -> int:
        """Number of distinct substrings of the given length: O(n) expected (a set of hashes).

        Length 0 gives 1 (the empty string), a length above n gives 0.
        """
        if length < 0:
            raise ValueError(f"length {length} is negative")
        return len({self.get(i, i + length) for i in range(self.n - length + 1)})


class PolynomialHash(_SubstringQueries):
    """Prefix hashes and powers of one string for one (base, modulus) pair.

    prefix[i] is the hash of s[:i] (prefix[0] = 0) and power[i] is base^i mod mod, both of
    length n + 1. Building them is O(n); get(l, r) is O(1).
    """

    def __init__(self, s: Text, base: int, mod: int):
        """Raises ValueError unless 2 <= mod <= 2^32 and 1 <= base < mod; TypeError unless s is str or bytes."""
        if not 2 <= mod <= MAX_MOD:
            raise ValueError(f"mod {mod} is outside 2..2^32")
        if not 1 <= base < mod:
            raise ValueError(f"base {base} is outside 1..{mod - 1}")
        self.base = base
        self.mod = mod
        self.codes = _codes(s)
        self.n = len(self.codes)
        self.prefix = [0] * (self.n + 1)
        self.power = [1] * (self.n + 1)
        for i, c in enumerate(self.codes):
            # Horner's rule: shift the hash one digit left and add the next character.
            self.prefix[i + 1] = (self.prefix[i] * base + c) % mod
            self.power[i + 1] = self.power[i] * base % mod

    def get(self, l: int, r: int) -> int:
        """The hash of s[l:r], from two prefix hashes and one power: O(1).

        prefix[r] = prefix[l] * base^(r-l) + hash(s[l:r]), so subtracting the shifted
        prefix[l] leaves the hash of the substring. Python's % is never negative.
        """
        self._check_range(l, r)
        return (self.prefix[r] - self.prefix[l] * self.power[r - l]) % self.mod


class DoubleHash(_SubstringQueries):
    """Two polynomial hashes, (BASE1, MOD1) and (BASE2, MOD2); a substring's hash is the pair.

    Two different substrings of length L get the same pair with probability at most about
    (L / MOD1) * (L / MOD2) when the bases are random, against L / MOD1 for one modulus.
    """

    def __init__(self, s: Text):
        self.first = PolynomialHash(s, BASE1, MOD1)
        self.second = PolynomialHash(s, BASE2, MOD2)
        self.codes = self.first.codes
        self.n = self.first.n

    def get(self, l: int, r: int) -> Tuple[int, int]:
        """The pair of hashes of s[l:r]: O(1)."""
        return self.first.get(l, r), self.second.get(l, r)


def polynomial_hash(s: Text, base: int, mod: int) -> int:
    """The hash of a whole string by Horner's rule, without a prefix table: O(len(s))."""
    if not 2 <= mod <= MAX_MOD:
        raise ValueError(f"mod {mod} is outside 2..2^32")
    if not 1 <= base < mod:
        raise ValueError(f"base {base} is outside 1..{mod - 1}")
    h = 0
    for c in _codes(s):
        h = (h * base + c) % mod
    return h


def overflow_hash(s: Text, base: int) -> int:
    """The polynomial hash modulo 2^64: what unsigned 64-bit overflow computes in C++ and Go.

    Do not use it. For an odd base the Thue-Morse strings of length 1024 collide (see
    thue_morse_pair); for an even base only the last 64 characters count, since base^64 is
    then a multiple of 2^64.
    """
    if not 0 <= base <= MASK64:
        raise ValueError(f"base {base} does not fit in 64 bits")
    h = 0
    for c in _codes(s):
        h = (h * base + c) & MASK64
    return h


def thue_morse_pair(k: int) -> Tuple[str, str]:
    """The Thue-Morse string of length 2^k over "ab" and its complement (a and b swapped).

    Character i is "b" when i has an odd number of 1 bits. Up to sign, their difference as a
    polynomial in the base x is the product of (x^(2^j) - 1) for j < k. For an odd x, 2 divides
    x - 1 and 2^(j+2) divides x^(2^j) - 1 for j >= 1, so 2^((k^2 + 3k - 2) / 2) divides the
    product: 2^64 from k = 10 (length 1024) on, and overflow_hash cannot tell them apart.
    """
    if not 0 <= k <= 30:
        raise ValueError(f"k = {k} is outside 0..30")
    s = "".join("b" if bin(i).count("1") % 2 else "a" for i in range(1 << k))
    t = s.translate(str.maketrans("ab", "ba"))
    return s, t


def main() -> None:
    """Prefix hashes with a small modulus, the queries with DoubleHash, and the 2^64 failure."""
    s = "mississippi"
    small = PolynomialHash(s, 31, 97)
    print(f"s = {s!r}, base 31, mod 97")
    print("codes: ", small.codes)
    print("prefix:", small.prefix)
    print("power: ", small.power)
    print("hash of s[1:5] =", small.get(1, 5), "and of s[4:8] =", small.get(4, 8))

    h = DoubleHash(s)
    print("DoubleHash of s[1:5]:", h.get(1, 5), "of s[4:8]:", h.get(4, 8))
    print("equal(1, 4, 4) =", h.equal(1, 4, 4), " equal(1, 4, 5) =", h.equal(1, 4, 5))
    print("lcp(1, 4) =", h.lcp(1, 4), " lcp(2, 5) =", h.lcp(2, 5), " lcp(0, 1) =", h.lcp(0, 1))
    print("compare(s[1:5], s[4:8]) =", h.compare(1, 5, 4, 8), " compare(s[0:4], s[1:5]) =", h.compare(0, 4, 1, 5))
    print("distinct substrings of length 1..11:", [h.count_distinct(k) for k in range(1, len(s) + 1)])

    tiny = PolynomialHash("abracadabra", 31, 101)
    print("base 31, mod 101: abra and brac both hash to", tiny.get(0, 4), tiny.get(1, 5))

    a, b = thue_morse_pair(10)
    for base in (3, 31, 131, BASE1):
        print(f"Thue-Morse, length 1024, base {base}: overflow_hash equal = {overflow_hash(a, base) == overflow_hash(b, base)}")
    print("DoubleHash tells them apart:", DoubleHash(a).get(0, 1024) != DoubleHash(b).get(0, 1024))


if __name__ == "__main__":
    main()
