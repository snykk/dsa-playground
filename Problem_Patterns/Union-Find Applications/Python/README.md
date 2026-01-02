# Union-Find in Python

Implementation of Disjoint Set Union (DSU) in Python3.

## Features

1.  **UnionFind**: Class implementing DSU with:
    - Path Compression (in `find`)
    - Union by Rank (in `union`)
2.  **count_components**: Helper function demonstrating graph application.

## Usage

```python
from union_find import UnionFind

# Initialize with 10 elements (0 to 9)
uf = UnionFind(10)

# Union elements
uf.union(0, 1)
uf.union(1, 2)

# Check connectivity
if uf.connected(0, 2):
    print("0 and 2 are connected")

# Get number of disjoint sets
print(uf.get_count())
```

## Testing

Run the written unit tests:

```bash
python union_find_test.py
```
