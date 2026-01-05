"""
Big-Theta (Θ) Notation Implementation and Examples

Big-Theta notation describes a tight bound on an algorithm's time complexity.
It represents both the upper and lower bounds, meaning the algorithm's growth
rate is bounded both above and below by the same function.

Formal Definition:
f(n) = Θ(g(n)) if there exist positive constants c₁, c₂, and n₀ such that
0 ≤ c₁·g(n) ≤ f(n) ≤ c₂·g(n) for all n ≥ n₀

This means f(n) is bounded both above and below by g(n).
"""


def tight_bound_example(arr):
    """
    Θ(n) - Tight bound example
    This function has both upper and lower bounds of O(n).
    It must process every element exactly once.
    
    Args:
        arr: List of elements
        
    Returns:
        Sum of all elements
        
    Time Complexity: Θ(n) - tight bound
    Space Complexity: O(1)
    """
    total = 0
    for element in arr:
        total += element
    return total


def merge_sort_example(arr):
    """
    Θ(n log n) - Tight bound for merge sort
    Merge sort has a tight bound because:
    - Best case: Θ(n log n)
    - Average case: Θ(n log n)
    - Worst case: Θ(n log n)
    
    Args:
        arr: List of elements to sort
        
    Returns:
        Sorted list
        
    Time Complexity: Θ(n log n) - tight bound
    Space Complexity: O(n)
    """
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort_example(arr[:mid])
    right = merge_sort_example(arr[mid:])
    
    # Merge step: Θ(n)
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result


def binary_search_example(arr, target):
    """
    Θ(log n) - Tight bound for binary search
    Binary search has a tight bound because it always
    eliminates half of the search space.
    
    Args:
        arr: Sorted list of elements
        target: Element to search for
        
    Returns:
        Index of target if found, -1 otherwise
        
    Time Complexity: Θ(log n) - tight bound
    Space Complexity: O(1)
    """
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1


def matrix_multiplication_naive(A, B):
    """
    Θ(n³) - Tight bound for naive matrix multiplication
    For n×n matrices, we must compute n² elements,
    each requiring n multiplications.
    
    Args:
        A: First matrix (n×n)
        B: Second matrix (n×n)
        
    Returns:
        Product matrix (n×n)
        
    Time Complexity: Θ(n³) - tight bound
    Space Complexity: O(n²)
    """
    n = len(A)
    C = [[0] * n for _ in range(n)]
    
    for i in range(n):
        for j in range(n):
            for k in range(n):
                C[i][j] += A[i][k] * B[k][j]
    
    return C


def demonstrate_big_theta():
    """
    Demonstrate Big-Theta notation with examples.
    """
    print("=== Big-Theta (Θ) Notation Examples ===\n")
    print("Big-Theta provides a TIGHT BOUND (both upper and lower)\n")
    
    # Θ(n) - Linear tight bound
    print("Θ(n) - Linear Tight Bound:")
    arr = list(range(1, 11))
    result = tight_bound_example(arr)
    print(f"  Sum of {len(arr)} elements: {result}")
    print("  Explanation: Must process every element exactly once\n")
    
    # Θ(log n) - Logarithmic tight bound
    print("Θ(log n) - Logarithmic Tight Bound:")
    sorted_arr = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
    target = 11
    index = binary_search_example(sorted_arr, target)
    print(f"  Binary search for {target}: found at index {index}")
    print("  Explanation: Always eliminates half the search space\n")
    
    # Θ(n log n) - Linearithmic tight bound
    print("Θ(n log n) - Linearithmic Tight Bound:")
    unsorted = [64, 34, 25, 12, 22, 11, 90]
    sorted_result = merge_sort_example(unsorted)
    print(f"  Merge sort: {sorted_result}")
    print("  Explanation: Always requires n log n operations\n")
    
    # Θ(n³) - Cubic tight bound
    print("Θ(n³) - Cubic Tight Bound:")
    n = 3
    A = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    B = [[9, 8, 7], [6, 5, 4], [3, 2, 1]]
    C = matrix_multiplication_naive(A, B)
    print(f"  Matrix multiplication ({n}×{n}):")
    for row in C:
        print(f"    {row}")
    print("  Explanation: Always requires n³ operations\n")
    
    print("=== Key Difference: Big-O vs Big-Theta ===\n")
    print("Big-O (O): Upper bound only (worst case)")
    print("  Example: Quick sort is O(n²) worst case, but O(n log n) average")
    print("  → Cannot use Θ(n log n) because worst case is worse\n")
    print("Big-Theta (Θ): Tight bound (best = average = worst)")
    print("  Example: Merge sort is Θ(n log n) in all cases")
    print("  → Can use Θ(n log n) because all cases are the same\n")


if __name__ == "__main__":
    demonstrate_big_theta()

