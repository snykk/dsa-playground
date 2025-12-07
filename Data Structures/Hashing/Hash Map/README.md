# Hash Map

A **Hash Map** is similar to a Hash Table but provides additional features like iteration support and convenience methods.

---

## Overview

Hash Map extends Hash Table functionality with:
- Iterator support for easy iteration
- Additional convenience methods (getOrDefault, putIfAbsent)
- Better integration with language features

---

## Additional Operations

| Operation | Description | Time Complexity |
|-----------|-------------|----------------|
| **GetOrDefault** | Get value or return default | O(1) average |
| **PutIfAbsent** | Put only if key doesn't exist | O(1) average |
| **Update** | Update with another map | O(n) |
| **Copy** | Create a copy | O(n) |

---

## Implementations

This folder contains implementations in three languages:

- **Python** (`Python/`) - Extends HashTable with iteration and convenience methods
- **C++** (`C++/`) - Template-based extension
- **Go** (`Go/`) - Clean implementation with Go idioms

---

## Related Data Structures

- **Hash Table**: Basic hash table implementation
- **Hash Set**: Stores only keys

