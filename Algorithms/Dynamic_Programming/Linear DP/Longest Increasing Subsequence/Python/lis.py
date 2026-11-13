"""
Longest Increasing Subsequence (LIS) Implementation

Find the length of the longest subsequence of a given sequence such that
all elements of the subsequence are sorted in increasing order.
"""


def lis_naive(arr):
    """
    Naive recursive approach (inefficient)
    
    Time Complexity: O(2^n)
    Space Complexity: O(n)
    """
    def helper(i, prev):
        if i == len(arr):
            return 0
        
        taken = 0
        if arr[i] > prev:
            taken = 1 + helper(i + 1, arr[i])
        
        not_taken = helper(i + 1, prev)
        return max(taken, not_taken)
    
    return helper(0, float('-inf'))


def lis_dp(arr):
    """
    DP approach using tabulation
    
    Args:
        arr: Input array
        
    Returns:
        Length of LIS
        
    Time Complexity: O(n^2)
    Space Complexity: O(n)
    """
    if not arr:
        return 0
    
    n = len(arr)
    dp = [1] * n  # dp[i] = length of LIS ending at index i
    
    for i in range(1, n):
        for j in range(i):
            if arr[j] < arr[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    
    return max(dp)


def lis_binary_search(arr):
    """
    Optimized approach using binary search
    
    Args:
        arr: Input array
        
    Returns:
        Length of LIS
        
    Time Complexity: O(n log n)
    Space Complexity: O(n)
    """
    if not arr:
        return 0
    
    import bisect
    
    tails = []  # tails[i] = smallest tail of all increasing subsequences of length i+1
    
    for num in arr:
        pos = bisect.bisect_left(tails, num)
        if pos == len(tails):
            tails.append(num)
        else:
            tails[pos] = num
    
    return len(tails)


def lis_with_sequence(arr):
    """
    Find LIS and return the actual sequence
    
    Args:
        arr: Input array
        
    Returns:
        Tuple of (length, sequence)
        
    Time Complexity: O(n^2)
    Space Complexity: O(n)
    """
    if not arr:
        return 0, []
    
    n = len(arr)
    dp = [1] * n
    parent = [-1] * n
    
    for i in range(1, n):
        for j in range(i):
            if arr[j] < arr[i] and dp[j] + 1 > dp[i]:
                dp[i] = dp[j] + 1
                parent[i] = j
    
    # Find the index with maximum LIS length
    max_len = max(dp)
    max_idx = dp.index(max_len)
    
    # Reconstruct sequence
    sequence = []
    idx = max_idx
    while idx != -1:
        sequence.append(arr[idx])
        idx = parent[idx]
    
    sequence.reverse()
    return max_len, sequence

