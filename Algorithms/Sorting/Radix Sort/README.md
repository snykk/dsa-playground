# Radix Sort

**Radix Sort** is a non-comparative sorting algorithm that sorts numbers by processing individual digits. It uses counting sort as a subroutine.

---

## Overview

Radix Sort works by:
1. Processing digits from least significant to most significant (LSD)
2. Using counting sort for each digit position
3. Combining results to get sorted array

---

## Algorithm

1. **Find max**: Determine number of digits
2. **For each digit**: Apply counting sort
3. **Combine**: Results are sorted

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **Best Case** | O(d × (n + k)) | O(n + k) |
| **Average Case** | O(d × (n + k)) | O(n + k) |
| **Worst Case** | O(d × (n + k)) | O(n + k) |

Where d is number of digits, k is base (usually 10).

---

## Advantages

1. ✅ **Fast**: O(d × n) when d is small
2. ✅ **Stable**: Maintains relative order
3. ✅ **Linear**: Can be faster than O(n log n) for integers

---

## Disadvantages

1. ❌ **Limited**: Only works with integers
2. ❌ **Extra space**: Requires O(n + k) memory
3. ❌ **Digit-based**: Performance depends on number of digits

---

## When to Use

- ✅ Sorting integers with fixed number of digits
- ✅ When range is large but digits are few
- ✅ Stable sorting of integers
- ❌ Floating point numbers
- ❌ Variable-length integers

---

## Implementations

- **Python** (`Python/`) - LSD (Least Significant Digit) version
- **C++** (`C++/`) - Template-based implementation
- **Go** (`Go/`) - Clean implementation

---

## Related Algorithms

- **Counting Sort**: Used as subroutine in Radix Sort
- **Bucket Sort**: Similar non-comparative approach

