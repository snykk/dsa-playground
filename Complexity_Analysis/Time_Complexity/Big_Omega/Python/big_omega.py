"""
Big-Omega (Omega) Notation Implementation and Examples

Big-Omega notation is an asymptotic lower bound on a function. In algorithm
analysis that function is a running time, and it can be the best-case, average-case
or worst-case time (Omega is not a synonym for "best case"). A lower bound on the
worst case says "some input of size n needs at least this long"; a lower bound on
the best case says "every input of size n needs at least this long".

Formal Definition:
f(n) = Omega(g(n)) if there exist positive constants c and n_0 such that
0 <= c*g(n) <= f(n) for all n >= n_0

This means f(n) is bounded below by g(n).
"""


def linear_search_best_case(arr, target):
    """
    Omega(1) - lower bound that holds for linear search on every input
    (it always does at least one comparison). The best case is Theta(1): the
    target is at the first position and is found immediately.
    
    Args:
        arr: List of elements
        target: Element to search for
        
    Returns:
        Index of target if found, -1 otherwise
        
    Time Complexity: best case Theta(1), worst case Theta(n)
    Space Complexity: O(1)
    """
    for i, element in enumerate(arr):
        if element == target:
            return i
    return -1


def bubble_sort_best_case(arr):
    """
    Omega(n) - lower bound for bubble sort with the early-exit flag, on every
    input: even an already sorted array needs one full pass (n - 1 comparisons).
    The best case (sorted input) is therefore Theta(n).
    
    Args:
        arr: List of elements to sort
        
    Returns:
        Sorted list
        
    Time Complexity: best case Theta(n), worst case Theta(n^2)
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
    Three-way quick sort that builds new lists (not in place), with the middle
    element as the pivot. The name is historical: it does NOT have an
    Omega(n log n) best case. Elements equal to the pivot are not recursed on, so
    an all-equal input is sorted in Theta(n) (one partition, no deeper calls).
    With distinct keys and perfectly balanced pivots it takes Theta(n log n).
    
    Args:
        arr: List of elements to sort
        
    Returns:
        Sorted list
        
    Time Complexity: best case Theta(n) (all keys equal), average Theta(n log n),
    worst case Theta(n^2)
    Space Complexity: O(n) extra per level of recursion, because every call
    allocates new lists; it is not O(log n)
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
    Theta(n^2) - visiting every element of an n x n matrix takes at least n^2
    steps (Omega(n^2)) and exactly that many (O(n^2)).
    
    Args:
        matrix: 2D list (nxn matrix)
        
    Returns:
        Sum of all elements
        
    Time Complexity: Theta(n^2) in every case
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
    print("=== Big-Omega (Omega) Notation Examples ===\n")
    print("Big-Omega is a LOWER BOUND on a function (any case can have one)\n")
    
    # Omega(1) - Constant lower bound
    print("Omega(1) - Constant Lower Bound:")
    arr = [5, 3, 8, 1, 9]
    result = linear_search_best_case(arr, 5)  # Target at first position
    print(f"  Linear search (best case): found at index {result}")
    print("  Explanation: the best case is Theta(1): the target is first\n")
    
    # Omega(n) - Linear lower bound
    print("Omega(n) - Linear Lower Bound:")
    sorted_arr = [1, 2, 3, 4, 5]
    bubble_sort_best_case(sorted_arr.copy())
    print(f"  Bubble sort (best case): already sorted array")
    print("  Explanation: even the best case needs one full pass: Theta(n)\n")
    
    # Omega(n log n) - Linearithmic lower bound
    print("Quick sort (three-way, out of place):")
    arr = [64, 34, 25, 12, 22, 11, 90]
    sorted_result = quick_sort_best_case(arr)
    print(f"  Quick sort (best case): {sorted_result}")
    print("  Explanation: average Theta(n log n), worst Theta(n^2), all-equal keys Theta(n)\n")
    
    # Omega(n^2) - Quadratic lower bound
    print("Omega(n^2) - Quadratic Lower Bound:")
    matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    total = matrix_traversal_lower_bound(matrix)
    print(f"  Matrix traversal: sum = {total}")
    print("  Explanation: Must visit all n^2 elements\n")
    
    print("=== Notations are bounds; cases are separate ===\n")
    print("Big-O (O): upper bound on a function")
    print("Big-Omega (Omega): lower bound on a function")
    print("Big-Theta (Theta): both at once (a tight bound)")
    print("Best, average and worst case are different functions; any of them can")
    print("be described with O, Omega or Theta.")
    print("  Linear search: best case Theta(1), worst case Theta(n)")
    print("  Binary search: best case Theta(1), worst case Theta(log n)\n")


if __name__ == "__main__":
    demonstrate_big_omega()
