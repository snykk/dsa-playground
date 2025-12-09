/**
 * Climbing Stairs Implementation (C++)
 * Time Complexity: O(n)
 */

long long climbingStairs(int n) {
    if (n <= 2) {
        return n;
    }
    
    long long prev2 = 1;
    long long prev1 = 2;
    
    for (int i = 3; i <= n; ++i) {
        long long current = prev1 + prev2;
        prev2 = prev1;
        prev1 = current;
    }
    
    return prev1;
}

