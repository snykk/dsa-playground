# Hash Map (C++)

A **Hash Map** extends Hash Table with additional convenience methods.

---

## Additional Features

### 1. Get or Default

```cpp
int value = map.getOrDefault("key", 0);
```

### 2. Put If Absent

```cpp
if (map.putIfAbsent("key", value)) {
    // Value was inserted
}
```

---

## Compilation

```bash
g++ -std=c++11 hash_map.cpp hash_map_test.cpp -o hash_map_test
./hash_map_test
```

