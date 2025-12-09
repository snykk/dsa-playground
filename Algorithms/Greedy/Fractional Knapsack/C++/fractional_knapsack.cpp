/**
 * Fractional Knapsack Implementation (C++)
 * Time Complexity: O(n log n)
 */

#include <vector>
#include <algorithm>
#include <utility>

double fractionalKnapsack(std::vector<std::pair<double, double>>& items, double capacity) {
    if (items.empty() || capacity <= 0) {
        return 0;
    }
    
    // Sort by value/weight ratio
    std::sort(items.begin(), items.end(),
              [](const auto& a, const auto& b) {
                  return (a.first / a.second) > (b.first / b.second);
              });
    
    double totalValue = 0;
    double remaining = capacity;
    
    for (const auto& item : items) {
        if (remaining <= 0) break;
        
        double value = item.first;
        double weight = item.second;
        double take = std::min(weight, remaining);
        
        totalValue += value * (take / weight);
        remaining -= take;
    }
    
    return totalValue;
}

