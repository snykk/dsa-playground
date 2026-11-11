"""
Interpolation Search Implementation

Interpolation Search is an improved variant of Binary Search for uniformly
distributed sorted arrays. It uses the value of the target to estimate
its position, similar to how humans search in a phone book.
"""


def interpolation_search(arr, target):
    """
    Search for target in sorted, uniformly distributed array using
    Interpolation Search
    
    Args:
        arr: Sorted list of uniformly distributed elements
        target: Element to search for
        
    Returns:
        Index of target if found, -1 otherwise
        
    Time Complexity: O(log log n) average, O(n) worst case
    Space Complexity: O(1)
    
    Note: Works best on uniformly distributed sorted arrays.
    Worst case occurs when distribution is non-uniform.
    """
    left, right = 0, len(arr) - 1
    
    while left <= right and arr[left] <= target <= arr[right]:
        # If search space has only one element, or all of its values are equal
        # (a run of duplicates): there is nothing to interpolate, and the
        # formula below would divide by zero (arr[right] - arr[left] == 0)
        if left == right or arr[left] == arr[right]:
            if arr[left] == target:
                return left
            return -1
        
        # Calculate position using interpolation formula
        # pos = left + ((target - arr[left]) * (right - left)) // (arr[right] - arr[left])
        pos = left + int(((target - arr[left]) * (right - left)) / (arr[right] - arr[left]))
        
        # Check if target is at calculated position
        if arr[pos] == target:
            return pos
        
        # If target is smaller, search left
        if arr[pos] > target:
            right = pos - 1
        # If target is larger, search right
        else:
            left = pos + 1
    
    # Target not found
    return -1


def interpolation_search_recursive(arr, target, left=0, right=None):
    """
    Recursive implementation of Interpolation Search
    
    Args:
        arr: Sorted list of uniformly distributed elements
        target: Element to search for
        left: Left boundary (default: 0)
        right: Right boundary (default: len(arr) - 1)
        
    Returns:
        Index of target if found, -1 otherwise
        
    Time Complexity: O(log log n) average, O(n) worst case
    Space Complexity: O(log log n) average, O(n) worst case
    """
    if right is None:
        right = len(arr) - 1
    
    # Base case: search space exhausted or target out of range
    if left > right or arr[left] > target or arr[right] < target:
        return -1
    
    # If search space has only one element, or all of its values are equal
    # (a run of duplicates): there is nothing to interpolate, and the
    # formula below would divide by zero (arr[right] - arr[left] == 0)
    if left == right or arr[left] == arr[right]:
        if arr[left] == target:
            return left
        return -1

    # Calculate position using interpolation formula
    pos = left + int(((target - arr[left]) * (right - left)) / (arr[right] - arr[left]))

    # Check if target is at calculated position
    if arr[pos] == target:
        return pos

    # If target is smaller, search left
    if arr[pos] > target:
        return interpolation_search_recursive(arr, target, left, pos - 1)
    # If target is larger, search right
    else:
        return interpolation_search_recursive(arr, target, pos + 1, right)

