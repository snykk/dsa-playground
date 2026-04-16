# Meet in the Middle (C++)

Split the input in half, enumerate all possibilities for each half independently, then combine results to solve the full problem in reduced time.

## Files

| File | Description |
|------|-------------|
| `meet_in_middle.cpp` | Subset-sum implementation using the meet-in-the-middle technique |
| `meet_in_middle_test.cpp` | Test cases for subset sum |

## How to Run

```bash
# Run the demo
g++ -std=c++17 -o mitm meet_in_middle.cpp
./mitm

# Run tests
g++ -std=c++17 -DTESTING -o test meet_in_middle_test.cpp
./test
```

## Key Functions

| Function | Description | Time Complexity |
|----------|-------------|-----------------|
| `subsetSumMeetInMiddle` | Determines whether any subset of the array sums to the target value | O(2^(n/2)) |

## Complexity

| Aspect | Complexity |
|--------|-----------|
| Time | O(2^(n/2)) -- exponential but square-root of the naive O(2^n) |
| Space | O(2^(n/2)) for storing all subset sums of each half |

## Notes

- The array is split at its midpoint into left and right halves.
- All possible subset sums for each half are enumerated and stored in unordered sets.
- A match is found when `target - leftSum` exists in the right-half sums.
- This reduces a brute-force O(2^n) approach to O(2^(n/2)), making it feasible for n up to ~40.

---

_Last Updated: April 2026_
