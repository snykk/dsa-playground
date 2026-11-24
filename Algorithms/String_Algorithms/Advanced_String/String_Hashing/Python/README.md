# String Hashing -- Python Implementation

Polynomial prefix hashes, the hash of any substring in O(1), and the queries built on it: equality, the longest common prefix of two suffixes, the order of two substrings and distinct substrings of one length. See the [topic README](../README.md) for the idea, a trace and the collision numbers.

## Files

| File | Contents |
|------|----------|
| `string_hashing.py` | `PolynomialHash`, `DoubleHash`, `polynomial_hash`, `overflow_hash`, `thue_morse_pair`, the constants and a demo `main()` |
| `string_hashing_test.py` | 30 `unittest` tests: the tables of `mississippi` and the values the C++ and Go tests pin; every substring hash against the definition for seven (base, modulus) pairs; `equal`, `lcp`, `compare` and `count_distinct` against brute force on random strings with fixed seeds; the empty string, one character, all characters equal, text outside ASCII, a string of 100,000 characters; invalid input; the small-modulus collisions, the n - 1 bound for one pair, the birthday bound and the Thue-Morse strings |

## API

| Call | Result | Time |
|------|--------|------|
| `PolynomialHash(s, base, mod)` | tables of `s` (a `str` or `bytes`); attributes `codes`, `n`, `base`, `mod`, `prefix` and `power` (length n + 1); `ValueError` unless `2 <= mod <= 2^32` and `1 <= base < mod` | O(n) |
| `DoubleHash(s)` | two `PolynomialHash` tables, `first` with (`BASE1`, `MOD1`) and `second` with (`BASE2`, `MOD2`) | O(n) |
| `.get(l, r)` | the hash of `s[l:r]`, a pair for `DoubleHash`; `IndexError` unless `0 <= l <= r <= n` | O(1) |
| `.equal(i, j, length)` | whether `s[i:i+length] == s[j:j+length]` | O(1) |
| `.lcp(i, j)` | the length of the longest common prefix of `s[i:]` and `s[j:]`; `i` and `j` may be n | O(log n) |
| `.compare(l1, r1, l2, r2)` | -1, 0 or 1, as Python's `<` orders `s[l1:r1]` and `s[l2:r2]` | O(log n) |
| `.count_distinct(length)` | distinct substrings of that length: 1 for 0, 0 above n; `ValueError` if negative | O(n) expected |
| `polynomial_hash(s, base, mod)` | the hash of the whole string by Horner's rule, without tables | O(len(s)) |
| `overflow_hash(s, base)` | the hash modulo 2^64, as unsigned overflow computes it (the broken one) | O(len(s)) |
| `thue_morse_pair(k)` | the Thue-Morse string of length 2^k over `ab` and its complement; `ValueError` unless `0 <= k <= 30` | O(2^k) |

The constants are `MOD1 = 1_000_000_007`, `BASE1 = 911_382_323`, `MOD2 = 998_244_353`, `BASE2 = 972_663_749` and `MAX_MOD = 2^32`.

```python
h = DoubleHash("mississippi")
h.lcp(1, 4)                    # 4: "issi" is shared by "ississippi" and "issippi"
h.compare(0, 4, 1, 5)          # 1: "miss" > "issi"
PolynomialHash("abracadabra", 31, 101).count_distinct(4)   # 6, not 7: "abra" and "brac" collide
```

## Python-Specific Notes

- Integers never overflow, so `prefix[l] * power[r - l]` needs no care, and `%` returns a value in `0..mod-1` even for a negative difference.
- A `str` is hashed by code points, so a character outside ASCII is one position with one value (U+00E9 is 233). A `bytes` object is hashed byte by byte, which gives the numbers of the C++ and Go versions: pass `s.encode("utf-8")` to get them.
- `count_distinct` keeps the hashes in a `set`; a pair from `DoubleHash` is a tuple, so it works the same way.
- The queries live in a small base class, `_SubstringQueries`, that only calls `self.get`, so `PolynomialHash` and `DoubleHash` share them.

## How to Run

```bash
cd "Algorithms/String_Algorithms/Advanced_String/String_Hashing/Python"
python3 -m unittest string_hashing_test
python3 string_hashing.py
```

## Key Takeaways

- `hash(s[l:r]) = (prefix[r] - prefix[l] * power[r - l]) mod M` in O(1).
- Equal hashes of equal lengths mean equal strings with high probability; two moduli make that probability about the square.
- Never hash modulo 2^64 by overflow: the Thue-Morse strings of length 1024 collide for every odd base.
