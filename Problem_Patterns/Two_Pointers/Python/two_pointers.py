"""
Two Pointers

Technique using two pointers moving through data structure, typically:
- Left-right pointers (sorted arrays)
- Fast-slow pointers (linked lists)
"""

from typing import List, Optional


def two_sum_sorted(arr: List[int], target: int) -> Optional[List[int]]:
    """
    Find two numbers that add up to target in sorted array.
    
    Args:
        arr: Sorted array
        target: Target sum
        
    Returns:
        Indices of two numbers, None if not found
        
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    left, right = 0, len(arr) - 1
    
    while left < right:
        current_sum = arr[left] + arr[right]
        if current_sum == target:
            return [left, right]
        elif current_sum < target:
            left += 1
        else:
            right -= 1
    
    return None


def three_sum(arr: List[int], target: int) -> List[List[int]]:
    """
    Find all unique triplets that sum to target.
    
    Args:
        arr: Array of integers
        target: Target sum
        
    Returns:
        List of triplets
        
    Time Complexity: O(n^2)
    Space Complexity: O(1) excluding output
    """
    arr.sort()
    result = []
    
    for i in range(len(arr) - 2):
        # Skip duplicates
        if i > 0 and arr[i] == arr[i - 1]:
            continue
        
        left, right = i + 1, len(arr) - 1
        
        while left < right:
            current_sum = arr[i] + arr[left] + arr[right]
            if current_sum == target:
                result.append([arr[i], arr[left], arr[right]])
                # Skip duplicates
                while left < right and arr[left] == arr[left + 1]:
                    left += 1
                while left < right and arr[right] == arr[right - 1]:
                    right -= 1
                left += 1
                right -= 1
            elif current_sum < target:
                left += 1
            else:
                right -= 1
    
    return result


def is_palindrome(s: str) -> bool:
    """
    Check if string is palindrome using two pointers.
    
    Args:
        s: Input string
        
    Returns:
        True if palindrome, False otherwise
        
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    left, right = 0, len(s) - 1
    
    while left < right:
        # Skip non-alphanumeric
        while left < right and not s[left].isalnum():
            left += 1
        while left < right and not s[right].isalnum():
            right -= 1
        
        if s[left].lower() != s[right].lower():
            return False
        
        left += 1
        right -= 1
    
    return True


def remove_duplicates(arr: List[int]) -> int:
    """
    Remove duplicates from sorted array in-place.
    
    Args:
        arr: Sorted array with duplicates
        
    Returns:
        Length of array after removing duplicates
        
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    if not arr:
        return 0
    
    write_index = 1
    
    for read_index in range(1, len(arr)):
        if arr[read_index] != arr[write_index - 1]:
            arr[write_index] = arr[read_index]
            write_index += 1
    
    return write_index


def container_with_most_water(heights: List[int]) -> int:
    """
    Find maximum area of water that can be contained.
    
    Args:
        heights: Array of heights
        
    Returns:
        Maximum area
        
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    left, right = 0, len(heights) - 1
    max_area = 0
    
    while left < right:
        width = right - left
        height = min(heights[left], heights[right])
        area = width * height
        max_area = max(max_area, area)
        
        # Move pointer with smaller height
        if heights[left] < heights[right]:
            left += 1
        else:
            right -= 1
    
    return max_area


def main():
    """Example usage."""
    print("Two Pointers Examples:")
    print()
    
    # Two sum in sorted array
    arr = [2, 7, 11, 15]
    target = 9
    result = two_sum_sorted(arr, target)
    print(f"Two sum {target} in {arr}: {result}")
    print()
    
    # Three sum
    arr = [-1, 0, 1, 2, -1, -4]
    target = 0
    result = three_sum(arr, target)
    print(f"Three sum {target} in {arr}: {result}")
    print()
    
    # Palindrome check
    s = "A man, a plan, a canal: Panama"
    result = is_palindrome(s)
    print(f"Is '{s}' palindrome: {result}")
    print()
    
    # Remove duplicates
    arr = [1, 1, 2, 2, 3, 4, 4, 5]
    length = remove_duplicates(arr)
    print(f"Array after removing duplicates: {arr[:length]}")
    print()
    
    # Container with most water
    heights = [1, 8, 6, 2, 5, 4, 8, 3, 7]
    result = container_with_most_water(heights)
    print(f"Maximum water area: {result}")


if __name__ == "__main__":
    main()

