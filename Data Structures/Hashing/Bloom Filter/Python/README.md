# Bloom Filter (Python)

A **Bloom Filter** is a probabilistic data structure that tests whether an element is a member of a set.

---

## Overview

Bloom Filters provide space-efficient membership testing:
- **False positives**: Possible (may say item is present when it's not)
- **False negatives**: Never (if item is present, it will always be found)

---

## Operations

### 1. Add

```python
bf = BloomFilter(100, error_rate=0.01)
bf.add("apple")
bf.add("banana")
```

**Time Complexity**: O(k) where k is number of hash functions

### 2. Contains

```python
if bf.contains("apple"):
    print("Might be present")
if "apple" in bf:
    print("Might be present")
```

**Time Complexity**: O(k)

---

## Applications

1. **Database Systems**: Avoid expensive disk lookups
2. **Web Caching**: Check if URL is in cache
3. **Network Routers**: Packet routing
4. **Spell Checkers**: Check if word is in dictionary

---

## Related Data Structures

- **Hash Set**: Exact membership testing
- **Hash Table**: Key-value storage

