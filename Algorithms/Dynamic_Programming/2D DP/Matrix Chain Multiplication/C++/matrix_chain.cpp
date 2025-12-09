/**
 * Matrix Chain Multiplication (C++)
 * Time Complexity: O(n³)
 */

#include <vector>
#include <algorithm>
#include <climits>

int matrixChainMultiplication(const std::vector<int>& dims) {
    int n = dims.size() - 1;
    std::vector<std::vector<int>> dp(n + 1, std::vector<int>(n + 1, 0));
    
    for (int l = 2; l <= n; ++l) {
        for (int i = 1; i <= n - l + 1; ++i) {
            int j = i + l - 1;
            dp[i][j] = INT_MAX;
            
            for (int k = i; k < j; ++k) {
                int cost = dp[i][k] + dp[k + 1][j] + 
                          dims[i - 1] * dims[k] * dims[j];
                dp[i][j] = std::min(dp[i][j], cost);
            }
        }
    }
    
    return dp[1][n];
}

