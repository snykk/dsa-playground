# DFS (Depth-First Search) - C++

**DFS (Depth-First Search)** is a graph traversal algorithm that explores as far as possible along each branch before backtracking.

---

## Overview

DFS implementation in C++ using:
- `std::stack` for stack operations
- `std::unordered_map` for adjacency list representation
- `std::unordered_set` for visited tracking

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **All Cases** | O(V + E) | O(V) |

---

## Implementation Details

### Functions

1. **`dfsAdjacencyList(graph, start)`**
   - Iterative DFS traversal
   - Returns `vector<int>` of vertices in DFS order
   - Time: O(V + E), Space: O(V)

2. **`dfsWithPath(graph, start, target)`**
   - Finds path from start to target
   - Returns `vector<int>` representing path
   - Time: O(V + E), Space: O(V)

3. **`dfsDetectCycle(graph, directed)`**
   - Detects cycle in graph
   - Works for both directed and undirected graphs
   - Time: O(V + E), Space: O(V)

---

## Usage

```cpp
#include "dfs.cpp"
#include <iostream>
#include <unordered_map>
#include <vector>

using namespace std;

int main() {
    unordered_map<int, vector<int>> graph = {
        {1, {2, 4}},
        {2, {3}},
        {3, {}},
        {4, {}}
    };
    
    // Basic DFS
    vector<int> result = dfsAdjacencyList(graph, 1);
    // result: [1, 4, 2, 3] (order may vary)
    
    // Find path
    vector<int> path = dfsWithPath(graph, 1, 3);
    // path: [1, 2, 3]
    
    // Detect cycle
    bool hasCycle = dfsDetectCycle(graph, false);
    // hasCycle: false
    
    return 0;
}
```

---

## Compilation

```bash
g++ -std=c++17 dfs.cpp dfs_test.cpp -o dfs_test
./dfs_test
```

---

## Important Notes

1. **C++17 required**: Uses lambda functions and other C++17 features
2. **STL containers**: Uses `std::stack`, `std::unordered_map`, `std::unordered_set`
3. **Template support**: Can be easily templated for different vertex types

---

## Testing

```bash
g++ -std=c++17 dfs.cpp dfs_test.cpp -o dfs_test && ./dfs_test
```

---

_Last Updated: December 2025_

