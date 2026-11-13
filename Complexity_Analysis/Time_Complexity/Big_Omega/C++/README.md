# Big-Omega (Omega) -- C++ Implementation

## Files

- `big_omega.cpp`: three example functions and `demonstrateBigOmega`. `main` is compiled out when `IS_TEST_BUILD` is defined.
- `big_omega_test.cpp`: assert-based tests; it includes the `.cpp` file directly.

## API

- `int linearSearchBestCase(const vector<int>&, int target)`: index or -1. `Omega(1)` on every input; best `Theta(1)`, worst `Theta(n)`.
- `vector<int> bubbleSortBestCase(vector<int> arr)`: sorts a copy with the early-exit flag. `Omega(n)` on every input.
- `int matrixTraversalLowerBound(const vector<vector<int>>&)`: sum of all elements, `Theta(n^2)`.

```cpp
vector<int> arr = {5, 3, 8, 1, 9};
int idx = linearSearchBestCase(arr, 5);  // 0
```

## C++-Specific Notes

- `bubbleSortBestCase` takes its argument by value, so the caller's vector is not changed.
- There is no `quick_sort_best_case` in C++.
- Integer sums can overflow `int` for large matrices.

## How to Run

```bash
cd "Complexity_Analysis/Time_Complexity/Big_Omega/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD big_omega_test.cpp -o big_omega_test
./big_omega_test

# the demo program
g++ -std=c++17 -O2 -Wall big_omega.cpp -o big_omega_demo
./big_omega_demo
```

## Key Takeaways

- Big-Omega is a lower bound on a function; best, average and worst case are different functions you can bound.
- Useful lower bounds are the largest you can prove; `Omega(1)` is always true.
- Comparison sorting is `Omega(n log n)` in the worst case, not on every input.

