"""
Linear Search Implementation

Linear Search is a simple searching algorithm that sequentially checks
each element in a list until a match is found or the entire list has
been searched.
"""


def linear_search(arr, target):
    """
    Search for target in array using Linear Search
    
    Args:
        arr: List of elements to search in
        target: Element to search for
        
    Returns:
        Index of target if found, -1 otherwise
        
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1


def linear_search_recursive(arr, target, index=0):
    """
    Recursive implementation of Linear Search
    
    Args:
        arr: List of elements to search in
        target: Element to search for
        index: Current index being checked (default: 0)
        
    Returns:
        Index of target if found, -1 otherwise
        
    Time Complexity: O(n)
    Space Complexity: O(n) due to recursion stack
    """
    # Base case: reached end of array
    if index >= len(arr):
        return -1
    
    # Base case: found target
    if arr[index] == target:
        return index
    
    # Recursive case: check next element
    return linear_search_recursive(arr, target, index + 1)


def linear_search_all_occurrences(arr, target):
    """
    Find all occurrences of target in array
    
    Args:
        arr: List of elements to search in
        target: Element to search for
        
    Returns:
        List of indices where target is found
        
    Time Complexity: O(n)
    Space Complexity: O(k) where k is number of occurrences
    """
    indices = []
    for i in range(len(arr)):
        if arr[i] == target:
            indices.append(i)
    return indices

