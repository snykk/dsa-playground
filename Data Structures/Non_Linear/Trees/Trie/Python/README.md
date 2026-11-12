# Trie -- Python Implementation

Prefix tree with dictionary children. See the [topic README](../README.md) for the theory, the trace and the complexity table.

## Files

- `trie.py`: `TrieNode` and `Trie`
- `trie_test.py`: unit tests (basic operations, delete return value and pruning, empty word, long words, non-ASCII)

## API

- `insert(word)`
- `search(word)`, `starts_with(prefix)`
- `delete(word)`: True if the word was stored and has been removed, False otherwise
- `get_all_words()`: list in depth-first insertion order
- `count_words()`, `is_empty()`

## Python-Specific Notes

Characters are code points, so a non-ASCII word such as an accented one is one node per character. `delete`, `get_all_words` and `count_words` are iterative, so a word of thousands of characters does not hit the recursion limit. `is_empty` is false after `insert("")`.

## How to Run

```bash
python3 -m unittest trie_test
```

## Key Takeaways

- The end flag separates words from prefixes.
- Delete clears the flag, then prunes upward until a word or a branch.
- All operations are O(word length).
