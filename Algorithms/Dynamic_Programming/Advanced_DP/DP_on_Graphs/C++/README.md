# DP on Graphs -- C++ Implementation

A placeholder. This folder does not implement DP on graphs yet; the working code is the Python version.

## Files

| File | Description |
|------|-------------|
| `graph_dp.cpp` | Comment-only stub, no functions |
| `graph_dp_test.cpp` | Includes the stub and prints a message; it asserts nothing |

## API

None. There are no functions or types.

## C++-Specific Notes

- A real port would use `std::vector<std::vector<int>>` for the adjacency list, a memo vector with three states (unvisited, in progress, done), and an explicit stack or a deep-recursion check for long paths.
- Because the test cannot fail, passing it proves nothing about graph DP.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD graph_dp_test.cpp -o graph_dp_test
./graph_dp_test
```

## Key Takeaways

- Treat this folder as a stub; see `../Python/graph_dp.py` for the algorithm.
- The expected cost for a port is O(V + E) time and O(V) space.
