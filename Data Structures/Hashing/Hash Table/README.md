# Hash Table

A **Hash Table** is a data structure that implements an associative array, mapping keys to values using a hash function.

---

## Overview

Hash Tables provide fast average-case performance for insertion, deletion, and lookup operations. They use a hash function to compute an index into an array of buckets, where the desired value can be found.

---

## Key Characteristics

- **Fast Operations**: O(1) average case for insert, delete, and lookup
- **Collision Handling**: Uses chaining (linked lists) to handle collisions
- **Dynamic Resizing**: Automatically resizes when load factor exceeds threshold
- **Flexible Keys**: Supports various key types (strings, integers, etc.)

---

## Operations

| Operation | Description | Time Complexity (Average) |
|-----------|-------------|---------------------------|
| **Put** | Insert or update key-value pair | O(1) |
| **Get** | Retrieve value for key | O(1) |
| **Remove** | Delete key-value pair | O(1) |
| **Contains** | Check if key exists | O(1) |

---

## Complexity Analysis

| Operation | Average Case | Worst Case | Space Complexity |
|-----------|-------------|------------|------------------|
| Put       | O(1)        | O(n)       | O(n)             |
| Get       | O(1)        | O(n)       | O(n)             |
| Remove    | O(1)        | O(n)       | O(n)             |
| Contains  | O(1)        | O(n)       | O(n)             |

---

## Hash Function

The implementation uses different hash functions based on key type:

- **Integers**: Modulo operation
- **Strings**: Polynomial rolling hash
- **Other types**: Type-specific hash functions

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

## Advantages

1. ✅ **Fast Operations**: O(1) average case
2. ✅ **Flexible Keys**: Supports various key types
3. ✅ **Dynamic**: Automatically resizes
4. ✅ **Simple**: Easy to understand and implement

---

## Disadvantages

1. ❌ **Worst Case O(n)**: Can degrade with many collisions
2. ❌ **Memory Overhead**: Extra space for buckets and chains
3. ❌ **No Ordering**: Keys are not stored in sorted order

---

## Applications

1. **Database Indexing**: Fast key lookups
2. **Caching**: LRU cache, memoization
3. **Symbol Tables**: Compiler implementations
4. **Associative Arrays**: Key-value storage
5. **Set Operations**: When combined with values

---

## Implementations

This folder contains implementations in three languages:

- **Python** (`Python/`) - Object-oriented implementation with dictionary-style access
- **C++** (`C++/`) - Template-based implementation with type safety
- **Go** (`Go/`) - Clean implementation with Go idioms

Each implementation includes:
- Complete source code with all operations
- Comprehensive test suite
- Detailed README with usage examples

---

## Related Data Structures

- **Hash Map**: Similar structure with additional features
- **Hash Set**: Stores only keys (no values)
- **Dictionary**: Language-specific hash table implementations

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 11)
- "Data Structures and Algorithms" by Aho, Hopcroft, Ullman

