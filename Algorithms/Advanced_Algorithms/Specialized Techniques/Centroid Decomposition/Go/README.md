# Centroid Decomposition - Go

This folder contains a Go implementation of **Centroid Decomposition** for tree problems.

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
| `CentroidDecomposition.Build(root)` | Build centroid tree | O(N log N) |
| `GetParent()` | Get parent array | O(1) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Build Decomposition | O(N log N) | O(N) |
| Get Parent | O(1) | O(N) |

---

## Usage

```go
n := 7
adj := make([][]int, n)
// ... build adjacency list

cd := NewCentroidDecomposition(n, adj)
cd.Build(0)

parent := cd.GetParent()
```

---

## Running Tests

```bash
go test
```

---

_Last Updated: December 2025_

