# Aho-Corasick — Python Implementation

An O(n + m + z) multi-pattern string-matching automaton built from a trie and failure links. Given `k` patterns (total length `m`) and text of length `n`, finds all `z` matches in a single pass.

For the conceptual overview, visuals, and comparison with alternatives, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `aho_corasick.py` | `AhoCorasick` class with `search(text)` returning all matches |
| `aho_corasick_test.py` | Unit tests including the canonical `ushers` example and overlapping patterns |

---

## Python-Specific Notes

- **`dict` children** per node for arbitrary alphabets (Unicode-safe out of the box). For ASCII-only input, a 256-element list is faster but less portable.
- **`collections.deque`** for the BFS that builds failure links. `deque.popleft` is O(1); a list's `pop(0)` would make the construction O(m²).
- **`__slots__` on `_Node`**: saves ~40 bytes per node, a real win on large pattern sets (thousands of nodes).
- **Output links as a linked list**: each node's `output` points to the nearest failure ancestor that's a match. Walking this chain reports all suffix-matches in O(k_match) without re-scanning.
- **Unicode support**: because we index children by `str` characters, patterns can be in any script (`αβ`, `你好`, `naïve`). `len()` bugs don't bite us here because iteration is over `str`, giving code points.

---

## How to Run

```bash
python3 -m unittest aho_corasick_test.py
```

---

## Key Takeaways for Learners

1. **It's KMP's failure function on a trie.** If you understand KMP's `fail[]` array, you already understand 80% of Aho-Corasick. The trie just generalizes "the pattern" to "a whole set of patterns".
2. **BFS order matters.** Failure links must be computed layer by layer — a DFS breaks the invariant that the parent's failure link is already known.
3. **Output links catch the subtle matches.** When pattern `B` is a suffix of pattern `A`, matching `A` must also report `B`. Output links chain these suffix-matches in O(1) amortized across the whole scan.
