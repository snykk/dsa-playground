# Heavy-Light Decomposition

**Heavy-Light Decomposition (HLD)** is a technique for decomposing a tree into chains to enable efficient path queries and updates. It transforms tree path operations into segment tree operations, achieving O(log² N) per query.

---

## Overview

Heavy-Light Decomposition decomposes a tree into a set of disjoint paths (chains) such that:
- Each node belongs to exactly one chain
- Paths from root to any node traverse at most O(log N) chains
- Each chain is a contiguous segment suitable for segment trees

The decomposition works by:
1. Identifying "heavy" edges (edges to largest subtree)
2. Forming chains along heavy edges
3. Building segment trees on chains
4. Answering path queries by combining chain queries

This enables efficient path queries, path updates, and LCA (Lowest Common Ancestor) operations.

---

## Key Characteristics

1. **Tree Decomposition**: Breaks tree into chains
2. **Heavy Edges**: Edges to largest child subtree
3. **Segment Trees**: Uses segment trees on chains
4. **Logarithmic Chains**: At most O(log N) chains per path

---

## Operations

| Operation | Description | Time Complexity |
|-----------|-------------|----------------|
| `dfs_size(u, p)` | Calculate subtree sizes | O(N) |
| `decompose(u, h)` | Decompose tree into chains | O(N) |
| `query_path(u, v)` | Query path from u to v | O(log² N) |
| `update_path(u, v, val)` | Update path from u to v | O(log² N) |
| `lca(u, v)` | Find lowest common ancestor | O(log N) |

---

## Implementation Approaches

### 1. Standard HLD
- **Pros**: Handles path queries efficiently
- **Cons**: O(log² N) per query
- **Use Case**: Path sum, path maximum, path updates

### 2. HLD with Lazy Propagation
- **Pros**: Efficient range updates on chains
- **Cons**: More complex implementation
- **Use Case**: Range updates on paths

### 3. HLD with Fenwick Trees
- **Pros**: Simpler than segment trees
- **Cons**: Limited to range sum queries
- **Use Case**: Path sum queries only

---

## Applications

1. **Path Queries**: Sum, maximum, minimum on paths
2. **Path Updates**: Updating values on paths
3. **Tree Problems**: Many tree problems benefit from HLD
4. **LCA Queries**: Finding lowest common ancestor
5. **Competitive Programming**: Common in tree problems

---

## Example Use Cases

### Path Sum Query
```python
tree = [[1, 2], [0, 3, 4], [0], [1], [1]]
hld = HLD(5, tree)
hld.decompose(0, 0)
result = hld.query_path(2, 4)
# Returns sum of values on path from 2 to 4
```

### Path Update
```python
hld.update_path(1, 3, 5)
# Adds 5 to all nodes on path from 1 to 3
```

---

## Implementations

This folder contains implementations in three languages:

- **Python** (`Python/`) - List-based implementation
- **C++** (`C++/`) - Vector-based implementation
- **Go** (`Go/`) - Slice-based implementation

Each implementation includes:
- Complete source code
- Comprehensive test suite
- Detailed README with usage examples

---

## Complexity Summary

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| **Construction** | O(N) | O(N) |
| **Path Query** | O(log² N) | O(1) |
| **Path Update** | O(log² N) | O(1) |
| **LCA** | O(log N) | O(1) |

Where N is number of nodes.

---

## When to Use

- **Path Queries**: When need to query tree paths
- **Path Updates**: When need to update tree paths
- **Tree Problems**: Complex tree problems
- **Competitive Programming**: Tree problems in contests

---

## Related Patterns

- **Segment Trees**: Used on chains
- **Tree Traversal**: DFS for decomposition
- **LCA Algorithms**: Alternative LCA methods

---

## Further Reading

- "Competitive Programming" by Halim & Halim
- "Algorithm Design Manual" by Steven Skiena
- Codeforces: Heavy-Light Decomposition tutorials

---

**Note**: HLD is most effective for path queries and updates. For subtree queries, consider using Euler Tour or DFS order with segment trees. The O(log² N) complexity comes from O(log N) chains × O(log N) segment tree query per chain.

---

_Last Updated: December 2025_
