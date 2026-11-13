/**
 * Job Scheduling Implementation (C++)
 * Time Complexity: O(n log n + n * min(D, n)), D = largest deadline
 */

#include <vector>
#include <algorithm>
#include <tuple>
#include <climits>

std::pair<int, std::vector<int>> jobSchedulingDeadline(
    std::vector<std::tuple<int, int, int>>& jobs) {
    
    if (jobs.empty()) {
        return {0, {}};
    }
    
    // Sort jobs by profit (descending)
    std::sort(jobs.begin(), jobs.end(),
              [](const auto& a, const auto& b) {
                  return std::get<2>(a) > std::get<2>(b);
              });
    
    // Find maximum deadline
    int maxDeadline = 0;
    for (const auto& job : jobs) {
        maxDeadline = std::max(maxDeadline, std::get<1>(job));
    }
    
    // occupied[slot] marks a used time slot (a job id such as -1 cannot double as "empty")
    std::vector<bool> occupied(maxDeadline + 1, false);
    std::vector<int> scheduled;
    int totalProfit = 0;
    
    for (const auto& job : jobs) {
        int jobId = std::get<0>(job);
        int deadline = std::get<1>(job);
        int profit = std::get<2>(job);
        
        // Find latest available slot before deadline
        for (int slot = deadline; slot > 0; --slot) {
            if (!occupied[slot]) {
                occupied[slot] = true;
                scheduled.push_back(jobId);
                totalProfit += profit;
                break;
            }
        }
    }
    
    return {totalProfit, scheduled};
}

int jobSchedulingDeadlineProfitOnly(
    std::vector<std::tuple<int, int, int>>& jobs) {
    auto result = jobSchedulingDeadline(jobs);
    return result.first;
}
