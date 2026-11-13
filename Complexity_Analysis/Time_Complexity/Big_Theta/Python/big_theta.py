"""
Big-Theta (Theta) Notation Implementation and Examples

Big-Theta notation is a tight bound on a function: it bounds the function from
above and below by the same g(n). In algorithm analysis the function is a running
time for one chosen case (best, average or worst). Theta attaches to a case, not to
the algorithm: "quick sort is Theta(n log n)" is meaningless, but "quick sort's
average case is Theta(n log n) and its worst case is Theta(n^2)" is correct.

Formal Definition:
f(n) = Theta(g(n)) if there exist positive constants c_1, c_2, and n_0 such that
0 <= c_1*g(n) <= f(n) <= c_2*g(n) for all n >= n_0

This means f(n) is bounded both above and below by multiples of g(n).
It is equivalent to f(n) = O(g(n)) and f(n) = Omega(g(n)).
"""


def tight_bound_example(arr):
    """
    Theta(n) - Tight bound example
    It processes every element exactly once, so its running time is bounded
    above by O(n) and below by Omega(n) on every input.
    
    Args:
        arr: List of elements
        
    Returns:
        Sum of all elements
        
    Time Complexity: Theta(n) - tight bound
    Space Complexity: O(1)
    """
    total = 0
    for element in arr:
        total += element
    return total


def merge_sort_example(arr):
    """
    Theta(n log n) - merge sort (this is a real merge sort).
    Each of its cases has the same tight bound, because the recursion always
    splits in half and every merge level touches all n elements:
    - Best case: Theta(n log n)
    - Average case: Theta(n log n)
    - Worst case: Theta(n log n)
    
    Args:
        arr: List of elements to sort
        
    Returns:
        Sorted list
        
    Time Complexity: Theta(n log n) - tight bound
    Space Complexity: O(n)
    """
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort_example(arr[:mid])
    right = merge_sort_example(arr[mid:])
    
    # Merge step: Theta(n)
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
    Binary search. It returns as soon as it finds the target, so:
    - Best case (target at the first middle probe): Theta(1)
    - Worst case (target absent or found in the last probe): Theta(log n)
    Theta(log n) is the tight bound of the worst case only.
    
    Args:
        arr: Sorted list of elements
        target: Element to search for
        
    Returns:
        Index of target if found, -1 otherwise
        
    Time Complexity: best case Theta(1), worst case Theta(log n)
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
    Theta(n^3) - naive matrix multiplication, in every case.
    For n x n matrices, n^2 result elements each take n multiplications.
    
    Args:
        A: First matrix (nxn)
        B: Second matrix (nxn)
        
    Returns:
        Product matrix (nxn)
        
    Time Complexity: Theta(n^3) - tight bound
    Space Complexity: O(n^2)
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
    print("=== Big-Theta (Theta) Notation Examples ===\n")
    print("Big-Theta is a TIGHT BOUND on a function (O and Omega together)\n")
    
    # Theta(n) - Linear tight bound
    print("Theta(n) - Linear Tight Bound:")
    arr = list(range(1, 11))
    result = tight_bound_example(arr)
    print(f"  Sum of {len(arr)} elements: {result}")
    print("  Explanation: Must process every element exactly once\n")
    
    # Theta(log n) - Logarithmic tight bound
    print("Theta(log n) - Logarithmic Tight Bound:")
    sorted_arr = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
    target = 11
    index = binary_search_example(sorted_arr, target)
    print(f"  Binary search for {target}: found at index {index}")
    print("  Explanation: worst case Theta(log n); best case Theta(1) (target at the middle)\n")
    
    # Theta(n log n) - Linearithmic tight bound
    print("Theta(n log n) - Linearithmic Tight Bound:")
    unsorted = [64, 34, 25, 12, 22, 11, 90]
    sorted_result = merge_sort_example(unsorted)
    print(f"  Merge sort: {sorted_result}")
    print("  Explanation: best, average and worst case are all Theta(n log n)\n")
    
    # Theta(n^3) - Cubic tight bound
    print("Theta(n^3) - Cubic Tight Bound:")
    n = 3
    A = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    B = [[9, 8, 7], [6, 5, 4], [3, 2, 1]]
    C = matrix_multiplication_naive(A, B)
    print(f"  Matrix multiplication ({n}x{n}):")
    for row in C:
        print(f"    {row}")
    print("  Explanation: Always requires n^3 operations\n")
    
    print("=== Theta attaches to a case ===\n")
    print("Theta bounds one function (one case) from above and below.")
    print("  Quick sort: worst case Theta(n^2), average case Theta(n log n)")
    print("  Binary search: best case Theta(1), worst case Theta(log n)")
    print("  Merge sort: every case Theta(n log n)")
    print("A single Theta for the whole algorithm exists only if all cases agree.\n")


if __name__ == "__main__":
    demonstrate_big_theta()

