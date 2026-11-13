/**
 * Matrix Chain Multiplication (C++)
 * Time Complexity: O(n^3)
 *
 * Costs are 64-bit: three dimensions of 2000 already give 8e9 > INT_MAX.
 */

#include <vector>
#include <algorithm>
#include <climits>

long long matrixChainMultiplication(const std::vector<int>& dims) {
    if (dims.size() < 3) {
        return 0;  // fewer than two matrices: nothing to multiply
    }

    int n = static_cast<int>(dims.size()) - 1;
    std::vector<std::vector<long long>> dp(n + 1, std::vector<long long>(n + 1, 0));
    
    for (int l = 2; l <= n; ++l) {
        for (int i = 1; i <= n - l + 1; ++i) {
            int j = i + l - 1;
            dp[i][j] = LLONG_MAX;
            
            for (int k = i; k < j; ++k) {
                long long cost = dp[i][k] + dp[k + 1][j] +
                                 static_cast<long long>(dims[i - 1]) * dims[k] * dims[j];
                dp[i][j] = std::min(dp[i][j], cost);
            }
        }
    }
    
    return dp[1][n];
}
