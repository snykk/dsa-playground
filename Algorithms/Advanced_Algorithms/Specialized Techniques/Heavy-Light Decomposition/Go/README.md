# Heavy-Light Decomposition - Go

This folder contains a Go implementation of **Heavy-Light Decomposition (HLD)** for efficient tree path queries.

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
| `HLD.Build(root)` | Build HLD structure | O(N) |
| `HLD.LCA(u, v)` | Find lowest common ancestor | O(log N) |
| `HLD.QueryPath(u, v)` | Get path segments | O(log N) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Build HLD | O(N) | O(N) |
| LCA Query | O(log N) | O(1) |
| Path Query | O(log² N) | O(log N) |

---

## Usage

```go
n := 7
adj := make([][]int, n)
// ... build adjacency list

hld := NewHLD(n, adj)
hld.Build(0)

lca := hld.LCA(3, 6)
```

---

## Running Tests

```bash
go test
```

---

_Last Updated: December 2025_

