# Hash Table (Python)

A **Hash Table** is a data structure that implements an associative array, mapping keys to values using a hash function.

---

## Overview

Hash Tables provide fast average-case performance for insertion, deletion, and lookup operations. They use a hash function to compute an index into an array of buckets, where the desired value can be found.

---

## Key Features

- **Fast Operations**: O(1) average case for insert, delete, and lookup
- **Collision Handling**: Uses chaining (linked lists) to handle collisions
- **Dynamic Resizing**: Automatically resizes when load factor exceeds threshold
- **Flexible Keys**: Supports various key types (strings, integers, etc.)

---

## Operations

### 1. Put (Insert/Update)

Insert or update a key-value pair.

```python
table = HashTable()
table.put("apple", 5)
table.put("banana", 10)
table["cherry"] = 15  # Dictionary-style
```

**Time Complexity**: O(1) average, O(n) worst case

### 2. Get

Retrieve value for a key.

```python
value = table.get("apple")  # Returns 5
value = table.get("nonexistent", default=0)  # Returns 0
value = table["apple"]  # Dictionary-style
```

**Time Complexity**: O(1) average, O(n) worst case

### 3. Remove

Remove a key-value pair.

```python
table.remove("apple")
del table["banana"]  # Dictionary-style
```

**Time Complexity**: O(1) average, O(n) worst case

### 4. Contains

Check if key exists.

```python
if table.contains("apple"):
    print("Found!")
if "apple" in table:  # Using 'in' operator
    print("Found!")
```

**Time Complexity**: O(1) average, O(n) worst case

---

## Complexity Analysis

| Operation | Average Case | Worst Case | Space Complexity |
|-----------|-------------|------------|------------------|
| Put       | O(1)        | O(n)       | O(n)             |
| Get       | O(1)        | O(n)       | O(n)             |
| Remove    | O(1)        | O(n)       | O(n)             |
| Contains  | O(1)        | O(n)       | O(n)             |
| Keys      | O(n)        | O(n)       | O(n)             |
| Values    | O(n)        | O(n)       | O(n)             |

---

## Hash Function

The implementation uses different hash functions based on key type:

- **Integers**: Modulo operation
- **Strings**: Polynomial rolling hash
- **Other types**: Built-in `hash()` function

---

## Collision Handling

This implementation uses **chaining** to handle collisions:
- Each bucket contains a list of key-value pairs
- When multiple keys hash to the same bucket, they are stored in a list
- Lookup requires searching the list in the bucket

---

## Resizing

The hash table automatically resizes when the load factor (size/capacity) exceeds 0.75:
- Capacity doubles
- All existing key-value pairs are rehashed
- Maintains O(1) average performance

---

## Example Usage

```python
from hash_table import HashTable

# Create hash table
table = HashTable()

# Insert values
table.put("apple", 5)
table.put("banana", 10)
table.put("cherry", 15)

# Access values
print(table.get("apple"))  # 5
print(table["banana"])     # 10

# Check existence
if "apple" in table:
    print("Apple found!")

# Remove
table.remove("apple")
del table["banana"]

# Iterate
for key in table.keys():
    print(f"{key}: {table[key]}")
```

---

## Testing

Run the test suite:

```bash
python hash_table_test.py
```

---

## Related Data Structures

- **Hash Map**: Similar structure with additional features
- **Hash Set**: Stores only keys (no values)
- **Dictionary**: Python's built-in hash table implementation

