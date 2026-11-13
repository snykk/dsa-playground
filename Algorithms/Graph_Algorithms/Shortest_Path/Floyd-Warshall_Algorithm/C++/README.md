# Floyd-Warshall Algorithm - C++

**Floyd-Warshall Algorithm** finds shortest paths between all pairs of vertices in a weighted graph.

---

## Overview

Floyd-Warshall implementation in C++ using:
- 2D vector for distance matrix
- `long long` distances with `LLONG_MAX` for infinity

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **All Cases** | O(V³) | O(V²) |

---

## Implementation Details

### Functions

1. **`floydWarshall(graph, numVertices)`**
   - Finds shortest distances between all pairs
   - Returns 2D vector, or an empty vector if a negative cycle exists
   - Time: O(V³), Space: O(V²)

---

## Usage

```cpp
#include "floyd_warshall.cpp"
#include <vector>
#include <iostream>

using namespace std;

int main() {
    vector<vector<pair<int, int>>> graph = {
        {{1, 4}, {2, 2}},
        {{3, 5}},
        {{3, 1}},
        {}
    };
    
    vector<vector<long long>> dist = floydWarshall(graph, 4);
    // dist[0][3] = 3 (shortest distance from 0 to 3)
    
    return 0;
}
```

---

## Compilation

```bash
g++ -std=c++17 floyd_warshall_test.cpp -o floyd_warshall_test
./floyd_warshall_test
```

---

_Last Updated: December 2025_


