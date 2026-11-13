# Counting Sort — C++ Implementation

**Counting Sort** tallies how many times each distinct value appears, then produces the sorted output directly from the counts. O(n + k) — linear in input size when the value range `k` is bounded.

For the conceptual overview, stable vs unstable variants, and role as the Radix Sort building block, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `counting_sort.cpp` | `countingSort(const std::vector<int>&, int maxVal)` returning sorted vector |
| `counting_sort_test.cpp` | Assertion tests |

---

## Complexity

| Aspect | Value |
|--------|-------|
| Time | O(n + k) |
| Space | O(n + k) |
| Stable? | Yes (when using prefix-sum variant) |
| Comparison-based? | **No** |

`k` = `maxVal - min + 1`, the size of the value range. Only useful when `k` is O(n) or smaller.

---

## C++-Specific Notes

- **`std::max_element` for range detection**: `*std::max_element(arr.begin(), arr.end())` gives the upper bound. Cheap O(n).
- **`std::vector<int>` for the count array**: zero-initialized, fast indexed access. For very large `k` with sparse values, a `std::unordered_map<int, int>` is more memory-efficient.
- **Prefix-sum variant for stability**: transform the count array into a running total, then walk the input backwards to place each element at `count[value] - 1`. Preserves relative order of equal elements — required for use as a Radix Sort building block.
- **Negative values**: the code counts value `x` at index `x - minVal` (64-bit index math), so negatives need no special case. A `maxVal` smaller than the largest value throws `std::invalid_argument`.

---

## How to Run

```bash
g++ -std=c++17 -O2 -Wall counting_sort_test.cpp -o counting_sort_test
./counting_sort_test
```

---

## Key Takeaways for Learners

1. **Linear time — but only if `k` is bounded.** Sorting 10⁶ integers in the range [0, 100] is ~10⁷ ops. Sorting 10⁶ integers in [0, 2³²] with Counting Sort needs 16 GB of count memory — use Radix Sort instead.
2. **The stable variant is the workhorse of Radix Sort.** Always implement the prefix-sum form, not the naive "decrement count and write" — the latter is unstable.
3. **Not a general-purpose sort.** Counting Sort fails on floats, strings, and any unbounded domain. It's a specialist: integers with small range.
