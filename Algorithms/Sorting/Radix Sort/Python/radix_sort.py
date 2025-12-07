"""
Radix Sort Implementation

Radix Sort is a non-comparative sorting algorithm that sorts numbers
by processing individual digits. It uses counting sort as a subroutine.
"""


def radix_sort(arr):
    """
    Sort an array using Radix Sort algorithm (LSD - Least Significant Digit)
    
    Args:
        arr: List of non-negative integers to sort
        
    Returns:
        The sorted array
        
    Time Complexity: O(d × (n + k)) where d is number of digits
    Space Complexity: O(n + k)
    """
    if not arr:
        return arr
    
    # Find the maximum number to know number of digits
    max_num = max(arr)
    
    # Do counting sort for every digit
    exp = 1
    while max_num // exp > 0:
        counting_sort_by_digit(arr, exp)
        exp *= 10
    
    return arr


def counting_sort_by_digit(arr, exp):
    """
    Counting sort for a specific digit position
    
    Args:
        arr: The array to sort
        exp: The exponent (1, 10, 100, ...)
    """
    n = len(arr)
    output = [0] * n
    count = [0] * 10
    
    # Store count of occurrences
    for i in range(n):
        index = (arr[i] // exp) % 10
        count[index] += 1
    
    # Change count[i] so that count[i] contains actual position
    for i in range(1, 10):
        count[i] += count[i - 1]
    
    # Build output array
    for i in range(n - 1, -1, -1):
        index = (arr[i] // exp) % 10
        output[count[index] - 1] = arr[i]
        count[index] -= 1
    
    # Copy output array to arr
    for i in range(n):
        arr[i] = output[i]

