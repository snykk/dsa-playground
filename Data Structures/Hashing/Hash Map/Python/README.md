# Hash Map (Python)

A **Hash Map** is similar to a Hash Table but provides additional features like iteration support and convenience methods.

---

## Overview

Hash Map extends Hash Table functionality with:
- Iterator support for easy iteration
- Additional convenience methods
- Better integration with Python features

---

## Additional Features

### 1. Iteration

```python
map = HashMap()
map.put("apple", 5)
map.put("banana", 10)

for key, value in map:
    print(f"{key}: {value}")
```

### 2. Get or Default

```python
value = map.get_or_default("key", default=0)
```

### 3. Put If Absent

```python
if map.put_if_absent("key", value):
    print("Value inserted")
```

### 4. Update

```python
map.update({"key1": 1, "key2": 2})
```

### 5. Copy

```python
new_map = map.copy()
```

---

## Related Data Structures

- **Hash Table**: Basic hash table implementation
- **Hash Set**: Stores only keys

