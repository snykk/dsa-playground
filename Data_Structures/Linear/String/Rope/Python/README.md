# Rope -- Python Implementation

## Files

| File | Contents |
| --- | --- |
| `rope.py` | `RopeNode`, `Rope` and the helpers (`_join`, `_split`, `_build`, ...) |
| `rope_test.py` | unit tests, a randomized comparison with a plain `str`, and tree-invariant checks |

## API

- `Rope(text="")`: build a balanced rope (leaves of at most 10 characters); an empty string gives an empty rope.
- `index(i)`: the character at `i`; raises `IndexError` out of range. O(log n).
- `concat(other)`: a new `Rope`; sources unchanged. O(log n).
- `split(i)`: a pair of new ropes (positions before `i`, positions from `i`). `i` is clamped.
- `insert(i, text)`, `delete(i, length)`: modify this rope in place (by replacing its root).
- `to_string()`: the whole text. O(n).
- `len(r)`: total length, O(1).
- `height()`: tree height; 0 for one leaf, -1 for an empty rope.

## Python-Specific Notes

- Positions are code points because Python strings are sequences of code points.
- Nodes are never modified after creation, so ropes share subtrees safely.
- `_join` is an AVL-style join: it walks the taller rope's spine and rotates on the way back, keeping sibling heights within 1. `_split` uses `_join` to reassemble its pieces.
- Recursion depth is the tree height, O(log n), so Python's recursion limit is not a concern. Before the join was added, 1,000 appends at the end exceeded it.
- Leaves are non-empty strings; internal nodes have `data = None`.

## How to Run

```bash
cd "Data_Structures/Linear/String/Rope/Python"
python3 -m unittest rope_test
```

## Key Takeaways

- Weights guide the search; cached `length` and `height` make everything else cheap.
- Balance comes from the join, not from rebuilding.
- `split` and `concat` never change their inputs.
