# Fractional Knapsack -- C++ Implementation

Greedy fractional knapsack in C++17.

## Files

| File | Contents |
|------|----------|
| `fractional_knapsack.cpp` | `fractionalKnapsack` |
| `fractional_knapsack_test.cpp` | 5 assert-based tests (classic case, all items fit, no item fits whole, empty and zero capacity, zero-weight items) |

## API

| Name | Description |
|------|-------------|
| `double fractionalKnapsack(std::vector<std::pair<double, double>>& items, double capacity)` | the maximum value; items are `(value, weight)`; 0 for no items or capacity <= 0 |

```cpp
std::vector<std::pair<double, double>> items = {{60, 10}, {100, 20}, {120, 30}};
double best = fractionalKnapsack(items, 50);  // 240
```

The function returns only the value. The fractions taken are available in Python only.

## C++-Specific Notes

- `items` is a non-const reference and is **sorted in place**: the caller's order changes. Pass a copy if you need the original order.
- A zero-weight item gets an infinite ratio (`std::numeric_limits<double>::infinity()`) and is taken whole; before the fix, `0 * (0 / 0)` produced NaN.
- The sort uses a generic lambda, which needs C++14 or newer: compile with `-std=c++17`.
- Values and weights are `double`; compare totals with a tolerance.

## How to Run

```bash
cd "Algorithms/Greedy/Fractional Knapsack/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD fractional_knapsack_test.cpp -o fractional_test
./fractional_test
```

## Key Takeaways

- The input vector is sorted in place.
- Zero weight needs a special case (infinite ratio).
- Returns the value only.
