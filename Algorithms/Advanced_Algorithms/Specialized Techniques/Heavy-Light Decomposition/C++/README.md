# Heavy-Light Decomposition - C++

This folder contains a C++ implementation of **Heavy-Light Decomposition (HLD)** for efficient tree path queries.

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
| `HLD.queryPath(u, v)` | Get path segments | O(log N) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Build HLD | O(N) | O(N) |
| LCA Query | O(log N) | O(1) |
| Path Query | O(log² N) | O(log N) |

---

## Usage

```cpp
#include "heavy_light_decomposition.cpp"

int n = 7;
vector<vector<int>> adj(n);
// ... build adjacency list

HLD hld(n, adj);
hld.build(0);

int lca = hld.lca(3, 6);
```

---

## Running Tests

```bash
g++ -o test heavy_light_decomposition_test.cpp && ./test
```

---

_Last Updated: December 2025_

