# Pattern Matching -- Python Implementation

Four pattern-matching algorithms side by side: each returns the list of start indices where `pattern` occurs in `text`.

## Files

| File | Contents |
|------|----------|
| `pattern_matching.py` | `naive_search`, `compute_lps`, `kmp_search`, `rabin_karp_search`, `bad_char_table`, `boyer_moore_search` |
| `pattern_matching_test.py` | 7 `unittest` tests: one per algorithm on `ababcabcabc` / `abc`, plus the empty pattern, a pattern longer than the text, and overlapping matches, each run on all four algorithms |

## API

- `naive_search(text, pattern) -> list`: compare every window. O(n*m).
- `compute_lps(pattern) -> list`: the LPS table (`lps[i]` = longest proper prefix of `pattern[0..i]` that is also a suffix). O(m).
- `kmp_search(text, pattern) -> list`: KMP search. O(n + m).
- `rabin_karp_search(text, pattern, q=101) -> list`: rolling hash with base 256 modulo `q`; every hash hit is verified. O(n + m) expected.
- `bad_char_table(pattern) -> dict`: character to its last index in the pattern.
- `boyer_moore_search(text, pattern) -> list`: right-to-left comparison with bad-character shifts only. O(n/m) best, O(n*m) worst.

Edge cases: an empty pattern returns `[0, 1, ..., len(text)]` in all four; a pattern longer than the text returns `[]`.

## Python-Specific Notes

- Indices are **code points**, not bytes: `"cafe cafe"`-style offsets in non-ASCII text differ from the C++ and Go versions.
- `str.find` and `in` are implemented in C and are what you should use in real code.
- Rabin-Karp uses Python's arbitrary-precision integers, and `%` is always non-negative, so no negative-hash correction is needed. The default `q = 101` is small on purpose; spurious hash hits are rejected by the comparison, so results stay correct.
- The first window hashes are built with `pow(d, m-i-1, q)` per character (O(m log m)); a Horner loop would be O(m).
- Boyer-Moore here uses only the bad-character rule, so its worst case is O(n*m).

## How to Run

```bash
python3 -m unittest pattern_matching_test
```

(Run it from this folder.)

## Key Takeaways

1. The algorithms differ in what they reuse after a mismatch: nothing (naive), a border (KMP), a hash (Rabin-Karp), or the mismatching character (Boyer-Moore).
2. KMP is the one with a guaranteed O(n + m) bound; the LPS table is the part to understand.
3. Test the edges: empty pattern, pattern longer than the text, overlapping matches.
