# LRU Cache -- Python

Python implementation of the LRU Cache using a hash map and a doubly linked list with sentinel nodes.

---

## API

| Method | Description | Time |
|--------|-------------|------|
| `LRUCache(capacity)` | Create cache with given capacity | O(1) |
| `get(key)` | Return value or -1; marks key as most recently used | O(1) |
| `put(key, value)` | Insert or update; evicts LRU entry if at capacity | O(1) |
| `size` | Property returning current number of entries | O(1) |

---

## Usage

```python
from lru_cache import LRUCache

cache = LRUCache(3)
cache.put(1, 10)
cache.put(2, 20)
cache.put(3, 30)

print(cache.get(1))    # 10
cache.put(4, 40)        # evicts key 2
print(cache.get(2))    # -1
print(cache.size)       # 3
```

---

## Testing

```bash
python lru_cache_test.py
```

---

_Last Updated: April 2026_
