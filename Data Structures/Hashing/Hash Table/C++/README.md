# Hash Table (C++)

A **Hash Table** is a data structure that implements an associative array, mapping keys to values using a hash function.

---

## Operations

### 1. Put

```cpp
HashTable<std::string, int> table;
table.put("apple", 5);
table.put("banana", 10);
```

**Time Complexity**: O(1) average

### 2. Get

```cpp
int* value = table.get("apple");
if (value != nullptr) {
    std::cout << *value << std::endl;
}
```

**Time Complexity**: O(1) average

### 3. Remove

```cpp
bool removed = table.remove("apple");
```

**Time Complexity**: O(1) average

---

## Compilation

```bash
g++ -std=c++11 hash_table.cpp hash_table_test.cpp -o hash_table_test
./hash_table_test
```

---

## Related Data Structures

- **Hash Map**: Similar structure with additional features
- **Hash Set**: Stores only keys

