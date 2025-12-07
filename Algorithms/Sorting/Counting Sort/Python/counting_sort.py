"""
Counting Sort Implementation

Counting Sort is a sorting algorithm that sorts the elements of an array
by counting the number of occurrences of each unique element in the array.
"""


def counting_sort(arr, max_val=None):
    """
    Sort an array using Counting Sort algorithm
    
    Args:
        arr: List of non-negative integers to sort
        max_val: Maximum value in array (auto-detected if None)
        
    Returns:
        The sorted array
        
    Time Complexity: O(n + k) where k is the range
    Space Complexity: O(k)
    """
    if not arr:
        return arr
    
    if max_val is None:
        max_val = max(arr)
    
    # Count array to store count of each element
    count = [0] * (max_val + 1)
    
    # Store count of each element
    for num in arr:
        count[num] += 1
    
    # Modify count array to store cumulative count
    for i in range(1, len(count)):
        count[i] += count[i - 1]
    
    # Output array
    output = [0] * len(arr)
    
    # Build output array
    for i in range(len(arr) - 1, -1, -1):
        output[count[arr[i]] - 1] = arr[i]
        count[arr[i]] -= 1
    
    return output


def counting_sort_simple(arr, max_val=None):
    """
    Simplified version of Counting Sort (not stable)
    
    Args:
        arr: List of non-negative integers to sort
        max_val: Maximum value in array
        
    Returns:
        The sorted array
    """
    if not arr:
        return arr
    
    if max_val is None:
        max_val = max(arr)
    
    count = [0] * (max_val + 1)
    
    for num in arr:
        count[num] += 1
    
    output = []
    for i in range(len(count)):
        output.extend([i] * count[i])
    
    return output

