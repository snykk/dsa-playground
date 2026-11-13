/**
 * Longest Increasing Subsequence (C++)
 * Time Complexity: O(n^2)
 */

#include <vector>
#include <algorithm>

int lisDP(const std::vector<int>& arr) {
    if (arr.empty()) {
        return 0;
    }
    
    int n = arr.size();
    std::vector<int> dp(n, 1);
    
    for (int i = 1; i < n; ++i) {
        for (int j = 0; j < i; ++j) {
            if (arr[j] < arr[i]) {
                dp[i] = std::max(dp[i], dp[j] + 1);
            }
        }
    }
    
    return *std::max_element(dp.begin(), dp.end());
}

