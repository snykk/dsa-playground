# String Hashing -- C++ Implementation

Polynomial prefix hashes over the bytes of a `std::string`, the hash of any substring in O(1), and the queries built on it. See the [topic README](../README.md) for the idea, a trace and the collision numbers.

## Files

| File | Contents |
|------|----------|
| `string_hashing.cpp` | `SubstringQueries`, `PolynomialHash`, `DoubleHash`, `polynomialHash`, `overflowHash`, `thueMorsePair`, the constants and a demo `main()` (compiled out with `-DIS_TEST_BUILD`) |
| `string_hashing_test.cpp` | assert-based tests: the tables and hashes the Python code computes for `mississippi`, the largest modulus 2^32, a UTF-8 string and a string of 100,000 characters; every substring hash against the definition; the queries against brute force on random strings from `std::mt19937` with fixed seeds; the empty string, one character, all characters equal; invalid input; the small-modulus collisions, the n - 1 bound for one pair and the Thue-Morse strings |

## API

| Member | Description |
|--------|-------------|
| `PolynomialHash(const std::string& s, uint64_t base, uint64_t mod)` | the tables, O(n); throws `std::invalid_argument` unless `2 <= mod <= 2^32` and `1 <= base < mod` |
| `uint64_t get(int l, int r) const` | the hash of `s[l, r)`, O(1); throws `std::out_of_range` unless `0 <= l <= r <= n` |
| `prefix()`, `power()`, `base()`, `mod()` | the tables and the parameters, by const reference or value |
| `explicit DoubleHash(const std::string& s)` | (`BASE1`, `MOD1`) and (`BASE2`, `MOD2`), O(n); `first()` and `second()` give the two tables |
| `std::pair<uint64_t, uint64_t> get(int l, int r) const` | the pair of hashes, O(1) |
| `bool equal(int i, int j, int length) const` | O(1); a negative length throws `std::invalid_argument` |
| `int lcp(int i, int j) const` | the longest common prefix of `s[i, n)` and `s[j, n)`, O(log n) |
| `int compare(int l1, int r1, int l2, int r2) const` | -1, 0 or 1, comparing bytes as unsigned values, O(log n) |
| `int countDistinct(int length) const` | distinct substrings of that length, O(n log n) |
| `size()`, `text()` | the length in bytes and the string |
| `uint64_t polynomialHash(const std::string& s, uint64_t base, uint64_t mod)` | the hash of the whole string, O(m) |
| `uint64_t overflowHash(const std::string& s, uint64_t base)` | the hash modulo 2^64 by unsigned overflow (the broken one) |
| `std::pair<std::string, std::string> thueMorsePair(int k)` | the Thue-Morse string of length 2^k and its complement; throws `std::invalid_argument` unless `0 <= k <= 30` |

## C++-Specific Notes

- **No overflow.** Hashes and powers are `uint64_t` values below the modulus, at most 2^32, so a product of two of them is at most (2^32 - 1)^2 < 2^64. Every product is reduced before the next one, and `get` adds `mod` before subtracting, since an unsigned value cannot go below zero. A modulus near 2^61 would need a 128-bit product (`unsigned __int128` in GCC and Clang), which this code avoids by keeping two 30-bit primes.
- **Bytes.** A `char` is read as `unsigned char`, so bytes of 0x80 or more count as 128..255. UTF-8 text is hashed byte by byte and positions are byte offsets; the test pins the hashes of `h\xc3\xa9llo` that Python computes for `"h\xe9llo".encode()`.
- **One set of queries.** `SubstringQueries<Derived>` holds `equal`, `lcp`, `compare` and `countDistinct` and calls `Derived::get` (the curiously recurring template pattern), so both classes share them without virtual calls.
- `countDistinct` sorts the hashes and counts the unique ones, O(n log n), where Python and Go use a hash set; `std::pair` has no `std::hash`, but it sorts.
- Positions are `int`; a string longer than `INT_MAX` throws `std::length_error`.
- `overflowHash` relies on unsigned wrap-around, which is defined behaviour (signed overflow would not be). The sanitizer build in CI runs the tests again.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD string_hashing_test.cpp -o test && ./test
g++ -std=c++17 -O2 string_hashing.cpp -o demo && ./demo
```

## Key Takeaways

- A modulus of at most 2^32 keeps every product inside 64 unsigned bits.
- Add the modulus before subtracting in `get`.
- The tests pin the Python values, so the three languages agree on every hash.
