# String Hashing

A polynomial hash turns a string into a number modulo a prime, so that comparing two strings costs O(1) instead of O(length). After O(n) preprocessing of one string (its prefix hashes and the powers of the base), the hash of any substring takes O(1). That gives substring equality in O(1), the longest common prefix of two suffixes in O(log n) by binary search, the order of two substrings in O(log n), and the number of distinct substrings of each length in O(n) expected time. Equal strings always get equal hashes; different strings can collide, so every answer here is correct with high probability, not always.

[Rabin-Karp](../../Pattern_Matching/Rabin_Karp_Algorithm/) uses the same hash to slide one window along a text. This topic keeps every prefix hash instead, so that any substring can be hashed, in any order, as often as needed.

## Intuition

Read `c_0 c_1 ... c_(m-1)` as the digits of a number in base B and keep only its remainder modulo M:

```text
hash(c_0 ... c_(m-1)) = (c_0 * B^(m-1) + c_1 * B^(m-2) + ... + c_(m-1)) mod M
```

The prefix hashes work like prefix sums. `prefix[r]` is the number written by `s[0:r]`; the digits of `s[0:l]` sit in it shifted `r - l` places to the left, so subtracting `prefix[l] * B^(r-l)` leaves exactly the digits of `s[l:r]`:

```text
hash(s[l:r]) = (prefix[r] - prefix[l] * power[r - l]) mod M
```

Two different strings of the same length collide only when B is a root of their difference, a nonzero polynomial of degree at most `m - 1`. Modulo a prime it has at most `m - 1` roots, so a base drawn at random from `M` values collides with probability at most `(m - 1) / M`. Many comparisons add up (the birthday bound below), which is why one modulus near 10^9 is not enough and this code keeps two.

## Visual

`PolynomialHash("mississippi", 31, 97)`. The column of `prefix[i]` shows the character it adds last:

```text
i            0    1    2    3    4    5    6    7    8    9   10   11
adds s[i-1]       m    i    s    s    i    s    s    i    p    p    i
code            109  105  115  115  105  115  115  105  112  112  105
prefix[i]    0   12   89   61   66   17   60   35   26   45   52   68
power[i]     1   31   88   12   81   86   47    2   62   79   24   65

hash(s[1:5]) = (prefix[5] - prefix[1] * power[4]) mod 97 = (17 - 12 * 81) mod 97 = 15   "issi"
hash(s[4:8]) = (prefix[8] - prefix[4] * power[4]) mod 97 = (26 - 66 * 81) mod 97 = 15   "issi"
```

## How It Works

### Building the tables (`PolynomialHash(s, base, mod)`)

