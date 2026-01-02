# Centroid Decomposition - Python

This folder contains a Python implementation of **Centroid Decomposition** for tree problems.

---

## Concept

Centroid Decomposition recursively decomposes a tree by repeatedly removing centroids. Useful for solving various tree problems efficiently.

**Key Features:**
- Tree decomposition by centroids
- Divide-and-conquer approach
- O(N log N) construction
- Useful for tree problems

---

## Functions

| Function | Description | Time Complexity |
|----------|-------------|----------------|
| `CentroidDecomposition.build(root)` | Build centroid tree | O(N log N) |
| `get_centroid_tree()` | Get centroid tree structure | O(N) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Build Decomposition | O(N log N) | O(N) |
| Get Tree | O(N) | O(N) |

---

## Usage

```python
from centroid_decomposition import CentroidDecomposition

n = 7
adj = [[1, 2], [0, 3, 4], [0, 5], [1], [1, 6], [2], [4]]

cd = CentroidDecomposition(n, adj)
cd.build(0)

centroid_tree = cd.get_centroid_tree()
parent = cd.parent
```

---

## Running Tests

```bash
python centroid_decomposition_test.py
```

---

_Last Updated: December 2025_

