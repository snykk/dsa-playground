# Pattern Matching — Python Implementation

Pattern matching answers the question: **"at which positions does pattern `P` appear inside text `T`?"** This folder collects the four textbook algorithms side-by-side so you can see each one's trade-offs.

For the conceptual overview, complexity proofs, and when-to-use decision table, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `pattern_matching.py` | Naive, KMP, Rabin-Karp, Boyer-Moore (bad character) |
| `pattern_matching_test.py` | Unit tests covering each algorithm with shared fixtures |

---

## Algorithms Covered

| Algorithm | Preprocessing | Match | Good when... |
|-----------|---------------|-------|--------------|
| **Naive** | O(1) | O(n·m) | Pattern is tiny or matches are expected early |
| **KMP** | O(m) | O(n + m) | You want guaranteed linear time — always safe |
| **Rabin-Karp** | O(m) | O(n + m) expected | Multi-pattern search (one hash table of patterns) |
| **Boyer-Moore** | O(m + σ) | O(n/m) best, O(n·m) worst | Long patterns over large alphabets (skips chunks) |

---

## Python-Specific Notes

- **`str.find()` and `in` are already fast.** CPython uses a variant of Boyer-Moore / Horspool internally. Hand-rolled implementations here are educational — in production, `T.find(P)` is your answer.
- **Rabin-Karp uses rolling hashes.** We use modular arithmetic (`(hash * base + new_char) % mod`) to get O(1) hash updates. Watch out for mod bias — in Python, arbitrary-precision ints make this safer than in C++.
- **KMP's `failure` array is the star of the show.** Understand how `fail[i]` is defined ("longest proper prefix of P[0..i] that is also a suffix") before memorizing the code — the loop structure is hard to re-derive otherwise.
- **Boyer-Moore's "bad character rule" alone is not enough for the full O(n/m).** The real Boyer-Moore also uses the "good suffix rule". We implement bad-character only — enough to demonstrate the shift-table idea.

---

## How to Run

```bash
python3 -m unittest pattern_matching_test.py
```

---

## Key Takeaways for Learners

1. **Pattern matching is a preprocessing story.** Naive does zero prep and walks text quadratically; KMP and Boyer-Moore invest O(m) up front to walk text in (near-)linear time.
2. **KMP is the one to master first.** It's the foundation for Aho-Corasick (multi-pattern), Z-algorithm (another preprocessing idea), and suffix automata. Every string algorithm builds on its intuitions.
3. **Rabin-Karp shines for multi-pattern search.** Searching for one pattern? Use KMP. Searching for k patterns? Hash all k, scan text once, compare matching hashes — that's Rabin-Karp's killer use case.
