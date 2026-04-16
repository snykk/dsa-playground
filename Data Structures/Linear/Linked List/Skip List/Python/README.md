# Skip List - Python

This folder contains a Python implementation of **Skip List** with unit tests.

**Files:**

- `skip_list.py` - Core implementation
- `skip_list_test.py` - Unit tests using `unittest`

**How to run:**

```bash
python -m unittest skip_list_test.py
```

**Key Operations**

- Insert element (maintains sorted order)
- Search for element
- Delete element by key
- Display all elements in sorted order

**Implementation Details**

- `Node` class with `key` and `forward` pointer list
- `SkipList` class with configurable `max_level` and probability `p`
- Random level generation using coin-flip probability (default p=0.5)
- Duplicate keys are ignored on insertion
