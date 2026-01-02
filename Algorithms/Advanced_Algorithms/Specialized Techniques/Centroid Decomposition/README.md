# Centroid Decomposition

**Centroid Decomposition** is a tree decomposition technique that recursively removes centroids (nodes that split the tree into balanced parts) to create a centroid tree. This decomposition enables efficient solutions to many tree problems.

---

## Overview

A centroid of a tree is a node that, when removed, splits the tree into subtrees each with at most N/2 nodes. Centroid decomposition:
1. Finds the centroid of the current tree
2. Removes the centroid and recursively decomposes subtrees
3. Builds a centroid tree where parent-child relationships represent decomposition

Key properties:
- The centroid tree has height O(log N)
- Each path in original tree crosses O(log N) centroids
- Enables divide-and-conquer on trees

This technique is powerful for problems involving:
- Path queries
- Distance queries
- Tree problems requiring divide-and-conquer

---

## Key Characteristics

1. **Recursive Decomposition**: Recursively removes centroids
2. **Balanced Splits**: Each split creates balanced subtrees
3. **Logarithmic Height**: Centroid tree has O(log N) height
4. **Divide and Conquer**: Enables efficient tree algorithms

---

## Operations

| Operation | Description | Time Complexity |
|-----------|-------------|----------------|
| `dfs_size(u, p)` | Calculate subtree sizes | O(N) |
| `find_centroid(u, p, total)` | Find centroid of subtree | O(N) |
| `decompose(u, p)` | Decompose tree recursively | O(N log N) |
| `query(u, v)` | Query between nodes | O(log N) |
| `update(u, val)` | Update node value | O(log N) |

---

## Implementation Approaches

### 1. Standard Centroid Decomposition
- **Pros**: Simple, handles most tree problems
- **Cons**: O(N log N) construction
- **Use Case**: Path queries, distance queries

### 2. Centroid with Data Structures
- **Pros**: Efficient queries with additional structures
- **Cons**: More complex, more memory
- **Use Case**: Complex tree problems

### 3. Online Centroid Decomposition
- **Pros**: Handles dynamic trees
- **Cons**: Very complex implementation
- **Use Case**: Dynamic tree problems

---

## Applications

1. **Path Queries**: Querying paths in trees
2. **Distance Queries**: Finding distances between nodes
3. **Tree Problems**: Many tree problems benefit from centroid decomposition
4. **Divide and Conquer**: Tree problems requiring divide-and-conquer
5. **Competitive Programming**: Common in advanced tree problems

---

## Example Use Cases

### Building Centroid Tree
```python
tree = [[1, 2], [0, 3, 4], [0], [1], [1]]
cd = CentroidDecomposition(5, tree)
cd.decompose(0, -1)
# Builds centroid tree
```

### Distance Query
```python
distance = cd.query_distance(2, 4)
# Returns distance between nodes 2 and 4
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
| **Construction** | O(N log N) | O(N) |
| **Find Centroid** | O(N) | O(1) |
| **Query** | O(log N) | O(1) |
| **Update** | O(log N) | O(1) |

Where N is number of nodes.

---

## When to Use

- **Tree Problems**: Complex tree problems
- **Path Queries**: When need to query paths
- **Distance Queries**: Finding distances in trees
- **Divide and Conquer**: Tree problems requiring divide-and-conquer

---

## Related Patterns

- **Tree Decomposition**: Similar decomposition techniques
- **Heavy-Light Decomposition**: Alternative tree decomposition
- **Divide and Conquer**: Core technique used

---

## Further Reading

- "Competitive Programming" by Halim & Halim
- "Algorithm Design Manual" by Steven Skiena
- Codeforces: Centroid Decomposition tutorials

---

**Note**: Centroid decomposition is most effective for static trees. The O(N log N) construction time comes from recursively finding centroids. For dynamic trees, consider other approaches. The technique is powerful but requires understanding of tree properties and divide-and-conquer.

---

_Last Updated: December 2025_
