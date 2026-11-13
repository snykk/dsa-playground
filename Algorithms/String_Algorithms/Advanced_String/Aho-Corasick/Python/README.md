# Aho-Corasick -- Python Implementation

A multi-pattern matcher built from a trie, failure links and output links.

## Files

| File | Contents |
|------|----------|
| `aho_corasick.py` | `AhoCorasick` class and a small demo under `__main__` |
| `aho_corasick_test.py` | 11 `unittest` tests: single pattern, no match, empty text, empty patterns, the `ushers` example, overlaps, prefix patterns, duplicates, single characters, a long pattern, Unicode |

## API

- `AhoCorasick(patterns: List[str])`: builds the automaton. Empty patterns are skipped; duplicate patterns are stored twice.
- `search(text: str) -> List[Tuple[int, str]]`: every match as `(end_index, pattern)`, with `end_index` the index of the last character. For one end index, the pattern at the node comes first, then the patterns reached through output links.

```python
ac = AhoCorasick(["he", "she", "his", "hers"])
ac.search("ushers")   # [(3, 'she'), (3, 'he'), (5, 'hers')]
```

## Python-Specific Notes

- Children are a `dict` per node, so any alphabet works. Indices are code points.
- The failure-link BFS uses `collections.deque`; `popleft` is O(1).
- `_Node` uses `__slots__` to cut per-node memory.
- `output` links point to the nearest failure ancestor that ends a pattern, so suffix matches are reported without scanning the whole chain.
- The root's `fail` is `None`; `search` never follows it because it stops at the root.

## How to Run

```bash
python3 -m unittest aho_corasick_test
```

(Run it from this folder.)

## Key Takeaways

1. It is KMP's failure function on a trie of patterns.
2. Failure links must be built in BFS order.
3. Output links report patterns that are suffixes of other patterns.
