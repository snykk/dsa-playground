"""
Digit Dynamic Programming

DP problems involving digits/numbers with constraints.
"""


def count_numbers_with_digit_sum(n, target_sum):
    """
    Count numbers from 0 to n with digit sum equal to target_sum
    
    Args:
        n: Upper bound
        target_sum: Target digit sum
        
    Returns:
        Count of numbers
        
    Time Complexity: O(log n × target_sum)
    Space Complexity: O(log n × target_sum)
    """
    digits = list(map(int, str(n)))
    memo = {}
    
    def dp(pos, tight, current_sum):
        if pos == len(digits):
            return 1 if current_sum == target_sum else 0
        
        key = (pos, tight, current_sum)
        if key in memo:
            return memo[key]
        
        limit = digits[pos] if tight else 9
        count = 0
        
        for d in range(limit + 1):
            new_tight = tight and (d == limit)
            new_sum = current_sum + d
            if new_sum <= target_sum:
                count += dp(pos + 1, new_tight, new_sum)
        
        memo[key] = count
        return count
    
    return dp(0, True, 0)

