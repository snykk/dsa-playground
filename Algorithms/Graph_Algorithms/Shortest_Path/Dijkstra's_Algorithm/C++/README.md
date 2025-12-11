# Dijkstra's Algorithm - C++

**Dijkstra's Algorithm** finds shortest paths from a source vertex to all other vertices in a weighted graph with non-negative edge weights.

---

## Overview

Dijkstra's algorithm implementation in C++ using:
- `std::priority_queue` for efficient minimum extraction
- `std::unordered_map` for graph representation
- `std::unordered_set` for visited tracking

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **Binary Heap** | O((V + E) log V) | O(V) |

---

## Implementation Details

### Functions

1. **`dijkstra(graph, start)`**
   - Finds shortest distances from start to all vertices
   - Returns `unordered_map<int, int>` mapping vertex to distance
   - Time: O((V + E) log V), Space: O(V)

2. **`dijkstraWithPath(graph, start, target)`**
   - Finds shortest path from start to target
   - Returns `pair<int, vector<int>>` of (distance, path)
   - Time: O((V + E) log V), Space: O(V)

---

## Usage

```cpp
#include "dijkstra.cpp"
#include <iostream>
#include <unordered_map>
#include <vector>

using namespace std;

int main() {
    unordered_map<int, vector<pair<int, int>>> graph = {
        {1, {{2, 4}, {3, 2}}},
        {2, {{4, 5}}},
        {3, {{4, 1}}},
        {4, {}}
    };
    
    // Find shortest distances
    unordered_map<int, int> distances = dijkstra(graph, 1);
    // distances: {1: 0, 2: 4, 3: 2, 4: 3}
    
    // Find shortest path
    auto [distance, path] = dijkstraWithPath(graph, 1, 4);
    // distance: 3, path: [1, 3, 4]
    
    return 0;
}
```

---

## Compilation

```bash
g++ -std=c++17 dijkstra.cpp dijkstra_test.cpp -o dijkstra_test
./dijkstra_test
```

---

## Important Notes

1. **C++17 required**: Uses structured bindings
2. **Priority queue**: Uses `std::priority_queue` with `greater` comparator
3. **INT_MAX**: Uses `INT_MAX` from `<climits>` for infinity

---

## Testing

```bash
g++ -std=c++17 dijkstra.cpp dijkstra_test.cpp -o dijkstra_test && ./dijkstra_test
```

---

_Last Updated: December 2025_


