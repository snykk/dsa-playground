# Space Complexity -- C++ Implementation

## Files

- `space_complexity.cpp`: four examples and `demonstrateSpaceComplexity`. `main` is compiled out when `IS_TEST_BUILD` is defined.
- `space_complexity_test.cpp`: assert-based tests; it includes the `.cpp` file directly.

## API

- `int constantSpaceExample(int n)`: O(1) space.
- `vector<int> linearSpaceExample(int n)`: O(n) space.
- `vector<vector<int>> quadraticSpaceExample(int n)`: O(n^2) space.
- `void inPlaceReverse(vector<int>& arr)`: O(1) auxiliary space.

```cpp
vector<int> v = {1, 2, 3, 4, 5};
inPlaceReverse(v);  // {5, 4, 3, 2, 1}
```

## C++-Specific Notes

- There are no recursive examples here; the logarithmic, Fibonacci and Merge Sort examples exist only in Python.
- The call stack is a fixed-size region (commonly 1 to 8 MB). A recursion that is too deep crashes with a stack overflow instead of raising an exception.
- `vector` growth over-allocates, so `push_back` in a loop can briefly use more than `n` cells.

## How to Run

```bash
cd "Complexity_Analysis/Space_Complexity/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD space_complexity_test.cpp -o space_test
./space_test

# the demo program
g++ -std=c++17 -O2 -Wall space_complexity.cpp -o space_demo
./space_demo
```

## Key Takeaways

- Space complexity counts auxiliary memory, including the recursion stack, not the input.
- Count what is alive at the same time, not everything ever allocated.
- Recursion depth `d` costs O(d) memory.

