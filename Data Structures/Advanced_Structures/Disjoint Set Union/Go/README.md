# Disjoint Set Union (DSU) -- Go

Go implementation of the Disjoint Set Union data structure with path compression and union by rank.

---

## API

| Method | Description | Time |
|--------|-------------|------|
| `NewDSU(n)` | Create n singleton sets (0 to n-1) | O(n) |
| `Find(x)` | Root of set containing x (path compression) | O(alpha(n)) |
| `Union(x, y)` | Merge sets; returns true if merged | O(alpha(n)) |
| `Connected(x, y)` | Whether x and y share a set | O(alpha(n)) |
| `GetComponentCount()` | Number of disjoint sets | O(1) |
| `GetComponents()` | Map from root to member slice | O(n) |
| `GetSize(x)` | Size of set containing x | O(alpha(n)) |

---

## Usage

```go
package main

import "fmt"

func main() {
    dsu := NewDSU(6)
    dsu.Union(0, 1)
    dsu.Union(2, 3)
    dsu.Union(3, 4)

    fmt.Println(dsu.Connected(0, 1))        // true
    fmt.Println(dsu.Connected(0, 2))        // false
    fmt.Println(dsu.GetComponentCount())    // 3
    fmt.Println(dsu.GetSize(2))             // 3
    fmt.Println(dsu.GetComponents())
}
```

---

## Testing

```bash
go test -v ./...
```

---

_Last Updated: April 2026_
