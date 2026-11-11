"""
Bubble Sort Implementation

Bubble Sort is a simple sorting algorithm that repeatedly steps through
the list, compares adjacent elements and swaps them if they are in the
wrong order. The pass through the list is repeated until no swaps are
needed, which indicates that the list is sorted.
"""


def bubble_sort(arr):
    """
    Sort an array using Bubble Sort algorithm
    
    Args:
        arr: List of comparable elements to sort (modified in-place)
        
    Returns:
        The sorted array (same reference as input)
        
    Time Complexity: O(n^2)
    Space Complexity: O(1)
    """
    n = len(arr)
    
    # Traverse through all array elements
    for i in range(n):
        swapped = False
        
        # Last i elements are already in place
        for j in range(0, n - i - 1):
            # Traverse the array from 0 to n-i-1
            # Swap if the element found is greater than the next element
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        
        # If no two elements were swapped by inner loop, then break
        if not swapped:
            break
    
    return arr


def bubble_sort_optimized(arr):
    """
    Optimized version of Bubble Sort with early termination
    
    Args:
        arr: List of comparable elements to sort (modified in-place)
        
    Returns:
        The sorted array (same reference as input)
        
    Time Complexity: O(n^2) worst case, O(n) best case (already sorted)
    Space Complexity: O(1)
    """
    n = len(arr)
    
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        
        # Early termination if no swaps occurred
        if not swapped:
            break
    
    return arr


def bubble_sort_recursive(arr, n=None):
    """
    Recursive implementation of Bubble Sort
    
    Args:
        arr: List of comparable elements to sort (modified in-place)
        n: Length of array (defaults to len(arr))
        
    Returns:
        The sorted array (same reference as input)
        
    Time Complexity: O(n^2)
    Space Complexity: O(n) due to recursion stack
    """
    if n is None:
        n = len(arr)
    
    # Base case: an empty or one-element prefix is already sorted
    if n <= 1:
        return arr
    
    # One pass of bubble sort. After this pass, the largest element
    # is moved (bubbled) to end
    for i in range(n - 1):
        if arr[i] > arr[i + 1]:
            arr[i], arr[i + 1] = arr[i + 1], arr[i]
    
    # Recur for remaining array
    bubble_sort_recursive(arr, n - 1)
    
    return arr

