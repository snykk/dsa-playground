# Python Implementation

This folder contains a **Rope data structure** implemented in Python.

#### Classes

- `RopeNode` - Binary tree node (leaf stores string fragment, internal stores weight)
- `Rope` - Main class wrapping the tree

#### Operations

- `Rope(text)` - Build a rope from a string
- `index(i)` - Get character at position i
- `concat(other)` - Concatenate two ropes
- `split(i)` - Split rope at position i
- `insert(i, text)` - Insert string at position i
- `delete(i, length)` - Delete substring
- `to_string()` - Collect all leaves into a string
- `len(rope)` - Get total length

#### Run Tests

```bash
python -m unittest rope_test.py
```

Or directly:

```bash
python rope_test.py
```
