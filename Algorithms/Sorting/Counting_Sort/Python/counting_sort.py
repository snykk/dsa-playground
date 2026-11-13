"""
Counting Sort Implementation

Counting Sort is a sorting algorithm that sorts the elements of an array
by counting the number of occurrences of each unique element in the array.

Negative values are supported: a value x is counted in count[x - min_val],
so the count array has k = max_val - min_val + 1 slots.
"""


def _value_range(arr, max_val):
    """Return (min_val, max_val) for a non-empty arr, checking a given max_val."""
    largest = max(arr)
    if max_val is None:
        max_val = largest
    elif largest > max_val:
        raise ValueError(
            f"max_val={max_val} is smaller than the largest value {largest}"
        )
    return min(arr), max_val


def counting_sort(arr, max_val=None):
    """
    Sort an array using Counting Sort algorithm (stable)
    
    Args:
        arr: List of integers to sort (negative values are allowed)
        max_val: Maximum value in array (auto-detected if None)
        
    Returns:
        A new sorted list (an empty input is returned as is)
        
    Raises:
        ValueError: if max_val is smaller than the largest value in arr
        
    Time Complexity: O(n + k) where k = max_val - min_val + 1 is the range
    Space Complexity: O(n + k) (count array plus output array)
    """
    if not arr:
        return arr
    
    min_val, max_val = _value_range(arr, max_val)
    
    # Count array: slot x - min_val counts the value x
    count = [0] * (max_val - min_val + 1)
    
    # Store count of each element
    for num in arr:
        count[num - min_val] += 1
    
    # Modify count array to store cumulative count
    for i in range(1, len(count)):
        count[i] += count[i - 1]
    
    # Output array
    output = [0] * len(arr)
    
    # Build output array (back to front, which keeps equal values stable)
    for i in range(len(arr) - 1, -1, -1):
        output[count[arr[i] - min_val] - 1] = arr[i]
        count[arr[i] - min_val] -= 1
    
    return output


def counting_sort_simple(arr, max_val=None):
    """
    Simplified version of Counting Sort (not stable)
    
    Args:
        arr: List of integers to sort (negative values are allowed)
        max_val: Maximum value in array (auto-detected if None)
        
    Returns:
        The sorted array
        
    Raises:
        ValueError: if max_val is smaller than the largest value in arr
    """
    if not arr:
        return arr
    
    min_val, max_val = _value_range(arr, max_val)
    
    count = [0] * (max_val - min_val + 1)
    
    for num in arr:
        count[num - min_val] += 1
    
    output = []
    for i in range(len(count)):
        output.extend([i + min_val] * count[i])
    
    return output

