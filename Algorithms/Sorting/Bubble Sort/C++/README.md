# Bubble Sort (C++)

**Bubble Sort** is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.

---

## Usage

```cpp
#include "bubble_sort.cpp"
#include <vector>

std::vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
bubbleSort(arr);
```

---

## Compilation

```bash
g++ -std=c++11 bubble_sort.cpp bubble_sort_test.cpp -o bubble_sort_test
./bubble_sort_test
```

---

## Complexity

- **Time**: O(n²) worst/average, O(n) best
- **Space**: O(1)

