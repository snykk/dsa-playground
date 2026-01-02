"""
Inclusion-Exclusion Principle Pattern

Counting technique to find size of union of sets.
"""

from typing import List
from itertools import combinations


def count_divisible(n: int, divisors: List[int]) -> int:
    """Count numbers from 1 to n divisible by any divisor."""
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
    """Count elements in union of sets using inclusion-exclusion."""
    n = len(sets)
    result = 0
    
    for i in range(1, 2**n):
        intersection = set(sets[0])
        count = 0
        for j in range(n):
            if i & (1 << j):
                count += 1
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
