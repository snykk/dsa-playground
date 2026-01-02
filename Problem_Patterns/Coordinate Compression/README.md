# Coordinate Compression Pattern

A **Coordinate Compression** is a technique to map large coordinate values to smaller, consecutive indices. This pattern is essential when dealing with sparse coordinate spaces where the actual coordinate values are large but the number of unique coordinates is relatively small.

---

## Overview

Coordinate compression transforms a set of coordinates (which may be large integers or have large gaps) into a compact, consecutive mapping starting from 0. This is particularly useful for:
- Reducing memory usage when coordinates are sparse
- Enabling array-based data structures (segment trees, Fenwick trees)
- Simplifying indexing and range operations
- Working with coordinate-based algorithms

The process involves:
1. Collecting all unique coordinates
2. Sorting them
3. Creating a mapping from original coordinates to compressed indices
4. Optionally decompressing back to original coordinates

---

## Key Characteristics

1. **Space Reduction**: Maps large coordinate space to compact indices
2. **Preserves Order**: Maintains relative ordering of coordinates
3. **Bijective Mapping**: One-to-one correspondence between original and compressed
4. **Reversible**: Can decompress back to original coordinates

---

## Operations

| Operation | Description | Time Complexity |
|-----------|-------------|----------------|
| `compress_coordinates(coords)` | Compress coordinates to 0-indexed mapping | O(n log n) |
| `decompress_coordinates(mapping)` | Decompress mapping back to original | O(n) |
| `compress_2d_coordinates(points)` | Compress 2D coordinates | O(n log n) |

Where `n` is the number of unique coordinates.

---

## Implementation Approaches

### 1. Standard Compression
- **Pros**: Simple, straightforward
- **Cons**: Requires sorting
- **Use Case**: 1D coordinate compression

### 2. 2D Coordinate Compression
- **Pros**: Handles both X and Y coordinates
- **Cons**: More complex, requires two mappings
- **Use Case**: 2D problems, grid compression

### 3. Online Compression
- **Pros**: Can compress as coordinates arrive
- **Cons**: More complex implementation
- **Use Case**: Streaming coordinate data

---

## Applications

1. **Segment Trees**: Enabling segment trees on large coordinate ranges
2. **Fenwick Trees**: Using BIT on compressed coordinates
3. **Sweep Line Algorithms**: Compressing coordinates for efficient processing
4. **Grid Problems**: Compressing sparse grids
5. **Range Queries**: Enabling efficient range operations on large spaces
6. **Discrete Events**: Compressing event coordinates in timeline problems

---

## Example Use Cases

### Basic Compression
```python
coords = [1000, 5, 200, 1000, 5, 50]
mapping = compress_coordinates(coords)
# mapping: {5: 0, 50: 1, 200: 2, 1000: 3}
```

### Decompression
```python
original = decompress_coordinates(mapping)
# original: [5, 50, 200, 1000]
```

### 2D Compression
```python
points = [(1000, 500), (5, 10), (200, 300)]
x_mapping, y_mapping = compress_2d_coordinates(points)
# Compresses both X and Y coordinates separately
```

---

## Implementations

This folder contains implementations in three languages:

- **Python** (`Python/`) - Dictionary and list-based implementation
- **C++** (`C++/`) - Map and set-based implementation
- **Go** (`Go/`) - Map and slice-based implementation

Each implementation includes:
- Complete source code
- Comprehensive test suite
- Detailed README with usage examples

---

## Complexity Summary

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| **Compress** | O(n log n) | O(n) |
| **Decompress** | O(n) | O(n) |
| **2D Compress** | O(n log n) | O(n) |
| **Lookup** | O(1) | O(1) |

Where `n` is the number of unique coordinates.

---

## When to Use

- **Large Coordinate Ranges**: When coordinates span large values but are sparse
- **Array-Based Structures**: When need to use arrays but coordinates are too large
- **Memory Optimization**: When want to reduce memory usage
- **Range Operations**: When need efficient range queries on compressed space

---

## Related Patterns

- **Sorting**: Essential for coordinate compression
- **Hash Maps**: Used for mapping original to compressed
- **Segment Trees**: Often used with compressed coordinates
- **Sweep Line**: Frequently combined with coordinate compression

---

## Further Reading

- "Competitive Programming" by Halim & Halim
- "Algorithm Design Manual" by Steven Skiena
- LeetCode problems: The Skyline Problem, Rectangle Area II

---

**Note**: Coordinate compression preserves the relative ordering of coordinates, making it suitable for algorithms that depend on coordinate ordering. Always ensure uniqueness is handled correctly when compressing.

---

_Last Updated: December 2025_
