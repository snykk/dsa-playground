/**
 * Fractional Knapsack Implementation (C++)
 * Time Complexity: O(n log n)
 */

#include <vector>
#include <algorithm>
#include <limits>
#include <utility>

double fractionalKnapsack(std::vector<std::pair<double, double>>& items, double capacity) {
    if (items.empty() || capacity <= 0) {
        return 0;
    }
    
    // Sort by value/weight ratio. A zero-weight item uses no capacity: its
    // ratio is infinite (0/0 would be NaN), so it is taken first.
    auto ratio = [](const std::pair<double, double>& item) {
        return item.second == 0 ? std::numeric_limits<double>::infinity()
                                : item.first / item.second;
    };
    std::sort(items.begin(), items.end(),
              [&ratio](const auto& a, const auto& b) {
                  return ratio(a) > ratio(b);
              });
    
    double totalValue = 0;
    double remaining = capacity;
    
    for (const auto& item : items) {
        if (remaining <= 0) break;
        
        double value = item.first;
        double weight = item.second;
        if (weight == 0) {  // free item: take all of it (take / weight would be 0 / 0)
            totalValue += value;
            continue;
        }
        double take = std::min(weight, remaining);
        
        totalValue += value * (take / weight);
        remaining -= take;
    }
    
    return totalValue;
}

