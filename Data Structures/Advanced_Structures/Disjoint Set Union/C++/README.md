# Disjoint Set Union (DSU) -- C++

C++ implementation of the Disjoint Set Union data structure with path compression and union by rank.

---

## API

| Method | Description | Time |
|--------|-------------|------|
| `DSU(n)` | Create n singleton sets (0 to n-1) | O(n) |
| `find(x)` | Root of set containing x (path compression) | O(alpha(n)) |
| `unite(x, y)` | Merge sets; returns true if merged | O(alpha(n)) |
| `connected(x, y)` | Whether x and y share a set | O(alpha(n)) |
| `getComponentCount()` | Number of disjoint sets | O(1) |
| `getComponents()` | Map from root to member vector | O(n) |
| `getSize(x)` | Size of set containing x | O(alpha(n)) |

---

## Usage

```cpp
#include "dsu.cpp"

int main() {
    DSU dsu(6);
    dsu.unite(0, 1);
    dsu.unite(2, 3);
    dsu.unite(3, 4);

    dsu.connected(0, 1);        // true
    dsu.connected(0, 2);        // false
    dsu.getComponentCount();    // 3
    dsu.getSize(2);             // 3
    dsu.getComponents();        // {root: [members], ...}
    return 0;
}
```

---

## Compilation and Testing

```bash
g++ -std=c++17 -o test dsu_test.cpp && ./test
```

---

_Last Updated: April 2026_
