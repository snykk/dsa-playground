# Big-Theta (Theta) -- C++ Implementation

## Files

- `big_theta.cpp`: three example functions and `demonstrateBigTheta`. `main` is compiled out when `IS_TEST_BUILD` is defined.
- `big_theta_test.cpp`: assert-based tests; it includes the `.cpp` file directly.

## API

- `int tightBoundExample(const vector<int>&)`: sum, `Theta(n)` on every input.
- `int binarySearchExample(const vector<int>&, int target)`: index or -1; best case `Theta(1)`, worst case `Theta(log n)`.
- `vector<int> mergeSortExample(vector<int> arr)`: sorts a copy with `std::sort`.

```cpp
vector<int> v = {1, 3, 5, 7, 9, 11, 13, 15};
int idx = binarySearchExample(v, 11);  // 5
```

## C++-Specific Notes

- `mergeSortExample` is not a merge sort: it calls `std::sort`, which is `O(n log n)` in the worst case (introsort in common implementations) but is not claimed to be `Theta(n log n)` for every input.
- `mid = (left + right) / 2` can overflow `int` for arrays with more than about 10^9 elements; `left + (right - left) / 2` avoids it.
- There is no matrix multiplication example in C++.

## How to Run

```bash
cd "Complexity_Analysis/Time Complexity/Big-Theta (Θ)/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD big_theta_test.cpp -o big_theta_test
./big_theta_test

# the demo program
g++ -std=c++17 -O2 -Wall big_theta.cpp -o big_theta_demo
./big_theta_demo
```

## Key Takeaways

- Big-Theta is a tight bound on one function; best, average and worst case each get their own Theta.
- `f = Theta(g)` exactly when `f = O(g)` and `f = Omega(g)`.
- Binary search is `Theta(1)` in the best case and `Theta(log n)` in the worst case.

