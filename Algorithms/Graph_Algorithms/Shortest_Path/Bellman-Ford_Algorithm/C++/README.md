# Bellman-Ford Algorithm - C++

**Bellman-Ford Algorithm** finds shortest paths from a source vertex to all other vertices in a weighted graph, even with negative edge weights.

---

## Overview

Bellman-Ford implementation in C++ using:
- Edge list representation
- `std::unordered_map` for distances
- `INT_MAX` for infinity

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **All Cases** | O(V * E) | O(V) |

---

## Implementation Details

### Functions

1. **`bellmanFord(edges, numVertices, start)`**
   - Finds shortest distances from start to all vertices
   - Returns `unordered_map<int, int>` or empty map if negative cycle exists
   - Time: O(V * E), Space: O(V)

---

## Usage

```cpp
#include "bellman_ford.cpp"
#include <vector>
#include <iostream>

using namespace std;

int main() {
    vector<Edge> edges = {
        {0, 1, 4},
        {0, 2, 2},
        {1, 3, 5},
        {2, 3, 1}
    };
    
    unordered_map<int, int> distances = bellmanFord(edges, 4, 0);
    // distances: {0: 0, 1: 4, 2: 2, 3: 3}
    
    return 0;
}
```

---

## Compilation

```bash
g++ -std=c++17 bellman_ford.cpp bellman_ford_test.cpp -o bellman_ford_test
./bellman_ford_test
```

---

_Last Updated: December 2025_


