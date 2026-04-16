# LRU Cache -- C++

C++ implementation of the LRU Cache using `std::unordered_map` for O(1) lookup and `std::list` as the doubly linked list for O(1) reordering.

---

## API

| Method | Description | Time |
|--------|-------------|------|
| `LRUCache(capacity)` | Create cache with given capacity | O(1) |
| `get(key)` | Return value or -1; marks key as most recently used | O(1) |
| `put(key, value)` | Insert or update; evicts LRU entry if at capacity | O(1) |
| `size()` | Return current number of entries | O(1) |

---

## Usage

```cpp
#include "lru_cache.cpp"

int main() {
    LRUCache cache(3);
    cache.put(1, 10);
    cache.put(2, 20);
    cache.put(3, 30);

    cache.get(1);        // 10
    cache.put(4, 40);    // evicts key 2
    cache.get(2);        // -1
    cache.size();        // 3
    return 0;
}
```

---

## Compilation and Testing

```bash
g++ -std=c++17 -o test lru_cache_test.cpp && ./test
```

---

_Last Updated: April 2026_
