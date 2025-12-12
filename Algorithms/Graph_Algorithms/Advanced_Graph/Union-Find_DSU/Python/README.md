# Union-Find / Disjoint Set Union (DSU) (Python)

**Union-Find (Disjoint Set Union - DSU)** is a data structure that efficiently tracks disjoint sets and supports union and find operations. It's used in many graph algorithms like Kruskal's MST, cycle detection, and connected components.

---

## Overview

Union-Find maintains a collection of disjoint sets and supports:
- **Find**: Determine which set an element belongs to
- **Union**: Merge two sets into one
- **Connected**: Check if two elements are in the same set

**Key Optimizations**:
- **Path Compression**: Flattens tree during find operation
- **Union by Rank**: Always attaches smaller tree to larger tree

**Example**:
- Elements: {0, 1, 2, 3, 4}
- Operations: union(0,1), union(2,3), union(1,2)
- Result: {0,1,2,3} and {4}

---

## Algorithm

### Find Operation (with Path Compression)

1. If `parent[x] != x`, recursively find root
2. Set `parent[x] = root` (path compression)
3. Return root

### Union Operation (with Union by Rank)

1. Find roots of both elements
2. If roots are same, return False (already connected)
3. Attach smaller rank tree to larger rank tree
4. If ranks equal, increment rank of new root
5. Decrement set count

---

## Complexity Analysis

| Operation | Time | Space |
|-----------|------|-------|
| **Find** | O(α(n)) amortized | O(1) |
| **Union** | O(α(n)) amortized | O(1) |
| **Connected** | O(α(n)) amortized | O(1) |
| **Initialization** | O(n) | O(n) |

Where:
- n = number of elements
- α(n) = inverse Ackermann function (practically constant, < 5 for n < 2^65536)

**Note**: With path compression and union by rank, operations are nearly constant time.

---

## Implementation Details

### UnionFind Class

1. **`__init__(n)`**
   - Initialize for n elements (0 to n-1)
   - Time: O(n), Space: O(n)

2. **`find(x)`**
   - Find root with path compression
   - Time: O(α(n)) amortized

3. **`union(x, y)`**
   - Union sets using union by rank
   - Returns True if union occurred, False if already connected
   - Time: O(α(n)) amortized

4. **`connected(x, y)`**
   - Check if x and y are in same set
   - Time: O(α(n)) amortized

5. **`get_count()`**
   - Get number of disjoint sets
   - Time: O(1)

6. **`get_components()`**
   - Get all components as dictionary
   - Time: O(n)

### Utility Functions

1. **`union_find_connected_components(edges, n)`**
   - Find connected components in undirected graph
   - Time: O(E × α(n))

2. **`union_find_cycle_detection(edges, n)`**
   - Detect cycle in undirected graph
   - Time: O(E × α(n))

3. **`union_find_kruskal_mst(edges, n)`**
   - Find MST using Kruskal's algorithm
   - Time: O(E log E + E × α(n))

4. **`union_find_largest_component(edges, n)`**
   - Find largest connected component
   - Time: O(E × α(n))

---

## Usage

```python
from union_find import UnionFind, union_find_cycle_detection

# Basic usage
uf = UnionFind(5)
uf.union(0, 1)
uf.union(2, 3)
print(uf.connected(0, 1))  # True
print(uf.connected(0, 2))  # False
print(uf.get_count())  # 3 sets

# Cycle detection
edges = [(0, 1), (1, 2), (2, 0)]  # Triangle
has_cycle = union_find_cycle_detection(edges, 3)
print(has_cycle)  # True

# Connected components
from union_find import union_find_connected_components
edges = [(0, 1), (1, 2), (3, 4)]
components = union_find_connected_components(edges, 5)
print(components)  # [[0, 1, 2], [3, 4]]

# Kruskal's MST
from union_find import union_find_kruskal_mst
edges = [(0, 1, 4), (0, 2, 8), (1, 2, 2)]
mst = union_find_kruskal_mst(edges, 3)
print(mst)  # [(1, 2, 2), (0, 1, 4)]
```

---

## Important Notes

1. **Path compression**: Critical optimization for efficiency
2. **Union by rank**: Prevents tree from becoming too tall
3. **Amortized complexity**: Nearly constant time per operation
4. **0-indexed**: Elements typically numbered 0 to n-1
5. **Undirected graphs**: Works for undirected graphs

---

## Advantages

1. ✅ **Efficient**: Nearly constant time operations
2. ✅ **Simple**: Easy to understand and implement
3. ✅ **Versatile**: Used in many graph algorithms
4. ✅ **Space efficient**: O(n) space complexity
5. ✅ **Optimized**: Path compression and union by rank

---

## Disadvantages

1. ❌ **No deletion**: Cannot easily delete elements
2. ❌ **No split**: Cannot split sets easily
3. ❌ **Undirected only**: Works for undirected graphs
4. ❌ **Fixed size**: Size determined at initialization

---

## When to Use

- ✅ Kruskal's MST algorithm
- ✅ Cycle detection in undirected graphs
- ✅ Connected components
- ✅ Network connectivity problems
- ✅ Image segmentation
- ❌ Directed graphs (use DFS/BFS)
- ❌ When need to delete elements

---

## Applications

1. **Kruskal's MST**: Essential for MST algorithm
2. **Cycle Detection**: Detect cycles in undirected graphs
3. **Connected Components**: Find all connected components
4. **Network Connectivity**: Check if nodes are connected
5. **Image Segmentation**: Group pixels into regions
6. **Social Networks**: Find friend groups

---

## Usage

```python
from union_find import UnionFind, union_find_cycle_detection

# Basic usage
uf = UnionFind(5)
uf.union(0, 1)
uf.union(2, 3)
print(uf.connected(0, 1))  # True
print(uf.connected(0, 2))  # False
print(uf.get_count())  # 3 sets

# Cycle detection
edges = [(0, 1), (1, 2), (2, 0)]  # Triangle
has_cycle = union_find_cycle_detection(edges, 3)
print(has_cycle)  # True

# Connected components
from union_find import union_find_connected_components
edges = [(0, 1), (1, 2), (3, 4)]
components = union_find_connected_components(edges, 5)
print(components)  # [[0, 1, 2], [3, 4]]

# Kruskal's MST
from union_find import union_find_kruskal_mst
edges = [(0, 1, 4), (0, 2, 8), (1, 2, 2)]
mst = union_find_kruskal_mst(edges, 3)
print(mst)  # [(1, 2, 2), (0, 1, 4)]
```

## Testing

Run tests with:

```bash
# Python
python -m unittest union_find_test.py

# Or run directly
python union_find_test.py

# Or run the main file to see example usage
python union_find.py
```

---

## Related Algorithms

- **Kruskal's Algorithm**: Uses Union-Find for MST
- **DFS/BFS**: Alternative for connected components
- **Path Compression**: Optimization technique
- **Union by Rank**: Optimization technique

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 21)
- "Algorithm Design Manual" by Steven Skiena
- Tarjan, R. E. (1975). "Efficiency of a Good But Not Linear Set Union Algorithm"

---

_Last Updated: December 2025_
