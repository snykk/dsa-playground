# Disjoint Set Union (DSU) -- Python

Python implementation of the Disjoint Set Union data structure with path compression and union by rank.

---

## API

| Method | Description | Time |
|--------|-------------|------|
| `DSU(n)` | Create n singleton sets (0 to n-1) | O(n) |
| `find(x)` | Root of set containing x (path compression) | O(alpha(n)) |
| `union(x, y)` | Merge sets; returns True if merged | O(alpha(n)) |
| `connected(x, y)` | Whether x and y share a set | O(alpha(n)) |
| `get_component_count()` | Number of disjoint sets | O(1) |
| `get_components()` | Dict mapping root to member list | O(n) |
| `get_size(x)` | Size of set containing x | O(alpha(n)) |

---

## Usage

```python
from dsu import DSU

dsu = DSU(6)
dsu.union(0, 1)
dsu.union(2, 3)
dsu.union(3, 4)

print(dsu.connected(0, 1))            # True
print(dsu.connected(0, 2))            # False
print(dsu.get_component_count())      # 3
print(dsu.get_size(2))                # 3
print(dsu.get_components())           # {root: [members], ...}
```

---

## Testing

```bash
python dsu_test.py
```

---

_Last Updated: April 2026_
