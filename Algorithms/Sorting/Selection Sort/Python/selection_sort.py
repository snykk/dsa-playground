"""
Selection Sort Implementation

Selection Sort is a simple sorting algorithm that repeatedly finds
the minimum element from unsorted part and puts it at the beginning.
"""


def selection_sort(arr):
    """
    Sort an array using Selection Sort algorithm
    
    Args:
        arr: List of comparable elements to sort (modified in-place)
        
    Returns:
        The sorted array (same reference as input)
        
    Time Complexity: O(n^2)
    Space Complexity: O(1)
    """
    n = len(arr)
    
    # One by one move boundary of unsorted subarray
    for i in range(n):
        # Find the minimum element in remaining unsorted array
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        
        # Swap the found minimum element with the first element
        # (skipped when it is already there: at most n - 1 swaps in total)
        if min_idx != i:
            arr[i], arr[min_idx] = arr[min_idx], arr[i]
    
    return arr

