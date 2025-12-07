"""
Quick Sort Implementation

Quick Sort is a divide and conquer algorithm that picks an element
as pivot and partitions the array around the pivot.
"""


def quick_sort(arr, low=0, high=None):
    """
    Sort an array using Quick Sort algorithm
    
    Args:
        arr: List of comparable elements to sort (modified in-place)
        low: Starting index (default: 0)
        high: Ending index (default: len(arr) - 1)
        
    Returns:
        The sorted array (same reference as input)
        
    Time Complexity: O(n log n) average, O(n²) worst
    Space Complexity: O(log n) average
    """
    if high is None:
        high = len(arr) - 1
    
    if low < high:
        # Partition the array and get pivot index
        pi = partition(arr, low, high)
        
        # Recursively sort elements before and after partition
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)
    
    return arr


def partition(arr, low, high):
    """
    Partition the array using last element as pivot
    
    Args:
        arr: The array to partition
        low: Starting index
        high: Ending index
        
    Returns:
        Index of pivot after partitioning
    """
    # Choose the rightmost element as pivot
    pivot = arr[high]
    
    # Index of smaller element (indicates right position of pivot)
    i = low - 1
    
    for j in range(low, high):
        # If current element is smaller than or equal to pivot
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    
    # Place pivot in correct position
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1


def quick_sort_hoare(arr, low=0, high=None):
    """
    Quick Sort using Hoare partition scheme
    
    Args:
        arr: List of comparable elements to sort (modified in-place)
        low: Starting index
        high: Ending index
        
    Returns:
        The sorted array
    """
    if high is None:
        high = len(arr) - 1
    
    if low < high:
        pi = partition_hoare(arr, low, high)
        quick_sort_hoare(arr, low, pi)
        quick_sort_hoare(arr, pi + 1, high)
    
    return arr


def partition_hoare(arr, low, high):
    """Hoare partition scheme"""
    pivot = arr[low]
    i = low - 1
    j = high + 1
    
    while True:
        i += 1
        while arr[i] < pivot:
            i += 1
        
        j -= 1
        while arr[j] > pivot:
            j -= 1
        
        if i >= j:
            return j
        
        arr[i], arr[j] = arr[j], arr[i]

