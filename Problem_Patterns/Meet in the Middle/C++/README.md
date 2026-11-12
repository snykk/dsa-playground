# Meet in the Middle -- C++ Implementation

Exact subset-sum existence using meet in the middle with hash sets.

## Files

| File | Description |
|------|-------------|
| `meet_in_middle.cpp` | `subsetSumMeetInMiddle` and a demo `main` (disabled when `IS_TEST_BUILD` is defined) |
| `meet_in_middle_test.cpp` | Assertion-based tests (2 functions); it includes the `.cpp` file |

## API

- `bool subsetSumMeetInMiddle(const vector<int>& arr, int target)`: true if some subset of `arr` (the empty subset counts) sums to exactly `target`. Negative values are allowed. O(2^(n/2)) average time and space.

## C++-Specific Notes

- Sums are `int`, so large values or long arrays can overflow; use `long long` for big inputs.
- Each half is built by repeatedly inserting `s + arr[i]` into an `unordered_set`, which also removes duplicate sums.
- Unlike the Python version, this checks existence of an exact sum; it does not find the closest sum below a target.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD meet_in_middle_test.cpp -o meet_in_middle_test
./meet_in_middle_test
```

## Key Takeaways

- A hash set on one half answers "is there a partner for this sum" in O(1) on average.
- The test file includes the `.cpp`, so build it alone with `-DIS_TEST_BUILD`.
