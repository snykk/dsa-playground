# Rabin-Karp Algorithm -- Python Implementation

Rabin-Karp search with a rolling hash and verified hits.

## Files

| File | Contents |
|------|----------|
| `rabin_karp.py` | `rabin_karp_search`, `rabin_karp_search_count`, `rabin_karp_search_first`, the constants `BASE` and `MOD`, and a demo under `__main__` |
| `rabin_karp_test.py` | 11 `unittest` tests: matches, no match, count, first, overlaps, empty inputs, a pattern longer than the text, a spurious hit, forced collisions (`mod=1`, `mod=2`), non-ASCII text, a match at the end |

## API

- `rabin_karp_search(text: str, pattern: str, base: int = 256, mod: int = 101) -> List[int]`: all start indices, in increasing order; `[]` for an empty pattern, an empty text, or a pattern longer than the text. O(n + m) expected, O(n*m) worst case.
- `rabin_karp_search_count(text, pattern) -> int`: the number of occurrences.
- `rabin_karp_search_first(text, pattern) -> int`: the first index or `-1`.

```python
rabin_karp_search("XJUAB", "AB")   # [3]   ("JU" has the same hash 41 but is rejected)
```

## Python-Specific Notes

- Characters are hashed with `ord`, so indices and hashing work on code points.
- Python's `%` is never negative; the `if text_hash < 0` branch is a safeguard that does not trigger.
- `mod` can be any positive integer: with `mod=1` every window collides and the character check still gives the exact answer. Python integers do not overflow, so a large modulus is safe.
- `str.find` is the right tool in real code.

## How to Run

```bash
python3 -m unittest rabin_karp_test
python3 rabin_karp.py
```

(Run them from this folder.)

## Key Takeaways

1. Always verify a hash hit.
2. The modulus changes speed, not correctness.
