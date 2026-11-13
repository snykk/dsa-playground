# Rabin-Karp Algorithm -- C++ Implementation

Rabin-Karp search with a rolling hash and verified hits.

## Files

| File | Contents |
|------|----------|
| `rabin_karp.cpp` | `BASE`, `MOD`, `byteValue`, `rabinKarpSearch` (a demo `main` is left commented out) |
| `rabin_karp_test.cpp` | `assert`-based tests: matches, no match, empty inputs, a pattern longer than the text, bytes above 0x7F (regression), overlaps and a spurious hit |

## API

- `std::vector<int> rabinKarpSearch(const std::string& text, const std::string& pattern)`: all start indices, in increasing order; empty for an empty pattern, an empty text, or a pattern longer than the text. O(n + m) expected, O(n*m) worst case.
- `int byteValue(char c)`: the byte as an unsigned value `0..255`.

## C++-Specific Notes

- `char` is signed on common platforms. Hashing it directly makes the initial hashes negative for bytes of 0x80 or more while the rolled hash is normalised into `[0, MOD)`, so equal windows would get different hashes and matches would be lost. `byteValue` converts to `unsigned char` first.
- `BASE = 256` and `MOD = 101` are compile-time constants. The products fit in `int` for these values; a larger modulus needs 64-bit arithmetic.
- Indices are byte offsets.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD rabin_karp_test.cpp -o rabin_karp_test
./rabin_karp_test
```

## Key Takeaways

1. Hash unsigned bytes.
2. Normalise a negative rolled hash.
3. A hash hit is only a candidate.
