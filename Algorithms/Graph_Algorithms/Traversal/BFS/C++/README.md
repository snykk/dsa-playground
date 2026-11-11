# BFS (Breadth-First Search) - C++

**BFS (Breadth-First Search)** is a graph traversal algorithm that explores all vertices at the current depth level before moving to vertices at the next depth level.

---

## Overview

BFS is a fundamental graph traversal algorithm implemented using:
- `std::queue` for efficient queue operations
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

1. **`bfsAdjacencyList(graph, start)`**
   - Basic BFS traversal
   - Returns `vector<int>` of vertices in BFS order
   - Time: O(V + E), Space: O(V)

2. **`bfsWithPath(graph, start, target)`**
   - Finds shortest path from start to target
   - Returns `vector<int>` representing path
   - Time: O(V + E), Space: O(V)

3. **`bfsLevelOrder(graph, start)`**
   - Returns vertices grouped by level
   - Returns `vector<vector<int>>` where each inner vector is a level
   - Time: O(V + E), Space: O(V)

4. **`bfsShortestDistance(graph, start)`**
   - Finds shortest distance to all vertices
   - Returns `unordered_map<int, int>` mapping vertex to distance
   - Time: O(V + E), Space: O(V)

---

## Usage

```cpp
#include "bfs.cpp"
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
    
    // Basic BFS
    vector<int> result = bfsAdjacencyList(graph, 1);
    // result: [1, 2, 4, 3]
    
    // Find shortest path
    vector<int> path = bfsWithPath(graph, 1, 3);
    // path: [1, 2, 3]
    
    // Level order
    vector<vector<int>> levels = bfsLevelOrder(graph, 1);
    // levels: [[1], [2, 4], [3]]
    
    // Shortest distances
    unordered_map<int, int> distances = bfsShortestDistance(graph, 1);
    // distances: {1: 0, 2: 1, 4: 1, 3: 2}
    
    return 0;
}
```

---

## Compilation

```bash
g++ -std=c++17 bfs_test.cpp -o bfs_test
./bfs_test
```

---

## Important Notes

1. **C++17 required**: Uses structured bindings and other C++17 features
2. **STL containers**: Uses `std::queue`, `std::unordered_map`, `std::unordered_set`
3. **Template support**: Can be easily templated for different vertex types

---

## Testing

```bash
g++ -std=c++17 bfs_test.cpp -o bfs_test && ./bfs_test
```

---

_Last Updated: December 2025_

