/**
 * Dynamic Programming Patterns Implementation
 * 
 * Includes:
 * 1. 0/1 Knapsack
 * 2. LCS
 * 3. LIS
 */

#include <vector>
#include <string>
#include <algorithm>
#include <iostream>

class DPPatterns {
public:
    // 0/1 Knapsack
    // Time: O(N * W), Space: O(W)
    static int knapsack01(const std::vector<int>& weights, 
                         const std::vector<int>& values, 
                         int capacity) {
        int n = weights.size();
        std::vector<int> dp(capacity + 1, 0);

        for (int i = 0; i < n; ++i) {
            for (int w = capacity; w >= weights[i]; --w) {
                dp[w] = std::max(dp[w], dp[w - weights[i]] + values[i]);
            }
        }
        return dp[capacity];
    }

    // Longest Common Subsequence
    // Time: O(N * M), Space: O(min(N, M))
    static int lcs(std::string text1, std::string text2) {
        if (text1.length() < text2.length()) {
            std::swap(text1, text2);
        }

        int m = text1.length();
        int n = text2.length();
        std::vector<int> prev(n + 1, 0);
        std::vector<int> curr(n + 1, 0);

        for (int i = 1; i <= m; ++i) {
            for (int j = 1; j <= n; ++j) {
                if (text1[i - 1] == text2[j - 1]) {
                    curr[j] = 1 + prev[j - 1];
                } else {
                    curr[j] = std::max(prev[j], curr[j - 1]);
                }
            }
            prev = curr;
        }
        return prev[n];
    }

    // Longest Increasing Subsequence
    // Time: O(N log N), Space: O(N)
    static int lis(const std::vector<int>& nums) {
        if (nums.empty()) return 0;
        
        std::vector<int> tails;
        
        for (int num : nums) {
            // std::lower_bound returns iterator to first element >= num
            auto it = std::lower_bound(tails.begin(), tails.end(), num);
            
            if (it == tails.end()) {
                tails.push_back(num);
            } else {
                *it = num;
            }
        }
        return tails.size();
    }
};

int main() {
    // 0/1 Knapsack
    std::cout << "Knapsack: " << DPPatterns::knapsack01({10, 20, 30}, {60, 100, 120}, 50) << std::endl;

    // LCS
    std::cout << "LCS: " << DPPatterns::lcs("abcde", "ace") << std::endl;

    // LIS
    std::cout << "LIS: " << DPPatterns::lis({10, 9, 2, 5, 3, 7, 101, 18}) << std::endl;

    return 0;
}
