# Suffix Tree -- Python Implementation

Compressed suffix tree built suffix by suffix. See the [topic README](../README.md) for the theory, the trace and the complexity table.

## Files

- `suffix_tree.py`: `SuffixTreeNode` and `SuffixTree`
- `suffix_tree_test.py`: exact-result tests plus a randomized comparison with brute-force search

## API

- `SuffixTree(text)`: raises `ValueError` if the text contains the NUL character
- `search(pattern)`: sorted list of start indices (code points); `[]` for an empty or absent pattern
- `get_all_suffixes()`: sorted list of the non-empty suffixes of the text

## Python-Specific Notes

The terminator is `TERMINATOR = '\0'`, appended internally; a `$` in the text is an ordinary character. Edges store `start` and `end` indices into the text. Leaf collection and `get_all_suffixes` use an explicit stack, so a text of 1500 identical characters (a chain of depth 1500) does not hit the recursion limit. The node still carries unused `suffix_link` and `global_end` fields left over from Ukkonen's algorithm.

## How to Run

```bash
python3 -m unittest suffix_tree_test
```

## Key Takeaways

- Every suffix gets its own leaf because the terminator is unique.
- A mismatch inside an edge label splits the edge.
- Build is O(n^2); search is O(m + occ).
