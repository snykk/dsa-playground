# A* Search Algorithm - C++

**A* Search Algorithm** is an informed search algorithm that finds the shortest path using a heuristic function.

---

## Overview

A* implementation in C++ using:
- `std::priority_queue` for efficient minimum extraction
- `std::function` for heuristic
- `std::unordered_map` for graph representation

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **Best Case** | O(b^d) | O(b^d) |

---

## Implementation Details

### Functions

1. **`astar(graph, start, goal, heuristic)`**
   - Finds shortest path from start to goal
   - Returns `pair<int, vector<int>>` of (distance, path)
   - Time: O(b^d), Space: O(b^d)

---

## Usage

```cpp
#include "astar.cpp"
#include <functional>
#include <iostream>

using namespace std;

int main() {
    unordered_map<int, vector<pair<int, int>>> graph = {
        {0, {{1, 4}, {2, 2}}},
        {1, {{3, 5}}},
        {2, {{3, 1}}},
        {3, {}}
    };
    
    function<int(int)> heuristic = [](int node) {
        return node == 3 ? 0 : 1;
    };
    
    auto [distance, path] = astar(graph, 0, 3, heuristic);
    // distance: 3, path: [0, 2, 3]
    
    return 0;
}
```

---

## Compilation

```bash
g++ -std=c++17 astar.cpp astar_test.cpp -o astar_test
./astar_test
```

---

_Last Updated: December 2025_


