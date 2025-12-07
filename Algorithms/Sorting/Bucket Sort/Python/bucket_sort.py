"""
Bucket Sort Implementation

Bucket Sort is a sorting algorithm that works by distributing elements
of an array into a number of buckets. Each bucket is then sorted individually.
"""


def bucket_sort(arr, num_buckets=None):
    """
    Sort an array using Bucket Sort algorithm
    
    Args:
        arr: List of floating point numbers in range [0.0, 1.0)
        num_buckets: Number of buckets (defaults to len(arr))
        
    Returns:
        The sorted array
        
    Time Complexity: O(n + k) average, O(n²) worst
    Space Complexity: O(n)
    """
    if not arr:
        return arr
    
    if num_buckets is None:
        num_buckets = len(arr)
    
    # Create empty buckets
    buckets = [[] for _ in range(num_buckets)]
    
    # Insert elements into buckets
    for num in arr:
        bucket_index = int(num * num_buckets)
        # Handle edge case for 1.0
        if bucket_index == num_buckets:
            bucket_index = num_buckets - 1
        buckets[bucket_index].append(num)
    
    # Sort individual buckets using insertion sort
    for bucket in buckets:
        insertion_sort(bucket)
    
    # Concatenate all buckets
    result = []
    for bucket in buckets:
        result.extend(bucket)
    
    return result


def insertion_sort(arr):
    """Insertion sort for sorting individual buckets"""
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key


def bucket_sort_integers(arr, max_val=None):
    """
    Bucket Sort for integers
    
    Args:
        arr: List of non-negative integers
        max_val: Maximum value in array
        
    Returns:
        The sorted array
    """
    if not arr:
        return arr
    
    if max_val is None:
        max_val = max(arr)
    
    # Create buckets
    num_buckets = max_val + 1
    buckets = [[] for _ in range(num_buckets)]
    
    # Insert elements into buckets
    for num in arr:
        buckets[num].append(num)
    
    # Concatenate all buckets
    result = []
    for bucket in buckets:
        result.extend(bucket)
    
    return result

