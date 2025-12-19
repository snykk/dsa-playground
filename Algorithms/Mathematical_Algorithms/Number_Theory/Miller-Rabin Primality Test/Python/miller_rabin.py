"""
Miller-Rabin Primality Test Implementation

The Miller-Rabin test is a probabilistic algorithm for determining whether
a number is prime. It is based on Fermat's little theorem and is widely
used in practice.
"""

import random


def miller_rabin(n, k=5):
    """
    Miller-Rabin primality test
    
    Args:
        n: Number to test (must be odd and > 1)
        k: Number of iterations (higher = more accurate, default: 5)
        
    Returns:
        True if n is probably prime, False if n is composite
        
    Time Complexity: O(k log³ n)
    Space Complexity: O(1)
    """
    if n < 2:
        return False
    if n == 2 or n == 3:
        return True
    if n % 2 == 0:
        return False
    
    # Write n-1 as d * 2^r
    d = n - 1
    r = 0
    while d % 2 == 0:
        d //= 2
        r += 1
    
    # Witness loop
    for _ in range(k):
        a = random.randrange(2, n - 1)
        x = pow(a, d, n)
        
        if x == 1 or x == n - 1:
            continue
        
        for _ in range(r - 1):
            x = pow(x, 2, n)
            if x == n - 1:
                break
        else:
            return False  # Composite
    
    return True  # Probably prime


def is_prime_miller_rabin(n, k=5):
    """
    Check if n is prime using Miller-Rabin test
    
    Args:
        n: Number to test
        k: Number of iterations
        
    Returns:
        True if n is probably prime, False if n is composite
    """
    if n < 2:
        return False
    if n == 2:
        return True
    if n % 2 == 0:
        return False
    
    return miller_rabin(n, k)


def miller_rabin_deterministic(n):
    """
    Deterministic Miller-Rabin for n < 2^64
    
    Uses specific bases that are known to work for all numbers < 2^64
    
    Args:
        n: Number to test (should be < 2^64)
        
    Returns:
        True if n is prime, False if n is composite
    """
    if n < 2:
        return False
    if n == 2 or n == 3:
        return True
    if n % 2 == 0:
        return False
    
    # Bases for deterministic test (for n < 2^64)
    bases = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]
    
    # Write n-1 as d * 2^r
    d = n - 1
    r = 0
    while d % 2 == 0:
        d //= 2
        r += 1
    
    for a in bases:
        if a >= n:
            continue
        
        x = pow(a, d, n)
        if x == 1 or x == n - 1:
            continue
        
        composite = True
        for _ in range(r - 1):
            x = pow(x, 2, n)
            if x == n - 1:
                composite = False
                break
        
        if composite:
            return False
    
    return True


if __name__ == "__main__":
    # Example usage
    print("Miller-Rabin Primality Test Examples:")
    
    test_numbers = [2, 3, 17, 97, 100, 101, 561, 1105]
    
    for n in test_numbers:
        result = is_prime_miller_rabin(n)
        print(f"{n} is {'probably prime' if result else 'composite'}")
    
    print("\nDeterministic Miller-Rabin (for n < 2^64):")
    for n in test_numbers:
        result = miller_rabin_deterministic(n)
        print(f"{n} is {'prime' if result else 'composite'}")
