"""
Kadane's Algorithm Implementation

Find the maximum sum of contiguous subarray in an array.
"""


def kadane_algorithm(arr):
    """
    Kadane's algorithm for maximum subarray sum
    
    Args:
        arr: Input array
        
    Returns:
        Maximum sum of contiguous subarray
        
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    if not arr:
        return 0
    
    max_sum = current_sum = arr[0]
    
    for i in range(1, len(arr)):
        current_sum = max(arr[i], current_sum + arr[i])
        max_sum = max(max_sum, current_sum)
    
    return max_sum


def kadane_with_indices(arr):
    """
    Kadane's algorithm returning indices of maximum subarray
    
    Args:
        arr: Input array
        
    Returns:
        Tuple of (max_sum, start_index, end_index)
        
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    if not arr:
        return 0, -1, -1
    
    max_sum = current_sum = arr[0]
    start = end = 0
    temp_start = 0
    
    for i in range(1, len(arr)):
        if current_sum < 0:
            current_sum = arr[i]
            temp_start = i
        else:
            current_sum += arr[i]
        
        if current_sum > max_sum:
            max_sum = current_sum
            start = temp_start
            end = i
    
    return max_sum, start, end


def kadane_dp(arr):
    """
    DP approach (same as Kadane's but more explicit)
    
    Args:
        arr: Input array
        
    Returns:
        Maximum sum
        
    Time Complexity: O(n)
    Space Complexity: O(n) but can be optimized to O(1)
    """
    if not arr:
        return 0
    
    n = len(arr)
    dp = [0] * n
    dp[0] = arr[0]
    
    for i in range(1, n):
        dp[i] = max(arr[i], dp[i - 1] + arr[i])
    
    return max(dp)

