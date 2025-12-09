/**
 * Coin Change (C++)
 * Time Complexity: O(n × amount)
 */

#include <vector>
#include <algorithm>
#include <climits>

int coinChangeMinCoins(const std::vector<int>& coins, int amount) {
    if (amount == 0) {
        return 0;
    }
    
    std::vector<int> dp(amount + 1, INT_MAX);
    dp[0] = 0;
    
    for (int coin : coins) {
        for (int i = coin; i <= amount; ++i) {
            if (dp[i - coin] != INT_MAX) {
                dp[i] = std::min(dp[i], dp[i - coin] + 1);
            }
        }
    }
    
    return (dp[amount] == INT_MAX) ? -1 : dp[amount];
}

