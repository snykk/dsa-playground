"""
Bucket Sort Implementation

Bucket Sort is a sorting algorithm that works by distributing elements
of an array into a number of buckets. Each bucket is then sorted individually.

bucket_sort expects values in [0.0, 1.0] and raises ValueError for anything
else (negative values, values above 1.0, NaN), because such a value has no
bucket. bucket_sort_integers accepts any integers, negative ones included.
"""


def bucket_sort(arr, num_buckets=None):
    """
    Sort an array using Bucket Sort algorithm
    
    Args:
        arr: List of floating point numbers in range [0.0, 1.0]
             (1.0 goes to the last bucket)
        num_buckets: Number of buckets (defaults to len(arr))
        
    Returns:
        The sorted array
        
    Raises:
        ValueError: if a value is outside [0.0, 1.0]
        
    Time Complexity: O(n + k) average, O(n^2) worst
    Space Complexity: O(n)
    """
    if not arr:
        return arr
    
    for num in arr:
        if not 0.0 <= num <= 1.0:  # also rejects NaN
            raise ValueError(f"bucket_sort expects values in [0.0, 1.0], got {num!r}")
    
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
    Bucket Sort for integers with one bucket per value, i.e. counting sort
    with lists instead of counters (O(n + k) time and memory, where
    k = max_val - min(arr) + 1).
    
    Args:
        arr: List of integers (negative values are allowed)
        max_val: Maximum value in array (auto-detected if None)
        
    Returns:
        The sorted array
        
    Raises:
        ValueError: if max_val is smaller than the largest value in arr
    """
    if not arr:
        return arr
    
    largest = max(arr)
    if max_val is None:
        max_val = largest
    elif largest > max_val:
        raise ValueError(f"max_val={max_val} is smaller than the largest value {largest}")
    min_val = min(arr)
    
    # Create buckets: bucket x - min_val holds the value x
    num_buckets = max_val - min_val + 1
    buckets = [[] for _ in range(num_buckets)]
    
    # Insert elements into buckets
    for num in arr:
        buckets[num - min_val].append(num)
    
    # Concatenate all buckets
    result = []
    for bucket in buckets:
        result.extend(bucket)
    
    return result

