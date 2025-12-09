/**
 * Activity Selection Implementation (C++)
 * 
 * Select maximum number of non-overlapping activities
 * Time Complexity: O(n log n)
 */

#include <vector>
#include <algorithm>
#include <utility>

using Activity = std::pair<int, int>;  // (start, finish)

std::vector<int> activitySelection(std::vector<Activity>& activities) {
    if (activities.empty()) {
        return {};
    }
    
    // Create vector with indices
    std::vector<std::pair<int, Activity>> indexed;
    for (size_t i = 0; i < activities.size(); ++i) {
        indexed.push_back({static_cast<int>(i), activities[i]});
    }
    
    // Sort by finish time
    std::sort(indexed.begin(), indexed.end(),
              [](const auto& a, const auto& b) {
                  return a.second.second < b.second.second;
              });
    
    std::vector<int> selected;
    selected.push_back(indexed[0].first);
    int lastFinish = indexed[0].second.second;
    
    // Select activities that don't overlap
    for (size_t i = 1; i < indexed.size(); ++i) {
        if (indexed[i].second.first >= lastFinish) {
            selected.push_back(indexed[i].first);
            lastFinish = indexed[i].second.second;
        }
    }
    
    return selected;
}

