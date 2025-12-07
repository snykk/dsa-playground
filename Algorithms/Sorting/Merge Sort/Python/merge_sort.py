"""
Merge Sort Implementation

Merge Sort is a divide and conquer algorithm that divides the array
into two halves, sorts them, and then merges them.
"""


def merge_sort(arr):
    """
    Sort an array using Merge Sort algorithm
    
    Args:
        arr: List of comparable elements to sort (modified in-place)
        
    Returns:
        The sorted array
        
    Time Complexity: O(n log n)
    Space Complexity: O(n)
    """
    if len(arr) <= 1:
        return arr
    
    # Divide the array into two halves
    mid = len(arr) // 2
    left = arr[:mid]
    right = arr[mid:]
    
    # Recursively sort both halves
    merge_sort(left)
    merge_sort(right)
    
    # Merge the sorted halves
    merge(arr, left, right)
    
    return arr


def merge(arr, left, right):
    """
    Merge two sorted subarrays into arr
    
    Args:
        arr: The original array to merge into
        left: Left sorted subarray
        right: Right sorted subarray
    """
    i = j = k = 0
    
    # Copy data to temp arrays left[] and right[]
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            arr[k] = left[i]
            i += 1
        else:
            arr[k] = right[j]
            j += 1
        k += 1
    
    # Copy remaining elements
    while i < len(left):
        arr[k] = left[i]
        i += 1
        k += 1
    
    while j < len(right):
        arr[k] = right[j]
        j += 1
        k += 1


def merge_sort_iterative(arr):
    """
    Iterative implementation of Merge Sort
    
    Args:
        arr: List of comparable elements to sort (modified in-place)
        
    Returns:
        The sorted array
        
    Time Complexity: O(n log n)
    Space Complexity: O(n)
    """
    n = len(arr)
    if n <= 1:
        return arr
    
    # Start with subarrays of size 1, then double the size
    size = 1
    while size < n:
        for left_start in range(0, n, 2 * size):
            mid = min(left_start + size, n)
            right_end = min(left_start + 2 * size, n)
            
            left = arr[left_start:mid]
            right = arr[mid:right_end]
            
            merge(arr[left_start:right_end], left, right)
        
        size *= 2
    
    return arr

