"""
Heap Sort Implementation

Heap Sort is a comparison-based sorting algorithm that uses a binary
heap data structure. It's similar to selection sort but uses a heap
to find the maximum element.
"""


def heap_sort(arr):
    """
    Sort an array using Heap Sort algorithm
    
    Args:
        arr: List of comparable elements to sort (modified in-place)
        
    Returns:
        The sorted array (same reference as input)
        
    Time Complexity: O(n log n)
    Space Complexity: O(log n) for the recursion stack of heapify
    """
    n = len(arr)
    
    # Build max heap
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    
    # Extract elements from heap one by one
    for i in range(n - 1, 0, -1):
        # Move current root to end
        arr[0], arr[i] = arr[i], arr[0]
        
        # Call heapify on reduced heap
        heapify(arr, i, 0)
    
    return arr


def heapify(arr, n, i):
    """
    Heapify a subtree rooted at index i
    
    Args:
        arr: The array representing the heap
        n: Size of the heap
        i: Root index of the subtree
    """
    largest = i  # Initialize largest as root
    left = 2 * i + 1  # Left child
    right = 2 * i + 2  # Right child
    
    # If left child is larger than root
    if left < n and arr[left] > arr[largest]:
        largest = left
    
    # If right child is larger than largest so far
    if right < n and arr[right] > arr[largest]:
        largest = right
    
    # If largest is not root
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        
        # Recursively heapify the affected sub-tree
        heapify(arr, n, largest)

