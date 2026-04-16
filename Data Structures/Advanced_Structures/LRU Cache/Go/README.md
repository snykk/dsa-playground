# LRU Cache -- Go

Go implementation of the LRU Cache using a built-in map for O(1) lookup and a manual doubly linked list with sentinel nodes for O(1) reordering.

---

## API

| Method | Description | Time |
|--------|-------------|------|
| `NewLRUCache(capacity)` | Create cache with given capacity | O(1) |
| `Get(key)` | Return value or -1; marks key as most recently used | O(1) |
| `Put(key, value)` | Insert or update; evicts LRU entry if at capacity | O(1) |
| `Size()` | Return current number of entries | O(1) |

---

## Usage

```go
package main

import "fmt"

func main() {
    cache := NewLRUCache(3)
    cache.Put(1, 10)
    cache.Put(2, 20)
    cache.Put(3, 30)

    fmt.Println(cache.Get(1))    // 10
    cache.Put(4, 40)              // evicts key 2
    fmt.Println(cache.Get(2))    // -1
    fmt.Println(cache.Size())    // 3
}
```

---

## Testing

```bash
go test -v ./...
```

---

_Last Updated: April 2026_
