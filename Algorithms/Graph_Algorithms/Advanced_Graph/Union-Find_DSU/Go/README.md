# Union-Find / Disjoint Set Union (DSU) (Go)

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

---

## Algorithm

### Find Operation (with Path Compression)

1. If `parent[x] != x`, recursively find root
2. Set `parent[x] = root` (path compression)
3. Return root

### Union Operation (with Union by Rank)

1. Find roots of both elements
2. If roots are same, return false (already connected)
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
- α(n) = inverse Ackermann function (practically constant)

---

## Implementation Details

### UnionFind Struct

1. **`NewUnionFind(n)`**
   - Initialize for n elements (0 to n-1)
   - Time: O(n), Space: O(n)

2. **`Find(x)`**
   - Find root with path compression
   - Time: O(α(n)) amortized

3. **`Union(x, y)`**
   - Union sets using union by rank
   - Returns true if union occurred, false if already connected
   - Time: O(α(n)) amortized

4. **`Connected(x, y)`**
   - Check if x and y are in same set
   - Time: O(α(n)) amortized

5. **`GetCount()`**
   - Get number of disjoint sets
   - Time: O(1)

### Utility Functions

1. **`UnionFindCycleDetection(edges, n)`**
   - Detect cycle in undirected graph
   - Time: O(E × α(n))

---

## Usage

```go
package main

import "fmt"

func main() {
    uf := NewUnionFind(5)
    uf.Union(0, 1)
    uf.Union(2, 3)
    
    fmt.Println(uf.Connected(0, 1))  // true
    fmt.Println(uf.Connected(0, 2))  // false
    fmt.Println(uf.GetCount())  // 3
    
    // Cycle detection
    edges := [][]int{{0, 1}, {1, 2}, {2, 0}}
    hasCycle := UnionFindCycleDetection(edges, 3)
    fmt.Println(hasCycle)  // true
}
```

---

## Important Notes

1. **Path compression**: Critical optimization for efficiency
2. **Union by rank**: Prevents tree from becoming too tall
3. **Amortized complexity**: Nearly constant time per operation
4. **0-indexed**: Elements typically numbered 0 to n-1
5. **Go slices**: Uses slices for parent and rank arrays

---

## Advantages

1. ✅ **Efficient**: Nearly constant time operations
2. ✅ **Simple**: Easy to understand and implement
3. ✅ **Versatile**: Used in many graph algorithms
4. ✅ **Space efficient**: O(n) space complexity

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
- ❌ Directed graphs (use DFS/BFS)
- ❌ When need to delete elements

---

## Usage

```go
package main

import "fmt"

func main() {
    uf := NewUnionFind(5)
    uf.Union(0, 1)
    uf.Union(2, 3)
    
    fmt.Println(uf.Connected(0, 1))  // true
    fmt.Println(uf.Connected(0, 2))  // false
    fmt.Println(uf.GetCount())  // 3
    
    // Cycle detection
    edges := [][]int{{0, 1}, {1, 2}, {2, 0}}
    hasCycle := UnionFindCycleDetection(edges, 3)
    fmt.Println(hasCycle)  // true
}
```

## Testing

Run tests with:

```bash
# Run tests
go test -v

# Or run the main file to see example usage
go run main.go
```

---

## Related Algorithms

- **Kruskal's Algorithm**: Uses Union-Find for MST
- **DFS/BFS**: Alternative for connected components
- **Path Compression**: Optimization technique

---

## Applications

1. **Kruskal's MST**: Essential for MST algorithm
2. **Cycle Detection**: Detect cycles in undirected graphs
3. **Connected Components**: Find all connected components
4. **Network Connectivity**: Check if nodes are connected

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 21)
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_

