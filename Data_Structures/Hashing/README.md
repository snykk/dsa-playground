# Hashing

This folder contains implementations of **Hashing Data Structures** - data structures that use hash functions to provide fast average-case O(1) operations.

---

## Overview

Hashing is a technique that maps data of arbitrary size to fixed-size values (hash codes). Hash-based data structures use these hash codes to organize and access data efficiently.

---

## Data Structures

### 1. Hash Table
- Basic hash table (hash map) with key-value pairs
- Collision handling using chaining
- Dynamic resizing
- Map helpers: get with default, insert if absent, bulk update, copy, iteration

### 2. Hash Set
- Stores unique elements only (no values)
- Fast membership testing
- Based on hash table internally

### 3. Collision Handling
- **Chaining**: Store colliding elements in linked lists
- **Open Addressing**: Find next available slot using probing
  - Linear Probing
  - Quadratic Probing
  - Double Hashing

### 4. Bloom Filter
- Probabilistic data structure for membership testing
- Space-efficient with configurable error rate
- No false negatives, possible false positives

---

## Common Operations

| Operation | Hash Table | Hash Set | Bloom Filter |
|-----------|-----------|----------|--------------|
| Insert    | O(1)      | O(1)     | O(k)         |
| Search    | O(1)      | O(1)     | O(k)         |
| Delete    | O(1)      | O(1)     | Not supported |
| Space     | O(n)      | O(n)     | O(m)         |

Where:
- `n` = number of elements
- `m` = number of bits in Bloom Filter
- `k` = number of hash functions in Bloom Filter

---

## Hash Functions

Different hash functions are used based on key type:
- **Integers**: Modulo operation
- **Strings**: Polynomial rolling hash
- **Other types**: Type-specific hash functions

---

## Collision Handling Techniques

### Chaining
- Each bucket contains a list of elements
- Simple to implement
- No clustering issues

### Open Addressing
- Find next available slot when collision occurs
- Better cache performance
- Requires careful load factor management

---

## Implementations

Each data structure is implemented in three languages:
- **Python** (`Python/`) - Object-oriented with full features
- **C++** (`C++/`) - Template-based with type safety
- **Go** (`Go/`) - Clean implementation with Go idioms

All implementations include:
- Complete source code
- Comprehensive test suites
- Detailed README documentation

---

## Applications

1. **Database Indexing**: Fast key lookups
2. **Caching**: LRU cache, memoization
3. **Symbol Tables**: Compiler implementations
4. **Set Operations**: Unique element storage
5. **Network Routing**: Packet routing tables
6. **Web Caching**: URL cache checking

---

## Learning Path

1. **Hash Table**: Start with basic hash table
2. **Collision Handling**: Understand chaining and open addressing
3. **Hash Set**: Learn the set variation
4. **Bloom Filter**: Explore probabilistic structures

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 11)
- "Data Structures and Algorithms" by Aho, Hopcroft, Ullman

