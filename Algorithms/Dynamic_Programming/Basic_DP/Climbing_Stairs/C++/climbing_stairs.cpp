/**
 * Climbing Stairs Implementation (C++)
 * Time Complexity: O(n)
 *
 * climbingStairs(0) is 1 (the empty climb); a negative n throws
 * std::invalid_argument.
 */

#include <stdexcept>

long long climbingStairs(int n) {
    if (n < 0) {
        throw std::invalid_argument("n must be non-negative");
    }
    if (n == 0) {
        return 1;  // one way to climb zero stairs: take no step
    }
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
