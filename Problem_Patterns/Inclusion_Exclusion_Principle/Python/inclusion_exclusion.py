"""
Inclusion-Exclusion Principle Pattern

Counting technique to find size of union of sets.
"""

from typing import List


def count_divisible(n: int, divisors: List[int]) -> int:
    """Count numbers from 1 to n divisible by any divisor."""
    if n < 1:
        return 0  # 1..n is empty; n // lcm would floor to a negative count
    result = 0
    k = len(divisors)
    
    # Apply inclusion-exclusion principle
    for i in range(1, 2**k):
        count = 0
        lcm = 1
        for j in range(k):
            if i & (1 << j):
                count += 1
                # Calculate LCM (simplified for integers)
                lcm = lcm * divisors[j] // gcd(lcm, divisors[j])
        
        if count % 2 == 1:
            result += n // lcm
        else:
            result -= n // lcm
    
    return result


def gcd(a: int, b: int) -> int:
    """Greatest common divisor."""
    while b:
        a, b = b, a % b
    return a


def count_union_sets(sets: List[List[int]]) -> int:
    """Count elements in union of sets using inclusion-exclusion.

    Each non-empty subset of the sets contributes the size of its intersection,
    added for an odd number of sets and subtracted for an even number.
    Time Complexity: O(2^n * n * m) for n sets of up to m elements
    """
    n = len(sets)
    result = 0
    
    for i in range(1, 2**n):
        intersection = None  # starts from the first set that is in the subset
        count = 0
        for j in range(n):
            if i & (1 << j):
                count += 1
                if intersection is None:
                    intersection = set(sets[j])
                else:
                    intersection = intersection & set(sets[j])
        
        if count % 2 == 1:
            result += len(intersection)
        else:
            result -= len(intersection)
    
    return result


def main():
    """Example usage."""
    print("Inclusion-Exclusion Principle Examples:")
    print()
    n = 100
    divisors = [2, 3, 5]
    result = count_divisible(n, divisors)
    print(f"Numbers from 1 to {n} divisible by any of {divisors}: {result}")
    sets = [[1, 2, 3], [2, 3, 4], [3, 4, 5]]
    print(f"Size of the union of {sets}: {count_union_sets(sets)}")


if __name__ == "__main__":
    main()
