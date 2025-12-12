# Ford-Fulkerson Algorithm (C++)

**Ford-Fulkerson Algorithm** finds the maximum flow in a flow network using DFS to find augmenting paths.

---

## Overview

Ford-Fulkerson algorithm is a greedy method for computing maximum flow. It repeatedly finds augmenting paths and pushes flow along them.

---

## Complexity Analysis

| Operation | Time | Space |
|-----------|------|-------|
| **Maximum Flow** | O(E × max_flow) | O(V + E) |

---

## Usage

```cpp
#include "ford_fulkerson.cpp"

std::unordered_map<int, std::unordered_map<int, int>> graph = {
    {0, {{1, 16}, {2, 13}}},
    {1, {{2, 10}, {3, 12}}},
    {2, {{1, 4}, {4, 14}}},
    {3, {{2, 9}, {5, 20}}},
    {4, {{3, 7}, {5, 4}}}
};

int maxFlow = fordFulkerson(graph, 0, 5);
```

---

## Usage

```cpp
#include <unordered_map>
#include <iostream>
#include "ford_fulkerson.cpp"

int main() {
    std::unordered_map<int, std::unordered_map<int, int>> graph = {
        {0, {{1, 16}, {2, 13}}},
        {1, {{2, 10}, {3, 12}}},
        {2, {{1, 4}, {4, 14}}},
        {3, {{2, 9}, {5, 20}}},
        {4, {{3, 7}, {5, 4}}}
    };
    
    int maxFlow = fordFulkerson(graph, 0, 5);
    std::cout << "Maximum flow: " << maxFlow << "\n";  // 23
    
    return 0;
}
```

## Testing

Run tests with:

```bash
# Compile and run tests
g++ -std=c++11 ford_fulkerson_test.cpp -o test && ./test

# Or compile with main example (uncomment main in ford_fulkerson.cpp)
g++ -std=c++11 ford_fulkerson.cpp -o example && ./example
```

## References

- Ford, L. R., & Fulkerson, D. R. (1956). "Maximal flow through a network"
- "Introduction to Algorithms" by CLRS (Chapter 26)

---

_Last Updated: December 2025_

