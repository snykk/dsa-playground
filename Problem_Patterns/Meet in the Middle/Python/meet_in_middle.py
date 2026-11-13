"""
Meet in the Middle Pattern Implementation

This module demonstrates the Meet in the Middle technique for the Subset Sum problem.
Problem: Find the largest subset sum less than or equal to a target.
"""

from typing import List
import bisect

def get_subset_sums(arr: List[int]) -> List[int]:
    """
    Generate all possible subset sums of the given array.
    Time Complexity: O(2^N)
    Space Complexity: O(2^N)
    """
    sums = [0]
    for num in arr:
        n = len(sums)
        for i in range(n):
            sums.append(sums[i] + num)
    return sums

def closest_subset_sum(nums: List[int], target: int) -> int:
    """
    Find largest subset sum <= target using Meet in the Middle.
    
    Args:
        nums: List of non-negative integers
        target: Target sum
        
    Returns:
        Largest subset sum <= target (the empty subset, sum 0, counts)

    Raises:
        ValueError: if nums has a negative number (the pruning below is only
            valid for non-negative values) or if target is negative (then even
            the empty subset exceeds it, so no subset qualifies)

    Time Complexity: O(2^(N/2) * N)
    Space Complexity: O(2^(N/2))
    """
    if any(x < 0 for x in nums):
        raise ValueError("nums must be non-negative")
    if target < 0:
        raise ValueError("target must be non-negative")

    n = len(nums)
    if n == 0:
        return 0
        
    # Split array into two halves
    mid = n // 2
    left_part = nums[:mid]
    right_part = nums[mid:]
    
    # Generate all subset sums for each half
    left_sums = get_subset_sums(left_part)
    right_sums = get_subset_sums(right_part)
    
    # Sort right_sums for binary search
    right_sums.sort()
    
    max_sum = 0
    
    # For each sum in left_sums, find largest value in right_sums
    # such that left + right <= target
    for l_sum in left_sums:
        if l_sum > target:
            continue
            
        remaining = target - l_sum
        
        # Binary search (bisect_right returns index where insertion keeps order)
        # index-1 is the largest element <= remaining
        idx = bisect.bisect_right(right_sums, remaining)
        
        if idx > 0:
            current_sum = l_sum + right_sums[idx - 1]
            max_sum = max(max_sum, current_sum)
            
    return max_sum

def main():
    print("=== Meet in the Middle: Closest Subset Sum ===")
    nums = [5, 3, 2, 7, 10]
    target = 14
    result = closest_subset_sum(nums, target)
    print(f"Nums: {nums}, Target: {target}")
    print(f"Closest subset sum <= target: {result}") # Expected: 14 (5+2+7)


if __name__ == "__main__":
    main()
