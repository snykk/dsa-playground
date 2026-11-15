/**
 * Digit Dynamic Programming (C++)
 *
 * Counts the numbers in 0..n whose decimal digit sum equals a target, with a
 * memoized recursion over (position, tight, sum).
 */

#include <algorithm>
#include <cstddef>
#include <string>
#include <vector>

// memo[pos][tight][sum]: the count for that state, or -1 if not computed yet.
using DigitMemo = std::vector<std::vector<std::vector<long long>>>;

// Numbers that complete a prefix in state (pos, tight, sum) to digit sum target.
static long long countFrom(const std::string& digits, int target, std::size_t pos, bool tight, int sum,
                           DigitMemo& memo) {
    if (pos == digits.size()) {
        return sum == target ? 1 : 0;
    }

    long long& cached = memo[pos][tight][sum];
    if (cached != -1) {
        return cached;
    }

    const int limit = tight ? digits[pos] - '0' : 9;
    long long count = 0;

    for (int d = 0; d <= limit; ++d) {
        const bool newTight = tight && d == limit;
        const int newSum = sum + d;
        if (newSum <= target) {
            count += countFrom(digits, target, pos + 1, newTight, newSum, memo);
        }
    }

    cached = count;
    return count;
}

/**
 * Count numbers from 0 to n with digit sum equal to targetSum.
 * Returns 0 when n < 0 (so count(R) - count(L - 1) works for L = 0) and when
 * targetSum < 0, as Python does.
 *
 * Time Complexity: O(digits * targetSum * 10)
 * Space Complexity: O(digits * targetSum)
 */
long long countNumbersWithDigitSum(long long n, int targetSum) {
    if (n < 0 || targetSum < 0) {
        return 0;
    }
    const std::string digits = std::to_string(n);
    // A stored sum never exceeds the target, nor 9 per digit.
    const int maxSum = std::min(targetSum, 9 * static_cast<int>(digits.size()));
    DigitMemo memo(digits.size(), std::vector<std::vector<long long>>(2, std::vector<long long>(maxSum + 1, -1)));
    return countFrom(digits, targetSum, 0, true, 0, memo);
}
