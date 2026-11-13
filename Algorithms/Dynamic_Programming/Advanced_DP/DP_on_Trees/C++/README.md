# DP on Trees -- C++ Implementation

A placeholder. This folder does not implement tree DP yet; the working code is the Python version.

## Files

| File | Description |
|------|-------------|
| `tree_dp.cpp` | Comment-only stub, no functions |
| `tree_dp_test.cpp` | Includes the stub and prints a message; it asserts nothing |

## API

None. There are no functions or types.

## C++-Specific Notes

- A real port would store children as `std::vector<int>` adjacency lists, use `long long` sums, and either raise the stack limit or use an iterative post-order for deep trees.
- Because the test cannot fail, passing it proves nothing about tree DP.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD tree_dp_test.cpp -o tree_dp_test
./tree_dp_test
```

## Key Takeaways

- Treat this folder as a stub; see `../Python/tree_dp.py` for the algorithms.
- The expected cost for a port is O(n) time.
