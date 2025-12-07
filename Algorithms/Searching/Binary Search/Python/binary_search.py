"""
Binary Search Implementation

Binary Search is an efficient searching algorithm that finds the position
of a target value within a sorted array by repeatedly dividing the search
interval in half.
"""


def binary_search(arr, target):
    """
    Search for target in sorted array using Binary Search (iterative)
    
    Args:
        arr: Sorted list of elements
        target: Element to search for
        
    Returns:
        Index of target if found, -1 otherwise
        
    Time Complexity: O(log n)
    Space Complexity: O(1)
    """
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = left + (right - left) // 2
        
        # Check if target is present at mid
        if arr[mid] == target:
            return mid
        
        # If target is greater, ignore left half
        elif arr[mid] < target:
            left = mid + 1
        
        # If target is smaller, ignore right half
        else:
            right = mid - 1
    
    # Target not found
    return -1


def binary_search_recursive(arr, target, left=0, right=None):
    """
    Recursive implementation of Binary Search
    
    Args:
        arr: Sorted list of elements
        target: Element to search for
        left: Left boundary (default: 0)
        right: Right boundary (default: len(arr) - 1)
        
    Returns:
        Index of target if found, -1 otherwise
        
    Time Complexity: O(log n)
    Space Complexity: O(log n) due to recursion stack
    """
    if right is None:
        right = len(arr) - 1
    
    # Base case: search space exhausted
    if left > right:
        return -1
    
    mid = left + (right - left) // 2
    
    # Check if target is present at mid
    if arr[mid] == target:
        return mid
    
    # If target is greater, search right half
    elif arr[mid] < target:
        return binary_search_recursive(arr, target, mid + 1, right)
    
    # If target is smaller, search left half
    else:
        return binary_search_recursive(arr, target, left, mid - 1)


def binary_search_first_occurrence(arr, target):
    """
    Find first occurrence of target in sorted array (may have duplicates)
    
    Args:
        arr: Sorted list of elements (may have duplicates)
        target: Element to search for
        
    Returns:
        Index of first occurrence if found, -1 otherwise
        
    Time Complexity: O(log n)
    Space Complexity: O(1)
    """
    left, right = 0, len(arr) - 1
    result = -1
    
    while left <= right:
        mid = left + (right - left) // 2
        
        if arr[mid] == target:
            result = mid
            right = mid - 1  # Continue searching left
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return result


def binary_search_last_occurrence(arr, target):
    """
    Find last occurrence of target in sorted array (may have duplicates)
    
    Args:
        arr: Sorted list of elements (may have duplicates)
        target: Element to search for
        
    Returns:
        Index of last occurrence if found, -1 otherwise
        
    Time Complexity: O(log n)
    Space Complexity: O(1)
    """
    left, right = 0, len(arr) - 1
    result = -1
    
    while left <= right:
        mid = left + (right - left) // 2
        
        if arr[mid] == target:
            result = mid
            left = mid + 1  # Continue searching right
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return result


def binary_search_closest(arr, target):
    """
    Find index of element closest to target in sorted array
    
    Args:
        arr: Sorted list of elements
        target: Target value
        
    Returns:
        Index of closest element
        
    Time Complexity: O(log n)
    Space Complexity: O(1)
    """
    left, right = 0, len(arr) - 1
    
    while left < right:
        mid = left + (right - left) // 2
        
        if arr[mid] < target:
            left = mid + 1
        else:
            right = mid
    
    # Check which is closer: left or left-1
    if left > 0 and abs(arr[left - 1] - target) < abs(arr[left] - target):
        return left - 1
    return left

