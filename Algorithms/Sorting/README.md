# Sorting Algorithms

A comprehensive collection of sorting algorithm implementations in Python, C++, and Go.

---

## Overview

This folder contains implementations of various sorting algorithms, each with:
- Complete source code
- Comprehensive test suites
- Detailed documentation
- Complexity analysis

---

## Algorithms

### Comparison-Based Algorithms

1. **Bubble Sort** - O(n²) simple algorithm
2. **Insertion Sort** - O(n²) efficient for small arrays
3. **Selection Sort** - O(n²) simple selection-based
4. **Merge Sort** - O(n log n) divide and conquer
5. **Quick Sort** - O(n log n) average, O(n²) worst case
6. **Heap Sort** - O(n log n) heap-based

### Non-Comparison-Based Algorithms

7. **Counting Sort** - O(n + k) for small range integers
8. **Radix Sort** - O(d × (n + k)) digit-based sorting
9. **Bucket Sort** - O(n + k) average for uniformly distributed data

---

## Complexity Comparison

| Algorithm | Best | Average | Worst | Space | Stable |
|-----------|------|---------|-------|-------|--------|
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Selection Sort | O(n²) | O(n²) | O(n²) | O(1) | No |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) | No |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) | O(1) | No |
| Counting Sort | O(n + k) | O(n + k) | O(n + k) | O(n + k) | Yes |
| Radix Sort | O(d × n) | O(d × n) | O(d × n) | O(n + k) | Yes |
| Bucket Sort | O(n + k) | O(n + k) | O(n²) | O(n) | Yes, if each bucket is sorted stably |

---

## When to Use Which?

- **Small arrays (< 50)**: Insertion Sort
- **General purpose**: Quick Sort or Merge Sort
- **Worst-case guarantee**: Heap Sort or Merge Sort
- **Stability required**: Merge Sort, Insertion Sort
- **Small range integers**: Counting Sort
- **Fixed-digit integers**: Radix Sort
- **Uniformly distributed**: Bucket Sort

---

## Implementations

Each algorithm is implemented in:
- **Python** - Readable and educational
- **C++** - High performance
- **Go** - Modern and efficient

---

## Testing

All implementations include comprehensive test suites. Run tests with:

```bash
# Python
python algorithm_name_test.py

# C++
g++ -std=c++17 algorithm_name_test.cpp -o test   # the test file includes the implementation
./test

# Go
go test
```

---

## References

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena

