# Bloom Filter

A **Bloom Filter** is a probabilistic data structure that tests whether an element is a member of a set.

---

## Overview

Bloom Filters provide space-efficient membership testing with the following properties:
- **False positives**: Possible (may say item is present when it's not)
- **False negatives**: Never (if item is present, it will always be found)

---

## How It Works

1. Initialize a bit array of size `m`
2. Use `k` hash functions to map items to bit positions
3. To add: Set all `k` bits to 1
4. To check: Return True only if all `k` bits are 1

---

## Operations

| Operation | Description | Time Complexity |
|-----------|-------------|----------------|
| **Add** | Add element to filter | O(k) |
| **Contains** | Check if element might be present | O(k) |

Where `k` is the number of hash functions.

---

## Space Complexity

For `n` elements and error rate `ε`:
- Number of bits: `m = -n * ln(ε) / (ln(2)²)`
- Number of hash functions: `k = m * ln(2) / n`

---

## Advantages

1. ✅ **Space Efficient**: Much smaller than storing all elements
2. ✅ **Fast Operations**: O(k) time complexity
3. ✅ **No False Negatives**: If item exists, it will be found

---

## Disadvantages

1. ❌ **False Positives**: May incorrectly say item exists
2. ❌ **No Deletion**: Cannot remove items (without counting Bloom Filter)
3. ❌ **No Retrieval**: Cannot get the actual items

---

## Applications

1. **Database Systems**: Avoid expensive disk lookups
2. **Web Caching**: Check if URL is in cache
3. **Network Routers**: Packet routing
4. **Spell Checkers**: Check if word is in dictionary
5. **Distributed Systems**: Reduce network traffic

---

## Implementations

- **Python** (`Python/`) - Full implementation with statistics
- **C++** (`C++/`) - Efficient bit manipulation
- **Go** (`Go/`) - Clean implementation

---

## Related Data Structures

- **Hash Set**: Exact membership testing
- **Hash Table**: Key-value storage
- **Counting Bloom Filter**: Supports deletion

