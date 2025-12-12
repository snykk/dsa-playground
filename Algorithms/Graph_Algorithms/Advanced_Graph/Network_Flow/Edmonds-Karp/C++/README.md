# Edmonds-Karp Algorithm (C++)

**Edmonds-Karp Algorithm** finds the maximum flow using BFS, guaranteeing polynomial time complexity.

---

## Complexity Analysis

| Operation | Time | Space |
|-----------|------|-------|
| **Maximum Flow** | O(V × E²) | O(V + E) |

---

## Usage

```cpp
#include "edmonds_karp.cpp"

std::unordered_map<int, std::unordered_map<int, int>> graph = {
    {0, {{1, 16}, {2, 13}}},
    {1, {{2, 10}, {3, 12}}},
    {2, {{1, 4}, {4, 14}}},
    {3, {{2, 9}, {5, 20}}},
    {4, {{3, 7}, {5, 4}}}
};

int maxFlow = edmondsKarp(graph, 0, 5);
```

---

## Usage

```cpp
#include <unordered_map>
#include <iostream>
#include "edmonds_karp.cpp"

int main() {
    std::unordered_map<int, std::unordered_map<int, int>> graph = {
        {0, {{1, 16}, {2, 13}}},
        {1, {{2, 10}, {3, 12}}},
        {2, {{1, 4}, {4, 14}}},
        {3, {{2, 9}, {5, 20}}},
        {4, {{3, 7}, {5, 4}}}
    };
    
    int maxFlow = edmondsKarp(graph, 0, 5);
    std::cout << "Maximum flow: " << maxFlow << "\n";  // 23
    
    return 0;
}
```

## Testing

Run tests with:

```bash
# Compile and run tests
g++ -std=c++11 edmonds_karp_test.cpp -o test && ./test

# Or compile with main example (uncomment main in edmonds_karp.cpp)
g++ -std=c++11 edmonds_karp.cpp -o example && ./example
```

## References

- Edmonds, J., & Karp, R. M. (1972). "Theoretical improvements in algorithmic efficiency"
- "Introduction to Algorithms" by CLRS (Chapter 26)

---

_Last Updated: December 2025_

