# Interpolation Search (C++)

**Interpolation Search** is an improved variant of Binary Search for uniformly distributed sorted arrays.

---

## Overview

Interpolation Search estimates the position of the target value based on the values at the boundaries. It works best when the data is uniformly distributed, achieving O(log log n) average time complexity.

---

## Algorithm

1. Check if target is within array bounds
2. Calculate position using interpolation formula
3. Compare target with element at calculated position
4. Eliminate search space based on comparison
5. Repeat until found or exhausted

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **Best Case** | O(1) | O(1) |
| **Average Case** | O(log log n) | O(1) |
| **Worst Case** | O(n) | O(1) |

---

## Usage

```cpp
#include <vector>
#include "interpolation_search.cpp"

std::vector<int> arr = {10, 20, 30, 40, 50, 60, 70, 80, 90, 100};
int index = interpolationSearch(arr, 50);
// index = 4
```

---

## Compilation

```bash
g++ -std=c++11 interpolation_search.cpp interpolation_search_test.cpp -o test
./test
```

---

## When to Use

- ✅ Uniformly distributed sorted arrays
- ✅ Large datasets with uniform distribution
- ❌ Non-uniformly distributed data (use Binary Search instead)

---

## Related Algorithms

- **Binary Search**: O(log n) for any sorted array
- **Linear Search**: O(n) for unsorted arrays

---

## References

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_

