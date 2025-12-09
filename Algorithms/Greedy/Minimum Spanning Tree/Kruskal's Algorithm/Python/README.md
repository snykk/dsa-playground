# Kruskal's Algorithm (Python)

**Kruskal's Algorithm** finds Minimum Spanning Tree (MST) by adding edges in increasing order of weight, using Union-Find to detect cycles.

---

## Overview

Kruskal's algorithm is a greedy algorithm that finds the minimum spanning tree of a connected, undirected graph. It works by:
1. Sorting all edges by weight
2. Adding edges in order (lightest first)
3. Skipping edges that would create cycles
4. Stopping when V-1 edges are added (MST complete)

**Key Insight**: Always add the minimum weight edge that doesn't create a cycle.

---

## Algorithm

1. **Sort edges**: Sort all edges by weight (ascending)
2. **Initialize Union-Find**: Create disjoint set for each vertex
3. **Process edges** (greedy):
   - For each edge (u, v, weight) in sorted order:
     - If u and v are in different sets (no cycle):
       - Add edge to MST
       - Union the sets containing u and v
     - Otherwise, skip edge (would create cycle)
4. **Stop**: When MST has V-1 edges (tree complete)

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **All Cases** | O(E log E) or O(E log V) | O(V) |

**Note**: 
- O(E log E) for sorting edges
- O(E log V) with path compression and union by rank
- O(V) for Union-Find structure

---

## Implementation Details

### Classes

1. **`UnionFind`**
   - Disjoint Set Union data structure
   - Methods: `find(x)` with path compression, `union(x, y)` with union by rank
   - Used for efficient cycle detection

### Functions

1. **`kruskal_mst(edges, num_vertices)`**
   - Finds MST using Kruskal's algorithm
   - Returns (mst_edges, total_weight)
   - Time: O(E log E), Space: O(V)

2. **`kruskal_mst_with_details(edges, num_vertices)`**
   - Returns detailed information
   - Includes connected status and edge count
   - Useful for debugging and analysis

---

## Greedy Choice

**Always add minimum weight edge that doesn't create cycle** - this greedy choice guarantees MST.

**Why it works**:
- If an edge is the minimum weight edge connecting two components, it must be in MST
- Adding it doesn't create cycle (connects different components)
- This holds at every step, making greedy optimal

---

## Usage

```python
from kruskal import kruskal_mst, kruskal_mst_with_details

# Basic usage
edges = [
    (0, 1, 10),
    (0, 2, 6),
    (0, 3, 5),
    (1, 3, 15),
    (2, 3, 4)
]
mst, weight = kruskal_mst(edges, 4)
print(f"MST edges: {mst}")  # [(2, 3, 4), (0, 3, 5), (0, 2, 6)]
print(f"Total weight: {weight}")  # 15

# With details
details = kruskal_mst_with_details(edges, 4)
print(f"Connected: {details['is_connected']}")  # True
print(f"Edges in MST: {details['num_edges_in_mst']}")  # 3
```

---

## Important Notes

1. **Cycle Detection**: Union-Find efficiently detects cycles in O(α(V)) amortized time
2. **Connected Graph**: Algorithm assumes connected graph (MST has V-1 edges)
3. **Undirected**: Works on undirected graphs
4. **Edge Cases**: Handle empty graph, single vertex, disconnected graph

---

## Advantages

1. ✅ **Optimal**: Guarantees minimum spanning tree
2. ✅ **Efficient**: O(E log E) time complexity
3. ✅ **Simple**: Easy to understand and implement
4. ✅ **Sparse graphs**: Works well for sparse graphs (E ≈ V)

---

## Disadvantages

1. ❌ **Sorting overhead**: Must sort all edges
2. ❌ **Dense graphs**: For dense graphs (E ≈ V²), Prim's may be better
3. ❌ **Union-Find complexity**: Requires understanding of Union-Find

---

## When to Use

- ✅ Sparse graphs (few edges)
- ✅ When all edges are known upfront
- ✅ When edge list representation is natural
- ❌ Dense graphs (Prim's may be better)
- ❌ When graph changes dynamically

---

## Comparison with Prim's

| Aspect | Kruskal's | Prim's |
|--------|-----------|--------|
| **Graph Type** | Works on edge list | Works on adjacency list/matrix |
| **Best For** | Sparse graphs | Dense graphs |
| **Start** | No starting vertex needed | Requires starting vertex |
| **Data Structure** | Union-Find | Priority Queue |

---

## Testing

```bash
python kruskal_test.py
```

---

## Related Algorithms

- **Prim's Algorithm**: Alternative MST algorithm
- **Union-Find**: Essential data structure for Kruskal's
- **Borůvka's Algorithm**: Another MST algorithm

---

## Applications

1. **Network Design**: Design networks with minimum cost
2. **Cluster Analysis**: Find clusters in data
3. **Image Segmentation**: Segment images into regions
4. **Circuit Design**: Design circuits with minimum wire

---

## References

- Kruskal, J. B. (1956). "On the shortest spanning subtree of a graph"
- "Introduction to Algorithms" by CLRS (Chapter 23)
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_

