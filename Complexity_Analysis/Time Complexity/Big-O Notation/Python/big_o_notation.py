"""
Big-O Notation Implementation and Examples

Big-O notation describes the upper bound of an algorithm's time complexity.
It represents the worst-case scenario for how the runtime grows with input size.

Formal Definition:
f(n) = O(g(n)) if there exist positive constants c and n₀ such that
0 ≤ f(n) ≤ c·g(n) for all n ≥ n₀
"""


def constant_time_example(n):
    """
    O(1) - Constant Time
    Time complexity doesn't depend on input size.
    
    Args:
        n: Input size (not used in calculation)
        
    Returns:
        Constant value
        
    Time Complexity: O(1)
    Space Complexity: O(1)
    """
    return 42


def logarithmic_time_example(n):
    """
    O(log n) - Logarithmic Time
    Time complexity grows logarithmically with input size.
    Common in binary search, balanced tree operations.
    
    Args:
        n: Input size
        
    Returns:
        Number of iterations
        
    Time Complexity: O(log n)
    Space Complexity: O(1)
    """
    count = 0
    i = n
    while i > 1:
        i = i // 2
        count += 1
    return count


def linear_time_example(arr):
    """
    O(n) - Linear Time
    Time complexity grows linearly with input size.
    Common in single loops, array traversal.
    
    Args:
        arr: List of elements
        
    Returns:
        Sum of all elements
        
    Time Complexity: O(n)
    Space Complexity: O(1)
    """
    total = 0
    for element in arr:
        total += element
    return total


def linearithmic_time_example(arr):
    """
    O(n log n) - Linearithmic Time
    Time complexity grows as n times log n.
    Common in efficient sorting algorithms (merge sort, heap sort).
    
    Args:
        arr: List of elements to sort
        
    Returns:
        Sorted list
        
    Time Complexity: O(n log n)
    Space Complexity: O(n)
    """
    if len(arr) <= 1:
        return arr
    
    # Merge sort approach
    mid = len(arr) // 2
    left = linearithmic_time_example(arr[:mid])
    right = linearithmic_time_example(arr[mid:])
    
    # Merge step: O(n)
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


def quadratic_time_example(arr):
    """
    O(n²) - Quadratic Time
    Time complexity grows quadratically with input size.
    Common in nested loops, bubble sort, selection sort.
    
    Args:
        arr: List of elements
        
    Returns:
        List of all pairs
        
    Time Complexity: O(n²)
    Space Complexity: O(n²)
    """
    pairs = []
    for i in range(len(arr)):
        for j in range(i + 1, len(arr)):
            pairs.append((arr[i], arr[j]))
    return pairs


def cubic_time_example(n):
    """
    O(n³) - Cubic Time
    Time complexity grows cubically with input size.
    Common in triple nested loops, matrix multiplication (naive).
    
    Args:
        n: Input size
        
    Returns:
        Number of operations
        
    Time Complexity: O(n³)
    Space Complexity: O(1)
    """
    count = 0
    for i in range(n):
        for j in range(n):
            for k in range(n):
                count += 1
    return count


def exponential_time_example(n):
    """
    O(2ⁿ) - Exponential Time
    Time complexity grows exponentially with input size.
    Common in recursive algorithms without memoization (naive Fibonacci).
    
    Args:
        n: Input size
        
    Returns:
        Fibonacci number at position n
        
    Time Complexity: O(2ⁿ)
    Space Complexity: O(n) due to recursion stack
    """
    if n <= 1:
        return n
    return exponential_time_example(n - 1) + exponential_time_example(n - 2)


def factorial_time_example(n):
    """
    O(n!) - Factorial Time
    Time complexity grows factorially with input size.
    Common in brute-force solutions, generating all permutations.
    
    Args:
        n: Input size
        
    Returns:
        List of all permutations
        
    Time Complexity: O(n!)
    Space Complexity: O(n!)
    """
    if n == 0:
        return [[]]
    
    result = []
    for perm in factorial_time_example(n - 1):
        for i in range(len(perm) + 1):
            result.append(perm[:i] + [n - 1] + perm[i:])
    return result


def demonstrate_big_o():
    """
    Demonstrate various Big-O complexities with examples.
    """
    print("=== Big-O Notation Examples ===\n")
    
    # O(1) - Constant
    print("O(1) - Constant Time:")
    print(f"  Result: {constant_time_example(1000)}")
    print()
    
    # O(log n) - Logarithmic
    print("O(log n) - Logarithmic Time:")
    for n in [8, 16, 32, 64]:
        result = logarithmic_time_example(n)
        print(f"  n={n}: {result} iterations")
    print()
    
    # O(n) - Linear
    print("O(n) - Linear Time:")
    arr = list(range(10))
    print(f"  Sum of {len(arr)} elements: {linear_time_example(arr)}")
    print()
    
    # O(n log n) - Linearithmic
    print("O(n log n) - Linearithmic Time:")
    arr = [64, 34, 25, 12, 22, 11, 90]
    sorted_arr = linearithmic_time_example(arr)
    print(f"  Sorted: {sorted_arr}")
    print()
    
    # O(n²) - Quadratic
    print("O(n²) - Quadratic Time:")
    arr = [1, 2, 3, 4]
    pairs = quadratic_time_example(arr)
    print(f"  All pairs: {pairs}")
    print()
    
    # O(n³) - Cubic
    print("O(n³) - Cubic Time:")
    n = 5
    count = cubic_time_example(n)
    print(f"  n={n}: {count} operations")
    print()
    
    # O(2ⁿ) - Exponential
    print("O(2ⁿ) - Exponential Time:")
    for n in range(10):
        result = exponential_time_example(n)
        print(f"  Fibonacci({n}) = {result}")
    print()
    
    # O(n!) - Factorial
    print("O(n!) - Factorial Time:")
    n = 4
    perms = factorial_time_example(n)
    print(f"  Permutations of {n} elements: {len(perms)} total")
    print(f"  First few: {perms[:5]}")


if __name__ == "__main__":
    demonstrate_big_o()

