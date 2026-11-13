# Two Pointers -- C++ Implementation

Opposite-end and read/write pointer scans. See the [topic README](../README.md) for the idea.

## Files

| File | Contents |
|------|----------|
| `two_pointers.cpp` | Five functions and a demo `main` |
| `two_pointers_test.cpp` | Assert-based tests including empty and tiny inputs (includes the `.cpp`) |

## API

- `vector<int> twoSumSorted(const vector<int>& arr, int target)`: `{left, right}` or an empty vector.
- `vector<vector<int>> threeSum(vector<int>& arr, int target)`: sorts `arr` in place.
- `bool isPalindrome(const string& s)`: ignores non-alphanumeric characters and case (ASCII).
- `int removeDuplicates(vector<int>& arr)`: compacts in place, returns the new length.
- `int containerWithMostWater(const vector<int>& heights)`

## C++-Specific Notes

- `threeSum` takes a non-const reference and reorders the caller's vector.
- `arr.size()` is unsigned: the loop bound is written `i + 2 < size` so vectors with fewer than 3 elements are safe.
- `isalnum` and `tolower` are called on `char`; non-ASCII bytes are not handled.
- The area is an `int`; use `long long` for very large inputs.
- The demo `main` is compiled out when `IS_TEST_BUILD` is defined.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD two_pointers_test.cpp -o tp_test && ./tp_test
```

## Key Takeaways

- Each pointer moves at most n steps, so the scans are O(n).
- Opposite-end pair search needs sorted input.
- Skip duplicates in `three_sum` to avoid repeated triplets.
