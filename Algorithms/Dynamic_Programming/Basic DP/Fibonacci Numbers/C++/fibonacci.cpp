/**
 * Fibonacci Numbers Implementation (C++)
 * 
 * Multiple approaches: naive, memoization, tabulation, optimized
 */

#include <vector>
#include <unordered_map>

// Tabulation approach (bottom-up DP)
long long fibonacciTabulation(int n) {
    if (n <= 1) {
        return n;
    }
    
    std::vector<long long> dp(n + 1);
    dp[0] = 0;
    dp[1] = 1;
    
    for (int i = 2; i <= n; ++i) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    
    return dp[n];
}

// Space-optimized approach
long long fibonacciOptimized(int n) {
    if (n <= 1) {
        return n;
    }
    
    long long prev2 = 0;
    long long prev1 = 1;
    
    for (int i = 2; i <= n; ++i) {
        long long current = prev1 + prev2;
        prev2 = prev1;
        prev1 = current;
    }
    
    return prev1;
}

// Memoization approach (top-down DP)
long long fibonacciMemoization(int n, std::unordered_map<int, long long>& memo) {
    if (n <= 1) {
        return n;
    }
    
    if (memo.find(n) != memo.end()) {
        return memo[n];
    }
    
    memo[n] = fibonacciMemoization(n - 1, memo) + fibonacciMemoization(n - 2, memo);
    return memo[n];
}

long long fibonacciMemoization(int n) {
    std::unordered_map<int, long long> memo;
    return fibonacciMemoization(n, memo);
}

