"""
Radix Sort Implementation

Radix Sort is a non-comparative sorting algorithm that sorts numbers
by processing individual digits. It uses counting sort as a subroutine.

Negative values are supported: when the minimum is negative, the digits
are taken from the shifted key value - minimum, which is never negative
and has the same order as the values.
"""


def radix_sort(arr):
    """
    Sort an array using Radix Sort algorithm (LSD - Least Significant Digit)
    
    Args:
        arr: List of integers to sort (modified in-place; negatives allowed)
        
    Returns:
        The sorted array
        
    Time Complexity: O(d * (n + k)) where d is number of digits
    Space Complexity: O(n + k)
    """
    if not arr:
        return arr
    
    # Shift negative input so that every key (value - offset) is >= 0
    offset = min(min(arr), 0)
    
    # Find the maximum key to know number of digits
    max_key = max(arr) - offset
    
    # Do counting sort for every digit
    exp = 1
    while max_key // exp > 0:
        counting_sort_by_digit(arr, exp, offset)
        exp *= 10
    
    return arr


def counting_sort_by_digit(arr, exp, offset=0):
    """
    Counting sort for a specific digit position (stable)
    
    Args:
        arr: The array to sort
        exp: The exponent (1, 10, 100, ...)
        offset: Subtracted from every value first, so keys are >= 0
    """
    n = len(arr)
    output = [0] * n
    count = [0] * 10
    
    # Store count of occurrences
    for i in range(n):
        index = ((arr[i] - offset) // exp) % 10
        count[index] += 1
    
    # Change count[i] so that count[i] contains actual position
    for i in range(1, 10):
        count[i] += count[i - 1]
    
    # Build output array
    for i in range(n - 1, -1, -1):
        index = ((arr[i] - offset) // exp) % 10
        output[count[index] - 1] = arr[i]
        count[index] -= 1
    
    # Copy output array to arr
    for i in range(n):
        arr[i] = output[i]

