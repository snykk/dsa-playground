"""
Space Complexity Analysis and Examples

Space complexity measures the amount of memory space an algorithm uses
relative to the input size. It describes how memory usage grows with input.

Space complexity includes:
1. Auxiliary space: Extra space used by the algorithm
2. Input space: Space used by the input itself (usually not counted)
"""


def constant_space_example(n):
    """
    O(1) - Constant Space
    Uses a fixed amount of memory regardless of input size.
    
    Args:
        n: Input size
        
    Returns:
        Sum of numbers from 1 to n
        
    Time Complexity: O(n)
    Space Complexity: O(1) - only uses a few variables
    """
    total = 0
    for i in range(1, n + 1):
        total += i
    return total


def linear_space_example(n):
    """
    O(n) - Linear Space
    Memory usage grows linearly with input size.
    
    Args:
        n: Input size
        
    Returns:
        List of numbers from 1 to n
        
    Time Complexity: O(n)
    Space Complexity: O(n) - creates a list of size n
    """
    result = []
    for i in range(1, n + 1):
        result.append(i)
    return result


def quadratic_space_example(n):
    """
    O(n²) - Quadratic Space
    Memory usage grows quadratically with input size.
    
    Args:
        n: Input size
        
    Returns:
        n×n matrix
        
    Time Complexity: O(n²)
    Space Complexity: O(n²) - creates an n×n matrix
    """
    matrix = []
    for i in range(n):
        row = []
        for j in range(n):
            row.append(i * n + j)
        matrix.append(row)
    return matrix


def logarithmic_space_example(n):
    """
    O(log n) - Logarithmic Space
    Memory usage grows logarithmically with input size.
    Common in recursive algorithms with balanced recursion.
    
    Args:
        n: Input size
        
    Returns:
        Result of binary operation
        
    Time Complexity: O(log n)
    Space Complexity: O(log n) - recursion depth is log n
    """
    if n <= 1:
        return n
    return logarithmic_space_example(n // 2) + logarithmic_space_example(n // 2)


def recursive_fibonacci_naive(n):
    """
    O(n) - Linear Space (worst case)
    Memory usage is linear due to recursion stack depth.
    
    Args:
        n: Fibonacci number to compute
        
    Returns:
        Fibonacci number at position n
        
    Time Complexity: O(2ⁿ)
    Space Complexity: O(n) - maximum recursion depth is n
    """
    if n <= 1:
        return n
    return recursive_fibonacci_naive(n - 1) + recursive_fibonacci_naive(n - 2)


def in_place_reverse(arr):
    """
    O(1) - Constant Space (in-place)
    Modifies array in-place without using extra space.
    
    Args:
        arr: List to reverse (modified in-place)
        
    Returns:
        Reversed list (same reference)
        
    Time Complexity: O(n)
    Space Complexity: O(1) - only uses a few variables
    """
    left, right = 0, len(arr) - 1
    while left < right:
        arr[left], arr[right] = arr[right], arr[left]
        left += 1
        right -= 1
    return arr


def merge_sort_space(arr):
    """
    O(n) - Linear Space
    Merge sort requires O(n) auxiliary space for merging.
    
    Args:
        arr: List to sort
        
    Returns:
        Sorted list
        
    Time Complexity: O(n log n)
    Space Complexity: O(n) - auxiliary space for merging
    """
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort_space(arr[:mid])
    right = merge_sort_space(arr[mid:])
    
    # Merge step requires O(n) space
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


def demonstrate_space_complexity():
    """
    Demonstrate various space complexities with examples.
    """
    print("=== Space Complexity Examples ===\n")
    
    # O(1) - Constant space
    print("O(1) - Constant Space:")
    result = constant_space_example(100)
    print(f"  Sum 1 to 100: {result}")
    print("  Explanation: Only uses a few variables\n")
    
    # O(n) - Linear space
    print("O(n) - Linear Space:")
    arr = linear_space_example(10)
    print(f"  Created array of size {len(arr)}: {arr[:5]}...")
    print("  Explanation: Creates a list proportional to input size\n")
    
    # O(n²) - Quadratic space
    print("O(n²) - Quadratic Space:")
    matrix = quadratic_space_example(3)
    print(f"  Created {len(matrix)}×{len(matrix)} matrix:")
    for row in matrix:
        print(f"    {row}")
    print("  Explanation: Creates n×n matrix\n")
    
    # O(log n) - Logarithmic space
    print("O(log n) - Logarithmic Space:")
    result = logarithmic_space_example(16)
    print(f"  Recursive operation result: {result}")
    print("  Explanation: Recursion depth is log n\n")
    
    # O(1) - In-place
    print("O(1) - Constant Space (In-place):")
    arr = [1, 2, 3, 4, 5]
    reversed_arr = in_place_reverse(arr.copy())
    print(f"  Reversed: {reversed_arr}")
    print("  Explanation: Modifies array in-place\n")
    
    # O(n) - Merge sort space
    print("O(n) - Linear Space (Merge Sort):")
    unsorted = [64, 34, 25, 12, 22, 11, 90]
    sorted_arr = merge_sort_space(unsorted)
    print(f"  Sorted: {sorted_arr}")
    print("  Explanation: Requires O(n) auxiliary space for merging\n")
    
    print("=== Space vs Time Trade-offs ===\n")
    print("1. In-place algorithms: O(1) space, may be slower")
    print("2. Extra space: O(n) space, often faster")
    print("3. Recursion: Uses stack space (O(depth))")
    print("4. Dynamic arrays: May use extra space for resizing\n")


if __name__ == "__main__":
    demonstrate_space_complexity()

