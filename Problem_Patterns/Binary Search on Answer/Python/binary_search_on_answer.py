"""
Binary Search on Answer

Technique of binary searching on the answer space rather than the input array.
Used when we need to find the optimal value that satisfies certain conditions.
"""

from typing import List, Callable


def binary_search_answer(left: int, right: int, check: Callable[[int], bool]) -> int:
    """
    Binary search on answer space.
    
    Args:
        left: Left bound of answer space
        right: Right bound of answer space
        check: Function that returns True if answer is valid; it must be
            monotone (False ... False True ... True) over [left, right]

    Returns:
        Smallest value in [left, right] for which check is True, or -1 if
        there is none (same as the C++ and Go versions)

    Time Complexity: O(log(max_answer) * T(check))
    Space Complexity: O(1)
    """
    result = -1  # stays -1 when no candidate is feasible
    
    while left <= right:
        mid = left + (right - left) // 2
        
        if check(mid):
            result = mid
            right = mid - 1  # Search for smaller valid answer
        else:
            left = mid + 1
    
    return result


def find_min_capacity(weights: List[int], days: int) -> int:
    """
    Find minimum ship capacity to ship all packages within given days.
    
    Args:
        weights: List of package weights
        days: Number of days available
        
    Returns:
        Minimum ship capacity needed, or -1 if no capacity works (days < 1)

    Time Complexity: O(n log(sum(weights)))
    Space Complexity: O(1)
    """
    def can_ship(capacity: int) -> bool:
        current_weight = 0
        days_needed = 1
        
        for weight in weights:
            if weight > capacity:
                return False
            if current_weight + weight > capacity:
                days_needed += 1
                current_weight = weight
            else:
                current_weight += weight
        
        return days_needed <= days
    
    left = max(weights)
    right = sum(weights)
    
    return binary_search_answer(left, right, can_ship)


def find_kth_smallest_distance(nums: List[int], k: int) -> int:
    """
    Find k-th smallest distance between pairs of numbers.
    
    Args:
        nums: Sorted array of numbers
        k: k-th smallest distance
        
    Returns:
        k-th smallest distance, or -1 if there are fewer than k pairs
        (same as the C++ and Go versions)

    Time Complexity: O(n log(max_distance))
    Space Complexity: O(1)
    """
    def count_pairs_with_distance(distance: int) -> int:
        count = 0
        j = 0
        for i in range(len(nums)):
            while j < len(nums) and nums[j] - nums[i] <= distance:
                j += 1
            count += j - i - 1
        return count
    
    nums.sort()
    left = 0
    right = nums[-1] - nums[0]
    
    while left < right:
        mid = left + (right - left) // 2
        if count_pairs_with_distance(mid) < k:
            left = mid + 1
        else:
            right = mid

    # The loop always lands on a value; it is only an answer if k pairs exist.
    return left if count_pairs_with_distance(left) >= k else -1


def split_array_largest_sum(nums: List[int], m: int) -> int:
    """
    Split array into m non-empty subarrays with minimum largest sum.
    
    Args:
        nums: Array of numbers
        m: Number of subarrays
        
    Returns:
        Minimum largest sum, or -1 if no split works (m < 1)

    Time Complexity: O(n log(sum(nums)))
    Space Complexity: O(1)
    """
    def can_split(max_sum: int) -> bool:
        current_sum = 0
        splits = 1
        
        for num in nums:
            if current_sum + num > max_sum:
                splits += 1
                current_sum = num
            else:
                current_sum += num
        
        return splits <= m
    
    left = max(nums)
    right = sum(nums)
    
    return binary_search_answer(left, right, can_split)


def main():
    """Example usage."""
    print("Binary Search on Answer Examples:")
    print()
    
    # Find minimum ship capacity
    weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    days = 5
    result = find_min_capacity(weights, days)
    print(f"Minimum ship capacity for {weights} in {days} days: {result}")
    print()
    
    # Split array largest sum
    nums = [7, 2, 5, 10, 8]
    m = 2
    result = split_array_largest_sum(nums, m)
    print(f"Minimum largest sum splitting {nums} into {m} subarrays: {result}")


if __name__ == "__main__":
    main()

