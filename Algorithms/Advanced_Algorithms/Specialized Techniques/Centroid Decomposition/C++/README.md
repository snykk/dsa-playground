# Centroid Decomposition - C++

This folder contains a C++ implementation of **Centroid Decomposition** for tree problems.

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
| `getParent()` | Get parent array | O(1) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Build Decomposition | O(N log N) | O(N) |
| Get Parent | O(1) | O(N) |

---

## Usage

```cpp
#include "centroid_decomposition.cpp"

int n = 7;
vector<vector<int>> adj(n);
// ... build adjacency list

CentroidDecomposition cd(n, adj);
cd.build(0);

vector<int> parent = cd.getParent();
```

---

## Running Tests

```bash
g++ -o test centroid_decomposition_test.cpp && ./test
```

---

_Last Updated: December 2025_