1. Check `2 <= mod <= 2^32` and `1 <= base < mod`.
2. `prefix[0] = 0` and `power[0] = 1`.
3. For each character with value `c`: `prefix[i + 1] = (prefix[i] * base + c) mod M` (Horner's rule) and `power[i + 1] = power[i] * base mod M`.

The value of a character is its code point for a Python `str`, and its byte (0 to 255) for Python `bytes`, a C++ `std::string` and a Go `string`. For ASCII text all three agree; for other text, Python hashes characters and C++ and Go hash UTF-8 bytes, and `s.encode("utf-8")` gives Python the same numbers as C++ and Go.

### The queries

| Query | How | Time |
|-------|-----|------|
| `get(l, r)` | `(prefix[r] - prefix[l] * power[r - l]) mod M` | O(1) |
| `equal(i, j, length)` | `get(i, i + length) == get(j, j + length)` | O(1) |
| `lcp(i, j)` | binary search on the length `k` in `0..min(n - i, n - j)`: keep the longest `k` whose two prefixes have equal hashes | O(log n) |
| `compare(l1, r1, l2, r2)` | `k` = the common prefix of the two substrings (the same binary search, limited to the shorter length); if one is a prefix of the other, the shorter is smaller, else the characters at offset `k` decide | O(log n) |
| `count_distinct(length)` | the number of different hashes among the `n - length + 1` substrings of that length (1 for length 0, 0 above n) | O(n) expected |

The binary search works because equality of prefixes is monotone: if the first `k` characters agree, so do the first `k - 1`. It keeps `lo` = a length known to agree and `hi` = the longest length that still might, tries `mid = (lo + hi + 1) / 2`, and stops when they meet.

### Double hashing (`DoubleHash(s)`)

Two `PolynomialHash` tables with fixed pairs, and the hash of a substring is the pair:

| Pair | Base | Modulus |
|------|------|---------|
| 1 | 911,382,323 | 1,000,000,007 |
| 2 | 972,663,749 | 998,244,353 |

Contest code draws the bases at random when the program starts, so that nobody can prepare an input against them. This repository fixes them so that Python, C++ and Go compute the same numbers and the tests can pin them.

### Hashing modulo 2^64 by overflow (`overflow_hash`)

Letting a 64-bit unsigned integer overflow computes the hash modulo 2^64 for free, and it is broken. For an even base, B^64 is a multiple of 2^64, so only the last 64 characters count. For an odd base, the Thue-Morse string of length 1024 (`thue_morse_pair(10)`: character i is `b` when i has an odd number of 1 bits) and its complement always collide: their difference is, up to sign, the product of `(B^(2^j) - 1)` for `j < 10`, and 2 divides `B - 1` and `2^(j+2)` divides `B^(2^j) - 1`, so `2^(1 + 3 + 4 + ... + 11) = 2^64` divides the product. The tests check it for 207 odd bases in all three languages.

### Errors

| Input | Python | C++ | Go |
|-------|--------|-----|----|
| `mod` outside `2..2^32` or `base` outside `1..mod-1` | `ValueError` | `std::invalid_argument` | `NewPolynomialHash` and `PolynomialHashOf` return an error wrapping `ErrBadParameters` |
| a range that is not `0 <= l <= r <= n`, a position outside the string | `IndexError` | `std::out_of_range` | panic |
| a negative length in `equal` or `count_distinct` | `ValueError` | `std::invalid_argument` | panic |
| `thue_morse_pair(k)` with `k` outside `0..30` | `ValueError` | `std::invalid_argument` | panic |

Python also raises `TypeError` for a text that is neither `str` nor `bytes`, and `ValueError` from `overflow_hash` for a base outside `0..2^64-1`, which C++ and Go cannot even express.

## Step-by-Step Trace

`lcp(1, 4)` on `mississippi` with the tables above: the suffixes `ississippi` and `issippi`, so the limit is `min(10, 7) = 7`.

| Step | lo | hi | mid | Hashes of the two prefixes of length mid | Result |
|------|----|----|-----|------------------------------------------|--------|
| 1 | 0 | 7 | 4 | `get(1, 5)` = 15, `get(4, 8)` = 15 (`issi`, `issi`) | equal: lo = 4 |
| 2 | 4 | 7 | 6 | `get(1, 7)` = 53, `get(4, 10)` = 54 (`ississ`, `issipp`) | differ: hi = 5 |
| 3 | 4 | 5 | 5 | `get(1, 6)` = 95, `get(4, 9)` = 92 (`issis`, `issip`) | differ: hi = 4 |
| 4 | 4 | 4 | | lo == hi | return 4 |

Six substring hashes, where the plain scan compares 5 pairs of characters (4 equal, then `s` against `p`); on long strings the difference is O(log n) against O(n). `DoubleHash("mississippi")` gives the same answers: `lcp(2, 5) = 3`, `compare(0, 4, 1, 5) = 1` (`miss` > `issi`, decided by `m` > `i` at offset 0), and 4, 7, 7, 7, 7, 6, 5, 4, 3, 2, 1 distinct substrings of lengths 1 to 11.

A modulus as small as 97 collides easily. With base 31 and modulus 101, `abra` and `brac` in `abracadabra` both hash to 57, so `count_distinct(4)` returns 6 instead of 7. With base 7 and modulus 11, `abra` and `cada` collide and `lcp(0, 4)` returns 4 instead of 0: the binary search trusts the collision at length 4 and never looks at length 1. `DoubleHash` gets both right.

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| Build (`PolynomialHash`, `DoubleHash`) | O(n) | O(n): two arrays of n + 1 numbers per modulus |
| `get`, `equal` | O(1) | O(1) |
| `lcp`, `compare` | O(log n): at most ceil(log2(n + 1)) steps, two `get` calls each | O(1) |
| `count_distinct(length)` | O(n) expected (a hash set in Python and Go), O(n log n) in C++ (sort and unique) | O(n) |
| all lengths | O(n^2) | O(n) |

Counted with the Python code: on strings of 10 to 10^6 characters, no `lcp` made more than `2 * ceil(log2(n + 1))` calls to `get` (40 at n = 10^6), and `count_distinct` over every length of a string of n characters made exactly n(n + 1)/2 calls (2,001,000 for n = 2000).

### How likely is a collision?

- **One comparison** of two different strings of length n, with a random base and a prime modulus M: at most `(n - 1) / M`. Checked by trying all 1008 bases with M = 1009 on random pairs: a pair of length n never collided for more than n - 1 bases. For n = 10^5 and M near 10^9 that is at most 10^-4 per comparison; with two moduli and independent random bases, the product, about 10^-8.
- **Many hashes.** Among k different strings the expected number of colliding pairs is `k(k-1)/2 / M`, about `k^2 / (2M)` (the birthday bound), and the chance of at least one is about `1 - exp(-k^2 / (2M))`. With M = 10,007 and 1000 trials each: k = 100 gave 0.52 colliding pairs on average (formula 0.49) and a collision in 41% of the trials (formula 39%); k = 300 gave 4.45 (formula 4.48) and 99% (formula 99%).
- **Why one 32-bit modulus is not enough.** 10^5 substrings of length 20 of a random string, one modulus `1,000,000,007`: the formula gives 5.0 colliding pairs, and on 20 random strings `count_distinct(20)` came out short by 5.0 on average, wrong on all 20. With the largest prime below 2^32 (4,294,967,291) the formula gives 1.16 pairs and a 69% chance of at least one; 27 of 40 strings had one. With `DoubleHash` the formula gives 5 x 10^-9, and none of 5 strings lost a count.

## When to Use

- Many equality, LCP or order queries on substrings of one fixed string: palindrome checks (hash the string and its reverse), periods and borders, comparing rotations.
- Binary search on an answer length, with a set of hashes per length: the longest repeated substring, the longest common substring of several strings.
- Counting distinct substrings of one length, or deduplicating windows.
- Not when a wrong answer is unacceptable and the input may be adversarial: a deterministic structure (Z-array, KMP, suffix array) never errs. Not when the string changes between queries (that needs a Fenwick or segment tree of hashes, not in this repository).

## String Hashing vs. Alternatives

| Method | Preprocessing | Substring equality | LCP of two suffixes | Exact? |
|--------|---------------|--------------------|---------------------|--------|
| String hashing (here) | O(n) | O(1) | O(log n) | with high probability |
| Direct comparison | none | O(length) | O(answer) | yes |
| [Z-algorithm](../Z_Algorithm/) | O(n) | only against the whole string's prefix | LCP with the whole string, O(1) | yes |
| [Suffix array](../Suffix_Array/) with an LCP array and a sparse table | O(n log n) with prefix doubling and radix sort (this repository builds in O(n^2 log n) and has no LCP array) | through the LCP | O(1) | yes |
| [Rabin-Karp](../../Pattern_Matching/Rabin_Karp_Algorithm/) | none | one rolling window, left to right | no | verifies every hit |

## Common Pitfalls

- **Comparing hashes of different lengths.** Equal hashes mean nothing unless the lengths are equal: `\0` and `\0\0` both hash to 0. The queries here compare equal lengths only.
- **A negative difference in C++ and Go.** `prefix[r] - prefix[l] * power[r - l]` is negative half the time; add `mod` before taking the remainder, as `get` does. Python's `%` is never negative.
- **Overflowing the product.** With a modulus up to 2^32 both factors are below 2^32 and the product fits in 64 unsigned bits; a larger modulus (such as 2^61 - 1) needs a 128-bit product.
- **Natural overflow as the modulus.** Hashing modulo 2^64 loses to the Thue-Morse strings for every odd base, and to any two strings with the same last 64 characters for an even base.
- **One modulus for many substrings.** 10^5 substrings and a modulus near 10^9 almost surely contain a collision; use two moduli or one near 2^61.
- **A fixed base against an adversary.** Public constants let someone prepare a collision offline; pick the base at random at run time when the input is hostile.
- **Signed `char`** in C++: bytes of 0x80 or more would be negative. The code reads them as `unsigned char`.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `string_hashing.py` | `PolynomialHash`, `DoubleHash`, `polynomial_hash`, `overflow_hash`, `thue_morse_pair`; hashes code points of a `str` or bytes of a `bytes` |
| C++ | [C++/](C++/) | `string_hashing.cpp` | the same names in camelCase; the queries come from a CRTP base class; hashes bytes |
| Go | [Go/](Go/) | `main.go` | `NewPolynomialHash` returns an error; the queries are generic functions over both types; hashes bytes |

All three give the same tables and hashes for the same bytes: the C++ and Go tests pin the tables of `mississippi`, the `DoubleHash` values, the tables at the largest modulus 2^32, the hashes of a 10^5-character string and of a UTF-8 string, all computed by the Python code.

## Practice Problems

- [Finding Borders (CSES 1732)](https://cses.fi/problemset/task/1732): a prefix equal to a suffix, one `equal` per length.
- [Good Substrings (Codeforces 271D)](https://codeforces.com/problemset/problem/271/D): distinct substrings, deduplicated by their hashes.
- [Longest Duplicate Substring (LeetCode 1044)](https://leetcode.com/problems/longest-duplicate-substring/): binary search on the length, a set of hashes per length.
- [Minimal Rotation (CSES 1110)](https://cses.fi/problemset/task/1110): compare rotations of `s + s` with `compare`.
- [Longest Common Subpath (LeetCode 1923)](https://leetcode.com/problems/longest-common-subpath/): hash sets over many sequences, where one modulus is known to fail.

## Related

- [Rabin-Karp Algorithm](../../Pattern_Matching/Rabin_Karp_Algorithm/): the rolling hash for one pattern; read first.
- [Modular Arithmetic](../../../Mathematical_Algorithms/Number_Theory/Modular_Arithmetic/): the remainders the hash is made of.
- [Binary Search](../../../Searching/Binary_Search/): the search on the length behind `lcp`.
- [Suffix Array](../Suffix_Array/): the exact structure for the same LCP and order questions.
- [Z-Algorithm](../Z_Algorithm/): exact common prefixes with the start of the string.
- [Hash Table](../../../../Data_Structures/Hashing/Hash_Table/): where the hashes of `count_distinct` are kept.
- [Advanced String Algorithms](../)
