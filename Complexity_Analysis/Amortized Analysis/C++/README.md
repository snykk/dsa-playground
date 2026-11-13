# Amortized Analysis -- C++ Implementation

## Files

- `amortized_analysis.cpp`: `DynamicArray`, `BinaryCounter` and `demonstrateAmortizedAnalysis`. `main` is compiled out when `IS_TEST_BUILD` is defined.
- `amortized_analysis_test.cpp`: assert-based tests; it includes the `.cpp` file directly.

## API

- `DynamicArray(int initial_capacity = 4)`: `append(int)`, `get(int)` (throws `std::out_of_range`), `getSize()`, `getCapacity()`, `getCopies()`.
- `BinaryCounter(int n_bits = 8)`: `increment()`, `getValue()`, `getFlips()`.

```cpp
DynamicArray arr(1);
for (int i = 0; i < 1000; i++) arr.append(i);
// arr.getCopies() <= 2000
```

## C++-Specific Notes

- Storage is a `std::vector<int>` that the class resizes itself, to make the copies explicit. `std::vector` itself grows geometrically and typically by 2x with libstdc++ and libc++, and by about 1.5x with MSVC.
- The growth rule is `max(1, capacity * 2)`, so capacity 0 is safe.
- Compile with `-DIS_TEST_BUILD` to build the tests; otherwise two `main` functions clash.

## How to Run

```bash
cd "Complexity_Analysis/Amortized Analysis/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD amortized_analysis_test.cpp -o amortized_test
./amortized_test

# the demo program
g++ -std=c++17 -O2 -Wall amortized_analysis.cpp -o amortized_demo
./amortized_demo
```

## Key Takeaways

- A resize costs O(n), but doubling makes the total of `n` appends O(n): O(1) amortized.
- Amortized is a worst-case bound over a sequence, not an average over random input.
- The tests assert the aggregate bounds: copies at most 2n and bit flips at most 2n.

