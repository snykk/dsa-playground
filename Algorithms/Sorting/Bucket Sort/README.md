# Bucket Sort

**Bucket Sort** is a sorting algorithm that works by distributing elements of an array into a number of buckets. Each bucket is then sorted individually.

---

## Overview

Bucket Sort works by:
1. Creating buckets for different ranges
2. Distributing elements into appropriate buckets
3. Sorting each bucket individually
4. Concatenating sorted buckets

---

## Algorithm

1. **Create Buckets**: Initialize empty buckets
2. **Distribute**: Place elements into buckets
3. **Sort**: Sort each bucket (using insertion sort or another algorithm)
4. **Concatenate**: Combine sorted buckets

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **Best Case** | O(n + k) | O(n) |
| **Average Case** | O(n + k) | O(n) |
| **Worst Case** | O(n²) | O(n) |

Where k is the number of buckets.

---

## Advantages

1. ✅ **Fast average case**: O(n + k) when uniformly distributed
2. ✅ **Stable**: Can be made stable
3. ✅ **Parallelizable**: Buckets can be sorted in parallel

---

## Disadvantages

1. ❌ **Worst case O(n²)**: When all elements in one bucket
2. ❌ **Extra space**: Requires O(n) additional memory
3. ❌ **Limited range**: Works best with uniformly distributed data

---

## When to Use

- ✅ Uniformly distributed data
- ✅ Floating point numbers in [0.0, 1.0)
- ✅ When data can be partitioned into buckets
- ❌ Non-uniformly distributed data
- ❌ When worst-case performance matters

---

## Implementations

- **Python** (`Python/`) - For floats and integers
- **C++** (`C++/`) - Template-based implementation
- **Go** (`Go/`) - Clean implementation

---

## Related Algorithms

- **Counting Sort**: Similar concept for integers
- **Radix Sort**: Uses bucket concept for digits

