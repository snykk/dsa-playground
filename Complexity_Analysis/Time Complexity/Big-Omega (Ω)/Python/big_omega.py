"""
Big-Omega (Ω) Notation Implementation and Examples

Big-Omega notation describes the lower bound of an algorithm's time complexity.
It represents the best-case scenario for how the runtime grows with input size.

Formal Definition:
f(n) = Ω(g(n)) if there exist positive constants c and n₀ such that
0 ≤ c·g(n) ≤ f(n) for all n ≥ n₀

This means f(n) is bounded below by g(n).
"""


def linear_search_best_case(arr, target):
    """
    Ω(1) - Best case for linear search
    If target is at the first position, we find it immediately.
    
    Args:
        arr: List of elements
        target: Element to search for
        
    Returns:
        Index of target if found, -1 otherwise
        
    Time Complexity: O(n) worst case, Ω(1) best case
    Space Complexity: O(1)
    """
    for i, element in enumerate(arr):
        if element == target:
            return i
    return -1


def bubble_sort_best_case(arr):
    """
    Ω(n) - Best case for bubble sort
    If array is already sorted, we still need to check all elements once.
    
    Args:
        arr: List of elements to sort
        
    Returns:
        Sorted list
        
    Time Complexity: O(n²) worst case, Ω(n) best case
    Space Complexity: O(1)
    """
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr


def quick_sort_best_case(arr):
    """
    Ω(n log n) - Best case for quick sort
    When pivot always divides array in half (balanced partition).
    
    Args:
        arr: List of elements to sort
        
    Returns:
        Sorted list
        
    Time Complexity: O(n²) worst case, Ω(n log n) best case
    Space Complexity: O(log n)
    """
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quick_sort_best_case(left) + middle + quick_sort_best_case(right)


def matrix_traversal_lower_bound(matrix):
    """
    Ω(n²) - Lower bound for matrix traversal
    Must visit every element in an n×n matrix.
    
    Args:
        matrix: 2D list (n×n matrix)
        
    Returns:
        Sum of all elements
        
    Time Complexity: Ω(n²) - tight bound
    Space Complexity: O(1)
    """
    total = 0
    for row in matrix:
        for element in row:
            total += element
    return total


def demonstrate_big_omega():
    """
    Demonstrate Big-Omega notation with examples.
    """
    print("=== Big-Omega (Ω) Notation Examples ===\n")
    print("Big-Omega provides a LOWER BOUND (best case)\n")
    
    # Ω(1) - Constant lower bound
    print("Ω(1) - Constant Lower Bound:")
    arr = [5, 3, 8, 1, 9]
    result = linear_search_best_case(arr, 5)  # Target at first position
    print(f"  Linear search (best case): found at index {result}")
    print("  Explanation: Best case is O(1) when target is first\n")
    
    # Ω(n) - Linear lower bound
    print("Ω(n) - Linear Lower Bound:")
    sorted_arr = [1, 2, 3, 4, 5]
    bubble_sort_best_case(sorted_arr.copy())
    print(f"  Bubble sort (best case): already sorted array")
    print("  Explanation: Even best case requires checking all elements\n")
    
    # Ω(n log n) - Linearithmic lower bound
    print("Ω(n log n) - Linearithmic Lower Bound:")
    arr = [64, 34, 25, 12, 22, 11, 90]
    sorted_result = quick_sort_best_case(arr)
    print(f"  Quick sort (best case): {sorted_result}")
    print("  Explanation: Best case requires n log n operations\n")
    
    # Ω(n²) - Quadratic lower bound
    print("Ω(n²) - Quadratic Lower Bound:")
    matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    total = matrix_traversal_lower_bound(matrix)
    print(f"  Matrix traversal: sum = {total}")
    print("  Explanation: Must visit all n² elements\n")
    
    print("=== Key Difference: Big-O vs Big-Omega ===\n")
    print("Big-O (O): Upper bound (worst case)")
    print("  Example: Linear search is O(n) worst case\n")
    print("Big-Omega (Ω): Lower bound (best case)")
    print("  Example: Linear search is Ω(1) best case\n")
    print("Big-Theta (Θ): Tight bound (best = worst)")
    print("  Example: Binary search is Θ(log n) in all cases\n")


if __name__ == "__main__":
    demonstrate_big_omega()
