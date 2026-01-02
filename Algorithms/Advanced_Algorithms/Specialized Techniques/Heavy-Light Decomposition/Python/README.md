# Heavy-Light Decomposition - Python

This folder contains a Python implementation of **Heavy-Light Decomposition (HLD)** for efficient tree path queries.

---

## Concept

Heavy-Light Decomposition decomposes a tree into chains (heavy paths) to enable efficient path queries. Each path query can be answered in O(log² N) time.

**Key Features:**
- Tree decomposition into chains
- Efficient LCA computation
- Path query optimization
- O(log² N) per query

---

## Functions

| Function | Description | Time Complexity |
|----------|-------------|----------------|
| `HLD.build(root)` | Build HLD structure | O(N) |
| `HLD.lca(u, v)` | Find lowest common ancestor | O(log N) |
| `HLD.query_path(u, v)` | Get path segments | O(log N) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Build HLD | O(N) | O(N) |
| LCA Query | O(log N) | O(1) |
| Path Query | O(log² N) | O(log N) |

---

## Usage

```python
from heavy_light_decomposition import HLD

n = 7
adj = [[1, 2], [0, 3, 4], [0, 5], [1], [1, 6], [2], [4]]

hld = HLD(n, adj)
hld.build(0)

lca = hld.lca(3, 6)
path = hld.query_path(3, 6)
```

---

## Running Tests

```bash
python heavy_light_decomposition_test.py
```

---

_Last Updated: December 2025_

