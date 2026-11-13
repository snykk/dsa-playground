# Big-O Notation -- C++ Implementation

## Files

- `big_o_notation.cpp`: seven example functions and `demonstrateBigO`. `main` is compiled out when `IS_TEST_BUILD` is defined.
- `big_o_notation_test.cpp`: assert-based tests; it includes the `.cpp` file directly.

## API

- `int constantTimeExample(int n)`: O(1).
- `int logarithmicTimeExample(int n)`: number of halvings, O(log n).
- `int linearTimeExample(const vector<int>&)`: sum, O(n).
- `vector<int> linearithmicTimeExample(vector<int>)`: sorts a copy with `std::sort`, O(n log n).
- `vector<pair<int,int>> quadraticTimeExample(const vector<int>&)`: all pairs, O(n^2).
- `int cubicTimeExample(int n)`: counts `n^3` iterations.
- `int exponentialTimeExample(int n)`: naive Fibonacci, O(2^n) (valid but loose).

```cpp
vector<int> v = {64, 34, 25, 12};
vector<int> sorted = linearithmicTimeExample(v);  // {12, 25, 34, 64}
```

## C++-Specific Notes

- The linearithmic example calls `std::sort` instead of implementing merge sort. Common implementations use introsort, which is O(n log n) in the worst case.
- `int` overflows for large inputs: `cubicTimeExample` and `exponentialTimeExample` are meant for small `n`.
- There is no factorial example in C++.

## How to Run

```bash
cd "Complexity_Analysis/Time Complexity/Big-O Notation/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD big_o_notation_test.cpp -o big_o_test
./big_o_test

# the demo program
g++ -std=c++17 -O2 -Wall big_o_notation.cpp -o big_o_demo
./big_o_demo
```

## Key Takeaways

- Big-O is an upper bound on a function; best, average and worst case are different functions you can bound.
- Drop constants and lower-order terms; keep the dominant term.
- To prove a bound, exhibit `c` and `n0`.

