"""
Ternary Search Implementation

Ternary Search is a divide-and-conquer algorithm that finds the position
of a target value in a sorted array by dividing the search space into
three parts instead of two (like Binary Search).
"""


def ternary_search(arr, target):
    """
    Search for target in sorted array using Ternary Search (iterative)
    
    Args:
        arr: Sorted list of elements
        target: Element to search for
        
    Returns:
        Index of target if found, -1 otherwise
        
    Time Complexity: O(log3(n))
    Space Complexity: O(1)
    """
    left, right = 0, len(arr) - 1
    
    while left <= right:
        # Divide search space into three parts
        mid1 = left + (right - left) // 3
        mid2 = right - (right - left) // 3
        
        # Check if target is at mid1
        if arr[mid1] == target:
            return mid1
        
        # Check if target is at mid2
        if arr[mid2] == target:
            return mid2
        
        # If target is in left third
        if target < arr[mid1]:
            right = mid1 - 1
        # If target is in right third
        elif target > arr[mid2]:
            left = mid2 + 1
        # If target is in middle third
        else:
            left = mid1 + 1
            right = mid2 - 1
    
    # Target not found
    return -1


def ternary_search_recursive(arr, target, left=0, right=None):
    """
    Recursive implementation of Ternary Search
    
    Args:
        arr: Sorted list of elements
        target: Element to search for
        left: Left boundary (default: 0)
        right: Right boundary (default: len(arr) - 1)
        
    Returns:
        Index of target if found, -1 otherwise
        
    Time Complexity: O(log3(n))
    Space Complexity: O(log3(n)) due to recursion stack
    """
    if right is None:
        right = len(arr) - 1
    
    # Base case: search space exhausted
    if left > right:
        return -1
    
    # Divide search space into three parts
    mid1 = left + (right - left) // 3
    mid2 = right - (right - left) // 3
    
    # Check if target is at mid1
    if arr[mid1] == target:
        return mid1
    
    # Check if target is at mid2
    if arr[mid2] == target:
        return mid2
    
    # If target is in left third
    if target < arr[mid1]:
        return ternary_search_recursive(arr, target, left, mid1 - 1)
    # If target is in right third
    elif target > arr[mid2]:
        return ternary_search_recursive(arr, target, mid2 + 1, right)
    # If target is in middle third
    else:
        return ternary_search_recursive(arr, target, mid1 + 1, mid2 - 1)


def ternary_search_unimodal(func, left, right):
    """
    Find maximum of unimodal function using Ternary Search
    
    A unimodal function has a single maximum (or minimum) point.
    Function must be strictly increasing then strictly decreasing.
    
    Args:
        func: Unimodal function (callable)
        left: Left boundary
        right: Right boundary
        
    Returns:
        x value at which function reaches maximum
        
    Time Complexity: O(log3(n))
    Space Complexity: O(1)
    """
    while right - left > 2:
        # Divide search space into three parts
        mid1 = left + (right - left) // 3
        mid2 = right - (right - left) // 3
        
        # Ensure we make progress - if mid1 equals left, increment it
        if mid1 == left:
            mid1 = left + 1
        # If mid2 equals right, decrement it
        if mid2 == right:
            mid2 = right - 1
        # If mid1 >= mid2, we can't make progress, break
        if mid1 >= mid2:
            break
        
        # Compare function values at mid1 and mid2
        if func(mid1) < func(mid2):
            # Maximum is in right two-thirds (including mid2)
            left = mid1
        else:
            # Maximum is in left two-thirds (including mid1)
            right = mid2
    
    # When search space is small enough, check all remaining points
    max_val = func(left)
    max_pos = left
    
    for i in range(left + 1, right + 1):
        val = func(i)
        if val > max_val:
            max_val = val
            max_pos = i
    
    return max_pos

