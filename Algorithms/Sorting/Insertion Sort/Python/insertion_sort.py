"""
Insertion Sort Implementation

Insertion Sort is a simple sorting algorithm that builds the final
sorted array one item at a time. It is much less efficient on large
lists than more advanced algorithms.
"""


def insertion_sort(arr):
    """
    Sort an array using Insertion Sort algorithm
    
    Args:
        arr: List of comparable elements to sort (modified in-place)
        
    Returns:
        The sorted array (same reference as input)
        
    Time Complexity: O(n²)
    Space Complexity: O(1)
    """
    # Traverse through 1 to len(arr)
    for i in range(1, len(arr)):
        key = arr[i]
        
        # Move elements of arr[0..i-1], that are greater than key,
        # to one position ahead of their current position
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        
        arr[j + 1] = key
    
    return arr


def insertion_sort_recursive(arr, n=None):
    """
    Recursive implementation of Insertion Sort
    
    Args:
        arr: List of comparable elements to sort (modified in-place)
        n: Number of elements to sort (defaults to len(arr))
        
    Returns:
        The sorted array (same reference as input)
        
    Time Complexity: O(n²)
    Space Complexity: O(n) due to recursion stack
    """
    if n is None:
        n = len(arr)
    
    # Base case
    if n <= 1:
        return arr
    
    # Sort first n-1 elements
    insertion_sort_recursive(arr, n - 1)
    
    # Insert last element at its correct position
    last = arr[n - 1]
    j = n - 2
    
    while j >= 0 and arr[j] > last:
        arr[j + 1] = arr[j]
        j -= 1
    
    arr[j + 1] = last
    
    return arr

