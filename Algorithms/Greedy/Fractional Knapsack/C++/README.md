# Fractional Knapsack (C++)

**Fractional Knapsack** maximizes value in a knapsack by allowing fractions of items, making it solvable with a greedy approach.

---

## Overview

Unlike 0/1 knapsack where items must be taken whole, fractional knapsack allows taking fractions of items. This key difference makes the greedy approach optimal: always take items with the highest value/weight ratio first.

**Example**:
- Items: (value, weight) = [(60, 10), (100, 20), (120, 30)]
- Capacity: 50
- Ratios: 6.0, 5.0, 4.0
- Solution: Take all of item 1 (60), all of item 2 (100), and 2/3 of item 3 (80)
- Total value: 240

---

## Algorithm

1. **Calculate ratio**: For each item, compute value/weight ratio
2. **Sort**: Sort items by ratio in descending order
3. **Greedy selection**: 
   - Take items in sorted order
   - If item fits completely, take it all
   - If item doesn't fit, take fraction to fill remaining capacity
4. **Stop**: When capacity is filled

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **All Cases** | O(n log n) | O(n) |

**Note**: O(n log n) is for sorting. Selection itself is O(n).

---

## Implementation Details

### Functions

1. **`fractionalKnapsack(items, capacity)`**
   - Returns maximum value and list of selected items with fractions
   - Each selected item is (value, weight, fraction)
   - Time: O(n log n), Space: O(n)

2. **`fractionalKnapsackValueOnly(items, capacity)`**
   - Returns only maximum value (more efficient)
   - Doesn't track which items were selected
   - Time: O(n log n), Space: O(1) excluding sorting

---

## Usage

```cpp
#include <vector>
#include <tuple>
#include <algorithm>
#include "fractional_knapsack.cpp"

int main() {
    // Items: (value, weight)
    std::vector<std::pair<int, int>> items = {
        {60, 10}, {100, 20}, {120, 30}
    };
    int capacity = 50;
    
    auto result = fractionalKnapsack(items, capacity);
    double max_value = result.first;
    auto selected = result.second;
    
    std::cout << "Max value: " << max_value << "\n";  // 240.0
    for (const auto& item : selected) {
        std::cout << "Item: value=" << std::get<0>(item) 
                  << ", weight=" << std::get<1>(item)
                  << ", fraction=" << std::get<2>(item) << "\n";
    }
    
    return 0;
}
```

---

## Important Notes

1. **Fractions allowed**: Unlike 0/1 knapsack, can take partial items
2. **Greedy optimal**: Greedy approach gives optimal solution
3. **Sorting required**: Must sort by value/weight ratio
4. **Edge cases**: Handle empty items, zero capacity, zero weights
5. **Floating point**: Use double for fractional values

---

## Advantages

1. ✅ **Optimal**: Greedy gives optimal solution
2. ✅ **Efficient**: O(n log n) time complexity
3. ✅ **Simple**: Easy to understand and implement
4. ✅ **Practical**: Models real-world scenarios (e.g., loading cargo)

---

## Disadvantages

1. ❌ **Not always applicable**: Many problems don't allow fractions
2. ❌ **Sorting overhead**: Requires sorting step
3. ❌ **Precision**: Fractional values may have precision issues

---

## When to Use

- ✅ When fractions of items are allowed
- ✅ Need optimal solution efficiently
- ✅ Value/weight ratio matters
- ❌ When items must be taken whole (use 0/1 knapsack DP)
- ❌ When items can be taken multiple times (use unbounded knapsack)

---

## Comparison: Fractional vs 0/1 Knapsack

| Aspect | Fractional Knapsack | 0/1 Knapsack |
|--------|---------------------|--------------|
| **Items** | Can take fractions | Whole items only |
| **Approach** | Greedy | Dynamic Programming |
| **Time** | O(n log n) | O(n × W) |
| **Optimality** | Always optimal | Always optimal |

---

## Compilation

```bash
g++ -std=c++11 fractional_knapsack.cpp fractional_knapsack_test.cpp -o test
./test
```

---

## Testing

Run the test suite:

```bash
g++ -std=c++11 fractional_knapsack_test.cpp -o test && ./test
```

---

## Related Algorithms

- **0/1 Knapsack**: DP problem, items must be taken whole
- **Unbounded Knapsack**: Can take multiple of same item (DP)
- **Greedy Algorithms**: Similar greedy choice patterns

---

## Applications

1. **Resource Allocation**: Allocate resources with fractional units
2. **Cargo Loading**: Load cargo with divisible items
3. **Investment**: Invest in projects with fractional investments
4. **Time Management**: Allocate time to tasks with fractional time

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 16)
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_
