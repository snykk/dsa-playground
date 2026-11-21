/**
 * Job Scheduling Implementation (C++)
 *
 * The three greedy rules of the Python version:
 *   jobSchedulingDeadline               profit with unit-time deadlines,
 *                                       O(n log n + n * min(D, n) + D), D = largest deadline
 *   jobSchedulingEarliestDeadline       earliest deadline first, O(n log n)
 *   jobSchedulingWeightedCompletionTime Smith's rule, O(n log n)
 */

#include <vector>
#include <algorithm>
#include <cstddef>
#include <stdexcept>
#include <tuple>
#include <utility>
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

// Earliest deadline first. jobs are (id, deadline, processing_time); returns the ids
// sorted by deadline. processing_time is ignored, as in Python. Like Python's sorted(),
// it sorts a copy, and the stable sort keeps input order among equal deadlines.
std::vector<int> jobSchedulingEarliestDeadline(
    const std::vector<std::tuple<int, int, int>>& jobs) {
    std::vector<std::tuple<int, int, int>> byDeadline(jobs);
    std::stable_sort(byDeadline.begin(), byDeadline.end(),
                     [](const std::tuple<int, int, int>& a,
                        const std::tuple<int, int, int>& b) {
                         return std::get<1>(a) < std::get<1>(b);
                     });

    std::vector<int> order;
    order.reserve(byDeadline.size());
    for (const auto& job : byDeadline) {
        order.push_back(std::get<0>(job));
    }
    return order;
}

// Smith's rule. jobs are (id, processing_time, weight); returns the ids by
// weight / processing_time, highest first, and the sum of weight * completion_time.
// Throws std::domain_error when a processing time is 0, where Python raises
// ZeroDivisionError; no jobs gives ({}, 0) before any check, as in Python.
std::pair<std::vector<int>, long long> jobSchedulingWeightedCompletionTime(
    const std::vector<std::tuple<int, int, int>>& jobs) {
    if (jobs.empty()) {
        return {{}, 0};
    }

    // The key is the same IEEE double that Python's x[2] / x[1] gives (an int
    // converts to double exactly), so ratios that round to one double tie here too.
    // Every key is computed before sorting, so any zero throws, as in Python.
    std::vector<std::pair<double, std::size_t>> keyed;
    keyed.reserve(jobs.size());
    for (std::size_t i = 0; i < jobs.size(); ++i) {
        int processingTime = std::get<1>(jobs[i]);
        if (processingTime == 0) {
            throw std::domain_error(
                "weighted completion time: a processing time of 0 has no ratio");
        }
        double ratio = static_cast<double>(std::get<2>(jobs[i])) / processingTime;
        keyed.push_back({ratio, i});
    }

    // Python's sorted(..., reverse=True) is stable: equal ratios keep input order.
    std::stable_sort(keyed.begin(), keyed.end(),
                     [](const std::pair<double, std::size_t>& a,
                        const std::pair<double, std::size_t>& b) {
                         return a.first > b.first;
                     });

    std::vector<int> order;
    order.reserve(jobs.size());
    long long completionTime = 0;
    long long totalWeighted = 0;
    for (const auto& entry : keyed) {
        const auto& job = jobs[entry.second];
        order.push_back(std::get<0>(job));
        completionTime += std::get<1>(job);
        totalWeighted += static_cast<long long>(std::get<2>(job)) * completionTime;
    }
    return {order, totalWeighted};
}
