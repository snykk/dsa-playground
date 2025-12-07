# Counting Sort (C++)

**Counting Sort** sorts elements by counting occurrences.

---

## Usage

```cpp
std::vector<int> arr = {4, 2, 2, 8, 3, 3, 1};
int maxVal = *std::max_element(arr.begin(), arr.end());
std::vector<int> sorted = countingSort(arr, maxVal);
```

---

## Complexity

- **Time**: O(n + k) where k is the range
- **Space**: O(k)

